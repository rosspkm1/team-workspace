import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import App from './App';

afterEach(() => {
  cleanup();
});

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

// Mirrors AppShell.a11y.test.tsx: color-contrast is not computable in jsdom and
// is audited manually, so it is disabled; only critical/serious violations fail.
async function expectNoSeriousViolations(container: HTMLElement) {
  const results = await axe(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(serious.map((v) => v.id)).toEqual([]);
}

describe('App route rendering (AC1)', () => {
  it('renders Dashboard at "/"', async () => {
    // fails if "/" no longer resolves to the Dashboard page (route wiring or the
    // lazy import for DashboardPage broken).
    renderApp('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('renders Projects at "/projects"', async () => {
    // fails if "/projects" no longer resolves to the Projects page.
    renderApp('/projects');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Projects' }),
    ).toBeInTheDocument();
  });

  it('renders Team at "/team"', async () => {
    // fails if "/team" no longer resolves to the Team page.
    renderApp('/team');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Team' }),
    ).toBeInTheDocument();
  });
});

describe('App unknown-route fallback (AC2)', () => {
  it('renders NotFoundPage for an unrecognized path', async () => {
    // fails if an unknown path stops falling back to NotFoundPage (catch-all
    // "*" route removed or misordered).
    renderApp('/nope');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });
});

describe('App accessibility (AC6)', () => {
  it('has no critical/serious violations once a page has resolved', async () => {
    // fails if a resolved route + app shell regresses into a critical/serious
    // a11y defect.
    const { container } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    await expectNoSeriousViolations(container);
  });

  it('has no critical/serious violations with the mobile drawer open', async () => {
    // fails if opening the drawer over the code-split routes regresses into a
    // critical/serious a11y defect.
    const { container } = renderApp('/');
    await screen.findByRole('heading', { level: 1, name: 'Dashboard' });
    await userEvent.click(
      screen.getByRole('button', { name: /open navigation menu/i }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Navigation menu' }),
    ).toBeInTheDocument();
    await expectNoSeriousViolations(container);
  });
});
