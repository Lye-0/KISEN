import { useState,useEffect,useRef } from 'react';
import type { Action,GameState,Shape } from '../game/model';
import { SHAPES,junctions,owns,traceRoute } from '../game/model';
import { ItemEvidence } from './ItemEvidence';
import { Hole,PaperTicket,sampleTicket,symbols,shapeLabels } from './Figures';
import { tapeEvents } from '../game/recordings';
export interface WorkProps {s:GameState;dispatch:(a:Action)=>void;message:(m:string)=>void;}
const point:Record<string,number[]>={H:[110,380],K:[110,110],W:[250,280],T:[430,150],N:[625,245],S:[390,415],O:[720,85],A:[55,250],B:[450,30],C:[725,425]};
const glyph:Record<string,string>={H:'ロ',K:'イ',W:'ハ',T:'ニ',N:'ホ',S:'ヘ',O:'ト',A:'チ',B:'リ',C:'ヌ'};
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
    {Object.entries(point).map(([id,[x,y]])=><g key={id}><circle cx={x} cy={y} r="15" fill="#222925" stroke="#b9aa81" strokeWidth="2"/><text x={x} y={id==='B'?y+37:y-27} textAnchor="middle" fill="#d4c9ad" fontSize="22">{glyph[id]}</text></g>)}
    {scan.length>0&&<path d={scan.filter(n=>point[n]).map((n,i)=>`${i?'L':'M'}${point[n]}`).join(' ')} stroke="#d29e5d" fill="none" strokeWidth="5" className="scan-line"/>}
    {junctions.map((j,i)=><g key={j.id} className="rail-switch" role="button" tabIndex={0} aria-label={`分岐${glyph[j.id]}を切り替える`} onClick={()=>change(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();change(i)}}} transform={`translate(${point[j.id]})`}><circle r="24" fill="#3d4138" stroke="#897e60" strokeWidth="3"/><path d="M-13 0H13" stroke="#e1d0a1" strokeWidth="5" transform={`rotate(${Math.atan2(point[j.exits[s.route.switches[i]]][1]-point[j.id][1],point[j.exits[s.route.switches[i]]][0]-point[j.id][0])*180/Math.PI})`}/></g>)}
    <path d={`M48 ${s.route.start?380:110}H78`} stroke="#d3a367" strokeWidth="8"/><g className="rail-switch" tabIndex={0} role="button" aria-label="出発側を切り替える" onClick={()=>{dispatch({type:'route',value:{start:s.route.start?0:1}});setScan([])}} onKeyDown={e=>e.key==='Enter'&&dispatch({type:'route',value:{start:s.route.start?0:1}})}><rect x="12" y="15" width="105" height="44" rx="8" fill="#555343" stroke="#b2a781"/><text x="65" y="45" fill="#e1d6b7" textAnchor="middle" fontSize="22">始点</text></g>
   </svg>
   {s.installed.includes('plate')&&<button className="installed-plate" onClick={()=>{dispatch({type:'route',value:{plateTurn:s.route.plateTurn?0:1}});setScan([])}} aria-label="接続板を裏返す"><svg viewBox="0 0 140 60"><image href="/assets/items/plate/main.webp" width="140" height="60" preserveAspectRatio="none"/><path d={s.route.plateTurn?'M10 50L70 10L130 10':'M10 50L70 50L130 10'} stroke="#c8bb98" strokeWidth="5" fill="none"/></svg></button>}
   {s.installed.includes('handle')&&<button className="installed-handle" aria-label="進路を走査する" onClick={()=>{setScan(path);if(s.installed.includes('plate')&&s.trainAt===0){dispatch({type:'train',value:1});message('分岐が動いた。到着した車両が、留置線へゆっくり下がった。')}else message(path.at(-1)==='loop'?'走査灯が、同じ場所へ戻った。':path.at(-1)==='gap'?'空所で走査灯が止まった。':'走査灯が、盤の端の接点まで進んだ。')}}><span/></button>}
  </div>
  <div className="small-route-controls"><button onClick={()=>dispatch({type:'route',value:{start:s.route.start?0:1}})}>始点 {s.route.start?'ロ':'イ'}</button>{junctions.map((j,i)=><button key={j.id} onClick={()=>change(i)}>分岐 {glyph[j.id]}</button>)}{s.installed.includes('plate')&&<button onClick={()=>dispatch({type:'route',value:{plateTurn:s.route.plateTurn?0:1}})}>板を裏返す</button>}</div><div className="work-controls"><span>可動部を回す</span><button onClick={()=>{dispatch({type:'values',id:'P30',value:[...s.route.switches,s.route.start,s.route.plateTurn,s.installed.includes('plate')?1:0]});dispatch({type:'note',id:'P30'});message('今の盤の線を記録した。')}}>盤を記録する</button>{(['plate','handle'] as const).map(item=>s.installed.includes(item)?<button key={item} onClick={()=>{dispatch({type:'remove',item});setScan([])}}>{item==='plate'?'接続板':'ハンドル'}を外す</button>:<button key={item} disabled={!owns(s,item)} onClick={()=>dispatch({type:'install',item})}>{item==='plate'?'接続板':'ハンドル'}を取り付ける</button>)}</div>
 </div>;
}
export function PunchWorkspace({s,dispatch,message}:WorkProps){
 const shape:Shape=SHAPES[s.values.P34Blade?.[0]??0];const setShape=(value:Shape)=>dispatch({type:'values',id:'P34Blade',value:[SHAPES.indexOf(value)]});
 const [compare,setCompare]=useState(false);
 const ready=owns(s,'punch')&&owns(s,'paper');
 return <div className="punch-workspace"><p className="horizontal-tip">作業面は横に動かせます。</p><div className="desk-scroll" tabIndex={0} aria-label="券の作業面。狭い画面では横に動かせます"><div className="ticket-desk">
  {owns(s,'paper')&&<img className="desk-layer stock-present" src="/assets/closeups/ticket/desk.webp" alt="持ってきた乗車券用紙"/>}
  {owns(s,'punch')&&<img className="desk-layer plier-present" src="/assets/closeups/ticket/desk.webp" alt="持ってきた改札鋏"/>}
  {owns(s,'paper')&&<PaperTicket ticket={s.ticket} onPunch={ready?(column,row)=>{dispatch({type:'punch',value:{column,row,shape}});message(`${column+1}列の${row===0?'上':'下'}に、${shapeLabels[shape]}の印を切った。`)}:undefined}/>}
  </div></div><div className="punch-tools" aria-label="改札鋏の刃">{SHAPES.map(v=><button key={v} className={v===shape?'selected':''} aria-label={`${shapeLabels[v]}の鋏`} onClick={()=>setShape(v)}><svg viewBox="-25 -25 50 50"><Hole shape={v}/></svg><small>{shapeLabels[v]}</small></button>)}</div>
 <div className="work-controls"><span>便</span>{[1,2,3].map(n=><button key={n} className={s.ticket.service===n?'selected':''} onClick={()=>dispatch({type:'ticketService',value:n})}>{n}</button>)}<button onClick={()=>dispatch({type:'flipTicket'})}>裏返す</button><button disabled={!owns(s,'paper')} onClick={()=>dispatch({type:'newTicket'})}>新しい紙</button><button disabled={!ready||!s.ticket.holes.length} onClick={()=>{dispatch({type:'keepTicket'});message('加工した切符を手元に置いた。')}}>切符を持つ</button></div>
 {!ready&&<p className="world-feedback">{!owns(s,'punch')?'紙を切る鋏がない。':'未使用の紙がない。'}</p>}
 <div className="work-controls"><button onClick={()=>setCompare(!compare)}>{compare?'資料をしまう':'手元の資料を並べる'}</button></div>{compare&&<div className="ticket-reference-table">{s.notes.includes('ownTicket')&&<section><p>駅へ来た券</p><PaperTicket ticket={sampleTicket(600,[{column:0,row:0,shape:'water'},{column:1,row:0,shape:'tower'}])} compact/></section>}{owns(s,'stub')&&<ItemEvidence item="stub"/>}{!s.notes.includes('ownTicket')&&!owns(s,'stub')&&<p>比較する券や区間の控えは、まだ手元にない。</p>}</div>}
 {s.discarded.length>0&&<details className="old-tickets"><summary>最近作った券と比べる（{s.discarded.length}）</summary><div>{s.discarded.map(t=><PaperTicket key={t.id} ticket={t} compact/>)}</div></details>}
 </div>;
}
const tapeA=[{at:2,label:'足音',kind:'soft'},{at:6,label:'閉鎖',kind:'cross'},{at:11,label:'通過',kind:'train'},{at:16,label:'停止',kind:'stop'},{at:18,label:'閉鎖・欠灯',kind:'broken'}];
const tapeB=[{at:2,label:'閉鎖',kind:'cross'},{at:4,label:'扉閉',kind:'door'},{at:10,label:'ベル',kind:'bell'},{at:14,label:'閉鎖・欠灯',kind:'broken'},{at:18,label:'足音',kind:'soft'}];
export function Timeline({offset,setOffset}:{offset:number;setOffset?:(n:number)=>void}){
 const viewport=useRef<HTMLDivElement>(null);
 useEffect(()=>{const e=viewport.current;if(e&&e.clientWidth<650)e.scrollLeft=Math.max(0,e.scrollWidth*.483-e.clientWidth/2)},[]);
 const x=(n:number)=>65+(n+12)*16;
 return <div className="tape-workspace"><p className="horizontal-tip">記録紙は横に動かせます。</p><div ref={viewport} className="tape-scroll" tabIndex={0} aria-label="二本の記録。狭い画面では横に動かせます"><svg viewBox="0 0 930 310" role="img" aria-label={`AとBの記録。Bの開始はAの${offset}目盛り後。`}><rect width="930" height="310" fill="#273c30"/>{Array.from({length:51},(_,i)=>{const n=i-12;return <g key={i}><path d={`M${x(n)} 30v240`} stroke="#9ba381" strokeWidth="1" opacity={n%2===0?.3:.12}/>{n%4===0&&<text x={x(n)} y="21" textAnchor="middle" fill="#d2d1a5" fontSize="12">{n}</text>}</g>})}{[tapeA,tapeB].map((events,row)=><g key={row}><text x="18" y={102+row*135} fill="#e2d0a0" fontSize="26">{row?'B':'A'}</text><rect x={x(row?offset:0)} y={45+row*135} width={21*16} height="95" fill="#192d25" stroke="#a7a77e" strokeWidth="2"/>{events.map((e,i)=><g key={i}><path d={`M${x(e.at+(row?offset:0))} ${56+row*135}v45`} stroke="#d0c295" strokeWidth="3"/><text x={x(e.at+(row?offset:0))} y={121+row*135+(e.kind==='broken'?18:0)} fill="#ddd2ad" fontSize="14" textAnchor="middle">{e.label}</text>{['cross','broken'].includes(e.kind)&&<g><rect x={x(e.at+(row?offset:0))-10} y={73+row*135} width="8" height="17" fill="#b3c685"/><rect x={x(e.at+(row?offset:0))+3} y={73+row*135} width="8" height="17" fill={e.kind==='broken'?'#27382a':'#b3c685'} stroke="#b3c685"/></g>}</g>)}</g>)}</svg></div>{setOffset&&<div className="work-controls"><button aria-label="Bの記録を左へ" onClick={()=>setOffset(Math.max(-12,offset-1))}>←</button><span>Bの開始位置 {offset>0?'+':''}{offset}</span><button aria-label="Bの記録を右へ" onClick={()=>setOffset(Math.min(18,offset+1))}>→</button></div>}<p className="engraved-note">二本とも、途中から始まる記録。</p></div>;
}
export function ShapeDials({values,choices,onChange}:{values:number[];choices:string[];onChange:(v:number[])=>void}){return <div className="dial-row">{values.map((v,i)=><div className="dial-unit" key={i}><button aria-label={`${i+1}番の刻印を次へ`} onClick={()=>onChange(values.map((n,j)=>i===j?(n+1)%choices.length:n))}>⌃</button><span className="dial-face">{choices[v]??symbols.cross}</span><button aria-label={`${i+1}番の刻印を前へ`} onClick={()=>onChange(values.map((n,j)=>i===j?(n+choices.length-1)%choices.length:n))}>⌄</button></div>)}</div>}
export function EventLock({values,set}:{values:number[];set:(v:number[])=>void}){return <div className="event-lock"><p>保管棚の刻印</p><div>{values.map((n,i)=><button key={i} aria-label={`${i+1}番の出来事：${tapeEvents[n]}。回す`} onClick={()=>set(values.map((m,j)=>i===j?(m+1)%4:m))}><span>{['▥','⇥','♬','■'][n]}</span><small>{tapeEvents[n]}</small></button>)}</div></div>}

