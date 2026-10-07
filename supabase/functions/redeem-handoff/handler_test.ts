// SPEC-21 §6 — redeem-handoff swaps a one-time key for a sign-in, with the
// gateway's JWT check OFF (INVARIANTS #30). So these tests are the guard:
//
//  - single use: a key signs in once; two simultaneous redeems, one winner;
//  - 7 days: an expired key signs no one in;
//  - money: no session for a buyer without access (refund, lapse);
//  - the per-IP rate limit;
//  - INVARIANTS #29: the key never appears in a log line.
//
// The handler runs for real against an in-memory database whose UPDATE
// applies its filters in one step, the way Postgres does — so dropping
// `used_at is null` from the claim lets both racers through and the race test
// fails. Run: deno test supabase/functions

import { assert, assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { handler, type Deps } from './handler.ts';

const SUPABASE_URL = 'https://devprojectref000000x.supabase.co';
const NOW = new Date('2026-10-06T12:00:00.000Z');
const BUYER = 'buyer-1';
const BUYER_EMAIL = 'buyer@example.com';
const DAY = 24 * 60 * 60 * 1000;
const at = (offsetMs: number) => new Date(NOW.getTime() + offsetMs).toISOString();

// 43 base64url characters: the shape the website mints.
const KEY = 'Q2hpbGRyZW4tYXJlLW5vdC1hLXRlc3QtZml4dHVyZQ0';
const OTHER_KEY = 'b3RoZXIta2V5LWZvci10aGUtdW5rbm93bi1jYXNlLXg';

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
const KEY_HASH = await sha256Hex(KEY);

// ── The fake database ───────────────────────────────────────────────────────

type Row = Record<string, unknown>;
type KeyRow = { key_hash: string; user_id: string; source: string; expires_at: string; used_at: string | null };

type World = {
  keys?: KeyRow[];
  entitlement?: { status: string; current_period_end: string | null } | null;
  failEntitlementRead?: boolean;
  failClaim?: boolean;
  rateLimit?: boolean | 'error';
  email?: string | null;
  failGetUser?: boolean;
  failGenerateLink?: boolean;
  env?: Record<string, string | undefined>;
};

const freshKey = (overrides: Partial<KeyRow> = {}): KeyRow => ({
  key_hash: KEY_HASH,
  user_id: BUYER,
  source: 'welcome',
  expires_at: at(7 * DAY),
  used_at: null,
  ...overrides,
});
const activeWebBuyer = { status: 'active', current_period_end: at(30 * DAY) };

/** One world shared by every request in a test (the race needs that). */
function makeBackend(world: World) {
  const keys = world.keys ?? [freshKey()];
  const log: string[] = [];
  const rpcCalls: Row[] = [];
  const generateLinkCalls: Row[] = [];

  function table(name: string) {
    const filters: ((row: Row) => boolean)[] = [];
    let op: 'select' | 'update' = 'select';
    let values: Row = {};
    let columns = '*';

    const pick = (row: Row) =>
      columns === '*' ? { ...row } : Object.fromEntries(columns.split(',').map((c) => [c.trim(), row[c.trim()]]));

    // Runs the whole statement in one synchronous step: filter, then write.
    function execute(): { data: Row[] | null; error: { message: string } | null } {
      if (name === 'entitlements') {
        log.push('entitlements.select');
        if (world.failEntitlementRead) return { data: null, error: { message: 'entitlements unavailable' } };
        const row = world.entitlement === undefined ? activeWebBuyer : world.entitlement;
        return { data: row ? [row] : [], error: null };
      }
      if (op === 'update' && world.failClaim && values.used_at !== null) {
        return { data: null, error: { message: 'database down' } };
      }
      const matched = keys.filter((row) => filters.every((f) => f(row as Row)));
      if (op === 'update') {
        log.push(values.used_at === null ? 'handoff_keys.release' : 'handoff_keys.claim');
        for (const row of matched) Object.assign(row, values);
      } else {
        log.push('handoff_keys.read');
      }
      return { data: matched.map((row) => pick(row as Row)), error: null };
    }

    const builder = {
      select(cols = '*') {
        columns = cols;
        return builder;
      },
      update(next: Row) {
        op = 'update';
        values = next;
        return builder;
      },
      eq(column: string, value: unknown) {
        filters.push((row) => row[column] === value);
        return builder;
      },
      is(column: string, value: null) {
        filters.push((row) => row[column] === value);
        return builder;
      },
      gt(column: string, value: string) {
        filters.push((row) => Date.parse(String(row[column])) > Date.parse(value));
        return builder;
      },
      maybeSingle() {
        const { data, error } = execute();
        return Promise.resolve({ data: data?.[0] ?? null, error });
      },
      then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
        const { error } = execute();
        return Promise.resolve({ error }).then(resolve, reject);
      },
    };
    return builder;
  }

  const admin = {
    from: (name: string) => table(name),
    rpc(fn: string, args: Row) {
      rpcCalls.push({ fn, ...args });
      if (world.rateLimit === 'error') return Promise.resolve({ data: null, error: { message: 'rpc down' } });
      return Promise.resolve({ data: world.rateLimit ?? true, error: null });
    },
    auth: {
      admin: {
        getUserById(id: string) {
          log.push('auth.getUserById');
          if (world.failGetUser) return Promise.resolve({ data: { user: null }, error: { message: 'auth down' } });
          const email = world.email === undefined ? BUYER_EMAIL : world.email;
          return Promise.resolve({ data: { user: { id, email } }, error: null });
        },
        generateLink(params: Row) {
          log.push('auth.generateLink');
          generateLinkCalls.push(params);
          if (world.failGenerateLink) return Promise.resolve({ data: null, error: { message: 'auth down' } });
          return Promise.resolve({
            data: { properties: { hashed_token: 'pkce_token_hash_for_buyer' }, user: { id: BUYER } },
            error: null,
          });
        },
      },
    },
  };

  const env: Record<string, string | undefined> = {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: 'legacy-service-role',
    ...world.env,
  };
  const deps: Deps = {
    env: (name) => env[name],
    createAdminClient: () => admin as unknown as SupabaseClient,
    now: () => NOW,
  };
  return { deps, keys, log, rpcCalls, generateLinkCalls };
}

