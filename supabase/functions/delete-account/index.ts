import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import * as jose from 'https://esm.sh/jose@5.9.6';
import { handler, type Deps } from './handler.ts';

// The function's live wiring. Every rule — CORS, JWT verification, cancelling
// a web subscription before deleting anything, the delete order — lives in
// handler.ts, which takes these as arguments so handler_test.ts can run it
// against fakes (SPEC-20 R8). Change behaviour there, not here.
const liveDeps: Deps = {
  env: (name) => Deno.env.get(name),
  fetch: (input, init) => fetch(input, init),
  createAdminClient: (url, serviceRoleKey) =>
    createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  remoteJwks: (url) => jose.createRemoteJWKSet(url),
};

serve((req) => handler(req, liveDeps));
