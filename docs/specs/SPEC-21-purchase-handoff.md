# SPEC-21 — Purchase handoff: web buyers open the app already signed in

> **Status (2026-10-06):** **app half built** on `release/1.3.0` (not yet committed): migration, `redeem-handoff`, the app screens and links, Jest/Deno/pgTAP tests, E2E flows 12–15. Migration applied and function deployed on **dev**; all four spikes passed, and the full E2E suite passed on the simulator on 2026-10-07 (14 of 14 flows, handoff flows 12–15 included). **Website half not built** — this session builds it next, on the owner's go. Ships **in v1.3.0**, because paid ads go live with v1.3.0 (owner, 2026-10-06). Runbook: `releases/v1.3.0.md` section H.
>
> **Decided while building (owner, 2026-10-06):** the copy in §10 Q1 as proposed; 7-day keys (Q2); this session builds the website half (Q3). And one change to §4.4: the key is redeemed BEFORE anyone is signed out, so a dead link leaves whoever is signed in alone. `redeem-handoff` also returns the buyer's `user_id`, which is how "the same user" is recognised without a second session.
>
> **Found while building:** the native build never registered the `kinderwell://` scheme. `app.config.js`'s explicit `CFBundleURLTypes` replaces app.json's `scheme`, so only the bundle ID was there. Google sign-in never noticed, because its sheet catches its own redirect. The simulator flows' `kinderwell://k/…` would have done nothing. Fixed in `app.config.js`, with a test.
>
> **Changed 2026-10-06 (owner):** the link page links to `https://kinderwell.app/k/<key>` instead of the custom scheme, and the app claims both domains (§4.1). The app still accepts `kinderwell://k/<key>`, only so the simulator flows can open a link; the website never issues it. Invariant #29's analytics rule is now precise about which pages may hold a key (§7).

## 1. Problem

Today a kinderwell.app buyer gets **instructions**, not access. The welcome page and the confirmation email both say: open Kinderwell, tap **Sign in** (not Get started), choose **Continue with Email**, enter your address, type the 6-digit code.

Buyers come from ads, so they don't have the app yet. They install it from the App Store and open it fresh. On that cold start they must pick the right button. Some won't:

- They tap **Get started**. The app asks the quiz questions again, then "Save your progress". To a parent who just paid, this looks like the payment didn't register, or a scam.
- They tap **Sign in with Apple** and choose **Hide My Email**. Apple hands the app a relay address, so this becomes a different account with no purchase, and they hit the paywall.
- If the webhook failed to write the buyer's profile, even the right buttons send them through the questions and ask them to sign in twice (BACKLOG #27).

Each of these happens at the most fragile moment of a paid funnel. It has to be solved before ads run.

## 2. Goal

A buyer who pays on their iPhone opens the app **already signed in to the account that paid** and lands in their lessons. They never choose a sign-in method, never see the questions, and never wait for a code.

The industry name is a *deferred deep link*: the login has to survive the App Store install. On iOS the tools do it in three ways (sources at the end):

| Approach | Who uses it | Survives the install? | Cost |
|---|---|---|---|
| Attribution SDK (AppsFlyer, Adjust, Branch) matches the install to the tap | FunnelFox, Adapty | Yes, by server-side matching, which iOS privacy rules weaken | Paid SDK; we have none (attribution is Meta Pixel + CAPI on the web) |
| **Clipboard** ("NativeLink"): the button copies the link; the app reads it on first launch | Branch's own iOS answer | **Yes, on-device** | None |
| **Link after install**: a one-time link on the success page and in the email | RevenueCat redemption links | No: the buyer taps it after installing | None |

**Decision: build three layers, without an SDK.**
1. **Clipboard**, the fast lane.
2. **Link** on the welcome page and in the email, for "installed, then came back".
3. **The 6-digit email code**, today's v1.3.0 path, as the safety net.

## 3. The buyer's journey

