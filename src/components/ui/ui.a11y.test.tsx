import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Button, Input, Card } from '@components/ui';

afterEach(() => {
  cleanup();
});

/**
 * AC2 requires ZERO critical/serious axe violations (moderate/minor are logged,
 * not blocking, per AC3). vitest-axe's toHaveNoViolations() fails on ANY
 * violation — including best-practice/moderate rules (e.g. `region`) that a
 * lone component trips when rendered outside a landmark. So we assert precisely
 * what AC2 states: no critical or serious violations.
 */
async function expectNoSeriousViolations(container: HTMLElement) {
  // color-contrast is not computable in jsdom (no layout) and is verified
  // manually per AC5 — disable it here to match AC scope and avoid jsdom noise.
  const results = await axe(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  // Surfacing the rule ids makes a failure self-explanatory.
  expect(serious.map((v) => v.id)).toEqual([]);
}

describe('Base component axe audit (AC2)', () => {
  it('Button — primary has no critical/serious violations', async () => {
    // fails if a primary Button renders markup with a critical/serious a11y defect.
    const { container } = render(<Button variant="primary">Save changes</Button>);
    await expectNoSeriousViolations(container);
  });

  it('Button — secondary has no critical/serious violations', async () => {
    // fails if a secondary Button renders markup with a critical/serious a11y defect.
    const { container } = render(<Button variant="secondary">Cancel</Button>);
    await expectNoSeriousViolations(container);
  });

  it('Button — disabled has no critical/serious violations', async () => {
    // fails if a disabled Button renders markup with a critical/serious a11y defect.
    const { container } = render(
      <Button variant="primary" disabled>
        Submit
      </Button>,
    );
    await expectNoSeriousViolations(container);
  });

  it('Input (with associated label) has no critical/serious violations', async () => {
    // fails if a labelled Input renders markup with a critical/serious a11y defect
    // (e.g. the label/input association regresses, producing an unlabelled control).
    const { container } = render(<Input label="Email address" />);
    await expectNoSeriousViolations(container);
  });

  it('Card has no critical/serious violations', async () => {
    // fails if Card renders markup with a critical/serious a11y defect.
    const { container } = render(
      <Card>
        <p>Card content</p>
      </Card>,
    );
    await expectNoSeriousViolations(container);
  });
});
