# Architecture notes

## Navigation layout: top bar (not sidebar)

The AppShell uses a **top bar** navigation layout rather than a left sidebar:

- A slim **Header** bar carries the brand and (on mobile) the hamburger toggle.
- A persistent horizontal **Nav** bar sits directly beneath the Header on
  viewports ≥ 768px.
- Below 768px the persistent bar is hidden and navigation collapses into a
  **slide-in drawer** opened by the hamburger toggle.

### Why top bar over sidebar

- The workspace has a small, flat set of top-level destinations (Dashboard,
  Projects, Team). A horizontal bar presents them without spending permanent
  horizontal space that a sidebar would consume.
- Maximizing content width matters for the data/table-heavy pages this shell
  will host; a fixed sidebar narrows every page.
- The top-bar → mobile-drawer collapse is a well-understood, low-friction
  responsive pattern and keeps the shell simple.

If the destination count grows substantially or nested sections appear, revisit
this decision in favour of a collapsible sidebar.

## Focus management for the mobile drawer

Focus is trapped inside the open drawer via the `useFocusTrap` hook
(`src/hooks/useFocusTrap.ts`), a self-contained utility (no third-party
dependency). While the drawer is open the `<main>` content is additionally
marked `inert` so background content is not reachable. The drawer closes on
Escape, on the toggle button, and on an overlay click.

## Single source of truth for routes

`src/config/routes.ts` exports `ROUTES`. Both the React Router configuration
(`src/App.tsx`) and the `Nav` component read from it — the route list is defined
in exactly one place and never duplicated.

## Design tokens

`src/styles/tokens.css` defines the color palette (including `--color-focus`),
radii, and elevation as CSS custom properties, imported once at the app root.
All shell and base-component styles reference these tokens; no color literals
appear outside the token file.
