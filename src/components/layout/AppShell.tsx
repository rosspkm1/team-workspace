import { useEffect, useRef, useState, type ReactNode } from 'react';
import { appName } from '@utils/appName';
import { useFocusTrap } from '@hooks/useFocusTrap';
import { Button } from '@components/ui';
import { Header } from './Header';
import { Nav } from './Nav';
import styles from './AppShell.module.css';

const DRAWER_ID = 'mobile-nav-drawer';

export interface AppShellProps {
  /**
   * Drives document.title, which is set to `${pageTitle} - Team Workspace`
   * whenever this value changes.
   */
  pageTitle: string;
  /** Page content rendered inside the <main> slot. */
  children: ReactNode;
}

/**
 * Persistent application chrome that wraps every page: a skip-to-content link,
 * the Header, the primary Nav (a persistent bar on desktop, a focus-trapped
 * drawer on mobile), and the <main> content slot. Owns the mobile drawer's
 * open/closed state and keeps document.title in sync with pageTitle.
 */
export function AppShell({ pageTitle, children }: AppShellProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  const closeDrawer = () => setDrawerOpen(false);
  const toggleDrawer = () => setDrawerOpen((open) => !open);

  useEffect(() => {
    document.title = `${pageTitle} - ${appName}`;
  }, [pageTitle]);

  // Trap keyboard focus inside the drawer while it is open.
  useFocusTrap(drawerRef, isDrawerOpen);

  // While the drawer is open, close it on Escape and make the main content
  // inert so background content is not reachable by keyboard or AT.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    const main = mainRef.current;
    main?.setAttribute('inert', '');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      main?.removeAttribute('inert');
    };
  }, [isDrawerOpen]);

  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#main-content">
        Skip to content
      </a>

      <Header isDrawerOpen={isDrawerOpen} onToggleDrawer={toggleDrawer} drawerId={DRAWER_ID} />

      <Nav variant="bar" className={styles.barNav} />

      <main id="main-content" ref={mainRef} className={styles.main}>
        {children}
      </main>

      {isDrawerOpen && (
        <>
          <div className={styles.overlay} onClick={closeDrawer} aria-hidden="true" />
          <div
            id={DRAWER_ID}
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className={styles.drawerHeader}>
              <Button variant="secondary" onClick={closeDrawer} aria-label="Close navigation menu">
                Close
              </Button>
            </div>
            <Nav variant="drawer" onNavigate={closeDrawer} />
          </div>
        </>
      )}
    </div>
  );
}
