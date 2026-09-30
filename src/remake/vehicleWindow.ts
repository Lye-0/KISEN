import type { Camera, Vec3 } from './geometry';
export const fPhotoCamera: Camera = { position: [-40.3836, 31.27, 1.4], target: [-49, 33.823, 1.4], focal: 500, width: 1672, height: 941 };
export const shortWindow = { y: 31.3, front: -41.75, rear: -40.4, sill: .98, head: 1.81, bar: [1.467, 1.493] };
export const windowCorners: Vec3[] = [[shortWindow.front, shortWindow.y, shortWindow.sill], [shortWindow.rear, shortWindow.y, shortWindow.sill], [shortWindow.rear, shortWindow.y, shortWindow.head], [shortWindow.front, shortWindow.y, shortWindow.head]];
export function photoWindowHit(p: Vec3) { const c = fPhotoCamera.position, t = (shortWindow.y - c[1]) / (p[1] - c[1]); if (t <= 0 || t >= 1)
    return null; const q = c.map((v, i) => v + t * (p[i] - v)) as Vec3; return q[0] >= shortWindow.front && q[0] <= shortWindow.rear && q[2] >= shortWindow.sill && q[2] <= shortWindow.head && !(q[2] >= shortWindow.bar[0] && q[2] <= shortWindow.bar[1]) ? q : null; }
