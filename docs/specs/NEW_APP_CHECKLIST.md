<!-- ORIGIN: owner-supplied planning artifact, copied into the repo verbatim per OWNER_TODO Task 6 (the planning folder is not backed up; this repo is the durable store). The second-app playbook for the parked reusable-app-template track. -->

# NEW_APP_CHECKLIST — start a new app from the Kinderwell scaffolding

Starting point: the Kinderwell repo with all SHIP_READY_PLAN fixes done (lesson engine, tests, scripts, CLAUDE.md, typed navigation). Who this is for: anyone — including a non-technical operator — working with a Claude subscription (Claude Code on a Mac). Claude does the code; you do the account signups and dashboard clicks, because they need a human with a credit card, a phone for 2FA, and legal authority.

**How to work through this doc:**
- Do phases in order. Don't skip verification steps — every phase ends with a check that proves it worked; skipping one means debugging two phases later.
- Steps marked 🤖 **Tell Claude:** are copy-paste prompts. Open Claude Code in the new app's folder and paste them verbatim (fill in the CAPITALIZED blanks). If Claude asks a clarifying question, answer it; if a command errors, paste the full error back and say "fix this."
- Steps marked 📱 **You:** are dashboard/browser work only you can do.
- **The Values Vault** (Appendix at the bottom): every time a step says "record X", write it into the vault immediately. Keep the vault in a password manager (1Password/Bitwarden), never in a plain file in the repo.
- Secrets hygiene: values that are SECRET (marked 🔒 in the vault) go into `.env` files or dashboards directly — avoid pasting them into chat when a file edit works. Publishable keys (marked 🔓) are safe anywhere; they ship inside the app.

**Cost & time:** Apple Developer $99/year is the only mandatory cost. Everything else starts free. Total time for a first-timer: ~2 focused days (most of it waiting on Apple).

---

## PHASE 1 — Decisions (30 min, paper only)

Write these down before touching anything; nearly every later step consumes one of them.

- [ ] App name (user-facing, ≤30 chars for the App Store) and a one-line description.
- [ ] Bundle ID: reverse-DNS, e.g. `com.yourcompany.yourapp`. Lowercase, no spaces, permanent — it can NEVER be changed after the first App Store upload. Record as `BUNDLE_ID`.
- [ ] URL scheme: short lowercase word for login redirects, usually the app name, e.g. `yourapp`. Record as `URL_SCHEME`.
- [ ] Monetization: this scaffold ships a hard subscription paywall (monthly + annual). Decide your two prices now. If your new app is free, flag it — Claude will disable the gate (one setting), and you skip Phases 7 and the subscription parts of Phase 6.
- [ ] Support email you actually read. Record as `SUPPORT_EMAIL`.
- [ ] Content: what replaces Kinderwell's 13 lessons? You don't need it written yet — the scaffold renders lessons from data files, so content can arrive after the app runs — but know roughly what it is.

## PHASE 2 — Accounts (1–2h active, up to 2 days waiting on Apple)

Create each account with the same email where possible. Use a password manager for all of them.

- [ ] 📱 Apple Developer Program — https://developer.apple.com/programs/enroll → $99/yr. Enroll as Individual (fastest) or Organization (needs a D-U-N-S number, takes days). Approval can take 24–48h — start this FIRST, do the other accounts while waiting. Once in: go to Membership details and record `APPLE_TEAM_ID` (10 characters, like `AB12CD34EF`).
- [ ] 📱 GitHub — https://github.com → you'll host the code here. Free.
- [ ] 📱 Expo — https://expo.dev → sign up. This service builds the iOS app in the cloud so you don't need deep Xcode knowledge. Free tier is enough to start. Record login as `EXPO_ACCOUNT`.
- [ ] 📱 Supabase — https://supabase.com → sign up (GitHub login is fine). This is your database + login system. Free.
- [ ] 📱 Google Cloud — https://console.cloud.google.com → sign in with a Google account. Needed only for "Sign in with Google". Free for this use.
- [ ] 📱 Superwall — https://superwall.com → sign up. This runs the paywall. Free tier to start. (Skip if your app is free.)
- [ ] 📱 PostHog — https://posthog.com → sign up, choose US Cloud. Product analytics. Free tier.
- [ ] 📱 Sentry — https://sentry.io → sign up. Crash reporting. Free tier.

