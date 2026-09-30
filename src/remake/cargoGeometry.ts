import { buildingCameras, project } from './geometry.ts';
import type { Camera, Vec3 } from './geometry';
import { cargoBoxes } from './cargo.ts';
export const cargoRoom = { west: 12, east: 15, south: -12, north: -6, ceiling: 3.2 };
export const cargoCamera = buildingCameras.cargo;
export const cargoSouthCamera: Camera = { position: [13.5, -10.7, 1.65], target: [13.5, -12, 1.8], focal: 430, width: 1672, height: 941 };
export const cargoStairDoor: Vec3[] = [[15, -9.4, 0], [15, -8.5, 0], [15, -8.5, 2.35], [15, -9.4, 2.35]];
export const cargoOfficeDoor: Vec3[] = [[12, -10.2, 0], [12, -8.8, 0], [12, -8.8, 2.35], [12, -10.2, 2.35]];
export const cargoNorthWindow: Vec3[] = [[12.55, -6, 1], [14.45, -6, 1], [14.45, -6, 2.9], [12.55, -6, 2.9]];
export function projectedBounds(points: Vec3[], camera = cargoCamera) {
    const ps = points.map(p => project(p, camera));
    const x = Math.min(...ps.map(p => p.x)), y = Math.min(...ps.map(p => p.y));
    return { x, y, w: Math.max(...ps.map(p => p.x)) - x, h: Math.max(...ps.map(p => p.y)) - y };
}
export function cargoVisualBounds(box: ReturnType<typeof cargoBoxes>[number], camera = cargoCamera) {
    const height = box.id === 'trolley' ? .9 : box.h;
    return projectedBounds([box.x, box.x + box.w].flatMap(x => [box.y, box.y + box.d].flatMap(y => [0, height].map(z => [x, y, z] as Vec3))), camera);
}
