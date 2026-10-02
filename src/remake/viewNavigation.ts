import type { Room } from './model';
// North platform clockwise: south-facing tracks, west end, rear controls, east end.
// Keep saved camera IDs stable; only change their navigation order.
export function turnCamera(room: Room, camera: number, direction: -1 | 1, count: number) {
    const order = room === 'north' ? [0, 1, 3, 2] : Array.from({ length: count }, (_, i) => i);
    const at = Math.max(0, order.indexOf(camera));
    return order[(at + direction + order.length) % order.length];
}
