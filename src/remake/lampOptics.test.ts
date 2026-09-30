import { describe, it, expect } from 'vitest';
import { lampSource, rayBarrier, opticalTarget, opticalCameras, responseBeacon, beamAt, beamEnd } from './lampOptics';
describe('lamp through the physical window and canopy', () => {
    it('the low socket strikes the wall, raised support clears both roofs, and a high source strikes the near canopy', () => { expect(rayBarrier(lampSource(false), opticalTarget)?.id).toBe('wall'); expect(rayBarrier(lampSource(true), opticalTarget)).toBeNull(); expect(rayBarrier([21.4, -3.2, 2], opticalTarget)?.id).toBe('near-roof'); });
    it('the actual inside-room observation ray sees both rail ends and the north-platform response beacon through the same opening', () => { expect(rayBarrier(opticalCameras.window.position, opticalTarget)).toBeNull(); expect(rayBarrier(opticalCameras.window.position, responseBeacon)).toBeNull(); expect(rayBarrier(opticalCameras.window.position, [-49, 30, .08])).toBeNull(); expect(rayBarrier(opticalCameras.window.position, [-33, 30, .08])).toBeNull(); });
    it('aim affects the cone and barrier contact continuously, with no solution flag', () => {
        expect(beamEnd(true, [0, 4]).hit).toBe('far-roof');
        expect(beamEnd(true, [0, 7]).hit).toBe('near-roof');
        expect(beamAt(opticalTarget, true, [0, 0]).lit).toBe(true);
        expect(beamAt(opticalTarget, true, [0, 7]).lit).toBe(false);
        expect(beamAt(opticalTarget, false, [0, 0]).lit).toBe(false);
    });
});
