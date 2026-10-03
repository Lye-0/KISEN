import { NoticeAssembly,UmbrellaReceipt } from './PhysicalDocuments';
import { useState } from 'react';
import type { GameState,Action } from '../game/model';
import { itemNames,missing,open,rewards,routeReady,ticketValid,gateTicketValid,signalsReady } from '../game/model';
import type { Puzzle } from '../game/content';
import { RouteWorkspace,PunchWorkspace,ShapeDials,Timeline,EventLock } from './CoreWorkspaces';
import { ItemEvidence } from './ItemEvidence';
import { PaperTicket,sampleTicket } from './Figures';
import { Balance,HookPath,RotatingSlots,SlidingCatch } from './Mechanisms';
import { CargoTrack,ClockBack,Grille,Shutters,SpringCatches } from './ShortWorkspaces';
import { shuttersOpen } from '../game/mechanics';
import { TicketStudy } from './TicketStudy';
import { WindowPhotos } from './WindowPhotos';
import { HiddenPlatform,corridorMatches } from './HiddenPlatform';
import { EvidenceContent } from './EvidenceContent';
import { BagCase,RouteCase } from './CaseWorkspaces';
import { actionLabels } from '../game/actions';
import { recordOrderMatches } from '../game/recordings';
import { Departure } from './Departure';
import { Signals } from './Signals';
import { ScenePreview } from './ScenePreview';
import { RewardView } from './RewardView';
import { Boarding,Traces,PunchSelection } from './PlatformWorkspaces';
import { NumericLock } from './NumericLock';
import { Arrival } from './Arrival';
import { ScheduleChoices } from './ScheduleChoices';
import { HookReach,WallLight,ThinPlan,TunnelLight } from './PhysicalWorkspaces';
import { hookReach,plaqueLit } from '../game/geometry';
const failureMessages:Record<string,string>={P04:'引き手が、まだ出口に届いていない。',P07:'巻き軸の上に扇板が残っている。',P09:'輪が掛け金の先端まで抜けていない。',P14:'桟に触れず、鉤の先だけを穴へ通す必要がある。',P16:'描いた通路の曲がりが、屋根の形と合わない。',P17:'台車が出口へ届いていない。',P19:'試し切りに、余分な裂けが残っている。',P22:'札まで光が届かず、文字を読めない。',P23:'棒が傾き、留めが噛み込んでいる。',P25:'押さえが、まだ引出しに重なっている。',P32:'足場が続いていない。この場所からは渡れない。',P36:'受け口の向きが揃わず、券が途中で止まる。'};
const successMessages:Record<string,string>={P04:'格子が上がり、窓口の奥へ手が届く。',P07:'巻き軸が回り、時計が一分進んだ。',P17:'台車を退け、通路が空いた。',P22:'保守札の文字を記録した。',P36:'切符が、二つの受け口を通って留まった。',P01:'箱のふたが開いた。',P02:'鞄の留めが外れた。',P05:'引出しが開いた。',P08:'ケースのふたが開いた。',P09:'掛け金から輪が抜けた。棒を外せる。',P10:'受取順が揃い、引出しが開いた。',P12:'保管棚が開いた。',P14:'札を、こちら側へ引き寄せた。',P15:'柵が開いた。外れた金具が残っている。',P18:'荷物箱のふたが開いた。',P19:'鋏の留めが外れた。',P23:'棒が釣り合い、灯具箱が開いた。',P25:'収納の引出しが開いた。',P26:'用紙の引出しが開いた。',P31:'紙をホームの上へ引き寄せた。'};
const resultCaptions:Record<string,string>={P04:'格子は開いている。',P07:'時計の針が一分進んだ。',P16:'北側へ続く通路を確かめた。',P17:'台車は通路の外へ退いた。',P22:'保守札の場所を確かめた。',P28:'両端の停車窓が光っている。',P32:'確かめた足場：中央。',P36:'券が受け口に通っている。'};
const evidenceNames:Record<string,string>={P02:'鞄に残る印',P03:'写真の余白',P05:'壁の時刻表',P08:'ケースの銘板',P10:'受取票',P11:'同時撮影の記録',P12:'記録機の銘板',P13:'掲示の留め穴',P16:'図面の注記',P18:'壁の荷札',P20:'机の札',P21:'標柱の記録',P24:'机の札',P26:'管理帳と箱の印',P29:'折返し運行の控え',P30:'盤の銘板',P31:'線路際',P33:'区間の控え',P34:'作業台の札',P35:'合図の控え',P37:'運行の控え',L09:'留め穴の印'};
const observationIds=['P03','P06','P11','P13','P20','P21','P24','P27','P29','P33','P35'];
const initial=(p:Puzzle)=>p.id==='P13'?[0,1]:p.id==='P14'?[0,0,0]:p.id==='P11'?[6,6]:p.id==='P35'?[-1]:p.id==='P29'?[-1,-1]:p.id==='P38'?[0,0]:p.id==='P37'?[0,-1]:p.id==='P12'?[0,0,0,0,0]:p.id==='P16'?[0,-1,-1,-1,-1]:p.id==='P24'?Array(10).fill(-1):p.id==='P20'?[1,0,0]:p.id==='P04'?[0,4,1,3]:p.id==='P17'?[1,0,2,0]:p.id==='P25'?[0,0,0]:p.kind==='order'?p.answer.map((_,i)=>i):p.kind==='timeline'?[0]:p.kind==='balance'?[4,4]:p.kind==='rings'?[1,3]:p.kind==='hook'?[0,0]:p.kind==='segments'?[0,0,0,0,0,0]:p.kind==='map'?[0,0]:p.answer.map(()=>0);
const choicesFor=(p:Puzzle)=>p.choices??(p.kind==='dial'?Array.from({length:10},(_,i)=>`${i}`):p.kind==='punchSelect'?['左','中央','右']:p.kind==='departure'?['一便／南／録音','二便／北／現場灯','三便／南／声']:p.kind==='schedule'?['一便／南','二便／北','三便']:p.kind==='height'||p.kind==='traces'?['左','中央','右']:p.kind==='signal'?['A','B','C']:p.kind==='arrival'?['一つ目','二つ目','三つ目']:['○','△','□','Ⅱ']);
export function PuzzleView({p,s,dispatch,message,onClose,onNotes,onInspect,notice=''}:{p:Puzzle;s:GameState;dispatch:(a:Action)=>void;message:(s:string)=>void;onClose:()=>void;onNotes:()=>void;onInspect:(id:string)=>void;notice?:string}){
 const [evidence,setEvidence]=useState(false);const [showHint,setShowHint]=useState(false);const [selected,setSelected]=useState<number|null>(null);
 const v=s.values[p.id]?.length===initial(p).length?s.values[p.id]:initial(p);
 const set=(value:number[])=>dispatch({type:'values',id:p.id,value});
 const blocked=missing(s,p.id);const solved=p.id==='P38'?false:p.id==='P36'?gateTicketValid(s):p.id==='P28'?signalsReady(s):open(s,p.id);const reward=rewards[p.id];
 const check=()=>{
  if(p.id==='P12'&&!s.installed.includes('knob')){message('記録機の軸に、つまみが付いていない。');return}
  if(p.id==='P22'&&!s.installed.includes('bracket')){message('灯具を支える金具がまだ付いていない。');return}
  if(p.id==='P28'&&!s.installed.includes('tracingMap')){message('点の光が一つの窓へ集中する。空の枠へ入る、光を通す広い面が必要だ。');return}
  if(p.id==='P23'&&!s.installed.includes('managementTag')){message('左の吊り口が空いている。細い、平らな物が入りそうだ。');return}
  if(blocked.length){message(`${itemNames[blocked[0]]}が、ここで使えそうだ。`);return}
  if(p.id==='P31'&&s.trainAt===0){message('線路際は、停まった車体に隠れている。');return}
  if(p.id==='P32'&&s.trainAt!==2){message('足場と同じ位置に、まだ列車の扉がない。');return}
  if(p.id==='P28'&&!s.installed.includes('lamp')){message('灯具を取り付ける台が空いている。');return}
  if(p.id==='P37'&&s.trainAt!==2){message('ここで乗れる列車が、まだ止まっていない。');return}
  if(p.id==='P37'&&!open(s,'P32')){message('扉へ続く足場を確かめられる。');onInspect('P32');return}
  if(p.id==='P36'&&!(s.mountedTicket?gateTicketValid(s):ticketValid(s))){message('受け部と、切符の穴が合わない。券は破れずに戻ってきた。');return}
  if(p.id==='P37'&&(!routeReady(s)||!gateTicketValid(s)||!open(s,'P36'))){message(!routeReady(s)?'帰り側の線路が、まだつながっていない。':!gateTicketValid(s)?'受け部に、今の経路へ通せる券がない。':'乗車口は閉じている。');return}
  if(observationIds.includes(p.id)){if(p.id==='P27'&&v[1]&&s.inventory.includes('lamp'))dispatch({type:'note',id:'homePlate'});dispatch({type:'values',id:p.id,value:v});dispatch({type:'note',id:p.id});message('今の配置を、記録に残した。');return}
  const same=v.length===p.answer.length&&v.every((n,i)=>n===p.answer[i]);
  const valid=p.id==='P14'?hookReach(v).caught:p.id==='P22'?plaqueLit(v):p.id==='P38'?s.values.P38?.[0]===2:p.id==='P37'?s.values.activeService?.[0]===2&&s.values.P37?.[1]===0:p.id==='P12'?recordOrderMatches(v):p.id==='P16'?corridorMatches(v):p.id==='P04'?v[0]===6&&v[1]===0:p.id==='P07'?v[0]===0&&v[1]===3:p.id==='P17'?v[3]===4:p.id==='P25'?v[0]===1&&v[1]===1&&v[2]===2:p.id==='P28'?shuttersOpen(v):p.kind==='balance'?v[0]*2===v[1]*3:p.kind==='segments'?v.every((n,i)=>n===(i>=3?1:0)):same;
  if(!valid){message(failureMessages[p.id]??(p.kind==='arrival'?'扉の向こうで、同じ足音が繰り返した。車内へ戻れた。':p.kind==='departure'?'放送だけが繰り返している。現場灯と同時の合図で進める。':p.kind==='timeline'?'保管棚の四つの刻印が合わない。二本の記録から、出来事の実順を確かめられる。':p.kind==='map'?'窓と改札の位置が、まだ重ならない。':'動かしてみたが、留めが外れない。'));return}
  dispatch({type:'open',id:p.id});
  if(p.id==='P15')dispatch({type:'install',item:'bridgePin'});
  if(p.id==='P08')dispatch({type:'note',id:'towerPlate'});
  if(p.id==='P22')dispatch({type:'note',id:'junctionPlate'});
  if(p.id==='P36'&&!s.mountedTicket)dispatch({type:'install',item:'ticket'});
  if(p.id==='P32'){onInspect('P37');return}
  if(p.id==='L09'){dispatch({type:'move',room:'lamp'});onClose();return}
  if(p.id==='P38'){dispatch({type:'end'});return}
  if(p.id==='P37'){dispatch({type:'move',room:'return'});onClose();return}
  message(successMessages[p.id]??(p.id==='P16'?'屋根の陰に、北側へ続く通路があった。橋から下りられる。':'確かめた。'));
 };
 const swap=(index:number)=>{if(selected===null){setSelected(index);return}const a=[...v];[a[index],a[selected]]=[a[selected],a[index]];set(a);setSelected(null)};
 const mechanic={id:p.id,v,set,message};
 const render=()=>{
  if(p.id==='P01'&&solved)return <SlidingCatch {...mechanic} imageSrc={`./assets/closeups/metal/box-${s.taken.includes(p.id)?'empty':'open'}.webp`} interactive={false}>{!s.taken.includes(p.id)&&<button className="key-in-box" aria-label="箱の中の小鍵を取る" onClick={()=>{dispatch({type:'take',id:p.id});message('小鍵を取った。')}}><span>小鍵を取る</span></button>}</SlidingCatch>;
  if(p.id==='P02')return <BagCase s={s} dispatch={dispatch} message={message}/>;
  if(p.id==='P08')return <RouteCase s={s} dispatch={dispatch} message={message}/>;
  if(solved&&reward)return <RewardView id={p.id} s={s} dispatch={dispatch} message={message}/>;
  if(p.id==='P15')return blocked.length?<ScenePreview s={s}/>:<SlidingCatch {...mechanic} imageSrc="./assets/closeups/gate/latch.webp"/>;
  if(p.id==='P16')return <HiddenPlatform v={v} set={set} hasWall={s.notes.includes('wallPhoto')} wound={open(s,'P07')}/>;
  if(p.id==='P03')return <WindowPhotos order={v} setOrder={set}/>;
  if(p.id==='P06')return <ThinPlan {...mechanic} s={s} dispatch={dispatch}/>;
  if(p.id==='P14')return <HookReach {...mechanic}/>;
  if(p.id==='P22')return <WallLight {...mechanic} s={s} dispatch={dispatch}/>;
  if(p.id==='P27')return <TunnelLight {...mechanic} s={s}/>;
  if(p.id==='P04')return <Grille {...mechanic}/>;
  if(p.id==='P07')return <ClockBack {...mechanic}/>;
  if(p.id==='P17')return <CargoTrack {...mechanic}/>;
  if(p.id==='P25')return <SpringCatches {...mechanic}/>;
  if(p.id==='P28')return <div><Shutters {...mechanic} powered={s.installed.includes('lamp')} diffuse={s.installed.includes('tracingMap')}/><div className="work-controls">{s.installed.includes('lamp')?<button onClick={()=>dispatch({type:'remove',item:'lamp'})}>灯具を外す</button>:<button disabled={!s.inventory.includes('lamp')} onClick={()=>dispatch({type:'install',item:'lamp'})}>灯具を取り付ける</button>}</div><div className="work-controls">{s.installed.includes('tracingMap')?<button onClick={()=>dispatch({type:'remove',item:'tracingMap'})}>枠の紙を外す</button>:<><span>空の枠に入れる物</span>{s.inventory.map(item=><button key={item} onClick={()=>{if(item==='tracingMap')dispatch({type:'install',item});else message(item==='paper'||item==='ticket'?'この紙は小さく、光を通さない。':'枠に張れる、薄くて広い物が必要だ。')}}>{itemNames[item]}</button>)}</>}</div><p className="world-feedback">{!s.installed.includes('lamp')?'灯具の台は空いている。':!s.installed.includes('tracingMap')?'点の光が中央へ集中する。手前の広い枠は空いている。':signalsReady(s)?'両端の停車窓へ、光が通っている。':'羽根に遮られ、停車窓がまだ暗い。'}</p></div>;
  if(p.id==='P31')return <Traces s={s} set={set}/>;
  if(p.id==='P32')return <Boarding s={s} v={v} set={set}/>;
  if(p.id==='P19')return <PunchSelection v={v} set={set}/>;
  if(p.id==='P38')return <Arrival s={s} set={set}/>;
  if(p.id==='P11')return <div className="clock-comparison">{['ホームの時計へ足す分','駅務室の時計へ足す分'].map((label,i)=><section key={i}><h3>{label}</h3><ShapeDials values={[v[i]]} choices={p.choices??[]} onChange={n=>set(v.map((m,k)=>k===i?n[0]:m))}/></section>)}</div>;
  if(p.id==='P29')return <ScheduleChoices v={v} set={set}/>;
  if(p.id==='P37')return <Departure s={s} dispatch={dispatch} message={message}/>;
  if(p.kind==='route')return <RouteWorkspace s={s} dispatch={dispatch} message={message}/>;
  if(p.kind==='punch')return <PunchWorkspace s={s} dispatch={dispatch} message={message}/>;
  if(p.kind==='slide')return <SlidingCatch {...mechanic}/>;
  if(p.kind==='hook')return <HookPath {...mechanic}/>;
  if(p.kind==='balance')return <div><Balance {...mechanic} leftPresent={s.installed.includes('managementTag')}/><div className="weight-inventory">{s.installed.includes('managementTag')?<button onClick={()=>dispatch({type:'remove',item:'managementTag'})}>吊るした札を外す</button>:<><span>吊り口へ差す物</span>{s.inventory.map(item=><button key={item} onClick={()=>{if(item==='managementTag'){dispatch({type:'install',item});message('平らな札が吊り口に収まった。')}else message('形が合わず、吊り口へ差し込めない。')}}>{itemNames[item]}</button>)}</>}</div></div>;
  if(p.kind==='rings')return <div className="ticket-reader"><RotatingSlots {...mechanic} disabled={!!s.mountedTicket}/>{s.mountedTicket&&<div className="mounted-ticket"><p>通している券</p><PaperTicket ticket={s.mountedTicket} compact/><button onClick={()=>{dispatch({type:'remove',item:'ticket'});message('切符を抜いた。')}}>券を抜く</button></div>}</div>;
  if(p.kind==='timeline')return <div><div className="work-controls"><button disabled={!s.installed.includes('knob')&&!s.inventory.includes('knob')} onClick={()=>dispatch({type:s.installed.includes('knob')?'remove':'install',item:'knob'})}>{s.installed.includes('knob')?'つまみを外す':'つまみを付ける'}</button></div><Timeline offset={v[0]} setOffset={n=>set([n,...v.slice(1)])}/><EventLock values={v.slice(1)} set={n=>set([v[0],...n])}/></div>;
  if(p.kind==='order')return <div className={`order-workspace ${p.id==='P03'?'photographs':''}`}><p className="engraved-note">一枚を選び、入れ替える相手に触れる</p><div className="order-pieces">{v.map((n,i)=><button draggable onDragStart={()=>setSelected(i)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();swap(i)}} key={i} className={selected===i?'selected':''} onClick={()=>swap(i)} aria-label={`${i+1}枚目、${p.labels?.[n]??['給水槽と尾灯','遮断機が下','遮断機が上','塔と遠い貨車','塔と貨車の先頭'][n]}`}>
    {p.id==='P03'?<><div className={`window-study frame-${n}`}><img src={`./assets/documents/window/frame-${n}.webp`} alt={['給水槽の水面に赤い尾灯','下り切った遮断機','上がった遮断機','梯子が右の塔と遠ざかる貨車','梯子が左の塔と貨車先頭'][n]}/></div><small>{['水面に赤い光','閉じた踏切','開いた踏切','遠ざかる貨車','貨車の先頭'][n]}</small></>:p.id==='P10'?<UmbrellaReceipt index={n}/>:<span>{p.labels?.[n]??n+1}</span>}
   </button>)}</div></div>;
  if(p.kind==='tickets'||p.kind==='ticketTrial')return <TicketStudy trial={p.kind==='ticketTrial'} v={v} set={set} message={message}/>;
  if(p.kind==='notices')return <NoticeAssembly v={v} set={set}/>;
  if(p.kind==='segments')return <div><div className="ticket-reference-table">{s.notes.includes('ownTicket')&&<section><p>駅へ来た券</p><PaperTicket ticket={sampleTicket(600,[{column:0,row:0,shape:'water'},{column:1,row:0,shape:'tower'}])} compact/></section>}{s.inventory.includes('stub')&&<ItemEvidence item="stub"/>}</div><div className="segment-workspace">{['踏切','塔','給水槽','小屋','トンネル','白沢'].map((n,i)=><button key={i} className={v[i]?'selected':''} onClick={()=>set(v.map((m,j)=>i===j?1-m:m))}>{n}<span>{v[i]?'未使用':'―'}</span></button>)}</div></div>;
  if(p.id==='P35')return <Signals selected={v[0]} onSelect={n=>set([n])}/>;
  if(p.kind==='dial')return <NumericLock v={v} set={set}/>;
  return <ShapeDials values={v} choices={choicesFor(p)} onChange={set}/>;
 };
 return <section className={`inspection surface-${p.surface}`} aria-label={p.title}>
  <header className="inspection-header"><button onClick={onClose}>← 戻る</button><div><h2>{p.title}</h2><p className={notice?'inspection-status':''} role={notice?'status':undefined}>{notice||(!solved?(p.id==='P34'&&(!s.inventory.includes('paper')||!s.inventory.includes('punch'))?'券を加工できそうな作業台。':p.intro):'　')}</p></div><button onClick={onNotes}>記録を見る</button></header>
  <div className="inspection-body">{render()}</div>
  <footer className="inspection-footer"><button className="quiet" hidden={!evidenceNames[p.id]} onClick={()=>setEvidence(!evidence)}>{evidence?'資料を閉じる':`${evidenceNames[p.id]}を見る`}</button>{!['route','punch','shutters'].includes(p.kind)&&(!solved?<button className="main-action" onClick={check}>{observationIds.includes(p.id)?'今の配置を記録する':actionLabels[p.id]??'確かめる'}</button>:reward&&!s.taken.includes(p.id)?<button className="main-action" onClick={()=>{dispatch({type:'take',id:p.id});message(`${itemNames[reward]}を取った。`)}}>{itemNames[reward]}を取る</button>:<span className="result-caption">{reward?'回収済み。':resultCaptions[p.id]??'確かめた。'}</span>)}<button className="quiet" onClick={()=>{setShowHint(true);if(!(s.hints[p.id]>0))dispatch({type:'hint',id:p.id})}}>手掛かり</button></footer>
  {evidence&&<aside className="evidence-sheet"><button className="close-sheet" onClick={()=>setEvidence(false)}>閉じる ×</button><small>{evidenceNames[p.id]}</small><h3>{p.title}</h3><EvidenceContent p={p}/><button onClick={()=>{dispatch({type:'note',id:p.id});message('記録に残した。')}}>記録に残す</button></aside>}
  {showHint&&(s.hints[p.id]??0)>0&&<aside className="hint-strip"><span>{p.hints[Math.min(2,(s.hints[p.id]??1)-1)]}</span><button disabled={(s.hints[p.id]??0)>=3} onClick={()=>dispatch({type:'hint',id:p.id})}>{(s.hints[p.id]??0)>=3?'最後の手掛かり':'もう少し'}</button><button aria-label="手掛かりを閉じる" onClick={()=>setShowHint(false)}>×</button></aside>}
 </section>;
}







