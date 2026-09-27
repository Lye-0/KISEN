import { expect,it } from 'vitest';
import { moveCargo,moveGrille,turnClock,holdCatch,shuttersOpen,shutterLight } from '../src/game/mechanics';
function shortest(start:number[],isGoal:(v:number[])=>boolean,next:(v:number[])=>Array<number[]|null>){const queue=[{v:start,moves:0}];const seen=new Set([start.join(',')]);while(queue.length){const {v,moves}=queue.shift()!;if(isGoal(v))return moves;for(const n of next(v)){if(n&&!seen.has(n.join(','))){seen.add(n.join(','));queue.push({v:n,moves:moves+1})}}}return -1;}
it('格子は横棒の移動と引き手の経路を組み合わせれば脱出できる',()=>{
 const start=[0,4,1,3];expect(moveGrille(start,1,-1)).toBe(null);
 const steps=shortest(start,v=>v[0]===6&&v[1]===0,v=>[0,1,2,3].flatMap(p=>[-1,1].map(d=>moveGrille(v,p,d))));expect(steps).toBeGreaterThan(10);expect(steps).toBeLessThan(25);
});
it('時計は内側を先に回せず、七つの合法な動作で巻き軸へ届く',()=>{
 expect(turnClock([0,0],1)).toBe(null);expect(shortest([0,0],v=>v[0]===0&&v[1]===3,v=>[turnClock(v,0),turnClock(v,1)])).toBe(7);
});
it('台車は箱をすり抜けず、箱の退避後に出口へ到達できる',()=>{
 const start=[1,0,2,0];expect(moveCargo(start,3,1)).toBe(null);
 expect(shortest(start,v=>v[3]===4,v=>[0,1,2,3].flatMap(p=>[-1,1].map(d=>moveCargo(v,p,d))))).toBeGreaterThan(5);
});
it('受け金具がないと押さえを同時に保持できない',()=>{
 let v=holdCatch([0,0,0],0);v=holdCatch(v,1);expect(v.slice(0,2)).toEqual([0,1]);
 expect(holdCatch(v,2)).toEqual(v);
 v=holdCatch(v,0);v=holdCatch(v,2);v=holdCatch(v,1);v=holdCatch(v,2);expect(v).toEqual([1,1,2]);
 expect(holdCatch(v,2)).toEqual([0,0,0]);
});
it('羽根の重なりから、二つの停車窓が通る位置が一意に決まる',()=>{
 const solutions=[];for(let a=0;a<5;a++)for(let b=0;b<5;b++)if(shuttersOpen([a,b]))solutions.push([a,b]);expect(solutions).toEqual([[2,1]]);
});
it('窓の端だけに届く光は描画できるが、停車位置としては成立しない',()=>{
 expect(shutterLight([4,3],350)).toEqual([[-32,-5]]);expect(shuttersOpen([4,3])).toBe(false);expect(shutterLight([2,1],150)).toEqual([[-32,32]]);
});
