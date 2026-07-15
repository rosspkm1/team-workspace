import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Nav } from '@components/layout/Nav';
import { ROUTES } from '@config/routes';

afterEach(() => {
  cleanup();
});

function renderNavAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Nav />
    </MemoryRouter>,
  );
}

describe('Nav (AC2 / AC7)', () => {
  it('renders one link per ROUTES entry using the ROUTES labels', () => {
    // fails if the Nav stops driving its links from ROUTES (hardcodes or drops entries).
    renderNavAt('/');
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(ROUTES.length);
    for (const route of ROUTES) {
      expect(within(nav).getByRole('link', { name: route.label })).toBeInTheDocument();
    }
  });

  it('marks the active route with aria-current="page" (AC7)', () => {
    // fails if NavLink active wiring breaks and the current route is not marked.
    renderNavAt('/projects');
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark non-active routes with aria-current (AC7)', () => {
    // fails if aria-current leaks onto inactive links (e.g. root matching everything).
    renderNavAt('/projects');
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Team' })).not.toHaveAttribute('aria-current');
  });
});
