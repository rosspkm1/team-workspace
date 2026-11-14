import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { MEMBERS } from '@utils/members';
import DashboardPage from '@pages/DashboardPage';
import ProjectsPage from '@pages/ProjectsPage';
import TeamPage from '@pages/TeamPage';
import NotFoundPage from '@pages/NotFoundPage';
import SettingsPage from '@pages/SettingsPage';

afterEach(() => {
  cleanup();
});

/** See ui.a11y.test.tsx — AC2 = zero critical/serious violations only. */
async function expectNoSeriousViolations(container: HTMLElement) {
  // color-contrast is not computable in jsdom (no layout) and is verified
  // manually per AC5 — disable it here to match AC scope and avoid jsdom noise.
  const results = await axe(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(serious.map((v) => v.id)).toEqual([]);
}

describe('Page axe audit (AC2)', () => {
  it('DashboardPage (route /) has no critical/serious violations', async () => {
    // fails if the Dashboard ("HomePage") page regresses into a critical/serious defect.
    const { container } = render(<DashboardPage />);
    await expectNoSeriousViolations(container);
  });

  it('ProjectsPage has no critical/serious violations', async () => {
    // fails if the Projects page regresses into a critical/serious defect.
    const { container } = render(<ProjectsPage />);
    await expectNoSeriousViolations(container);
  });

  it('TeamPage has no critical/serious violations', async () => {
    // fails if the Team page regresses into a critical/serious defect (this is
    // the RMIN-132 no-selection state — placeholder detail panel showing).
    const { container } = render(<TeamPage />);
    await expectNoSeriousViolations(container);
  });

  it('TeamPage has no critical/serious violations with a member selected (RMIN-132 AC3)', async () => {
    // fails if the member-selected state (detail panel populated with the
    // selected member's record) introduces a critical/serious a11y defect.
    const { container } = render(<TeamPage />);
    const first = MEMBERS[0];
    if (!first) throw new Error('test fixture: MEMBERS seed is empty');

    await userEvent.click(
      screen.getByRole('button', { name: new RegExp(first.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
    );

    await expectNoSeriousViolations(container);
  });

  it('SettingsPage has no critical/serious violations', async () => {
    // fails if the Settings placeholder page regresses into a critical/serious defect.
    const { container } = render(<SettingsPage />);
    await expectNoSeriousViolations(container);
  });

  it('NotFoundPage has no critical/serious violations', async () => {
    // fails if the 404 page regresses into a critical/serious defect.
    const { container } = render(<NotFoundPage />);
    await expectNoSeriousViolations(container);
  });
});

describe('NotFoundPage keyboard/SR substrate (AC5)', () => {
  it('renders an h1 "Page not found" that labels its region', () => {
    // fails if the 404 heading text changes or the section's aria-labelledby no
    // longer points at the h1 — i.e. the region loses its accessible name.
    render(<NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1, name: 'Page not found' });
    expect(heading).toBeInTheDocument();

    // The section is exposed as a landmark region named by the heading via
    // aria-labelledby; getByRole('region', {name}) resolves the association.
    const region = screen.getByRole('region', { name: 'Page not found' });
    expect(region).toContainElement(heading);
  });
});

describe('SettingsPage structure', () => {
  it('renders an h1 "Settings" with id settings-heading that names its region', () => {
    // fails if the heading text or id changes, or the section's aria-labelledby
    // no longer points at the h1 so the region loses its "Settings" name.
    render(<SettingsPage />);

    const heading = screen.getByRole('heading', { level: 1, name: 'Settings' });
    expect(heading).toHaveAttribute('id', 'settings-heading');

    const region = screen.getByRole('region', { name: 'Settings' });
    expect(region).toContainElement(heading);
  });

  it('renders exactly one non-empty paragraph of placeholder copy after the heading', () => {
    // fails if the paragraph is removed, duplicated, emptied, or moved before the h1.
    render(<SettingsPage />);

    const region = screen.getByRole('region', { name: 'Settings' });
    const heading = screen.getByRole('heading', { level: 1, name: 'Settings' });
    const paragraphs = region.querySelectorAll('p');
    expect(paragraphs).toHaveLength(1);
    const paragraph = paragraphs[0]!;

    expect(paragraph.textContent?.trim()).not.toBe('');
    expect(
      heading.compareDocumentPosition(paragraph) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
