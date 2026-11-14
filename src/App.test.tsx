import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
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
    // fails if "/team" no longer resolves to the Team page, or if the Team
    // heading's accessible name no longer carries the member count (RMIN-103).
    renderApp('/team');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Team (0)' }),
    ).toBeInTheDocument();
  });
});

describe('App Help route', () => {
  it('renders the Help page at "/help" instead of the 404 page', async () => {
    // fails if "/help" is not wired into the router (falls through to the
    // catch-all) or the Help page's h1 is missing or renamed.
    renderApp('/help');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Help' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Page not found' }),
    ).not.toBeInTheDocument();
  });

  it('shows a "Help" link to "/help" in the primary navigation', async () => {
    // fails if the Help route has no nav entry or the link points elsewhere.
    renderApp('/help');
    await screen.findByRole('heading', { level: 1, name: 'Help' });
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('link', { name: 'Help' })).toHaveAttribute(
      'href',
      '/help',
    );
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

describe('App footer presence across routes (RMIN-135 AC1)', () => {
  // The footer lives in AppShell, outside <Routes>, so it must appear on every
  // route including the unknown-path (404) fallback.
  it.each(['/', '/projects', '/team', '/nope'])(
    'renders a contentinfo footer on %s',
    async (path) => {
      // fails if the footer is missing from a route, or is no longer a
      // contentinfo landmark carrying the app name.
      renderApp(path);
      // Wait for the code-split page to resolve so the shell is fully rendered.
      await screen.findByRole('heading', { level: 1 });
      expect(screen.getByRole('contentinfo')).toHaveTextContent('Team Workspace');
    },
  );
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
