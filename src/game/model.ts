import { shuttersOpen } from './mechanics';
export type Room = 'train'|'platform'|'waiting'|'forecourt'|'office'|'lost'|'bridge'|'store'|'lamp'|'tunnel'|'closed'|'return';
export type Item = 'smallKey'|'photos'|'knob'|'officeKey'|'hook'|'routeTag'|'bridgePin'|'bracket'|'plate'|'punch'|'lamp'|'handle'|'paper'|'stub'|'ticket'|'managementTag'|'tracingMap';
export type Shape = 'cross'|'tower'|'water'|'shed'|'tunnel'|'home';
export const SHAPES: Shape[] = ['cross','tower','water','shed','tunnel','home'];
export const shapeNames: Record<Shape,string>={cross:'踏切',tower:'鉄塔',water:'給水槽',shed:'小屋',tunnel:'トンネル',home:'白沢'};
export const itemNames: Record<Item,string>={smallKey:'乗務用の小鍵',photos:'車窓の写真',knob:'記録機のつまみ',officeKey:'駅務室の鍵',hook:'鉤付きの棒',routeTag:'路線札',bridgePin:'解除片',bracket:'短い金具',plate:'接続板',punch:'改札鋏',lamp:'交換灯具',handle:'進路のハンドル',paper:'乗車券用紙',stub:'区間の控え',ticket:'帰りの切符',managementTag:'重い管理札',tracingMap:'薄い見取り図'};
export type Punch = {column:number; row:0|1; shape:Shape};
export interface Ticket { id:number; holes:Punch[]; service:number; back:boolean; returnMark?:boolean }
export interface GameState {
  version:1; started:boolean; room:Room; view:number; visited:Room[];
  opened:string[]; inventory:Item[]; taken:string[]; installed:Item[];
  values:Record<string,number[]>; observations:Record<string,number[]>; notes:string[]; hints:Record<string,number>;
  ticket:Ticket; mountedTicket:Ticket|null; discarded:Ticket[]; route:{switches:number[]; start:0|1; plateTurn:0|1};
  ending:boolean; trainAt:number; elapsed:number; sound:boolean;
}
export const initialState=():GameState=>({version:1,started:false,room:'train',view:0,visited:['train'],opened:[],inventory:[],taken:[],installed:[],values:{},observations:{},notes:['homePhoto'],hints:{},ticket:{id:1,holes:[],service:0,back:false},mountedTicket:null,discarded:[],route:{switches:[0,0,0,0],start:0,plateTurn:0},ending:false,trainAt:0,elapsed:0,sound:false});
export const owns=(s:GameState,item:Item)=>s.inventory.includes(item)||s.installed.includes(item);
export const open=(s:GameState,id:string)=>s.opened.includes(id);
export const rewards:Partial<Record<string,Item>>={P01:'smallKey',P02:'photos',P05:'knob',P08:'officeKey',P09:'hook',P10:'managementTag',P12:'routeTag',P14:'bridgePin',P15:'bracket',P18:'plate',P19:'punch',P23:'lamp',P25:'handle',P26:'paper',P31:'stub'};
export const prerequisites:Partial<Record<string,Item[]>>={P04:['smallKey'],P12:['knob'],P14:['hook'],P15:['bridgePin'],P17:['hook'],P22:['bracket'],P23:['managementTag'],P27:['lamp'],P28:['lamp'],P30:['plate','handle'],P31:['hook'],P34:['punch','paper'],P36:['ticket']};
export function missing(s:GameState,id:string){return (prerequisites[id]??[]).filter(i=>!owns(s,i));}

