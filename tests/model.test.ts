import { describe,it,expect } from 'vitest';
import { initialState,reduce,traceRoute,routeReady,requiredHoles,ticketValid,validateSave,gateTicketValid,canEnter } from '../src/game/model';
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
      expect(['O','K','A','B','C','loop']).toContain(path.at(-1));if(start===1&&path.at(-1)==='O')valid++;
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
    expect(validateSave({...initialState(),visited:['not-a-room']})).toBe(null);
    expect(validateSave({...initialState(),notes:[{}]})).toBe(null);
    expect(validateSave({...initialState(),inventory:['constructor']})).toBe(null);
    expect(validateSave(JSON.parse(JSON.stringify(initialState())))).toEqual(initialState());
  });
  it('穴を重ねても紙は元に戻らず、同じ穴の再加工だけは形を変えない',()=>{
    let s=initialState();s.inventory=['punch','paper'];
    const hole={column:0,row:1 as const,shape:'water' as const};s=reduce(s,{type:'punch',value:hole});s=reduce(s,{type:'punch',value:hole});expect(s.ticket.holes).toHaveLength(1);
    s=reduce(s,{type:'punch',value:{...hole,shape:'tower'}});expect(s.ticket.holes).toHaveLength(2);
  });
  it('写真の誤った仮説も、記録後の並べ替えとは独立して保存する',()=>{
    let s=reduce(initialState(),{type:'values',id:'P03',value:[4,3,2,1,0]});s=reduce(s,{type:'note',id:'P03'});s=reduce(s,{type:'values',id:'P03',value:[2,4,0,3,1]});
    expect(s.observations.P03).toEqual([4,3,2,1,0]);expect(s.values.P03).toEqual([2,4,0,3,1]);
  });
  it('受け部の券は、新しい紙を加工しても変わらない。回収で元の実物が戻る',()=>{
    let s=initialState();s.inventory=['punch','paper','ticket'];s.installed=['plate','handle'];s.route={switches:[2,0,1,2],start:1,plateTurn:1};s.values.P36=[0,0];s.ticket.holes=requiredHoles(s);s.ticket.service=2;
    const original=structuredClone(s.ticket);s=reduce(s,{type:'install',item:'ticket'});expect(gateTicketValid(s)).toBe(true);expect(s.ticket.id).not.toBe(original.id);
    s=reduce(s,{type:'punch',value:{column:4,row:0,shape:'cross'}});expect(s.mountedTicket).toEqual(original);expect(gateTicketValid(s)).toBe(true);
    s=reduce(s,{type:'newTicket'});expect(s.mountedTicket).toEqual(original);
    s=reduce(s,{type:'remove',item:'ticket'});expect(s.ticket).toEqual(original);expect(s.mountedTicket).toBe(null);expect(gateTicketValid(s)).toBe(false);expect(s.discarded.some(t=>t.holes.some(h=>h.shape==='cross'))).toBe(true);
  });
  it('乗車時に券が戻り、走行中は駅へ瞬間移動したり盤を操作したりできない',()=>{
    let s=initialState();s.room='closed';s.inventory=['punch','paper','ticket'];s.installed=['plate','handle'];s.route={switches:[2,0,1,2],start:1,plateTurn:1};s.values.P36=[0,0];s.ticket.holes=requiredHoles(s);s.ticket.service=2;s.opened=['P16','P32','P36','P37'];s.trainAt=2;
    s=reduce(s,{type:'install',item:'ticket'});s=reduce(s,{type:'move',room:'return'});expect(s.room).toBe('return');expect(s.inventory).toContain('ticket');expect(s.mountedTicket).toBe(null);
    expect(canEnter(s,'closed')).not.toBe(null);expect(reduce(s,{type:'route',value:{start:0}})).toEqual(s);
  });
});
