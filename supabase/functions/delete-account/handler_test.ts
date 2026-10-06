// SPEC-20 R8 — the delete-account function: deleting an account is money and
// security code, and until now nothing tested it.
//
//  - Who: the caller is whoever a cryptographically verified JWT says. A
//    forged, expired, mis-signed or unsigned token never deletes anything
//    (a trusted `sub` was once an account-deletion-by-anyone vector).
//  - Money (INVARIANTS #28): a renewing web subscription is cancelled at Dodo
//    BEFORE anything is deleted, and a failed cancel deletes nothing.
//  - Order: progress, then profile, then the auth user; a failed step stops
//    the rest and names itself.
//
// The handler runs for real; only its deps are fakes. JWTs are really signed
// with jose and verified by the handler's own code against an in-memory key
// set. Run: deno test supabase/functions

import { assert, assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import * as jose from 'https://esm.sh/jose@5.9.6';
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { handler, type Deps } from './handler.ts';

const SUPABASE_URL = 'https://devprojectref000000x.supabase.co';
const LEGACY_SECRET = 'legacy-hs256-secret-for-tests-only';
const USER = 'user-a';

// ── Tokens ──────────────────────────────────────────────────────────────────

const signingKeys = await jose.generateKeyPair('ES256');
const otherKeys = await jose.generateKeyPair('ES256');
const publicJwk = { ...(await jose.exportJWK(signingKeys.publicKey)), kid: 'k1', alg: 'ES256' };
const projectJwks = jose.createLocalJWKSet({ keys: [publicJwk] });

type Claims = Record<string, unknown>;
const defaultClaims: Claims = { sub: USER, role: 'authenticated' };

function es256(claims: Claims = defaultClaims, key = signingKeys.privateKey, expires: string | number = '1h') {
  return new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'ES256', kid: 'k1' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(key);
}

function hs256(claims: Claims = defaultClaims, secret = LEGACY_SECRET) {
  return new jose.SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
}

const b64url = (value: unknown) =>
  btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

// ── Fakes ───────────────────────────────────────────────────────────────────

type DbResult = { data?: unknown; error: { message: string } | null };

type World = {
  env?: Record<string, string | undefined>;
  entitlement?: DbResult;
  failDelete?: 'lesson_progress' | 'user_profiles' | 'auth';
  dodo?: number | 'network-error';
};

/** Runs the handler against fakes; `log` is the order of every outside call. */
async function call(world: World, request: Request) {
  const log: string[] = [];
  const dodoRequests: { url: string; init?: RequestInit }[] = [];
  const adminKeys: string[] = [];
  const env: Record<string, string | undefined> = {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: 'legacy-service-role',
    ...world.env,
  };

  const admin = {
    from(table: string) {
      return {
        select(_columns: string) {
          log.push(`${table}.select`);
          const chain = {
            eq(column: string, value: string) {
              log.push(`${table}.eq(${column}=${value})`);
              return chain;
            },
            maybeSingle: () => Promise.resolve(world.entitlement ?? { data: null, error: null }),
          };
          return chain;
        },
        delete() {
          return {
            eq(column: string, value: string) {
              log.push(`${table}.delete(${column}=${value})`);
              const failed = world.failDelete === table;
              return Promise.resolve({ error: failed ? { message: `${table} is locked` } : null });
            },
          };
        },
      };
    },
    auth: {
      admin: {
        deleteUser(id: string) {
          log.push(`auth.deleteUser(${id})`);
          const failed = world.failDelete === 'auth';
          return Promise.resolve({ error: failed ? { message: 'auth is down' } : null });
        },
      },
    },
  };

  const deps: Deps = {
    env: (name) => env[name],
    fetch: (input, init) => {
      log.push('dodo.cancel');
      dodoRequests.push({ url: String(input), init });
      if (world.dodo === 'network-error') return Promise.reject(new TypeError('network down'));
      return Promise.resolve(new Response('{}', { status: world.dodo ?? 200 }));
    },
    createAdminClient: (_url, serviceRoleKey) => {
      adminKeys.push(serviceRoleKey);
      return admin as unknown as SupabaseClient;
    },
    remoteJwks: (url) => {
      assertEquals(url.href, `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
      return projectJwks;
    },
  };

  const response = await handler(request, deps);
  const text = await response.text();
  let body: Record<string, unknown> | null = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  return { status: response.status, headers: response.headers, body, text, log, dodoRequests, adminKeys };
}

const post = (token?: string) =>
  new Request('https://example.functions.supabase.co/delete-account', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

const DELETES = [
  'lesson_progress.delete(user_id=user-a)',
  'user_profiles.delete(id=user-a)',
  'auth.deleteUser(user-a)',
];
const deletedAnything = (log: string[]) =>
  log.some((entry) => entry.includes('.delete(') || entry.startsWith('auth.deleteUser'));

const webRow = (status: string, dodo_subscription_id: string | null = 'sub_123') => ({
  data: { status, dodo_subscription_id },
  error: null,
});

// ── Requests and CORS ───────────────────────────────────────────────────────

Deno.test('OPTIONS → 200, and no Access-Control-Allow-Origin (no browser may read this)', async () => {
  const r = await call({}, new Request('https://x/delete-account', { method: 'OPTIONS' }));
  assertEquals(r.status, 200);
  assertEquals(r.headers.get('Access-Control-Allow-Origin'), null);
  assertEquals(r.log, []);
});

Deno.test('no Authorization header → 400 naming the step, nothing deleted', async () => {
  const r = await call({}, post());
  assertEquals(r.status, 400);
  assertEquals(r.body?.step, 'read_auth_header');
  assert(!deletedAnything(r.log));
});

// ── Who is asking: JWT verification ─────────────────────────────────────────

Deno.test('a valid ES256 token (signing keys) → the verified user is deleted', async () => {
  const r = await call({}, post(await es256()));
  assertEquals(r.status, 200);
  assertEquals(r.body?.message, 'Account deleted successfully');
  assertEquals(r.log.filter((e) => DELETES.includes(e)), DELETES);
});

Deno.test('a valid HS256 token (legacy secret) → deleted', async () => {
  const r = await call({ env: { JWT_SECRET: LEGACY_SECRET } }, post(await hs256()));
  assertEquals(r.status, 200);
});

const rejected: [string, () => Promise<string>, World?][] = [
  ['signed by a different key', () => es256(defaultClaims, otherKeys.privateKey)],
  ['that has expired', () => es256(defaultClaims, signingKeys.privateKey, Math.floor(Date.now() / 1000) - 60)],
  ['with no sub claim', () => es256({ role: 'authenticated' })],
  ['that is unsigned (alg: none)', () => Promise.resolve(`${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: USER })}.`)],
  ['using an unsupported alg (HS512)', () =>
    new jose.SignJWT(defaultClaims).setProtectedHeader({ alg: 'HS512' }).setExpirationTime('1h')
      .sign(new TextEncoder().encode(LEGACY_SECRET))],
  // Alg confusion: an HS256-signed token relabelled ES256 must be checked
  // against the public keys — and fail — not against a shared secret.
  ['signed HS256 but relabelled as ES256', async () => {
    const [, payload, signature] = (await hs256()).split('.');
    return `${b64url({ alg: 'ES256', kid: 'k1' })}.${payload}.${signature}`;
  }],
  ['forged with the wrong HS256 secret', () => hs256(defaultClaims, 'attacker-secret'), { env: { JWT_SECRET: LEGACY_SECRET } }],
  ['that is not a JWT at all', () => Promise.resolve('garbage')],
];

for (const [label, makeToken, world] of rejected) {
  Deno.test(`a token ${label} → 401 with no detail, nothing deleted`, async () => {
    const r = await call({ entitlement: webRow('active'), ...world }, post(await makeToken()));
    assertEquals(r.status, 401);
    assertEquals(r.text, '');
    assert(!deletedAnything(r.log), `deleted despite a token ${label}`);
    assertEquals(r.dodoRequests, []);
  });
}

// A verification the function cannot perform must never fall through to a
// delete: fail closed with a server error.
Deno.test('an HS256 token when JWT_SECRET is not set → 500, nothing deleted', async () => {
  const r = await call({}, post(await hs256()));
  assertEquals(r.status, 500);
  assert(!deletedAnything(r.log));
});

Deno.test('no service key configured → 400 at that step, nothing deleted', async () => {
  const r = await call({ env: { SUPABASE_SERVICE_ROLE_KEY: undefined } }, post(await es256()));
  assertEquals(r.status, 400);
  assertEquals(r.body?.step, 'read_env_service_role');
  assert(!deletedAnything(r.log));
});

Deno.test('the new-format secret key is preferred over the legacy one', async () => {
  const r = await call({ env: { SUPABASE_SECRET_KEYS: JSON.stringify({ default: 'sb_secret_new' }) } }, post(await es256()));
  assertEquals(r.adminKeys, ['sb_secret_new']);
});

// ── Money: cancel a renewing web subscription first (INVARIANTS #28) ───────

Deno.test('the entitlement read is scoped to the verified user and to Dodo', async () => {
  const r = await call({}, post(await es256()));
  assertEquals(r.log.slice(0, 3), [
    'entitlements.select',
    'entitlements.eq(user_id=user-a)',
    'entitlements.eq(source=dodo)',
  ]);
});

for (const status of ['active', 'past_due']) {
  Deno.test(`${status} web subscription, cancel succeeds → cancel FIRST, then delete in order`, async () => {
    const r = await call({ entitlement: webRow(status) }, post(await es256()));
    assertEquals(r.status, 200);
    const order = r.log.filter((e) => e === 'dodo.cancel' || DELETES.includes(e));
    assertEquals(order, ['dodo.cancel', ...DELETES]);
  });

  Deno.test(`${status} web subscription, Dodo refuses → 409 subscription_cancel_failed, NOTHING deleted`, async () => {
    const r = await call({ entitlement: webRow(status), dodo: 500 }, post(await es256()));
    assertEquals(r.status, 409);
    assertEquals(r.body?.code, 'subscription_cancel_failed');
    assertEquals(r.body?.step, 'cancel_web_subscription');
    assert(!deletedAnything(r.log), 'deleted an account whose subscription still bills');
  });
}

Deno.test('Dodo unreachable → 409, nothing deleted', async () => {
  const r = await call({ entitlement: webRow('active'), dodo: 'network-error' }, post(await es256()));
  assertEquals(r.status, 409);
  assert(!deletedAnything(r.log));
});

for (const status of ['cancelled', 'expired', 'revoked']) {
  Deno.test(`${status} web subscription (will not renew) → no cancel call, account deleted`, async () => {
    const r = await call({ entitlement: webRow(status) }, post(await es256()));
    assertEquals(r.status, 200);
    assertEquals(r.dodoRequests, []);
  });
}

Deno.test('an active row with no Dodo subscription id → no cancel call, account deleted', async () => {
  const r = await call({ entitlement: webRow('active', null) }, post(await es256()));
  assertEquals(r.status, 200);
  assertEquals(r.dodoRequests, []);
});

Deno.test('the entitlement read fails → 400, nothing deleted (we cannot tell if a card will be charged)', async () => {
  const r = await call({ entitlement: { data: null, error: { message: 'timeout' } } }, post(await es256()));
  assertEquals(r.status, 400);
  assertEquals(r.body?.step, 'cancel_web_subscription');
  assert(!deletedAnything(r.log));
});

// Copied from the web repo's _shared/dodo.ts, so pin what it sends.
Deno.test('the Dodo cancel request: PATCH status=cancelled, test host by default', async () => {
  const r = await call({ entitlement: webRow('active', 'sub/123'), env: { DODO_API_KEY: 'dodo_key' } }, post(await es256()));
  assertEquals(r.dodoRequests.length, 1);
  const [{ url, init }] = r.dodoRequests;
  assertEquals(url, 'https://test.dodopayments.com/subscriptions/sub%2F123');
  assertEquals(init?.method, 'PATCH');
  assertEquals((init?.headers as Record<string, string>).Authorization, 'Bearer dodo_key');
  assertEquals(JSON.parse(String(init?.body)), { status: 'cancelled' });
});

Deno.test('DODO_ENV=live → the live host', async () => {
  const r = await call({ entitlement: webRow('active'), env: { DODO_ENV: 'live' } }, post(await es256()));
  assertEquals(r.dodoRequests[0].url, 'https://live.dodopayments.com/subscriptions/sub_123');
});

// ── Delete order: a failed step stops the rest ──────────────────────────────

const failures: [World['failDelete'], string, string[]][] = [
  ['lesson_progress', 'delete_lesson_progress', DELETES.slice(0, 1)],
  ['user_profiles', 'delete_user_profile', DELETES.slice(0, 2)],
  ['auth', 'delete_auth_user', DELETES],
];

for (const [table, step, attempted] of failures) {
  Deno.test(`${table} delete fails → 400 naming ${step}, later steps not run`, async () => {
    const r = await call({ failDelete: table }, post(await es256()));
    assertEquals(r.status, 400);
    assertEquals(r.body?.step, step);
    assertEquals(r.log.filter((e) => DELETES.includes(e)), attempted);
  });
}
