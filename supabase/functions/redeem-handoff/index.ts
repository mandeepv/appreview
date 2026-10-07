import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { handler, type Deps } from './handler.ts';

// The function's live wiring. Every rule — the single-use claim, the
// entitlement check, the rate limit, keeping the key out of the logs — lives
// in handler.ts, which takes these as arguments so handler_test.ts can run it
// against fakes (SPEC-20 R8). Change behaviour there, not here.
//
// Deployed WITHOUT the gateway JWT check (supabase/config.toml, INVARIANTS
// #30): the app calls this before it has a session.
const liveDeps: Deps = {
  env: (name) => Deno.env.get(name),
  createAdminClient: (url, serviceRoleKey) =>
    createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  now: () => new Date(),
};

serve((req) => handler(req, liveDeps));
