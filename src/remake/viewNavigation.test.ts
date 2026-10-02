import { expect, it } from 'vitest';
import { turnCamera } from './viewNavigation';
import { newState, reduce, restore, cameraCounts } from './model';
it('north turns follow the spatial order and reverse to the same view', () => {
    expect([0,1,3,2].map(c => turnCamera('north',c,1,4))).toEqual([1,3,2,0]);
    for(const c of [0,1,2,3]) expect(turnCamera('north',turnCamera('north',c,1,4),-1,4)).toBe(c);
});
it('other rooms keep their existing order', () => {
    expect(turnCamera('office',0,-1,2)).toBe(1);
    expect(turnCamera('platform',2,1,3)).toBe(0);
});

it('棚の切り抜きを方向として循環させない', () => {
    expect(cameraCounts.lost).toBe(1);
    for (const direction of [-1, 1] as const) expect(turnCamera('lost', 0, direction, cameraCounts.lost)).toBe(0);
    const s = newState(); s.room = 'lost';
    expect(reduce(s, { type: 'look', camera: 1 }).camera).toBe(0);
});
it('旧比較台の保存を棚の全景へ戻し、調べた内容を保つ', () => {
    const s = newState(); s.room = 'lost'; s.camera = 1; s.visited = ['office:1', 'lost:0', 'lost:1'];
    s.values.receiptSlots = [2,0,3,1]; s.values.clockAdjust = [-3,2];
    const restored = restore(JSON.parse(JSON.stringify(s)))!;
    expect(restored.camera).toBe(0); expect(restored.visited).toEqual(['office:1','lost:0']);
    expect(restored.values).toEqual(s.values); expect(restored.locations).toEqual(s.locations);
});
