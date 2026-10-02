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

// The first view must show the beam hitting a visible surface, not darkness.
describe('initial lamp feedback', () => {
    it('lights a visible canopy patch before and after each first adjustment at either stand height', async () => {
        const { initialLampAim, opticalBarriers } = await import('./lampOptics');
        const { project } = await import('./geometry');
        for (const braced of [false, true]) {
            for (const [dx, dy] of [[0, 0], [.5, 0], [-.5, 0], [0, .5], [0, -.5]]) {
                let visible = 0;
                for (const wall of opticalBarriers) {
                    for (let x = wall.minX; x < wall.maxX; x += .2) {
                        for (let z = wall.low; z < wall.high; z += .08) {
                            const point: [number, number, number] = [x + .1, wall.y - .002, z + .04];
                            const screen = project(point, opticalCameras.field);
                            if (screen.depth > 0 && screen.x > 40 && screen.x < 1632 && screen.y > 40 && screen.y < 901 && beamAt(point, braced, [initialLampAim[0] + dx, initialLampAim[1] + dy]).lit) visible++;
                        }
                    }
                }
                expect(visible).toBeGreaterThan(0);
            }
        }
    });
});
