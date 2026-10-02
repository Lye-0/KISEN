import type { Vec3, Camera } from './geometry';
import { sites } from './routeGeometry.ts';
export const opticalTarget: Vec3 = [(sites.E.x + sites.F.x) / 2, sites.E.y, .08];
export const opticalCameras: Record<'window' | 'field', Camera> = { window: { position: [22.7, -4.4, 1.6], target: [...opticalTarget], focal: 700, width: 1672, height: 941 }, field: { position: [20.12, -3.2, 1.6], target: [...opticalTarget], focal: 3200, width: 1672, height: 941 } };
export const opticsWindow = { x: 20, minY: -4.5, maxY: -2.2, sill: .9, head: 2.05 };
export const opticalBarriers = [{ id: 'wall', y: -1.5, minX: 14, maxX: 21, low: 0, high: 1.1 }, { id: 'near-roof', y: -1.5, minX: 15, maxX: 21, low: 1.75, high: 1.95 }, { id: 'far-roof', y: .2, minX: 13, maxX: 21, low: 1.8, high: 1.9 }] as const;
export const responseBeacon: Vec3 = [5, 8, 1.3];
export const fieldMarkers = [{ id: 'white', position: [sites.E.x - 2.1, sites.E.y + 1.6, 0] as Vec3, color: 'white', rings: 1 }, { id: 'black', position: [sites.E.x + 2.1, sites.E.y - 2.1, 0] as Vec3, color: 'black', rings: 2 }] as const;
export const opticalSamples: Record<string, Vec3> = { E: [sites.E.x, sites.E.y, .08], F: [sites.F.x, sites.F.y, .08], white: [fieldMarkers[0].position[0], fieldMarkers[0].position[1], 1.25], black: [fieldMarkers[1].position[0], fieldMarkers[1].position[1], 1.25] };
const sub = (a: Vec3, b: Vec3) => a.map((n, i) => n - b[i]) as Vec3;
const dot = (a: Vec3, b: Vec3) => a.reduce((n, v, i) => n + v * b[i], 0);
const unit = (v: Vec3) => { const length = Math.hypot(...v); return v.map(n => n / length) as Vec3; };
export const lampSource = (braced: boolean): Vec3 => [21.4, -3.2, braced ? 1.4 : 1];
export function rayBarrier(source: Vec3, target: Vec3): {
    id: string;
    point: Vec3;
} | null {
    const delta = sub(target, source), hits: {
        id: string;
        point: Vec3;
        t: number;
    }[] = [];
    if (delta[0] !== 0) {
        const t = (opticsWindow.x - source[0]) / delta[0];
        if (t > 0 && t < 1) {
            const point = source.map((n, i) => n + t * delta[i]) as Vec3;
            if (Math.abs(point[2] - 1.475) < .015 || [-3.733, -2.967].some(y => Math.abs(point[1] - y) < .015))
                hits.push({ id: 'window-bar', point, t });
            if (point[1] < opticsWindow.minY || point[1] > opticsWindow.maxY || point[2] < opticsWindow.sill || point[2] > opticsWindow.head)
                hits.push({ id: 'window-frame', point, t });
        }
    }
    if (delta[1] !== 0)
        for (const o of opticalBarriers) {
            const t = (o.y - source[1]) / delta[1];
            if (t <= 0 || t >= 1)
                continue;
            const point = source.map((n, i) => n + t * delta[i]) as Vec3;
            if (point[0] >= o.minX && point[0] <= o.maxX && point[2] >= o.low && point[2] <= o.high)
                hits.push({ id: o.id, point, t });
        }
    const hit = hits.sort((a, b) => a.t - b.t)[0];
    return hit ? { id: hit.id, point: hit.point } : null;
}
export function lampDirection(aim: number[]): Vec3 {
    const base = sub(opticalTarget, lampSource(false)), yaw = Math.atan2(base[1], base[0]) + (aim[0] ?? 0) * Math.PI / 180, pitch = Math.atan2(base[2], Math.hypot(base[0], base[1])) + (aim[1] ?? 0) * Math.PI / 180;
    return [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
}
export const validAim = (v: number[]) => v.length === 2 && v.every(n => Number.isFinite(n) && n >= -9 && n <= 9 && Math.round(n * 2) === n * 2);
// Begin with a visible patch on the canopy, before aiming toward the tracks.
export const initialLampAim = [4, 6.5];
export const beamHalfAngle = 1.8 * Math.PI / 180;
export function beamAt(point: Vec3, braced: boolean, aim: number[]) { const source = lampSource(braced), line = unit(sub(point, source)), direction = lampDirection(aim), angle = Math.acos(Math.max(-1, Math.min(1, dot(line, direction)))); return { angle, obstruction: rayBarrier(source, point), lit: angle < beamHalfAngle && rayBarrier(source, point) === null }; }
export function beamEnd(braced: boolean, aim: number[]): {
    point: Vec3;
    hit: string | null;
} { const source = lampSource(braced), direction = lampDirection(aim), target = source.map((n, i) => n + direction[i] * 95) as Vec3, hit = rayBarrier(source, target); return { point: hit?.point ?? target, hit: hit?.id ?? null }; }
