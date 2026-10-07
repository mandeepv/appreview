import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// redeem-handoff (SPEC-21): swaps a one-time handoff key for a sign-in.
//
// A kinderwell.app buyer gets a link carrying a key (the welcome page copies
// it to the clipboard and shows it as a button; the confirmation email
// carries another). The app sends the key here; we answer with a magic-link
// token_hash, which the app passes to supabase.auth.verifyOtp to hold a
// normal session for the account that paid. The app then runs the Loading
// gate like any other sign-in — this function grants a session, never access.
//
// TRUST MODEL (INVARIANTS #30). This is the ONE app-facing function deployed
// with verify_jwt OFF: the caller has no session yet, and the app's
// publishable key is not a JWT. What protects it instead:
//   1. The key: 32 random bytes (256 bits), stored only as its sha256.
//   2. Single use, claimed by one conditional UPDATE — of two simultaneous
//      redeems exactly one wins (Postgres re-checks `used_at is null` on the
//      row the first one changed).
//   3. The entitlement check BEFORE a session is minted, so a refunded
//      buyer's leftover link signs no one in.
//   4. hit_rate_limit per IP (20 per 10 minutes).
// Remove any of these and the function becomes a login oracle; each has a
// test in handler_test.ts that fails without it.
//
// The key is a login credential (INVARIANTS #29): it never appears in a log
// line, a response, or an error message. Logs carry the result and the user
// id only.
//
// Behaviour lives here; index.ts only wires the live deps (SPEC-20 R8, the
// delete-account pattern), so handler_test.ts runs this exact code on fakes.
export type Deps = {
  env: (name: string) => string | undefined;
  createAdminClient: (url: string, serviceRoleKey: string) => SupabaseClient;
  now: () => Date;
};

/** What the app is told. It maps every non-`ok` result to email sign-in. */
export type RedeemResult =
  | 'ok'
  | 'expired'
  | 'used'
  | 'unknown'
  | 'not_entitled'
  | 'rate_limited'
  | 'error';

const STATUS: Record<RedeemResult, number> = {
  ok: 200,
  expired: 410,
  used: 410,
  unknown: 404,
  not_entitled: 403,
  rate_limited: 429,
  error: 500,
};

// No Access-Control-Allow-Origin, on purpose: only the native app calls this,
// and native fetch ignores CORS. Without the header no browser page can read a
// response — the same posture as delete-account (see its history note).
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// The key's exact shape: 32 bytes as unpadded base64url. Anything else is not
// one of ours and never reaches the database.
const KEY_PATTERN = /^[A-Za-z0-9_-]{43}$/;

// A key is 43 characters; a body near this is not the app.
const MAX_BODY_BYTES = 1024;

// SPEC-21 §4.3: per IP, 20 attempts per 10 minutes. With a 256-bit key this is
// not what stops guessing — it caps how hard anyone can lean on the function.
const RATE_LIMIT = { windowSeconds: 600, max: 20 };

// The web access rule, mirrored from the app (src/store/webEntitlement.ts,
// isWebEntitled): active / past_due / cancelled until current_period_end, and
// an `active` row keeps 6 days past it for a late renewal webhook. A copy, not
// an import — edge functions can't import the app. If they ever disagree the
// cost is small and safe: a buyer told not_entitled here signs in by email
// instead, and the Loading gate still decides access with the app's own rule.
// All three copies (this, the app's, the website's hasAccess) run over one
// table of cases, ../_shared/access_rule_cases.json, kept byte-identical with
// the website's by scripts/check-migration-parity.sh (web2app review AP-3).
const ENTITLING_STATUSES = new Set(['active', 'past_due', 'cancelled']);
const ACTIVE_LATE_RENEWAL_GRACE_MS = 6 * 24 * 60 * 60 * 1000;

export function hasWebAccess(
  row: { status: string; current_period_end: string | null } | null,
  now: Date,
): boolean {
  if (!row || !ENTITLING_STATUSES.has(row.status) || !row.current_period_end) return false;
  const end = Date.parse(row.current_period_end);
  if (Number.isNaN(end)) return false;
  const grace = row.status === 'active' ? ACTIVE_LATE_RENEWAL_GRACE_MS : 0;
  return end + grace > now.getTime();
}

