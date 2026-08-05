import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TeamPage from '@pages/TeamPage';
import { MEMBERS } from '@utils/members';

afterEach(() => {
  cleanup();
});

/** Escape a member's name so it can be embedded safely in an accessible-name regex. */
function nameMatcher(name: string): RegExp {
  return new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

describe('TeamPage heading member count', () => {
  it('renders the real seeded member count inside the level-1 heading (RMIN-103)', () => {
    // fails if the heading count stops deriving from the MEMBERS collection
    // (e.g. reverts to the old empty-placeholder "0" or hardcodes a number).
    render(<TeamPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(new RegExp(`Team\\s*\\(${MEMBERS.length}\\)`));
  });
});

describe('TeamPage member directory', () => {
  it("renders each seeded member's name and role in the directory (AC2)", () => {
    // fails if a member is dropped from the rendered list or its name/role is
    // not displayed in the row.
    render(<TeamPage />);

    for (const member of MEMBERS) {
      expect(screen.getByText(member.name)).toBeInTheDocument();
      expect(screen.getByText(member.role)).toBeInTheDocument();
    }
  });

  it('renders one focusable button control per member with the name in its accessible name (AC3)', () => {
    // fails if rows stop being native buttons (losing keyboard focusability) or a
    // button's accessible name no longer includes its member's name.
    render(<TeamPage />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(MEMBERS.length);

    for (const member of MEMBERS) {
      expect(
        screen.getByRole('button', { name: nameMatcher(member.name) }),
      ).toBeInTheDocument();
    }
  });

  it('exposes each member id via data-member-id on its row control (AC4)', () => {
    // fails if the data-member-id hook is dropped or wired to the wrong value —
    // the later selection story reads this attribute.
    render(<TeamPage />);

    const buttons = screen.getAllByRole('button');
    for (const member of MEMBERS) {
      const row = buttons.find((b) => b.getAttribute('data-member-id') === member.id);
      expect(row, `no row control for member id ${member.id}`).toBeDefined();
      expect(row!).toHaveAttribute('data-member-id', member.id);
      expect(row!).toHaveAccessibleName(nameMatcher(member.name));
    }
  });

  it('renders exactly as many row controls as members in the module (AC5)', () => {
    // fails if the list is hardcoded with a different count than MEMBERS, proving
    // the rows are derived from the shared module rather than inline literals.
    render(<TeamPage />);

    expect(screen.getAllByRole('button')).toHaveLength(MEMBERS.length);
  });
});
