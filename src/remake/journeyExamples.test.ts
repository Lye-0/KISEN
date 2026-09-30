import { project } from './geometry';
import { trackProgress } from './journeyEncounterGeometry';
import { fieldMarkers } from './lampOptics';
import { glassPosts } from './glassGeometry';
import { expect, it } from 'vitest';
import { journeyExamples, encounters, encounterCamera, markerPosition, encounterFor, examplePhoto, journeyExtractViews } from './journeyExamples';
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
it('連続写真の撮影位置は実際の進入線上を進み、同じ物理標柱の手前から先へ移る', () => {
    for (const e of encounters) {
        const early = encounterCamera(e, 0), late = encounterCamera(e, 1), first = markerPosition(e, e.side);
        for (let i = 0; i < 3; i++)
            expect(early.target[i] - early.position[i]).toBeCloseTo(late.target[i] - late.position[i], 8);
        expect(early.focal).toBe(late.focal);
        const q = project(first, early);
        expect(q.depth).toBeGreaterThan(.2);
        expect(q.x).toBeGreaterThan(76);
        expect(q.x).toBeLessThan(1672);
        expect(q.y).toBeLessThan(941);
        expect(project(first, late).depth).toBeLessThan(.2);
        expect(trackProgress(e, early.position)).toBeLessThan(trackProgress(e, first));
        expect(trackProgress(e, first)).toBeLessThan(trackProgress(e, late.position));
        expect(trackProgress(e, late.position)).toBeLessThan(0);
    }
});
it('進入元の違うE白の二列は別の撮影を使い、観測窓と反射の標柱座標を再利用する', () => {
    expect(examplePhoto('E', 'white', 0, 'F')).not.toBe(examplePhoto('E', 'white', 0, 'C'));
    expect(markerPosition(encounterFor('E', 'white', 'F')!, 'white')).toEqual(fieldMarkers[0].position);
    expect(markerPosition(encounterFor('D', 'white', 'B')!, 'white')).toEqual(glassPosts[2].position);
    expect(markerPosition(encounterFor('D', 'white', 'B')!, 'black')).toEqual(glassPosts[3].position);
    for (const r of journeyExamples)
        for (const col of r.observed)
            expect(encounterFor(r.ticket.holes[col].node, r.ticket.holes[col].side, r.path[col])).toBeDefined();
});
