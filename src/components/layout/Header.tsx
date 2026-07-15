import { appName } from '@utils/appName';
import { Button } from '@components/ui';
import styles from './Header.module.css';

export interface HeaderProps {
  /** Whether the mobile navigation drawer is currently open. */
  isDrawerOpen: boolean;
  /** Toggles the mobile navigation drawer open/closed. */
  onToggleDrawer: () => void;
  /** id of the controlled drawer element, for aria-controls wiring. */
  drawerId: string;
}

/**
 * Top application bar: the brand name plus the hamburger toggle that opens the
 * mobile navigation drawer. The toggle is hidden on desktop, where the
 * persistent Nav bar is shown instead.
 */
export function Header({ isDrawerOpen, onToggleDrawer, drawerId }: HeaderProps) {
  return (
    <header className={styles.header}>
      <Button
        variant="secondary"
        className={styles.menuButton}
        onClick={onToggleDrawer}
        aria-label={isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isDrawerOpen}
        aria-controls={drawerId}
      >
        <span aria-hidden="true">☰</span>
      </Button>
      <span className={styles.brand}>{appName}</span>
    </header>
  );
}
