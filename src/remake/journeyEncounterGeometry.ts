import type { Node, Side } from './model';
import type { Camera, Vec3 } from './geometry';
export type EncounterId = 'b-white' | 'b-black' | 'e-white' | 'e-black' | 'd-white' | 'c-black';
export type Encounter = {
    id: EncounterId;
    node: Node;
    side: Side;
    kind: 'tank' | 'bridge' | 'pylon' | 'hut';
    landmark: Vec3;
    whiteX: number;
    blackX: number;
};
export const encounters: Encounter[] = [
    { id: 'b-white', node: 'B', side: 'white', kind: 'tank', landmark: [6, 0, 3], whiteX: 2.1, blackX: 2.1 },
    { id: 'b-black', node: 'B', side: 'black', kind: 'tank', landmark: [6, 0, 3], whiteX: 2.1, blackX: 2.1 },
    { id: 'e-white', node: 'E', side: 'white', kind: 'bridge', landmark: [0, 0, 3], whiteX: -2.1, blackX: 2.1 },
    { id: 'e-black', node: 'E', side: 'black', kind: 'bridge', landmark: [0, 0, 3], whiteX: -2.1, blackX: 2.1 },
    { id: 'd-white', node: 'D', side: 'white', kind: 'pylon', landmark: [8, 0, 5], whiteX: 2.1, blackX: 2.1 },
    { id: 'c-black', node: 'C', side: 'black', kind: 'hut', landmark: [6, 0, 2], whiteX: 2.1, blackX: 2.1 },
];
export function encounterCamera(e: Encounter, frame: 0 | 1): Camera {
    const direction = e.side === 'white' ? 1 : -1;
    return { position: [-1.6, -direction * (frame === 0 ? 18 : 6), 1.8], target: [e.landmark[0], e.landmark[1] + (frame === 1 ? direction * 12 : 0), e.landmark[2]], focal: 800, width: 1672, height: 941 };
}
export const markerPosition = (e: Encounter, side: Side): Vec3 => [side === 'white' ? e.whiteX : e.blackX, side === 'white' ? -8 : 8, 0];
export function encounterFor(node: Node, side: Side) { return encounters.find(e => e.node === node && e.side === side); }
