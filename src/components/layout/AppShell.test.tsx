import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react';
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
});

describe('AppShell structure (AC3 / AC5)', () => {
  it('renders a skip link pointing at the main content', () => {
    // fails if the skip-to-content link or its target anchor is removed.
    renderShell();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute(
      'href',
      '#main-content',
    );
  });

  it('renders a <main id="main-content"> that contains the passed children', () => {
    // fails if the main slot loses its id or stops rendering children.
    renderShell('Dashboard', <p>hello world</p>);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(within(main).getByText('hello world')).toBeInTheDocument();
  });

  it('renders a Header (brand) and a Nav driven by ROUTES', () => {
    // fails if the Header brand or the ROUTES-driven Nav links disappear from the shell.
    renderShell();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Team Workspace')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    for (const route of ROUTES) {
      expect(within(nav).getByRole('link', { name: route.label })).toBeInTheDocument();
    }
  });
});

describe('AppShell document.title (AC9)', () => {
  it('sets document.title to "[pageTitle] - Team Workspace"', () => {
    // fails if the useEffect no longer composes the title from pageTitle + app name.
    renderShell('Dashboard');
    expect(document.title).toBe('Dashboard - Team Workspace');
  });

  it('updates document.title when pageTitle changes', () => {
    // fails if the title effect is not keyed on pageTitle and goes stale.
    const { rerender } = renderShell('Dashboard');
    expect(document.title).toBe('Dashboard - Team Workspace');
    rerender(
      <MemoryRouter>
        <AppShell pageTitle="Projects">
          <p>page body</p>
        </AppShell>
      </MemoryRouter>,
    );
    expect(document.title).toBe('Projects - Team Workspace');
  });
});

describe('AppShell mobile drawer substrate (AC6)', () => {
  it('renders no drawer until the toggle is activated', () => {
    // fails if the drawer element is rendered while isOpen is false.
    renderShell();
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });

  it('opens the drawer when the hamburger toggle is clicked (pointer)', async () => {
    // fails if the toggle no longer flips isOpen to render the drawer.
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(screen.getByRole('dialog', { name: 'Navigation menu' })).toBeInTheDocument();
  });

  it('makes main content inert while the drawer is open and restores it on close', async () => {
    // fails if background content is not made inert (focus/AT would leak behind the drawer).
    renderShell();
    const main = screen.getByRole('main');
    expect(main).not.toHaveAttribute('inert');
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(main).toHaveAttribute('inert');
    await userEvent.keyboard('{Escape}');
    expect(main).not.toHaveAttribute('inert');
  });

  it('closes the drawer on Escape (keyboard)', async () => {
    // fails if the Escape key handler no longer closes the drawer.
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    expect(screen.getByRole('dialog', { name: 'Navigation menu' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });

  it('closes the drawer via the in-drawer Close button (pointer)', async () => {
    // fails if the drawer Close control is not wired to the close handler.
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    await userEvent.click(within(dialog).getByRole('button', { name: /close navigation menu/i }));
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });

  it('closes the drawer when the overlay is clicked (pointer)', async () => {
    // fails if the overlay click handler is not wired to close the drawer.
    renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    const overlay = dialog.previousElementSibling;
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay as Element);
    expect(screen.queryByRole('dialog', { name: 'Navigation menu' })).not.toBeInTheDocument();
  });
});
