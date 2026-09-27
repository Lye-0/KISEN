import { expect,it } from 'vitest';
import { corridorMatches } from '../src/components/HiddenPlatform';
function permutations(a:number[]):number[][]{return a.length?a.flatMap((n,i)=>permutations(a.filter((_,j)=>i!==j)).map(rest=>[n,...rest])):[[]]}
it('同じ通路なら、24通りの選択順と紙の両面を同じように受け付ける',()=>{
 for(const cells of permutations([2,3,7,11]))for(const face of [0,1])expect(corridorMatches([face,...cells])).toBe(true);
});
it('別の屋根の区画や、区画の重複では欠けた通路にならない',()=>{
 expect(corridorMatches([0,11,7,3,1])).toBe(false);expect(corridorMatches([0,11,7,3,3])).toBe(false);
});
