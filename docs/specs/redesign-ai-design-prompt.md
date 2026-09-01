# Kinderwell Redesign — AI Design Tool Prompt (Pass 1: pick a direction)

Prompt for generating **5 competing visual directions** in an AI design tool
(built for Claude's design tool; works elsewhere). Produces mockups, not
shippable code.

## How to run this

**One direction per run, one turn per run.** Paste the SHARED BRIEF + the SCREENS
+ one DIRECTION block as a single message. Five runs, not one run of everything —
you can kill a direction after seeing it and spend the savings on the finalists.
Direction F is an optional sixth run where the tool proposes its own direction.

### Running this in Claude's design tool

**One turn per direction. Ask for the screens directly.**

An earlier version of this doc split each run into "tokens first, screens second."
That failed in practice: asked to output a style tile with a color ramp, type scale,
button states and card states before designing anything, the tool correctly produced
a full desktop-width design-system document — sections 01 Color, 02 Type, 03 Buttons —
and zero phone screens. The whole run was wasted, and the output couldn't answer the
only question that matters ("is this direction right for Kinderwell?"), because you
can't judge a direction from swatches.

Rules that follow from that:

- **Never ask for a setup artifact.** Consistency comes from one line — *"define your
  colors and type as CSS variables at the top so the screens stay consistent, but don't
  render them as an artboard"* — not from a separate phase.
- **State the frame size and screen count in the instruction itself**, and say
  explicitly: *do not produce a design-system document, swatch page, or component
  library — I want actual screens.* Without that, wide desktop layout is a reasonable
  reading.
- **Read the prompt back literally before sending.** If a sentence can be fully
  satisfied without producing phone screens, it is wrong.

**Then iterate — don't re-roll.** Conversational correction is the real advantage over
image generators. "Make the path nodes 20% larger and drop the shadow", "the green
reads too yellow, shift it cooler", "screen 4 is too dense — increase the row spacing"
all work, and beat regenerating from scratch.

**Keep the tokens.** The CSS variables in the returned markup are real, liftable
values — your bridge into `src/theme/` at implementation time, and the input to Pass 2.
Save the winning direction's variables before moving on.

### Consider 4 screens per direction, not 10

Ten screens per direction × five directions is a lot of output to compare. These four
decide the question on their own — option card, learning path, lesson hub, quiz
answered state. If a direction survives them, extend it; if not, you've lost one small
run. Screens 2, 7, 8, 9, 10 in the list below are worth generating only for the
finalists.

After picking a winner, Pass 2 expands it to the full 22-screen onboarding flow
plus the remaining app surfaces.

---

## SHARED BRIEF — paste this at the top of every run

> You are designing **Kinderwell**, a mobile iOS app for overwhelmed parents.
> Short daily lessons teach real behavioral techniques — tantrums, getting kids to
> listen, emotional regulation, sibling conflict, screen time. The user is a tired
> parent with five spare minutes, not a student. The tone is a warm, competent coach:
> premium and human. Never clinical, never childish, and never shaming — the app
> reflects and aspires, it does not diagnose or scold.
>
> Design **10 screens at 390 × 844 (iPhone 14/15)**, described below.
>
> ### Rules that hold across every direction — do not vary these
> - **Green is the brand color** — it's the logo color, and it should be the color a user
>   would name if asked what color this app is. Any shade is fair game: sage, forest,
>   emerald, olive, mint, pine. Screens generally sit on a neutral canvas with green
>   doing the work, rather than green backgrounds — but that's a default, not a rule;
>   use it where it earns its place. (Screen 9 is deliberately a full-green field.)
> - iOS-native: respect safe areas, 44pt minimum tap targets, primary actions pinned
>   within thumb reach at the bottom.
> - Exactly one primary button per screen. Any secondary action is underlined text only.
> - Headlines left-aligned. Generous whitespace. Numbers and key phrases that matter
>   get emphasized in the brand color.
> - WCAG AA contrast on all text.
> - No giant emoji, no flat clip-art, no busy illustrated scenes, no stock photography.
> - Copy is emotionally safe: reflective and aspirational, never severity-shaming.
>
> ### Output format
> Render the screens as realistic iOS phone frames with status bars, laid out side by
> side so they can be compared at a glance, each labeled with its number and name.
> Define your colors, type scale, and spacing as CSS variables at the top so the screens
> stay consistent with each other — but **do not render a style tile, swatch page,
> design-system document, or component library.** I want to see actual screens.

---

## THE 10 SCREENS — paste this after the shared brief, every run

> **1. Onboarding — question screen (multi-select, 2 options already chosen)**
> Thin progress bar at top with a back chevron. Left-aligned title
> "What's hardest right now, Sarah?" and a lighter gray subtitle "Pick all that apply."
> Eight tappable option cards, each with a small tinted icon chip and a label:
> Tantrums · Getting them to listen · Screen time · Bedtime battles · Defiance ·
> Anxiety · Sibling fighting · Feeling disconnected. Show "Tantrums" and "Getting them
> to listen" in the **selected** state so both states are visible on one screen.
> Sticky "Continue" button at the bottom. This component is seen eight times during
> onboarding — it carries more weight than any other single screen.
>
> **2. Onboarding — calculating / analyzing screen**
> A quiet full-screen moment while the app "builds the plan." A progress ring filling
> from 0 to 100 (show it around 60%), with a staged status label beneath it currently
> reading "Matching techniques to your family" and two adjacent stage labels visible
> as completed and upcoming: "Reading your answers" (done, checked) and "Building your
> plan" (upcoming, muted). Minimal, calm, no button — this screen advances itself.
>
> **3. Learn home — the main tab, a vertical learning path**
> The app's home screen. A scrolling vertical **path** of lesson nodes, Duolingo-style
> rather than a flat list: completed lessons are filled and checked, the current lesson
> is enlarged and visually alive with a clear "Start" affordance, upcoming lessons are
> muted, and later ones are locked. Group the nodes under section headers —
> "Foundation", "Emotional Skills", "Hard Moments". A top bar shows a **streak counter**
> and overall progress. Use real lesson titles: "Serve & Return", "The Importance of
> Labeling Emotions", "Naming Our Emotions", "Sprinklers: Building Deep Bonds",
> "Emotional Sandbags", "Communication Mistakes", "Helping Someone Process Emotions".
> Bottom tab bar: Learn · Progress · Settings. This is the biggest structural change in
> the redesign — make the path shape a real point of view.
>
> **4. Lesson hub — the sublesson list, before starting**
> The overview screen for one lesson. A hero icon in a tinted chip, the lesson title
> "Sprinklers: Building Deep Bonds", a small uppercase label chip reading "FOUNDATION",
> and a one-paragraph description: "This lesson will teach you how to build deep bonds
> with loved ones by recognizing 'sprinklers'." Below it, a scannable list of five
> sections, each with its own small line icon and a single-line description:
> Introduction to the concept of bonding · Common mistakes to avoid · Effective
> strategies for supporting upset loved ones · Key takeaways and principles · Lesson
> recap and integration. A small info row at the bottom: "Learn to recognize and
> respond to 'sprinklers' for deeper connections." Primary button: "Begin lesson."
> This screen tests **density** — five icon rows plus a hero plus a description, all
> still scannable.
>
> **5. Lesson teaching screen — inside a lesson**
> A slim section progress bar at top with a close X. A small uppercase eyebrow reading
> "SECTION 2 OF 6". A heading: "A Simple Back-and-Forth". Two short body paragraphs,
> with one key phrase inside the prose emphasized in the brand color. Then a soft
> tinted **callout card** labeled "Goal:" containing one sentence: "Understand what
> serve and return means and be able to explain it to someone else." Bottom "Next"
> button. Optimize for reading comfort — a tired parent reads this at 9pm.
>
> **6. Lesson quiz — the correct-answer state**
> A scenario question: "Your 4-year-old melts down in the grocery store. What's your
> first move?" Four answer cards. Show the **answered, correct** state: the chosen card
> in a success state, and a short explanation panel risen from the bottom reading
> "Right — naming the feeling before solving the problem is what makes them feel heard,"
> with a "Continue" button. Note that the success color must be legible as *correct*
> while remaining distinct from the brand green — solve that deliberately.
>
> **7. Onboarding — snapshot reveal (the payoff)**
> The aha moment right after the calculating screen. A stack of five stat cards, each
> with a small icon, a label, and a value: **Your family** — 2 kids, ages 4 & 7 ·
> **Your focus** — Tantrums & listening · **Your goal** — Calmer mornings ·
> **Matched lessons** — 12 lessons · **Est. time to first result** — About 2 weeks.
> One of these is the **accent-colored hero row** that carries the emotional weight.
> Headline above: "Here's your plan, Sarah." Primary button: "This looks right."
> This screen must feel like a reward — it's the conversion moment.
>
> **8. Lesson complete — celebration**
> The retention screen, shown after finishing a lesson. The lesson title, a sense of
> genuine accomplishment, 2–3 recap chips of what they learned ("Spot a sprinkler",
> "Name it before fixing it", "Stay in the moment"), a **streak indicator** showing 5
> days, and progress toward the next lesson. Primary button: "Back to your path."
> This is the screen that brings someone back tomorrow — it has to do joy without
> becoming childish for an adult audience.
>
> **9. Onboarding — full-green affirmation takeover**
> The one screen that inverts the whole system. The entire 390 × 844 canvas fills with
> the brand green, type goes white on top of it. It appears immediately after the user
> taps "I'm all in," as a full-screen emotional punctuation mark. Large centered or
> left-aligned headline: "You're all in, Sarah." One supporting line beneath:
> "We'll take it five minutes at a time." A single button in an inverted treatment.
> Nothing else — restraint is the point. This screen exists to prove the chosen green
> survives as a **large field**, not just as an accent.
>
> **10. Onboarding — cold-open story beat (the first screen a user ever sees)**
> A restrained hero visual in the top half — an illustration or a single line icon in a
> tinted chip, per this direction's approach. Below it, a large left-aligned headline:
> "The hardest job in the world came with no manual." One muted supporting line:
> "Kinderwell gives you the techniques nobody handed you." A single primary button
> pinned to the bottom: "Get started." Small underlined text link below it:
> "I already have an account." This is the purest test of type personality and
> illustration approach.

---

## THE DIRECTIONS — paste ONE of these per run

Each direction has a name, a thesis, and a distinct answer to: canvas color, green
shade, accent color, type personality, corner radius and elevation, illustration
approach, and learning-path structure. That last list is what actually forces the
directions apart — a tool given "make 5 options" without it returns five identical
layouts with shuffled colors.

**Why prescribe the directions rather than let the tool choose?** Asked to invent its
own spread, an AI design tool optimizes for plausibility, not distance: you get five
variations on whatever its training data says a wellness app looks like, all competent
and all the same. These five are deliberately spread across the real axis of the
decision — warm/editorial → engineered/neutral → energetic → nearly-absent → dark.
Direction E especially is one no tool would propose unprompted for a parenting app.
Prescribed directions also survive into Pass 2: "Soft Depth, deep forest green, no
illustration, hairline elevation" is a spec you can re-hand to a tool or a developer.
"Option 3" is not. Direction F below is the hedge — one open run for something none of
the five would produce.

### Direction A — Warm Editorial
> **Thesis:** a beautifully made book about your family.
> Warm cream canvas (never clinical white — reserve pure white for elevated cards).
> Soft sage green as the brand color, warm peach as the accent, occasional sky blue for
> clarity moments. Large **serif** headlines paired with a clean sans body. Flat
> two-tone vector illustrations in green and peach — one subject, centered, generous
> empty space, no outlines, no gradients, no shadows on the art itself. Cards lift off
> the cream with a soft diffuse shadow and a medium corner radius. The learning path
> reads as a gentle meandering line, like a trail through a book's endpapers. Editorial,
> unhurried, premium.

### Direction B — Soft Depth
> **Thesis:** quietly premium and unmistakably app-native.
> Warm off-white / light warm-gray canvas. Deep forest green as the brand color, muted
> clay as the accent. A single geometric sans throughout, tight and confident, no serif
> anywhere. **No illustration at all** — line icons only, consistently weighted. Cards
> have real layered elevation with crisp shadows and a tighter corner radius; depth does
> the work that color does elsewhere. The learning path is a strict vertical spine with
> nodes as elevated circular tiles. Restrained, engineered, expensive-feeling.

### Direction C — Playful Progress
> **Thesis:** the energy of a game, calibrated for adults.
> Brighter warm canvas. Vivid emerald green as the brand color, sunny yellow as the
> accent, with confident color blocking. Rounded heavy sans throughout — friendly and
> bold. Chunky pill buttons with a visible pressed state. Rounded-square node icons in
> saturated fills. The learning path is the star: a bold zigzag of large nodes with
> clear locked/current/complete differentiation and celebratory motion implied. The most
> Duolingo-adjacent of the five — but the copy and spacing must keep it adult, never a
> children's app.

### Direction D — Calm Minimal
> **Thesis:** the app as a deep breath.
> Near-white canvas with the faintest warm tint. Muted olive-sage green as the brand
> color, one dusty blue accent and nothing else. Very light type weights at generous
> sizes. **Hairline borders instead of shadows** — almost no elevation anywhere. Enormous
> whitespace; every screen holds less than you think it should. Tiny, restrained line
> icons. The learning path is a barely-there vertical line with small dot nodes, where
> only the current lesson has any visual weight at all. Headspace and Calm are the
> reference points.

### Direction E — Bold Contrast
> **Thesis:** modern, confident, and unafraid of the dark.
> A deep near-black or rich dark-green canvas as the **default theme** — not a dark mode
> variant, the primary look. Bright mint or lime green as the active/brand color, white
> type throughout. Cards **glow** with a subtle colored halo rather than casting shadows.
> A modern grotesk sans, tight tracking. Iconography is sharp and minimal. The learning
> path glows: completed nodes lit in mint, the current node haloed, locked nodes nearly
> invisible against the dark field. High-contrast and striking — the direction most
> likely to look unlike any other parenting app. This direction's dark canvas replaces
> the neutral one described in the shared brief.

### Direction F — Open brief (optional sixth run)
> Ignore the five directions above. Using only the shared brief and the 10 screens,
> **propose your own visual direction** for Kinderwell — and make it one that none of
> these five would have produced: Warm Editorial (cream, sage, serif, flat two-tone
> illustration), Soft Depth (off-white, forest green, geometric sans, layered elevation,
> no illustration), Playful Progress (bright, emerald, rounded heavy sans, color
> blocking), Calm Minimal (near-white, olive-sage, hairline borders, enormous
> whitespace), Bold Contrast (dark canvas, mint green, glowing cards).
>
> State your direction's **name** and a one-line **thesis** first, then give your
> specific answer to each of: canvas color, green shade, accent color, type personality,
> corner radius and elevation, illustration or iconography approach, and how the learning
> path is structured. Then design all 10 screens and the style tile to that spec.
> Take a real position — a direction with a point of view beats a safe average.

---

## After the runs

Compare on these questions, in this order:

1. **Does the learning path work?** (screen 3) — the biggest structural bet.
2. **Does the option card hold up?** (screen 1) — you'll see it eight times.
3. **Is the lesson hub still scannable at density?** (screen 4) — D and E will strain.
4. **Does the green survive full-bleed?** (screen 9) — the constraint you can't change.
5. **Does the celebration feel joyful without feeling childish?** (screen 8).
6. **Would you read screen 5 at 9pm?**

Then run Pass 2 on the winner: the full 22-screen onboarding flow plus lesson
card-list, reflection input, section-complete, and settings screens — reusing the
winning style tile with no new colors.

---

## Grounding notes

Screens 3–6 and 8 reflect the real app, not invented surfaces:
- Section → screen → block content model: `src/lessons/schema.ts`
- Per-lesson hub metadata (labels, section icons, descriptions): `src/lessons/hubMeta.ts`
- Lesson titles and module list: `src/screens/LearnScreen.tsx`
- Sample lesson content and the "Goal:" callout: `src/lessons/content/serveReturn.ts`

The learning-path treatment on screen 3 is genuinely new — today's Learn screen is a
flat vertical card list — and is the single largest structural change proposed here.