1. They pay on kinderwell.app on their iPhone. The welcome page shows **"Get Kinderwell"**.
2. Tapping it **copies a one-time setup link** to the clipboard and opens the App Store.
3. They install and open the app. On that first launch the app sees something on the clipboard. It shows one screen with **Apple's Paste button** (`UIPasteControl`: no permission alert): *"Welcome to Kinderwell. Tap Paste to finish setting up."*
4. They tap **Paste**. The app redeems the link's key, which signs them in, then runs the normal gate (Loading). The gate finds the web entitlement and opens Learn.
5. Learn greets them once: **"You're all set, Ada."** Ada is the quiz name if the webhook saved one; otherwise just "You're all set."

When they miss the fast lane:

- **They copied something else, or declined the paste screen** → they tap **"Open Kinderwell"** on the still-open welcome page, or in the email, and the link signs them in.
- **They paid on a desktop** → the welcome page's QR code holds the same link. The phone's camera opens the link page, whose "Get Kinderwell" button copies the link and goes to the App Store, then the journey continues from step 3.
- **The key expired or was already used** → *"This link has expired. Sign in with the email you used: Continue with Email."* This is today's path.
- **They ignore all of it** → today's v1.3.0 path still works. Signing in by any route with the paid email gets them in, and the paywall's "Use a different account" (Superwall `switch_account`) rescues the Apple relay case.

## 4. Design

### 4.1 The key

- **Format:** 32 random bytes, base64url (43 characters). It's a login credential; treat it like a password.
- **Storage:** sha256 hash only, in a new `handoff_keys` table. Columns: `key_hash` (pk), `user_id`, `source` (`welcome` | `email`), `created_at`, `expires_at`, `used_at`.
  - RLS on, no policies: reachable only with the service role.
  - The migration is authored **here**, then copied into kinderwell-web (parity check direction).
- **Lifetime:** 7 days, and single use. Redeeming marks it used atomically:
  `update … set used_at = now() where key_hash = $1 and used_at is null and expires_at > now() returning user_id`.
  Two simultaneous redeems: exactly one wins.
- **Link forms** (both universal links; the app claims both domains):
  - `https://open.kinderwell.app/k/<key>` is the form copied, emailed, shown as a QR code, and linked from kinderwell.app's pages.
  - `https://kinderwell.app/k/<key>` is the form the link page on open.kinderwell.app links to. A universal link tapped on a page of its **own** domain opens Safari, not the app. A link to the **other** domain opens the app directly. So each domain's pages link to the other one.
  - Both AASA files list only `/k/*`, so the rest of kinderwell.app (the funnel, `/manage`) still opens in Safari.
  - The app also accepts `kinderwell://k/<key>`, only for the simulator E2E flows (S4). The website never issues it.

### 4.2 Minting (website)

- **Email key:** the dodo-webhook mints one at first payment (`source = email`). The confirmation email gains an **"Open Kinderwell"** button with the link above its existing steps, which stay as the fallback.
- **Welcome-page key:** a new function, `mint-handoff`, called by the welcome page.
  - **What proves it's the buyer's browser:** the funnel's `sessionId` alone isn't enough, because it travels to Meta inside the CAPI `event_id`. So `create-checkout` gains a **browser-only nonce**:
    - 32 random bytes, generated in the browser and kept in localStorage;
    - its sha256 is stored on `funnel_sessions.handoff_nonce_hash`;
    - it is never sent to any third party.
  - **When `mint-handoff` issues a key:** it requires that `sessionId` and the nonce match, that `purchased_at` is within 24 h, and that the user's web entitlement is active. It mints at most 5 keys per session (`hit_rate_limit`).
- **Welcome page:**
  - **iPhone:** a **"Get Kinderwell"** button. In the tap handler, a user gesture, it calls `navigator.clipboard.writeText(link)` and then navigates to the App Store URL. `writeText` of the bare link is what makes iOS see a URL on the clipboard (spike S1); don't wrap it in other text. Below it, **"Already installed? Open Kinderwell"** points at the `open.kinderwell.app` universal link (another domain from this page's, so it opens the app).
  - **Desktop:** the QR code encodes the link.
