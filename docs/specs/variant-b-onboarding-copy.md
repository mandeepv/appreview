# Variant B onboarding — full copy (for review)

**Status:** DRAFT for owner review · 2026-07-19 · v1.3.0 A/B (`onboarding-flow = variant_b`)
**Structure:** 3-act story (Hook → Diagnose/Reflect → Calculate/Commit/Convert), 22 screens.
Adapted from QUITTR / Clear30 / Prayer Screen / Prayer Lock, tuned for a *parenting* audience
(reflection & aspiration carry the length, not severity-shaming).

> **PROOF NUMBERS ARE PLACEHOLDER-BUT-HARD-HITTING.** Every stat below is marked `⚠︎STAT`.
> These are written to convert; **you must confirm each is defensible before the flag ramps > 0%**
> — App Review can reject inflated/unverifiable claims. Swap any you can't back with a softer,
> unfalsifiable form ("Thousands of parents…"). See the checklist at the bottom.

Legend: **[S]** = statement (one CTA, no question) · **[Q-single]** = single-select (auto-advance)
· **[Q-multi]** = multi-select (Continue reveals) · **[input]** = free text · **[system]** = special
(calculate/snapshot/rating).

---

## ACT 1 — Hook & frame

### 1. Cold-open  ·  screen `VBWelcome`  ·  [S]
- **Title:** The hardest job in the world came with no manual.
- **Body:** Let's write yours — built around your family, in the next 2 minutes.
- **CTA:** Get started

### 2. Before we begin  ·  `VBIntro`  ·  [S]
- **Title:** A few quick questions.
- **Body:** Your answers shape every lesson we build for you. Nothing here is shared — it's just
  for your plan.
- **CTA:** Continue

### 3. Name  ·  `VBName`  ·  [input]
- **Title:** First, what should we call you?
- **Subtitle:** So your plan feels like yours.
- **Input:** First name (stored on-device only; never sent to analytics — PII rule)
- **CTA:** Continue

---

## ACT 2 — Diagnose & reflect
*(Uses the name captured above: "{name}, …")*

### 4. Your role  ·  `UserType` (REUSED, variant-A screen)  ·  [Q-single]
- **Title:** Who are you parenting as?
- **Subtitle:** Your answers are stored securely and used only to personalize your lessons.
- **Options:** Mother · Father · Guardian / caregiver
- *(Existing screen — reused as-is, keeps 5.1.1 reassurance line.)*

### 5. Your kids  ·  `ChildrenCount` (REUSED)  ·  [counter + age ranges]
- **Title:** Tell us about your kids.
- **Subtitle:** Pick an age range for each of your kids.
- *(Existing screen — reused as-is.)*

### 6. Temperature check  ·  `VBMood`  ·  [Q-single]
- **Title:** {name}, how do most days feel right now?
- **Options (a 1–5 self-rating, stored as key):**
  - `calm` — Mostly calm
  - `manageable` — Manageable, with rough patches
  - `stretched` — Stretched thin
  - `chaotic` — Honestly, chaotic
  - `overwhelmed` — Overwhelmed most days

### 7. Biggest challenge  ·  `VBChallenges`  ·  [Q-multi]
- **Title:** What's hardest for you lately?
- **Subtitle:** Pick as many as feel true.
- **Options:**
  - `tantrums` — Meltdowns & tantrums
  - `listening` — Getting them to listen
  - `screens` — Screen-time battles
  - `sleep` — Sleep & bedtime
  - `defiance` — Defiance & power struggles
  - `anxiety` — Big worries or anxiety
  - `siblings` — Sibling conflict
  - `bond` — Feeling disconnected from them

### 8. Reflection — what happens  ·  `VBWhenHardest`  ·  [Q-multi]
- **Title:** When it's hardest, what usually happens?
- **Subtitle:** No judgment — every parent has these moments.
- **Options:**
  - `lose_patience` — I lose my patience
  - `give_in` — I give in to stop the meltdown
  - `dont_know` — I freeze — I don't know what to say
  - `yell` — I raise my voice, then feel awful
  - `guilt` — I feel guilty long after
  - `okay` — I'm actually handling it okay *(escape valve, like variant A)*

### 9. Confidence  ·  `ExperienceLevel` (REUSED)  ·  [Q-single]
- **Title:** How confident do you feel handling these moments?
- *(Existing screen — reused as-is.)*

### 10. Mirror + social proof  ·  `VBMirror`  ·  [S]
- **Title:** You're not alone, {name}.
- **Body:** ⚠︎STAT **83% of parents** told us the *exact* same thing you just did. The good news:
  it's learnable — and you're already further than most just by being here.
- **CTA:** I'm ready

### 11. Aspiration  ·  `VBGoals`  ·  [Q-multi]
- **Title:** If this worked, what would change?
- **Subtitle:** Choose what you're hoping for.
- **Options:**
  - `calm_mornings` — Calmer mornings
  - `fewer_meltdowns` — Fewer meltdowns
  - `closer_bond` — A closer bond with my child
  - `more_patience` — More patience in hard moments
  - `confidence` — Confidence I'm doing it right
  - `consistency` — A partner & I on the same page

