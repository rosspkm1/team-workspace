import { describe, it, expect } from 'vitest';
import { ROUTES } from '@config/routes';

// AC2 — ROUTES is the single source of truth the Nav and Router consume. These
// tests assert the exported data the Nav renders from (not a type declaration).
describe('ROUTES (AC2)', () => {
  it('is a non-empty collection', () => {
    // fails if the ROUTES export is emptied — the Nav would render no links.
    expect(ROUTES.length).toBeGreaterThan(0);
  });

  it('gives every entry a string path and a string label', () => {
    // fails if any entry loses its path/label — the Nav builds links from these.
    for (const entry of ROUTES) {
      expect(typeof entry.path).toBe('string');
      expect(entry.path.length).toBeGreaterThan(0);
      expect(typeof entry.label).toBe('string');
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it('contains the initial Home/Dashboard entry at "/"', () => {
    // fails if the root Dashboard entry is removed — the shell needs a landing route.
    const home = ROUTES.find((entry) => entry.path === '/');
    expect(home).toBeDefined();
    expect(home?.label).toBe('Dashboard');
  });
});
