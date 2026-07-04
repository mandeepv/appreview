# Kinderwell Product Roadmap

**Purpose:** rolling backlog of product ideas with prioritization rationale. Not a fixed plan — a place to think out loud and see what's next.

**Last updated:** 2026-07-01
**Current state (2026-07-01):** ~decent TikTok traffic driving App Store visits and downloads. Conversions happening. No visibility into funnel metrics. First-version app shipped fast with minimal polish.

## The three problems in front of us

1. **Conversion optimization** — More visitors → downloads → paid users
2. **Analytics gap** — We can't see what's happening in the funnel
3. **Retention** — Keep paid users paying

They're not independent. Fixing 2 unblocks doing 1 and 3 intelligently.

## Priority: what to do in what order

### 🥇 First: Analytics & data foundation (this month)

**Why first:** Everything below depends on it. Running an A/B test without funnel tracking is running an experiment you can't measure. Improving retention without knowing which behaviors correlate with retention is guessing. Analytics is not glamorous but it's the multiplier on everything else.

**Effort:** 3-5 days total

### 🥈 Second: Onboarding polish + A/B test (future)

**Status (2026-07-04):** Scaffold was built and REMOVED before v1.1.0 shipped. The 20 variant B placeholder screens, `OnboardingVariantSwitch`, `experimentStore`, and `experiments.ts` all deleted from the codebase. Reason: shipping placeholder screens (even behind a flag defaulted to off) added test surface and risk to v1.1.0 without any user-facing benefit. Ship simple first, add A/B when we're actually running the experiment.

**When we're ready to run onboarding experiments again:**
1. Fix the 9 UX issues Mandeep flagged in `BACKLOG.md (v1.1.1 section)` first — it's not worth A/B-testing a broken baseline.
2. Design what "variant B" actually should be. Real hypothesis (e.g., "shorter onboarding = higher completion") not just visual differences.
3. Then build a clean scaffold: PostHog flag + variant switch component + real content in variant B.

**Why second:** Only makes sense once we can measure conversion per variant AND the control onboarding is polished enough to be a fair baseline.

**Effort:** 2-3 days once analytics is stable and control is polished

### 🥉 Third: App Store page optimization (parallel — anytime)

**Why parallel:** Doesn't depend on app changes. Can be worked on independently, even in an afternoon. Every extra install from the same TikTok traffic is free money.

**Effort:** 1 day of iteration, ongoing tuning

### 4th: Post-conversion retention (after we have retention data)

**Why later:** We don't yet know where users drop off after conversion. Better to instrument first, then fix the top drop-off point, than to guess-fix random things.

**Effort:** Ongoing, driven by data

---

## Detailed backlog

### 1. Add `subscription_status` visibility to our data 🔴 HIGH

**Problem:** We can't tell from Supabase who's paying. Superwall knows, but we can't join it with our other user data. So questions like "do users who chose experience_level=new convert better?" are unanswerable.

**Options considered:**
- **(a) Query Superwall API on demand** — no schema change, but slow and stateful queries are painful
- **(b) Add columns synced from Superwall webhooks** ✅ RECOMMENDED — enables SQL filtering, joins, cohort analysis

**Recommended approach (option b):**

Schema addition (backward compatible — new nullable columns):
```sql
ALTER TABLE user_profiles
  ADD COLUMN subscription_status TEXT,  -- 'trial', 'active', 'expired', 'cancelled', null
  ADD COLUMN subscription_plan TEXT,     -- 'monthly', 'annual', 'lifetime', null
  ADD COLUMN subscription_started_at TIMESTAMPTZ,
  ADD COLUMN subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN subscription_updated_at TIMESTAMPTZ;
```

Then set up Superwall webhook → Supabase Edge Function that updates these columns when Superwall reports subscription events.

