/* global http, HELPER_URL, USER_ID -- Maestro's runScript runtime and the flow's env */
// A refund or chargeback, as the Dodo webhook records it: the buyer's
// entitlement row becomes `revoked` (SPEC-20 R10 flow 10). Done by the
// helper (scripts/e2e/seed.mjs serve), which holds the dev service key.
const response = http.post(`${HELPER_URL}/revoke`, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: USER_ID }),
});
if (response.status !== 200) throw new Error(`revoke failed: HTTP ${response.status} ${response.body}`);
