/**
 * Shared team-member data module.
 *
 * Static, in-repo seed data — the app has no data layer yet. This is the
 * single source of truth a later member-selection/detail story will consume,
 * so the `Member` field names and the `MEMBERS` shape are a stable contract:
 * keep field names stable and ids unique.
 */

/** A single team member. All fields are non-empty strings; `id` is unique. */
export interface Member {
  /** Stable unique identifier, surfaced to consumers via `data-member-id`. */
  id: string;
  /** Full display name. */
  name: string;
  /** Job title / role within the team. */
  role: string;
  /** Contact email address. */
  email: string;
}

/** Seed collection of team members rendered by the Team directory. */
export const MEMBERS: readonly Member[] = [
  { id: 'm-avery-stone', name: 'Avery Stone', role: 'Engineering Lead', email: 'avery.stone@example.com' },
  { id: 'm-blair-mensah', name: 'Blair Mensah', role: 'Product Manager', email: 'blair.mensah@example.com' },
  { id: 'm-cora-vaughn', name: 'Cora Vaughn', role: 'Frontend Engineer', email: 'cora.vaughn@example.com' },
  { id: 'm-devon-park', name: 'Devon Park', role: 'Backend Engineer', email: 'devon.park@example.com' },
  { id: 'm-elena-ruiz', name: 'Elena Ruiz', role: 'Product Designer', email: 'elena.ruiz@example.com' },
  { id: 'm-farid-noor', name: 'Farid Noor', role: 'QA Engineer', email: 'farid.noor@example.com' },
  { id: 'm-grace-liu', name: 'Grace Liu', role: 'Data Analyst', email: 'grace.liu@example.com' },
];
