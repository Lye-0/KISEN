import {expect,it} from 'vitest';
import {hookReach,plaqueLit,beam} from '../src/game/geometry';
import {initialState,reduce,signalsReady} from '../src/game/model';
import {ticketExamples,rowForJourney,punchRows} from '../src/game/ticketRules';
it('棒が障害物を貫通せず、札へ届く角度と長さを選ぶ',()=>{
 const solutions=[];for(let a=0;a<4;a++)for(let l=0;l<4;l++)for(let h=0;h<2;h++)if(hookReach([a,l,h]).caught)solutions.push([a,l,h]);expect(solutions).toEqual([[2,3,1]]);expect(hookReach([0,3,1]).clear).toBe(false);
});
it('照射先だけでなく途中の壁と庇が光を遮る',()=>{
 const solutions=[];for(let h=0;h<4;h++)for(let a=0;a<4;a++)if(plaqueLit([h,a]))solutions.push([h,a]);expect(solutions).toEqual([[1,3]]);expect(beam([0,3]).clear).toBe(false);expect(beam([3,3]).clear).toBe(false);
});
it('切符の段は駅に対する片道の向きで決まり、区間の局所的な進行方向とは異なる',()=>{
 expect(ticketExamples.map(j=>rowForJourney(j.direction))).toEqual([0,0,1,0]);
 // For any rigid rotation or reflection, distance from notch remains unchanged.
 const notch=[18,64],hole=[115,punchRows[1]];const distance=(a:number[],b:number[])=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 for(const transform of [(p:number[])=>[600-p[0],p[1]],(p:number[])=>[p[1],-p[0]],(p:number[])=>[-p[0],-p[1]]])expect(distance(transform(notch),transform(hole))).toBeCloseTo(distance(notch,hole));
});
it('図面は実物に届く側から取れ、設置済みの紙と灯具が両方揃ったときだけ停車窓を照らす',()=>{
 let s=initialState();s.room='waiting';expect(reduce(s,{type:'take',id:'P06'})).toEqual(s);s.room='office';s=reduce(s,{type:'take',id:'P06'});expect(s.inventory).toContain('tracingMap');
 s.installed=['lamp'];s.values.P28=[2,1];expect(signalsReady(s)).toBe(false);s=reduce(s,{type:'install',item:'tracingMap'});expect(signalsReady(s)).toBe(true);s=reduce(s,{type:'remove',item:'tracingMap'});expect(signalsReady(s)).toBe(false);
});
