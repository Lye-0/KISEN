import { describe, it, expect } from 'vitest';
import { bellReturns, bellRecord, readBellRecord, bellSamples, bellPulse } from './bellCircuit';
describe('arbitrary live bell intervals and a fixed recording', () => {
    it('allows an accidental matching rhythm, but a changed interval distinguishes the two circuits', () => { expect(bellReturns(1000, [1000, 1550], 0)).toEqual(bellReturns(1000, [1000, 1550], 1)); expect(bellReturns(1000, [1000, 1910, 2520], 0)).toEqual([1900, 2450]); expect(bellReturns(1000, [1000, 1910, 2520], 1)).toEqual([1900, 2810, 3420]); });
    it('records only the returns already observed and round-trips measured intervals without a solution flag', () => { const snapshot = bellRecord(1000, [1000, 1910, 2520], 1, 2900); expect(readBellRecord(snapshot)).toEqual({ channel: 1, start: 1000, inputs: [0, 910, 1520], responses: [900, 1810] }); expect(readBellRecord([1, 1000, 2, 0, 1, 5, 900])).toBeNull(); expect(bellPulse(1960, [1900])).toBe(true); expect(bellPulse(2250, [1900])).toBe(false); });
    it('generates a single non-clipping strike with no voice and a smooth tail', () => { const s = bellSamples(); expect(s).toHaveLength(22050); expect(Math.max(...s.map(Math.abs))).toBeLessThan(.3); expect(s.at(-1)).toBeCloseTo(0, 5); });
});
