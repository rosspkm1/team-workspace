import { NavLink } from 'react-router-dom';
import { ROUTES } from '@config/routes';
import styles from './Nav.module.css';

export interface NavProps {
  /**
   * "bar" renders a horizontal persistent nav (desktop); "drawer" renders a
   * vertical list for the mobile slide-in panel. Defaults to "bar".
   */
  variant?: 'bar' | 'drawer';
  /** Invoked after a link is activated — used to close the mobile drawer. */
  onNavigate?: () => void;
  /** Extra class applied to the <nav> element. */
  className?: string;
}

/**
 * Primary navigation rendered from the shared ROUTES source of truth. Uses
 * React Router's NavLink so the active route automatically carries
 * aria-current="page".
 */
export function Nav({ variant = 'bar', onNavigate, className }: NavProps) {
  const navClasses = [styles.nav, styles[variant], className].filter(Boolean).join(' ');
  return (
    <nav className={navClasses} aria-label="Primary">
      <ul className={styles.list}>
        {ROUTES.map(({ path, label }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                [styles.link, isActive ? styles.active : ''].filter(Boolean).join(' ')
              }
              onClick={onNavigate}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
