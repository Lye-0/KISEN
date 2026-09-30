export const receiptClocks = { platform: 3, office: -2 } as const;
export const propertyReceipts = [
    { id: 0, color: 'red', label: '赤', feature: '角ばった持ち手', clock: 'platform', minutes: 23 * 60 + 17, cuts: [0, 2] },
    { id: 1, color: 'black', label: '黒', feature: '修理糸', clock: 'platform', minutes: 23 * 60 + 19, cuts: [2, 4] },
    { id: 2, color: 'blue', label: '青', feature: '丸い持ち手', clock: 'office', minutes: 23 * 60 + 10, cuts: [0, 1] },
    { id: 3, color: 'clear', label: '透明', feature: '二重の骨', clock: 'office', minutes: 23 * 60 + 13, cuts: [1, 3] },
] as const;
export const receiptPins = [[0, 1], [0, 2], [1, 3], [2, 4]];
export const receiptTime = (id: number) => { const r = propertyReceipts[id]; return r.minutes - receiptClocks[r.clock]; };
export const receiptInitial = [-1, -1, -1, -1];
export const validReceiptSlots = (v: number[]) => v.length === 4 && v.every(n => Number.isInteger(n) && n >= -1 && n < 4) && new Set(v.filter(n => n >= 0)).size === v.filter(n => n >= 0).length;
export function receiptFits(id: number, slot: number) { const r = propertyReceipts[id], pins = receiptPins[slot]; return Boolean(r && pins && pins.every(n => (r.cuts as readonly number[]).includes(n))); }
export const receiptTrayReleases = (slots: number[]) => validReceiptSlots(slots) && slots.every(receiptFits);
export function placeReceipt(slots: number[], id: number, slot: number) {
    if (!validReceiptSlots(slots) || !Number.isInteger(id) || id < 0 || id > 3 || !Number.isInteger(slot) || slot < 0 || slot > 3)
        return null;
    const previous = slots.indexOf(id), displaced = slots[slot];
    return slots.map((v, i) => i === slot ? id : i === previous ? displaced : v);
}
export const validClockAdjust = (v: number[]) => v.length === 2 && v.every(n => Number.isInteger(n) && n >= -10 && n <= 10);
