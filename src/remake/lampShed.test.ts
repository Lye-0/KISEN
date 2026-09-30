import { describe, it, expect } from 'vitest';
import { newState, reduce, restore } from './model';
import { posterEdgesMeet } from './posters';
import { balanceReleases } from './balance';
describe('lamp shed physical acquisition', () => {
    it('has exactly one upright double-hole join among every paper pair and front/back combination', () => { const matches: number[][] = []; for (let a = 0; a < 4; a++)
        for (let b = 0; b < 4; b++)
            for (let mask = 0; mask < 16; mask++)
                if (posterEdgesMeet(a, b, [0, 1, 2, 3].map(n => !!(mask & (1 << n)))))
                    matches.push([a, b, mask & ((1 << a) | (1 << b))]); expect(new Set(matches.map(n => n.join(':')))).toEqual(new Set(['2:0:0'])); });
    it('unlocks the actual door without requiring an observation record', () => { let s = newState(); s.room = 'forecourt'; expect(reduce(s, { type: 'move', room: 'lamp' })).toBe(s); s = reduce(s, { type: 'values', id: 'shedDigits', values: [4, 7, 0, 6] }); s = reduce(s, { type: 'shedDoor' }); s = reduce(s, { type: 'move', room: 'lamp' }); expect(s.room).toBe('lamp'); expect(s.notes).toEqual([]); s = reduce(s, { type: 'take', item: 'lamp' }); expect(s.locations.lamp).toBe('inventory'); });
    it('balances only the two present weights at distances three and two, and preserves the opened box', () => { const matches = []; for (let l = 0; l <= 3; l++)
        for (let r = 0; r <= 3; r++)
            if (balanceReleases([l, r]))
                matches.push([l, r]); expect(matches).toEqual([[3, 2]]); let s = newState(); s.room = 'lamp'; expect(reduce(s, { type: 'balanceBox' })).toBe(s); expect(reduce(s, { type: 'take', item: 'hood' })).toBe(s); s = reduce(s, { type: 'balanceWeight', index: 0, position: 3 }); s = reduce(s, { type: 'balanceWeight', index: 1, position: 2 }); s = reduce(s, { type: 'balanceBox' }); expect(s.values.balanceOpen).toEqual([1]); expect(reduce(s, { type: 'balanceWeight', index: 0, position: 1 })).toBe(s); s = reduce(s, { type: 'take', item: 'hood' }); expect(s.locations.hood).toBe('inventory'); expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s); });
    it('migrates missing item locations and rejects malformed saved mechanisms', () => { let s = newState(); delete s.locations.lamp; delete s.locations.hood; expect(restore(s)?.locations.lamp).toBe('lightRack'); expect(restore(s)?.locations.hood).toBe('balanceChest'); s = newState(); s.values.balancePositions = [-1, 4]; expect(restore(s)).toBeNull(); s.values.balancePositions = [3, 2]; s.values.shedDigits = [4, 7, 0, 60]; expect(restore(s)).toBeNull(); });
});
