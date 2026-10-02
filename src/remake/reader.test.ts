import { it, expect } from 'vitest';
import { planeMatrix } from './plane';
import { newState, reduce, restore, owns } from './model';
it('券の四隅が受け床の四隅へ投影される', () => {
    const corners: [
        [
            number,
            number
        ],
        [
            number,
            number
        ],
        [
            number,
            number
        ],
        [
            number,
            number
        ]
    ] = [[454, 395], [1240, 395], [1275, 511], [419, 511]];
    const m = planeMatrix(808, 243, corners);
    for (const [i, [x, y]] of [[0, 0], [808, 0], [808, 243], [0, 243]].entries()) {
        const w = m[3] * x + m[7] * y + 1;
        expect((m[0] * x + m[4] * y + m[12]) / w).toBeCloseTo(corners[i][0], 5);
        expect((m[1] * x + m[5] * y + m[13]) / w).toBeCloseTo(corners[i][1], 5);
    }
});

function issued() {
    let s = newState(); s.room = 'office';
    s = reduce(s, { type: 'take', item: 'paper' });
    s = reduce(s, { type: 'toolTake', tool: 1 });
    s = reduce(s, { type: 'punch', hole: { column: 0, node: 'A', side: 'white' } });
    s = reduce(s, { type: 'ticketService', service: 2 });
    return s;
}
it('取得・加工・設置・回収・再加工・再設置で同じ券が移動する', () => {
    let s = issued(); const first = structuredClone(s.draft);
    expect(s.locations.paper).toBe('toolBench'); expect(owns(s, 'ticket')).toBe(true);
    s.room = 'north'; expect(reduce(s, { type: 'mountTicket' })).toBe(s);
    s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'mountTicket' });
    expect(s.mounted).toEqual(first); expect(s.draft).toBeNull(); expect(owns(s, 'ticket')).toBe(false);
    expect(s.locations.ticket).toBe('reader'); expect(s.savedTickets).toEqual([]);
    s = reduce(s, { type: 'readerClamp' }); expect(reduce(s, { type: 'removeTicket' })).toBe(s);
    s = restore(JSON.parse(JSON.stringify(s)))!;
    s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'removeTicket' });
    expect(s.mounted).toBeNull(); expect(s.draft).toEqual(first); expect(owns(s, 'ticket')).toBe(true);
    s.room = 'office'; s = reduce(s, { type: 'flipTicket' });
    s = reduce(s, { type: 'ticketService', service: 3 });
    s = reduce(s, { type: 'punch', hole: { column: 1, node: 'B', side: 'black' } });
    expect(s.draft?.id).toBe(first?.id); expect(s.draft?.marks).toEqual([{ service: 2, back: false }, { service: 3, back: true }]);
    expect(s.draft?.holes).toHaveLength(2); s = restore(JSON.parse(JSON.stringify(s)))!;
    expect(s.draft?.back).toBe(true); s = reduce(s, { type: 'flipTicket' });
    const second = structuredClone(s.draft); s.room = 'north'; s = reduce(s, { type: 'mountTicket' });
    expect(s.draft).toBeNull(); expect(s.mounted).toEqual(second); expect(s.mounted?.id).toBe(first?.id);
});
it('机での明示的な取得以外では白紙を作らず、汎用操作で所在を変えられない', () => {
    let s = issued(); s.room = 'north'; s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'mountTicket' });
    const mounted = s.mounted; s.room = 'office';
    for (const action of [{ type: 'newTicket' }, { type: 'take', item: 'paper' }, { type: 'take', item: 'ticket' }, { type: 'put', item: 'ticket', place: 'inventory' }, { type: 'flipTicket' }, { type: 'ticketService', service: 4 }] as const) expect(reduce(s, action)).toBe(s);
    expect(s.mounted).toBe(mounted); expect(s.draft).toBeNull();
});
it('旧保存の自動白紙を除き、設置券と加工済み別券の内容を保つ', () => {
    const current = issued(), original = structuredClone(current.draft)!;
    const legacy = { ...current, version: 2, mounted: original, draft: { id: 2, holes: [], service: 0, back: false }, locations: { ...current.locations, paper: 'inventory', ticket: undefined }, values: { ...current.values, readerDepth: [1] } };
    const loaded = restore(legacy)!;
    expect(loaded.version).toBe(3); expect(loaded.draft).toBeNull(); expect(loaded.mounted).toEqual(original); expect(loaded.locations.ticket).toBe('reader'); expect(loaded.savedTickets).toEqual([]);
    const other = { ...original, id: 2, back: true };
    const preserved = restore({ ...legacy, draft: other })!;
    expect(preserved.savedTickets).toEqual([other]); expect(preserved.mounted).toEqual(original);
    expect(restore(JSON.parse(JSON.stringify(preserved)))).toEqual(preserved);
});
it('旧保存の手元券と途中まで差した券を、同じ内容で持ち物へ移行する', () => {
    const current = issued();
    for (const depth of [0, .65]) {
        const loaded = restore({ ...current, version: 2, locations: { ...current.locations, paper: 'inventory', ticket: undefined }, values: { ...current.values, readerDepth: [depth] } })!;
        expect(loaded.draft).toEqual(current.draft); expect(loaded.mounted).toBeNull(); expect(loaded.locations.ticket).toBe('inventory'); expect(loaded.values.readerDepth).toEqual([0]);
    }
});
it('新形式で同じ券を二箇所に置く保存は拒否する', () => {
    const s = issued(); expect(restore({ ...s, mounted: s.draft })).toBeNull();
    expect(restore({ ...s, locations: { ...s.locations, ticket: 'reader' } })).toBeNull();
});

it('旧保存の重複IDは同一内容を統合し、異なる加工を失わない', () => {
    const s = issued(), original = s.draft!;
    const other = { ...original, back: true };
    const loaded = restore({ ...s, version: 2, mounted: original, draft: null, savedTickets: [original, other], locations: { ...s.locations, paper: 'inventory', ticket: undefined } })!;
    expect(loaded.mounted).toEqual(original); expect(loaded.savedTickets).toHaveLength(1);
    expect(loaded.savedTickets[0]).toEqual({ ...other, id: 2 });
    expect(restore(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded);
});
