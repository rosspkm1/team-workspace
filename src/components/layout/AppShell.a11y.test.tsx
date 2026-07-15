import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { axe } from 'vitest-axe';
import { AppShell } from '@components/layout/AppShell';

afterEach(() => {
  cleanup();
});

/** See ui.a11y.test.tsx — AC2 = zero critical/serious violations only. */
async function expectNoSeriousViolations(container: HTMLElement) {
  // color-contrast is not computable in jsdom (no layout) and is verified
  // manually per AC5 — disable it here to match AC scope and avoid jsdom noise.
  const results = await axe(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(serious.map((v) => v.id)).toEqual([]);
}

function renderShell() {
  return render(
    <MemoryRouter>
      <AppShell pageTitle="Dashboard">
        <p>page body</p>
      </AppShell>
    </MemoryRouter>,
  );
}

describe('AppShell axe audit (AC2)', () => {
  it('has no critical/serious violations with the drawer closed', async () => {
    // fails if the shell chrome (skip link, header, nav bar, main) regresses into
    // a critical/serious a11y defect.
    const { container } = renderShell();
    await expectNoSeriousViolations(container);
  });

  it('has no critical/serious violations with the mobile drawer open', async () => {
    // fails if the open drawer (role=dialog/aria-modal, close button, drawer nav)
    // regresses into a critical/serious a11y defect.
    const { container } = renderShell();
    await userEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    // Confirm the drawer is actually rendered before auditing it.
    expect(screen.getByRole('dialog', { name: 'Navigation menu' })).toBeInTheDocument();
    await expectNoSeriousViolations(container);
  });
});

describe('axe matcher wiring (AC1)', () => {
  it('detects a real violation — the matcher is registered and not a no-op', async () => {
    // An input with no associated label / accessible name is a critical/serious
    // axe violation. This proves setup.ts actually wired vitest-axe: if the
    // matcher were missing or a no-op, this test would fail to detect anything.
    const { container } = render(<input type="text" />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });

    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    // fails if axe stops detecting the unlabelled control (wiring broken / no-op).
    expect(serious.length).toBeGreaterThan(0);

    // fails if the toHaveNoViolations matcher is not registered (AC1): the
    // registered matcher must throw when real violations are present.
    expect(() => expect(results).toHaveNoViolations()).toThrow();
  });
});
