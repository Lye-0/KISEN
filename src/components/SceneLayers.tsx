import type { GameState } from '../game/model';
import { open } from '../game/model';
export function sceneLayers(s:GameState){
 const layers:{src:string;alt:string;className:string}[]=[];
 if(s.room==='train'||s.room==='return'){
  if(open(s,'P01'))layers.push({src:'/assets/scenes/train/box-open.webp',alt:'荷物棚の箱は開いている',className:'box-lid-open'});
  if(open(s,'P02'))layers.push({src:'/assets/scenes/train/explored.webp',alt:'ふたの開いた鞄',className:'bag-open'});
  if(s.room==='train'&&s.notes.includes('ownTicket'))layers.push({src:'/assets/scenes/train/explored.webp',alt:'切符を拾った床',className:'floor-clear'});
  if(s.room==='return'&&!s.notes.includes('ownTicket'))layers.push({src:'/assets/scenes/train/arrival.webp',alt:'まだ床に残っている切符',className:'floor-clear'});
 }
 return layers;
}
export function SceneLayers({s}:{s:GameState}){return <>{sceneLayers(s).map(l=><img key={l.className} className={`scene-photo state-patch ${l.className}`} src={l.src} alt={l.alt}/>)}</>}
