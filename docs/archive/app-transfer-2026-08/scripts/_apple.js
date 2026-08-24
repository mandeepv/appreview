// Shared Apple helpers for the Sign-in-with-Apple app-transfer user migration
// (TN3159). Used by 1-generate.js (old team) and 2-exchange.js (new team).
//
// This is the SAME client-secret mechanism as scripts/generate_apple_jwt.js —
// an ES256 JWT signed with a Sign-in-with-Apple .p8 key — but here it's used to
// obtain a `user.migration`-scoped access token and then call the user
// migration info endpoint, rather than to feed Supabase's Apple provider.
//
// Nothing here is prod-specific: every identity value comes from env vars /
// caller args so the same code runs against dev first (see the runbook — test
// the full loop against a throwaway Apple user on dev before prod).
//
// Docs: TN3159 (Migrating Sign in with Apple users for an app transfer) and
// "Transferring your apps and users to another team". No rate limiting on the
// token or usermigrationinfo endpoints (stated verbatim in TN3159), so these
// helpers do no backoff.

const fs = require('fs');
const jwt = require('jsonwebtoken');

const APPLE = 'https://appleid.apple.com';

/**
 * Build the ES256 client-secret JWT that proves we act for a given team.
 *
 * @param {object} o
 * @param {string} o.teamId   - iss claim: the ACTING team's ID (old team when
 *                              generating, new team when exchanging).
 * @param {string} o.keyId    - kid header: the Key ID of that team's SIWA .p8.
 * @param {string} o.clientId - sub claim: the Services ID / App ID (the client).
 * @param {string} o.p8Path   - path to that team's AuthKey_*.p8 file.
 * @returns {string} signed JWT (valid 5 min — only needs to live for the token
 *                   request; short-lived by design so it can't be reused).
 */
function makeClientSecret({ teamId, keyId, clientId, p8Path }) {
  if (!teamId || !keyId || !clientId || !p8Path) {
    throw new Error('makeClientSecret: teamId, keyId, clientId, p8Path all required');
  }
  const privateKey = fs.readFileSync(p8Path, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: teamId,
      iat: now,
      exp: now + 300, // 5 minutes — just long enough to fetch the access token
      aud: APPLE,
      sub: clientId,
    },
    privateKey,
    { algorithm: 'ES256', keyid: keyId },
  );
}

/**
 * Exchange the client secret for a `user.migration`-scoped access token.
 * TN3159 step 1 (Team A) / step 4 (Team B).
 *
 * @returns {Promise<string>} access_token
 */
async function getMigrationAccessToken({ clientId, clientSecret }) {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'user.migration',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(`${APPLE}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    // Apple returns {"error":"..."} — surface it; see TN3107 for meanings.
    throw new Error(`token endpoint ${res.status}: ${text}`);
  }
  const json = JSON.parse(text);
  if (!json.access_token) throw new Error(`token endpoint returned no access_token: ${text}`);
  return json.access_token;
}

/**
 * GENERATE a transfer identifier for one user (TN3159 step 2, run by Team A).
 * Returns the `transfer_sub` string.
 *
 * @param {object} o
 * @param {string} o.accessToken   - Team A's user.migration access token.
 * @param {string} o.sub           - the user's CURRENT (old-team) Apple sub.
 * @param {string} o.targetTeamId  - Team B's developer team ID (the recipient).
 * @param {string} o.clientId
 * @param {string} o.clientSecret  - Team A's client secret.
 */
async function generateTransferSub({ accessToken, sub, targetTeamId, clientId, clientSecret }) {
  const body = new URLSearchParams({
    sub,
    target: targetTeamId,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(`${APPLE}/auth/usermigrationinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`usermigrationinfo(generate) ${res.status}: ${text}`);
  const json = JSON.parse(text);
  if (!json.transfer_sub) throw new Error(`no transfer_sub in response: ${text}`);
  return json.transfer_sub;
}

/**
 * EXCHANGE a transfer identifier for the new-team sub + email (TN3159 step 5,
 * run by Team B). Returns { sub, email, is_private_email }.
 *
 * @param {object} o
 * @param {string} o.accessToken   - Team B's user.migration access token.
 * @param {string} o.transferSub   - the transfer_sub produced by Team A.
 * @param {string} o.clientId
 * @param {string} o.clientSecret  - Team B's client secret.
 */
async function exchangeTransferSub({ accessToken, transferSub, clientId, clientSecret }) {
  const body = new URLSearchParams({
    transfer_sub: transferSub,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(`${APPLE}/auth/usermigrationinfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`usermigrationinfo(exchange) ${res.status}: ${text}`);
  const json = JSON.parse(text);
  if (!json.sub) throw new Error(`no sub in exchange response: ${text}`);
  return json; // { sub, email, is_private_email }
}

// --- small shared utilities -------------------------------------------------

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`ERROR: ${name} env var is required. See scripts/apple-transfer/README.md`);
    process.exit(1);
  }
  return v;
}

// Guard against the exact bug caught in the 2026-08-08 runbook review: App
// Store Connect shows a NUMERIC "provider" ID next to the account name (e.g.
// ASCPROVIDERID) that is easy to mistake for the developer Team ID. Real Team
// IDs are 10 alphanumerics from developer.apple.com/account → Membership
// details (e.g. APPLETEAMID). A provider ID passed as a team ID here would
// make every token/usermigrationinfo call fail — or mint transfer identifiers
// targeting a team that doesn't exist — mid-transfer, when time is scarce.
function assertTeamIdFormat(name, value) {
  if (!/^[A-Z0-9]{10}$/.test(value)) {
    console.error(
      `ERROR: ${name}="${value}" doesn't look like an Apple Developer Team ID ` +
      `(10 alphanumerics). All-digit values are usually the App Store Connect ` +
      `provider ID — the wrong identifier. Read the Team ID from ` +
      `developer.apple.com/account → Membership details for the right account.`,
    );
    process.exit(1);
  }
  return value;
}

// The migration bridge file — the record that ties everything together across
// the transfer. Losing it means re-running generate. Never commit it (it maps
// real user IDs); .gitignore covers scripts/apple-transfer/*.json.
function loadBridge(path) {
  if (!fs.existsSync(path)) return { users: {} };
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function saveBridge(path, bridge) {
  fs.writeFileSync(path, JSON.stringify(bridge, null, 2));
}

module.exports = {
  APPLE,
  makeClientSecret,
  getMigrationAccessToken,
  generateTransferSub,
  exchangeTransferSub,
  requireEnv,
  assertTeamIdFormat,
  loadBridge,
  saveBridge,
};
