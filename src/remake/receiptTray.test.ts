import { newState, reduce, restore } from './model';
import { it, expect } from 'vitest';
it('opens the linked drawer from actual cards and allows separate retrieval without observation flags', () => {
    let s = newState();
    s.room = 'lost';
    expect(reduce(s, { type: 'take', item: 'fragments' })).toBe(s);
    for (const [id, slot] of [[2, 0], [3, 1], [0, 2], [1, 3]])
        s = reduce(s, { type: 'receiptPlace', receipt: id, slot });
    expect(reduce(s, { type: 'receiptTray' })).toBe(s);
    s = reduce(s, { type: 'receiptPlace', receipt: 0, slot: 1 });
    expect(s.values.receiptSlots).toEqual([2, 0, 3, 1]);
    s = reduce(s, { type: 'receiptTray' });
    expect(s.values.receiptOpen).toEqual([1]);
    expect(s.notes).toEqual([]);
    expect(reduce(s, { type: 'receiptRemove', slot: 0 })).toBe(s);
    s = reduce(s, { type: 'take', item: 'fragments' });
    expect(s.locations.fragments).toBe('inventory');
    expect(restore(s)).toEqual(s);
    s = reduce(s, { type: 'receiptTray' });
    s = reduce(s, { type: 'receiptRemove', slot: 0 });
    expect(s.values.receiptSlots).toEqual([-1, 0, 3, 1]);
});
it('rejects saved drawer and duplicated-card inconsistencies', () => { const s = newState(); s.values.receiptSlots = [0, 0, 2, 3]; expect(restore(s)).toBeNull(); s.values.receiptSlots = [0, 1, 2, 3]; s.values.receiptOpen = [1]; expect(restore(s)).toBeNull(); });
