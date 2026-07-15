// Registers @testing-library/jest-dom matchers (toBeInTheDocument,
// toHaveAttribute, etc.) with Vitest's expect and its types.
import '@testing-library/jest-dom/vitest';

// Registers the vitest-axe accessibility matcher so any test can assert
// `expect(await axe(container)).toHaveNoViolations()`.
//
// vitest.config.ts sets `globals: false`, so there is no global `expect` to
// extend — we import `expect` from vitest and call expect.extend(...) on it
// directly. The `declare module 'vitest'` augmentation below teaches the
// TypeScript compiler about the new matcher so the strict build script
// (`tsc --noEmit && vite build`) still passes when tests use it.
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe/matchers';

expect.extend(axeMatchers);

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
