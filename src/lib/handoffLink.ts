// SPEC-21 purchase handoff — reading a handoff link, as PURE logic.
//
// A kinderwell.app buyer is handed a one-time key inside a link. The app
// accepts exactly these forms, and nothing else:
//
//   https://open.kinderwell.app/k/<key>   universal links — the forms the
//   https://kinderwell.app/k/<key>        website copies, emails and links
//   kinderwell://k/<key>                  the custom scheme. The website never
//                                          issues it; the simulator E2E flows
//                                          use it, because the simulator can't
//                                          verify a universal-link domain
//
// Why two domains: iOS opens a universal link in Safari, not the app, when
// it is tapped on a page of its OWN domain. So the link page on
// open.kinderwell.app points its "Open Kinderwell" at kinderwell.app/k/<key>
// (and kinderwell.app's pages point at open.kinderwell.app): a link to the
// OTHER domain opens the app directly. Both domains' AASA files list only
// /k/*, so the rest of kinderwell.app (the funnel, /manage) still opens in
// Safari.
//
// <key> is 32 random bytes as unpadded base64url — 43 characters. It is a
// LOGIN CREDENTIAL (INVARIANTS #29): whoever holds it signs in as the buyer.
// So it lives only in memory and goes only to redeem-handoff — never into a
// navigation param, PostHog, Sentry or a log line, including __DEV__ logs.
// The PII guard in src/test/setup.ts fails any test that leaks one.

// One anchored pattern for all three forms. The key's character class is
// the whole of base64url, so matching case-insensitively (for the host and
// scheme) cannot loosen it. A trailing slash is tolerated, and a query or
// fragment is ignored rather than rejected: mail clients and link checkers
// append them, and they carry nothing the app reads.
const HANDOFF_URL =
  /^(?:https:\/\/(?:open\.)?kinderwell\.app|kinderwell:\/)\/k\/([A-Za-z0-9_-]{43})\/?(?:[?#].*)?$/i;

/**
 * The key inside a handoff link, or null for anything that isn't one —
 * another site, another path, http, a truncated or padded key, extra path
 * segments. Takes untrusted input (the clipboard, any URL that opens the
 * app); surrounding whitespace from a paste is trimmed.
 */
export function parseHandoffUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  return HANDOFF_URL.exec(raw.trim())?.[1] ?? null;
}