// Every console line the handler writes, across every test (INVARIANTS #29).
const consoleLines: string[] = [];
for (const level of ['log', 'error', 'warn', 'info', 'debug'] as const) {
  console[level] = (...args: unknown[]) => {
    consoleLines.push(args.map((a) => (a instanceof Error ? a.message : String(a))).join(' '));
  };
}

function post(body: unknown, headers: Record<string, string> = { 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '203.0.113.7' }) {
  return new Request('https://example.functions.supabase.co/redeem-handoff', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function redeem(backend: ReturnType<typeof makeBackend>, request = post({ key: KEY })) {
  const response = await handler(request, backend.deps);
  const body = await response.json().catch(() => null);
  return { status: response.status, headers: response.headers, body };
}

// ── The happy path ──────────────────────────────────────────────────────────

Deno.test('a fresh key → ok, a token_hash for the buyer, and the key is now used', async () => {
  const backend = makeBackend({});
  const r = await redeem(backend);
  assertEquals(r.status, 200);
  assertEquals(r.body, { result: 'ok', token_hash: 'pkce_token_hash_for_buyer', user_id: BUYER });
  assertEquals(backend.generateLinkCalls, [{ type: 'magiclink', email: BUYER_EMAIL }]);
  assertEquals(backend.keys[0].used_at, NOW.toISOString());
  assertEquals(r.headers.get('Cache-Control'), 'no-store');
});

Deno.test('the session is minted only after the claim and the entitlement check', async () => {
  const backend = makeBackend({});
  await redeem(backend);
  assertEquals(backend.log, ['handoff_keys.claim', 'entitlements.select', 'auth.getUserById', 'auth.generateLink']);
});

Deno.test('an active row 3 days past its period (late renewal webhook) still redeems', async () => {
  const backend = makeBackend({ entitlement: { status: 'active', current_period_end: at(-3 * DAY) } });
  assertEquals((await redeem(backend)).body?.result, 'ok');
});

// ── Single use and lifetime ─────────────────────────────────────────────────

Deno.test('the same key twice → ok, then used', async () => {
  const backend = makeBackend({});
  assertEquals((await redeem(backend)).body?.result, 'ok');
  const second = await redeem(backend);
  assertEquals(second.status, 410);
  assertEquals(second.body, { result: 'used' });
  assertEquals(backend.generateLinkCalls.length, 1);
});

Deno.test('two simultaneous redeems of one key → exactly one ok', async () => {
  const backend = makeBackend({});
  const results = await Promise.all([redeem(backend), redeem(backend), redeem(backend)]);
  assertEquals(results.map((r) => r.body?.result).sort(), ['ok', 'used', 'used']);
  assertEquals(backend.generateLinkCalls.length, 1);
});

Deno.test('an expired key → expired, and no session', async () => {
  const backend = makeBackend({ keys: [freshKey({ expires_at: at(-1) })] });
  const r = await redeem(backend);
  assertEquals(r.status, 410);
  assertEquals(r.body, { result: 'expired' });
  assertEquals(backend.generateLinkCalls.length, 0);
  assertEquals(backend.keys[0].used_at, null);
});

Deno.test('an expired key that was also used reads as used', async () => {
  const backend = makeBackend({ keys: [freshKey({ expires_at: at(-1), used_at: at(-DAY) })] });
  assertEquals((await redeem(backend)).body, { result: 'used' });
});

Deno.test('a well-formed key nobody minted → unknown', async () => {
  const backend = makeBackend({});
  const r = await redeem(backend, post({ key: OTHER_KEY }));
  assertEquals(r.status, 404);
  assertEquals(r.body, { result: 'unknown' });
  assertEquals(backend.keys[0].used_at, null);
});

const malformed: [string, string][] = [
  ['no key', JSON.stringify({})],
  ['a key that is too short', JSON.stringify({ key: KEY.slice(1) })],
  ['a key with characters base64url never uses', JSON.stringify({ key: `${KEY.slice(1)}=` })],
  ['a key that is not a string', JSON.stringify({ key: 42 })],
  ['a body that is not JSON', 'key=abc'],
  ['a body far too big to be the app', JSON.stringify({ key: KEY, pad: 'x'.repeat(2000) })],
];
for (const [what, body] of malformed) {
  Deno.test(`${what} → unknown, and the database is never asked`, async () => {
    const backend = makeBackend({});
    const r = await redeem(backend, post(body));
    assertEquals(r.body, { result: 'unknown' });
    assertEquals(backend.log, []);
  });
}

// ── Money: no session without access ────────────────────────────────────────

const noAccess: [string, World['entitlement']][] = [
  ['a refunded buyer (revoked)', { status: 'revoked', current_period_end: at(30 * DAY) }],
  ['an expired subscription', { status: 'expired', current_period_end: at(30 * DAY) }],
  ['a cancelled one past its period', { status: 'cancelled', current_period_end: at(-1) }],
  ['an active one past the 6-day grace', { status: 'active', current_period_end: at(-7 * DAY) }],
  ['no entitlement row at all', null],
];
for (const [who, entitlement] of noAccess) {
  Deno.test(`${who} → not_entitled, no session, and the key stays used`, async () => {
    const backend = makeBackend({ entitlement });
    const r = await redeem(backend);
    assertEquals(r.status, 403);
    assertEquals(r.body, { result: 'not_entitled' });
    assertEquals(backend.generateLinkCalls.length, 0);
    assertEquals(backend.keys[0].used_at, NOW.toISOString());
  });
}

// ── Rate limit ──────────────────────────────────────────────────────────────

Deno.test('every attempt is counted per IP: 20 per 10 minutes', async () => {
  const backend = makeBackend({});
  await redeem(backend);
  assertEquals(backend.rpcCalls, [
    { fn: 'hit_rate_limit', p_key: 'rh:ip:203.0.113.7', p_window_seconds: 600, p_max: 20 },
  ]);
});

Deno.test('over the limit → rate_limited, before the key is even looked at', async () => {
  const backend = makeBackend({ rateLimit: false });
  const r = await redeem(backend);
  assertEquals(r.status, 429);
  assertEquals(r.body, { result: 'rate_limited' });
  assertEquals(backend.log, []);
  assertEquals(backend.keys[0].used_at, null);
});

Deno.test('malformed attempts count against the limit too', async () => {
  const backend = makeBackend({});
  await redeem(backend, post({ key: 'nope' }));
  assertEquals(backend.rpcCalls.length, 1);
});

Deno.test('a client-chosen X-Forwarded-For first hop never picks the bucket (web2app review P3)', async () => {
  // Supabase's edge appends the real address to what the client sent.
  const cases: Record<string, string>[] = [
    { 'x-forwarded-for': 'spoofed-1, 203.0.113.7' },
    { 'x-forwarded-for': '198.51.100.99, 203.0.113.7', 'cf-connecting-ip': '203.0.113.7' },
    { 'x-forwarded-for': 'anything-at-all', 'cf-connecting-ip': '203.0.113.7' },
  ];
  for (const headers of cases) {
    const backend = makeBackend({});
    await redeem(backend, post({ key: KEY }, headers));
    assertEquals(backend.rpcCalls[0].p_key, 'rh:ip:203.0.113.7', JSON.stringify(headers));
  }
});

Deno.test('no forwarded IP → one shared bucket, never no limit', async () => {
  const backend = makeBackend({});
  await redeem(backend, post({ key: KEY }, {}));
  assertEquals(backend.rpcCalls[0].p_key, 'rh:ip:unknown');
});

Deno.test('the limiter itself failing lets the redeem through (fails open, like the website)', async () => {
  const backend = makeBackend({ rateLimit: 'error' });
  assertEquals((await redeem(backend)).body?.result, 'ok');
});

// ── Failures after the claim give the key back ──────────────────────────────

const failures: [string, World, string[]][] = [
  ['generateLink fails', { failGenerateLink: true }, ['handoff_keys.claim', 'entitlements.select', 'auth.getUserById', 'auth.generateLink', 'handoff_keys.release']],
  ['the user lookup fails', { failGetUser: true }, ['handoff_keys.claim', 'entitlements.select', 'auth.getUserById', 'handoff_keys.release']],
  ['the user has no email', { email: null }, ['handoff_keys.claim', 'entitlements.select', 'auth.getUserById', 'handoff_keys.release']],
  ['the entitlement read fails', { failEntitlementRead: true }, ['handoff_keys.claim', 'entitlements.select', 'handoff_keys.release']],
];
for (const [what, world, expectedLog] of failures) {
  Deno.test(`${what} → error, the key is released, and a retry works`, async () => {
    const backend = makeBackend(world);
    const r = await redeem(backend);
    assertEquals(r.status, 500);
    assertEquals(r.body, { result: 'error' });
    assertEquals(backend.log, expectedLog);
    assertEquals(backend.keys[0].used_at, null);

    // The blip is over: the same link now works.
    Object.assign(world, { failGenerateLink: false, failGetUser: false, email: BUYER_EMAIL, failEntitlementRead: false });
    assertEquals((await redeem(backend)).body?.result, 'ok');
  });
}

Deno.test('the claim itself failing → error, nothing claimed', async () => {
  const backend = makeBackend({ failClaim: true });
  const r = await redeem(backend);
  assertEquals(r.body, { result: 'error' });
  assertEquals(backend.generateLinkCalls.length, 0);
  assertEquals(backend.keys[0].used_at, null);
});

// ── Requests and configuration ──────────────────────────────────────────────

Deno.test('OPTIONS → 200, and no Access-Control-Allow-Origin (no browser may read this)', async () => {
  const backend = makeBackend({});
  const response = await handler(new Request('https://x/redeem-handoff', { method: 'OPTIONS' }), backend.deps);
  assertEquals(response.status, 200);
  assertEquals(response.headers.get('Access-Control-Allow-Origin'), null);
  assertEquals(backend.log, []);
});

Deno.test('a POST response carries no Access-Control-Allow-Origin either', async () => {
  assertEquals((await redeem(makeBackend({}))).headers.get('Access-Control-Allow-Origin'), null);
});

Deno.test('GET → error, nothing touched', async () => {
  const backend = makeBackend({});
  const response = await handler(new Request('https://x/redeem-handoff'), backend.deps);
  assertEquals(response.status, 500);
  assertEquals(backend.rpcCalls.length + backend.log.length, 0);
});

Deno.test('the new secret-keys format is preferred over the legacy key', async () => {
  let usedKey = '';
  const backend = makeBackend({ env: { SUPABASE_SECRET_KEYS: JSON.stringify({ default: 'sb_secret_new' }) } });
  const deps: Deps = {
    ...backend.deps,
    createAdminClient: (url, key) => {
      usedKey = key;
      return backend.deps.createAdminClient(url, key);
    },
  };
  await handler(post({ key: KEY }), deps);
  assertEquals(usedKey, 'sb_secret_new');
});

Deno.test('no service role key → error, nothing touched', async () => {
  const backend = makeBackend({ env: { SUPABASE_SERVICE_ROLE_KEY: undefined } });
  assertEquals((await redeem(backend)).body, { result: 'error' });
  assertEquals(backend.log, []);
});

// ── INVARIANTS #29 ──────────────────────────────────────────────────────────
// Last on purpose: Deno runs a file's tests in order, so by now every path
// above — ok, used, expired, unknown, refunded, rate limited, every failure —
// has written its log lines.

Deno.test('the key never appears in a log line, on any path', () => {
  assert(consoleLines.length > 20, `expected the paths above to log, got ${consoleLines.length} lines`);
  const leaks = consoleLines.filter((line) => line.includes(KEY) || line.includes(OTHER_KEY));
  assertEquals(leaks, []);
});
