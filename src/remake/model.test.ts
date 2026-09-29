import {describe,it,expect} from 'vitest';
import {newState,reduce,trace,expectedHoles,validTicket,restore} from './model';
describe('remake:物の状態',()=>{
 it('鞄は帯と留めの両方を外して開く。個別取得が残る',()=>{
 let s=newState();s=reduce(s,{type:'bagMouth'});expect(s.bag.mouth).toBe(false);
 s=reduce(s,{type:'bagClasp'});s=reduce(s,{type:'bagMouth'});expect(s.bag.mouth).toBe(false);
 s=reduce(s,{type:'bagStrap',position:1});s=reduce(s,{type:'bagMouth'});s=reduce(s,{type:'take',item:'photos'});
 expect(s.locations.photos).toBe('inventory');expect(s.locations.receipt).toBe('handle');
 expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
 });
 it('観察は現在値の写しであり後の操作に変わらない',()=>{
 let s=newState();s=reduce(s,{type:'values',id:'tape',values:[-9]});s=reduce(s,{type:'record',id:'tape'});s=reduce(s,{type:'values',id:'tape',values:[3]});expect(s.notes[0].values).toEqual([-9]);
 });
});
describe('remake:現在の経路と券',()=>{
 it('64配置には二つの帰路、未使用レバーを含む4つの有効配置がある',()=>{
 const legal=Array.from({length:64},(_,n)=>Array.from({length:6},(_,i)=>(n>>i)&1)).map(traceIt=>trace(traceIt)).filter(r=>r.end==='O');expect(legal).toHaveLength(4);expect(new Set(legal.map(r=>r.path.join('-'))).size).toBe(2);
 });
 it('同じ分岐橋でも入る側が経路で変わる',()=>{
 const b=expectedHoles([0,1,0,0,0,1]),c=expectedHoles([1,0,0,0,0,1]);expect(b.find(h=>h.node==='E')?.side).toBe('black');expect(c.find(h=>h.node==='E')?.side).toBe('white');
 });
 it('設置券は別紙の加工で変わらず、現在の経路で再評価する',()=>{
 let s=newState();s.route=[0,1,0,0,0,1];s.draft={id:1,holes:expectedHoles(s.route),service:2,back:true};s.locations.punch='inventory';s.locations.paper='inventory';
 s=reduce(s,{type:'mountTicket'});expect(validTicket(s,s.mounted)).toBe(true);s=reduce(s,{type:'punch',hole:{column:0,node:'C',side:'white'}});expect(validTicket(s,s.mounted)).toBe(true);s=reduce(s,{type:'route',index:0,value:1});expect(validTicket(s,s.mounted)).toBe(false);
 });
 it('初回版の保存は新版へ混ぜない',()=>{expect(restore({version:1})).toBeNull()});
});
