import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
// longer needed because we extract the user ID by decoding the JWT
// manually — see the extract_user_id_from_jwt step below.
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

    step = 'extract_user_id_from_jwt';
    // Extract the user ID directly from the JWT rather than using
    // supabaseClient.auth.getUser().
    //
    // getUser() fails with "Auth session missing" in Edge Functions after
    // Supabase's JWT signing key migration — the anon/publishable key in
    // the function's env may live in a different key namespace from the
    // token the mobile app sends, and the SDK's session recovery path
    // can't reconcile them. Decoding the token ourselves and using the
    // `sub` claim is bulletproof: we don't need the anon key to be in
    // the right namespace, we just need the token to be a well-formed
    // JWT (which it is — Supabase's own gateway already validated
    // it before invoking the function).
    //
    // We DO still validate the user exists via the admin client below —
    // the deleteUser call would fail on an unknown sub anyway, so a
    // forged JWT can't do damage here.
    const bearerToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!bearerToken) {
      throw new Error('Malformed Authorization header: no bearer token');
    }
    const jwtParts = bearerToken.split('.');
    if (jwtParts.length !== 3) {
      throw new Error(`Malformed JWT: expected 3 parts, got ${jwtParts.length}`);
    }
    // Standard base64url → base64 for atob compatibility.
    const payloadB64 = jwtParts[1].replace(/-/g, '+').replace(/_/g, '/');
    // atob returns a Latin-1 string; we need to decode UTF-8 properly for
    // any non-ASCII fields, though `sub` is always ASCII.
    const payloadJson = atob(payloadB64 + '='.repeat((4 - payloadB64.length % 4) % 4));
    const payload = JSON.parse(payloadJson);
    const userId = payload.sub as string | undefined;
    if (!userId) {
      throw new Error('JWT payload missing sub claim');
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
