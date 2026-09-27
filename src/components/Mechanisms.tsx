import type { ReactNode } from 'react';
import { PhotoStage } from './PhotoStage';
import { BalanceArtwork } from './BalanceArtwork';
export interface MechanismProps {id:string;v:number[];set:(n:number[])=>void;message:(s:string)=>void;leftPresent?:boolean;disabled?:boolean}
export function SlidingCatch({id,v,set,message,imageSrc,interactive=true,children}:MechanismProps&{imageSrc?:string;interactive?:boolean;children?:ReactNode}){
 const [x,y]=v;
 const move=(axis:number,dir:number)=>{
  const n=[x,y];const next=Math.max(0,Math.min(2,n[axis]+dir));
  if(axis===1&&x!==1){message('縦の爪が、横の爪に当たる。');return}
  if(axis===0&&y===1){message('切れ目を通っている爪に、端が当たる。');return}
  n[axis]=next;set(n);
 };
 return <div className="catch-assembly"><PhotoStage className={id==='P15'?'catch-workspace gate-catch':'catch-workspace'} src={imageSrc??'/assets/closeups/metal/box.webp'} alt="荷物棚の金属箱"><svg viewBox="0 0 720 380" preserveAspectRatio={id==='P15'?'none':undefined} aria-label="重なった二つの爪。切れ目で縦の爪を通せる。">
  <defs><linearGradient id="brass" x2="0" y2="1"><stop stopColor="#b6a270"/><stop offset=".25" stopColor="#82774f"/><stop offset=".5" stopColor="#d1bb7b"/><stop offset="1" stopColor="#655c40"/></linearGradient><filter id="cast-shadow"><feDropShadow dx="3" dy="5" stdDeviation="3" floodOpacity=".75"/></filter></defs>
  <path d="M90 190H630M360 50V335" stroke="#1b2424" strokeWidth="31"/><path d="M90 176H630M345 50V335" stroke="#7e8276" strokeWidth="2"/>
  <g transform={`translate(${(x-1)*105} 0)`} filter="url(#cast-shadow)"><path d="M170 165H345V180H375V165H500V214H375V199H345V214H170Z" fill="url(#brass)" stroke="#c1b085"/><path d="M205 175V204M210 175V204M215 175V204" stroke="#544e36" strokeWidth="3"/></g>
  <g transform={`translate(0 ${y*70})`} filter="url(#cast-shadow)"><path d="M348 66H373V166H348Z" fill="url(#brass)" stroke="#c1b085"/><rect x="339" y="79" width="43" height="20" rx="5" fill="url(#brass)"/></g>
  <path d="M105 315H605" stroke="#222b2a" strokeWidth="3"/>
 </svg>{children}</PhotoStage>{interactive&&<div className="catch-buttons"><div><span>横の爪</span><button onClick={()=>move(0,-1)} aria-label="横の爪を左へ">←</button><button onClick={()=>move(0,1)} aria-label="横の爪を右へ">→</button></div><div><span>縦の爪</span><button onClick={()=>move(1,-1)} aria-label="縦の爪を上へ">↑</button><button onClick={()=>move(1,1)} aria-label="縦の爪を下へ">↓</button></div></div>}</div>;
}
const blocked=new Set(['1,0','1,1','3,2','3,3','0,3','4,3']);
export function HookPath({v,set,message,id}:MechanismProps){
 const [x,y]=v;const isHook=id==='P14';
 const move=(dx:number,dy:number)=>{const a=x+dx,b=y+dy;if(a<0||a>4||b<0||b>3||blocked.has(`${a},${b}`)){message(isHook?'横桟に棒が当たった。':'輪が掛け金に当たる。');return}set([a,b]);};
 return <div className="hook-workspace"><svg viewBox="0 0 650 370" aria-label="掛け金の溝"><path d="M88 66H556V320H88Z" fill="#383c32" stroke="#8b846d" strokeWidth="8"/>{Array.from({length:20},(_,n)=>{const a=n%5,b=Math.floor(n/5);return <rect key={n} x={100+a*90} y={50+b*78} width="82" height="68" rx="6" fill={blocked.has(`${a},${b}`)?'#676b5c':'#151d1d'} stroke="#8b8775" strokeWidth="2"/>})}<circle cx={501} cy={163} r="19" fill="#ac9872"/><path d={`M${141+x*90} ${84+y*78}v-15a17 17 0 1 1 17 17h-17`} stroke="#c6c7b5" strokeWidth="9" fill="none"/></svg><div className="work-controls"><button onClick={()=>move(-1,0)}>←</button><button onClick={()=>move(0,-1)}>↑</button><button onClick={()=>move(0,1)}>↓</button><button onClick={()=>move(1,0)}>→</button></div></div>;
}
export function Balance({v,set,leftPresent=true}:MechanismProps){
 return <div><svg className="balance" viewBox="0 0 720 440"><BalanceArtwork v={v} leftPresent={leftPresent}/></svg><div className="work-controls">{['左の吊り口','右の重り'].map((label,i)=><label key={i}>{label}<input type="range" min="1" max="4" value={v[i]} onChange={e=>set(v.map((n,j)=>i===j?Number(e.target.value):n))}/><output>{v[i]}</output></label>)}</div></div>;
}
export function RotatingSlots({v,set,disabled=false}:MechanismProps){return <div className="rotating-slots">{v.map((n,i)=><button key={i} disabled={disabled} aria-label={`${i?'奥':'手前'}の受け口を回す`} onClick={()=>set(v.map((m,j)=>i===j?(m+1)%4:m))}><svg viewBox="0 0 250 250"><defs><radialGradient id={`metal-${i}`}><stop stopColor="#a8ac9f"/><stop offset=".75" stopColor="#525c55"/><stop offset="1" stopColor="#2b3530"/></radialGradient></defs><circle cx="125" cy="125" r="102" fill={`url(#metal-${i})`} stroke="#abb1a3" strokeWidth="3"/><g transform={`rotate(${n*45} 125 125)`}><rect x="46" y="116" width="158" height="18" fill="#0b1515" stroke="#a8a492" strokeWidth="3"/></g>{[0,90,180,270].map(a=><circle key={a} cx="125" cy="35" r="5" fill="#202d28" transform={`rotate(${a} 125 125)`}/>)}</svg><span>{i?'奥':'手前'}</span></button>)}</div>}
