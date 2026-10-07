/* global http, json, output, HELPER_URL, USER_ID, STATE, DELIVER -- Maestro's runScript runtime and the flow's env */
// A purchase-handoff link for USER_ID (SPEC-21 flows 12–15), minted exactly
// as the website mints one. STATE: fresh | expired | used. DELIVER:
//   page — the helper answers with the address of a one-time page whose
//          "Get Kinderwell" copies the link in Safari, as the welcome page
//          does; it lands in output.handoffPage (no key in it);
//   open — the helper opens the link in the app, as "Open Kinderwell" does.
// The helper (scripts/e2e/seed.mjs serve) never sends the key back: it's a
// login credential, and Maestro logs what it is given.
const response = http.post(`${HELPER_URL}/handoff`, {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: USER_ID, state: STATE, deliver: DELIVER }),
});
if (response.status !== 200) throw new Error(`handoff failed: HTTP ${response.status} ${response.body}`);
if (DELIVER === 'page') output.handoffPage = json(response.body).page;
