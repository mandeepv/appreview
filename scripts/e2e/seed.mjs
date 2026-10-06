#!/usr/bin/env node
// Test data for the simulator E2E flows (SPEC-20 R10), on the DEV Supabase
// project only. Reads .env.e2e (git-ignored); refuses the prod ref.
//
//   node scripts/e2e/seed.mjs create <kind> <runId>   → prints {"email","userId"}
//   node scripts/e2e/seed.mjs exists <email>          → prints true / false
//   node scripts/e2e/seed.mjs cleanup <runId>         → deletes every user of that run
//   node scripts/e2e/seed.mjs min-build [n]           → prints dev's min_supported_ios_build; sets it first if n given
//   node scripts/e2e/seed.mjs serve <runId> <portFile> → the flows' helper (below); runs until killed
//
// Kinds:
//   buyer           a kinderwell.app buyer, seeded with EXACTLY what the Dodo
//                   webhook writes: an active `entitlements` row (no Dodo
//                   subscription id, so delete-account never calls Dodo) and the
//                   `user_profiles` row it inserts from the quiz answers.
//   buyer-no-profile  the same purchase, but the webhook's profile insert failed.
//   unentitled      a returning app user with a profile and no purchase.
//
// Every address is delivered+<runId>-<kind>@resend.dev: Resend's test inbox,
// so no real person is ever emailed, and the run id lets cleanup find exactly
// this run's users. Deleting a user cascades to their profile, progress and
// entitlement rows.
//
// min-build changes SHARED dev config (the kill switch, flow 8): any dev
// build at or below it shows the force-update screen until it is restored.
// run.sh restores it straight after flow 8 and again on exit.
//
// THE HELPER: why the flows never see the service key. Maestro writes every
// `-e` variable it is given into its debug log in plain text
// (~/.maestro/tests/…/maestro.log); the first run of these flows put the
// service key there. So the key stays in this process. The flows call a
// helper on 127.0.0.1 for the two privileged steps — read a sign-in code,
// revoke a purchase — and the helper serves only this run's own test users.

import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const PROD_REF = 'prodprojectref00000x';

const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.e2e'), 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]),
);
if (!env.E2E_SUPABASE_URL || env.E2E_SUPABASE_URL.includes(PROD_REF)) {
  console.error('Refusing to run: E2E_SUPABASE_URL is missing or points at PROD.');
  process.exit(1);
}

const { createClient } = createRequire(join(ROOT, 'package.json'))('@supabase/supabase-js');
const admin = createClient(env.E2E_SUPABASE_URL, env.E2E_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const emailFor = (runId, kind) => `delivered+${runId}-${kind}@resend.dev`;
const inThirtyDays = () => new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

async function must(promise) {
  const { data, error } = await promise;
  if (error) throw error;
  return data;
}

async function create(kind, runId) {
  if (!['buyer', 'buyer-no-profile', 'unentitled'].includes(kind)) throw new Error(`unknown kind: ${kind}`);
  const email = emailFor(runId, kind);
  const { user } = await must(admin.auth.admin.createUser({ email, email_confirm: true }));

  if (kind === 'buyer' || kind === 'unentitled') {
    // What the webhook inserts at first payment (web repo _shared/profile.ts):
    // user_type is what makes the app count the profile as onboarded.
    await must(admin.from('user_profiles').insert({ id: user.id, user_type: 'mother', children_count: 1 }));
  }
  if (kind === 'buyer' || kind === 'buyer-no-profile') {
    await must(
      admin.from('entitlements').insert({
        user_id: user.id,
        source: 'dodo',
        status: 'active',
        product_id: 'pdt_e2e',
        current_period_end: inThirtyDays(),
      }),
    );
  }
  return { email, userId: user.id };
}

async function listAll() {
  const users = [];
  for (let page = 1; ; page += 1) {
    const { users: batch } = await must(admin.auth.admin.listUsers({ page, perPage: 1000 }));
    users.push(...batch);
    if (batch.length < 1000) return users;
  }
}

async function exists(email) {
  return (await listAll()).some((u) => u.email === email.toLowerCase());
}

async function cleanup(runId) {
  const mine = (await listAll()).filter((u) => u.email?.startsWith(`delivered+${runId}-`));
  for (const user of mine) await must(admin.auth.admin.deleteUser(user.id));
  return { deleted: mine.length };
}

function serve(runId, portFile) {
  if (!/^e2e[0-9]+$/.test(runId ?? '')) throw new Error('serve needs the run id (e2e<digits>)');
  // Only addresses this run created: delivered+<runId>-f<n>-<kind>@resend.dev.
  const ours = new RegExp(`^delivered\\+${runId}-f[0-9]+-[a-z-]+@resend\\.dev$`);
  const routes = {
    // A fresh code, as the parent would read it from their inbox. Call it
    // AFTER the app's Send code: generating one replaces the previous code.
    async otp({ email }) {
      if (!ours.test(email ?? '')) return [403, { error: 'not a test address of this run' }];
      const data = await must(admin.auth.admin.generateLink({ type: 'magiclink', email }));
      return [200, { otp: data.properties.email_otp }];
    },
    // A refund or chargeback, as the Dodo webhook records it (flow 10).
    async revoke({ userId }) {
      const { user } = await must(admin.auth.admin.getUserById(userId ?? ''));
      if (!ours.test(user.email ?? '')) return [403, { error: 'not a test user of this run' }];
      await must(admin.from('entitlements').update({ status: 'revoked' }).eq('user_id', userId));
      return [200, { revoked: true }];
    },
  };
  const server = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      const route = req.method === 'POST' ? routes[req.url.slice(1)] : undefined;
      let status = 404;
      let payload = { error: 'unknown route' };
      if (route) {
        try {
          [status, payload] = await route(JSON.parse(body || '{}'));
        } catch (error) {
          [status, payload] = [500, { error: String(error.message ?? error) }];
        }
      }
      res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(payload));
    });
  });
  server.listen(0, '127.0.0.1', () => writeFileSync(portFile, String(server.address().port)));
  return new Promise(() => {}); // until run.sh kills it
}

async function minBuild(value) {
  if (value !== undefined) {
    if (!/^[0-9]+$/.test(value)) throw new Error(`min-build must be a bare integer, got ${value}`);
    await must(admin.from('app_config').update({ value: Number(value) }).eq('key', 'min_supported_ios_build'));
  }
  const rows = await must(admin.from('app_config').select('value').eq('key', 'min_supported_ios_build'));
  if (rows.length !== 1) throw new Error('app_config has no min_supported_ios_build row');
  return rows[0].value;
}

const [command, ...args] = process.argv.slice(2);
const run = {
  create: () => create(args[0], args[1]),
  exists: () => exists(args[0]),
  cleanup: () => cleanup(args[0]),
  'min-build': () => minBuild(args[0]),
  serve: () => serve(args[0], args[1]),
}[command];
if (!run) {
  console.error('usage: seed.mjs create <kind> <runId> | exists <email> | cleanup <runId> | min-build [n] | serve <runId> <portFile>');
  process.exit(2);
}
run()
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  });
