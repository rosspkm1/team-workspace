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
  it('renders a skip link pointing at the main content (RMIN-126 AC3)', () => {
    // fails if the skip-to-content link loses its href fragment targeting the main region.
    renderShell();
    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('renders a <main id="main-content"> that contains the passed children', () => {
    // fails if the main slot loses its id or stops rendering children.
    renderShell('Dashboard', <p>hello world</p>);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(within(main).getByText('hello world')).toBeInTheDocument();
  });

  it('makes the main region a focusable skip target with tabindex="-1" (RMIN-126 AC5)', () => {
    // fails if <main> is no longer focusable as a skip target (tabIndex removed),
    // so activating the skip link could not move focus into it.
    renderShell();
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toHaveAttribute('tabindex', '-1');
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

describe('AppShell skip link (RMIN-126 AC1/AC2/AC4)', () => {
  it('exposes a link whose exact accessible name is "Skip to main content" (AC2)', () => {
    // fails if the link text drifts from the exact required name (e.g. back to
    // "Skip to content"), so AT users no longer hear the specified label.
    renderShell();
    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toBeInTheDocument();
  });

  it('is the first focusable element, ordered before the header/nav (AC1)', () => {
    // fails if the skip link stops being the first link in DOM/tab order, so a
    // keyboard user would tab through the chrome before reaching it.
    renderShell();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    const banner = screen.getByRole('banner');

    // It is the first link in document order.
    expect(screen.getAllByRole('link')[0]).toBe(skip);
    // And it precedes the header/banner in the DOM.
    expect(skip.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('stays exposed in the accessibility tree while unfocused (AC4)', () => {
    // fails if the resting link is hidden from AT (aria-hidden / hidden / display:none),
    // which would defeat the skip link for screen-reader and keyboard users.
    renderShell();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toBeInTheDocument();
    expect(skip).not.toHaveAttribute('aria-hidden');
    expect(skip).not.toHaveAttribute('hidden');
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
