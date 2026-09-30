import { describe, expect, it } from 'vitest';
import { propertyReceipts, receiptTime, receiptTrayReleases, placeReceipt, validReceiptSlots } from './lostProperty';
describe('clock-corrected receipts and the physical tray', () => {
    it('has one mechanical release order and raw clock readings lead to a different sequence', () => {
        const chronological = propertyReceipts.map(r => r.id).sort((a, b) => receiptTime(a) - receiptTime(b));
        const raw = propertyReceipts.map(r => r.id).sort((a, b) => propertyReceipts[a].minutes - propertyReceipts[b].minutes);
        expect(chronological).toEqual([2, 0, 3, 1]);
        expect(raw).not.toEqual(chronological);
        const accepted = [];
        for (let a = 0; a < 4; a++)
            for (let b = 0; b < 4; b++)
                for (let c = 0; c < 4; c++)
                    for (let d = 0; d < 4; d++)
                        if (receiptTrayReleases([a, b, c, d]))
                            accepted.push([a, b, c, d]);
        expect(accepted).toEqual([chronological]);
    });
    it('moves or exchanges the same card, preserving each physical individual', () => {
        expect(placeReceipt([2, 0, -1, -1], 2, 2)).toEqual([-1, 0, 2, -1]);
        expect(placeReceipt([2, 0, 3, 1], 2, 1)).toEqual([0, 2, 3, 1]);
        expect(validReceiptSlots([0, 0, 2, 3])).toBe(false);
        expect(placeReceipt([-1, -1, -1, -1], 4, 1)).toBeNull();
    });
});
