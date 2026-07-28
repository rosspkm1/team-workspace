import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

/** A single navigable destination in the application. */
export interface RouteEntry {
  /** URL path matched by React Router. */
  path: string;
  /** Human-readable label rendered in the Nav and used as the page title. */
  label: string;
  /**
   * Page component rendered in the AppShell main content slot. Pages are loaded
   * on demand via React.lazy (route-based code-splitting), so this is typically
   * a LazyExoticComponent resolved by a dynamic import rather than an eagerly
   * imported component.
   */
  Component: ComponentType | LazyExoticComponent<ComponentType>;
}

/**
 * The single source of truth for the application's navigation entries. Both the
 * React Router config (App.tsx) and the Nav import from here — the route list is
 * never hardcoded or duplicated elsewhere.
 *
 * Each page is referenced through a dynamic import() wrapped in React.lazy so
 * its code is split into a separate chunk and fetched only when its route is
 * first visited, keeping the app shell's initial bundle lean.
 */
export const ROUTES: readonly RouteEntry[] = [
  { path: '/', label: 'Dashboard', Component: lazy(() => import('@pages/DashboardPage')) },
  { path: '/projects', label: 'Projects', Component: lazy(() => import('@pages/ProjectsPage')) },
  { path: '/team', label: 'Team', Component: lazy(() => import('@pages/TeamPage')) },
];
