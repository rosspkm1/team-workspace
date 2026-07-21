import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppShell } from '@components/layout/AppShell';
import { ROUTES } from '@config/routes';

function renderShell(pageTitle = 'Dashboard', children: ReactNode = <p>page body</p>) {
  return render(
    <MemoryRouter>
      <AppShell pageTitle={pageTitle}>{children}</AppShell>
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('AppShell navigation confirmations (AC4a / AC1 / AC2)', () => {
  it.each(ROUTES.map((r) => r.label))(
    'logs a confirmation naming the "%s" page on navigation to it',
    (label) => {
      // fails if navigation to a known route stops emitting a page-naming confirmation.
      const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
      renderShell(label);
      expect(spy).toHaveBeenCalledWith(`Navigated to the ${label} page`);
    },
  );

  it('logs once per navigation as the resolved page changes (multiple rapid navigations)', () => {
    // fails if the confirmation is not keyed on pageTitle (goes stale or double-fires).
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { rerender } = renderShell('Dashboard');
    const rerenderTo = (pageTitle: string) =>
      rerender(
        <MemoryRouter>
          <AppShell pageTitle={pageTitle}>
            <p>page body</p>
          </AppShell>
        </MemoryRouter>,
      );
    rerenderTo('Projects');
    rerenderTo('Team');

    const navCalls = spy.mock.calls.filter(([msg]) => String(msg).startsWith('Navigated to the'));
    expect(navCalls).toEqual([
      ['Navigated to the Dashboard page'],
      ['Navigated to the Projects page'],
      ['Navigated to the Team page'],
    ]);
  });

  it('does NOT log a navigation confirmation for an unknown route (NotFound edge)', () => {
    // fails if an unknown page title (not a successful key action) still emits a success message.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderShell('Not found');
    const navCalls = spy.mock.calls.filter(([msg]) => String(msg).startsWith('Navigated to the'));
    expect(navCalls).toEqual([]);
  });
});

describe('AppShell drawer confirmations (AC4b / AC4c / AC2)', () => {
  it('logs an "opened" confirmation when the mobile drawer is opened', async () => {
    // fails if opening the drawer stops emitting an open confirmation.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(spy).toHaveBeenCalledWith('Opened the mobile navigation menu');
  });

  it('logs a "closed" confirmation when the drawer is closed via the Close button', async () => {
    // fails if closing the drawer via the Close control stops emitting a close confirmation.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    await userEvent.click(within(dialog).getByRole('button', { name: /close navigation menu/i }));
    expect(spy).toHaveBeenCalledWith('Closed the mobile navigation menu');
  });

  it('logs a "closed" confirmation when the drawer is closed via Escape', async () => {
    // fails if the Escape-to-close path does not emit a close confirmation.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await userEvent.keyboard('{Escape}');
    expect(spy).toHaveBeenCalledWith('Closed the mobile navigation menu');
  });
});

describe('AppShell logging is silent in production builds (AC3 substrate)', () => {
  it('emits no console output for navigation or drawer actions when DEV is false', async () => {
    // fails if the dev guard is bypassed and confirmations run in a non-dev build.
    vi.stubEnv('DEV', false);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderShell('Dashboard');
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    await userEvent.keyboard('{Escape}');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('AppShell logging has no effect on rendered output (AC5 substrate)', () => {
  it('renders identical DOM whether logging is active (DEV) or silenced (production)', () => {
    // fails if emitting confirmations mutates the DOM instead of being a pure console side effect.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { container } = renderShell('Dashboard');
    const domWithLogging = container.innerHTML;
    // logging actually fired in the dev case (guards against a no-op comparison).
    expect(spy).toHaveBeenCalledWith('Navigated to the Dashboard page');
    cleanup();

    vi.stubEnv('DEV', false);
    const { container: silenced } = renderShell('Dashboard');
    expect(silenced.innerHTML).toBe(domWithLogging);
  });
});