**Effort:** 1 day (schema migration on dev+prod, Edge Function for webhook, wire up Superwall webhook config)
**Requires:** migration tracking (🔴 Best Practices #1) set up first

---

### 2. Onboarding funnel analytics 🔴 HIGH

**Problem:** No idea where in onboarding users drop off. First step? Age question? Paywall? Total black box.

**Options considered:**
- **(a) Custom event table in Supabase** — cheap but need to build reporting UI
- **(b) PostHog** ✅ RECOMMENDED — funnels, cohorts, sessions, replay, feature flags, all in one
- **(c) Amplitude / Mixpanel** — more powerful but overkill and pricier
- **(d) Google Analytics** — free but weak for product analytics

**Recommended: PostHog**
- Generous free tier (1M events/month)
- React Native SDK works with Expo
- Built-in funnels, cohorts, A/B testing (⚡ solves item #3 too)
- Session replay to watch actual users struggle
- Feature flags for A/B tests

**What to track:**
- `onboarding_step_viewed` (with step name)
- `onboarding_step_completed`
- `onboarding_abandoned`
- `paywall_viewed`
- `paywall_option_selected`
- `paywall_purchase_started`
- `paywall_purchase_completed` / `paywall_purchase_failed`
- `signup_completed` (Apple / Google — as separate events)

**Effort:** 1-2 days (SDK install, event instrumentation, dashboard setup)

---

### 3. Onboarding A/B experiment framework 🟡 MEDIUM

**Problem:** Current onboarding was thrown together. Big opportunity to test alternate flows. But we can't run experiments without infrastructure.

**Options considered:**
- **(a) Homegrown 50/50 assignment via user_id hash** — works, no dependency
- **(b) PostHog feature flags** ✅ RECOMMENDED (if we do PostHog for analytics) — reuses existing tool
- **(c) GrowthBook / LaunchDarkly** — overkill for one experiment

**Recommended: PostHog feature flags** — assuming we're using PostHog for analytics (item 2)

**How it would work (when we build it for real):**
1. Create a feature flag in PostHog with values `control` and one variant, 50/50 rollout
2. On app launch, fetch the flag value for the user, store in a Zustand slice with a sticky cache in AsyncStorage so a user never flips variant mid-onboarding
3. Onboarding navigation reads the flag, routes to control or variant components
4. Every onboarding event is tagged with variant; funnel comparisons happen in PostHog

**Do NOT ship any of this until the control onboarding is polished** (see `BACKLOG.md (v1.1.1 section)`). A/B-testing a broken baseline against a new design tells you nothing useful.

**What to test first:**
- Question order (biggest questions first vs. easy ones first)
- Skip/optional handling (fewer required fields → higher completion?)
- Value proposition placement (before vs. after signup)
- Number of steps (compressed 10-step vs. current 20-step)

**Effort:** 2-3 days (PostHog flag setup, second onboarding flow, routing logic, event tagging)
**Requires:** items 1 and 2 done first

---

### 4. App Store page optimization 🟡 MEDIUM

**Problem:** Traffic is arriving from TikTok but we don't know install rate. Even a 10% lift here is huge because the traffic is already there.

**What to do:**
- **Subtitle:** currently unclear if optimized. Should convey unique value in 30 chars. Test 2-3 variants.
- **Screenshots:** are they showing the current app UI? Do they have text overlays explaining value? Best-in-class apps have annotated screenshots ("Track sleep patterns," etc.), not raw UI.
- **App preview video (optional):** 15-30 sec video shown on the App Store page. Can substantially lift install rate.
- **Icon:** does it stand out at 60x60px? Test in the search results context.
- **Keywords in description:** if TikTok users search Kinderwell, they find it. If they search "parenting app," do they? Keyword optimization.
- **Localization:** are we in English only? Any TikTok traffic from non-English markets?

**Tools:**
- App Store Connect A/B testing (Product Page Optimization) — lets you A/B test screenshots and icon natively
- **Screenshot A/B:** Screenshots to Store, StoreMaven (paid), or roll your own

**Effort:** 1 day of initial iteration + ongoing measurement

**Not blocked by anything.** Can do in parallel with everything.

---

### 5. Session replay / user recording 🟡 MEDIUM

**Problem:** We think we know where users struggle in onboarding. We don't. Watching 10 real users complete the flow will reveal more than any analytics dashboard.

**Recommended: PostHog session replay** (comes with PostHog free tier)

**Effort:** enabled with a config flag once PostHog is installed. Just remember to respect privacy (mask sensitive fields).

---

### 6. Post-conversion retention 🟢 DEFER

**Problem (assumed):** Some paid users churn quickly. We don't know how many or when.

**Why defer:** We don't have retention data yet. First establish measurement (item 2), see the actual retention curve, then decide what to fix.

**Ideas to keep in mind for later:**
- Daily reminder notifications (do users who enable them retain better?)
- Streak mechanics (already implemented?)
- Personalized lesson recommendations
- Weekly progress email/notification
- Partner accountability (we already ask about partner in onboarding — do anything with it?)

**Effort:** Unknown until we see the data.

---

### 7. Ideas parking lot

Add stuff here as it comes up. No commitment.

- [ ] **Instrument lesson tracking during post-paywall rebuild** — add `lesson_step_viewed` event via shared `LessonContainer` component with props `lesson_id`, `step_number`, `total_steps`. Currently only raw `$screen` events fire per lesson screen (~370 screen names, hard to funnel).
- [ ] **Instrument paywall interaction depth** — `paywall_option_selected`, `paywall_purchase_started` between viewed and completed. Currently only success/failure.
- [ ] **Track onboarding answer values** — capture WHICH options users pick (user_type=father vs mother, experience_level=new vs experienced) so we can slice conversion by user segment.
- [ ] Referral program (invite a friend → both get X)
- [ ] Community feature (parents comparing notes)
- [ ] Widget for iOS home screen (daily lesson at a glance)
- [ ] Content variety — video lessons, audio lessons
- [ ] Personalization based on age of child
- [ ] Localization beyond English
- [ ] Web version for signup (App Store install friction is real)
- [ ] Family / partner shared subscription

---

## The 4-week plan

If you follow the priorities above, here's the concrete plan:

### Week 1: Analytics foundation
- Day 1-2: PostHog SDK install + wire base events (screen views, signup, paywall)
- Day 3: Onboarding funnel events (every step viewed / completed / abandoned)
- Day 4: Set up funnel dashboards in PostHog, verify data flowing
- Day 5: Superwall webhook → subscription_status columns in `user_profiles`
  - Requires: migration tracking set up (🔴 Best Practices #1) — do this Monday morning first

### Week 2: App Store optimization (in parallel to weeks 1-3)
- Day 1: Audit current App Store page — screenshots, subtitle, keywords
- Day 2: Design 2-3 subtitle variants + 2 screenshot variants
- Day 3: Set up App Store Connect A/B tests
- Ongoing: Watch install rate, iterate

### Week 3: Onboarding A/B experiment
- Day 1-2: Design onboarding variant B (based on hypothesis — probably compress steps)
- Day 3-4: Build variant B
- Day 5: Wire PostHog feature flag, launch 50/50

### Week 4: Watch data, decide next
- Look at Week 3 A/B results (won't be conclusive yet — need volume)
- Look at Weeks 1-2 retention curves
- Pick next experiment based on where the biggest drop-off is

---

## Discussion points (for future syncs)

- **How aggressive on migration tracking before we start?** Item 1 requires it. Doing it right = 2-3h. Cutting corners = tech debt.
- **PostHog cost projection:** free tier is 1M events/month. Estimate our event volume — probably OK on free forever at current scale.
- **Sensitive data in session replays:** need a policy on what to mask (child names, ages, emails).
- **When to actually launch v2 onboarding:** worth running past a friend/user first informally before A/B'ing.
- **Should we survey non-converting users?** After paywall abandonment, offer a 1-question exit survey? Could reveal huge insights.
- **What does the TikTok → App Store flow look like?** Is there a way to attribute TikTok source? (Answer: hard on iOS due to privacy. Can use custom App Store URLs with tracking params.)

---

## What to NOT do right now (things to say no to)

- ❌ **Rebuild the whole app before improving what works** — you have paying users. Ship experiments on the existing app.
- ❌ **Add tons of features** — every feature you add is more surface to test and maintain. Prove need before building.
- ❌ **Custom analytics dashboard** — PostHog does this. Don't rebuild.
- ❌ **Fancy A/B testing platform** — start with one experiment. Prove the process before investing in tooling.
- ❌ **Web app** — massive scope, unclear ROI vs. optimizing iOS. Defer unless data shows iOS install friction is the bottleneck.
- ❌ **Perfect retention before you know the retention numbers** — instrument first, fix biggest gap.

---

## Reference: "how do I decide what to work on next"

If unsure:
1. Is it measurable? If no → make it measurable first.
2. Is it reversible? If yes → ship faster, learn faster.
3. Is it high leverage? Prefer changes that affect many users (paywall, onboarding) over changes that affect few (settings screens).
4. Is it cheap? Prefer 1-day experiments over 1-week features until you know what works.
