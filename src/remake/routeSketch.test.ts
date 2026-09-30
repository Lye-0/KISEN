import { describe, it, expect } from 'vitest';
import { newState, reduce, restore } from './model';
import { changeSketch, validSketch } from './sketchGraph';
describe('路線の仮説を書き込み、後から訂正する', () => {
    it('同じ種類を重ねると消え、別の種類へ変更できる', () => { const a = changeSketch([], 5, 6, 0); expect(a).toEqual([5, 6, 0]); expect(changeSketch(a, 6, 5, 0)).toEqual([]); expect(changeSketch(a, 6, 5, 1)).toEqual([5, 6, 1]); expect(validSketch([5, 6, 0, 5, 6, 1])).toBe(false); });
    it('誤ったC-F仮説も保存でき、経路と券と解錠へ作用しない', () => { let s = newState(); s.locations.envelope = 'inventory'; const route = [...s.route], draft = structuredClone(s.draft); s = reduce(s, { type: 'sketch', a: 6, b: 7, kind: 0 }); s = reduce(s, { type: 'record', id: 'routeSketch', values: s.values.sketchEdges }); expect(s.values.sketchEdges).toEqual([6, 7, 0]); expect(s.route).toEqual(route); expect(s.draft).toEqual(draft); expect(s.flags).toEqual([]); expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s); s = reduce(s, { type: 'sketch', a: 6, b: 7, kind: 1 }); expect(s.notes[0].values).toEqual([6, 7, 0]); expect(s.values.sketchEdges).toEqual([6, 7, 1]); });
});
