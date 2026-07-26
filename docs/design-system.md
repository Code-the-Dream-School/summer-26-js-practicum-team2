# Design System

> **Status: Work in progress.** This document is the _contract_ for the shared design system described in [US 1.3](https://github.com/Code-the-Dream-School/summer-26-js-practicum-team2/issues/9).
>
> - **Color palette + typography fonts** — confirmed from the team style guide. Contrast still to be verified across all real text/background pairings per T-1.3.1.
> - **Type sizes, line-heights, spacing, radius, elevation** — proposed. Locked by T-1.3.2 and T-1.3.3.
> - **Component code examples** — describe the target API. T-1.3.5 through T-1.3.13 will implement them.
>
> As each task lands, update the corresponding section here.
>
> **Styling stack (TBD):** Flowbite (Tailwind-based) and Bootstrap are both under consideration. All tokens below are defined as CSS custom properties so the doc remains valid whichever library the team picks.

## Table of contents

- [How to use this doc](#how-to-use-this-doc)
- [Tokens](#tokens)
  - [Color](#color)
  - [Typography](#typography)
  - [Spacing](#spacing)
  - [Radius](#radius)
  - [Elevation (shadow)](#elevation-shadow)
- [Components](#components)
  - [Button](#button)
  - [Input](#input)
  - [Textarea](#textarea)
  - [Card](#card)
  - [ProgressBar — Linear](#progressbar--linear)
  - [ProgressBar — Circular](#progressbar--circular)
  - [Badge](#badge)
  - [NavBar](#navbar)
  - [Modal / Dialog](#modal--dialog)
  - [Toast / Snackbar](#toast--snackbar)
  - [Empty State](#empty-state)
  - [Skeleton](#skeleton)
- [Contributing to the design system](#contributing-to-the-design-system)

---

## How to use this doc

- **Tokens** are the only allowed source of color, spacing, typography, radius, and shadow values. Reference them via CSS custom properties (e.g. `var(--color-primary)`) or, once configured, via their Tailwind class equivalents.
- **Do not** hardcode hex codes or `px` values in components. See [Contributing](#contributing-to-the-design-system).
- **All interactive components must have a visible focus state** using `--focus-ring`.
- Tokens are canonically defined in `/design-tokens/tokens.css` (see T-1.3.4) and mirrored in `/design-tokens/tokens.json` for tooling.

---

## Tokens

### Color

Mint/green palette confirmed by the team style guide. Dark-green text on light-mint surfaces. Contrast for every actual text/background pair still to be verified per T-1.3.1 (WCAG AA: ≥ 4.5:1 body, ≥ 3:1 large text and UI). Check with the [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

**Semantic tokens** — components reference these, not raw hex codes or the neutral scale directly.

| Token                     | Value     | Description                                                                                              |
| ------------------------- | --------- | -------------------------------------------------------------------------------------------------------- |
| `--color-primary`         | `#18816A` | Primary CTA fill (e.g. "Start now" button).                                                              |
| `--color-primary-hover`   | `#105647` | Hover/pressed state for primary buttons and links.                                                       |
| `--color-primary-alt`     | `#41E3C0` | Secondary CTA fill for non-primary actions ("Other Buttons" in the style guide).                         |
| `--color-accent`          | `#54DEC0` | Accent for highlights and decorative elements. Used at 50% alpha for modal footers.                      |
| `--color-success`         | `#18816A` | Correct answers, positive confirmations. Always pair with a check-mark icon.                             |
| `--color-warning`         | `#FFDDD8` | Warning surfaces (soft coral pink). Text on this surface must be `--color-text-primary` for AA contrast. |
| `--color-danger`          | `#FFDDD8` | Incorrect answers, error surfaces (soft coral pink). Always pair with an "X" icon.                       |
| `--color-text-primary`    | `#061E19` | Primary body text (darkest green).                                                                       |
| `--color-text-heading`    | `#105647` | Main headings on light surfaces.                                                                         |
| `--color-text-on-primary` | `#F2FCFA` | Text/icon color on primary and secondary CTA buttons.                                                    |
| `--color-surface-app`     | `#F2FCFA` | Default page/app background (landing page).                                                              |
| `--color-surface-raised`  | `#EAFBF7` | Raised surfaces: hamburger modal card, elevated panels.                                                  |
| `--color-surface-inset`   | `#D4F7EF` | Inset surface inside a raised card (e.g. modal box background).                                          |
| `--color-surface-input`   | `#FFFFFF` | Form input background (profile fields, text inputs).                                                     |
| `--color-focus-ring`      | `#105647` | Focus outline color. For nav buttons (Prev, Next, Start now), pair with underline text-decoration.       |

**Neutral scale** — 9 steps. The mint palette doubles as the neutral scale; several steps also power semantic tokens above.

| Token                 | Value     | Description                                |
| --------------------- | --------- | ------------------------------------------ |
| `--color-neutral-50`  | `#F2FCFA` | Lightest surface — app/landing background. |
| `--color-neutral-100` | `#EAFBF7` | Raised card background (hamburger modal).  |
| `--color-neutral-200` | `#D4F7EF` | Inner modal-box background.                |
| `--color-neutral-300` | `#7EE7D0` | Search input background, subtle borders.   |
| `--color-neutral-400` | `#54DEC0` | Accent surfaces, decorative fills.         |
| `--color-neutral-500` | `#41E3C0` | Secondary button fill.                     |
| `--color-neutral-600` | `#18816A` | Primary CTA fill, success indicator.       |
| `--color-neutral-700` | `#105647` | Heading text, primary-hover.               |
| `--color-neutral-800` | `#061E19` | Body text (darkest).                       |

### Typography

Font families confirmed by the style guide (both open-source via Google Fonts). Size scale and line-heights are proposals — locked by T-1.3.2.

| Token                    | Value                                       | Description                                                                    |
| ------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------ |
| `--font-heading`         | `"Poppins", sans-serif`                     | Font family for all headings (h1–h4).                                          |
| `--font-body`            | `"Inter", sans-serif`                       | Font family for body copy, labels, buttons, inputs, and footer/copyright text. |
| `--font-mono`            | `ui-monospace, "SF Mono", Menlo, monospace` | Monospaced font for code snippets and numeric badges.                          |
| `--font-size-h1`         | `2.25rem` (36px)                            | Page-level titles. One per screen.                                             |
| `--font-size-h2`         | `1.875rem` (30px)                           | Section headings within a page.                                                |
| `--font-size-h3`         | `1.5rem` (24px)                             | Sub-section headings, card titles.                                             |
| `--font-size-h4`         | `1.25rem` (20px)                            | Minor headings, dialog titles.                                                 |
| `--font-size-body`       | `1rem` (16px)                               | Default body copy.                                                             |
| `--font-size-small`      | `0.875rem` (14px)                           | Secondary text, helper text, form labels.                                      |
| `--font-size-caption`    | `0.75rem` (12px)                            | Captions, timestamps, footnotes.                                               |
| `--line-height-tight`    | `1.2`                                       | For headings (h1–h4).                                                          |
| `--line-height-normal`   | `1.5`                                       | For body copy and helper text.                                                 |
| `--line-height-loose`    | `1.75`                                      | For long-form reading blocks.                                                  |
| `--font-weight-regular`  | `400`                                       | Body copy.                                                                     |
| `--font-weight-medium`   | `500`                                       | Labels, buttons, active nav.                                                   |
| `--font-weight-semibold` | `600`                                       | Headings, badge text, glossary term labels.                                    |
| `--font-weight-bold`     | `700`                                       | Emphatic headings, key numerics (streak count).                                |

> **Accessibility note:** Footer / copyright text uses `--font-body` at `--font-weight-medium` and never below `1rem` (16px) for readability.

### Spacing

4px-based scale. Use only these values — no ad-hoc `px`/`rem` for layout.

| Token        | Value  | Description                                                |
| ------------ | ------ | ---------------------------------------------------------- |
| `--space-1`  | `4px`  | Hairline gap between tightly related items (icon ↔ label). |
| `--space-2`  | `8px`  | Compact gap inside chips, badges, small buttons.           |
| `--space-3`  | `12px` | Standard gap between form label and input.                 |
| `--space-4`  | `16px` | Default padding for buttons, inputs, card interior.        |
| `--space-6`  | `24px` | Section spacing within a card or panel.                    |
| `--space-8`  | `32px` | Spacing between distinct sections on a page.               |
| `--space-12` | `48px` | Large page-section separation, hero padding.               |
| `--space-16` | `64px` | Top-level page gutters on desktop.                         |

### Radius

| Token           | Value    | Description                                     |
| --------------- | -------- | ----------------------------------------------- |
| `--radius-sm`   | `4px`    | Inputs, small badges, tags.                     |
| `--radius-md`   | `8px`    | Buttons, cards, modals.                         |
| `--radius-lg`   | `12px`   | Prominent cards, hero surfaces, dialogs.        |
| `--radius-pill` | `9999px` | Pills, avatars, circular progress, status dots. |

### Elevation (shadow)

Three levels — do not invent a fourth without discussion.

| Token         | Value                                | Description                                            |
| ------------- | ------------------------------------ | ------------------------------------------------------ |
| `--shadow-sm` | `0 1px 2px rgba(17, 24, 39, 0.06)`   | Resting cards, subtle lift on hover for flat elements. |
| `--shadow-md` | `0 4px 8px rgba(17, 24, 39, 0.08)`   | Popovers, dropdowns, hovered interactive cards.        |
| `--shadow-lg` | `0 12px 24px rgba(17, 24, 39, 0.12)` | Modals, dialogs, floating toasts.                      |

---

## Components

Each component below shows the **intended API** for the frontend tasks in US 1.3. Once built, replace the example with the actual implementation snippet.

### Button

Primary interactive element for CTAs and form submission. See T-1.3.5.

**States:** default, hover, focus, active, disabled, loading
**Variants:** `primary`, `secondary`, `ghost`

```jsx
// Primary
<Button variant="primary" onClick={handleSave}>Save</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Ghost
<Button variant="ghost">Learn more</Button>

// Disabled
<Button variant="primary" disabled>Save</Button>

// Loading (button remains focusable, announces busy state)
<Button variant="primary" loading aria-busy="true">Saving…</Button>
```

**Accessibility**

- Uses a real `<button>` element.
- Visible focus ring via `--color-focus-ring` (2px offset).
- For navigation buttons (Prev, Next, Start now), the focus state also applies `text-decoration: underline` for extra visual clarity.
- `loading` sets `aria-busy="true"` and disables the click handler.

---

### Input

Single-line text input with label, helper text, and error state. See T-1.3.6.

**States:** default, focused, error, disabled, with helper text

```jsx
// Default with helper text
<Input
  id="email"
  label="Email address"
  type="email"
  helperText="We'll never share your email."
/>

// Error
<Input
  id="email"
  label="Email address"
  type="email"
  value="not-an-email"
  error="Enter a valid email address."
/>

// Disabled
<Input id="email" label="Email address" disabled value="you@example.com" />
```

**Accessibility**

- `<label htmlFor="…">` is associated with the input via matching `id`.
- Helper and error text are linked to the input via `aria-describedby`.
- Error state adds `aria-invalid="true"`.

---

### Textarea

Multi-line text input. Shares label/helper/error behavior with `Input`. See T-1.3.6.

```jsx
<Textarea
  id="notes"
  label="Notes"
  rows={4}
  helperText="Optional — up to 500 characters."
/>

<Textarea
  id="notes"
  label="Notes"
  rows={4}
  error="Notes cannot exceed 500 characters."
/>
```

**Accessibility**

- Same label/description/error wiring as `Input`.
- Never disable resize entirely; if constraining, use `resize: vertical`.

---

### Card

Container primitive for grouping related content. See T-1.3.7.

**States:** default, interactive (hover), selected

```jsx
// Default
<Card>
  <h3>Lesson 1 — Verbs</h3>
  <p>Learn the present tense.</p>
</Card>

// Interactive (behaves as a link/button)
<Card as="a" href="/lesson/1" interactive>
  <h3>Lesson 1 — Verbs</h3>
  <p>Learn the present tense.</p>
</Card>

// Selected
<Card interactive selected>
  <h3>Lesson 1 — Verbs</h3>
</Card>
```

**Accessibility**

- Interactive cards render as `<a>` or `<button>` and get a visible focus ring.
- Never wrap non-interactive text-only cards in a link — use `interactive` only when the whole card is a target.

---

### ProgressBar — Linear

Determinate progress for lesson completion. See T-1.3.8.

```jsx
<ProgressBar value={40} max={100} label="Lesson progress" />
```

**Accessibility**

- Renders `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- `label` becomes the `aria-label` (or `aria-labelledby` if a visible label is used).

---

### ProgressBar — Circular

Ring variant for the daily-goal indicator. See T-1.3.8.

```jsx
<ProgressRing value={3} max={5} label="Daily goal: 3 of 5 lessons" size={64} />
```

**Accessibility**

- Same `role="progressbar"` semantics as the linear variant.
- Numeric label is announced; the ring itself is `aria-hidden`.

---

### Badge

Compact status/label pill. Used for status indicators and earned achievement badges. See T-1.3.9.

**Variants:** `default`, `success`, `warning`

```jsx
<Badge>Beta</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Overdue</Badge>
```

**Accessibility**

- If a badge conveys status not otherwise present in text, include an `aria-label` (e.g. `<Badge variant="success" aria-label="Lesson completed">✓</Badge>`).

---

### NavBar

Top-level navigation. Signed-out and signed-in variants. See T-1.3.10.

```jsx
// Signed out
<NavBar
  authState="signed-out"
  actions={<>
    <Button variant="ghost">Log in</Button>
    <Button variant="primary">Sign up</Button>
  </>}
/>

// Signed in
<NavBar
  authState="signed-in"
  user={{ avatarUrl: "/me.png", xp: 1240, streakDays: 7 }}
/>
```

**Accessibility**

- Wraps content in `<nav aria-label="Primary">`.
- Mobile hamburger button uses `aria-expanded` and `aria-controls` pointing at the menu panel.
- Menu is dismissible via `Esc` and click-outside.

---

### Modal / Dialog

Accessible modal primitive. Prefers native `<dialog>` where supported. See T-1.3.11.

```jsx
<Modal open={isOpen} onClose={() => setOpen(false)} titleId="confirm-title">
  <h2 id="confirm-title">Delete this lesson?</h2>
  <p>This can't be undone.</p>
  <Button variant="ghost" onClick={() => setOpen(false)}>
    Cancel
  </Button>
  <Button variant="primary" onClick={handleDelete}>
    Delete
  </Button>
</Modal>
```

**Accessibility**

- Focus is trapped inside the modal while open.
- Focus returns to the trigger element on close.
- `Esc` closes the modal.
- Root has `role="dialog"` (implicit with `<dialog>`) and `aria-labelledby={titleId}`.

---

### Toast / Snackbar

Ephemeral feedback for save confirmations and badge-earn events. See T-1.3.12.

```jsx
// Fire-and-forget from anywhere in the app
toast.success("Progress saved.");
toast.error("Couldn't save. Try again.");

// Rendered mount point (once, near the app root)
<ToastRegion />;
```

**Accessibility**

- `<ToastRegion>` renders a live region with `role="status"` and `aria-live="polite"`.
- Auto-dismiss after ~5s; pauses on hover/focus.
- Never used for critical errors that require user action — use a `Modal` instead.

---

### Empty State

Placeholder shown when a list, page, or panel has no content. See T-1.3.13.

```jsx
<EmptyState
  icon={<BookIcon />}
  title="No lessons yet"
  message="Start your first lesson to begin tracking your streak."
  action={<Button variant="primary">Browse lessons</Button>}
/>
```

**Accessibility**

- Title renders as a heading at the appropriate level for the surrounding page.
- Icon is decorative (`aria-hidden="true"`).

---

### Skeleton

Loading placeholder primitives for lines and rectangles. See T-1.3.13.

```jsx
// Text line
<Skeleton variant="line" width="80%" />

// Multi-line block
<Skeleton variant="line" lines={3} />

// Rectangle (image, avatar, card)
<Skeleton variant="rect" width={64} height={64} radius="pill" />
```

**Accessibility**

- Wrapping region uses `aria-busy="true"` while loading and swaps to real content when ready.
- Skeletons themselves are `aria-hidden="true"`.

---

## Contributing to the design system

Before opening a PR that adds or changes UI:

1. **No raw values.** Every color must be a `--color-*` token; every spacing/radius/font-size must be a `--space-*` / `--radius-*` / `--font-size-*` token. Enforced by the lint rule / PR checklist item added in T-1.3.15.
2. **Focus states are non-negotiable.** Every interactive element (button, link, input, card-as-link, menu item) must show a visible focus ring using `--color-focus-ring`.
3. **New token?** Propose it in a PR that updates:
   - `docs/design-system.md` (this file — add the row)
   - `/design-tokens/tokens.css`
   - `/design-tokens/tokens.json`
4. **New component?** Add a section here with: purpose, states, code example, and accessibility notes — matching the format of the components above.
5. **Contrast.** Any new color pair used for text must meet WCAG AA (≥ 4.5:1 body, ≥ 3:1 large text and UI). Check with a tool like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
