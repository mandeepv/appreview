/* global http, json, output, HELPER_URL, EMAIL -- Maestro's runScript runtime and the flow's env */
// Get a sign-in code for EMAIL, the way a parent reads it from their inbox
// (SPEC-20 R10, spike S1). Must run AFTER the app's "Send code": a new code
// replaces the previous one. The helper (scripts/e2e/seed.mjs serve) holds
// the dev service key; Maestro never sees it, because it logs its env.
const response = http.post(`${HELPER_URL}/otp`, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL }),
});
output.otp = json(response.body).otp;
if (!output.otp) throw new Error(`no code for ${EMAIL}: HTTP ${response.status} ${response.body}`);
