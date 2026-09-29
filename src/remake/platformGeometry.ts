import { project } from './geometry.ts';
import type { Camera, Vec3 } from './geometry.ts';
export const northCamera: Camera = { position: [7, 12, 1.65], target: [7, 5, 1.65], focal: 560, width: 1672, height: 941 };
export const platformPoint = (x: number, y: number, z = 0) => project([x, y, z], northCamera);
export const platformPolygon = (points: Vec3[]) => points.map(p => { const q = project(p, northCamera); return `${q.x},${q.y}`; }).join(' ');
export const carriageSideY = 6.22;
export const lampRowY = 7.65;
export const platformFrontY = 7;
