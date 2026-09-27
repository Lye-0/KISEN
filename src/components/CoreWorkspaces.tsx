import { useState } from 'react';
import type { Action,GameState,Shape } from '../game/model';
import { SHAPES,junctions,owns,routeReady,traceRoute } from '../game/model';
import { Hole,PaperTicket,symbols,shapeLabels } from './Figures';
export interface WorkProps {s:GameState;dispatch:(a:Action)=>void;message:(m:string)=>void;}
const point:Record<string,number[]>={H:[110,380],K:[110,110],W:[250,280],T:[430,150],N:[625,245],S:[390,415],O:[720,85]};
const glyph:Record<string,string>={H:'ロ',K:'イ',W:'ハ',T:'ニ',N:'ホ',S:'ヘ',O:'ト'};
export function RouteWorkspace({s,dispatch,message}:WorkProps){
 const [scan,setScan]=useState<string[]>([]);
 const path=traceRoute(s.route,s.installed.includes('plate'));
 const change=(idx:number)=>{const v=[...s.route.switches];v[idx]=(v[idx]+1)%3;dispatch({type:'route',value:{switches:v}});setScan([])};
 return <div className="route-workspace">
  <div className="route-photo"><img src="/assets/closeups/route/board.webp" alt="黒い琺瑯の進路盤。下に接続板の空所とハンドルの軸。"/>
   <svg className="route-engraving" viewBox="0 0 800 500" aria-label="進路盤。分岐を回して線路をつなぐ。">
    <defs><marker id="direction" viewBox="0 0 10 10" refX="23" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#d5cba6"/></marker><filter id="chalk"><feTurbulence baseFrequency=".7" numOctaves="2" result="grain"/><feComposite in="SourceGraphic" in2="grain" operator="in"/></filter></defs>
    <g stroke="#bfb28d" fill="none" opacity=".5" strokeWidth="3">
     {junctions.flatMap(j=>j.exits.map(e=><path key={j.id+e} d={`M${point[j.id]} L${point[e]}`} strokeDasharray="3 8"/>))}
     <path d="M110 110L250 280M110 380L250 280M110 380L390 415"/>
    </g>
    <g stroke="#d5cba6" fill="none" strokeWidth="6" strokeLinecap="round" opacity=".8">
     {junctions.map((j,i)=><path key={j.id} markerEnd="url(#direction)" d={`M${point[j.id]}L${point[j.exits[s.route.switches[i]]]}`}/>)}
     {s.installed.includes('plate')&&<path d={`M110 380L${point[s.route.plateTurn?'W':'S']}`}/>}<path d="M110 110L250 280"/>
    </g>
    {Object.entries(point).map(([id,[x,y]])=><g key={id}><circle cx={x} cy={y} r="15" fill="#222925" stroke="#b9aa81" strokeWidth="2"/><text x={x} y={y-27} textAnchor="middle" fill="#d4c9ad" fontSize="22">{glyph[id]}</text></g>)}
    {scan.length>0&&<path d={scan.filter(n=>point[n]).map((n,i)=>`${i?'L':'M'}${point[n]}`).join(' ')} stroke="#d29e5d" fill="none" strokeWidth="5" className="scan-line"/>}
    {junctions.map((j,i)=><g key={j.id} className="rail-switch" role="button" tabIndex={0} aria-label={`分岐${glyph[j.id]}を切り替える`} onClick={()=>change(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change(i)}}} transform={`translate(${point[j.id]})`}><circle r="24" fill="#3d4138" stroke="#897e60" strokeWidth="3"/><path d="M-13 0H13" stroke="#e1d0a1" strokeWidth="5" transform={`rotate(${Math.atan2(point[j.exits[s.route.switches[i]]][1]-point[j.id][1],point[j.exits[s.route.switches[i]]][0]-point[j.id][0])*180/Math.PI})`}/></g>)}
    <g className="rail-switch" tabIndex={0} role="button" aria-label="出発側を切り替える" onClick={()=>{dispatch({type:'route',value:{start:s.route.start?0:1}});setScan([])}} onKeyDown={e=>e.key==='Enter'&&dispatch({type:'route',value:{start:s.route.start?0:1}})}><path d={`M48 ${s.route.start?380:110}H78`} stroke="#d3a367" strokeWidth="8"/><rect x="22" y="215" width="77" height="46" rx="8" fill="#555343" stroke="#b2a781"/><text x="60" y="246" fill="#e1d6b7" textAnchor="middle" fontSize="22">始点</text></g>
   </svg>
   {s.installed.includes('plate')&&<button className="installed-plate" onClick={()=>{dispatch({type:'route',value:{plateTurn:s.route.plateTurn?0:1}});setScan([])}} aria-label="接続板を裏返す"><svg viewBox="0 0 140 60"><path d={s.route.plateTurn?'M10 50L70 10L130 10':'M10 50L70 50L130 10'} stroke="#c8bb98" strokeWidth="5" fill="none"/></svg></button>}
   {s.installed.includes('handle')&&<button className="installed-handle" aria-label="進路を走査する" onClick={()=>{setScan(path);message(path.at(-1)==='loop'?'走査灯が、同じ場所へ戻った。':path.at(-1)==='gap'?'空所で走査灯が止まった。':'走査灯が線路の先まで進んだ。')}}><span/></button>}
  </div>
  <div className="work-controls"><span>可動部を回す</span>{(['plate','handle'] as const).map(item=>s.installed.includes(item)?<button key={item} onClick={()=>{dispatch({type:'remove',item});setScan([])}}>{item==='plate'?'接続板':'ハンドル'}を外す</button>:<button key={item} disabled={!owns(s,item)} onClick={()=>dispatch({type:'install',item})}>{item==='plate'?'接続板':'ハンドル'}を取り付ける</button>)}</div>
  {routeReady(s)&&<p className="world-feedback">遠くで分岐が動き、隧道の先へ灯りが続いた。</p>}
 </div>;
}
export function PunchWorkspace({s,dispatch,message}:WorkProps){
 const [shape,setShape]=useState<Shape>('cross');
 const ready=owns(s,'punch')&&owns(s,'paper');
 return <div className="punch-workspace"><div className="ticket-desk">
  <PaperTicket ticket={s.ticket} onPunch={ready?(column,row)=>{dispatch({type:'punch',value:{column,row,shape}});message(`${column+1}列の${row===0?'上':'下'}に、${shapeLabels[shape]}の印を切った。`)}:undefined}/>
  <div className="punch-tools" aria-label="改札鋏の刃">{SHAPES.map(v=><button key={v} className={v===shape?'selected':''} aria-label={`${shapeLabels[v]}の鋏`} onClick={()=>setShape(v)}><svg viewBox="-25 -25 50 50"><Hole shape={v}/></svg><small>{shapeLabels[v]}</small></button>)}</div>
 </div><div className="work-controls"><span>便</span>{[1,2,3].map(n=><button key={n} className={s.ticket.service===n?'selected':''} onClick={()=>dispatch({type:'ticketService',value:n})}>{n}</button>)}<button onClick={()=>dispatch({type:'flipTicket'})}>裏返す</button><button disabled={!owns(s,'paper')} onClick={()=>dispatch({type:'newTicket'})}>新しい紙</button><button disabled={!ready||!s.ticket.holes.length} onClick={()=>{dispatch({type:'keepTicket'});message('加工した切符を手元に置いた。')}}>切符を持つ</button></div>
 {!ready&&<p className="world-feedback">{!owns(s,'punch')?'紙を切る鋏がない。':'未使用の紙がない。'}</p>}
 {s.discarded.length>0&&<details className="old-tickets"><summary>前に作った券と比べる（{s.discarded.length}）</summary><div>{s.discarded.map(t=><PaperTicket key={t.id} ticket={t} compact/>)}</div></details>}
 </div>;
}
const tapeA=[{at:2,label:'足音',kind:'soft'},{at:6,label:'閉鎖',kind:'cross'},{at:11,label:'通過',kind:'train'},{at:16,label:'停止',kind:'stop'},{at:18,label:'閉鎖・欠灯',kind:'broken'}];
const tapeB=[{at:2,label:'閉鎖',kind:'cross'},{at:4,label:'扉閉',kind:'door'},{at:10,label:'ベル',kind:'bell'},{at:14,label:'閉鎖・欠灯',kind:'broken'},{at:18,label:'足音',kind:'soft'}];
export function Timeline({offset,setOffset}:{offset:number;setOffset:(n:number)=>void}){
 return <div className="tape-workspace"><div className="tape-ruler">{Array.from({length:29},(_,i)=><span key={i}>{i%2===0?i:''}</span>)}</div>{[tapeA,tapeB].map((t,j)=><div className="tape-row" key={j}><span className="tape-label">{j?'B':'A'}</span><div className="tape-strip" style={{left:`${j?offset/28*100:0}%`}}>{t.map((e,i)=><div className={`tape-event ${e.kind}`} key={i} style={{left:`${e.at/28*100}%`}}><i/><span>{e.label}</span></div>)}</div></div>)}<div className="work-controls"><button aria-label="Bの記録を左へ" onClick={()=>setOffset(Math.max(-6,offset-1))}>←</button><span>Bの開始位置 {offset>0?'+':''}{offset}</span><button aria-label="Bの記録を右へ" onClick={()=>setOffset(Math.min(8,offset+1))}>→</button></div><p className="engraved-note">閉鎖　▥▥　／　二度目　▥□</p></div>;
}
export function ShapeDials({values,choices,onChange}:{values:number[];choices:string[];onChange:(v:number[])=>void}){return <div className="dial-row">{values.map((v,i)=><div className="dial-unit" key={i}><button aria-label={`${i+1}番の刻印を次へ`} onClick={()=>onChange(values.map((n,j)=>i===j?(n+1)%choices.length:n))}>⌃</button><span className="dial-face">{choices[v]??symbols.cross}</span><button aria-label={`${i+1}番の刻印を前へ`} onClick={()=>onChange(values.map((n,j)=>i===j?(n+choices.length-1)%choices.length:n))}>⌄</button></div>)}</div>}

