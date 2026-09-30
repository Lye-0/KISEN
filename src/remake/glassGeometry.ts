import { project } from './geometry.ts';
import type { Camera, Vec3 } from './geometry.ts';
/** One plane and one set of world objects for both lateral observations. */
export const glass = { y: 23, minX: -40.5, maxX: -35.5, sill: .55, head: 2.85 };
export const glassCameras: Camera[] = [-.4, .4].map(dx => ({ position: [-37 + dx, 22, 1.8], target: [-51, 33, 1.7], focal: 700, width: 1672, height: 941 }));
export const tunnelPortal = { x: -61, y: 36, width: 6, height: 5.8 };
export const glassPosts = [
    { id: 'f-white', position: [-41, 32.1, 0] as Vec3, color: 'white', reflected: false },
    { id: 'f-black', position: [-55, 32.1, 0] as Vec3, color: 'black', reflected: false },
    { id: 'd-white', position: [-46, 2.1, 0] as Vec3, color: 'white', reflected: true },
    { id: 'd-black', position: [-53, 5, 0] as Vec3, color: 'black', reflected: true }
] as const;
export const reflect = (p: Vec3): Vec3 => [p[0], 2 * glass.y - p[1], p[2]];
export function glassHit(p: Vec3, camera: Camera): Vec3 | null {
    const c = camera.position, t = (glass.y - c[1]) / (p[1] - c[1]);
    if (!Number.isFinite(t) || t <= 0 || t >= 1)
        return null;
    const q = c.map((v, i) => v + t * (p[i] - v)) as Vec3;
    return q[0] >= glass.minX && q[0] <= glass.maxX && q[2] >= glass.sill && q[2] <= glass.head ? q : null;
}
export const projectedPost = (i: number, view: number) => { const p = glassPosts[i], c = glassCameras[view], at = p.reflected ? reflect(p.position) : p.position; return { base: project(at, c), top: project([at[0], at[1], 2.1], c), at }; };
/** Camera adapts to the directly illuminated rail bed, while reflected radiance is unchanged. */
export function glassExposure(lit: boolean) { const exposure = lit ? .34 : 1; return { exposure, transmitted: (lit ? 2.7 : .37) * exposure, reflected: .42 * exposure }; }
export const validGlassRecord = (v: number[]) => v.length === 2 && v.every(n => n === 0 || n === 1);