// Physical graph, not a solved-once gate. Exit names appear in environmental records.
export const junctions=[
  {id:'W',label:'給水槽',at:[250,280], exits:['A','S','T']},
  {id:'T',label:'鉄塔',at:[430,150], exits:['N','B','S']},
  {id:'N',label:'トンネル',at:[625,245], exits:['T','O','C']},
  {id:'S',label:'小屋',at:[390,415], exits:['A','W','T']},
] as const;
export function traceRoute(route:GameState['route'],hasPlate=true):string[]{
  const path=[route.start===1?'H':'K'];
  let next=route.start===1?(hasPlate?(route.plateTurn===1?'W':'S'):'gap'):'W';
  for(let i=0;i<12;i++){
    path.push(next); if(['O','K','A','B','C','gap'].includes(next))break;
    if(path.slice(0,-1).includes(next)){path.push('loop');break;}
    const idx=junctions.findIndex(j=>j.id===next);
    if(idx<0)break;
    next=junctions[idx].exits[route.switches[idx]??0];
  }
  return path;
}
export function routeReady(s:GameState){
  return s.installed.includes('plate')&&s.installed.includes('handle')&&s.route.start===1&&traceRoute(s.route).at(-1)==='O';
}
const nodeShape:Record<string,Shape>={W:'water',T:'tower',N:'tunnel',S:'shed',O:'home'};
// Old ticket paid W and T already. New coupon must record only the remainder.
export function requiredHoles(s:GameState):Punch[]{
  return traceRoute(s.route).filter(n=>nodeShape[n]&&!['W','T'].includes(n)).map((n,column)=>({column,row:1 as const,shape:nodeShape[n]}));
}
export function ticketValid(s:GameState,ticket:Ticket=s.ticket){
  if(!routeReady(s)||ticket.service!==2)return false;
  const expected=requiredHoles(s); const holes=ticket.holes;
  return holes.length===expected.length&&expected.every(p=>holes.some(h=>h.column===p.column&&h.row===p.row&&h.shape===p.shape));
}
export const gateTicketValid=(s:GameState)=>!!s.mountedTicket&&s.values.P36?.[0]===0&&s.values.P36?.[1]===0&&ticketValid(s,s.mountedTicket);
export const signalsReady=(s:GameState)=>s.installed.includes('lamp')&&s.installed.includes('tracingMap')&&shuttersOpen(s.values.P28??[0,0]);
const nextTicketId=(s:GameState)=>Math.max(s.ticket.id,s.mountedTicket?.id??0,...s.discarded.map(t=>t.id))+1;
const keepAside=(s:GameState,t:Ticket)=>t.holes.length||t.service?[...s.discarded.filter(v=>v.id!==t.id).slice(-7),t]:s.discarded;
export function canEnter(s:GameState,room:Room):string|null{
  if(s.room===room)return null;
  if(s.room==='return'&&room!=='return')return '列車は、もう駅を離れている。';
  if(['office','lost','store','lamp','tunnel'].includes(room)&&!owns(s,'officeKey'))return '駅務室の戸に鍵がかかっている。';
  if(room==='bridge'&&!open(s,'P15'))return '橋の柵が留まっている。';
  if(room==='store'&&!open(s,'P17'))return '通路を台車が塞いでいる。';
  if(room==='lamp'&&!open(s,'L09'))return '小屋の戸が閉まっている。';
  if(room==='closed'&&!open(s,'P16'))return 'この先は側壁が続いている。';
  if(room==='return'&&(!gateTicketValid(s)||!open(s,'P36')||!open(s,'P37')||!open(s,'P32')||s.trainAt!==2))return 'まだ乗れる列車ではない。';
  return null;
}
export type Action = {type:'start'}|{type:'move';room:Room}|{type:'view';value:number}|{type:'values';id:string;value:number[]}|{type:'open';id:string}|{type:'take';id:string}|{type:'install';item:Item}|{type:'remove';item:Item}|{type:'note';id:string}|{type:'hint';id:string}|{type:'route';value:Partial<GameState['route']>}|{type:'punch';value:Punch}|{type:'ticketService';value:number}|{type:'keepTicket'}|{type:'flipTicket'}|{type:'newTicket'}|{type:'sound'}|{type:'callTrain';service:number}|{type:'train';value:number}|{type:'end'}|{type:'tick';seconds:number};
const add=<T,>(a:T[],v:T)=>a.includes(v)?a:[...a,v];
export function reduce(s:GameState,a:Action):GameState{
  switch(a.type){
    case 'start':return {...s,started:true};
    case 'move':{
      if(canEnter(s,a.room))return s;
      const next={...s,room:a.room,view:0,visited:add(s.visited,a.room)};
      if(a.room==='return'&&s.mountedTicket)return {...next,ticket:s.mountedTicket,mountedTicket:null,discarded:keepAside(s,s.ticket),installed:s.installed.filter(i=>i!=='ticket'),inventory:add(s.inventory,'ticket')};
      return next;
    }
    case 'view':return {...s,view:a.value};
    case 'values':return {...s,values:{...s.values,[a.id]:a.value}};
    case 'open':return missing(s,a.id).length?s:{...s,opened:add(s.opened,a.id)};
    case 'take':{if(a.id==='P06'){if(s.taken.includes('P06')||!(s.room==='office'||s.room==='waiting'&&open(s,'P04')))return s;return {...s,taken:add(s.taken,'P06'),inventory:add(s.inventory,'tracingMap'),notes:add(s.notes,'P06')};}const item=rewards[a.id];return !item||!open(s,a.id)||s.taken.includes(a.id)?s:{...s,taken:add(s.taken,a.id),inventory:add(s.inventory,item)};}
    case 'install':{
      if(!s.inventory.includes(a.item))return s;
      if(a.item==='ticket')return s.mountedTicket?s:{...s,mountedTicket:{...s.ticket,holes:s.ticket.holes.map(h=>({...h}))},ticket:{id:nextTicketId(s),holes:[],service:0,back:false},inventory:s.inventory.filter(i=>i!=='ticket'),installed:add(s.installed,'ticket')};
      return {...s,inventory:s.inventory.filter(i=>i!==a.item),installed:add(s.installed,a.item)};
    }
    case 'remove':{
      if(!s.installed.includes(a.item)||s.room==='return')return s;
      if(a.item==='ticket'&&s.mountedTicket)return {...s,ticket:s.mountedTicket,mountedTicket:null,discarded:keepAside(s,s.ticket),inventory:add(s.inventory,'ticket'),installed:s.installed.filter(i=>i!=='ticket')};
      return {...s,inventory:add(s.inventory,a.item),installed:s.installed.filter(i=>i!==a.item)};
    }
    case 'note':return {...s,notes:add(s.notes,a.id),observations:{...s.observations,[a.id]:[...(s.values[a.id]??[])]}};
    case 'hint':return {...s,hints:{...s.hints,[a.id]:Math.min(4,(s.hints[a.id]??0)+1)}};
    case 'route':return s.room==='return'?s:{...s,route:{...s.route,...a.value}};
    case 'punch':return !owns(s,'punch')||!owns(s,'paper')?s:{...s,ticket:{...s.ticket,holes:s.ticket.holes.some(h=>h.column===a.value.column&&h.row===a.value.row&&h.shape===a.value.shape)?s.ticket.holes:[...s.ticket.holes,a.value]}};
    case 'ticketService':return {...s,ticket:{...s.ticket,service:a.value}};
    case 'keepTicket':return !owns(s,'paper')||!owns(s,'punch')||!s.ticket.holes.length?s:{...s,inventory:add(s.inventory,'ticket')};
    case 'flipTicket':return {...s,ticket:{...s.ticket,back:!s.ticket.back}};
    case 'newTicket':return !owns(s,'paper')?s:{...s,discarded:keepAside(s,s.ticket),ticket:{id:nextTicketId(s),holes:[],service:0,back:false},inventory:s.inventory.filter(i=>i!=='ticket')};
    case 'sound':return {...s,sound:!s.sound};
    case 'callTrain':return s.room!=='closed'||s.trainAt===0||!routeReady(s)?s:{...s,trainAt:a.service===2&&signalsReady(s)?2:3,values:{...s.values,activeService:[a.service]}};
    case 'train':return {...s,trainAt:a.value};
    case 'end':return s.room==='return'?{...s,ending:true,ticket:{...s.ticket,returnMark:true}}:s;
    case 'tick':return {...s,elapsed:s.elapsed+a.seconds};
  }
}

