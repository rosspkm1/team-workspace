import { appName } from '@utils/appName';
import styles from './Footer.module.css';

/** Persistent site footer showing the current-year copyright line. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <small>© {year} {appName}</small>
    </footer>
  );
}
