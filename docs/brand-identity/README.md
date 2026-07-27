# Brand Identity — US 1.9

This folder holds the content deliverables for **US 1.9 — Name, logo, tagline**.
The **name, tagline, availability scan, and team vote** live one level up in
[`../brand.md`](../brand.md) so the story acceptance criterion ("Final name
and tagline are documented in `docs/brand.md`") is met at the expected path.
This folder holds the supporting content — logo usage rules and per-task
artifacts — that other branches consume (logo SVG, favicon, frontend
rollout).

## Files

| File                           | Task                               | Purpose                                                                                                                         |
| ------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [`../brand.md`](../brand.md)   | T-1.9.1, T-1.9.2, T-1.9.3, T-1.9.6 | Candidate names, availability scan, team vote, tagline candidates. Also holds the "Selected name" and "Selected tagline" slots. |
| [logo-usage.md](logo-usage.md) | T-1.9.7                            | Do / Don't for logo usage. Drafted here; gets pasted into `docs/design-system.md` when that branch merges.                      |

## Story acceptance criteria — status

| #   | Criterion                                                      | Owner                                | Status                                                                                                                             |
| --- | -------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Final name and tagline are documented in `docs/brand.md`       | Docs (this branch, T-1.9.3, T-1.9.6) | **Converging on Sprout** (with SabaRich as strongest backup) — name + tagline preloaded in `brand.md`; awaiting async team confirm |
| 2   | Logo renders correctly at 24px and 240px sizes                 | Design (T-1.9.4)                     | Not started (no logo SVG on this branch); usage rules in `logo-usage.md` specify the 24–240px range and plant-growth logo concept  |
| 3   | Favicon and app icons are installed and visible in browser tab | Design + frontend (T-1.9.5, T-1.9.8) | Not started; expected file paths + plant-symbol source documented in `logo-usage.md`                                               |
| 4   | README uses the real product name, not a placeholder           | Frontend / docs (T-1.9.8)            | Not started (root `README.md` still says "Project Name"); blocked on T-1.9.3 async confirm                                         |

## Task deliverables — status

| Task                                              | Type            | Status                                                                                                                                                                                                             |
| ------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T-1.9.1 Brainstorm 10+ candidate names            | content         | **Done (draft)** — 4 team submissions + 8-candidate backup pool in [`../brand.md`](../brand.md#candidate-names-t-191)                                                                                              |
| T-1.9.2 Check availability for top 3              | content         | **Structure ready** — scan table for the 4 team candidates in [`../brand.md`](../brand.md#availability-scan-t-192); cells marked `[verify]` for whoever runs the scan                                              |
| T-1.9.3 Team vote to pick the name                | content         | **Fast-path in flight** — async confirm on Sprout (SabaRich as backup) in [`../brand.md`](../brand.md#team-confirm-t-193); reactions pending                                                                       |
| T-1.9.4 Design wordmark or logo (SVG)             | design          | Not started (no logo SVG on this branch); concept + growth-state spec in [`../brand.md`](../brand.md#visual-identity-concept-plant-growth-loop) and [`logo-usage.md`](logo-usage.md#plant-growth-states)           |
| T-1.9.5 Generate favicon + app icons              | design          | Not started; expected filenames + "favicon derives from `plant.svg`" rule in [`logo-usage.md`](logo-usage.md#brand)                                                                                                |
| T-1.9.6 Write tagline                             | content         | **Done (draft)** — Sprout tagline ("Plant your money. Watch it grow.") plus the original SabaRich tagline and 8 more backups in [`../brand.md`](../brand.md#tagline-candidates-t-196); winner pending same confirm |
| T-1.9.7 Add brand usage examples to design system | docs            | **Done (draft)** — content in [`logo-usage.md`](logo-usage.md); gets pasted into `docs/design-system.md` when that branch merges                                                                                   |
| T-1.9.8 Roll out the brand across the app         | frontend / docs | Not started; checklist ready in [`../brand.md`](../brand.md#rollout-checklist-t-198)                                                                                                                               |

## Follow-up before this story can close

1. **Run T-1.9.2 (availability scan).** Fill each `[verify]` cell in the
   [availability table](../brand.md#availability-scan-t-192) — do this
   **before** the confirm below so we don't lock in a name whose handles are
   all taken. Story AC requires `.com` (or acceptable alternative) available
   for at least 1 of the top 3, plus Instagram + X handles checked.
2. **Run T-1.9.3 (async team confirm on Sprout).** Every teammate marks
   👍 / 🤔 / 👎 in the
   [team confirm table](../brand.md#team-confirm-t-193). If it clears with
   ≤ 1 👎, delete the "pending async team confirm" flags in the
   [Selected name](../brand.md#selected-name) and
   [Selected tagline](../brand.md#selected-tagline) tables. If 2+ 👎s land,
   fall back to a ranked vote over the top 3 that survived T-1.9.2 (Sprout,
   SabaRich, and whichever survives the availability scan).
3. **T-1.9.6 (tagline)** rides along with the same confirm — candidate 1
   ("Plant your money. Watch it grow.") is locked to the Sprout name; if
   the confirm surfaces SabaRich / Saba as the final pick, use backup
   candidate 2 ("Plant your savings. Watch your wealth grow.") instead.
4. **Route this folder to a mentor reviewer.** Reviewer fills the
   `Mentor reviewer` / `Mentor review date` slots in
   [`../brand.md`](../brand.md).
5. **When `docs/design-system.md` lands** (from the T-1.3.x branch), lift the
   "Brand" section from [`logo-usage.md`](logo-usage.md) into it as described
   at the top of that file, and update the design-system table of contents.
6. **When T-1.9.4 and T-1.9.5 land** (SVG + favicon files in `web/public/`),
   the T-1.9.8 rollout checklist in
   [`../brand.md`](../brand.md#rollout-checklist-t-198) is unblocked. Design
   should treat the plant-growth concept in
   [`../brand.md`](../brand.md#visual-identity-concept-plant-growth-loop) as
   the source spec for the logo and the per-lesson plant states.
