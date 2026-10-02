import { expect, it } from 'vitest';
import { turnCamera } from './viewNavigation';
it('north turns follow the spatial order and reverse to the same view', () => {
    expect([0,1,3,2].map(c => turnCamera('north',c,1,4))).toEqual([1,3,2,0]);
    for(const c of [0,1,2,3]) expect(turnCamera('north',turnCamera('north',c,1,4),-1,4)).toBe(c);
});
it('other rooms keep their existing order', () => {
    expect(turnCamera('office',0,-1,2)).toBe(1);
    expect(turnCamera('platform',2,1,3)).toBe(0);
});
