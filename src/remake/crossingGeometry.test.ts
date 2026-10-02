import { describe, it, expect } from 'vitest';
import { crossingCameras, oldRailPoint, oldBuffer, northRoof, roofObscures } from './crossingGeometry';
import { passageCameras, passageWindow } from './passageGeometry';
import { project } from './geometry';
import { railCrossings, sites } from './routeGeometry';
describe('同じ交差を三つの実在する観測点から見る', () => {
    it('窓は踊り場と同じ点、橋は駅の横断部、北はホーム幅内', () => { expect(crossingCameras.window.position).toEqual(passageCameras.landing.position); expect(crossingCameras.bridge.position).toEqual([-6, -1, 6.5]); expect(crossingCameras.north.position[1]).toBeGreaterThanOrEqual(7); expect(crossingCameras.north.position[1]).toBeLessThanOrEqual(10); });
    it('旧線は約4m上を跨ぎ、橋脚は地上線と接触しない。終端はFと別の場所', () => { const cross = railCrossings()[0].point!; expect(Math.abs(cross.z1 - cross.z2)).toBeGreaterThan(4); for (const y of [34, 23]) {
        expect(Math.abs(oldRailPoint(y)[1] - sites.E.y)).toBeGreaterThan(2);
    } expect(oldBuffer).toEqual([-49, 20, 4.5]); expect(oldBuffer[1]).not.toBe(sites.F.y); });
    it('橋ではE側が屋根に隠れ、F側は見える。低い窓と北ホームからE-Fを連続して読める', () => { const e: [
        number,
        number,
        number
    ] = [sites.E.x, sites.E.y, .04], f: [
        number,
        number,
        number
    ] = [sites.F.x, sites.F.y, .04]; expect(roofObscures(e, crossingCameras.bridge)).toBe(true); expect(roofObscures(f, crossingCameras.bridge)).toBe(false); for (const name of ['window', 'north'] as const) {
        for (const point of [e, f, oldBuffer]) {
            expect(roofObscures(point, crossingCameras[name])).toBe(false);
            const p = project(point, crossingCameras[name]);
            expect(p.depth).toBeGreaterThan(0);
            expect(p.x).toBeGreaterThan(100);
            expect(p.x).toBeLessThan(1500);
            expect(p.y).toBeGreaterThan(100);
            expect(p.y).toBeLessThan(800);
        }
    } expect(northRoof.bottom).toBeGreaterThan(3); });
    it('E-Fと高架の終端へ向けた観察線は実際の窓の開口を通る', () => { const c = crossingCameras.window; for (const p of [[sites.E.x, sites.E.y, .1], [sites.F.x, sites.F.y, .1], oldBuffer] as [
        number,
        number,
        number
    ][]) {
        const t = (passageWindow[0][0] - c.position[0]) / (p[0] - c.position[0]), y = c.position[1] + t * (p[1] - c.position[1]), z = c.position[2] + t * (p[2] - c.position[2]);
        expect(y).toBeGreaterThan(9.65);
        expect(y).toBeLessThan(10.875);
        expect(z).toBeGreaterThan(.1);
        expect(z).toBeLessThan(1.65);
    } });
});

it('keeps the unknown ground connection separated at the closer observation framing', () => {
    for (const name of ['window', 'north'] as const) {
        const camera = crossingCameras[name];
        const e = project([sites.E.x, sites.E.y, .04], camera);
        const f = project([sites.F.x, sites.F.y, .04], camera);
        const end = project(oldBuffer, camera);
        expect(Math.abs(e.x - f.x)).toBeGreaterThan(360);
        expect(Math.abs(end.y - (e.y + f.y) / 2)).toBeGreaterThan(230);
        for (const p of [e, f, end]) {
            expect(p.x).toBeGreaterThan(100);
            expect(p.x).toBeLessThan(1572);
            expect(p.y).toBeGreaterThan(100);
            expect(p.y).toBeLessThan(841);
        }
    }
});
