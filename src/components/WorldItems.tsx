import type {GameState,Item} from '../game/model';
import {itemArt} from '../game/itemArt';
import {PaperTicket} from './Figures';
import {RouteWorkspace} from './CoreWorkspaces';
type Prop={item:Item;x:number;y:number;w:number;h:number;show:(s:GameState)=>boolean};
export const worldItems:Partial<Record<GameState['room'],Prop[]>>={
 office:[{item:'knob',x:783,y:515,w:32,h:34,show:s=>s.installed.includes('knob')}],
 platform:[{item:'bridgePin',x:1440,y:872,w:75,h:40,show:s=>s.opened.includes('P14')&&!s.taken.includes('P14')},{item:'bracket',x:355,y:475,w:47,h:26,show:s=>s.opened.includes('P15')&&!s.taken.includes('P15')}],
 waiting:[{item:'knob',x:1002,y:438,w:42,h:25,show:s=>s.opened.includes('P05')&&!s.taken.includes('P05')}],
 lost:[{item:'managementTag',x:1033,y:652,w:55,h:33,show:s=>s.opened.includes('P10')&&!s.taken.includes('P10')}],
 store:[{item:'plate',x:560,y:485,w:155,h:27,show:s=>s.opened.includes('P18')&&!s.taken.includes('P18')}],
 lamp:[{item:'lamp',x:200,y:600,w:120,h:144,show:s=>s.opened.includes('P23')&&!s.taken.includes('P23')}],
 closed:[{item:'handle',x:220,y:645,w:160,h:68,show:s=>s.opened.includes('P25')&&!s.taken.includes('P25')}],
};
export function WorldItems({s}:{s:GameState}){return <><svg className="scene-dynamics" viewBox="0 0 1672 941" aria-hidden="true">{(worldItems[s.room]??[]).filter(p=>p.show(s)&&itemArt[p.item]).map(p=><image key={p.item} href={itemArt[p.item]} x={p.x} y={p.y} width={p.w} height={p.h} style={{filter:'brightness(.7) drop-shadow(2px 3px 2px #0009)'}}/>)}
 {(s.room==='train'||s.room==='return')&&<>
  {s.opened.includes('P08')&&!s.taken.includes('P08')&&<image href={itemArt.officeKey} x="1515" y="212" width="32" height="88"/>}
  {s.opened.includes('P02')&&!s.taken.includes('P02')&&<image href="/assets/documents/window/frame-2.webp" x="270" y="720" width="77" height="47" transform="rotate(-8 305 742)"/>}
 </>}
 {s.room==='closed'&&s.mountedTicket&&<g transform="translate(888 471) rotate(-4) scale(1 .38)"><svg width="84" height="38"><PaperTicket ticket={s.mountedTicket} compact/></svg></g>}
 {s.room==='platform'&&s.trainAt>0&&!s.taken.includes('P31')&&!s.opened.includes('P31')&&<path d="M138 671l39-9 5 21-37 10Z" fill="#b2a481" stroke="#d1bea0"/>}
 {s.room==='platform'&&s.opened.includes('P31')&&!s.taken.includes('P31')&&<path d="M311 660l41-4 3 22-40 6Z" fill="#b2a481" stroke="#d1bea0"/>}
 {s.room==='office'&&s.opened.includes('P12')&&!s.taken.includes('P12')&&<g><path d="M410 420h39v15h-39Z" fill="#b9ab88"/><circle cx="430" cy="427" r="4" fill="none" stroke="#484737"/></g>}
 {s.room==='office'&&s.opened.includes('P26')&&!s.taken.includes('P26')&&<g transform="translate(365 700) skewX(-15)">{[2,1,0].map(n=><rect key={n} x={n*2} y={n*2} width="120" height="28" fill="#c1b798" stroke="#807356"/>)}</g>}
 </svg>{s.room==='closed'&&<div className="world-route" inert aria-hidden="true"><RouteWorkspace s={s} dispatch={()=>{}} message={()=>{}}/></div>}</>}
