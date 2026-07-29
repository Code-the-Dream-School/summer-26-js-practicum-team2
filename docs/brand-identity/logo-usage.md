# Logo & Brand Usage — for `docs/design-system.md`

## Brand

Logo files in `web/public/`:

| File                           | Use                                                              |
| ------------------------------ | ---------------------------------------------------------------- |
| `logo.svg`                     | Wordmark with integrated sprout. Default. Scales 24px–240px+.    |
| `logo-mono.svg`                | Monochrome-white wordmark for dark / photo backgrounds. _(TBD.)_ |
| `favicon.svg`, `favicon.ico`   | Browser tab favicon.                                             |
| `icon-192.png`, `icon-512.png` | PWA / home-screen icons.                                         |

Always use the SVGs in `web/public/`. Never re-export from screenshots or slide decks.

### Sizing

- **Minimum wordmark size:** 24px tall. Below 24px, use `favicon.svg` / `favicon.ico`.
- **Maximum practical size:** 240px tall in the landing hero.
- Scale proportionally — never stretch.

### Approved backgrounds

| Background                           | Which logo                                               |
| ------------------------------------ | -------------------------------------------------------- |
| Light mint surfaces / white          | `logo.svg`                                               |
| `--color-primary` (`#18816A`) / dark | `logo-mono.svg` in `--color-text-on-primary` (`#F2FCFA`) |
| Photo / hero image                   | `logo-mono.svg` in white, add scrim if contrast fails    |

Every placement must clear **WCAG AA 3:1** contrast.

### Clear space

Reserve clear space equal to the wordmark's **cap-height** on all four sides.

### Do / Don't

- ✅ Use `logo.svg` at ≥ 24px on light surfaces.
- ✅ Use `logo-mono.svg` on `--color-primary` or photos.
- ✅ Use `favicon.svg` for anything under 24px.
- ✅ Link the nav-bar logo to `/`.
- ❌ Don't recolor, rotate, skew, stretch, or add effects.
- ❌ Don't animate the logo — it's a static mark.
- ❌ Don't crop the wordmark or re-type the name in another font.
- ❌ Don't render the wordmark below 24px.

### In code

```html
<!-- Light background -->
<a href="/" aria-label="Sprout home">
  <img src="/logo.svg" alt="Sprout" height="24" />
</a>

<!-- Dark background -->
<a href="/" aria-label="Sprout home">
  <img src="/logo-mono.svg" alt="Sprout" height="24" />
</a>

<!-- Under 24px -->
<img src="/favicon.svg" alt="Sprout" width="16" height="16" />
```

`alt` is the product name only (no "logo"). `aria-label` on the wrapping link clarifies destination.

### Copy

- Write the product name in the casing recorded in [`../brand.md`](../brand.md#selected-name).
- Use the tagline in [`../brand.md`](../brand.md#selected-tagline) verbatim on the landing hero, `<meta>` description, and OG card.
