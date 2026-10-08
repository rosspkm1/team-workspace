import { describe, it, expect } from 'vitest';
import { BUILD_CHANNEL } from './build-channel';
import * as buildChannelModule from './build-channel';

describe('build-channel (RMIN-356)', () => {
  it('BUILD_CHANNEL is "stable" (AC3, AC10)', () => {
    // fails if the constant's value changes to anything other than 'stable'
    expect(BUILD_CHANNEL).toBe('stable');
  });

  it('exposes only the BUILD_CHANNEL named export (AC4)', () => {
    // fails on a default export or any extra named export
    expect(Object.keys(buildChannelModule)).toEqual(['BUILD_CHANNEL']);
  });
});
