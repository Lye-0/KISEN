import { describe,it,expect } from 'vitest';
import { initialState,reduce,traceRoute,routeReady,requiredHoles,ticketValid,validateSave } from '../src/game/model';
describe('現在の物理状態が進路と切符を決める',()=>{
  it('資料既読や問題履歴なしで帰路を構成できる',()=>{
    const s=initialState();s.installed=['plate','handle'];s.route={switches:[2,0,1,2],start:1,plateTurn:1};
    expect(traceRoute(s.route)).toEqual(['H','W','T','N','O']);expect(routeReady(s)).toBe(true);
    expect(requiredHoles(s)).toEqual([{column:0,row:1,shape:'tunnel'},{column:1,row:1,shape:'home'}]);
    s.ticket.holes=requiredHoles(s);s.ticket.service=2;expect(ticketValid(s)).toBe(true);
    s.route.switches[2]=2;expect(ticketValid(s)).toBe(false);
  });
  it('小屋を通る別経路もその形に合う券なら受理する',()=>{
    const s=initialState();s.installed=['plate','handle'];s.route={switches:[2,0,1,2],start:1,plateTurn:0};
    expect(traceRoute(s.route)).toEqual(['H','S','T','N','O']);
    expect(requiredHoles(s).map(p=>p.shape)).toEqual(['shed','tunnel','home']);
    s.ticket.holes=requiredHoles(s);s.ticket.service=2;expect(ticketValid(s)).toBe(true);
    s.ticket.holes.shift();expect(ticketValid(s)).toBe(false);
  });
  it('全324配置は有限の経路で止まり、初期配置はループか駅に戻る',()=>{
    const s=initialState();expect(routeReady(s)).toBe(false);
    let valid=0;
    for(let mask=0;mask<81;mask++)for(const start of [0,1] as const)for(const plateTurn of [0,1] as const){
      let n=mask;const switches=Array.from({length:4},()=>{const v=n%3;n=Math.floor(n/3);return v});
      const path=traceRoute({switches,start,plateTurn});expect(path.length).toBeLessThan(9);
      expect(['O','K','loop']).toContain(path.at(-1));if(start===1&&path.at(-1)==='O')valid++;
    }
    expect(valid).toBeGreaterThan(1);
  });
  it('部品を取る、設置する、回収するは別の状態で残る',()=>{
    let s=initialState();s=reduce(s,{type:'take',id:'P18'});expect(s.inventory).toEqual([]);
    s=reduce(s,{type:'open',id:'P18'});expect(s.inventory).toEqual([]);
    s=reduce(s,{type:'take',id:'P18'});expect(s.inventory).toEqual(['plate']);
    s=reduce(s,{type:'install',item:'plate'});expect(s.inventory).toEqual([]);expect(s.installed).toEqual(['plate']);
    expect(reduce(s,{type:'take',id:'P18'})).toEqual(s);
    s=reduce(s,{type:'remove',item:'plate'});expect(s.inventory).toEqual(['plate']);
  });
  it('切符は実際の孔を保持し、裏返しても判定が変わらない',()=>{
    let s=initialState();s.inventory=['punch','paper'];s.installed=['plate','handle'];s.route={switches:[2,0,1,2],start:1,plateTurn:1};
    for(const value of requiredHoles(s))s=reduce(s,{type:'punch',value});s=reduce(s,{type:'ticketService',value:2});
    expect(ticketValid(s)).toBe(true);s=reduce(s,{type:'flipTicket'});expect(ticketValid(s)).toBe(true);
    s=reduce(s,{type:'newTicket'});expect(s.ticket.holes).toEqual([]);expect(s.discarded[0].holes).toHaveLength(2);
  });
  it('不正な保存で状態を置換しない',()=>{
    expect(validateSave(null)).toBe(null);expect(validateSave({version:1})).toBe(null);
    expect(validateSave({...initialState(),route:{switches:[9,0,0,0],start:1,plateTurn:1}})).toBe(null);
    expect(validateSave(JSON.parse(JSON.stringify(initialState())))).toEqual(initialState());
  });
});
