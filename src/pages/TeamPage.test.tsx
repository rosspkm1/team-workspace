import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TeamPage from '@pages/TeamPage';
import { MEMBERS, type Member } from '@utils/members';

afterEach(() => {
  cleanup();
});

/** Escape a member's name so it can be embedded safely in an accessible-name regex. */
function nameMatcher(name: string): RegExp {
  return new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

/** Look a raw seed member up by id so tests feed the real data, not a copy. */
function member(id: string): Member {
  const found = MEMBERS.find((m) => m.id === id);
  if (!found) throw new Error(`test fixture: no seeded member with id ${id}`);
  return found;
}

/** Scope queries to the detail panel (the region labelled "Member details"). */
function detailPanel() {
  return within(screen.getByRole('region', { name: 'Member details' }));
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

describe('TeamPage search filter (RMIN-132)', () => {
  it('exposes the search input with an accessible name (AC1 input surface)', () => {
    // fails if the search Input loses its label / accessible name, making it
    // unreachable by assistive tech.
    render(<TeamPage />);

    expect(screen.getByRole('textbox', { name: 'Search members' })).toBeInTheDocument();
  });

  it('filters rows to members whose NAME contains the typed text (AC1)', async () => {
    // fails if typing does not narrow the list by name substring.
    render(<TeamPage />);
    const avery = member('m-avery-stone');
    const blair = member('m-blair-mensah');

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'avery',
    );

    expect(screen.getByRole('button', { name: nameMatcher(avery.name) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: nameMatcher(blair.name) })).toBeNull();
  });

  it('filters rows to members whose ROLE contains the typed text (AC1)', async () => {
    // fails if the filter predicate ignores the role field (only matches name).
    render(<TeamPage />);
    const cora = member('m-cora-vaughn'); // Frontend Engineer
    const blair = member('m-blair-mensah'); // Product Manager

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'engineer',
    );

    expect(screen.getByRole('button', { name: nameMatcher(cora.name) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: nameMatcher(blair.name) })).toBeNull();
  });

  it('matches case-insensitively (AC1)', async () => {
    // fails if the filter becomes case-sensitive — an uppercase query would then
    // match nothing even though the data is mixed-case.
    render(<TeamPage />);
    const avery = member('m-avery-stone');
    const blair = member('m-blair-mensah');

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'AVERY',
    );

    expect(screen.getByRole('button', { name: nameMatcher(avery.name) })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: nameMatcher(blair.name) })).toBeNull();
  });

  it('shows an explicit empty state and no rows when nothing matches (AC2)', async () => {
    // fails if a no-match query renders a blank area instead of the empty-state
    // message, or still renders member rows.
    render(<TeamPage />);

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'zzz',
    );

    expect(screen.getByText('No members match your search')).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('keeps the heading count at the TOTAL, not the filtered count (AC1/RMIN-103)', async () => {
    // fails if the Team (N) heading starts tracking the filtered result length
    // instead of the full seeded member count.
    render(<TeamPage />);

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'avery',
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      new RegExp(`Team\\s*\\(${MEMBERS.length}\\)`),
    );
  });
});

describe('TeamPage member detail panel (RMIN-132)', () => {
  it('shows a neutral placeholder and no member email when nothing is selected (AC4)', () => {
    // fails if the panel is absent from the DOM on first render, or shows member
    // data / an email before any selection is made.
    render(<TeamPage />);
    const avery = member('m-avery-stone');

    const panel = detailPanel();
    expect(panel.getByText('Select a member to see details')).toBeInTheDocument();
    expect(panel.queryByText(avery.email)).toBeNull();
  });

  it("shows the clicked member's name, role and email in the panel (AC3)", async () => {
    // fails if activating a row does not populate the detail panel with that
    // member's full record.
    render(<TeamPage />);
    const avery = member('m-avery-stone');

    await userEvent.click(screen.getByRole('button', { name: nameMatcher(avery.name) }));

    const panel = detailPanel();
    expect(panel.getByText(avery.name)).toBeInTheDocument();
    expect(panel.getByText(avery.role)).toBeInTheDocument();
    expect(panel.getByText(avery.email)).toBeInTheDocument();
    expect(panel.queryByText('Select a member to see details')).toBeNull();
  });

  it('populates the panel when a row is activated via the keyboard (AC3)', async () => {
    // fails if rows are not real buttons (Enter/Space would not activate them) or
    // keyboard activation does not set the selection.
    render(<TeamPage />);
    const grace = member('m-grace-liu');

    screen.getByRole('button', { name: nameMatcher(grace.name) }).focus();
    await userEvent.keyboard('{Enter}');

    const panel = detailPanel();
    expect(panel.getByText(grace.name)).toBeInTheDocument();
    expect(panel.getByText(grace.email)).toBeInTheDocument();
  });

  it("updates the panel to member B after selecting A then B (AC3)", async () => {
    // fails if selecting a second member does not replace the first member's
    // record in the panel.
    render(<TeamPage />);
    const avery = member('m-avery-stone');
    const blair = member('m-blair-mensah');

    await userEvent.click(screen.getByRole('button', { name: nameMatcher(avery.name) }));
    await userEvent.click(screen.getByRole('button', { name: nameMatcher(blair.name) }));

    const panel = detailPanel();
    expect(panel.getByText(blair.name)).toBeInTheDocument();
    expect(panel.getByText(blair.email)).toBeInTheDocument();
    expect(panel.queryByText(avery.name)).toBeNull();
    expect(panel.queryByText(avery.email)).toBeNull();
  });

  it('keeps the selected member in the panel when the search text changes (AC5)', async () => {
    // fails if changing/clearing the filter clears or changes the selection —
    // here the selected member's row is even filtered out of the list, yet the
    // panel must still show that member.
    render(<TeamPage />);
    const avery = member('m-avery-stone');

    await userEvent.click(screen.getByRole('button', { name: nameMatcher(avery.name) }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Search members' }),
      'zzz',
    );

    // Row list is now empty...
    expect(screen.getByText('No members match your search')).toBeInTheDocument();
    // ...but the previously selected member still shows in the detail panel.
    const panel = detailPanel();
    expect(panel.getByText(avery.name)).toBeInTheDocument();
    expect(panel.getByText(avery.role)).toBeInTheDocument();
    expect(panel.getByText(avery.email)).toBeInTheDocument();
  });
});
