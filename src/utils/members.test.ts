import { describe, it, expect } from 'vitest';
import { MEMBERS } from '@utils/members';

describe('MEMBERS seed collection', () => {
  it('exposes at least 6 members (AC1)', () => {
    // fails if the seed collection is trimmed below the 6-member minimum the
    // directory story relies on.
    expect(MEMBERS.length).toBeGreaterThanOrEqual(6);
  });

  it('gives every member a non-empty string id, name, role, and email (AC1)', () => {
    // fails if any seed entry drops a required field or ships an empty/non-string
    // value — the row rendering and data-member-id hook depend on all four.
    for (const member of MEMBERS) {
      for (const field of ['id', 'name', 'role', 'email'] as const) {
        expect(typeof member[field]).toBe('string');
        expect(member[field].length).toBeGreaterThan(0);
      }
    }
  });

  it('gives every member a unique id (AC1)', () => {
    // fails if two members share an id — a later selection story keys off id, so
    // collisions would make rows ambiguous.
    const ids = MEMBERS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
