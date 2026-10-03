import { expect, it } from 'vitest';
import { approachBands } from './approachEvidence';
import { journeyExamples } from './journeyExamples';
import { encounters, encounterFor, encounterCamera, markerPosition, trackProgress } from './journeyEncounterGeometry';
import { project } from './geometry';
import { pointPorts } from './pointMechanics';
import { entrySide, newState, nodes, trace, validTicket } from './model';
import type { Hole, Node, Side } from './model';

// Reconstruct a candidate rule from the authored, visible excerpts and shooting plans.
// Do not use entrySide/expectedHoles to build the inferred rule or the resulting ticket.
function learnedEdges() {
    const observations = new Map<number, Set<Side>>();
    for (const r of journeyExamples) for (const column of r.observed) {
        const h = r.ticket.holes[column], e = encounterFor(h.node, h.side, r.path[column])!;
        const before = trackProgress(e, encounterCamera(e, 0).position), after = trackProgress(e, encounterCamera(e, 1).position);
        const passed = (['white', 'black'] as const).filter(color => {
            const at = trackProgress(e, markerPosition(e, color)); return before < at && at < after;
        });
        expect(passed).toHaveLength(1);
        const bands = passed[0] === 'white' ? 1 : 2;
        const edges = observations.get(bands) ?? new Set<Side>(); edges.add(h.side); observations.set(bands, edges);
    }
    expect([...observations.values()].map(edges => edges.size)).toEqual([1, 1]);
    return new Map([...observations].map(([bands, edges]) => [bands, [...edges][0]]));
}
it('連写の各組は一種類だけを通過し、画外へ去るだけの別の柱と区別できる', () => {
    for (const e of encounters) {
        const before = trackProgress(e, encounterCamera(e, 0).position), after = trackProgress(e, encounterCamera(e, 1).position);
        const passed = (['white', 'black'] as const).filter(color => before < trackProgress(e, markerPosition(e, color)) && trackProgress(e, markerPosition(e, color)) < after);
        expect(passed, e.id).toEqual([e.side]);
    }
    const b = encounterFor('B', 'white', 'A')!, q = project(markerPosition(b, 'black'), encounterCamera(b, 1));
    expect(q.x).toBeGreaterThan(1672); expect(q.depth).toBeGreaterThan(0);
    const c = encounterFor('C', 'black', 'A')!;
    expect(trackProgress(c, markerPosition(c, 'white'))).toBeLessThan(trackProgress(c, encounterCamera(c, 0).position));
});
it('画面の左右では同じ縁を分類できず、見本の通過標柱と縁の対応は一貫する', () => {
    const positions: Record<Side, Set<string>> = { white: new Set(), black: new Set() };
    for (const e of encounters) positions[e.side].add(project(markerPosition(e, e.side), encounterCamera(e, 0)).x < 836 ? 'left' : 'right');
    expect(positions.white).toEqual(new Set(['left', 'right']));
    expect(positions.black).toEqual(new Set(['left', 'right']));
    expect(learnedEdges()).toEqual(new Map([[1, 'white'], [2, 'black']]));
});
it('全操作札に各進入線の観察があり、歴史資料と現在の判定との不一致を検出できる', () => {
    const rule = learnedEdges();
    for (const node of nodes) {
        expect(Object.keys(approachBands[node]).sort()).toEqual([...pointPorts[node]].sort());
        for (const [from, bands] of Object.entries(approachBands[node])) expect(rule.get(bands)).toBe(entrySide[from + '>' + node]);
    }
    for (const r of journeyExamples) {
        expect(trace(r.route, false, r.start).path).toEqual(r.path);
        for (const h of r.ticket.holes) expect(h.side).toBe(entrySide[r.path[h.column] + '>' + h.node]);
    }
});
it('見本から得た規則を進入元の操作札へ適用すると両帰路の券が成立し、各縁の取り違えは通らない', () => {
    const rule = learnedEdges();
    for (const route of [[0,1,0,1,1,1], [1,0,0,1,2,1]]) {
        const s = newState(); s.route = route;
        const path = trace(route).path;
        const holes: Hole[] = path.slice(1, -1).map((at, column) => ({ node: at as Node, column, side: rule.get(approachBands[at as Node][path[column]])!, tool: 1 }));
        const ticket = { id: 4, service: 2, back: false, holes, marks: [{ service: 2, back: false }] };
        expect(validTicket(s, ticket)).toBe(true);
        for (const h of holes) expect(validTicket(s, { ...ticket, holes: holes.map(v => v === h ? { ...v, side: v.side === 'white' ? 'black' : 'white' } : v) })).toBe(false);
    }
});
