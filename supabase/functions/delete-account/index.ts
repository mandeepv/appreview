import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import * as jose from 'https://esm.sh/jose@5.9.6';

// CORS story: this Edge Function is only ever called from the native
// mobile app via the Supabase JS SDK's functions.invoke() — a native
// fetch() call that is not subject to browser CORS at all.
//
// History of this file's CORS handling and why we now emit no origin
// header:
//   - Original: 'Access-Control-Allow-Origin: *' — no effect for the
//     native app, but did allow any browser to POST here with a
//     stolen session token (Fable review 🟡).
//   - First fix (commit 5510406): tightened to
//     'Access-Control-Allow-Origin: null' with a comment claiming this
//     meant "no browser origins allowed." Fable re-review 2026-07-05
//     caught that this reading is wrong — the literal string 'null'
//     is a real origin browsers send (sandboxed iframes, file://
//     documents), and ACAO: null explicitly WHITELISTS those. It
//     wasn't a lockdown; it was a subtle allow-list.
//   - Now: don't emit the header at all. With no
//     Access-Control-Allow-Origin in the response, no browser context
//     (regular, sandboxed, or file://) can read a cross-origin
//     response from this function. Native mobile fetch() ignores
//     CORS, so app behavior is unchanged.
//
// When we ship a web client, add its specific origin(s) here (e.g.
// 'https://app.kinderwell.com') — NOT '*' and NOT 'null'.
const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase is transitioning from the legacy JWT-style anon/service-role
// keys to a new JWT signing keys system that uses `sb_publishable_*` and
// `sb_secret_*` style keys. The env vars are also split:
//
//   Legacy: SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
//   New:    SUPABASE_PUBLISHABLE_KEYS (JSON dict), SUPABASE_SECRET_KEYS (JSON dict)
//
// The critical problem: the two key systems live in different auth
// namespaces. A token issued by the new system CANNOT be verified by a
// client instantiated with a legacy key, and vice versa. If the mobile
// app is on the new system (uses sb_publishable_* keys) but our
// Edge Function client is initialized with the legacy SUPABASE_ANON_KEY,
// getUser() throws "Auth session missing" because the token namespace
// doesn't match the client's namespace.
//
// We only need the service-role-equivalent key (for the admin client
// used to actually perform deletes). The publishable/anon key is no
// longer needed because we get the user ID from the JWT directly — but
// note we do NOT trust it blindly: the token's signature and expiry are
// cryptographically verified in-function (HS256 against
// JWT_SECRET env var) before `sub` is used. See the verify_jwt step.
//
// We check for the new format first, fall back to legacy. That way
// the same function code works whether the project has migrated or not.
function getServiceRoleKey(): string {
  const secretKeysJson = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeysJson) {
    try {
      const parsed = JSON.parse(secretKeysJson);
      // Format is { "default": "sb_secret_..." } per Supabase docs.
      if (parsed && typeof parsed === 'object' && parsed.default) {
        return parsed.default;
      }
    } catch (_e) {
      // Fall through to legacy.
    }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Track which step failed so a 400 tells us WHERE it broke, not just
  // "something failed." Debugging Edge Functions without server logs is
  // painful; making the error body descriptive is worth the tiny leak
  // of implementation detail to the app (which just rethrows anyway).
  let step = 'init';

  try {
    step = 'read_auth_header';
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    step = 'read_env_url';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    if (!supabaseUrl) throw new Error('SUPABASE_URL env is missing');
    // Note: we no longer read a publishable/anon key here — the earlier
    // approach instantiated a user-scoped Supabase client and called
    // .auth.getUser(), which fails on projects that migrated to the new
    // JWT signing key system (namespace mismatch between the token and
    // the anon key). We now decode the JWT manually to get the user ID,
    // then use only the admin client for actual deletes.

    step = 'read_env_service_role';
    const serviceRoleKey = getServiceRoleKey();
    if (!serviceRoleKey) {
      throw new Error('Service role key missing (checked SUPABASE_SECRET_KEYS.default and SUPABASE_SERVICE_ROLE_KEY)');
    }

    step = 'verify_jwt';
    // Trust model for this function (why we verify the token in-code even
    // though the gateway already does):
    //
    //   Layer 1 — Supabase's Edge Function gateway. With verify_jwt = true
    //   (codified in supabase/config.toml, R1), the gateway rejects any
    //   request without a valid, unexpired project JWT before this code even
    //   runs. That flag is the primary protection.
    //
    //   Layer 2 — this in-function signature + expiry check. Defense in
    //   depth: if the gateway flag is ever flipped off by a bad deploy
    //   (`--no-verify-jwt`) or a dashboard change, this function must still
    //   refuse to act on an unverified token.
    //
    // The OLD comment here argued the manual base64 decode was safe because
    // "deleteUser would fail on an unknown sub." That reasoning was WRONG: an
    // attacker doesn't forge a random sub — they craft a token carrying a
    // KNOWN victim's sub. deleteUser(victimSub) would then succeed. Trusting
    // an unverified `sub` is a real account-takeover-by-deletion vector. So
    // we now cryptographically verify the token's signature and expiry before
    // reading `sub` at all.
    //
    // Verification supports BOTH Supabase signing systems, chosen per-token by
    // the token's own `alg` header (SPEC-FIX-06, 2026-07-11):
    //
    //   - ASYMMETRIC (ES256 / RS256) — the new "JWT Signing Keys" system.
    //     Supabase publishes the PUBLIC keys at
    //     `${supabaseUrl}/auth/v1/.well-known/jwks.json`; we verify the
    //     signature against that key set. No shared secret needed. This is what
    //     dev (and any project migrated to signing keys) issues today — the dev
    //     JWKS advertises a single ES256 key.
    //   - HS256 (legacy) — the old symmetric secret. Verified against the
    //     JWT_SECRET env var (Dashboard → Settings → JWT Keys → Legacy JWT
    //     Secret — set once per project via `supabase secrets set`; see
    //     EDGE_FUNCTION_DEPLOYMENT.md). Retained so this same function keeps
    //     working on any project still on the legacy secret.
    //
    // Why per-token dispatch (not "try one then the other"): the token's `alg`
    // header tells us unambiguously which system signed it. We pin the verify
    // to that single algorithm so an attacker can't downgrade/confuse the alg
    // (e.g. present an HS256-forged token to a project that should be ES256).
    //
    // History: before SPEC-FIX-06 this function ONLY verified HS256 against
    // JWT_SECRET, with a code comment noting "if this project ever moves to
    // asymmetric signing keys, switch to JWKS." That move had silently already
    // happened on dev — every real Delete Account returned 401 ("alg Header
    // Parameter value not allowed") because the ES256 token was rejected by the
    // HS256-only verify. Caught on dev during v1.2.0 release testing before it
    // could ship. This dual-path fix handles both worlds.
    //
    // NAME NOTE (SPEC-FIX-01 R2): the HS256 env var is `JWT_SECRET`, NOT
    // `SUPABASE_JWT_SECRET`. The `SUPABASE_` prefix is RESERVED by the Supabase
    // CLI — a secret by that name can never be set. Do not rename it back.
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Read the token's algorithm from its (unverified) header to choose the
    // verification path. Reading the header is not trusting the token — the
    // signature is still cryptographically verified below with an algorithm
    // list pinned to exactly this alg, so a lie in the header only routes the
    // token to a verifier that will then reject its signature.
    let tokenAlg: string;
    try {
      tokenAlg = jose.decodeProtectedHeader(bearerToken).alg ?? '';
    } catch (_e) {
      // Malformed token — can't even read the header. Treat as unauthorized.
      console.error('JWT verification failed: unreadable protected header');
      return new Response(null, { status: 401, headers: corsHeaders });
    }

    const jwtSecret = Deno.env.get('JWT_SECRET');
    const isHs256 = tokenAlg === 'HS256';

    // Fail CLOSED only when we have NO way to verify THIS token: an HS256 token
    // but no JWT_SECRET set. (Asymmetric tokens verify against the public JWKS,
    // which needs no local secret — so a missing JWT_SECRET is NOT a 500 for
    // them.) A verification we cannot perform must never fall through to a
    // delete. Server misconfig → 500 with a generic body.
    if (isHs256 && !jwtSecret) {
      console.error('JWT_SECRET is not set but token is HS256 — cannot verify, refusing to proceed.');
      return new Response(null, { status: 500, headers: corsHeaders });
    }

    let userId: string;
    try {
      let payload: jose.JWTPayload;
      if (isHs256) {
        // Legacy symmetric path. jwtVerify checks the HS256 signature AND the
        // exp claim. Algorithm pinned to HS256 to prevent alg-confusion.
        const secretKey = new TextEncoder().encode(jwtSecret);
        ({ payload } = await jose.jwtVerify(bearerToken, secretKey, {
          algorithms: ['HS256'],
        }));
      } else {
        // Asymmetric path (the new signing-keys system). Verify against the
        // project's published PUBLIC keys. createRemoteJWKSet caches the fetch
        // and picks the key by the token's `kid`. Algorithm pinned to exactly
        // the token's asymmetric alg (ES256/RS256) — never HS256 here, so a
        // symmetric-forged token can't be verified against a public key.
        if (tokenAlg !== 'ES256' && tokenAlg !== 'RS256') {
          throw new Error(`unsupported token alg: ${tokenAlg || '(none)'}`);
        }
        const JWKS = jose.createRemoteJWKSet(
          new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
        );
        ({ payload } = await jose.jwtVerify(bearerToken, JWKS, {
          algorithms: [tokenAlg],
        }));
      }
      const sub = payload.sub;
      if (!sub || typeof sub !== 'string') {
        throw new Error('verified JWT missing sub claim');
      }
      userId = sub;
    } catch (verifyError) {
      // Any verification failure — bad signature (tampered token), expired
      // token, malformed JWT, missing sub — is a 401 with NO detail in the
      // body. We log server-side for our own diagnostics but tell the caller
      // nothing beyond "unauthorized"; leaking which check failed helps an
      // attacker probe. Distinct from the 400 step-errors below, whose
      // response shape ({ error, step }) is deliberately unchanged.
      const detail = verifyError instanceof Error ? verifyError.message : String(verifyError);
      console.error('JWT verification failed:', detail);
      return new Response(null, { status: 401, headers: corsHeaders });
    }

    console.log('Deleting account for user:', userId);

    step = 'create_admin_client';
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete user data in the correct order (foreign key constraints)
    step = 'delete_lesson_progress';
    console.log('Deleting lesson progress...');
    const { error: progressError } = await supabaseAdmin
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error deleting lesson progress:', progressError);
      throw new Error(`lesson_progress delete failed: ${progressError.message}`);
    }

    step = 'delete_user_profile';
    console.log('Deleting user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw new Error(`user_profiles delete failed: ${profileError.message}`);
    }

    step = 'delete_auth_user';
    // Delete the auth user (requires service role key)
    console.log('Deleting auth user...');
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      throw new Error(`auth.admin.deleteUser failed: ${deleteAuthError.message}`);
    }

    console.log('Account deletion complete for user:', userId);

    return new Response(
      JSON.stringify({ message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    // Return WHICH step failed. The app catches this and shows a generic
    // 'Delete Failed' alert to the user; the step goes into Sentry via
    // reportError so we can diagnose the next occurrence without redeploying.
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in delete-account function at step "${step}":`, errorMessage);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        step,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
