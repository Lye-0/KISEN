export type Room = 'train'|'platform'|'waiting'|'forecourt'|'office'|'lost'|'bridge'|'cargo'|'lamp'|'tunnel'|'north'|'return';
export type Item = 'photos'|'receipt'|'envelope'|'ownTicket'|'officeKey'|'knob'|'hook'|'pin'|'support'|'lamp'|'punch'|'paper'|'fragments'|'hood'|'ticket';
export type Place = 'bag'|'handle'|'seat'|'floor'|'inventory'|'recorder'|'lightStand'|'signal'|'reader';
export type Node = 'A'|'B'|'C'|'D'|'E'|'F';
export type Side = 'white'|'black';
export type Hole = { column:number; node:Node; side:Side };
export interface Ticket { id:number; holes:Hole[]; service:number; back:boolean }
export interface State {
 version:2; started:boolean; room:Room; camera:number; visited:string[];
 locations:Partial<Record<Item,Place>>;
 bag:{strap:number;clasp:boolean;mouth:boolean};
 seats:number[]; window:{supported:boolean;latch:boolean;open:boolean};
 values:Record<string,number[]>; flags:string[];
 notes:{id:string;values:number[];at:number}[];
 route:number[]; draft:Ticket; mounted:Ticket|null; savedTickets:Ticket[];
 train:{service:number;position:'absent'|'passing'|'stopped'|'departed'};
 elapsed:number; sound:boolean; ended:boolean;
}
export const newState=():State=>({version:2,started:false,room:'train',camera:0,visited:['train:0'],locations:{photos:'bag',receipt:'handle',envelope:'seat',ownTicket:'floor'},bag:{strap:0,clasp:false,mouth:false},seats:[0,0,0],window:{supported:false,latch:false,open:false},values:{},flags:[],notes:[],route:[0,0,0,0,0,0],draft:{id:1,holes:[],service:0,back:false},mounted:null,savedTickets:[],train:{service:0,position:'absent'},elapsed:0,sound:false,ended:false});
export const cameraCounts:Record<Room,number>={train:3,platform:3,waiting:3,forecourt:2,office:2,lost:2,bridge:3,cargo:3,lamp:2,tunnel:2,north:3,return:2};
export const owns=(s:State,item:Item)=>s.locations[item]==='inventory';
export const done=(s:State,id:string)=>s.flags.includes(id);
const append=<T,>(a:T[],v:T)=>a.includes(v)?a:[...a,v];
export const exits:Record<Node,string[]>={A:['B','C'],B:['D','E'],C:['E','F'],D:['O','C'],E:['F','B'],F:['R','D']};
export const nodes:Node[]=['A','B','C','D','E','F'];
export const entrySide:Record<string,Side>={'S>A':'white','A>B':'white','A>C':'black','B>E':'black','C>E':'white','E>F':'white','F>D':'black','B>D':'white','D>C':'black','E>B':'black'};
export function trace(route:number[],current=true){
 const path:string[]=[];let at='A';
 while(nodes.includes(at as Node)&&!path.includes(at)){
  path.push(at);const next=exits[at as Node][route[nodes.indexOf(at as Node)]??0];
  if(current&&(at==='B'&&next==='D'||at==='C'&&next==='F'))return {path:[...path,next],end:'blocked'};
  at=next;
 }
 return {path:[...path,at],end:path.includes(at)?'loop':at};
}
export const expectedHoles=(route:number[]):Hole[]=>trace(route).path.filter(n=>nodes.includes(n as Node)).map((node,column,all)=>({column,node:node as Node,side:entrySide[(column?all[column-1]:'S')+'>'+node]}));
export function validTicket(s:State,t:Ticket|null){
 if(!t||trace(s.route).end!=='O'||t.service!==2)return false;
 const expected=expectedHoles(s.route);
 return t.holes.length===expected.length&&expected.every(e=>t.holes.some(h=>h.column===e.column&&h.node===e.node&&h.side===e.side));
}
export type Action = {type:'start'}|{type:'look';camera:number}|{type:'move';room:Room;camera?:number}|{type:'bagStrap';position:number}|{type:'bagClasp'}|{type:'bagMouth'}|{type:'take';item:Item}|{type:'put';item:Item;place:Place}|{type:'seat';index:number}|{type:'values';id:string;values:number[]}|{type:'flag';id:string}|{type:'record';id:string;values?:number[]}|{type:'route';index:number;value:number}|{type:'punch';hole:Hole}|{type:'flipTicket'}|{type:'ticketService';service:number}|{type:'newTicket'}|{type:'mountTicket'}|{type:'removeTicket'}|{type:'call';service:number}|{type:'board'}|{type:'end'}|{type:'sound'}|{type:'tick';seconds:number};
export function reduce(s:State,a:Action):State {
 switch(a.type){
 case 'start':return {...s,started:true};
 case 'look':{const camera=(a.camera+cameraCounts[s.room])%cameraCounts[s.room];return {...s,camera,visited:append(s.visited,s.room+':'+camera)};}
 case 'move':{const camera=a.camera??0;return {...s,room:a.room,camera,visited:append(s.visited,a.room+':'+camera)};}
 case 'bagStrap':return s.bag.mouth?s:{...s,bag:{...s.bag,strap:Math.max(0,Math.min(1,a.position))}};
 case 'bagClasp':return s.bag.mouth?s:{...s,bag:{...s.bag,clasp:!s.bag.clasp}};
 case 'bagMouth':return !s.bag.mouth&&(!s.bag.clasp||s.bag.strap<.8)?s:{...s,bag:{...s.bag,mouth:!s.bag.mouth}};
 case 'take':{const at=s.locations[a.item];if(!at||at==='inventory'||at==='bag'&&!s.bag.mouth||at==='seat'&&s.seats[2]!==1)return s;return {...s,locations:{...s.locations,[a.item]:'inventory'}};}
 case 'put':return !s.locations[a.item]?s:{...s,locations:{...s.locations,[a.item]:a.place}};
 case 'seat':return {...s,seats:s.seats.map((v,i)=>i===a.index?1-v:v)};
 case 'values':return {...s,values:{...s.values,[a.id]:a.values}};
 case 'flag':return {...s,flags:append(s.flags,a.id)};
 case 'record':return {...s,notes:[...s.notes.filter(n=>n.id!==a.id),{id:a.id,values:[...(a.values??s.values[a.id]??[])],at:s.elapsed}]};
 case 'route':return s.room==='return'?s:{...s,route:s.route.map((v,i)=>i===a.index?a.value:v)};
 case 'punch':return !owns(s,'punch')||!owns(s,'paper')?s:{...s,draft:{...s.draft,holes:[...s.draft.holes,a.hole]}};
 case 'flipTicket':return {...s,draft:{...s.draft,back:!s.draft.back}};
 case 'ticketService':return {...s,draft:{...s.draft,service:a.service}};
 case 'newTicket':return !owns(s,'paper')?s:{...s,savedTickets:s.draft.holes.length?[...s.savedTickets.slice(-7),s.draft]:s.savedTickets,draft:{id:Math.max(s.draft.id,s.mounted?.id??0,...s.savedTickets.map(t=>t.id))+1,holes:[],service:0,back:false}};
 case 'mountTicket':return s.mounted?s:{...s,mounted:structuredClone(s.draft),draft:{id:s.draft.id+1,holes:[],service:0,back:false}};
 case 'removeTicket':return !s.mounted?s:{...s,draft:s.mounted,mounted:null,savedTickets:s.draft.holes.length?[...s.savedTickets.slice(-7),s.draft]:s.savedTickets};
 case 'call':return {...s,train:{service:a.service,position:trace(s.route).end==='O'&&a.service===2&&done(s,'signal')?'stopped':'passing'}};
 case 'board':return !validTicket(s,s.mounted)||s.train.position!=='stopped'||!done(s,'footing')?s:{...s,room:'return',camera:0,train:{...s.train,position:'departed'}};
 case 'end':return s.room==='return'?{...s,ended:true}:s;
 case 'sound':return {...s,sound:!s.sound};
 case 'tick':return {...s,elapsed:s.elapsed+a.seconds};
 }
}
export function restore(value:unknown):State|null {
 if(!value||typeof value!=='object')return null;
 const s=value as State;
 if(s.version!==2||!Object.hasOwn(cameraCounts,s.room)||!Number.isInteger(s.camera)||s.camera<0||s.camera>=cameraCounts[s.room]||typeof s.started!=='boolean'||!s.locations||!s.bag||!Array.isArray(s.seats)||s.seats.length!==3||!s.seats.every(n=>n===0||n===1)||!Array.isArray(s.flags)||!Array.isArray(s.visited)||!s.values||!Array.isArray(s.notes)||!Number.isFinite(s.elapsed)||s.elapsed<0||!Array.isArray(s.route)||s.route.length!==6||!s.route.every(n=>n===0||n===1))return null;
 if(!Number.isFinite(s.bag.strap)||s.bag.strap<0||s.bag.strap>1||typeof s.bag.clasp!=='boolean'||typeof s.bag.mouth!=='boolean')return null;
 const ticket=(t:Ticket)=>t&&Number.isInteger(t.id)&&t.id>0&&Array.isArray(t.holes)&&t.holes.length<=60&&[0,1,2,3,4,5,6].includes(t.service)&&typeof t.back==='boolean'&&t.holes.every(h=>Number.isInteger(h.column)&&h.column>=0&&h.column<5&&nodes.includes(h.node)&&['white','black'].includes(h.side));
 if(!ticket(s.draft)||s.mounted&&!ticket(s.mounted)||!Array.isArray(s.savedTickets)||s.savedTickets.length>8||!s.savedTickets.every(ticket))return null;
 return s;
}
