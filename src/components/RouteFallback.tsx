import styles from './RouteFallback.module.css';

/**
 * Accessible loading indicator shown in the main content area while a lazily
 * loaded route module resolves. Rendered as a `role="status"` live region so
 * screen readers announce that the page is loading; it is replaced by the page
 * once its code chunk has downloaded.
 */
export function RouteFallback() {
  return (
    <div role="status" className={styles.fallback}>
      Loading…
    </div>
  );
}
