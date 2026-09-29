import { it, expect } from 'vitest';
import { planeMatrix } from './plane';
import { newState, reduce } from './model';
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
it('仮差しでは押さえが閉じず、設置後は開けるまで引き抜けない', () => { let s = newState(); s.locations.paper = 'inventory'; s = reduce(s, { type: 'mountTicket' }); expect(s.mounted).toBeNull(); s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'values', id: 'readerDepth', values: [.65] }); s = reduce(s, { type: 'readerClamp' }); expect(s.values.readerClamp).toEqual([1]); s = reduce(s, { type: 'mountTicket' }); expect(s.mounted?.id).toBe(1); s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'removeTicket' }); expect(s.mounted?.id).toBe(1); s = reduce(s, { type: 'readerClamp' }); s = reduce(s, { type: 'removeTicket' }); expect(s.mounted).toBeNull(); expect(s.draft.id).toBe(1); expect(s.values.readerDepth).toEqual([0]); });
