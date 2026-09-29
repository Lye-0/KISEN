import { it, expect } from 'vitest';
import { arrivalPhotos, consistentPhotoOrder, observation } from './arrivalPhotos';
const permutations = (a: number[]): number[][] => a.length ? a.flatMap((n, i) => permutations(a.filter((_, j) => i !== j)).map(p => [n, ...p])) : [[]];
it('見える穴の個数だけでは三枚を区別できず、同じ位置の変化で撮影順が一つになる', () => {
    expect(arrivalPhotos.map(p => p.visible.filter(c => p.punched.includes(c)).length)).toEqual([0, 1, 1, 1]);
    expect(permutations([0, 1, 2, 3]).filter(consistentPhotoOrder)).toEqual([[0, 1, 2, 3]]);
    expect(observation(3, 0)).toBeNull();
});
