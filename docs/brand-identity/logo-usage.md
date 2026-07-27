# Logo & Brand Usage — for `docs/design-system.md`

> **Status: Draft.** This is the T-1.9.7 deliverable — the "Do / Don't" for
> logo usage that gets added as a new section to
> [`docs/design-system.md`](../design-system.md) when that branch merges.
> The file is drafted standalone here (same pattern the legal-and-privacy
> branch uses for content that other branches consume).
>
> - **When `docs/design-system.md` lands:** paste the "Brand" section below
>   into it, immediately after the "Tokens" section and before "Components".
>   Update the design-system table of contents to include the new anchors.
> - **When the real logo lands (T-1.9.4):** replace the `logo.svg` /
>   `logo-mono.svg` filenames in the examples if they change, and swap the
>   sample image references for real screenshots.
>
> Content below is written so it can be lifted verbatim into
> `docs/design-system.md`.

---

## Brand

The wordmark, plant symbol, and app icons live in `web/public/`. The
**only** approved logo files are:

| File                            | Use                                                                                                                                             |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `web/public/logo.svg`           | Full-color wordmark **with** the mature plant symbol on the left. Default for light backgrounds.                                                |
| `web/public/logo-mono.svg`      | Monochrome wordmark + plant. Use on colored / photo backgrounds.                                                                                |
| `web/public/plant.svg`          | Plant symbol on its own (no wordmark). Use where the wordmark won't fit legibly — favicons, small icons.                                        |
| `web/public/plant-states/*.svg` | Per-lesson growth-state variants of the plant (see [Plant growth states](#plant-growth-states)). In-app only — never in the header/footer logo. |
| `web/public/favicon.ico`        | Browser tab favicon (multi-resolution, generated from `plant.svg`).                                                                             |
| `web/public/icon-192.png`       | Home-screen / PWA icon at 192px (mature plant).                                                                                                 |
| `web/public/icon-512.png`       | Home-screen / PWA icon at 512px + splash source (mature plant).                                                                                 |

Never re-export the logo from a screenshot, a slide deck, or a raster PNG.
Always use the SVGs in `web/public/`. The plant symbol and the wordmark are
sourced from the same master file — don't recreate the plant by hand.

### Minimum size

The wordmark is designed to stay legible from **24px tall** up to
**240px tall**. Below 24px, use `plant.svg` (icon-only) instead.

| Context                         | Height       | Which file               |
| ------------------------------- | ------------ | ------------------------ |
| Nav bar (mobile + desktop)      | 24–32px      | `logo.svg`               |
| Footer                          | 24px         | `logo.svg`               |
| Landing hero                    | 96–240px     | `logo.svg`               |
| Favicon (raster)                | 16–32px      | derived from `plant.svg` |
| PWA / home-screen icon (raster) | 192px, 512px | derived from `plant.svg` |

**Do not** render the wordmark below 24px. If you need something smaller (e.g.
a 16px favicon), use `plant.svg` — the icon-only plant mark.

### Plant growth states

The plant symbol has multiple **growth-state** variants that reflect the
user's lesson progress — see the
[Visual identity concept](../brand.md#visual-identity-concept-plant-growth-loop)
in `brand.md`. These variants are for **in-app reward surfaces only**
(dashboard, post-quiz animation) and are never used in the nav-bar / footer /
OG card / favicon.

| State                   | File                                 | Where it's used                                |
| ----------------------- | ------------------------------------ | ---------------------------------------------- |
| Seed (pre-first-lesson) | `plant-states/00-seed.svg`           | New-account dashboard, onboarding              |
| Sprout (one leaf)       | `plant-states/01-sprout.svg`         | After first lesson complete (First Step badge) |
| Growth stages           | `plant-states/02-*.svg` … `06-*.svg` | +1 stage per lesson / module milestone         |
| Mature                  | `plant-states/mature.svg`            | Course complete; matches the wordmark's plant. |

The **mature** state is what ships inside `logo.svg` / `logo-mono.svg` /
`plant.svg`. All top-level brand surfaces (nav, footer, OG card, favicon) use
the mature state — the growth variants are a product feature, not a brand
asset.

### Clear space

Reserve clear space equal to the **cap-height of the wordmark** (roughly the
height of the uppercase letters) on all four sides. Nothing else — text,
button, icon, image edge — should intrude into that box.

```text
┌────────────────────────────────┐
│           ↕ cap-height         │
│  ← cap →  [ WORDMARK ]  ← cap →│
│           ↕ cap-height         │
└────────────────────────────────┘
```

### Approved backgrounds

| Background                                      | Which logo to use                                                                      |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `--color-surface-app` (`#F2FCFA`, default page) | Full-color `logo.svg`                                                                  |
| `--color-surface-raised` (`#EAFBF7`)            | Full-color `logo.svg`                                                                  |
| `--color-surface-inset` (`#D4F7EF`)             | Full-color `logo.svg`                                                                  |
| White (`#FFFFFF`)                               | Full-color `logo.svg`                                                                  |
| `--color-primary` (`#18816A`, dark green)       | Monochrome `logo-mono.svg` in `--color-text-on-primary` (`#F2FCFA`)                    |
| `--color-primary-hover` (`#105647`)             | Monochrome `logo-mono.svg` in `--color-text-on-primary`                                |
| Photo / hero image                              | Monochrome `logo-mono.svg` in white, with a subtle 0–24% black scrim if contrast fails |

Every placement must clear **WCAG AA 3:1** contrast between the wordmark and
its background. When in doubt, check with the
[WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).

### Do

- ✅ Use `logo.svg` at ≥24px on any light mint surface.
- ✅ Use `logo-mono.svg` on `--color-primary`, `--color-primary-hover`, or a
  photographic background.
- ✅ Use `plant.svg` (icon-only) for favicon / small-icon contexts under 24px.
- ✅ Use the **mature** plant state everywhere in the top-level brand
  (nav, footer, OG card, favicon). Growth-state plants belong inside the
  app's reward surfaces only.
- ✅ Preserve clear space equal to the wordmark's cap-height.
- ✅ Scale proportionally (never distort width vs. height).
- ✅ Link the nav-bar logo to `/` (home).

### Don't

- ❌ Don't render the wordmark below 24px — use `plant.svg` instead.
- ❌ Don't use a **growth-state** plant (`plant-states/*.svg`) in the nav,
  footer, OG card, or favicon. Those variants are an in-app reward feature.
- ❌ Don't recolor the logo. The only approved fills are the palette tokens
  above and `--color-text-on-primary` for the monochrome version.
- ❌ Don't outline, drop-shadow, emboss, or add effects.
- ❌ Don't rotate, skew, or stretch.
- ❌ Don't place the full-color logo on `--color-primary`, `--color-warning`,
  `--color-danger`, or a busy photograph — contrast fails.
- ❌ Don't crop the wordmark or slice off part of the mark.
- ❌ Don't reproduce the wordmark by re-typing the product name in a random
  font — always use `logo.svg`.
- ❌ Don't animate the logo on page load beyond a single fade-in. (The
  growth-state animation between lessons is a separate in-app interaction and
  has its own motion spec, TBD.)

### Wordmark in code

Prefer inline SVG (via `<img src="/logo.svg" alt="Sprout">` or a React
component that inlines the SVG) so the wordmark scales crisply and inherits
`currentColor` for the monochrome variant.

```html
<!-- Full-color, light background -->
<a href="/" aria-label="Sprout home">
  <img src="/logo.svg" alt="Sprout" height="24" />
</a>

<!-- Monochrome, dark background -->
<a
  href="/"
  aria-label="Sprout home"
  style="color: var(--color-text-on-primary);"
>
  <img src="/logo-mono.svg" alt="Sprout" height="24" />
</a>

<!-- Icon-only, small contexts (< 24px) -->
<img src="/plant.svg" alt="Sprout" width="16" height="16" />
```

`alt` text is the product name only (no "logo" — screen readers already
announce the role). `aria-label` on the wrapping link clarifies where it goes.

> **Placeholder note.** "Sprout" is used throughout this file per the
> current recommendation in [`../brand.md`](../brand.md#selected-name). If the
> async team confirm surfaces a different final name (e.g. `SabaRich` or
> `Saba` — both currently listed as backups in `brand.md`), do a
> workspace-wide find-and-replace on `Sprout` in this file when the confirm
> closes.

### Product name and tagline in copy

- Always write the product name in the casing recorded in
  [`../brand.md`](../brand.md) → "Selected name". Do not lowercase or all-caps
  it in body copy.
- The tagline recorded in [`../brand.md`](../brand.md) → "Selected tagline" is
  the only approved tagline for the landing hero, `<meta>` description, and
  Open Graph card. Do not paraphrase it per surface.
