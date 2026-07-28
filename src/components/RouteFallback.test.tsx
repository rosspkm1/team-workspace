import { describe, it, expect, afterEach } from 'vitest';
import { Suspense, lazy, type ComponentType } from 'react';
import { render, screen, cleanup, act } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { RouteFallback } from '@components/RouteFallback';

afterEach(() => {
  cleanup();
});

// Builds a React.lazy component whose underlying dynamic import() stays pending
// until `resolve` is called — the same suspend behaviour a real code-split page
// module exhibits while its chunk is still downloading, but with timing we
// control so the loading state is deterministically observable.
function deferredLazyPage() {
  let resolve!: (component: ComponentType) => void;
  const pending = new Promise<ComponentType>((r) => {
    resolve = r;
  });
  const Lazy = lazy(() => pending.then((component) => ({ default: component })));
  return { Lazy, resolve };
}

describe('RouteFallback during code-split load (AC3, AC4)', () => {
  it('shows the accessible loading status while a page module is pending, then the resolved page', async () => {
    // fails if the fallback is not an accessible status region announcing loading
    // (AC4), or if content appears without the module having resolved (AC3 — the
    // page is resolved on demand, not part of the initial synchronous render).
    const { Lazy, resolve } = deferredLazyPage();
    render(
      <Suspense fallback={<RouteFallback />}>
        <Lazy />
      </Suspense>,
    );

    // While the dynamic import is pending, the RouteFallback status region is
    // shown and the page content is not yet present.
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    expect(screen.queryByText('Resolved page content')).not.toBeInTheDocument();

    // Resolving the import replaces the fallback with the page.
    await act(async () => {
      resolve(() => <div>Resolved page content</div>);
    });

    expect(await screen.findByText('Resolved page content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('RouteFallback accessibility (AC6)', () => {
  it('has no critical/serious a11y violations', async () => {
    // fails if the loading fallback regresses into a critical/serious a11y defect.
    const { container } = render(<RouteFallback />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
