import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { Suspense, lazy } from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { RouteErrorBoundary } from '@components/RouteErrorBoundary';

// The boundary logs the caught error via console.error (componentDidCatch), and
// React itself logs the boundary-caught render error. Silence both so the
// intentional failure does not spam the test output; the assertions below still
// prove the error UI rendered.
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// A lazily-loaded route whose dynamic import() rejects, standing in for a page
// code chunk that fails to download. React.lazy surfaces this rejection as a
// render error the boundary must catch.
const FailingLazyPage = lazy(() =>
  Promise.reject(new Error('Failed to fetch dynamically imported module')),
);

describe('RouteErrorBoundary chunk-load failure (AC5)', () => {
  it('renders an accessible error state instead of crashing when a lazy chunk fails to load', async () => {
    // fails if the boundary does not catch a rejected dynamic import — the app
    // would crash to a blank screen instead of showing the error state.
    render(
      <RouteErrorBoundary>
        <Suspense fallback={<div role="status">Loading…</div>}>
          <FailingLazyPage />
        </Suspense>
      </RouteErrorBoundary>,
    );

    // The accessible error region (role="alert" with a heading) appears once the
    // import rejection propagates.
    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Something went wrong' }),
    ).toBeInTheDocument();
  });

  it('renders its children unchanged when no error occurs', () => {
    // fails if the boundary swallows or alters the happy-path subtree it wraps.
    render(
      <RouteErrorBoundary>
        <p>healthy route content</p>
      </RouteErrorBoundary>,
    );
    expect(screen.getByText('healthy route content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('error state has no critical/serious a11y violations (AC6)', async () => {
    // fails if the rendered error state regresses into a critical/serious a11y
    // defect.
    const { container } = render(
      <RouteErrorBoundary>
        <Suspense fallback={<div role="status">Loading…</div>}>
          <FailingLazyPage />
        </Suspense>
      </RouteErrorBoundary>,
    );
    await screen.findByRole('alert');
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
