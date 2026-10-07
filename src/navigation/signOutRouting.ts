// Who routes a sign-out. App.tsx resets the app to Welcome whenever the user
// signs out — right for Settings' Sign out, wrong for a screen that signs out
// on purpose and then routes somewhere else itself. HandoffScreen is exempt
// by route (routingPolicy.shouldResetToWelcomeOnSignOut). LoadingScreen's
// "Use a different account" can't be: its own reset to Auth and App's reset
// to Welcome both follow the same sign-out, so whichever ran last won, and
// the parent often landed on Welcome (web2app review 2026-10-07, AP-4).
//
// So the screen CLAIMS the sign-out before making it, and App's reset
// consumes the claim and stands down. A claim expires after a few seconds,
// so one that is never consumed can't swallow a later, unrelated sign-out.

const CLAIM_MS = 5000;

let claim: { by: string; until: number } | null = null;

/** Call just before a sign-out this screen will route itself. */
export function claimSignOutRouting(by: string, now = Date.now()): void {
  claim = { by, until: now + CLAIM_MS };
}

/** Drop a claim whose sign-out didn't happen (it failed). */
export function releaseSignOutRouting(): void {
  claim = null;
}

/** The screen routing the sign-out that just happened, if any. Consumes the claim. */
export function takeSignOutRouting(now = Date.now()): string | null {
  const current = claim;
  claim = null;
  return current && current.until > now ? current.by : null;
}
