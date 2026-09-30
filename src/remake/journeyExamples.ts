import { entrySide, nodes, trace } from './model';
import type { Node, Side, Ticket } from './model';
import { encounterFor } from './journeyEncounterGeometry';
export { encounters, encounterCamera, markerPosition, encounterFor } from './journeyEncounterGeometry';
export const journeyExamples = [
    { id: '甲', title: '東側着', start: 'S' as const, route: [0, 1, 0, 0, 1, 0] },
    { id: '乙', title: '西側着', start: 'R' as const, route: [0, 1, 0, 0, 1, 0] },
    { id: '丙', title: '白沢行', start: 'S' as const, route: [0, 0, 0, 0, 0, 0] },
    { id: '丁', title: '白沢行', start: 'S' as const, route: [1, 0, 0, 1, 2, 1] },
].map((r, i) => {
    const path = trace(r.route, false, r.start).path;
    const ticket: Ticket = { id: 100 + i, service: 0, back: false, holes: path.flatMap((name, index) => nodes.includes(name as Node) ? [{ node: name as Node, column: index - 1, side: entrySide[path[index - 1] + '>' + name], tool: 1 }] : []) };
    return { ...r, path, ticket, observed: [1, 2] };
});
export function examplePhoto(node: Node, side: Side, frame: 0 | 1) {
    const e = encounterFor(node, side);
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
