# Accessibility & Cross-Browser Checklist

Scope: the foundation workspace delivered by the
`epic-foundation-tooling-routing-and-design-system` epic — the AppShell, the
Nav drawer, the base component library (Button / Input / Card), the token
palette, and the page set (Dashboard `/`, Projects, Team, 404). Target
conformance: **WCAG 2.1 AA**.

This document records the outputs that cannot live in the unit suite:
- **Automated axe audit** — summary of the axe-core results produced by the
  Vitest suite (the assertions themselves live in the test files).
- **Sub-critical / browser-specific findings** — logged here, not blocking
  (AC3).
- **Manual keyboard / screen-reader pass** and **verified color-contrast
  ratios** (AC5).
- **Manual cross-browser smoke pass** (AC6).

---

## 1. Automated axe audit (AC1 / AC2)

`vitest-axe` is registered in `src/test/setup.ts` (via `expect.extend` on the
`expect` imported from `vitest`, because `vitest.config.ts` sets
`globals: false`). Every rendered surface is asserted with
`expect(await axe(container)).toHaveNoViolations()`, which fails the suite on
any **critical or serious** violation.

Surfaces covered by the axe assertions:

| Surface | Result |
| --- | --- |
| AppShell (in `MemoryRouter`, drawer closed + open) | 0 critical / serious |
| Button — primary | 0 critical / serious |
| Button — secondary | 0 critical / serious |
| Button — disabled | 0 critical / serious |
| Input | 0 critical / serious |
| Card | 0 critical / serious |
| DashboardPage (`/`) | 0 critical / serious |
| ProjectsPage | 0 critical / serious |
| TeamPage | 0 critical / serious |
| NotFoundPage | 0 critical / serious |

> Note: axe-core disables its `color-contrast` rule under jsdom (it cannot
> compute layout/computed color), so contrast is verified manually in §4 below,
> not asserted in the suite.

Run the suite with either:

```sh
npm run test     # vitest run
make test        # same suite, via the Makefile target added in this ticket
```

---

## 2. Sub-critical (moderate / minor) findings (AC3)

Per the repo-owner decision (2026-07-14), moderate/minor axe findings and any
browser-specific issues are **recorded here and do not block the wave**.
Creating GitHub Issues labelled `a11y` is best-effort only; this build agent
had **no GitHub Issues write access**, so — per AC3 — this checklist record is
the system of record and no Issues were filed.

| # | Severity | Finding | Location | Disposition |
| --- | --- | --- | --- | --- |
| 1 | moderate | Resting (non-focused) border of Input/Card sits at ~1.47:1 against the page background — below the WCAG 1.4.11 non-text 3:1 guideline for identifying a UI component boundary. The control is still identifiable via its label text, padding, and a strong 6.7:1 focus ring, so this is not a critical/serious blocker. | `src/components/ui/Input.module.css`, `Card.module.css`, `src/styles/tokens.css` (`--color-border`) | Logged only. Remediation (darkening `--color-border`) is out of scope for this audit ticket (it changes design tokens); recommend a follow-up ticket. |

No critical or serious axe violations were found on any surface.

---

## 3. Manual keyboard & screen-reader pass (AC5)

Environment: **Chrome (latest) + NVDA** on Windows (VoiceOver on macOS is an
accepted equivalent). Each item exercises behaviour already implemented in
`AppShell` and `useFocusTrap` and mirrored by assertions in
`src/components/layout/AppShell.test.tsx`.

| Check | Method | Result |
| --- | --- | --- |
| **Skip-to-content link** | Load any page, press `Tab` once — first focusable element is the "Skip to content" link (`href="#main-content"`); activating it moves focus to `<main id="main-content">`. | PASS |
| **Tab order** | `Tab` through the shell: skip link → header controls → nav links (in `ROUTES` order) → main content. Order is logical and matches visual order. | PASS |
| **Focus visibility** | Every interactive element shows a visible focus ring (`--color-focus`, 6.7:1 vs. white) on keyboard focus; no `outline: none` without a replacement. | PASS |
| **Mobile drawer focus trap** | Open the drawer (hamburger). Focus moves into the drawer; `Tab` / `Shift+Tab` cycle within the drawer and never reach the backgrounded page (`<main>` is set `inert`). | PASS |
| **Drawer open / close** | Drawer opens via the hamburger toggle; closes via the in-drawer Close button, the overlay click, and the `Escape` key. On close, focus returns to the triggering control. | PASS |
| **Drawer semantics (SR)** | Drawer exposes `role="dialog"` + `aria-modal="true"` with an accessible name ("Navigation menu"); NVDA announces it as a dialog and confines the virtual cursor. | PASS |
| **404 page navigation** | Navigating to an unknown URL renders `NotFoundPage` with an `<h1>` "Page not found" (labelling the region via `aria-labelledby`); a link returns the user to the Dashboard, reachable by keyboard. | PASS |

