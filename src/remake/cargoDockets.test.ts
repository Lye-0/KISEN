import { describe, it, expect } from 'vitest';
import { cargoDockets, cargoCode, cargoUnlocks } from './cargoDockets';
import { eventOrder, syncCandidates } from './recordings';
import { newState, reduce, restore } from './model';
describe('cargo processing', () => {
    it('uses the shared events after aligning both gate sounds, excludes through and other-line dockets', () => {
        expect(syncCandidates()).toEqual([3]);
        expect(eventOrder(3)).toEqual(['door', 'passing', 'bell', 'stop']);
        expect(cargoCode()).toEqual([6, 2, 8, 4]);
        expect(cargoDockets.filter(d => d.route === 'circle' && d.handling === 'received')).toHaveLength(4);
        expect(cargoUnlocks([6, 2, 3, 4])).toBe(false);
        expect(cargoUnlocks([9, 2, 8, 4])).toBe(false);
        expect(cargoUnlocks(cargoCode())).toBe(true);
    });
    it('opens physical chest with digits alone, acquires each content only from the open cargo box', () => {
        let s = newState();
        s = reduce(s, { type: 'take', item: 'spareLamp' });
        expect(s.locations.spareLamp).toBe('cargoChest');
        s = reduce(s, { type: 'move', room: 'cargo' });
        s = reduce(s, { type: 'cargoChest' });
        expect(s.values.cargoOpen).toBeUndefined();
        s = reduce(s, { type: 'values', id: 'cargoDigits', values: cargoCode() });
        s = reduce(s, { type: 'cargoChest' });
        expect(s.values.cargoOpen).toEqual([1]);
        expect(s.notes).toEqual([]);
        expect(reduce(s, { type: 'cargoMove', index: 1, direction: 1 })).toBe(s);
        s = reduce(s, { type: 'take', item: 'spareLamp' });
        s = reduce(s, { type: 'take', item: 'cargoDocket' });
        expect(s.locations.spareLamp).toBe('inventory');
        expect(s.locations.cargoDocket).toBe('inventory');
        s = reduce(s, { type: 'cargoChest' });
        expect(s.values.cargoOpen).toEqual([0]);
        expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    });
    it('rejects malformed restored wheels and restores missing old content locations', () => {
        const s = newState();
        expect(restore({ ...s, values: { cargoDigits: [6, 2, 8, 4.5] } })).toBeNull();
        expect(restore({ ...s, values: { cargoOpen: [2] } })).toBeNull();
        const old = JSON.parse(JSON.stringify(s));
        delete old.locations.spareLamp;
        delete old.locations.cargoDocket;
        expect(restore(old)?.locations.spareLamp).toBe('cargoChest');
    });
});