---

## ACT 3 — Calculate, commit, convert

### 12. Ready to build  ·  `VBReady`  ·  [S, with recap chips]
- **Title:** Ready to build your plan, {name}?
- **Body:** We'll match lessons to your family based on everything you just shared.
- **Recap chips (dynamic, from their answers):** e.g. `2 kids · ages 4 & 7` · `Focus: tantrums,
  listening` · `Goal: calmer mornings`
- **CTA:** Build my plan

### 13. Calculating  ·  `VBCalculating`  ·  [system — reuses PlanTheater ring engine]
- **Title:** Analyzing your answers…
- **Animated stages (ring fills 0→100 over ~3.5s):**
  - 25% — Reading your answers
  - 55% — Matching parenting techniques
  - 85% — Building your lesson plan
  - 100% — Almost ready
- *(No user input; auto-advances to snapshot on completion. Pure theater, no gate logic.)*

### 14. Snapshot reveal  ·  `VBSnapshot`  ·  [system — the aha moment]
- **Title:** Here's your personalized plan.
- **Card contents (built from their real answers):**
  - **Your family:** {childrenCount} kids · ages {ages}
  - **Your focus:** {top 2 challenges, human-readable}
  - **Your goal:** {top goal}
  - **Matched for you:** ⚠︎STAT **12 lessons**, starting with *{first-lesson title based on top
    challenge}*
  - **Est. time to first result:** ⚠︎STAT **~2 weeks**
- **CTA:** This looks right

### 15. How it works  ·  `VBHowItWorks`  ·  [S]
- **Title:** Real techniques. 5 minutes a day.
- **Body:** Short, science-backed lessons you can use the same day — no fluff, no lectures. Built by
  child-development experts, made for real life.
- **CTA:** Continue

### 16. Benefit proof  ·  `VBBenefit`  ·  [S, with mini stat/graph]
- **Title:** Small changes, real momentum.
- **Body:** ⚠︎STAT Parents who stick with Kinderwell for **2 weeks** report **calmer homes** and
  **fewer daily blow-ups.** (mini upward graph illustration)
- **CTA:** Continue

### 17. Commitment  ·  `VBCommit`  ·  [Q-single — Cialdini pledge]
- **Title:** How committed are you to making this change?
- **Options:**
  - `extremely` — Extremely committed
  - `very` — Very committed
  - `somewhat` — Somewhat committed
  - `exploring` — Just exploring for now

### 18. All-in affirmation  ·  `VBAllIn`  ·  [S — locks the pledge]
- **Title:** You're all in, {name}. 💪
- **Body:** That decision is the hardest part — and you just made it. Let's build the home you
  want, one small win at a time.
- **CTA:** Let's go

### 19. Rating  ·  `VBRating`  ·  [system — native prompt STUBBED, wired later]
- **Title:** Help another parent find this.
- **Body:** ⚠︎STAT Kinderwell was built with **100,000+ parents.** A quick rating helps the next
  overwhelmed parent find it too.
- **Testimonial quotes (⚠︎STAT — need real or clearly-labeled):**
  - "The tantrum lesson changed our mornings in a week." — Sarah, mom of 2
  - "I finally feel like I know what to do." — James, dad of 3
- **CTA:** Rate Kinderwell  ·  **Secondary:** Maybe later
- *(Native `expo-store-review` prompt is STUBBED for this build — button advances only, wired in a
  follow-up. Tracked in OPS_STATE.)*

### 20. Reminders  ·  `VBReminders`  ·  [permission priming — REUSED pattern]
- **Title:** Can we keep you on track?
- **Body:** A gentle nudge on the days it matters — no spam.
- **CTA:** Enable reminders  ·  **Secondary:** Not now
- *(Reuses the existing notification-priming logic.)*

### 21. Auth  ·  `Auth` (REUSED, signup mode)  ·  handoff
- *(Existing screen — "Sign in to save your plan." Both arms converge here.)*

### 22. → Loading (PlanTheater) → Paywall
- *(Existing shared tail. Untouched.)*

---

## Data & analytics notes
- New answers persist in `variantBAnswers[screenName]` (additive, variant-B-only — **no migration**).
- Name persists in the existing `name` store field (already local-only; **never** to PostHog/Sentry).
- Every question fires `trackOnboardingStepCompleted(SCREEN, value)` — same event as variant A →
  one funnel, both arms.
- Statement screens fire a lightweight step event on CTA so drop-off is visible per screen.

## ⚠︎ Proof-number sign-off checklist (do before ramping the flag)
- [ ] "83% of parents told us the same" (screen 10) — real, or soften to "So many parents…"
- [ ] "12 lessons matched" (screen 14) — set to the real catalog count / range
- [ ] "~2 weeks to first result" (screens 14, 16) — defensible, or remove the timeframe
- [ ] "calmer homes / fewer blow-ups" (screen 16) — soften if not measured
- [ ] "100,000+ parents" (screen 19) — **must** match reality or App Review risk; else "Thousands…"
- [ ] Testimonials (screen 19) — real & attributable, or replace with generic copy