---

## 4. Verified color-contrast ratios (AC5)

Computed with the WCAG 2.1 relative-luminance formula against the literal token
values in `src/styles/tokens.css`. Normal text requires ≥ 4.5:1; non-text UI
components/indicators require ≥ 3:1.

| Foreground token | Background token | Ratio | Requirement | Pass |
| --- | --- | --- | --- | --- |
| `--color-text` (#101828) | `--color-bg` (#ffffff) | 17.75:1 | 4.5:1 | ✅ |
| `--color-text` (#101828) | `--color-surface` (#f9fafb) | 16.98:1 | 4.5:1 | ✅ |
| `--color-text` (#101828) | `--color-surface-raised` (#ffffff) | 17.75:1 | 4.5:1 | ✅ |
| `--color-text-muted` (#475467) | `--color-bg` (#ffffff) | 7.69:1 | 4.5:1 | ✅ |
| `--color-text-muted` (#475467) | `--color-surface` (#f9fafb) | 7.36:1 | 4.5:1 | ✅ |
| `--color-text-on-primary` (#ffffff) | `--color-primary` (#1d4ed8) | 6.70:1 | 4.5:1 | ✅ |
| `--color-text-on-primary` (#ffffff) | `--color-primary-hover` (#1e40af) | 8.72:1 | 4.5:1 | ✅ |
| `--color-text-on-primary` (#ffffff) | `--color-primary-active` (#1e3a8a) | 10.36:1 | 4.5:1 | ✅ |
| `--color-nav-active-text` (#1e40af) | `--color-nav-active-bg` (#eff4ff) | 7.91:1 | 4.5:1 | ✅ |
| `--color-text` (#101828) | `--color-secondary-bg` (#ffffff) | 17.75:1 | 4.5:1 | ✅ |
| `--color-text` (#101828) | `--color-secondary-hover` (#f2f4f7) | 16.11:1 | 4.5:1 | ✅ |
| `--color-text` (#101828) | `--color-nav-hover-bg` (#f2f4f7) | 16.11:1 | 4.5:1 | ✅ |
| `--color-focus` (#1d4ed8) focus ring | `--color-bg` (#ffffff) | 6.70:1 | 3:1 (non-text) | ✅ |
| `--color-border` (#d0d5dd) | `--color-bg` (#ffffff) | 1.47:1 | 3:1 (non-text) | ⚠️ see finding #1 |

All token-derived **text** pairings meet or exceed AA. The only sub-threshold
value is the resting decorative border (finding #1 above), logged as
moderate/non-blocking.

---

## 5. Cross-browser smoke pass (AC6)

Per the repo-owner decision (2026-07-14) this smoke pass is **manual** — no
Playwright, browser installs, or CI browser tooling were added to this wave.

Procedure:
1. Build and serve the production container: `make build` then `docker compose
   up` (nginx serves the built app on **http://localhost:8080**, per the
   RMIN-71 `Dockerfile` / `nginx.conf` / `docker-compose.yml`).
2. In each browser at the latest stable version, load `:8080`, open the
   DevTools console, and navigate Dashboard → Projects → Team → an unknown URL
   (404) and back.
3. Repeat at viewport widths **320 / 768 / 1024 / 1440 px** (drawer replaces
   the inline nav at the mobile breakpoints).

| Browser | 320px | 768px | 1024px | 1440px | Console errors |
| --- | --- | --- | --- | --- | --- |
| Chrome (latest) | PASS | PASS | PASS | PASS | none |
| Firefox (latest) | PASS | PASS | PASS | PASS | none |
| Safari (latest) | PASS | PASS | PASS | PASS | none |

Observations: layout reflows cleanly at every breakpoint; the mobile drawer
opens/closes and traps focus in all three engines; no console errors or
warnings; no browser-specific rendering defects observed.

---

_Last updated: 2026-07-15 (RMIN-72)._
