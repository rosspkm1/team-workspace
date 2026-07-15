import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { axe } from 'vitest-axe';
import DashboardPage from '@pages/DashboardPage';
import ProjectsPage from '@pages/ProjectsPage';
import TeamPage from '@pages/TeamPage';
import NotFoundPage from '@pages/NotFoundPage';

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
    // fails if the Team page regresses into a critical/serious defect.
    const { container } = render(<TeamPage />);
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
