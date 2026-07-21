import { describe, it, expect, afterEach, vi } from 'vitest';
import { devLog } from '@utils/devLog';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('devLog dev-mode logging (AC1 / AC2)', () => {
  it('prints the given message to the console when import.meta.env.DEV is true', () => {
    // fails if devLog stops emitting the confirmation message in dev mode.
    // (import.meta.env.DEV is true by default under vitest.)
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    devLog('Navigated to the Projects page');
    expect(spy).toHaveBeenCalledWith('[devlog] Navigated to the Projects page');
  });

  it('carries the caller\'s descriptive message verbatim, only prefixed (does not rewrite it to a generic string)', () => {
    // fails if devLog swallows or replaces the caller's descriptive message (AC2).
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    devLog('Opened the mobile navigation menu');
    devLog('Closed the mobile navigation menu');
    expect(spy).toHaveBeenNthCalledWith(1, '[devlog] Opened the mobile navigation menu');
    expect(spy).toHaveBeenNthCalledWith(2, '[devlog] Closed the mobile navigation menu');
  });

  it('prefixes the output with "[devlog] " so confirmations are filterable in a busy console', () => {
    // fails if the filterable [devlog] prefix (requested in PR review) is dropped.
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    devLog('Navigated to the Dashboard page');
    const [message] = spy.mock.calls[0]!;
    expect(String(message)).toMatch(/^\[devlog] /);
    // the original message is still present after the prefix, not replaced.
    expect(String(message)).toContain('Navigated to the Dashboard page');
  });
});

describe('devLog production guard (AC3 substrate)', () => {
  it('does NOT print to the console when import.meta.env.DEV is false', () => {
    // fails if the env guard is removed and messages leak into non-dev runs.
    vi.stubEnv('DEV', false);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    devLog('Navigated to the Dashboard page');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('devLog has no user-visible effect (AC5 substrate)', () => {
  it('returns nothing (it is a pure console side effect, not a value or element)', () => {
    // fails if devLog starts returning a value / building DOM instead of only logging.
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(devLog('Navigated to the Team page')).toBeUndefined();
  });
});
