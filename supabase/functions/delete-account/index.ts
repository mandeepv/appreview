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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const userId = user.id;
    console.log('Deleting account for user:', userId);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Delete user data in the correct order (foreign key constraints)
    console.log('Deleting lesson progress...');
    const { error: progressError } = await supabaseAdmin
      .from('lesson_progress')
      .delete()
      .eq('user_id', userId);

    if (progressError) {
      console.error('Error deleting lesson progress:', progressError);
      throw progressError;
    }

    console.log('Deleting user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      throw profileError;
    }

    // Delete the auth user (requires service role key)
    console.log('Deleting auth user...');
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError);
      throw deleteAuthError;
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
    console.error('Error in delete-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
