import { Component, type ErrorInfo, type ReactNode } from 'react';
import styles from './RouteErrorBoundary.module.css';

export interface RouteErrorBoundaryProps {
  /** The lazily-loaded route subtree guarded by this boundary. */
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary around the lazily-loaded routes. Catches render/load failures
 * from the route subtree below it — most importantly a dynamic import() that
 * rejects when a page's code chunk fails to download — and renders an accessible
 * error state instead of letting the app crash to a blank screen.
 *
 * The app uses the component `<Routes>`/`<Route>` API (not the data router), so
 * react-router's `errorElement` is unavailable; a class error boundary is the
 * supported way to recover from a lazy chunk-load failure.
 */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Surface enough context to debug a chunk-load failure in production.
    console.error('Failed to load route module:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section role="alert" aria-labelledby="route-error-heading" className={styles.error}>
          <h1 id="route-error-heading">Something went wrong</h1>
          <p>This page could not be loaded. Please check your connection and try again.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
