import type { Node, Side } from './model';
import type { Camera, Vec3 } from './geometry';
import { sites } from './routeGeometry.ts';
import { fieldMarkers } from './lampOptics.ts';
import { glassPosts } from './glassGeometry.ts';
export type EncounterId = 'b-white' | 'b-black' | 'e-white' | 'e-white-c' | 'e-black' | 'd-white' | 'c-black';
export type Encounter = {
    id: EncounterId;
    node: Node;
    incoming: string;
    side: Side;
    kind: 'tank' | 'bridge' | 'pylon' | 'hut';
    landmark: Vec3;
    early: number;
    late: number;
};
export const encounters: Encounter[] = [
    { id: 'b-white', node: 'B', incoming: 'A', side: 'white', kind: 'tank', landmark: [-30, 8, 3], early: 12, late: 6 },
    { id: 'b-black', node: 'B', incoming: 'E', side: 'black', kind: 'tank', landmark: [-30, 8, 3], early: 18, late: 6 },
    { id: 'e-white', node: 'E', incoming: 'F', side: 'white', kind: 'bridge', landmark: [-42, 30, 4.15], early: 15, late: 1 },
    { id: 'e-white-c', node: 'E', incoming: 'C', side: 'white', kind: 'bridge', landmark: [-42, 30, 4.15], early: 18, late: 1 },
    { id: 'e-black', node: 'E', incoming: 'B', side: 'black', kind: 'bridge', landmark: [-42, 30, 4.15], early: 18, late: 1 },
    { id: 'd-white', node: 'D', incoming: 'B', side: 'white', kind: 'pylon', landmark: [-54, 8, 5], early: 18, late: 6 },
    { id: 'c-black', node: 'C', incoming: 'A', side: 'black', kind: 'hut', landmark: [-16, 150, 2], early: 18, late: 6 },
];
const toward = (node: Node, incoming: string) => {
    const a = sites[node], b = sites[incoming as keyof typeof sites], l = Math.hypot(a.x - b.x, a.y - b.y);
    return [(a.x - b.x) / l, (a.y - b.y) / l] as [
        number,
        number
    ];
};
function branchPost(node: Node, incoming: string, distance: number, lateral: number): Vec3 { const d = toward(node, incoming), p = sites[node]; return [p.x - d[0] * distance - d[1] * lateral, p.y - d[1] * distance + d[0] * lateral, 0]; }
export const journeyPosts: Record<'B' | 'C' | 'D' | 'E', Record<Side, Vec3>> = {
    B: { white: branchPost('B', 'A', 8, 2.1), black: branchPost('B', 'E', 8, 2.1) },
    C: { white: branchPost('C', 'E', 8, 2.1), black: branchPost('C', 'A', 8, -2.1) },
    D: { white: [...glassPosts[2].position], black: [...glassPosts[3].position] },
    E: { white: [...fieldMarkers[0].position], black: [...fieldMarkers[1].position] },
};
export const markerPosition = (e: Encounter, side: Side): Vec3 => journeyPosts[e.node as keyof typeof journeyPosts][side];
export function trackProgress(e: Encounter, p: Vec3) { const d = toward(e.node, e.incoming), n = sites[e.node]; return (p[0] - n.x) * d[0] + (p[1] - n.y) * d[1]; }
export function encounterCamera(e: Encounter, frame: 0 | 1): Camera {
    const p = sites[e.node], d = toward(e.node, e.incoming), distance = frame ? e.late : e.early, travel = frame ? e.early - e.late : 0;
    return { position: [p.x - d[0] * distance - d[1] * 1.6, p.y - d[1] * distance + d[0] * 1.6, 1.8], target: [p.x + d[0] * travel, p.y + d[1] * travel, 1.8], focal: 800, width: 1672, height: 941 };
}
export function encounterFor(node: Node, side: Side, incoming?: string) { return encounters.find(e => e.node === node && e.side === side && (!incoming || e.incoming === incoming)); }
