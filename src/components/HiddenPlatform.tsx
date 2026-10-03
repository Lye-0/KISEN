import { useState } from 'react'; import { SceneClocks } from './SceneClocks';
const xs=[80,250,420,590,680];
const ys=[70,140,205,325];
export const hiddenCorridor=[11,7,3,2];
export function corridorMatches(v:number[]){const cells=v.slice(1).filter(n=>n>=0);return cells.length===4&&hiddenCorridor.every(n=>cells.includes(n));}
export function HiddenPlatform({v,set,hasWall=false,wound=false}:{v:number[];set?:(n:number[])=>void;hasWall?:boolean;wound?:boolean}){
 const [reference,setReference]=useState('roof');
 const selected=v.slice(1).filter(n=>n>=0);const toggle=(cell:number)=>{if(!set)return;const n=selected.includes(cell)?selected.filter(c=>c!==cell):[...selected,cell].slice(-4);set([v[0],...n,...Array(4-n.length).fill(-1)])};
 return <div className={`hidden-platform ${set?'with-reference':''}`}>{set&&<section className="building-reference"><img src={reference==='roof'?'./assets/scenes/bridge/main.webp':'./assets/documents/wall.webp'} alt={reference==='roof'?'橋から見た駅。東の細い屋根は奥へ伸び、北の屋根の下で西へ曲がる。':'駅前から見た外壁。三つの広い窓と、右の狭い窓。'}/>{reference==='roof'&&<SceneClocks room="bridge" wound={wound}/>}<div className="work-controls"><button className={reference==='roof'?'selected':''} onClick={()=>setReference('roof')}>橋から見た屋根</button>{hasWall&&<button className={reference==='wall'?'selected':''} onClick={()=>setReference('wall')}>駅前の写真</button>}</div></section>}<section className="building-drawing"><svg viewBox="0 0 760 410" role={set?'group':'img'} aria-label="駅の構造図。既存の三室と、屋根の高さごとに分かれた区画。"><image href="./assets/parts/document/paper.png" width="760" height="410" preserveAspectRatio="none"/><g transform={v[0]?'translate(760 0) scale(-1 1)':undefined}>
  <path d="M50 43H710M50 56H710" stroke="#596b61" strokeWidth="3"/>
  {Array.from({length:12},(_,cell)=>{const col=cell%4,row=Math.floor(cell/4);const existing=row===2&&col<3;const chosen=selected.includes(cell);const x=xs[col],y=ys[row],w=xs[col+1]-x,h=ys[row+1]-y;return <g key={cell} role={set&&!existing?'button':undefined} tabIndex={set&&!existing?0:undefined} aria-label={`${col+1}列、${row+1}段の区画${chosen?'、描き込み済み':''}`} className={!existing?'map-cell':''} onClick={()=>!existing&&toggle(cell)} onKeyDown={e=>{if(!existing&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggle(cell)}}}><rect x={x} y={y} width={w} height={h} fill={existing?'#a5ad99':chosen?'#a4775155':'transparent'} stroke="#68776b" strokeWidth={existing?3:1} strokeDasharray={existing?undefined:'5 5'}/>{existing&&<path d={`M${x+w*.3} ${y+h}h${w*.4}`} stroke="#574933" strokeWidth="8"/>}{chosen&&<path d={`M${x+12} ${y+12}L${x+w-12} ${y+h-12}M${x+w-12} ${y+12}L${x+12} ${y+h-12}`} stroke="#926c4c" strokeWidth="2" opacity=".6"/>}</g>})}
  <path d="M70 260H35V210H70" fill="none" stroke="#58685c" strokeWidth="4"/><path d="M590 308h40v17h-40" fill="none" stroke="#58685c" strokeWidth="3"/>
  <path d="M630 325l-10-13 8-5" stroke="#554b3b" strokeWidth="3" fill="none"/>
 </g><text x="380" y="373" textAnchor="middle" fill="#4f6156" fontSize="17">駅の図に、見えた屋根と通路を描き足す</text></svg>
  {set&&<div className="work-controls"><button onClick={()=>set([v[0]?0:1,...v.slice(1)])}>図を裏から見る</button><span>描き込んだ区画 {selected.length} / 4</span><button onClick={()=>set([v[0],-1,-1,-1,-1])}>描き直す</button></div>}
 </section></div>;
}