export function validateSave(value:unknown):GameState|null {
  if(!value||typeof value!=='object')return null;
  const s=value as GameState;
  const rooms=['train','platform','waiting','forecourt','office','lost','bridge','store','lamp','tunnel','closed','return'];
  if(s.version!==1||!rooms.includes(s.room)||!Array.isArray(s.opened)||!Array.isArray(s.inventory)||!Array.isArray(s.installed)||!Array.isArray(s.visited)||!Array.isArray(s.taken)||!Array.isArray(s.notes)||!s.values||typeof s.values!=='object'||!s.route||!Array.isArray(s.route.switches)||!s.ticket||!Array.isArray(s.ticket.holes)||!Array.isArray(s.discarded)||!s.hints)return null;
  if(![s.opened,s.taken,s.notes,s.inventory,s.installed].every(a=>a.length<400&&a.every(n=>typeof n==='string'&&n.length<80))||!s.visited.every(r=>rooms.includes(r)))return null;
  if(![...s.inventory,...s.installed].every(i=>Object.hasOwn(itemNames,i))||!s.route.switches.every(n=>Number.isInteger(n)&&n>=0&&n<=2)||s.route.switches.length!==4||![0,1].includes(s.route.start)||![0,1].includes(s.route.plateTurn))return null;
  const validTicket=(t:Ticket)=>!!t&&Number.isInteger(t.id)&&t.id>0&&typeof t.back==='boolean'&&(t.returnMark===undefined||typeof t.returnMark==='boolean')&&[0,1,2,3].includes(t.service)&&Array.isArray(t.holes)&&t.holes.length<=60&&t.holes.every(h=>h&&SHAPES.includes(h.shape)&&Number.isInteger(h.column)&&h.column>=0&&h.column<5&&[0,1].includes(h.row));
  if(!validTicket(s.ticket)||s.mountedTicket&&!validTicket(s.mountedTicket)||s.discarded.length>8||!s.discarded.every(validTicket))return null;
  if(!Object.values(s.values).every(v=>Array.isArray(v)&&v.length<100&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<10000)))return null;
  if(s.observations&&(!Object.values(s.observations).every(v=>Array.isArray(v)&&v.length<100&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<10000))))return null;
  if(typeof s.started!=='boolean'||typeof s.ending!=='boolean'||!Number.isFinite(s.elapsed)||s.elapsed<0||!Number.isInteger(s.view)||s.view<0||s.view>8||!Number.isInteger(s.trainAt)||s.trainAt<0||s.trainAt>3)return null;
  return {...initialState(),...s};
}






