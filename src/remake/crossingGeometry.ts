import { sites, railLines } from './routeGeometry.ts';
import { passageCameras } from './passageGeometry.ts';
import type { Camera, Vec3 } from './geometry';
export const crossingCameras: Record<'bridge' | 'window' | 'north', Camera> = {
    bridge: { position: [-6, -1, 6.5], target: [-42, 30, 1.7], focal: 1500, width: 1672, height: 941 },
    window: { ...passageCameras.landing, target: [-42, 30, 1.7], focal: 2800 },
    north: { position: [16.5, 8.8, 1.65], target: [-42, 30, 1.7], focal: 2800, width: 1672, height: 941 },
};
export const northRoof = { west: -18, east: 18, south: 7, north: 10, top: 4.5, bottom: 4.25 };
export function oldRailPoint(y: number): Vec3 { const a = sites.C, b = sites.X, t = (y - a.y) / (b.y - a.y); return [a.x + t * (b.x - a.x), y, a.z + t * (b.z - a.z)]; }
export const oldBridge = { start: oldRailPoint(50), end: oldRailPoint(20), halfWidth: 1.6, beamDepth: .5, pierYs: [34, 23] as const };
export const oldBuffer = oldRailPoint(20);
export function roofObscures(point: Vec3, camera: Camera) { const a = camera.position, t = (northRoof.top - a[2]) / (point[2] - a[2]); if (t <= 0 || t >= 1)
    return false; const x = a[0] + t * (point[0] - a[0]), y = a[1] + t * (point[1] - a[1]); return x >= northRoof.west && x <= northRoof.east && y >= northRoof.south && y <= northRoof.north; }
export const crossingRails = () => Object.entries(railLines).map(([id, path]) => ({ id, points: path.map(key => { const p = sites[key]; return [p.x, p.y, p.z] as Vec3; }) }));
