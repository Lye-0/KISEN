export type Vec3 = [
    number,
    number,
    number
];
export interface Camera {
    position: Vec3;
    target: Vec3;
    focal: number;
    width: number;
    height: number;
}
const sub = (a: Vec3, b: Vec3): Vec3 => a.map((v, i) => v - b[i]) as Vec3;
const dot = (a: Vec3, b: Vec3) => a.reduce((v, n, i) => v + n * b[i], 0);
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => { const l = Math.hypot(...a); return a.map(n => n / l) as Vec3; };
export function project(p: Vec3, c: Camera) { const forward = unit(sub(c.target, c.position)), right = unit(cross(forward, [0, 0, 1])), up = cross(right, forward), v = sub(p, c.position), depth = dot(v, forward); return { x: c.width / 2 + c.focal * dot(v, right) / depth, y: c.height / 2 - c.focal * dot(v, up) / depth, depth }; }
/** Clip a physical surface before perspective projection, including cameras close to a window. */
export function clipCameraPolygon(vertices: Vec3[], camera: Camera, near = .02): Vec3[] {
    const result: Vec3[] = [];
    for (let i = 0; i < vertices.length; i++) {
        const a = vertices[i], b = vertices[(i + 1) % vertices.length], da = project(a, camera).depth, db = project(b, camera).depth, insideA = da >= near, insideB = db >= near;
        if (insideA)
            result.push(a);
        if (insideA !== insideB) {
            const t = (near - da) / (db - da);
            result.push(a.map((n, k) => n + t * (b[k] - n)) as Vec3);
        }
    }
    return result;
}
export const towerCameras: Record<'west' | 'east', Camera> = { west: { position: [-18, -8, 2.4], target: [0, 0, 6], focal: 1400, width: 1672, height: 941 }, east: { position: [18, -8, 2.4], target: [0, 0, 6], focal: 1400, width: 1672, height: 941 } };
export const tower = { corners: [[-1.2, -1.2], [1.2, -1.2], [1.2, 1.2], [-1.2, 1.2]], height: 12, ladderX: -1.22, ladderY: -.95 };
export const poles = [{ id: 'scarred', base: [-6, -3.1, 0] as Vec3, height: 10, radius: .15, scar: 6.3 }, { id: 'plain', base: [6, -3.1, 0] as Vec3, height: 10, radius: .15, scar: null }];
export const stationBuilding = { width: 18, depth: 6, bay: 3, knownRooms: [{ id: 'waiting', from: 0, to: 6 }, { id: 'office', from: 6, to: 12 }, { id: 'cargo', from: 12, to: 15 }], stairs: { from: 15, to: 18 }, windowCenters: [1.5, 4.5, 7.5, 10.5, 13.5, 16.5] };
export const buildingCameras: Record<string, Camera> = { street: { position: [-6, -27, 2], target: [9, -9, 2.6], focal: 1050, width: 1672, height: 941 }, bridge: { position: [-6, -1, 6.5], target: [9, -9, 2.7], focal: 900, width: 1672, height: 941 }, waiting: { position: [3, -6.4, 1.65], target: [3, -12, 1.9], focal: 1000, width: 1672, height: 941 }, office: { position: [9, -6.4, 1.65], target: [9, -12, 1.9], focal: 1000, width: 1672, height: 941 }, cargo: { position: [13.5, -11.8, 1.55], target: [13.5, -7.7, 1.2], focal: 580, width: 1672, height: 941 } };
