import type { ComponentType } from 'react';
import DashboardPage from '@pages/DashboardPage';
import ProjectsPage from '@pages/ProjectsPage';
import TeamPage from '@pages/TeamPage';

/** A single navigable destination in the application. */
export interface RouteEntry {
  /** URL path matched by React Router. */
  path: string;
  /** Human-readable label rendered in the Nav and used as the page title. */
  label: string;
  /** Page component rendered in the AppShell main content slot. */
  Component: ComponentType;
}

/**
 * The single source of truth for the application's navigation entries. Both the
 * React Router config (App.tsx) and the Nav import from here — the route list is
 * never hardcoded or duplicated elsewhere.
 */
export const ROUTES: readonly RouteEntry[] = [
  { path: '/', label: 'Dashboard', Component: DashboardPage },
  { path: '/projects', label: 'Projects', Component: ProjectsPage },
  { path: '/team', label: 'Team', Component: TeamPage },
];
