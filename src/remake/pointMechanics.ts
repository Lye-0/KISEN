import type { Node, State } from './model';
import type { Camera } from './geometry';
export const pointPorts: Record<Node, string[]> = { A: ['S', 'B', 'C'], B: ['A', 'D', 'E'], C: ['A', 'E', 'X'], D: ['O', 'B', 'F'], E: ['B', 'C', 'F'], F: ['E', 'R', 'D'] };
export const pointNames: Record<Node, string> = { A: '菱形', B: '三角形', C: '星形', D: '半円形', E: '丸形', F: '長方形' };
export const pointBearings = [305, 514, 724, 936, 1152, 1370];
export const pointPositions = (node: Node) => node === 'E' ? 3 : 2;
export function leverY(node: Node, position: number) { return node === 'E' ? 390 + position * 56 : 390 + position * 112; }
export const railCamera: Camera = { position: [0, -18, 12], target: [0, 3, 0], focal: 760, width: 1672, height: 941 };
export const wyeCamera: Camera = { position: [0, -30, 22], target: [0, 3, 0], focal: 900, width: 1672, height: 941 };
export type RailPoint = [
    number,
    number
];
export const regularPorts: RailPoint[] = [[0, -12], [-4, 14], [4, 14]];
export const wyePorts: RailPoint[] = [[-14, -15], [14, -15], [0, 22]];
export const wyeJoints: RailPoint[] = [[-9, -5], [9, -5], [0, 12]];
// These are the contacts made by the mechanism, independent of the journey graph.
// A normal switch has a common stem. E uses three coordinated corners of a wye.
export function physicalRailContacts(node: Node, position: number): [
    string,
    string
][] {
    if (!Number.isInteger(position) || position < 0 || position >= pointPositions(node))
        return [];
    const ports = pointPorts[node];
    if (node !== 'E')
        return [[ports[0], ports[position + 1]]];
    const sides: [
        [
            number,
            number
        ],
        [
            number,
            number
        ],
        [
            number,
            number
        ]
    ] = [[0, 1], [0, 2], [1, 2]];
    const [a, b] = sides[position];
    return [[ports[a], ports[b]]];
}
export function pointLocked(s: State, index: number, used: string[]) {
    return ['approaching', 'passing', 'leaving', 'stopped'].includes(s.train.position) && used.includes(['A', 'B', 'C', 'D', 'E', 'F'][index]);
}
export function wyeSettings(position: number) {
    const pair = [[0, 1], [0, 2], [1, 2]][position];
    return [0, 1, 2].map(corner => pair.includes(corner) ? pair.find(p => p !== corner)! : null);
}
export function railCurve(port: 1 | 2, t: number): RailPoint {
    const side = port === 1 ? -1 : 1;
    return [side * 4 * t * t, -4 + 18 * t];
}
export const bladeGap = .045;
