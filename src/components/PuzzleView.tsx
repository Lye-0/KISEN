import { useState } from 'react';
import type { GameState,Action } from '../game/model';
import { itemNames,missing,open,rewards,routeReady,ticketValid } from '../game/model';
import type { Puzzle } from '../game/content';
import { RouteWorkspace,PunchWorkspace,ShapeDials,Timeline } from './CoreWorkspaces';
import { PaperTicket,sampleTicket,StationPlan } from './Figures';
import { Balance,Crates,HookPath,LightWorkspace,RotatingSlots,SlidingCatch } from './Mechanisms';
const initial=(p:Puzzle)=>p.kind==='order'?p.answer.map((_,i)=>i):p.kind==='timeline'?[0]:p.kind==='balance'?[1,1]:p.kind==='crates'?[1,1,1]:p.kind==='rings'?[1,3]:p.kind==='hook'?[0,0]:p.kind==='segments'?[0,0,0,0,0,0]:p.kind==='map'?[0,0]:p.answer.map(()=>0);
const choicesFor=(p:Puzzle)=>p.choices??(p.kind==='dial'?Array.from({length:10},(_,i)=>`${i}`):p.kind==='punchSelect'?['左','中央','右']:p.kind==='departure'?['一便／南／録音','二便／北／現場灯','三便／南／声']:p.kind==='schedule'?['一便／南','二便／北','三便']:p.kind==='height'||p.kind==='traces'?['左','中央','右']:p.kind==='signal'?['A','B','C']:p.kind==='arrival'?['一つ目','二つ目','三つ目']:['○','△','□','Ⅱ']);
export function PuzzleView({p,s,dispatch,message,onClose,onNotes}:{p:Puzzle;s:GameState;dispatch:(a:Action)=>void;message:(s:string)=>void;onClose:()=>void;onNotes:()=>void}){
 const [evidence,setEvidence]=useState(false);const [selected,setSelected]=useState<number|null>(null);
 const v=s.values[p.id]??initial(p);
 const set=(value:number[])=>dispatch({type:'values',id:p.id,value});
 const blocked=missing(s,p.id);const solved=open(s,p.id);const reward=rewards[p.id];
 const check=()=>{
  if(blocked.length){message(`${itemNames[blocked[0]]}が、ここで使えそうだ。`);return}
  if(p.id==='P31'&&!routeReady(s)){message('線路際は、停まった車体に隠れている。');return}
  if(p.id==='P32'&&!open(s,'P28')){message('暗くて足元の段差を比べられない。');return}
  if(p.id==='P36'&&!ticketValid(s)){message('受け部の突起と、切符の穴が合わない。券は破れずに戻ってきた。');return}
  if(p.id==='P37'&&(!routeReady(s)||!ticketValid(s)||!open(s,'P36'))){message(!routeReady(s)?'帰り側の線路が、まだつながっていない。':!ticketValid(s)?'今の経路へ通せる券がない。':'乗車口は閉じている。');return}
  const same=v.length===p.answer.length&&v.every((n,i)=>n===p.answer[i]);
  const valid=p.kind==='balance'?v[0]*2===v[1]*3:p.kind==='crates'?v.every(n=>n!==1):p.kind==='segments'?v.every((n,i)=>n===(i>=3?1:0)):same;
  if(!valid){message(p.kind==='arrival'?'駅名は同じ。でも、写真と前後が逆だ。列車へ戻れた。':p.kind==='departure'?'同じホームへ戻ってきた。持ち物はそのままだ。':p.kind==='timeline'?'共通の閉鎖が、二回ともは重ならない。':p.kind==='map'?'窓と改札の位置が、まだ重ならない。':'動かしてみたが、留めが外れない。');return}
  dispatch({type:'open',id:p.id});
  if(p.id==='P38'){dispatch({type:'end'});return}
  if(p.id==='P37'){dispatch({type:'move',room:'return'});onClose();return}
  message(reward?'留めが外れた。中に物がある。':p.id==='P16'?'北の壁の継ぎ目が開いた。奥に、もう一つのホーム。':'動かしたものが、その位置で留まった。');
 };
 const swap=(index:number)=>{if(selected===null){setSelected(index);return}const a=[...v];[a[index],a[selected]]=[a[selected],a[index]];set(a);setSelected(null)};
 const mechanic={id:p.id,v,set,message};
 const render=()=>{
  if(p.id==='P01'&&solved)return <div className="opened-box"><img src={`/assets/closeups/metal/box-${s.taken.includes(p.id)?'empty':'open'}.webp`} alt={s.taken.includes(p.id)?'鍵を取った、空の箱':'開いた箱の中に、小さな真鍮の鍵'}/>{!s.taken.includes(p.id)&&<button className="key-in-box" aria-label="箱の中の小鍵を取る" onClick={()=>{dispatch({type:'take',id:p.id});message('小鍵を取った。')}}><span>小鍵を取る</span></button>}</div>;
  if(p.kind==='route')return <RouteWorkspace s={s} dispatch={dispatch} message={message}/>;
  if(p.kind==='punch')return <PunchWorkspace s={s} dispatch={dispatch} message={message}/>;
  if(p.kind==='slide')return <SlidingCatch {...mechanic}/>;
  if(p.kind==='hook')return <HookPath {...mechanic}/>;
  if(p.kind==='balance')return <Balance {...mechanic}/>;
  if(p.kind==='crates')return <Crates {...mechanic}/>;
  if(p.kind==='rings')return <RotatingSlots {...mechanic}/>;
  if(p.kind==='timeline')return <Timeline offset={v[0]} setOffset={n=>set([n])}/>;
  if(p.kind==='map')return <><StationPlan flip={!!v[0]} extension={v[1]} onSelect={p.id==='P16'?n=>set([v[0],n]):undefined}/><div className="work-controls"><button onClick={()=>set([v[0]?0:1,v[1]])}>裏から見る</button></div></>;
  if(p.kind==='lampAngle'||p.kind==='reflection'||p.kind==='shutters')return <LightWorkspace kind={p.kind} v={v} set={set}/>;
  if(p.kind==='order')return <div className={`order-workspace ${p.id==='P03'?'photographs':''}`}><p className="engraved-note">一枚を選び、入れ替える相手に触れる</p><div className="order-pieces">{v.map((n,i)=><button draggable onDragStart={()=>setSelected(i)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();swap(i)}} key={i} className={selected===i?'selected':''} onClick={()=>swap(i)} aria-label={`${i+1}枚目、${p.labels?.[n]??['給水槽と尾灯','遮断機が下','遮断機が上','塔と遠い貨車','塔と貨車の先頭'][n]}`}>
    {p.id==='P03'?<><div className={`window-study frame-${n}`}><img src={`/assets/documents/window/frame-${n}.webp`} alt={['給水槽の水面に赤い尾灯','下り切った遮断機','上がった遮断機','梯子が右の塔と遠ざかる貨車','梯子が左の塔と貨車先頭'][n]}/></div><small>{['水面に赤い光','閉じた踏切','開いた踏切','遠ざかる貨車','貨車の先頭'][n]}</small></>:p.id==='P10'?<><div className={`umbrella u-${n}`}>☂</div><span>{p.labels?.[n]}</span></>:<span>{p.labels?.[n]??n+1}</span>}
   </button>)}</div></div>;
  if(p.kind==='tickets'||p.kind==='ticketTrial')return <div className="ticket-study"><div className="sample-tickets"><PaperTicket compact ticket={sampleTicket(701,[{column:0,row:0,shape:'cross'},{column:1,row:0,shape:'tower'},{column:2,row:0,shape:'water'}])}/><PaperTicket compact ticket={sampleTicket(702,[{column:0,row:1,shape:'water'},{column:1,row:1,shape:'tower'},{column:2,row:1,shape:'cross'}])}/></div><ShapeDials values={v} choices={p.kind==='ticketTrial'?['踏切','塔','給水槽','小屋']:['0','1','2','3']} onChange={set}/></div>;
  if(p.kind==='notices')return <div className="notice-workspace"><div className="notice-pieces">{[0,1,2,3].map(n=><button key={n} onClick={()=>set([v[1],n])} className={v.includes(n)?'selected':''}><svg viewBox="0 0 180 220"><path d="M10 8L166 4L174 209L3 214Z" fill="#c7bc93"/><text x="90" y="140" fill="#6b5947" fontSize="59" textAnchor="middle">{['06','31','47','82'][n]}</text>{(n===0?[45,160]:n===2?[45,160]:n===1?[75,130]:[90,180]).map((y,i)=><circle key={i} cx={n===2?157:18} cy={y} r="5" fill="#26312b"/>)}</svg><span>{['甲','乙','丙','丁'][n]}</span></button>)}</div><p className="engraved-note">左：{['甲','乙','丙','丁'][v[0]]}　右：{['甲','乙','丙','丁'][v[1]]}</p></div>;
  if(p.kind==='segments')return <div className="segment-workspace">{['踏切','塔','給水槽','小屋','隧道','帰駅'].map((n,i)=><button key={i} className={v[i]?'selected':''} onClick={()=>set(v.map((m,j)=>i===j?1-m:m))}>{n}<span>{v[i]?'未使用':'―'}</span></button>)}</div>;
  if(p.kind==='punchSelect')return <div className="blade-workspace">{[0,1,2].map(n=><button key={n} onClick={()=>set([n])} className={v[0]===n?'selected':''}><svg viewBox="0 0 170 220"><rect x="10" y="10" width="150" height="200" rx="3" fill="#ddd1b2"/>{[0,1,2].map(i=><g key={i}><circle cx="85" cy={55+i*55} r="17" fill="#272d27"/>{n!==1&&<path d={`M${n?98:72} ${55+i*55}l${n?15:-15} -13v23Z`} fill="#272d27"/>}</g>)}</svg><span>{['左の鋏','中央の鋏','右の鋏'][n]}</span></button>)}</div>;
  if(p.kind==='signal')return <div className="signal-workspace">{[0,1,2].map(n=><button key={n} onClick={()=>set([n])} className={v[0]===n?'selected':''}><div className={`signal-light pulse-${n}`}/><span>{['A　反復する放送','B　現場の灯と合図','C　声だけの放送'][n]}</span></button>)}</div>;
  if(p.kind==='arrival')return <div className="arrival-workspace"><img src={`/assets/ending/station-${v[0]}.webp`} alt={['時計の手前に自転車置場。人影が動かない。','時計と置場は同じ位置。時計が止まっている。','時計の後ろに黄色い自転車置場。朝の人影が動く。'][v[0]]}/><div className="work-controls"><button onClick={()=>set([(v[0]+1)%3])}>次の駅まで待つ</button><button onClick={()=>setEvidence(true)}>携帯の写真を見る</button></div></div>;
  return <ShapeDials values={v} choices={choicesFor(p)} onChange={set}/>;
 };
 return <section className={`inspection surface-${p.surface}`} aria-label={p.title}>
  <header className="inspection-header"><button onClick={onClose}>← 戻る</button><div><h2>{p.title}</h2><p>{p.intro}</p></div><button onClick={onNotes}>記録を見る</button></header>
  <div className="inspection-body">{render()}</div>
  <footer className="inspection-footer"><button className="quiet" onClick={()=>setEvidence(!evidence)}>{evidence?'資料を閉じる':'そばの記録を見る'}</button>{!['route','punch'].includes(p.kind)&&(!solved?<button className="main-action" onClick={check}>{p.kind==='arrival'?'扉を開けて降りる':p.kind==='departure'?'列車へ乗る':p.kind==='map'?'位置を確かめる':p.kind==='timeline'?'記録を重ねて再生':p.kind==='rings'?'券を通す':p.kind==='order'?'並びを確かめる':'留めを動かす'}</button>:reward&&!s.taken.includes(p.id)?<button className="main-action" onClick={()=>{dispatch({type:'take',id:p.id});message(`${itemNames[reward]}を取った。`)}}>{itemNames[reward]}を取る</button>:<span className="result-caption">{reward?'中は空になっている。':'この状態で留まっている。'}</span>)}<button className="quiet" onClick={()=>dispatch({type:'hint',id:p.id})}>手掛かり</button></footer>
  {evidence&&<aside className="evidence-sheet"><button className="close-sheet" onClick={()=>setEvidence(false)}>閉じる ×</button><small>そばに残っていた記録</small><h3>{p.title}</h3><p>{p.clue}</p><button onClick={()=>{dispatch({type:'note',id:p.id});message('記録に残した。')}}>記録に残す</button></aside>}
  {(s.hints[p.id]??0)>0&&<aside className="hint-strip"><span>{p.hints[Math.min(2,(s.hints[p.id]??1)-1)]}</span><button onClick={()=>dispatch({type:'hint',id:p.id})}>もう少し</button></aside>}
 </section>;
}