- **Link page** (`open.kinderwell.app/k/[key]`, served when the app isn't installed):
  - A "Get Kinderwell" button (copy + App Store), "Already have it? Open Kinderwell" (`https://kinderwell.app/k/<key>`, the other domain), and the manual steps.
  - **No Meta Pixel, no PostHog**, because the key is in the URL. `Referrer-Policy: no-referrer`, `noindex`.
- **Retention** (added while building the app half): used and expired keys are dead weight that still name a user, so the website's existing data-retention sweep deletes `handoff_keys` rows a few days past `expires_at`. Nothing in the app reads old keys.
- **`apple-app-site-association` on BOTH `open.kinderwell.app` and `kinderwell.app`** (`/.well-known/`): `applinks` for team `APPLETEAMID`, bundles `com.kinderwell.app` and `com.kinderwell.app.dev`, path `/k/*` only.

### 4.3 Redeeming (this repo: edge function `redeem-handoff`)

- `POST { key }`. The function:
  1. hashes the key;
  2. runs the atomic single-use update;
  3. rejects if the user's entitlement isn't active, with no session minted for a refunded buyer;
  4. calls `admin.auth.admin.generateLink({ type: 'magiclink', email })`;
  5. returns `{ token_hash }`.

  The app then calls `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` and holds a normal session. This is the same mechanism the E2E helper already uses to get a code.
- **Results:** `ok`, `expired`, `used`, `unknown`, `not_entitled`, `rate_limited`, `error`. The app maps every non-`ok` result to the email-sign-in fallback, with the right message.
- **`verify_jwt` is off:** the caller has no session yet, and the app's publishable key isn't a JWT. The function is protected by the 256-bit key, single use, and `hit_rate_limit` per IP (20 per 10 min). This is the **only** app-facing function with `verify_jwt` off; recorded as a new invariant (§7).
- **Structure:** `handler.ts` and `index.ts` with injected deps, like delete-account (R8). Deno tests are part of the build.

### 4.4 The app

- **Dependency:** `expo-clipboard`, a native module, so a new native build (v1.3.0 needs one anyway). Use `ClipboardPasteButton` (`UIPasteControl`, iOS 16+). Before rendering it, call `hasUrlAsync()`, which doesn't trigger the paste alert. On iOS < 16, use a normal button that calls `getStringAsync()` (one system alert).
- **When the paste screen shows:** only on a fresh launch with **no session**, before Welcome, when the clipboard holds a URL. It never shows again after a redeem or a "Not now" (a new key in `storageKeys.ts`, per INVARIANTS #10).
  - *As built:* "fresh" also means no onboarding progress on the device and no earlier signed-in launch (Splash sets the same flag then). A returning user who signed out, or a parent halfway through the questions, gets their usual route, never this screen (`shouldOfferHandoffPaste`).
  - **Copy must not mention buying on the web** (INVARIANTS #26 outside the US): "Welcome to Kinderwell. Tap Paste to finish setting up." and "Not now".
  - A pasted URL that isn't ours → straight to Welcome.
- **Incoming links:** `Linking.getInitialURL()` plus the `url` listener, in a small module outside navigation. A `/k/<key>` link at any time (cold or warm) opens the handoff screen in its "signing you in" state; no paste needed.
  - *As built* (`lib/handoffSources.ts`, `navigation/handoffNavigation.ts`): Splash and the handoff screen read a waiting key themselves; anywhere else a link takes over. Over the paywall, navigation resets first and the paywall is dismissed after, so the gate can't re-present it. A link tapped while another is being checked is tried if the first fails.
- **Who's already signed in:**
  - **Someone else** (including the demo user) → sign them out first, which clears the user-bound cache (INVARIANTS #3), then redeem.
  - **The same user** → go to Loading.
- **Routing:** after redeem, `navigation.replace('Loading')`, **never Root** (INVARIANTS #1).
  - The gate decides: web entitled → Root; refunded meanwhile → paywall, correctly.
  - A buyer **without a profile** goes to Loading too: no questions, no second sign-in. That closes BACKLOG #27 for every handoff user. *Spike S3 confirms Loading and Learn behave with no profile and no local answers.*
- **Greeting:** an in-memory flag set at redeem shows a one-time "You're all set, {name}." on Learn. The name comes from `user_profiles.name` through `src/services/`; never "Parent" (INVARIANTS #7).
- **Clipboard cleanup:** after a successful redeem, clear the clipboard if it still holds our link.
- **The key never leaves memory except to `redeem-handoff`:**
  - not a navigation param (navigation state is autocaptured);
  - not in PostHog, Sentry or `__DEV__` logs.
  - The PII guard (`src/test/setup.ts`) gains a pattern for `/k/<43 chars>` and `kinderwell://k/`.

### 4.5 Analytics (via `safeCapture`, no key, no email)

| Event | When / properties |
|---|---|
| `handoff_paste_offered` | the paste screen is shown |
| `handoff_paste_result` | `{ matched: boolean }` |
| `handoff_redeemed` | `{ result, source: 'clipboard' \| 'link' }` |
| `handoff_welcome_shown` | the "You're all set" greeting; `{ with_name: boolean }` (whether a name was shown, never the name) |

Errors other than `expired`, `used` and `unknown` go to Sentry (`reportError`; auth/money path).

**Funnel metric:** the share of new web buyers who reach Learn through the handoff rather than the email code. Target: over 70% on iPhone purchases.

## 5. Spikes (day 1, before building on them)

- **S1:** `ClipboardPasteButton` works in an Expo SDK 54 release build on the simulator, and Maestro can tap it. If Maestro can't, E2E seeds the clipboard and taps a test-only fallback **in dev builds only** (never an auth bypass; see SPEC-20's rule).
- **S2:** `generateLink(magiclink)` + `verifyOtp({ token_hash, type: 'magiclink' })` gives a session for an existing email user on dev. That's spike S1 from SPEC-20 with `token_hash` instead of the 6-digit code.
- **S3:** Loading → Root with a session, no local onboarding answers and no profile: no crash, no questions, Learn and Settings render.
- **S4:** universal links in the simulator need the AASA file reachable. E2E uses the custom scheme (`kinderwell://k/…`, opened by the E2E helper with `xcrun simctl openurl`, so the key never enters Maestro), and the real universal links are checked once on a device.
- *Results (2026-10-06/07, all passed):*
  - **S1:** a link copied in simulator Safari with `navigator.clipboard.writeText`, as the welcome page will do it, counts as a URL to iOS: `hasUrlAsync()` is true, so the paste screen shows. Apple's Paste button renders and pastes with no alert, and Maestro can tap it. A link written as bare text (`simctl pbcopy`) does NOT count, so the website must copy with `writeText` of the link itself, which is the plan. Flow 12 copies through Safari for this reason.
  - **S2:** passed on dev against the deployed function (a fresh key → a session for the buyer; used, expired, unknown and refunded refused; three at once → one `ok`).
  - **S3:** flow 12's buyer has no profile and no local answers; it reaches Learn, and Profile renders.
  - **S4:** the custom scheme works through `simctl openurl`. iOS asks "Open in “Kinderwell Dev”?" once per simulator; the flows accept it. Universal links stay a device check.

## 6. Tests

| Layer | What |
|---|---|
| Deno (`redeem-handoff/handler_test.ts`) | `ok`; `expired`; `used`; `unknown`; `not_entitled`; rate limited; a race (two redeems, one `ok`); `generateLink` failure → `error`; the key never appears in a log line |
| pgTAP | `handoff_keys`: RLS on, no anon/authenticated access; `funnel_sessions.handoff_nonce_hash` is not client-readable |
| Jest | link parsing (both forms, junk rejected); the redeem service → `verifyOtp`; handoff screen states; Splash shows the paste screen only on first launch with no session and a URL on the clipboard; incoming link → Loading, never Root; another user signed in → sign-out first; the greeting shows once and never says "Parent"; analytics carry no key (the PII guard bites) |
| E2E (Maestro, extends SPEC-20) | **flow 12:** a seeded link copied in simulator Safari with `writeText` (as the welcome page does; `simctl pbcopy` writes bare text, which iOS doesn't count as a URL) → fresh install → Paste → Learn with "You're all set" (the buyer without a profile; Profile renders too, spike S3). **flow 13:** app installed, the link opened (`xcrun simctl openurl`, by the helper) → signed in. **flow 14:** an expired/used key → the email-sign-in fallback with the message. **flow 15:** another user signed in + link → switched to the buyer. **flow 2c:** a buyer who ignores everything and taps Get started, then signs in with the paid email → Learn, no paywall. `seed.mjs` gains `create-handoff-key`, which writes exactly what the website writes. |
| Website (kinderwell-web) | `mint-handoff` (nonce, 24 h window, entitlement, limit); the webhook mints the email key and the email contains the link; the link page has no analytics scripts; the welcome button copies, then navigates |
| Device pass (RELEASE_CHECKLIST) | real install from the welcome page on an iPhone: Get Kinderwell → install the build → open → Paste → Learn; tapping the universal link in Mail opens the app |

Every guard is proven by sabotage, as in SPEC-20 rule 5. For example: make `redeem-handoff` skip `used_at` and the race test must fail; route the handoff to Root and the Jest test must fail.

## 7. Invariants to add

- **29.** A handoff key is a login credential:
  - single use, 7 days at most, stored only as its sha256;
  - never in PostHog, Sentry, logs, navigation params or Maestro env;
  - never in the URL of a page that loads analytics, and never sent to an analytics tool. On such a page it may sit only in memory or in a link's `href`, and only while automatic collection is off: Meta `autoConfig` false, PostHog autocapture and session replay off.
- **30.** `redeem-handoff` is the one app-facing edge function with `verify_jwt` off. It must keep:
  - the atomic single-use update;
  - the entitlement check before minting a session;
  - the per-IP rate limit.
- **#1** already covers routing (the handoff enters Root only through Loading). **#26** covers copy (no web-purchase wording in the app).

## 8. Owner steps

1. **Vercel:** add the domain `open.kinderwell.app` to the kinderwell-web project, and the DNS record Vercel shows. About 5 minutes; exact clicks to be given when building.
2. **Nothing in Apple's portal:** the App ID already has Associated Domains (applinks to the Supabase host), and EAS syncs the new domains at build time. Confirm the first build's entitlements include `applinks:open.kinderwell.app` and `applinks:kinderwell.app`.
3. **App Review notes:** "a setup link from our website signs the customer in". No change to the demo-mode notes.
4. **Prod:** the migration goes through `scripts/db-push-prod.sh`; deploy `redeem-handoff` to prod after the migration.

## 9. Rollout order (with v1.3.0)

1. The migration goes to dev, then the app half and `redeem-handoff` on dev; E2E green.
2. The website half on dev, then one end-to-end run: a Dodo test-mode purchase → welcome page → simulator paste → Learn.
3. v1.3.0 goes to App Review. Prod migration and the function deploy happen in RELEASE_CHECKLIST Phases 4–5.
4. The website's handoff UI goes live **with or after** v1.3.0 is live in the App Store. An older app ignores the link harmlessly; buyers still have the email code.
5. Ads start.

**Estimate:** about 3 working days. Day 1: spikes, migration, `redeem-handoff`. Day 2: app screens, links, Jest, E2E. Day 3: website half, then the full chain and the device check. v1.3.0 moves by that much.

## 10. Open questions for the owner

*All three answered 2026-10-06: the proposed copy, 7 days, and this session builds the website half (see the status note at the top).*

1. The paste screen's words, and the greeting. Proposed: "Welcome to Kinderwell. Tap Paste to finish setting up." / "You're all set, Ada."
2. Is a 7-day key lifetime right? It's long enough for "installed on the weekend"; the email code covers anything later.
3. Who builds the website half: this session, or the website session?

## Sources

- Branch, NativeLink deferred deep linking (clipboard): https://help.branch.io/developer-hub/docs/nativelink-deferred-deep-linking
- Branch, deferred deep linking on iOS and its privacy limits: https://www.branch.io/resources/blog/how-to-set-up-deferred-deep-linking-on-ios/
- RevenueCat, Redemption Links: https://www.revenuecat.com/docs/web/redemption-links
- FunnelFox, deep links for authentication: https://funnelfox.com/docs/integrations/authentication/deep-links
