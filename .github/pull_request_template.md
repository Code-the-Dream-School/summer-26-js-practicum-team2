<!--
  Thanks for the PR! Please fill this out before requesting review.
  Delete sections that don't apply.
-->

## What & why

<!-- Short summary of the change and the problem it solves. -->

## Related

<!-- Link the user story / task, e.g. US 1.3 / T-1.3.15, and any related issues. -->

Closes #

---

## Design system compliance

**If this PR touches any UI**, every box below must be checked (or replaced with `N/A — <reason>`). See [`docs/design-system.md`](../docs/design-system.md).

- [ ] **No raw hex colors.** All colors use `var(--color-*)` tokens (or their Tailwind/utility equivalents mapped from the tokens).
- [ ] **No raw `px` values** for `font-size`, `line-height`, `border-radius`, `margin`, `padding`, `gap`, `width`, or `height`. Use `var(--space-*)`, `var(--font-size-*)`, `var(--radius-*)` tokens.
- [ ] **Visible focus state** on every new interactive element, using `--color-focus-ring`.
- [ ] **New tokens** are added to [`docs/design-system.md`](../docs/design-system.md), `design-tokens/tokens.css`, and `design-tokens/tokens.json`.

## Screenshots / recordings

<!-- For UI changes, include before/after or a short capture. -->

## How I tested

<!-- Manual steps, automated tests, or "N/A". -->

## Checklist

- [ ] I've self-reviewed the diff
- [ ] Tests / examples added or updated where applicable
- [ ] Branch is up to date with `development`
