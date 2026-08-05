import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Footer } from './Footer';
import { appName } from '@utils/appName';

// RMIN-135: the footer shows "© <current year> Team Workspace" (reusing the
// shared appName constant), exposed as a contentinfo landmark. The year is read
// from the system clock at render time, so it must track a fixed fake clock
// rather than a hardcoded literal.

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('Footer copyright (RMIN-135)', () => {
  it('AC2: renders "© <year> Team Workspace" for the current year (clock=2099)', () => {
    // fails if the copyright text/format is wrong or the year is not the
    // current-year value.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2099-06-01T00:00:00Z'));
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2099 Team Workspace');
  });

  it('AC2: reads the year from the clock, not a hardcoded literal (clock=2031)', () => {
    // fails if the year were a hardcoded literal: with the clock at 2031 the
    // rendered year must be 2031.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2031-06-01T00:00:00Z'));
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2031 Team Workspace');
    expect(screen.getByRole('contentinfo')).not.toHaveTextContent('2099');
  });

  it('AC3/AC4: exposes the footer as a contentinfo landmark', () => {
    // fails if the footer is not a semantic <footer>/contentinfo landmark
    // (e.g. rendered as a plain <div>) and thus unreachable by AT.
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('AC3: uses the shared appName constant in the copyright line', () => {
    // fails if the footer hardcodes a different name instead of reusing appName
    // ("Team Workspace").
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent(appName);
  });

  it('a11y: the footer introduces no critical/serious axe violations', async () => {
    // mirrors AppShell.a11y.test.tsx (color-contrast disabled — not computable
    // in jsdom); fails if the footer markup regresses into a critical/serious
    // a11y defect.
    const { container } = render(<Footer />);
    const results = await axe(container, {
      rules: { 'color-contrast': { enabled: false } },
    });
    const serious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(serious.map((v) => v.id)).toEqual([]);
  });
});
