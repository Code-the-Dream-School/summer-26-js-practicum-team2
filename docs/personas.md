# Personas & Primary Journey

_Companion to `financial_literacy_app_mvp_backlog.md` (Epic 1 · User Story 4)._

---

## Persona A (Primary) — "First-checking-account Freshman"

- **Name / age:** Alex, 18
- **Situation:** College freshman, first debit card, part-time campus job (~$200/week). Lives on-campus, meal plan covers most food.
- **Goals:**
  - Not overspend before the semester ends
  - Understand what "credit" actually is before signing up for a card
  - Start saving something, even if small
- **Frustrations:**
  - Advice online feels aimed at people with real salaries
  - Bank apps show numbers but don't teach
  - Anything longer than a TikTok feels like homework
- **Tech comfort:** Very high on mobile, medium on desktop
- **Devices:** Phone (iPhone) most of the time; laptop occasionally for schoolwork
- **Quote:** _"I know I should be smarter about money, but I don't want a lecture."_

## Persona B (Secondary) — "First-paycheck Recent Grad"

- **Name / age:** Priya, 23
- **Situation:** Just started first full-time job. Has student loans in grace period, first 401(k) decision looming, no emergency fund.
- **Goals:**
  - Build a basic budget she'll actually stick to
  - Decide how much to put toward loans vs. savings vs. retirement
  - Feel less anxious about money
- **Frustrations:**
  - Everyone gives different advice
  - Doesn't know what questions to ask
  - Guilty every time she buys something "unnecessary"
- **Tech comfort:** High
- **Devices:** Roughly 50/50 mobile and desktop
- **Quote:** _"I make more money now and somehow feel less in control."_

---

## Primary user journey

1. **Discover** — hears about the app from a friend, TikTok, or campus flyer
2. **Land** — visits the landing page, scans in < 5 seconds, taps "Start learning"
3. **Sign up** — email + password (or Google) in < 60 seconds
4. **Onboard** — picks a goal, skill level, weekly time; sees "We'll start you with Budgeting Basics"
5. **First lesson** — opens Budgeting Basics · Lesson 1, reads 3–5 minutes
6. **First quiz** — 3–5 questions, instant feedback, passes at 70%+ — **← aha moment**
7. **First reward** — earns "First Step" badge + 30 XP; dashboard updates live
8. **Return next day** — reminder email or self-driven; opens app, streak-in-progress card, continues to Lesson 2

**Aha moment:** _"I actually understood that, and it took 5 minutes."_ — reinforced by immediate quiz feedback + badge.

---

## Explicit non-goals (MVP)

- No linking to real bank accounts (Plaid, etc.)
- No personalized financial advice / recommendations on specific products
- No live coaching, chat, or messaging between users
- No native iOS/Android app — mobile web only
- No payment processing or paid tier
- No community forum or user-generated content

---

## Mapping to epics

| Journey step   | Epic(s)                             |
| -------------- | ----------------------------------- |
| Discover, Land | Epic 1 (US1 landing page)           |
| Sign up        | Epic 2 (US1, US5, US6, US7)         |
| Onboard        | Epic 2 (US2)                        |
| First lesson   | Epic 3 (US1, US2, US4, US5)         |
| First quiz     | Epic 4 (US1, US2)                   |
| First reward   | Epic 5 (US1, US2)                   |
| Return         | Epic 5 (US2 streaks, US4 reminders) |
| Reliability    | Epic 6 (all)                        |
