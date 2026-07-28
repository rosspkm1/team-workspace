import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import TeamPage from '@pages/TeamPage';

afterEach(() => {
  cleanup();
});

describe('TeamPage heading member count', () => {
  it('renders the member count inside the level-1 heading (AC1)', () => {
    // fails if the count is dropped from the h1 or the heading no longer derives
    // its number from the page's members collection (currently empty → 0).
    render(<TeamPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    // The "Team" label and the count both live in the same heading.
    expect(heading).toHaveTextContent(/Team/);
    expect(heading).toHaveTextContent(/0/);
  });

  it('shows the numeral "0" for the empty members list, not empty text (AC2)', () => {
    // fails if the empty state hides/omits the count or renders it as blank
    // instead of the literal "0".
    render(<TeamPage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('0');
    expect(heading.textContent).toMatch(/Team\s*\(0\)/);
  });

  it('exposes the count as part of the heading accessible name (AC3)', () => {
    // fails if the count is aria-hidden or otherwise excluded from the accessible
    // name — the name-filtered role query would not resolve then.
    render(<TeamPage />);

    // Querying by an accessible-name regex that requires the "0" proves the
    // numeral is part of the computed accessible name, not decorative markup.
    expect(
      screen.getByRole('heading', { level: 1, name: /0/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Team (0)' }),
    ).toBeInTheDocument();
  });
});
