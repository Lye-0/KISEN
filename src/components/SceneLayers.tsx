import type { GameState } from '../game/model';
import { open,gateTicketValid } from '../game/model';
export function sceneBase(s:GameState){
 if(s.room==='closed'&&s.trainAt===2)return `/assets/scenes/closed/${gateTicketValid(s)?'boardable':'arrived'}.webp`;
 if(s.room==='forecourt'&&s.view===1)return '/assets/scenes/forecourt/loop.webp';
 if(s.room==='train')return `/assets/scenes/train/${s.trainAt>0?'stabled':'arrival'}.webp`;
 return `/assets/scenes/${s.room}/main.webp`;
}
export function sceneLayers(s:GameState){
 const layers:{src:string;alt:string;className:string;clip?:string}[]=[];
 const patch=(condition:boolean,path:string,name:string,rect:number[])=>{if(condition){const [x,y,w,h]=rect;layers.push({src:`/assets/scenes/${path}.webp`,alt:name,className:name,clip:`inset(${y}% ${100-x-w}% ${100-y-h}% ${x}%)`})}};
 if(s.room==='train'||s.room==='return'){
  if(open(s,'P01'))layers.push({src:'/assets/scenes/train/box-open.webp',alt:'荷物棚の箱は開いている',className:'box-lid-open'});
  if(open(s,'P02'))layers.push({src:'/assets/scenes/train/explored.webp',alt:'ふたの開いた鞄',className:'bag-open'});
  if(s.room==='train'&&s.notes.includes('ownTicket'))layers.push({src:'/assets/scenes/train/explored.webp',alt:'切符を拾った床',className:'floor-clear'});
  if(s.room==='return'&&!s.notes.includes('ownTicket'))layers.push({src:'/assets/scenes/train/arrival.webp',alt:'まだ床に残っている切符',className:'floor-clear'});
 }
 if(s.room==='train'||s.room==='return')patch(open(s,'P08'),'train/case-open','case-open',[86,12,14,26]);
 if(s.room==='platform'){
 patch(s.trainAt>0,'platform/cleared','train-shifted',[0,0,16.5,100]);
 patch(open(s,'P15'),'platform/cleared','stair-gate-open',[17,38,13,15]);
 patch(open(s,'P14'),'platform/cleared','rail-tag-removed',[92,70,8,30]);
 }
 if(s.room==='closed')patch(open(s,'P25'),'closed/drawer','handle-drawer',[7,64,32,30]);
 if(s.room==='waiting'){
  patch(open(s,'P04'),'waiting/open','grille-open',[49,18,26,27]);
  patch(open(s,'P05'),'waiting/open','waiting-drawer',[57,45,11,8]);
  patch(s.visited.includes('office'),'waiting/open','office-door',[77,16,15,35]);
 }
 if(s.room==='office'){
  patch(open(s,'P12'),'office/tray','record-tray',[23.5,42.5,5,5]);
  patch(s.taken.includes('P09'),'office/changed','hook-removed',[19,8,5,35]);
  patch(s.taken.includes('P19'),'office/changed','punch-removed',[56,50,4,11]);
  patch(open(s,'P26'),'office/changed','office-drawer',[12,69,22,20]);
  patch(open(s,'P17'),'office/changed','cargo-cleared',[65,12,16,57]);
  patch(open(s,'P04'),'office/changed','office-grille',[0,0,19,69]);
 }
 if(s.room==='lost')patch(open(s,'P10'),'lost/open','lost-drawer',[57,67,15,16]);
 if(s.room==='store'){
  patch(open(s,'P18'),'store/open','chest-open',[24,33,28,46]);
  patch(open(s,'L09'),'store/open','lamp-door',[65,16,17,63]);
 }
 if(s.room==='lamp')patch(open(s,'P23'),'lamp/open','cabinet-open',[4,60,28,40]);
 return layers;
}
export function SceneLayers({s}:{s:GameState}){return <>{sceneLayers(s).map(l=><img key={l.className} style={l.clip?{clipPath:l.clip}:undefined} className={`scene-photo state-patch ${l.className}`} src={l.src} alt="" aria-hidden="true"/>)}</>}
