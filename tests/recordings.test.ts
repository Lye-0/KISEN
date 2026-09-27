import { expect,it } from 'vitest';
import { plausibleTapeOffsets,recordOrderMatches } from '../src/game/recordings';
it('両方の閉鎖の特徴を比較すれば、別の回を合わせる仮説を除ける',()=>{expect(plausibleTapeOffsets()).toEqual([4]);});
it('錠は出来事の順を見る。知っていればワークシートの位置に拘束されない',()=>{
 expect(recordOrderMatches([-8,0,1,2,3])).toBe(true);expect(recordOrderMatches([4,0,1,2,3])).toBe(true);expect(recordOrderMatches([4,0,2,1,3])).toBe(false);
});
