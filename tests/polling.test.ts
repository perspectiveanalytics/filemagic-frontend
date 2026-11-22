import { describe, expect, it } from 'vitest';
import { jobPollingTimeout } from '../src/lib/polling';

describe('server polling budget', () => {
  it('allows the complete queue and video-processing budget', () => {
    expect(jobPollingTimeout(790, 300_000)).toBe(790_000);
  });

  it.each([undefined, null, '790', NaN, Infinity, 0, -1])('falls back for invalid value %s', value => {
    expect(jobPollingTimeout(value, 60_000)).toBe(60_000);
  });

  it('bounds an excessive server budget', () => {
    expect(jobPollingTimeout(100_000, 60_000)).toBe(3_600_000);
  });
});
