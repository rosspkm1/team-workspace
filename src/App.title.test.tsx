import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

// Renders the real App (pages are code-split via React.lazy) inside a
// MemoryRouter and asserts on document.title. The title is derived synchronously
// from the active route by App + AppShell, independent of the lazy page chunk,
// so it is observable without waiting for the page body. The app-name suffix is
// asserted only through the rendered title, never by reading the appName constant.

function renderAppAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  document.title = 'sentinel';
});

afterEach(() => {
  cleanup();
});

describe('App browser-tab title', () => {
  it('AC1/AC2: sets the exact "Projects · Team Workspace" title at "/projects"', async () => {
    // fails if /projects does not set a route-specific title, drops the app name,
    // or uses a separator other than the middle dot.
    renderAppAt('/projects');
    await waitFor(() => expect(document.title).toBe('Projects · Team Workspace'));
  });

  it('AC1: sets the "Team · Team Workspace" title at "/team"', async () => {
    // fails if the /team route does not set its own descriptive title.
    renderAppAt('/team');
    await waitFor(() => expect(document.title).toBe('Team · Team Workspace'));
  });

  it('AC3: both route titles share the identical " · Team Workspace" app-name suffix', async () => {
    // fails if the app-name suffix differs between routes (i.e. is not sourced
    // from the single appName constant).
    renderAppAt('/projects');
    await waitFor(() => expect(document.title.endsWith(' · Team Workspace')).toBe(true));
    cleanup();
    document.title = 'sentinel';
    renderAppAt('/team');
    await waitFor(() => expect(document.title.endsWith(' · Team Workspace')).toBe(true));
  });

  it('AC4: updates the title on client-side navigation without a reload', async () => {
    // fails if the title does not track the route on client-side navigation.
    const user = userEvent.setup();
    renderAppAt('/');
    await waitFor(() => expect(document.title).toBe('Dashboard · Team Workspace'));
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(nav).getByRole('link', { name: 'Projects' }));
    await waitFor(() => expect(document.title).toBe('Projects · Team Workspace'));
  });

  it('AC6: an unknown path yields the "Not found" default title, not a stale prior title', async () => {
    // fails if an unregistered path retains a stale title instead of the sensible
    // "Not found" default.
    renderAppAt('/does-not-exist');
    await waitFor(() => expect(document.title).toBe('Not found · Team Workspace'));
  });
});
