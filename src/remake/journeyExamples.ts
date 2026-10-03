import { nodes } from './model';
import type { Node, Side, Ticket } from './model';
import { encounterFor } from './journeyEncounterGeometry';
export { encounters, encounterCamera, markerPosition, encounterFor } from './journeyEncounterGeometry';
export const journeyExamples = [
    { id: '甲', title: '東側着', start: 'S' as const, route: [0, 1, 0, 0, 1, 0], path: ['S', 'A', 'B', 'E', 'F', 'R'], sides: ['white', 'white', 'black', 'white'] },
    { id: '乙', title: '西側着', start: 'R' as const, route: [0, 1, 0, 0, 1, 0], path: ['R', 'F', 'E', 'B', 'A', 'S'], sides: ['black', 'white', 'black', 'black'] },
    { id: '丙', title: '白沢行', start: 'S' as const, route: [0, 0, 0, 0, 0, 0], path: ['S', 'A', 'B', 'D', 'O'], sides: ['white', 'white', 'white'] },
    { id: '丁', title: '白沢行', start: 'S' as const, route: [1, 0, 0, 1, 2, 1], path: ['S', 'A', 'C', 'E', 'F', 'D', 'O'], sides: ['white', 'black', 'white', 'white', 'black'] },
].map((r, i) => {
    // Authored historical evidence stays independent of the acceptance rule.
    const path = r.path;
    const ticket: Ticket = { id: 100 + i, service: 0, back: false, holes: path.flatMap((name, index) => nodes.includes(name as Node) ? [{ node: name as Node, column: index - 1, side: r.sides[index - 1] as Side, tool: 1 }] : []) };
    return { ...r, path, ticket, observed: [1, 2] };
});
export function examplePhoto(node: Node, side: Side, frame: 0 | 1, incoming?: string) {
    const e = encounterFor(node, side, incoming);
    if (!e)
        throw new Error('The excerpt has no observation for this passage');
    return '/assets/remake/journeys/' + e.id + '-' + frame + '.webp';
}
export function journeyExtractViews(back: boolean): {
    edge: [
        number,
        number,
        number,
        number
    ];
    middle: [
        number,
        number,
        number,
        number
    ];
} {
    return { edge: [back ? 764 : -4, -4, 40, 243], middle: [back ? 320 : 160, -4, 320, 243] };
}
