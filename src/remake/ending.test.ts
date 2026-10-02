import { describe, it, expect } from 'vitest';
import { newState, reduce, restore, expectedHoles } from './model';
function boarded() { let s = newState(); s.room = 'north'; s.route = [0, 1, 0, 1, 1, 1]; s.values.bellChannel = [1]; s.values.readerClamp = [0]; s.locations.hood = 'signal'; s.locations.retainingPin = 'signal'; s.locations.lamp = 'signal'; s.locations.spareLamp = 'signal'; s.signals = { mounts: [7, 11], shutters: [2, 3] }; s.train = { service: 2, position: 'stopped', firstDoor: 7 }; s.locations.ticket = 'reader'; s.mounted = { id: 1, service: 2, back: false, holes: expectedHoles(s.route).map(h => ({ ...h, tool: 1 })) }; return reduce(s, { type: 'board' }); }
describe('帰りの車内と終幕', () => {
    it('乗車後、走行、停車、開扉を経て降りる。券の孔は維持する', () => { let s = boarded(); expect(s.room).toBe('return'); expect(s.values.returnTrip).toEqual([0, 0]); expect(reduce(s, { type: 'end' })).toBe(s); const before = structuredClone(s.mounted); for (let i = 0; i < 10; i++)
        s = reduce(s, { type: 'returnAdvance', seconds: 1 }); expect(reduce(s, { type: 'end' })).toBe(s); for (let i = 0; i < 2; i++)
        s = reduce(s, { type: 'returnAdvance', seconds: 1 }); s = reduce(s, { type: 'end' }); expect(s.ended).toBe(true); expect(s.values.returnTrip).toEqual([12, 1]); expect(s.mounted).toEqual(before); expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s); s = reduce(s, { type: 'returnReview' }); expect(s.ended).toBe(false); expect(s.values.returnTrip).toEqual([12, 1]); expect(reduce(s, { type: 'move', room: 'north' })).toBe(s); });
    it('外の場面や任意の値操作で帰着状態を作れない', () => { const s = newState(); expect(reduce(s, { type: 'returnAdvance', seconds: 1 })).toBe(s); expect(reduce(s, { type: 'values', id: 'returnTrip', values: [12, 1] })).toBe(s); for (const seconds of [NaN, Infinity, -1, 2]) {
        const r = boarded();
        expect(reduce(r, { type: 'returnAdvance', seconds })).toBe(r);
    } expect(restore({ ...boarded(), values: { returnTrip: [12, 2] } })).toBeNull(); expect(restore({ ...boarded(), values: { returnTrip: [9, 1] } })).toBeNull(); });
    it('携帯は最初から持ち、古い記録にも復元する', () => { const s = newState(); expect(s.locations.phone).toBe('inventory'); expect(reduce(s, { type: 'put', item: 'phone', place: 'floor' })).toBe(s); const old = structuredClone(s); delete old.locations.phone; expect(restore(old)?.locations.phone).toBe('inventory'); expect(restore({ ...s, locations: { ...s.locations, phone: 'floor' } })).toBeNull(); });
});
