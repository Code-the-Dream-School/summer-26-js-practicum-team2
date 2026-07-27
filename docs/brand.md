# Brand — Name, Tagline, Identity

> **Status: Draft — converging on `Sprout`.** This document is the single
> source of truth for the app's **name, tagline, and top-level brand identity**
> described in
> [US 1.9](https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2/issues/33).
>
> - **Team candidates so far:** `MoneyQuest`, `CoinPath`, `MoneyMentor`,
>   `SabaRich` (two teammates have submitted; call for the rest is open but
>   the team is fast-pathing per the note below).
> - **Fast-path recommendation:** `Sprout` — keeps the plant-growth package
>   originally proposed with `SabaRich` (tagline metaphor + logo concept +
>   per-lesson growth loop) but drops the two concerns the naming brief
>   flags against `SabaRich` itself: the "-Rich" suffix reads as the
>   "become rich" promise the brief tells us to avoid, and "Saba" needs a
>   pronunciation footnote (SAH-buh) in the wordmark. `Sprout` is one
>   syllable, unambiguous at 24px, and reuses the entire visual identity
>   spec below verbatim. See
>   [Visual identity concept](#visual-identity-concept-plant-growth-loop).
>   Preloaded into the [Selected name](#selected-name) and
>   [Selected tagline](#selected-tagline) tables and flagged as **pending
>   async team confirm** rather than a formal ranked vote. `SabaRich` stays
>   as the strongest backup — see [the note under the candidates table](#team-submissions).
> - **Availability scan** — table below; cells marked `[verify]` still need
>   a team member to actually check the domain / handle (T-1.9.2). Do this
>   before the confirm so we're not confirming a name that's un-shippable.
> - **Tagline candidates** — the Sprout tagline ("Plant your money. Watch
>   it grow.") is candidate 1; the original SabaRich tagline is kept as
>   backup candidate 2 in case the confirm surfaces a name change (T-1.9.6).
> - **Logo, favicon, and app-wide rollout** — tracked separately in T-1.9.4,
>   T-1.9.5, T-1.9.8. Logo usage rules are drafted in
>   [`brand-identity/logo-usage.md`](brand-identity/logo-usage.md) and get
>   folded into `docs/design-system.md` (T-1.9.7).

| Field              | Value                                                                           |
| ------------------ | ------------------------------------------------------------------------------- |
| Owner              | ****\_\_**** + full team vote                                                   |
| Depends on         | [US 1.3](../us-03-design-system.md), [US 1.4](../us-04-personas-and-journey.md) |
| Last updated       | 2026-07-27                                                                      |
| Mentor reviewer    | _[pending]_                                                                     |
| Mentor review date | _[pending]_                                                                     |

---

## Table of contents

- [Selected name](#selected-name)
- [Selected tagline](#selected-tagline)
- [Visual identity concept — plant growth loop](#visual-identity-concept-plant-growth-loop)
- [Naming brief](#naming-brief)
- [Candidate names (T-1.9.1)](#candidate-names-t-191)
- [Availability scan (T-1.9.2)](#availability-scan-t-192)
- [Team confirm (T-1.9.3)](#team-confirm-t-193)
- [Tagline candidates (T-1.9.6)](#tagline-candidates-t-196)
- [Rollout checklist (T-1.9.8)](#rollout-checklist-t-198)

---

## Selected name

| Field                      | Value                                                                                                                                                                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product name**           | **Sprout** _(recommended — pending async team confirm)_                                                                                                                                                                                                          |
| **Legal / display casing** | `Sprout` (single word, sentence-case in the wordmark; body copy: "Sprout")                                                                                                                                                                                       |
| **Pronunciation**          | _sprout_ — one syllable, no footnote needed                                                                                                                                                                                                                      |
| **Origin / rationale**     | The first visible stage of a growing plant — matches the plant-growth gamification loop below and the personas' "first checking account / first paycheck" starting point. Non-financial vocabulary avoids the wealth-management tone the naming brief rules out. |

## Selected tagline

| Field          | Value                                                               |
| -------------- | ------------------------------------------------------------------- |
| **Tagline**    | **Plant your money. Watch it grow.** _(pending async team confirm)_ |
| **Word count** | 6                                                                   |
| **Placements** | Landing hero, `<meta>` description, OG card, onboarding welcome     |

Once the two "pending async team confirm" flags above clear, everything in the
"Rollout checklist" at the bottom of this doc is unblocked.

---

## Visual identity concept — plant growth loop

> Feeds T-1.9.4 (logo SVG), T-1.9.5 (favicon / app icons), and the reward
> visuals across Epic 5 (XP + badges + streaks).

**Concept:** the logo is a small money-tree plant (Saba nut / _Pachira
aquatica_ silhouette — an outline with a few leaves). The plant **grows one
part at a time as the user completes lessons**, mirroring the existing reward
loop documented in [`personas.md`](personas.md) (First Step badge → XP →
streaks).

| Milestone                      | Plant state                                                   |
| ------------------------------ | ------------------------------------------------------------- |
| New account (pre-first-lesson) | Bare soil / seed                                              |
| First lesson complete          | **Single sprout with one leaf** (First Step badge equivalent) |
| Subsequent lessons             | +1 leaf / stem segment per lesson                             |
| Module complete                | Full branch                                                   |
| Course complete                | Mature money-tree silhouette                                  |

### Where the plant shows up

- **Wordmark logo (`logo.svg`):** static "mature" plant next to the `Sprout`
  wordmark. This is the version used in the nav bar, footer, OG card, and
  browser tab. See [`brand-identity/logo-usage.md`](brand-identity/logo-usage.md).
- **User plant (in-app):** the same plant silhouette, but rendered at the
  user's current growth state. Lives on the dashboard and in the reward
  animation after each quiz.
- **Favicon / app icons:** the plant symbol on its own (no wordmark) at 16px,
  32px, 192px, 512px. See T-1.9.5.

### Why this fits

- **Matches the tagline.** "Plant your savings. Watch your wealth grow" is
  the same metaphor. The visual and the copy reinforce each other on the
  landing hero.
- **Reuses existing reward loop.** Every plant part = one lesson complete, so
  the plant is a visual layer on top of the XP + badges + streaks already in
  the personas doc. No new backend concept required.
- **Fits the palette.** Plant leaves → `--color-primary` (`#18816A`). Soil /
  seed → `--color-neutral-700` or `--color-text-primary`. Highlights →
  `--color-accent` (`#54DEC0`). See
  [`docs/design-system.md`](design-system.md) tokens.
- **Scales to 24px.** A simplified 3-leaf sprout reads clearly at favicon
  size; the mature silhouette is used at 96px+.

### Open questions for T-1.9.4 (design)

- Number of distinct plant states — target ≈ 5–7 to keep the sprite sheet
  small.
- Whether the in-app plant is one SVG with parts toggled via `class` /
  `data-state`, or a small set of pre-composed SVGs indexed by lesson count.
  (Recommendation: single SVG with parts toggled, so the growth animation
  between lessons is a CSS transition.)
- Whether the wordmark uses the plant symbol on the left (icon + wordmark) or
  as a full lockup with the plant integrated into the letterforms.

---

## Naming brief

Constraints the name has to survive:

- **Audience:** college freshmen (Persona A, "First-checking-account Freshman")
  and recent grads (Persona B, "First-paycheck Recent Grad") — see
  [`personas.md`](personas.md).
- **Tone:** friendly, not lecture-y. The personas quote _"I know I should be
  smarter about money, but I don't want a lecture"_ — the name should not sound
  like homework.
- **Product shape:** short lessons (3–5 min), quizzes with instant feedback,
  XP + badges + streaks. Name should tolerate a playful hero tagline.
- **Visual identity:** mint/green palette (`--color-primary #18816A`, mint
  surfaces). Names that suggest growth, freshness, small steps, or clarity fit
  the palette without fighting it.
- **Not-goals we should avoid implying:** live bank linking, personalized
  investment advice, coaching, community forums. Avoid names that promise
  wealth-management or advisor vibes ("Vault", "Advisor", "Wealth", "Pro").
- **Format:** one word preferred, two-word OK if the second word is short.
  Must work as a wordmark at 24px.

---

## Candidate names (T-1.9.1)

### Team submissions

Submitted so far (2 of the team's contributors have chipped in). Story AC
requires ≥ 10 candidates before a formal vote; we're fast-pathing because
the plant-growth package (logo concept + tagline metaphor + gamification
loop) that arrived with `SabaRich` transfers cleanly to `Sprout` (backup
pool, row 5), which the naming brief prefers on tone. Backup pool below
covers the AC for "≥ 10 candidates listed" if the confirm doesn't clear.

| #   | Candidate       | Contributor       | One-line rationale                                                                                                |
| --- | --------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **SabaRich**    | _[contributor B]_ | Saba (money-tree plant) + "rich". Paired with the plant-growth logo + tagline. Strongest backup — see note below. |
| 2   | **MoneyQuest**  | _[contributor A]_ | Frames the app as a game / journey. Fits the XP + badges + streaks reward loop.                                   |
| 3   | **CoinPath**    | _[contributor A]_ | Path metaphor for the guided lesson journey.                                                                      |
| 4   | **MoneyMentor** | _[contributor A]_ | Direct — but note it leans lecture-y, which cuts against the personas' "don't want a lecture" quote.              |

> **Why the fast-path pick moved off `SabaRich` to `Sprout` (row 5 below):**
> the "-Rich" suffix reads as the "become rich" promise the
> [naming brief](#naming-brief) tells us to avoid ("Avoid names that promise
> wealth-management or advisor vibes"), and "Saba" needs a pronunciation
> footnote (SAH-buh) that the wordmark then has to carry forever. `Sprout`
> resolves both concerns while reusing the exact same plant-growth visual
> identity spec — no downstream artifact (logo, favicon, growth states,
> tagline metaphor, palette) has to change. If the team prefers to keep the
> money-tree reference, `Saba` (just the plant name, no `-Rich` suffix) is
> the compromise that drops the wealth-promise but keeps the origin story;
> note it in the confirm table below.

### Backup pool (used only if the Sprout confirm doesn't clear)

Drafted against the naming brief so we still meet the "≥ 10 candidates" AC
without burning a fresh brainstorm cycle.

| #   | Candidate    | One-line rationale                                                                                                                                         | Vibe    |
| --- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 5   | **Sprout**   | Growth from a small seed. Same plant metaphor as SabaRich, shorter, no pronunciation footnote. **Recommended pick** — see [Selected name](#selected-name). | warm    |
| 6   | **Mintwise** | Mint palette + "wise". Says "smart with money" without saying "advice".                                                                                    | warm    |
| 7   | **Kernel**   | The small foundational unit of an idea — matches 3–5 min lessons.                                                                                          | clean   |
| 8   | **Nudge**    | Behavioral-finance nod. Low-pressure, one small push at a time.                                                                                            | playful |
| 9   | **Bloom**    | Growth metaphor. Optimistic, non-financial vocabulary.                                                                                                     | warm    |
| 10  | **Chapter**  | "Start a new chapter" — fits first-checking-account / first-paycheck.                                                                                      | mature  |
| 11  | **Firstly**  | Named after the primary use case: your first money moves.                                                                                                  | clean   |
| 12  | **Coinly**   | Playful diminutive. Reads well as a wordmark.                                                                                                              | playful |

---

## Availability scan (T-1.9.2)

**Run this before the confirm below closes** — we don't want to lock in a
name whose handles are all taken. Fill each cell with `available`, `taken`,
or `taken — acceptable alt` and paste the URL you checked in Notes if it's
ambiguous. Story acceptance requires **`.com` (or acceptable alternative)
available for at least 1 of the top 3** and Instagram + X handles checked.

| Candidate       | `.com`     | `.app`     | `.io`      | Instagram `@` | X `@`      | Notes                                                                                                               |
| --------------- | ---------- | ---------- | ---------- | ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **Sprout**      | _[verify]_ | _[verify]_ | _[verify]_ | _[verify]_    | _[verify]_ | Common English word — expect `.com` taken; two-word `.com` (e.g. `getsprout.com`, `sproutapp.com`) is the fallback. |
| **SabaRich**    | _[verify]_ | _[verify]_ | _[verify]_ | _[verify]_    | _[verify]_ | Distinctive coined word — most likely to be free. Kept as strongest backup.                                         |
| **MoneyQuest**  | _[verify]_ | _[verify]_ | _[verify]_ | _[verify]_    | _[verify]_ | Common phrase — expect `.com` taken.                                                                                |
| **CoinPath**    | _[verify]_ | _[verify]_ | _[verify]_ | _[verify]_    | _[verify]_ | Common phrase — expect `.com` taken.                                                                                |
| **MoneyMentor** | _[verify]_ | _[verify]_ | _[verify]_ | _[verify]_    | _[verify]_ | Very common — expect all `.com` variants taken.                                                                     |

**Acceptable alternatives** (only if `.com` is taken): `.app`, `.io`, or a
two-word `.com` such as `getsprout.com` / `sproutapp.com`. Document the
alternative chosen in the "Selected name" table above.

### How to check (repeat per row)

1. **Domain:** open the registrar of your choice (Namecheap, Cloudflare
   Registrar, or Google Domains successor) and search the exact word.
2. **Instagram:** `https://www.instagram.com/<handle>/` — 404 or "Sorry, this
   page isn't available" means free.
3. **X:** `https://x.com/<handle>` — same signal.
4. Paste the URL you checked in the "Notes" column if the result is ambiguous.

---

## Team confirm (T-1.9.3)

**Method (fast path):** async confirm on the recommended pick rather than a
formal ranked vote. Each teammate marks 👍 (ship it), 🤔 (suggest tweak), or
👎 (block — prefer a different candidate). One 👎 doesn't automatically block;
it triggers a short sync discussion. If two or more 👎s land, we fall back to
a ranked vote across the top 3 that survived the availability scan.

**Question being confirmed:**

> Ship **Sprout** with tagline **"Plant your money. Watch it grow."** and the
> plant-growth logo concept from
> [Visual identity concept](#visual-identity-concept-plant-growth-loop)?
>
> If you'd prefer to keep the money-tree reference, note **`SabaRich`** or
> **`Saba`** (SabaRich without the `-Rich` suffix) in the Comment column
> — a 🤔 with a name-swap suggestion counts as "suggest tweak," not a block,
> since the visual identity spec is the same either way.

| Voter             | Reaction     | Comment / suggested tweak |
| ----------------- | ------------ | ------------------------- |
| _[contributor A]_ | _[👍/🤔/👎]_ | _[optional]_              |
| _[contributor B]_ | _[👍/🤔/👎]_ | _[optional]_              |
| _[teammate 3]_    | _[👍/🤔/👎]_ | _[optional]_              |
| _[teammate 4]_    | _[👍/🤔/👎]_ | _[optional]_              |
| _[teammate 5]_    | _[👍/🤔/👎]_ | _[optional]_              |

**Outcome:** _[pending]_ — once the reactions are in, delete the "pending
async team confirm" flag from the [Selected name](#selected-name) and
[Selected tagline](#selected-tagline) tables and unblock T-1.9.8.

---

## Tagline candidates (T-1.9.6)

Each is ≤ 10 words and reflects the value prop from `personas.md` (short
lessons, feeling in control of money without a lecture). Candidate 1 pairs
with the Sprout name + plant-growth concept and is the recommended pick.

1. **Plant your money. Watch it grow.** (6 words) — **Recommended.**
   Locked to the Sprout name; reinforces the plant-growth logo and
   per-lesson visual reward. Drops "wealth" from the original candidate so
   the tagline itself doesn't carry the wealth-promise the naming brief
   rules out.

**Backups** (used if the confirm surfaces a name change, or if the team wants
a tagline that stands on its own without the plant metaphor):

2. **Plant your savings. Watch your wealth grow.** (7 words) — original
   candidate written for the SabaRich name; use verbatim if the confirm
   surfaces `SabaRich` / `Saba` as the final pick instead of `Sprout`.
3. **Money, in five minutes at a time.** (7 words)
4. **Smarter with money, without the lecture.** (6 words)
5. **Your first steps with money, made simple.** (7 words)
6. **Learn money like it's a game.** (6 words)
7. **The friendly way to figure out your finances.** (8 words)
8. **Small lessons. Real money confidence.** (5 words)
9. **Because "adulting" shouldn't cost you.** (5 words)
10. **Money basics that stick — in minutes a day.** (8 words)

If the confirm above closes as 👍, candidate 1 is the tagline; delete the
"pending async team confirm" flag from the
[Selected tagline](#selected-tagline) table at the top.

---

## Rollout checklist (T-1.9.8)

Blocked on T-1.9.3, T-1.9.4, T-1.9.5, T-1.9.6. Once the name + tagline are
locked and the logo/favicon files land in `web/public/`, the frontend branch
picks up this checklist:

- [ ] Root [`README.md`](../README.md) uses the real product name (replace
      `Project Name` heading and the `[App Name]` placeholders).
- [ ] Repo name updated on GitHub if the team wants to reflect the brand.
- [ ] `<title>` on every route uses the real name.
- [ ] `<meta name="description">` uses the selected tagline.
- [ ] Open Graph image (`og-image.png`) shipped in `web/public/` and referenced
      via `<meta property="og:image">`.
- [ ] Favicon + app icons wired per T-1.9.5 and visible in browser tab.
- [ ] Any lingering `[App Name]` placeholders in
      [`legal-and-privacy/`](legal-and-privacy/) replaced.