// Same lookup as delete-account/handler.ts: the new secret-keys JSON first,
// then the legacy service-role key.
function getServiceRoleKey(env: Deps['env']): string {
  const secretKeysJson = env('SUPABASE_SECRET_KEYS');
  if (secretKeysJson) {
    try {
      const parsed = JSON.parse(secretKeysJson);
      if (parsed && typeof parsed === 'object' && parsed.default) return parsed.default;
    } catch (_e) {
      // Fall through to legacy.
    }
  }
  return env('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

/** The caller's IP as Supabase's edge reports it; one shared bucket if absent. */
function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Lowercase hex sha256 of the key's UTF-8 bytes — what the website stores. */
async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function reply(result: RedeemResult, extra: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({ result, ...extra }), {
    status: STATUS[result],
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export async function handler(req: Request, deps: Deps): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply('error');

  const supabaseUrl = deps.env('SUPABASE_URL');
  const serviceRoleKey = getServiceRoleKey(deps.env);
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('redeem-handoff: SUPABASE_URL or the service role key is missing');
    return reply('error');
  }
  const admin = deps.createAdminClient(supabaseUrl, serviceRoleKey);

  // Count the attempt before looking at it, so junk counts too. Fails OPEN on
  // a database error, like the website's limiter: a limiter hiccup must not
  // lock paying parents out, and the key's entropy is the real barrier.
  const { data: allowed, error: limitError } = await admin.rpc('hit_rate_limit', {
    p_key: `rh:ip:${clientIp(req)}`,
    p_window_seconds: RATE_LIMIT.windowSeconds,
    p_max: RATE_LIMIT.max,
  });
  if (limitError) {
    console.error('redeem-handoff: rate limit check failed (allowing)', limitError.message);
  } else if (allowed === false) {
    console.log('redeem-handoff: rate_limited');
    return reply('rate_limited');
  }

  const raw = await req.text();
  let key: unknown;
  try {
    key = raw.length <= MAX_BODY_BYTES ? JSON.parse(raw)?.key : undefined;
  } catch {
    key = undefined;
  }
  if (typeof key !== 'string' || !KEY_PATTERN.test(key)) {
    console.log('redeem-handoff: unknown (malformed)');
    return reply('unknown');
  }

  const keyHash = await sha256Hex(key);
  const now = deps.now();
  const nowIso = now.toISOString();

  // From here on a claimed key that fails to produce a session is given back
  // (used_at cleared), so a network blip doesn't burn the buyer's link. Only
  // OUR claim is released: the match on the exact used_at we wrote.
  let claimed = false;
  const release = async () => {
    if (!claimed) return;
    const { error } = await admin
      .from('handoff_keys')
      .update({ used_at: null })
      .eq('key_hash', keyHash)
      .eq('used_at', nowIso);
    if (error) console.error('redeem-handoff: could not release a claimed key', error.message);
  };

  let step = 'claim';
  try {
    // The single-use claim, as ONE statement (SPEC-21 §4.1):
    //   update … set used_at = now() where key_hash = $1
    //     and used_at is null and expires_at > now() returning user_id
    const { data: row, error: claimError } = await admin
      .from('handoff_keys')
      .update({ used_at: nowIso })
      .eq('key_hash', keyHash)
      .is('used_at', null)
      .gt('expires_at', nowIso)
      .select('user_id')
      .maybeSingle();
    if (claimError) throw new Error(`claim failed: ${claimError.message}`);

    if (!row) {
      // Nothing claimed. Say why, so the app can show the right words.
      step = 'classify';
      const { data: existing, error: readError } = await admin
        .from('handoff_keys')
        .select('used_at, expires_at')
        .eq('key_hash', keyHash)
        .maybeSingle();
      if (readError) throw new Error(`read failed: ${readError.message}`);
      const result: RedeemResult = !existing ? 'unknown' : existing.used_at ? 'used' : 'expired';
      console.log(`redeem-handoff: ${result}`);
      return reply(result);
    }
    claimed = true;
    const userId = row.user_id as string;

    // No session for a buyer who no longer has access (a refund, a
    // chargeback, a lapsed period). The key stays used.
    step = 'entitlement';
    const { data: entitlement, error: entitlementError } = await admin
      .from('entitlements')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .eq('source', 'dodo')
      .maybeSingle();
    if (entitlementError) throw new Error(`entitlements read failed: ${entitlementError.message}`);
    if (!hasWebAccess(entitlement, now)) {
      claimed = false; // deliberately not released
      console.log('redeem-handoff: not_entitled', userId);
      return reply('not_entitled');
    }

    step = 'get_user';
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (userError || !email) throw new Error(`user lookup failed: ${userError?.message ?? 'no email'}`);

    // The same mechanism the E2E helper uses for a sign-in code, but handing
    // back the hashed token instead: the app verifies it with
    // verifyOtp({ token_hash, type: 'magiclink' }). Nothing is emailed.
    step = 'generate_link';
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    const tokenHash = link?.properties?.hashed_token;
    if (linkError || !tokenHash) throw new Error(`generateLink failed: ${linkError?.message ?? 'no token'}`);

    console.log('redeem-handoff: ok', userId);
    // user_id lets the app tell "the buyer is already signed in here" from
    // "someone else is" without minting a second session. The caller holds a
    // key that signs in as this user, so it learns nothing new.
    return reply('ok', { token_hash: tokenHash, user_id: userId });
  } catch (error) {
    console.error(`redeem-handoff: error at ${step}:`, error instanceof Error ? error.message : String(error));
    await release();
    return reply('error');
  }
}
