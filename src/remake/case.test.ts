import { describe, it, expect } from 'vitest';
import { newState, reduce, restore } from './model';
describe('現物の書類箱', () => {
    it('写真の閲覧履歴に依存せず、輪の現在配置で留めが外れる', () => { let s = newState(); expect(reduce(s, { type: 'caseDoor' }).values.caseOpen).toBeUndefined(); s = reduce(s, { type: 'values', id: 'caseWheels', values: [3, 1, 3, 0] }); s = reduce(s, { type: 'caseDoor' }); expect(s.values.caseOpen).toEqual([1]); expect(s.locations.officeKey).toBe('case'); s = reduce(s, { type: 'take', item: 'officeKey' }); s = reduce(s, { type: 'caseDoor' }); s = reduce(s, { type: 'caseDoor' }); expect(s.locations.officeKey).toBe('inventory'); expect(s.values.caseOpen).toEqual([1]); });
    it('閉じた箱からは鍵を取れず、空の輪配列で開かない', () => { const s = newState(); s.locations.officeKey = 'case'; s.values.caseWheels = []; expect(reduce(s, { type: 'caseDoor' }).values.caseOpen).toBeUndefined(); expect(reduce(s, { type: 'take', item: 'officeKey' }).locations.officeKey).toBe('case'); });
    it('破損した写真の並び・記録を読込時に拒否する', () => { const s = newState(); s.values.photoOrder = [0, 0, 1, 2]; expect(restore(s)).toBeNull(); s.values.photoOrder = [3, 1, 0, 2]; expect(restore(s)).not.toBeNull(); s.notes = [{ id: 'arrivalPhotos', values: [99], at: 0 }]; expect(restore(s)).toBeNull(); });
});