## PHASE 3 — Mac setup (~45 min, mostly downloads)

- [ ] 📱 Install Xcode from the Mac App Store (it's huge; start the download early). Open it once and accept the license.
- [ ] 📱 Install Claude Code per https://claude.com/claude-code (requires your Claude subscription).
- [ ] 🤖 **Tell Claude:** "Set up this Mac for Expo/React-Native iOS development: install Homebrew if missing, Node 20 (matching the .nvmrc I'll add later), git, the Supabase CLI, and the EAS CLI. Verify each with a version command and show me the output."
- [ ] 🤖 **Tell Claude:** "Run `xcode-select --install` if command-line tools are missing, and verify `xcodebuild -version` works."

## PHASE 4 — Get the code: copy Kinderwell → strip → rename (~1–2h)

- [ ] 📱 On GitHub, create a new PRIVATE repository named after your app. Do not initialize it with anything.
- [ ] 🤖 **Tell Claude:** "Clone https://github.com/mandeepv/appreview into a folder named NEWAPPNAME, remove its git history (`rm -rf .git && git init`), set the new origin to MY_NEW_REPO_URL, and make an initial commit on `main`. Do not push yet."
- [ ] 🤖 **Tell Claude (the strip):** "This repo is the Kinderwell app being turned into a new app called NEWAPPNAME. Read CLAUDE.md and docs/README.md first. Then: (1) delete all Kinderwell lesson content — every file under src/lessons/content/ — and replace with one placeholder lesson data file that passes the zod schema and the content-validation test; (2) empty docs/archive/ and delete all Kinderwell-specific snapshot docs, keeping the evergreen process docs (RELEASE_CHECKLIST, DEV_PROD_ENVIRONMENTS, VERSION_MANAGEMENT, PAYWALL_MODEL, INVARIANTS, REVIEW_PROTOCOL, DEMO_MODE, APPLE_JWT_ROTATION) as templates; (3) reset docs/BACKLOG.md to an empty skeleton keeping its format rules; (4) clear legal/ but keep the file structure as templates flagged 'NEEDS REWRITE FOR NEWAPPNAME'. Run `npx tsc --noEmit` and `npm test` and fix anything the strip broke. List every file you deleted."
- [ ] 🤖 **Tell Claude (the rename):** "Rename the app identity for NEWAPPNAME: update src/config/appIdentity.ts, app.config.js and app.json — display name NEWAPPNAME, slug, scheme URL_SCHEME, bundle ID BUNDLE_ID, version 1.0.0, buildNumber 1. Then grep the whole repo case-insensitively for 'kinderwell' and fix every remaining hit (report any you deliberately keep, e.g. in docs explaining the template's origin). Update CLAUDE.md's first paragraph for the new app. Verify with `npx expo config --type public | grep -i -e name -e bundle`."
- [ ] 🤖 **Tell Claude:** "Run `eas init` to attach this project to my Expo account (EXPO_ACCOUNT) and make sure the new EAS project ID landed in the config — this must NOT reuse Kinderwell's project ID. Also blank out every environment value in eas.json (all three profiles) replacing them with the placeholder REPLACE_ME so no Kinderwell keys ship by accident, and update the eas.json submit block to remove Kinderwell's ascAppId (placeholder REPLACE_ME)."
- [ ] ✅ Verify: `npx tsc --noEmit` clean, `npm test` green, and a repo-wide search for "kinderwell" returns only deliberate mentions. Push to GitHub (🤖 "commit and push to main").

## PHASE 5 — Supabase: database + login backend (~1h)

- [ ] 📱 In Supabase, create TWO projects: `NEWAPPNAME-dev` and `NEWAPPNAME-prod`. Same region, nearest your users. Generate a strong database password for EACH (different ones!) — record as `SUPABASE_DEV_DB_PASSWORD` 🔒 and `SUPABASE_PROD_DB_PASSWORD` 🔒.
- [ ] 📱 For each project, open Settings → API and record: project ref (the 20-char id in the URL) as `SUPABASE_DEV_REF` / `SUPABASE_PROD_REF`, the Project URL, and the publishable key as `SUPABASE_DEV_KEY` 🔓 / `SUPABASE_PROD_KEY` 🔓. Also record the JWT secret (Settings → API → JWT) for each as `SUPABASE_*_JWT_SECRET` 🔒.
- [ ] 🤖 **Tell Claude:** "Update src/lib/env.ts's project-ref mapping: dev ref is SUPABASE_DEV_REF, prod ref is SUPABASE_PROD_REF. Update docs/DEV_PROD_ENVIRONMENTS.md's project table and the dev ref inside scripts/db-push-prod.sh accordingly."
- [ ] 🤖 **Tell Claude:** "Link the Supabase CLI to the dev project (SUPABASE_DEV_REF), run `supabase db push` to apply all migrations, then seed the app_config rows the same way the migration's seed section does. Verify with the REST curl check from RELEASE_CHECKLIST (expect 200 and the seeded rows)." — it will ask for the dev DB password; that's expected.
- [ ] 🤖 **Tell Claude:** "Deploy the delete-account edge function to the dev project and set its SUPABASE_JWT_SECRET secret (I'll paste the value when you're ready). Never use --no-verify-jwt. Then run the function's negative test: a tampered token must get a 401."
- [ ] ✅ Verify: Claude shows the 200-with-rows curl output and the 401 negative test. (Prod gets the same treatment in Phase 11 — via scripts/db-push-prod.sh, never manually.)

## PHASE 6 — Apple identifiers, Sign in with Apple, App Store Connect (~1.5h)

All at https://developer.apple.com/account → Certificates, Identifiers & Profiles, unless noted.

- [ ] 📱 App ID: Identifiers → + → App IDs → App. Bundle ID = exactly `BUNDLE_ID` (explicit, not wildcard). Capabilities: enable **Sign in with Apple**. Save.
- [ ] 📱 Services ID (used as the login's client id): Identifiers → + → Services IDs. Identifier = `BUNDLE_ID.auth`. After creating, click it → enable Sign in with Apple → Configure: Primary App ID = your new App ID; Domains = `SUPABASE_PROD_REF.supabase.co` AND `SUPABASE_DEV_REF.supabase.co`; Return URLs = `https://SUPABASE_PROD_REF.supabase.co/auth/v1/callback` and the same for the dev ref. Record identifier as `APPLE_SERVICES_ID`.
- [ ] 📱 Sign in with Apple key: Keys → + → name it, enable Sign in with Apple, Configure → choose your App ID → Register → Download the .p8 file — you get exactly ONE download, ever. Store the file in your password manager. Record the Key ID as `APPLE_KEY_ID` and the file location as `APPLE_P8_PATH` 🔒.
- [ ] 🤖 **Tell Claude:** "Generate the Apple client-secret JWT using scripts/generate_apple_jwt.js with TEAM_ID=APPLE_TEAM_ID, KEY_ID=APPLE_KEY_ID, CLIENT_ID=APPLE_SERVICES_ID and the .p8 at APPLE_P8_PATH. Print the JWT and its expiry date."
- [ ] 📱 In both Supabase projects: Authentication → Providers → Apple → enable; Client ID = `APPLE_SERVICES_ID`; Secret = the JWT Claude printed. Save.
- [ ] 📱 Calendar reminder NOW: the Apple JWT expires (max 6 months). Set a recurring reminder 2 weeks before expiry: "Regenerate Apple auth JWT — see docs/APPLE_JWT_ROTATION.md". If it lapses, every new Apple sign-in breaks silently.
- [ ] 📱 App Store Connect (https://appstoreconnect.apple.com): My Apps → + → New App. Platform iOS, your app name, language, Bundle ID (pick the one you registered), SKU = bundle ID is fine. After creation, open App Information and record the Apple ID number as `ASC_APP_ID`.
- [ ] 📱 Subscriptions (skip if free app): your app → Monetization → Subscriptions → create a Subscription Group ("Premium"), then two products: `BUNDLE_ID.monthly` and `BUNDLE_ID.annual`, with your Phase-1 prices. Fill the localized display names. They'll show "Missing Metadata" until first app review — that's normal. Record both product IDs.
- [ ] 🤖 **Tell Claude:** "Set eas.json's submit block: ascAppId = ASC_APP_ID, appleTeamId = APPLE_TEAM_ID."

## PHASE 7 — Google Cloud: Sign in with Google (~30 min)

At https://console.cloud.google.com:

- [ ] 📱 Top bar → project picker → New Project named NEWAPPNAME.
- [ ] 📱 OAuth consent screen (APIs & Services → OAuth consent screen): External; app name, support email, developer email; scopes: just the defaults (email/profile); add yourself as test user; Publish the app (stays in "production" mode with basic scopes — no verification review needed for email/profile).
- [ ] 📱 Credentials → + Create Credentials → OAuth client ID → type Web application (yes, Web — the app signs in through a browser sheet). Name "Supabase". Authorized redirect URIs: `https://SUPABASE_PROD_REF.supabase.co/auth/v1/callback` and the dev-ref version. Create. Record `GOOGLE_CLIENT_ID` 🔓 and `GOOGLE_CLIENT_SECRET` 🔒.
- [ ] 📱 In both Supabase projects: Authentication → Providers → Google → enable; paste client ID + secret. Save.
- [ ] 📱 In both Supabase projects: Authentication → URL Configuration → add `URL_SCHEME://**` to the Redirect URLs list (this lets the browser hand the login back to the app).

## PHASE 8 — Superwall, PostHog, Sentry (~1h) (Superwall part skipped if free app)

- [ ] 📱 Superwall: create an app (iOS). Settings → Keys → record the Public API Key (`pk_...`) as `SUPERWALL_KEY` 🔓. Then: Settings → App Store Connect → follow their connection wizard (it asks you to create an App Store Connect API key and upload it — follow the on-screen steps exactly). Products → add your two products by their exact ASC product IDs. Paywalls → create one from a template — it MUST show both prices and have a visible Restore Purchases button. Campaigns → new campaign → placement named exactly `subscription_gate` → audience: everyone (the code sends only unsubscribed users) → assign your paywall at 100% → Feature Gating: Gated → enable the campaign. These four settings are revenue-critical; screenshot them for your records.
- [ ] 📱 PostHog: create project NEWAPPNAME → Settings → record the Project API key (`phc_...`) as `POSTHOG_KEY` 🔓 and the host (US = `https://us.i.posthog.com`).
- [ ] 📱 Sentry: create project → platform React Native → record the DSN as `SENTRY_DSN` 🔓, plus your org slug `SENTRY_ORG` and project slug `SENTRY_PROJECT`. Then Settings → Auth Tokens → create one with `project:releases` + `org:read` scopes → record as `SENTRY_AUTH_TOKEN` 🔒.
- [ ] 🤖 **Tell Claude:** "Store SENTRY_AUTH_TOKEN as an EAS secret (`eas secret:create`) and set SENTRY_ORG/SENTRY_PROJECT wherever app.config.js expects them. I'll paste the token value when asked."

## PHASE 9 — Wire the config + branding (~1–2h)

- [ ] 🤖 **Tell Claude:** "Fill in every REPLACE_ME in eas.json across all three profiles using these values: dev profiles use the dev Supabase URL/key, production uses prod's; SUPERWALL_KEY, POSTHOG_KEY, SENTRY_DSN are the same in all profiles; SKIP_PAYWALL stays false everywhere. Then run `npx expo config --type public` for each profile's env and confirm app.config.js's required-variable check passes — it throws listing anything missing, so an empty error list is our proof." (Paste values from your vault when asked; all 🔓 values are safe to paste.)
- [ ] 📱 Get an app icon: one 1024×1024 PNG, no transparency, no rounded corners (Apple rounds it). Canva or any designer works. Put it somewhere on disk.
- [ ] 🤖 **Tell Claude:** "Replace the app icon and splash screen with FILE_PATH: wire it through app.config.js (icon + splash), regenerate whatever Expo needs, and show me the result in the simulator."
- [ ] 🤖 **Tell Claude:** "Update the associated domains in app.config.js to the new prod Supabase domain, and sweep app.config.js's privacy manifest: we kept PostHog and Sentry, so the declared data types should carry over — confirm nothing Kinderwell-specific remains."
- [ ] 🤖 **Tell Claude:** "Rewrite the onboarding questions and copy for NEWAPPNAME: here's what the app is about: <YOUR ONE-PARAGRAPH DESCRIPTION>. Change only text/data, not flow logic. Show me each screen's copy for approval before applying."
- [ ] 📱 🤖 **Legal:** you need a real Privacy Policy and Terms of Use at public URLs before submission. Fastest path: 🤖 "Draft a privacy policy and terms of use for NEWAPPNAME based on the templates in legal/, reflecting exactly what we collect (Supabase account, PostHog analytics, Sentry crash data, subscriptions via Apple). Mark anything you're unsure about for my review." Then host them (GitHub Pages is free — Claude can set that up too). **Have a human read these before publishing.**

## PHASE 10 — First build & smoke test (~2h)

- [ ] 🤖 **Tell Claude:** "Start the app on the iOS simulator (dev profile). Then walk me through the smoke test and wait for my confirmation at each step: fresh onboarding → sign up with Apple (I'll do the popup) → paywall appears → the 7-tap demo gesture works on the auth screen → force-quit and relaunch: gate appears again."
- [ ] 🤖 **Tell Claude:** "Run `eas build --profile preview --platform ios` and give me the QR/install link when it finishes." Install on your actual iPhone and repeat the smoke test on-device. Sandbox purchases: on the phone, Settings → App Store → Sandbox Account → sign in with a sandbox tester (create one in App Store Connect → Users and Access → Sandbox Testers) — then test a purchase and a Restore on the paywall.
- [ ] ✅ **Verify in dashboards:** PostHog shows your test events (environment=dev), Sentry shows the DevMenu test error, Supabase dev shows your user row. Nothing in the PROD project — if prod has data, stop and ask Claude why.

## PHASE 11 — Production backend + store submission (~2h + Apple review 1–3 days)

- [ ] 🤖 **Tell Claude:** "Time to set up prod: run scripts/db-push-prod.sh against SUPABASE_PROD_REF (I'll type the confirmations), then deploy the delete-account function to prod with its JWT secret, and verify the app_config curl returns 200 on prod."
- [ ] 🤖 **Tell Claude:** "Run the release process per docs/RELEASE_CHECKLIST.md for v1.0.0 build 1: production build via EAS, then submit to App Store Connect."
- [ ] 📱 **App Store Connect listing:** screenshots (Claude can screenshot the simulator at required sizes — ask it), description, keywords, support URL, privacy policy URL, **App Privacy questionnaire** (answer per your privacy policy: identifiers, usage data, diagnostics — ask Claude to prep exact answers from the privacy manifest), Terms of Use URL in the description or EULA field (required for subscriptions), age rating, pricing (free app + IAP).
- [ ] 📱 **App Review notes:** provide a demo path — this scaffold has the review-only demo gesture; describe it exactly as Kinderwell's checklist template does (docs/RELEASE_CHECKLIST template kept in Phase 4).
- [ ] 📱 Submit for review. Select **Manually release** so approval doesn't auto-publish.
- [ ] ✅ On approval: run the Tier-0 checks from SHIP_READY_PLAN (they're generic: app_config 200, delete-account end-to-end, paywall dashboard screenshots current) → press Release.

## PHASE 12 — Ops switch-on (~1h, same week)

- [ ] 📱 GitHub repo: confirm **private**; Settings → Branches → protect `main`, require the CI checks.
- [ ] 📱 Sentry: two alert rules (new fatal issue in prod; event spike) → email to `SUPPORT_EMAIL`.
- [ ] 📱 PostHog: build the four dashboards from SHIP_READY_PLAN Appendix C (or 🤖 "walk me through creating the Appendix C dashboards in PostHog step by step"), plus the internal-user filter for your own device.
- [ ] 🤖 **Tell Claude:** "Create the break-glass doc for NEWAPPNAME per SHIP_READY_PLAN 1.5.2, listing where every credential lives (my password manager), and update BREAK_GLASS/backup docs to the new project refs."
- [ ] 📱 First prod backup: 🤖 "Run scripts/backup-prod.sh (I'll confirm the link), and put a monthly reminder text in the doc."

---

## APPENDIX — The Values Vault

Copy this table into your password manager and fill it as you go. 🔒 = secret (never in the repo or screenshots), 🔓 = publishable (ships in the app, safe to paste).

| Value | From (phase) | Used in |
|---|---|---|
| `BUNDLE_ID` | 1 | Apple, Expo config, product IDs |
| `URL_SCHEME` | 1 | Expo config, Supabase redirect URLs |
| `SUPPORT_EMAIL` | 1 | escape hatch, ASC, consent screen, Sentry alerts |
| `APPLE_TEAM_ID` | 2 | eas.json, JWT script |
| `EXPO_ACCOUNT` | 2 | eas init |
| `SUPABASE_DEV_REF` / `SUPABASE_PROD_REF` | 5 | env.ts, scripts, Apple/Google callbacks |
| `SUPABASE_DEV_KEY` 🔓 / `SUPABASE_PROD_KEY` 🔓 | 5 | eas.json |
| `SUPABASE_DEV_DB_PASSWORD` 🔒 / `SUPABASE_PROD_DB_PASSWORD` 🔒 | 5 | CLI link prompts |
| `SUPABASE_DEV_JWT_SECRET` 🔒 / `SUPABASE_PROD_JWT_SECRET` 🔒 | 5 | edge function secret |
| `APPLE_SERVICES_ID` | 6 | Supabase Apple provider |
| `APPLE_KEY_ID` + `APPLE_P8_PATH` 🔒 | 6 | JWT generation (rotates ≤6 months!) |
| `ASC_APP_ID` | 6 | eas.json submit block |
| Product IDs (`.monthly` / `.annual`) | 6 | Superwall products |
| `GOOGLE_CLIENT_ID` 🔓 + `GOOGLE_CLIENT_SECRET` 🔒 | 7 | Supabase Google provider |
| `SUPERWALL_KEY` 🔓 | 8 | eas.json |
| `POSTHOG_KEY` 🔓 + host | 8 | eas.json |
| `SENTRY_DSN` 🔓, `SENTRY_ORG`, `SENTRY_PROJECT` | 8 | eas.json / app.config.js |
| `SENTRY_AUTH_TOKEN` 🔒 | 8 | EAS secret |

## Troubleshooting rules

1. Any command error: paste the FULL output to Claude with "fix this" — don't retry blindly.
2. Any dashboard confusion: screenshot it and ask Claude what to click.
3. Login redirect problems are almost always a URL mismatch — recheck the Supabase callback URLs in Apple Services ID, Google credentials, and Supabase URL Configuration character-by-character.
4. If the app builds but crashes at launch, the eas.json env values for that profile are the first suspect — rerun the Phase 9 verification.
5. Never "fix" anything by editing values in the PROD Supabase dashboard while debugging — reproduce on dev first.
