import { expect, it } from 'vitest';
import { journeyExamples, encounters, encounterCamera, markerPosition, encounterFor, journeyExtractViews } from './journeyExamples';
import { entrySide, newState, restore } from './model';
it('四つの控えは実際の二口経路の途中記録で、同じ地点でも異なる通過側を示す', () => {
    expect(journeyExamples.map(r => r.path.join('-'))).toEqual(['S-A-B-E-F-R', 'R-F-E-B-A-S', 'S-A-B-D-O', 'S-A-C-E-F-D-O']);
    for (const r of journeyExamples)
        for (const h of r.ticket.holes)
            expect(h.side).toBe(entrySide[r.path[h.column] + '>' + h.node]);
    for (const node of ['B', 'E']) {
        const seen = journeyExamples.flatMap(r => r.ticket.holes.filter(h => h.node === node).map(h => h.side));
        expect(new Set(seen)).toEqual(new Set(['white', 'black']));
    }
    expect(journeyExamples.map(r => new Set(r.ticket.holes.map(h => h.side)).size)).toEqual([2, 2, 1, 2]);
});
it('控えの選択と観察記録は保存され、不正な番号から画面を壊さない', () => {
    const s = newState();
    s.values = { ...s.values, journeySelected: [3], journeyStop: [1], journeyFrame: [1], journeyCompare: [1], journeyBacks: [1, 3] };
    s.notes = [{ id: 'journey-record-3-1', values: [3, 1, 1], at: 0 }];
    expect(restore(JSON.parse(JSON.stringify(s)))?.values).toEqual(s.values);
    for (const [id, v] of Object.entries({ journeySelected: [2.5], journeyStop: [2], journeyBacks: [0, 0] }))
        expect(restore({ ...s, values: { ...s.values, [id]: v } })).toBeNull();
    expect(restore({ ...s, notes: [{ id: 'journey-record-4', values: [4, 1], at: 0 }] })).toBeNull();
});
it('比較用の部分写は両面とも二列だけを見せ、帰路全体の完成見本を出さない', () => {
    expect(journeyExamples.map(r => r.observed.map(c => r.ticket.holes[c].node))).toEqual([['B', 'E'], ['E', 'B'], ['B', 'D'], ['C', 'E']]);
    for (const r of journeyExamples) {
        for (const column of r.observed)
            expect(encounterFor(r.ticket.holes[column].node, r.ticket.holes[column].side)).toBeDefined();
        for (const back of [false, true]) {
            const views = Object.values(journeyExtractViews(back));
            const visible = r.ticket.holes.filter(h => {
                const x = back ? 800 - (80 + h.column * 160) : 80 + h.column * 160;
                return views.some(([left, , width]) => x - 18 >= left && x + 18 <= left + width);
            }).map(h => h.column);
            expect(visible).toEqual(r.observed);
        }
    }
});
it('連続写真では進行側の標柱を先に過ぎ、地点の向こうの柱は後に残る', () => {
    for (const e of encounters) {
        const early = encounterCamera(e, 0), late = encounterCamera(e, 1), d = e.side === 'white' ? 1 : -1;
        const first = markerPosition(e, e.side), last = markerPosition(e, e.side === 'white' ? 'black' : 'white');
        expect(early.target.map((v, i) => v - early.position[i])).toEqual(late.target.map((v, i) => v - late.position[i]));
        expect(early.focal).toBe(late.focal);
        expect(d * early.position[1]).toBeLessThan(d * first[1]);
        expect(d * first[1]).toBeLessThan(d * late.position[1]);
        expect(d * late.position[1]).toBeLessThan(0);
        expect(d * last[1]).toBeGreaterThan(0);
    }
});
