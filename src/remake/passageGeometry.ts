import type { Camera, Vec3 } from './geometry';
export const passage = {
    west: 15.7, east: 17.3, floor: -3, ceiling: -.65,
    southStart: -8.4, southBottom: -3.9, northBottom: 6.1, northTop: 9.475,
    southSteps: 18, northSteps: 15, exitSteps: 5, landingFloor: -.75,
    landingEnd: 10.875,
};
export const passageCameras: Record<'entry' | 'north' | 'south' | 'landing', Camera> = {
    entry: { position: [16.5, -9.2, 1.55], target: [16.5, -4.4, -1.4], focal: 550, width: 1672, height: 941 },
    north: { position: [16.5, -3.7, -1.45], target: [16.5, 7, -1.45], focal: 580, width: 1672, height: 941 },
    south: { position: [16.5, 5.9, -1.45], target: [16.5, -5, -1.45], focal: 580, width: 1672, height: 941 },
    landing: { position: [16.5, 10.2, .9], target: [-35, 30, 1], focal: 900, width: 1672, height: 941 },
};
export function passageSteps(end: 'south' | 'north') {
    const r = passage, count = end === 'south' ? r.southSteps : r.northSteps;
    const start = end === 'south' ? r.southStart : r.northBottom;
    const run = end === 'south' ? (r.southBottom - r.southStart) / count : (r.northTop - r.northBottom) / count;
    const startZ = end === 'south' ? 0 : r.floor;
    const rise = end === 'south' ? r.floor / count : (r.landingFloor - r.floor) / count;
    return Array.from({ length: count }, (_, i) => ({ y: start + i * run, end: start + (i + 1) * run, z: startZ + (i + 1) * rise, previousZ: startZ + i * rise }));
}
export const passageWindow: Vec3[] = [[15.7, 9.65, .1], [15.7, 10.875, .1], [15.7, 10.875, 1.65], [15.7, 9.65, 1.65]];
