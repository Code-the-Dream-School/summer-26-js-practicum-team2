# Competitive Scan

Scope: 3 comparable apps that teach a skill through short lessons, quizzes, and progress signals. Focus is on **learning UX + motivation loops**, not feature parity.

Legend:

- **Copy** — patterns we should adopt.
- **Avoid** — patterns we should not repeat.

---

## 1. Duolingo (language learning)

**Why it's relevant:** Best-in-class gamified micro-lesson loop. Sets the bar for streaks, XP, and daily habit formation.

### Three things to copy

1. **Bite-sized lessons (2–5 min).** Users can complete a lesson in one sitting, which fits college / commuter attention spans.
2. **Immediate, low-stakes feedback on each question.** Right / wrong feedback is shown in-line with a short explanation — no waiting until "submit."
3. **Visible progress + streak on the home screen.** A single dashboard makes "what to do next" and "why come back tomorrow" obvious.

### Three things to avoid

1. **Aggressive push notifications / guilt-tripping mascot.** Fun for some users, off-putting to adults learning about money.
2. **Hearts / lives that block progress.** Punishing failure discourages the exact learners we want to help.
3. **Heavy monetization pressure (Super, ads, freeze streak).** MVP is education-first; we should not model dark patterns.

---

## 2. Khan Academy (general education)

**Why it's relevant:** Trusted, non-gamified educational tone. Strong at explaining a concept once and letting learners self-pace.

### Three things to copy

1. **Clear lesson → practice → mastery progression.** Each unit reads like a mini-syllabus, not a random pile of activities.
2. **Plain-language explanations with worked examples.** Concepts are introduced before they are tested.
3. **Mastery tracking, not just completion.** Progress reflects understanding (retry until confident), which is right for financial literacy.

### Three things to avoid

1. **Overwhelming subject tree / navigation.** Too many entry points confuses first-time users; MVP should have one obvious path.
2. **Long video-first lessons.** Video is heavy to produce and skimmable; we should lead with text + interactive quizzes.
3. **Account / grade-level gating on the landing page.** Adds friction before the user has felt any value.

---

## 3. Zogo (financial literacy — direct competitor)

**Why it's relevant:** Same subject matter, same target age (teens / young adults), reward-based model.

### Three things to copy

1. **Modules organized around real-life money moments** (first job, first apartment, credit basics). Concrete beats abstract.
2. **Short quiz-per-module structure.** Reinforces the concept immediately after reading — no long units without feedback.
3. **Positive, non-judgmental tone.** Talks to users as capable adults learning something new.

### Three things to avoid

1. **Bank-partnership gating.** Some content is only unlocked via a partner institution — we explicitly do **not** integrate with banks (see non-goals).
2. **Gift-card / points economy as the main motivator.** Extrinsic rewards distract from the actual "aha" and are out of MVP scope.
3. **Sign-up wall before any lesson content.** Users should be able to preview the value before creating an account.

---

## Cross-cutting takeaways for our MVP

- Lead with a **single clear path**: one recommended lesson, one quiz, one badge.
- **Reward mastery, not punishment.** No hearts, no streak-loss guilt.
- **No bank linking, no partner gating, no ads.** (See `personas.md` → Non-goals.)
- Tone: **plain-language, non-judgmental, adult.**
- Show progress within 60 seconds of landing so users feel the loop before signing up.
