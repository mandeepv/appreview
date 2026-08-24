# App Transfer Runbook — Kinderwell → The Account Holder's Apple account

**Status:** READY TO EXECUTE — **transfer now, no commission gap** (the account holder's SBP 15% is already effective per Apple's 2026-08-15 welcome email; Phase 0.5 resolved). Remaining before initiating: (1) ⛔ the § 3.3.1 dev verification gate — the one true technical blocker (does Supabase store the Apple `sub` where the migration SQL expects?), (2) Phase 1 housekeeping (Test Information blanking, backups, side-state sweep, account tails), (3) generate + share the app-specific shared secret. Q-SW, Q-TN, Q-SIWA all resolved; Phase 3 scripts built & tested. Owner note: the transfer moves income + ownership + tax liability to the account holder for real — confirmed intended (tax-year driver).

**Audit note (2026-08-03):** this runbook was re-audited against every Apple transfer page AND against every third-party SDK actually present in the codebase (`package.json` + `eas.json` + `app.config.js`). See the new **§ Third-party services audit** below. Two `/documentation/` pages (TN3159 body, "bringing users into your team") render only via JavaScript and could not be scraped directly — their content was obtained from the pasted TN3159 text and Apple's server-rendered help/search results, and every claim drawn from them is marked.

**Re-audit 2026-08-08 (pre-execution review):** every Apple help page re-fetched, and TN3159 + "Transferring your apps and users to another team" + "Bringing new apps and users into your team" verified **directly** via Apple's JSON doc API — the 2026-08-03 scraping gap is closed. Material corrections from this pass:
- **The recipient Team ID was wrong.** `ASCPROVIDERID` is the App Store Connect *provider* ID from the account header ("The Account Holder|ASCPROVIDERID|1"), not a Team ID. The real value is **`APPLETEAMID`** (read off the account holder's Users-and-Access page, screenshot-verified). Corrected everywhere here + in `scripts/apple-transfer/`, and `_apple.js` now **hard-fails on provider-ID-shaped team IDs** so this class of mixup can't reach Apple's endpoints.
- **The Small Business Program was missing entirely** — the largest pure-revenue item in the plan (15% vs 30% commission). New **Phase 0.5**.
- **Phase 6 was re-ordered** — the new-team SIWA key must exist *before* TN3159 Step B (the earlier list had Step B first, which would dead-end mid-cutover).
- Q-SIWA risk **recalibrated down** (native `signInWithIdToken` never uses the provider secret — see the note in that section); TestFlight Test-Information blanking upgraded from optional to required; sender account-tails + side-state sweep added to Phase 1.
- Scope confirmations from the owner (2026-08-08): iOS App Store only (no Play listing) — the Android question in the audit table is closed; transfer intended **within days**.

**What this is:** the complete, source-verified plan to move Kinderwell from The Owner's App Store Connect account to The Account Holder's account, while the owner continues to operate everything. Revenue-critical — this is the sole income source. The whole point of the plan is that **billing never stops and no existing subscriber/user is orphaned.**

**Verified against (re-read in full 2026-08-03):**
- [Overview of app transfer](https://developer.apple.com/help/app-store-connect/transfer-an-app/overview-of-app-transfer/)
- [App transfer criteria](https://developer.apple.com/help/app-store-connect/transfer-an-app/app-transfer-criteria/)
- [Initiate an app transfer](https://developer.apple.com/help/app-store-connect/transfer-an-app/initiate-an-app-transfer/)
- [Accept an app transfer](https://developer.apple.com/help/app-store-connect/transfer-an-app/accept-an-app-transfer/)
- [TN3159 — Sign in with Apple user migration](https://developer.apple.com/documentation/technotes/tn3159-migrating-sign-in-with-apple-users-for-an-app-transfer) (full text read & verified 2026-08-03) + [Transferring your apps and users to another team](https://developer.apple.com/documentation/signinwithapple/transferring-your-apps-and-users-to-another-team) · related: [TN3107 — resolving SiwA errors](https://developer.apple.com/documentation/technotes/tn3107-resolving-sign-in-with-apple-response-errors), [Confirm the transferred credential state](https://developer.apple.com/documentation/signinwithapple/bringing-new-apps-and-users-into-your-team)
- [Superwall — transfer app to a new owner](https://superwall.com/docs/support/faq/1379595978-how-to-transfer-app-to-a-new-owner)

**Key facts (from code, verified):**
- Bundle ID: `com.kinderwell.app` — **immutable after transfer.**
- Products: `com.kinderwell.app.monthly`, `com.kinderwell.app.annual` (Subscription Group `21909581`), both **Approved**.
- Auth: Google **and** Apple sign-in (`expo-apple-authentication` → Supabase `signInWithIdToken`). Apple users are team-scoped → TN3159 applies.
- Subscription state: **Superwall only** (`onSubscriptionStatusChange`). No server-side receipt validation.
- Push (APNs): **NOT used** (`expo-notifications` plugin intentionally not registered; no `aps-environment`). All APNs transfer steps are N/A.
- Edge function (`delete-account`): keyed on Supabase JWT `sub`, talks only to Supabase. **No transfer change needed.**
- **Sign in with Apple identity (from `docs/APPLE_JWT_ROTATION.md`):** current Team ID `OLDTEAMID00`, Key ID `8SVB695TG5`, **Services ID `com.kinderwell.app.auth`** (distinct from the app bundle ID), private key `AuthKey_8SVB695TG5.p8`. Supabase Apple provider uses a 180-day JWT built from these (expires ~2026-12-28).

**Sender account values (current):** Apple Team ID **`OLDTEAMID00`**.
**Recipient account values (The Account Holder):** Apple Team ID **`APPLETEAMID`** — the 10-char value labeled "Team ID" on his Users-and-Access page (screenshot-verified 2026-08-08). ⚠️ The number `ASCPROVIDERID` beside his name in App Store Connect is the *provider* ID and is used NOWHERE in this process — earlier drafts recorded it as the Team ID, which would have broken the transfer form, the TN3159 `target` parameter, AND the new provider-JWT `iss` in one stroke. Account Holder confirmed. Agreements/bank/tax all Active. **Small Business Program: NOT enrolled — see Phase 0.5.**

**Repo artifacts (single source of truth = this file + these):**
- `scripts/apple-transfer/` — the TN3159 user-migration scripts (generate + exchange + SQL emit). See § Phase 3.3 and that folder's `README.md`. **Built & tested, local only (not committed).**
- `scripts/generate_apple_jwt.js` + `docs/APPLE_JWT_ROTATION.md` — the Supabase Apple-provider JWT recipe, reused for the Phase 6 key regeneration under the new team.

---

## Open questions gating execution — ALL RESOLVED ✅

| # | Question | Status |
|---|---|---|
| ~~Q-SW~~ | Superwall: same org or new? API key change? Subscriber gating window? Key-swap timing? | ✅ **CLOSED 2026-08-03** (Ticket #21978, reply from Christo). See below + Phase 2. |
| ~~Q-TN~~ | TN3159 exact call params. | ✅ **CLOSED 2026-08-03.** Verified against TN3159 full text — `sub`+`target` to generate, `transfer_sub` to exchange, `user.migration` scope, ES256 client secret. See Phase 3. |

**Q-SW answers (verbatim intent, from Superwall support):**
1. **Keep the existing Superwall app/org** — do NOT move to a new owner's account. Just replace the App Store Connect API key + In-App Purchase key with ones generated in the recipient (the account holder's) account.
2. **Client-side Superwall API key does NOT change → NO app update needed.** The key is tied to your Superwall app, not App Store Connect.
3. **No gating window for existing subscribers.** Entitlement resolves on-device via StoreKit, tied to bundle ID + product IDs (both unchanged). Stale server-side keys only degrade **dashboard features** (product sync, revenue tracking) — **never user access.**
4. **Swap keys AFTER the transfer completes** (new account's keys can't be generated until then; old keys keep working until then). Worst case = a short analytics gap.
5. Housekeeping in the new account: **verify the App Store Server Notifications URL** (Apple doesn't guarantee it carries over — matters for revenue tracking) and **follow Apple's shared-secret flow** (share existing before, generate new after), then update Superwall keys.

**Consequences for this plan:**
- ✅ **No pre-transfer release is required, at all.** (Superwall key unchanged; the Phase 7 tripwire idea was already dropped in favor of the migration script's `.transferred` confirmation + existing PostHog/Sentry signals.) **Hold v1.3.0; transfer the app exactly as it is live now.**
- ✅ **Revenue is not at risk from the Superwall cutover** — user entitlement is independent of the server-side key swap. Only dashboard analytics/revenue reporting is briefly affected.

### Q-SIWA — RESOLVED BY PLAN, not by a support answer (case 20000127041328)

**Outcome:** Apple support was asked twice (Chandra, then Praveen). **Both replies answered the *keychain* question and did not give a usable answer on the *signing key*.** Chandra said only "JWT signed with a Sign in with Apple private key will be no problems" (ambiguous, no supporting doc, didn't address timing/overlap or reconfig). Praveen dropped the Sign-in-with-Apple question entirely and re-answered keychain + generic transfer criteria. Linked docs (TN2311 = keychain access groups; app-transfer-criteria; TestFlight overview) do **not** cover auth-token signing. → We stopped chasing an email answer and **routed around the uncertainty**:

**Decision:** treat "regenerate the Sign-in-with-Apple key under the new team + regenerate the provider JWT (`iss` = `APPLETEAMID`)" as a **MANDATORY Phase 6 step**, not optional. Rationale: it's ~15 min via `docs/APPLE_JWT_ROTATION.md`; if Apple's "no problems" was true it's a harmless refresh, if it was wrong it prevents a silent Apple-login outage. Correctness no longer depends on interpreting the support reply. **Empirical confirmation = the Phase 7 real-Apple-user smoke test.**

**Risk recalibration (2026-08-08, verified against Supabase's Apple-auth docs + `authService.ts`):** Kinderwell's only Apple flow is **native** `signInWithIdToken`. For the native flow Supabase does NOT use the provider's Secret Key at all — it validates the Apple-signed identity token against the provider's **Client IDs** list, which must contain the app's bundle ID `com.kinderwell.app`, and the bundle ID doesn't change in a transfer. The 180-day JWT only serves web-OAuth Apple sign-in, which the app doesn't use. So the specific fear behind Q-SIWA ("old-team JWT silently breaks all Apple logins") was overstated. The Phase 6 regeneration stays MANDATORY regardless: TN3159 Step B needs a new-team SIWA key anyway, the same key feeds the new provider JWT, and refreshing removes the ambiguity permanently. While in the Supabase dashboard, also verify **Client IDs** still lists `com.kinderwell.app` — that field, not the secret, is what native sign-ins actually check.

**Keychain (answered, confirmed twice + TN2311): NON-ISSUE for Kinderwell** — app doesn't store passwords/credentials in keychain (auth = Supabase session tokens). The one-time keychain loss triggers only on the next app update and only affects keychain-stored data, of which we have none.

---

*(Historical: Q-SIWA was submitted 2026-08-03 via Apple Developer → Contact Us → Development and Technical → APIs and Keys, case 20000127041328.)*

**What's already settled from Apple's docs (does NOT need the reply):**
- **(a) The Services ID transfers with the app.** Confirmed verbatim on the overview page: *"the associated Service ID transfers along with the app… If you don't want the Service ID to be transferred, remove its association before you start the transfer."* → Keep `com.kinderwell.app.auth` **attached**; it moves to the account holder's team.

**What's genuinely NOT in the docs (why we're asking):**
- **(b) Does the client-secret signing key survive the team change?** The Supabase Apple provider signs its JWT with key `8SVB695TG5`, created under team `OLDTEAMID00`, `iss = OLDTEAMID00`. The docs never state whether a JWT from the *old team's* key keeps validating tokens for an app now owned by the *new team*. The signing key is a **team-scoped credential** that (unlike the Services ID) does not "transfer." Strong inference: a **new key under the account holder's team + regenerated JWT (`iss = APPLETEAMID`)** will be required — but this is exactly the thing not to gamble on, hence Apple confirmation.

**Why it matters:** if the provider JWT isn't valid under the new team post-transfer, **new Apple sign-ins and returning-after-logout users fail silently** — the "Sign In Failed / find out via 1-star reviews" failure documented in `docs/APPLE_JWT_ROTATION.md`. This is SEPARATE from TN3159 (which migrates existing user *identities*); Q-SIWA is about keeping the *login mechanism* working under the new team.

**Exact question text submitted (for the record):**
> I'm transferring my app, Kinderwell (Bundle ID: `com.kinderwell.app`), to a different Apple Developer team using the App Store Connect app transfer process. The app uses Sign in with Apple, and my backend generates a client secret JWT signed with a Sign in with Apple private key created under my current team.
>
> I understand the app and its associated Services ID transfer to the new team. My questions are:
> 1. Once the app is owned by the new team, will a client secret JWT signed with my current team's Sign in with Apple key still work, or do I need to create a new key under the new team and regenerate the client secret?
> 2. If a new key is required, does the old key stop working immediately when the transfer completes, or is there any overlap? I want to avoid users being unable to sign in.
> 3. Is there anything else I need to reconfigure for Sign in with Apple or the Services ID under the new team to ensure logins continue working?

**⚠️ When the reply comes:** if it only says *"the Services ID transfers with the app"* without addressing the **signing key**, that's answering (a) when we asked (b) — push back with Q1 restated verbatim. Do not accept a Services-ID answer as an answer about the key.

**Interim working assumption (do NOT rely on until Q-SIWA confirmed):** after transfer, in the account holder's Apple account: (1) create a new Sign-in-with-Apple key + note Key ID, (2) confirm the Services ID `com.kinderwell.app.auth` is configured for `com.kinderwell.app` under the new team, (3) regenerate the Supabase Apple-provider JWT with the account holder's Team ID `APPLETEAMID` + new key (adapt `scripts/generate_apple_jwt.js`), (4) update the Secret Key in BOTH Supabase projects' Apple provider. Wired as an explicit Phase 6 step.

---

## § Third-party services audit (every SDK in package.json / eas.json)

Method: enumerated all `dependencies` + all `eas.json` env vars + all native capabilities in `app.config.js`. Each service classified by whether it is coupled to the **Apple developer account** (and therefore affected by the transfer) or only to its own service account (unaffected).

| Service | How it's wired | Coupled to Apple account? | Action required |
|---|---|---|---|
| **Superwall** (`expo-superwall`) | Client API key `pk_...` in build; ASC API key + IAP key in Superwall dashboard | **Yes** (ASC keys) | Post-transfer: swap ASC API key + IAP key (new account), verify ASC Server Notifications URL. Client key unchanged. Per Q-SW. **User access NOT affected.** |
| **Sign in with Apple** (`expo-apple-authentication`) | Native, `usesAppleSignIn: true`; Services ID `com.kinderwell.app.auth`; Supabase Apple provider holds the JWT | **Yes** (Team ID, key, Services ID) | TN3159 user migration (Phase 3) **+ Q-SIWA** auth-mechanism re-setup (Phase 6). Highest-touch item. |
| **Supabase** (`@supabase/supabase-js`) | URL + anon key in build; DB, auth, edge fn | **No** (own project) — EXCEPT the Apple provider config | Only change = Apple provider JWT/Services ID (via Q-SIWA). Core DB/URL/keys/edge-fn unchanged. Google provider unaffected. |
| **Google Sign-In** (`expo-auth-session` → Supabase OAuth) | Supabase-hosted Google OAuth; redirect `kinderwell://auth/callback` | **No** | None. Google client lives in Supabase/Google Cloud, not Apple. Verified: `signInWithGoogle` uses `supabase.auth.signInWithOAuth`, no Apple coupling. |
| **PostHog** (`posthog-react-native`, `@posthog/react-native-plugin`) | Project token + host in build | **No** | None. Token-based. Optionally share project access if analytics ownership should move. |
| **Sentry** (`@sentry/react-native`) | DSN in build (`oREDACTED00000000...`) | **No** | None. DSN-based. Optionally share org access. |
| **Apple IAP / StoreKit** (via Superwall) | Products `com.kinderwell.app.{monthly,annual}`, group `21909581` | **Yes** (moves with app) | Products transfer with the app automatically (same bundle/product IDs). App-specific shared secret flow (Phase 2). No product reconfig. |
| **APNs / Push** (`expo-notifications` installed) | **Plugin NOT registered**; no `aps-environment`; only local-notification *permission* read in `VBRemindersScreen` | **No** (not used) | **None.** All Apple-doc APNs steps N/A. (Re-confirm if BACKLOG #13 notifications ships before transfer.) |
| **EAS / Expo Build** (`eas.json`) | Cloud builds; manages iOS signing credentials (dist cert, provisioning profiles) tied to the Apple account | **Yes** (signing creds) | After transfer, the **next EAS build** must use credentials from the **new** Apple team: new distribution cert + provisioning profiles for `com.kinderwell.app` under Team `APPLETEAMID`. Not needed until you next build — but required before any post-transfer release. See Phase 6. |
| expo-store-review, expo-linear-gradient, expo-haptics, fonts, nav, zod, zustand, reanimated, svg, etc. | Pure client libs | **No** | None. |

**Also flagged (not transfer-blocking, but true):**
- `eas.json` stores live Supabase/Superwall/PostHog/Sentry secrets in plaintext and is tracked in git. Pre-existing; owner-only per CLAUDE.md. Not changed here. Worth rotating/moving to EAS secrets independently of this transfer.
- Android: `app.config.js` sets an Android package but **no Play listing exists — owner confirmed 2026-08-08; this transfer is iOS App Store only.** If Android ever ships under the account holder it starts fresh in his own Play Console; nothing to transfer.

---

## Phase 0 — Recipient account readiness ✅ COMPLETE

Verified from The Account Holder's Business → Agreements screen (2026-08-03):

- [x] Apple Developer Program enrolled (Team ID `APPLETEAMID`)
- [x] Free Apps Agreement — Active
- [x] Paid Apps Agreement — Active
- [x] Bank account — IDFC First Bank (9886), Active
- [x] Tax forms — W-8BEN + Certificate of Foreign Status, Active
- [x] Digital Services Act compliance — Active
- [x] Account Holder confirmed (The Account Holder)

**Nothing outstanding in Phase 0 itself — but see Phase 0.5 (found 2026-08-08): one enrollment + one timing decision now gate initiation.**

---

## Phase 0.5 — Small Business Program (15% vs 30% commission) — ⚠️ NEW GATE, decide before initiating

**Found in the 2026-08-08 re-audit; absent from all earlier drafts.** Your (sender) account is enrolled in the App Store Small Business Program (OPS_STATE: "ENROLLED") — that's why Apple's cut is 15%, not 30%. **Enrollment is per-account and does NOT transfer with the app.** If Kinderwell moves to the account holder's un-enrolled account, every sale attributed to him bills at the standard 30% until his own enrollment takes effect — a straight ~17.6% cut in net revenue for that window (85¢ on the dollar → 70¢).

**Verified rules ([Small Business Program](https://developer.apple.com/app-store/small-business-program/), re-read 2026-08-08):**
- App transfers are allowed and don't disqualify either account. When an app transfers, its proceeds for the calendar year count toward **all** accounts that initiated or accepted the transfer — so Kinderwell's 2026 proceeds count toward the account holder's $1M eligibility test (far below it; non-issue).
- Brand-new accounts with no sales history are eligible. The Account Holder enrolls; the latest Paid Apps agreement must be accepted (the account holder: Active ✅).
- **The 15% rate takes effect 15 days after the end of the FISCAL month in which enrollment is approved** — not immediately. Apple's own example: approved Feb 10 → reduced rate starts Mar 14.
- Enrollment asks for **Associated Developer Accounts** (>50% ownership or "ultimate decision-making authority"). Since the owner operates both accounts, declare the association with your account in the account holder's enrollment. Combined proceeds stay far under $1M so it costs nothing — and an incomplete declaration is the one thing that could retroactively void his 15%.
- Subscriptions already past their first year renew at 15% regardless of the program — but Kinderwell's subscriber base is younger than a year, so effectively **all** current revenue is exposed to this rate difference.

**Action (enrollment needs no app in the account):**
- [x] **the account holder's account APPLIED to SBP (2026-08-08) — awaiting Apple approval.** Confirm the Associated Developer Accounts declaration (the owner's account) was included in that application; an incomplete declaration is the one thing that could retroactively void his 15%.
- [ ] When the approval email arrives: note his **15% effective date** (15 days after the end of the fiscal month of approval — check ASC → Payments and Financial Reports fiscal calendar). Record it here: **15% effective: ______**

**RESOLVED 2026-08-21 — no commission gap. the account holder's 15% is ALREADY EFFECTIVE.**

Apple's "Welcome to the App Store Small Business Program" email to the account holder (dated **2026-08-15**) states, present tense: *"The commission rate on your paid apps and in-app purchases **is now 15%**."* → The reduced rate is live on his account NOW, before the transfer. (Earlier estimate of a ~mid-September effective date was too conservative — superseded by this email.)

**Consequence:** the entire reason Option A had a cost is gone. Transfer now → every sale attributed to the account holder bills at **15% from completion**. Tax-year goal AND zero commission penalty. The same email also confirms app transfers are SBP-compatible (*"proceeds for the calendar year will be associated with all accounts that initiate or accept the transfer"*) — matching this phase's assumption.

| Option | Status |
|---|---|
| **A. Transfer now** | ✅ **CHOSEN & now cost-free** — 15% already effective, so no 30% gap. |
| B. Wait for his 15% to be effective | Moot — it already is. |

**⚠️ Two things the tax-motivated choice makes worth confirming (not code — for the owner):**
- The transfer moves **payouts (to the account holder's bank), legal ownership, and the tax liability/benefit** to the account holder for real. Confirm this cross-person income shift is intended and, ideally, cleared with whoever handles the taxes — this runbook can't advise on tax.
- **Quantify the gap once:** `~0.176 × (weekly App Store proceeds) × (weeks until his 15% is effective)` = the revenue cost of going now. Sanity-check it's smaller than the tax benefit. If yes (expected), proceed.

**Reconcile later:** once his 15% effective date is known, any post-transfer sales before that date were at 30% — expected, not a bug.

---

## Phase 1 — Sender-side pre-flight (your account)

Cross-checked against **every** blocking criterion in [App transfer criteria](https://developer.apple.com/help/app-store-connect/transfer-an-app/app-transfer-criteria/):

| Criterion | Required | Kinderwell | Status |
|---|---|---|---|
| Accounts not pending/changing | Both stable | Both stable | ✅ |
| Latest paid + free agreements accepted | Both sides | Both Active | ✅ |
| EU Alternative Terms Addendum match | Only if sender signed it | Not signed | ✅ N/A |
| ≥1 version released to App Store | Yes | 1.2.0 live | ✅ |
| Not available for pre-order | Yes | Never used | ✅ |
| App status not in review/pending set | Ready for Distribution | 1.2.0 Ready for Distribution | ✅ |
| All IAP products in allowed status | Approved/Ready/Removed/Rejected | Both **Approved** | ✅ |
| No asset packs in review | — | None used | ✅ N/A |
| No IAP product-ID collision in recipient acct | Yes | Recipient has no apps | ✅ |
| Not macOS sandbox w/ shared group | Yes | iOS only | ✅ N/A |
| Not Apple Arcade | Yes | No | ✅ |

**Action items in this phase:**

- [x] **TestFlight cleared** — all builds Expired, all tester groups deleted (Homies internal/external, Team Expo), Test Information fields mostly empty.
- [ ] **Blank the two placeholder URLs (`http://example.com`) still in Test Information** — upgraded from optional 2026-08-08: Apple's overview page instructs to *"clear each information field under Test Information for every localization"* before transfer. 60 seconds of work; removes any chance the criteria check or transfer processing trips on leftovers.
- [ ] ⛔ **DO NOT submit v1.3.0** (or any build) for review until the transfer is fully complete. A build in *Waiting for Review / In Review / Pending* status **blocks the transfer.** Hold the release branch. *(No pre-transfer release is needed — the tripwire idea was dropped; see Phase 7.)*
- [x] **Backups: NOT NEEDED (decided 2026-08-21).** Because the owner operates BOTH accounts, no data is actually lost — it just lands in one login or the other:
  - **App Analytics** (impressions, downloads, retention) → transfers to the account holder's account (full history back to launch). Accessible via his login. *(May take up to ~2 days post-completion to repopulate — not lost, just delayed.)*
  - **Sales & Trends (pre-transfer)** → stays in the OLD account. Accessible via the owner's login. (the account holder's account only shows sales from completion onward.)
  - So nothing to screenshot/export. App metadata / IAP config / pricing all transfer with the app and remain visible in the account holder's account. *(Nominations, app-bundle history, promo codes: N/A for Kinderwell.)*
- [ ] **Account tails (sender-side — protects the money and the migration window):**
  - Your Developer Program **membership must stay active through the whole TN3159 window** — the mop-up generate passes and the transfer-back recovery path both need the old team alive. Check the renewal date; if it lands inside the next ~3 months, renew early.
  - **Keep your bank/tax/agreements untouched until the final pre-transfer payout lands.** Apple pays out roughly a month after each fiscal month closes, so the last payment for pre-transfer sales arrives on the old account weeks after completion.
- [ ] **Side-state sweep (all expected clean, ~5 min):** ASC → Users and Access → Integrations → **Webhooks** — webhooks transfer with the app; none expected, delete any strays before initiating. Same area → **OS data transfer / Android app IDs** — none expected. **Xcode Cloud** — never used (EAS builds); nothing to remove. Apple Pay merchant IDs / Wallet passes / Game Center / CloudKit / EU alternative marketplaces / pre-order / Apple-hosted asset packs: all N/A for Kinderwell (checked against the overview page 2026-08-08).

---

## Phase 2 — Superwall (subscription continuity) — RESOLVED, cutover is post-transfer

**Why this phase exists:** Superwall is the only source of entitlement (`onSubscriptionStatusChange`). **Per Superwall support (Q-SW): existing subscribers' access is resolved on-device via StoreKit and is INDEPENDENT of the server-side keys.** So a wrong/stale key swap degrades only dashboard analytics/revenue tracking — it cannot hard-gate paying users. This removes the "silent revenue failure" fear for the Superwall side.

**Plan (confirmed):** keep the existing Superwall app/org; client-side API key is unchanged (no app update); swap the App Store Connect keys **after** the transfer completes.

*(Scope note 2026-08-08: Superwall's public "how to transfer app to a new owner" FAQ describes moving the **Superwall account** itself to a different owner via support — a different scenario. Our plan — keep the org, swap the ASC keys — is from Superwall support ticket #21978 (Q-SW above), which is the authoritative answer for this transfer. Don't "correct" this plan from the FAQ.)*

**Now (before/independent of transfer):**
- [ ] **Generate the app-specific shared secret** — App Store Connect → Kinderwell → App Information → *App-Specific Shared Secret* → Manage → Generate. Share it with the recipient side before initiating. *(Recipient generates a NEW one post-transfer to revoke the shared one.)*

**After transfer completes (Phase 6):**
- [ ] Generate fresh **App Store Connect API key** (P8, Key ID, Issuer ID) and **In-App Purchase key** (P8, Key ID, Issuer ID, Bundle ID) in **the account holder's** account (Users and Access → Integrations → In-App Purchase for the Issuer ID).
- [ ] Replace both keys in **Superwall → Settings** (same Superwall app; API key stays the same).
- [ ] **Verify the App Store Server Notifications URL** in the new App Store Connect account — Apple does NOT guarantee it carries over; required for revenue tracking.
- [ ] After the new shared secret is generated, update Superwall keys to minimize the revenue-tracking gap.

*Nothing here blocks initiating the transfer, and none of it affects user entitlement — it's analytics/revenue-reporting hygiene done post-transfer.*

---

## Phase 3 — Sign in with Apple user migration (TN3159) — HIGHEST RISK

**Why this is the most dangerous phase:** Apple user identifiers (`sub`) are **team-scoped**. the account holder's account is a different team. Without migration, every existing Apple user gets a **new** `sub` on next sign-in → Supabase treats them as a brand-new user → **orphaned profile + lost subscription link**. And critically: **the sign-in still succeeds**, so nothing errors — it is a silent failure. ~2k+ users, paying subscribers among them. Manual handling is not viable; this is a scripted migration.

**Verified against TN3159 full text (2026-08-03) — three facts that materially de-risk this phase:**
- **The migration endpoints stay active for BOTH teams for the entire 60-day window** — *including generation by Team A after the transfer completes.* Quote: *"You may obtain access tokens and generate and/or exchange transfer identifiers during this time."* → You are NOT racing a snapshot deadline at the moment of completion. See 3.2.
- **"There is also no rate limiting for this endpoint"** (stated verbatim, twice). At 2k+ users, no throttling logic needed. Batch freely.
- **There is a positive per-user success check:** after exchange, the user's credential state reads `.transferred`. This is a *server-side confirmation of success*, which is why no client-side tripwire / pre-transfer release is needed (see Phase 7).

### 3.1 The mechanism (VERIFIED verbatim against TN3159)

**"Team A" = your current account. "Team B" = the account holder's account (Team ID `APPLETEAMID`).**

Every call uses a **client-credentials access token** scoped `user.migration`, obtained per team:
```
POST https://appleid.apple.com/auth/token
  grant_type=client_credentials
  scope=user.migration
  client_id={CLIENT_ID}          # the app's App ID / bundle ID, or Services ID
  client_secret={ES256 JWT issued by the acting team}
```
**client_secret JWT** (ES256): header `{alg:ES256, kid:<key id>}`; payload `{iss:<acting team id>, sub:<client id>, aud:"https://appleid.apple.com", iat, exp}`, signed with that team's Sign-in-with-Apple **p8 key**. (See Apple "Creating a client secret".)

**Step A — Team A (you) generates a transfer identifier per user:**
```
POST https://appleid.apple.com/auth/usermigrationinfo
Authorization: Bearer {ACCESS_TOKEN_FOR_TEAM_A}
Content-Type: application/x-www-form-urlencoded

sub={EXISTING_USER_ID_FOR_TEAM_A}&target={APPLETEAMID}&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET_ISSUED_BY_TEAM_A}
```
Returns a `transfer_sub` for that user. **Store every `transfer_sub` keyed to the Supabase user.** This is the bridge across the transfer.

**Step B — Team B (the account holder) exchanges transfer_sub for the new sub + email (after transfer + up to 24h):**
```
POST https://appleid.apple.com/auth/usermigrationinfo
Authorization: Bearer {ACCESS_TOKEN_FOR_TEAM_B}
Content-Type: application/x-www-form-urlencoded

transfer_sub={TRANSFER_ID_FROM_TEAM_A}&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET_ISSUED_BY_TEAM_B}
```
Returns:
```json
{ "sub":"<new team-B-scoped sub>", "email":"...@privaterelay.appleid.com", "is_private_email":true }
```
Then **write the new `sub` into Supabase** so the user's auth identity resolves to their existing row.

**Step C — confirm:** the migrated user's credential state should read `.transferred`. This is the authoritative per-user success signal.

### 3.2 Timing — the 60-day window (corrected)

- **60-day window** — TN3159 (re-verified verbatim 2026-08-08 via Apple's JSON doc API): the period runs *"from the date you complete the app transfer."* We still treat **initiation** as the clock start — pure safety margin.
- Both teams' endpoints are active for the **whole** window. **Team A can still GENERATE transfer IDs after the transfer completes**, so late/window signups are not lost — just include them in a later generate pass while inside 60 days. **This closes the "snapshot gap" that earlier drafts worried about.**
- **Up to 24h** after completion before Apple's Sign-in-with-Apple config is ready for Step B / new-team auth. *(From the 2026-08-03 full-text TN3159 read; the 2026-08-08 JSON re-extraction couldn't relocate the sentence — kept anyway: waiting costs a few hours and avoids early-fail noise. If Step B 400s right after completion, this is why — wait and re-run.)* Confirmed from the recipient-side doc: Team B's `user.migration` access tokens live **3600 s** (the scripts already re-mint on expiry).
- **If you miss 60 days:** transfer the app **back** to Team A, re-prepare, and re-transfer (TN3159 documents this recovery). Annoying round-trip, not permanent data loss.

### 3.3 The scripts — BUILT & tested (`scripts/apple-transfer/`)

The migration tooling is written and unit-tested (2026-08-08; local only, not committed per owner's choice). **Full operational how-to lives in [`scripts/apple-transfer/README.md`](../scripts/apple-transfer/README.md)** — this runbook links to it rather than duplicating the command lines.

| File | Role |
|---|---|
| `scripts/apple-transfer/_apple.js` | Shared helpers — ES256 client-secret JWT (same mechanism as `scripts/generate_apple_jwt.js`), `user.migration` access token, generate/exchange calls. All identity values from env; nothing hardcoded. |
| `scripts/apple-transfer/1-generate.js` | **Step A** (old team). Reads Apple users from Supabase (`auth.admin.listUsers`, paged), mints a `transfer_sub` per user → `migration-bridge.json`. Read-only on the DB. Resumable, per-user logged. |
| `scripts/apple-transfer/2-exchange.js` | **Step B** (new team). Exchanges each `transfer_sub` → new `sub`, then **emits a reviewable `apply-migration.sql`**. Does NOT touch the DB. |
| `scripts/apple-transfer/README.md` | Env vars, dev-first test loop, exact run commands, apply/rollback instructions. |
| `scripts/apple-transfer/.gitignore` | Keeps `migration-bridge.json` + `apply-migration.sql` (real user IDs) out of git. |

**Design guarantees (why this is safe):**
- The one irreversible step is **yours to run, not the script's**: exchange writes SQL; you review its sanity header (row count + duplicate-sub check) and apply deliberately. The SQL file is wrapped `BEGIN; … ROLLBACK;` — an accidental `\i` is a no-op until you swap `ROLLBACK` → `COMMIT`.
- The SQL only repoints `auth.identities.provider_id` (+ `identity_data.sub`) from old→new Apple sub. **`auth.users.id` (UUID) never changes** → `user_profiles` / `lesson_progress` (keyed on the UUID) stay intact automatically. This is the mechanism by which subscribers keep their accounts.
- Resumable + per-user logged (re-run retries only failures). No rate-limit backoff (TN3159 confirms none). Re-mints the access token if it expires mid-run.
- `jsonwebtoken` is installed transiently (`npm install --no-save jsonwebtoken`, matching `generate_apple_jwt.js`) — deliberately NOT a project dependency (keeps a crypto lib out of the app bundle).
- `_apple.js` hard-fails if any `*_TEAM_ID` env is provider-ID-shaped (all digits) instead of a real 10-char Team ID — the exact mixup caught in the 2026-08-08 review (`ASCPROVIDERID` vs `APPLETEAMID`).

- [x] Q-TN closed — calls verified against TN3159.
- [x] Generate + exchange scripts built and syntax/logic-tested (SQL escaping, resumability, pending=0 re-emit all verified).

### 3.3.1 ⛔ Pre-flight verification gate (DO before trusting the SQL on prod)

The write-back assumes Supabase stores the Apple `sub` in **`auth.identities.provider_id`** (and mirrored in `identity_data.sub`). This is Supabase's standard/documented shape but was **NOT verified against the live DB** (per env-safety rule, the CLI was not linked to prod). **Confirm on DEV first:**

- [x] **VERIFIED 2026-08-21 against PROD** (`prodprojectref00000x`; dev had no Apple users so the shape was confirmed on prod — a read-only `SELECT`, safe). Result: `provider_id` holds the Apple sub (`000069.7e13…1700` format) AND `identity_data->>'sub'` holds the identical value, for all sampled Apple users. → The `2-exchange.js` `buildSql` template (repoints both `provider_id` and `identity_data.sub`) is CORRECT as written. No adjustment needed.
- [x] **User-count reconciliation (2026-08-21) — 3,775 Apple users confirmed complete, none filtered out:** `auth.identities` breakdown = apple **3,775**, google **1,459** (total 5,234 rows); dual apple+google users = **4** → 5,230 distinct users; `public.user_profiles` = 5,198 (32 auth users without a finished profile — normal, irrelevant to migration). The `provider='apple'` filter correctly selects ONLY the Apple subset needing migration; Google users are unaffected. The 4 dual-identity users migrate correctly (Apple sub repointed, Google identity untouched).
- [x] **Fetch method changed to CSV (Option A) — no DB helper, no service-role key.** `auth.admin.listUsers()` returns empty identities on this Supabase version (verified), and the auth schema isn't PostgREST-exposed. Per Supabase guidance (auth data via SQL), `1-generate.js` now reads a CSV exported from the SQL editor. **Export gotcha:** the SQL-editor *download* caps at the 100-row display limit — adding `limit 5000` to the query forces the full 3,775-row export (verified: 3,775 data rows in the downloaded file). Export query: `select i.user_id, i.provider_id, u.email from auth.identities i join auth.users u on u.id=i.user_id where i.provider='apple' limit 5000;`
- [ ] **Full dev dry-run + live run** of `1-generate.js` against dev (`devprojectref000000x`) with a throwaway Apple account (see README). This validates the Supabase read + generate call + SQL shape end-to-end. (Step B's real exchange can only be validated during an actual transfer window.)

### 3.3.2 Execution passes (order)

- [ ] **Generate pass** — run `1-generate.js` at/after you initiate the transfer (Phase 4).
- [ ] **Mop-up generate pass** — re-run `1-generate.js` any time within the 60-day window to pick up users who signed in during/after the transfer (the generate endpoint stays active the whole window).
- [ ] **Exchange pass** — after completion + 24h, run `2-exchange.js` (needs the NEW team's SIWA key from Phase 6), review `apply-migration.sql`, apply it deliberately.
- [ ] **Confirm** — spot-check a migrated user's credential state reads `.transferred`; run the Phase 7 real-subscriber smoke test.

### 3.4 Email backstop (belt-and-suspenders, optional) — and its one blind spot

The 60-day generate window + `.transferred` confirmation make this largely redundant, but as defense in depth: if an Apple sign-in post-transfer ever produces a **new `sub` but an email that already exists** in Supabase, match on email and update the `sub` rather than creating a new user. Respect the no-PII rule (never send email to PostHog/Sentry).

**Known blind spot (2026-08-08, from Apple's recipient-side doc):** Hide-My-Email users can't be rescued this way. Private-relay addresses are **team-scoped** — the exchange response's `email` field is *"the private email address specific to the recipient team,"* i.e. a DIFFERENT relay address than the one stored today (the bridge records it as `new_email`). Old relay ≠ new relay, so an email match fails exactly for those users; they are covered ONLY by the TN3159 bridge — one more reason the generate pass must cover everyone. Related facts, harmless today but worth knowing: after the transfer the old team *"can no longer communicate with users at their private email addresses,"* and relay users' stored `auth.users.email` values go stale. Kinderwell sends no email to Apple users (native sign-in; no magic links or marketing), so no action — do NOT bulk-rewrite emails; if email is ever added later, register the sending domains under the new team's Sign-in-with-Apple email sources first.

---

> **⏱️ EXECUTION LOG — Transfer INITIATED 2026-08-21 ~18:55 IST.** Recipient: The Account Holder, `owner-account@example.com`, Team ID `APPLETEAMID`. App status → "Waiting for Recipient." 60-day TN3159 window + transfer-agreement clock start now. At-initiate blockers hit & cleared: (1) Main Agreements needed re-accepting; (2) 3 TestFlight testers still present + 2 Test-Information placeholder URLs — testers deleted (last shows "Deleted" which Apple allows) + URLs blanked. Next: accept from the account holder → run real `1-generate.js`.

## Phase 4 — Initiate the transfer (you, Account Holder)

**Prerequisites (all must be true):** Phase 0 ✅, **Phase 0.5 resolved ✅ (the account holder's SBP 15% already effective per Apple 2026-08-15 email — no commission gap)**, Phase 1 done (TestFlight cleared **including the Test Information placeholders**, no build in review, account tails checked, side-state sweep clean), Q-SW resolved ✅, § 3.3.1 dev verification gate passed ⛔, app-specific shared secret generated & shared with recipient, TN3159 generation pass ready to run.

1. App Store Connect → **Apps** → Kinderwell → **App Information** (under General) → scroll to **Additional Information**.
2. Click **Transfer App** (may prompt for 2FA).
3. Criteria check → **Continue** (fix & retry if it flags anything).
4. Enter recipient **Apple Account (the account holder's Account Holder email)** + **Team ID `APPLETEAMID`** → **Continue**.
5. Read agreement → check "I have read and agree…" → **Request Transfer** → **Done**.

**Immediately after initiating:**
- [ ] **Run the TN3159 initial generation pass** (Step A) — the 60-day clock starts NOW.
- App enters **"Pending App Transfer" / "Waiting for Recipient."**
- Sender **cannot edit** metadata, pricing, availability, or IAPs while pending. Open App Review comms close.
- **Cancel** (either party) while waiting: Business → Agreements → App Transfers → Cancel Transfer / Decline.
- **Expires in 60 days** if not accepted.

---

> **⏱️ EXECUTION LOG — Transfer ACCEPTED 2026-08-21 ~19:00 IST (Execution Date).** Accepted from the account holder's account; App Transfers status → **Active**. App Privacy = "Keep existing responses." Metadata entered (Support + Privacy URLs, the account holder as review contact). Now processing (up to 2 business days). Sales attribute to the account holder @ 15% from now. **NEXT: run real `1-generate.js` (drop --dry-run) to mint 3,775 transfer_subs — do now, within the 60-day window.**

## Phase 5 — Accept the transfer (the account holder's account, his Account Holder login)

1. Sign in to App Store Connect as the account holder → notice that an app is ready to transfer.
2. **Business** → **Agreements** → under **App Transfers** click **Review**.
3. **Enter metadata (all required):**
   - Support URL
   - Marketing URL (required if the app previously had one)
   - Privacy Policy URL (required if the app previously had one)
   - App Review contact information
   - App Store contact information
   - *(Current URLs point at `mandeepv.github.io/kinderwell-legal` — fine to keep, no functional change. Decide if you want them on a different domain later.)*
4. **User Access** — all team vs Admin/Finance only (can narrow later).
5. **App Privacy** — View Existing Details / complete the questionnaire before submitting a new version.
6. Read terms → check the box → **Accept**.

- [ ] **Run the TN3159 final reconciliation pass** (Step A for any Apple users who signed up during the pending window) just before / at acceptance.

---

> **⏱️ EXECUTION LOG — TN3159 generate COMPLETE 2026-08-21 ~19:15 IST. All 3,775 transfer_subs minted (first pass 3,766 + retry 9 = 3,775, failed=0).** Bridge file: `scripts/apple-transfer/migration-bridge.json`. Transfer completed DURING the run (old account now shows "No App"; Kinderwell live in the account holder's account, no pending banner) — old-team generate credentials stayed valid through the window (9 stragglers succeeded on retry).

> **⏱️ EXECUTION LOG — Cutover progress 2026-08-21 ~20:00–21:15 IST:**
> - **New SIWA key created under the account holder's team:** Key ID `APPLEKEYID0`, `.p8` on Desktop. Services ID `com.kinderwell.app.auth` confirmed transferred to team `APPLETEAMID` (visible in the key's grouped App IDs). `scripts/generate_apple_jwt.js` updated (TEAM_ID→APPLETEAMID, KEY_ID→APPLEKEYID0, CLIENT_ID unchanged). New provider JWT generated + pasted into **both** Supabase projects' Apple provider Secret Key (prod `prodprojectref00000x`, dev `devprojectref000000x`). Client IDs field still lists `com.kinderwell.app`.
> - **`2-exchange.js` COMPLETE — all 3,775 exchanged, failed=0** (took 3 passes: 3,734 → +39 → +2; script patched to retry `exchange_failed` status, not just `generated`). Apple SIWA config had already propagated (exchange worked immediately — no 24h wait needed).
> - **Apply SQL — hit a collision on the first (unguarded) test run.** psql test (file ends in ROLLBACK, so DB untouched) aborted on `identities_provider_id_provider_unique`. Root cause: **5 users signed in with Apple DURING the transfer window** (DB now has 3,780 apple identities vs our 3,775 CSV). Exactly **1** of those caused a real collision: user `9c027738` (pre-transfer, Jun 27) re-signed-in today 13:44 → Apple created a 2nd new-team account `dd7b7f5e` holding the exact new_sub our migration wanted for the old row. Both accounts have 0 lesson rows → negligible impact; the user is fine (uses the new account `dd7b7f5e`, which works; subscription is Apple-account-level, not row-level). Old row `9c027738` becomes an orphaned empty shell (optional cleanup later).
> - **FIX:** `3-build-safe-sql.js` regenerates `apply-migration.sql` with a per-statement **collision guard** (`AND NOT EXISTS (another apple identity already holding the new_sub for a different user)`) — colliding rows are SKIPPED (UPDATE 0), never overwritten. Verified within-set new_subs are all distinct; only out-of-set (window-signup) collisions exist. Expected apply result: ~3,774 UPDATE 1 + 1 UPDATE 0, no errors.
> - **✅ SQL APPLIED & COMMITTED 2026-08-21 ~21:25 IST.** Guarded batched TEST passed clean (8/8 batches, 0 errors, ROLLBACK). Real apply via `apply-migration-COMMIT.sql` — ONE atomic transaction, `ON_ERROR_STOP`, 3,775 guarded UPDATEs — printed `=== COMMITTED — migration applied ===`, no errors. **VERIFIED:** spot-check user (old sub `000069.7e13…1700`) now shows `provider_id` AND `identity_data->>'sub'` = new sub `000069.e251…1439`. apple identity count 3,781 and rising (live signups) — none lost/duplicated. The 3,774 migrated; 1 collision (`9c027738`) skipped by guard as designed. **HIGH-RISK / IRREVERSIBLE WORK IS DONE AND PROVEN.**
>
> **REMAINING — all safe (no DB writes), NOT urgent, can defer/do relaxed:**
> 1. **Superwall** — swap App Store Connect API key + In-App Purchase key to the account holder's account; verify App Store Server Notifications URL. (Subscriptions keep working regardless — StoreKit/on-device.)
> 2. **New app-specific shared secret** on the account holder's account (retires the pre-transfer one).
> 3. **Smoke test** — fresh Apple sign-in to confirm auth works under the new team (+ the DB spot-check above = proof; no pre-existing test account was available).
> 4. **Later/optional:** EAS iOS signing under new team (before next release); clean up orphaned row `9c027738`; note the window-signup users (DB apple count > 3,775 migrated — the extras signed in during the window and are already correctly on the new team).
>
> Files: `apply-migration-COMMIT.sql` (the one applied), `apply-migration.sql` (guarded source), `apply-migration-TEST.sql` (batched test). Bridge backup: `~/Desktop/kinderwell-migration-bridge-BACKUP-2026-08-21.json`. Session ID: `885d3538-774c-4609-bb35-37a0c11a5927`.

> **✅✅ TRANSFER COMPLETE 2026-08-21 ~22:20 IST — all verified.**
> - **Superwall cutover DONE:** Revenue Tracking → App Store Connect API key (`WF7WWBZHZN`) + In-App Purchase key (`824C9LPD38`), both Issuer `ab668f47-84d1-4206-8444-9c99c670e4d8`, both `.p8`s uploaded, all "Update" clicked. SBP Start Date `15/08/2026` set. **Public API key `pk_SUPERWALL_KEY_REDACTED` UNCHANGED → no app update needed** (confirmed on the Keys page). Production Server Notifications URL confirmed set to the Superwall webhook (survived/re-set).
> - **New app-specific shared secret** regenerated under the account holder's account (retires the pre-transfer one; vestigial for Kinderwell — no server-side receipt validation — but done for hygiene).
> - **SMOKE TEST PASSED (live, real device):** fresh Apple sign-up on iPhone → succeeded → reached the paywall (Superwall working) → new row created in Users table. End-to-end proof: app → Apple (team `APPLETEAMID`) → Supabase → Superwall all functioning under the new account.
>
> **DONE. Only optional/later items remain:** EAS iOS signing under the new team (before the NEXT app release — not needed now); optional cleanup of orphaned row `9c027738`; rotate the prod Supabase secret key if desired (shown in a terminal during setup). Nothing functional outstanding.

> **✅ FULL-SCALE MIGRATION VERIFICATION (DB, read-only) 2026-08-21 ~22:35 IST** — via `verify-migration.sql` (cross-references all 3,775 bridge mappings against live prod). Results: **CHECK1** no duplicate apple provider_ids (0). **CHECK2** no orphan identities (0). **CHECK3** provider_id == identity_data.sub on all 3,782 apple rows, 0 mismatch. **CHECK4 (definitive):** of our 3,775 mapped users → **on_new_sub = 3,774**, still_on_old = 1 (the deliberately-skipped collision `9c027738`), user_row_gone = 0 → nobody lost. **CHECK5:** sampled migrated users have profiles intact + on_new_sub=true (one had has_profile=0 = pre-existing never-onboarded user `ed910cd9`, not migration-caused). → **Existing-user migration proven correct at scale** (couldn't do a live old-user login — no pre-existing test account — but this DB proof covers all 3,774 at once, stronger than a single login). Combined with the live new-signup smoke test, both auth paths confirmed.

> **✅ POST-TRANSFER CLEANUP DONE 2026-08-21 ~22:50 IST:**
> - **Orphan account deleted:** `9c027738` (the skipped-collision old account, abandoned since Jun 27, 0 lessons) removed via `cleanup-orphan.sql` (transactional: DELETE 0 lesson_progress / 1 user_profiles / 1 auth.users → cascaded identity; verified remaining=0, real account `dd7b7f5e` intact=1). Tested with ROLLBACK first, then COMMIT.
> - **EAS iOS credentials rebuilt under new team `APPLETEAMID`:** `eas.json` `appleTeamId` OLDTEAMID00→APPLETEAMID (ascAppId APPLEAPPID unchanged). Via `eas credentials` (logged in as the account holder): new **Distribution Certificate** (serial 7412C9D9…, exp Aug 2027), new **Provisioning Profile** (2TZRY873XN), new **App Store Connect API Key for EAS Submit** — all under team APPLETEAMID. **Release path fully on new team.**
> - **Push Key ALSO regenerated under new team `APPLETEAMID`** (2026-08-21 ~23:00) — proactively, in case push is added later, so it's pre-wired. (App still doesn't use push today — `aps-environment` not requested — so it's dormant but ready.)
> - **Only Ad Hoc cert+profile remain on old team** — test-device builds only, can't be pre-created via `eas credentials` (regenerates on the next ad-hoc build). Does not affect App Store releases or users. Genuinely nothing to do.
>
> **🏁 CORE MIGRATION COMPLETE & VERIFIED.** (User declined the optional Supabase secret-key rotation.)

> **⏱️ POST-COMPLETION REVIEW + WINDOW-GAP CHECK 2026-08-24.** A follow-up review flagged that the earlier "nothing outstanding" was overstated. Actioned:
> - **Window-signup gap CHECKED & CLEAR:** CSV exported ~18:47 IST, transfer completed ~19:14 IST → any first-ever Apple sign-in in that gap would be in neither CSV nor bridge (classic TN3159 sliver). `window-signup-check.sql` (read-only; excludes all 7,550 known old+new subs; window 13:10–13:50 UTC) returned **0 rows**. → No orphans, no mop-up needed. (Earlier claim "the extras are already on the new team" was only verified for the 1 collision user; now verified empty for the whole window.)
> - **Security: `scripts/apple-transfer/.gitignore` hardened** — the run produced identifier-bearing files beyond the 2 originally ignored (`apple-users.csv` = 3,775 user_id+sub+email; `apply-migration-{COMMIT,TEST}.sql`; find-collisions/verify/inspect/cleanup `.sql`). Added `*.csv` + `*.sql` so a `git add -A` can't leak them (repo has a prior secret-leak history per OPS_STATE).
>
> **STILL OPEN (tracked here so it isn't lost) — none threaten users/revenue today:**
> - **Deadlines to calendar:** ~**Oct 20 2026** 60-day TN3159 window closes (recovery deadline; keep the owner's Apple membership active past it); ~**Feb 17 2027** the new Supabase Apple-provider JWT expires (logins break silently if missed — rotate via `generate_apple_jwt.js`, already updated to new team/key `APPLEKEYID0`); ~**early Oct 2026** final pre-transfer payout lands on old account (don't touch old bank/tax till then).
> - **Custody:** move the 2 `.p8` keys + `~/Desktop/kinderwell-migration-bridge-BACKUP-*.json` off Desktop into a password manager; delete CSV/SQL/bridge after the 60-day window.
> - **Phase 7 monitoring (this week, from existing data):** build PostHog insight (Apple `auth_succeeded` volume + new-person rate among Apple sign-ins + paywall-presentation rate); confirm first organic post-transfer purchase attributes to the account holder @15%; 2-min Google-user smoke test; check App Analytics repopulated in the account holder's acct (~Aug 23+).
> - **Stale docs (Phase 6 step 8, not done):** `APPLE_JWT_ROTATION.md` (new team `APPLETEAMID`, Key ID `APPLEKEYID0`, expiry ~2027-02-17); `OPS_STATE.md` ASC section + SBP row (add the account holder, effective 15/08/2026); `RELEASE_CHECKLIST.md` + `docs/releases/v1.3.0.md`/`v1.4.0.md` old-appleTeamId snippets.
> - **v1.3.0 release gates (pre-existing, NOT transfer-related):** prod migration `add_onboarding_variant_columns` via `db-push-prod.sh`; flip PostHog onboarding `variant_b` to 0%; commit the uncommitted `eas.json` + `generate_apple_jwt.js` changes; create a Sandbox tester under the account holder's ASC + recreate TestFlight internal testing + re-check demo-mode review creds.
> - **Heads-ups:** App Store Seller name now "The Account Holder" (expect occasional confused support pings); ensure durable 2FA access to the account holder's account (your income lives there now).

## Phase 6 — Processing & post-transfer cutover

- Status **"Processing App Transfer"** — up to **2 business days**. Possible **"Waiting for Export Compliance"** hold (Apple contacts the recipient; we declare only standard/exempt crypto — `ITSAppUsesNonExemptEncryption=false` — so expect none).
- On completion: app leaves your account, appears in the account holder's; both Account Holders notified. The App Store listing's **Seller** becomes "The Account Holder" (individual accounts show the personal legal name); ratings, reviews, the store URL and the numeric app ID `APPLEAPPID` are unchanged — marketing/TikTok links keep working.

**Post-completion actions — IN THIS ORDER (re-ordered 2026-08-08: the new-team SIWA key must exist before Step B can run; the old list had Step B first, a mid-cutover dead end):**

1. [ ] **Wait up to 24h** for Apple's Sign-in-with-Apple config to propagate before touching SIWA (Step B or sign-in tests).
2. [ ] **Create the new-team SIWA key FIRST** (everything below consumes it): the account holder's account → Certificates, Identifiers & Profiles → Keys → new key with Sign in with Apple enabled, primary App ID `com.kinderwell.app` (it lives in his team now). Download the `.p8` once, note the Key ID. Confirm the **Services ID `com.kinderwell.app.auth`** arrived with the transfer (Identifiers → Services IDs) and is configured for the App ID — create it only if missing.
3. [ ] **Regenerate the Supabase Apple-provider JWT** with the new identity: edit `scripts/generate_apple_jwt.js` constants (`TEAM_ID = 'APPLETEAMID'`, `KEY_ID = <new key id>`; `CLIENT_ID` stays `com.kinderwell.app.auth`), run with the new `.p8`, paste into the **Secret Key** field of BOTH Supabase projects' Apple provider (prod `prodprojectref00000x`, dev `devprojectref000000x`). While there, verify **Client IDs** still lists `com.kinderwell.app` — that's what native sign-in actually validates against (see Q-SIWA recalibration). Procedure = `docs/APPLE_JWT_ROTATION.md` with the new team's values.
4. [ ] **TN3159 Step B** — `2-exchange.js` with `NEW_TEAM_ID=APPLETEAMID`, the new Key ID + `.p8` from step 2. Exchange all `transfer_sub`s, review `apply-migration.sql`'s sanity header (row count, no duplicate subs), apply deliberately (`BEGIN` → verify count → `COMMIT`). Re-run for any failures (per-user log).
5. [ ] **Real-Apple-subscriber smoke test** (Phase 7) — now, and again after the 24h mark.
6. [ ] **Superwall cutover** — same app/org, client `pk_` key unchanged, no app update. Generate fresh **App Store Connect API key** + **In-App Purchase key** in the account holder's account (Users and Access → Integrations) → replace both in Superwall → Settings. **Verify the App Store Server Notifications URL** in the new account (Apple doesn't guarantee carry-over; revenue tracking needs it). Then **generate a NEW app-specific shared secret** (revokes the one shared pre-transfer) and update it wherever Superwall Settings holds it. Confirm entitlement still resolves (should never have broken — StoreKit/on-device, per Q-SW).
7. [ ] **Small Business Program check** — confirm the account holder's enrollment/effective date (Phase 0.5); if Option A was chosen, note the date the 15% kicks in and expect 30% on proceeds until then.
8. [ ] **EAS / release plumbing (before the next build/submit, i.e. v1.3.0):**
   - `eas credentials` → iOS signing under Team `APPLETEAMID`: new distribution certificate + provisioning profile for `com.kinderwell.app` (Apple's accept doc explicitly requires new profiles under the recipient account).
   - New **ASC API key for EAS Submit** from the account holder's account (Users and Access → Integrations → App Store Connect API) and hand it to `eas submit`/EAS credentials — the old account's submit key can no longer touch this app.
   - Owner edit: `eas.json` → `submit.production.ios.appleTeamId` → `APPLETEAMID` (`ascAppId APPLEAPPID` unchanged — same app record). Also update the stale copies of that snippet in `docs/RELEASE_CHECKLIST.md` and `docs/releases/v1.3.0.md` / `v1.4.0.md` ("The Owner (Individual)" comments included).
   - Update `docs/APPLE_JWT_ROTATION.md` prerequisites (Team ID → `APPLETEAMID`, new Key ID) + its expiry line/calendar reminder (fresh 180 days from step 3).
   - Recreate **TestFlight** internal testing under the account holder (groups/testers were wiped pre-transfer and don't transfer), and re-check App Review demo credentials/notes (`DEMO_MODE.md`) at the next submission.
   - Create a **sandbox tester** under the account holder's ASC (Users and Access → Sandbox) for the Phase 7 new-purchase test — sender-account sandbox testers may not work against the transferred app (unverified either way; a fresh one is free).
9. [ ] **TN3159 mop-up generate pass** (old team, `1-generate.js`) for Apple users who signed in during the transfer window — any time within the 60 days — then exchange + apply as in step 4.
10. [ ] **APNs — N/A** (no push). **PostHog / Sentry / Supabase core — no change** (token/DSN/project-based; optionally share dashboard access later).
11. [x] **Keychain — CLOSED, verified from code 2026-08-08:** Supabase sessions persist in AsyncStorage (`src/lib/supabase.ts` → `storage: AsyncStorage`), which lives in the app container and survives the signing-team change; `expo-secure-store` isn't installed and nothing in `src/` touches the keychain. Apple's "users must re-log-in after the first new-team update" keychain warning does not apply to Kinderwell.

---

## Phase 7 — Verification & silent-failure detection

**The core principle:** every silent failure here is invisible if you test with the wrong account. **Verify with a REAL, pre-existing, Apple-signed-in, PAYING subscriber account — not a fresh install, not Google, not a dev account.** That one login exercises TN3159 + Superwall entitlement + Supabase Apple provider together.

- [ ] **Real-subscriber smoke test** immediately post-completion, and **again after 24h** (config propagation).
  - Signs in with Apple → lands on their **existing** profile (not a new empty one)
  - Their subscription resolves as **entitled** (no paywall)
  - Lesson progress intact
- [ ] **Google-user smoke test** (should be unaffected — confirms nothing else broke).
- [ ] **New-purchase test** — a fresh user can subscribe and get entitled (use the sandbox tester created under the account holder's ASC — Phase 6 step 8).
- [ ] **Listing spot-check** — App Store page now shows Seller "The Account Holder" (expected); ratings, reviews and the store URL unchanged.

**Detection instrumentation — NO PRE-TRANSFER RELEASE REQUIRED.**

Decision (2026-08-03): the originally-proposed client-side "tripwire" event is **dropped**. It would have required shipping a build before the transfer, and TN3159 gives us something strictly better — a *server-side, per-user* success confirmation. Reasons:
1. **Primary safety = the migration script itself.** Step C checks each user's credential state reads `.transferred`. That is a positive confirmation of success per user ID, from your own script's output — better than a reactive client alarm for a failure.
2. **The 60-day generate window** means missed users are recoverable (re-generate + exchange), not silently lost — so a real-time client alarm is not load-bearing.
3. **Existing shipped instrumentation already covers reactive detection** (no code change):
   - `auth_attempted` → `auth_succeeded` | `auth_abandoned` (tagged `auth_method: apple`) — Apple auth funnel; a drop = Supabase Apple-provider misconfig.
   - Auth errors → Sentry via `reportError` (catches loud token-validation failures).
   - An orphaned user still triggers a fresh PostHog `identify` + `first_sign_in_date` $set_once → **a spike in brand-new PostHog persons among Apple sign-ins post-transfer = orphaning.** Buildable from data already being sent.
   - `subscription_purchased` / paywall-presentation volume — a spike in paywall presentations to existing users = entitlement misresolve.

- [ ] Build/save a **PostHog insight** (from existing data, no release): Apple `auth_succeeded` volume + new-Apple-person rate + paywall-presentation rate — watch for post-transfer spikes.
- [ ] Rely on the **migration script's `.transferred` per-user log** as the primary proof of success.
- [ ] The **real-subscriber smoke test** (above) is the human confirmation that ties it all together.

---

## What survives vs. what changes (reference)

**Survives the transfer:** ratings, reviews, the store URL + numeric app ID `APPLEAPPID` (marketing/TikTok links keep working), bundle ID (immutable), the App ID + Services ID, ongoing update delivery to users, active subscriptions (billing uninterrupted — proceeds attribute to the account holder's account from completion), iCloud data (N/A here).

**Changes:** App Store **Seller name** → "The Account Holder" (individual accounts show the personal legal name; App Store receipts follow). **Commission rate is NOT inherited** — the account holder's account bills at 30% until his own Small Business Program enrollment takes effect (Phase 0.5).

**Access split (sender = you):**
| Data | After transfer |
|---|---|
| Sales & Trends + financial reports (pre-transfer) | You keep; recipient never sees them |
| Sales/payments (post-transfer) | the account holder's account only |
| App Analytics | Sender loses ALL access; recipient gets the history (Apple: data since the app first appeared) — confirmed verbatim 2026-08-08 |
| Promo codes | Cannot generate new post-transfer (N/A — never used) |

Because you operate both logins, you retain practical access to everything across the two accounts.

---

## Critical-path summary

**Nothing external is blocking — Q-SW, Q-TN, Q-SIWA resolved; scripts built. One open decision (Phase 0.5 timing), then it's pure execution.**

0. **TODAY, before anything else (Phase 0.5):** enroll the account holder's account in the Small Business Program (declare the account association) + check the fiscal calendar → **choose Option A (transfer now, eat a short 30% window) or Option B (initiate only once his 15% is effective).** The only remaining decision.
1. **Pre-transfer:** hold v1.3.0 (no release); **run the § 3.3.1 dev verification gate** (the one `SELECT` confirming `auth.identities.provider_id` shape + a dev dry-run of `1-generate.js`) ⛔ before trusting the SQL on prod; Phase 1 backups; blank the two Test Information placeholder URLs; account tails (membership renewal, bank stays open); side-state sweep (webhooks / Xcode Cloud / OS-data IDs); generate + share the app-specific shared secret; save the Phase 7 PostHog insight.
2. **Initiate (Phase 4)** — recipient = the account holder's Account Holder email + Team ID `APPLETEAMID` → run the TN3159 generate pass (`1-generate.js`).
3. **Accept (Phase 5).**
4. **Post-transfer (Phase 6, IN ORDER):** wait ~24h → new-team SIWA key → regenerate + install the Supabase provider JWT (+ verify Client IDs) → TN3159 exchange (`2-exchange.js`) + review/apply SQL + `.transferred` check → Superwall key swap + Server Notifications URL + new shared secret → SBP effective-date check → EAS/release plumbing (signing credentials, ASC submit key, `eas.json` team ID, doc templates, TestFlight + sandbox tester). Mop-up generate pass any time inside 60 days.
5. **Verify (Phase 7):** real-subscriber smoke test now and at 24h; per-user `.transferred` log; PostHog insight watch; listing spot-check.

**The FOUR things that can silently cost revenue — guard all four:** (1) TN3159 orphaning (Phase 3), (2) the Small Business Program commission gap — 15%→30% (Phase 0.5, found 2026-08-08), (3) Superwall entitlement misresolve (Phases 2/6 — per Superwall support it can't gate users, only analytics), (4) Supabase Apple-provider mismatch (Phase 6 — downgraded 2026-08-08: the native flow never uses the provider secret; kept as mandatory hygiene). Each is covered by its phase and surfaced by the Phase 7 real-subscriber test.
