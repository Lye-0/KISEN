import { useCallback,useEffect,useRef,useState } from 'react';
import type { Action,GameState,Item,Room } from './game/model';
import { canEnter,initialState,itemNames,open,owns,reduce,routeReady,validateSave } from './game/model';
import { areas,puzzleById } from './game/content';
import { PuzzleView } from './components/PuzzleView';
import { PaperTicket,sampleTicket } from './components/Figures';
const SAVE_KEY='kisen-save-v1';
function load(){
 if(import.meta.env.DEV&&new URLSearchParams(location.search).has('inspect')){const s=initialState();s.started=true;s.inventory=['plate','handle','punch','paper'];return s}
 try{return validateSave(JSON.parse(localStorage.getItem(SAVE_KEY)??'null'))??initialState()}catch{return initialState()}}
const itemGlyph:Record<Item,string>={smallKey:'⚿',photos:'▧',knob:'◉',officeKey:'⚿',hook:'ʃ',routeTag:'▱',bridgePin:'⊣',bracket:'⌑',plate:'▰',punch:'⋈',lamp:'◉',handle:'┓',paper:'▱',stub:'▧',ticket:'▱'};
export default function App(){
 const [s,setState]=useState<GameState>(load);const [inspection,setInspection]=useState<string|null>(import.meta.env.DEV?new URLSearchParams(location.search).get('inspect'):null);const [panel,setPanel]=useState<'notes'|'settings'|'map'|'item'|null>(null);const [activeItem,setActiveItem]=useState<Item|null>(null);const [notice,setNotice]=useState('');const [showTargets,setShowTargets]=useState(false);const [saveError,setSaveError]=useState(false);const [confirmReset,setConfirmReset]=useState(false);const [selectedNote,setSelectedNote]=useState('homePhoto');const [loaded,setLoaded]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const input=useRef<HTMLInputElement>(null);const previousFocus=useRef<HTMLElement|null>(null);
 const dispatch=useCallback((a:Action)=>setState(old=>reduce(old,a)),[]);
 const message=useCallback((m:string)=>{setNotice(m);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setNotice(''),5500)},[]);
 useEffect(()=>{if(import.meta.env.DEV&&new URLSearchParams(location.search).has('inspect'))return;try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));setSaveError(false)}catch{setSaveError(true)}},[s]);
 useEffect(()=>{if(!s.started||s.ending)return;const t=setInterval(()=>dispatch({type:'tick',seconds:30}),30000);return()=>clearInterval(t)},[s.started,s.ending,dispatch]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(panel)setPanel(null);else setInspection(null)}};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener)},[panel]);
 useEffect(()=>{if(panel||inspection){previousFocus.current=document.activeElement as HTMLElement;requestAnimationFrame(()=>document.querySelector<HTMLElement>(panel?'.overlay-panel button':'.inspection-header button')?.focus())}else previousFocus.current?.focus()},[panel,inspection]);
 const scene=s.room==='train'?'/assets/scenes/train/arrival.webp':`/assets/scenes/${s.room}/main.webp`;
 useEffect(()=>{let active=true;const photo=new Image();photo.src=scene;photo.decode().then(()=>{if(active)setLoaded(scene)}).catch(()=>{if(active)setLoaded('error')});return()=>{active=false}},[scene]);
 const inspect=(id:string)=>{
  if(id==='ownTicket'){dispatch({type:'note',id});setSelectedNote(id);setPanel('notes');return}
  if(id==='window'){if(owns(s,'photos'))setInspection('P03');else message('雨の向こうに、見知らぬ駅名。座席の鞄から、写真の角が見える。');return}
  if(id==='loop'){message('道を抜けたはずなのに、同じ駅と、同じ傘の前へ戻った。');dispatch({type:'note',id:'loop'});return}
  if(id==='wallPhoto'){dispatch({type:'note',id});setSelectedNote(id);setPanel('notes');return}
  if(id==='P06'&&!open(s,'P04')){message('案内図の裏へは、窓口の格子が邪魔をして届かない。');setInspection('P04');return}
  if(id==='P03'&&!owns(s,'photos')){message('写真はまだ鞄の中だ。');return}
  if(id==='P31'&&!routeReady(s)){message('車体が線路際を隠している。');return}
  setInspection(id);
 };
 const move=(room:Room)=>{const reason=canEnter(s,room);if(reason){message(reason);if(room==='store')setInspection('P17');else if(room==='bridge')setInspection('P15');else if(room==='return')setInspection('P37');return}setInspection(null);dispatch({type:'move',room});};
 const exportSave=()=>{const blob=new Blob([JSON.stringify(s,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='KISEN-帰線-記録.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('記録を書き出した。')};
 const reset=()=>{setState(initialState());setInspection(null);setPanel(null);setConfirmReset(false)};
 if(!s.started)return <main className="title-screen"><img className="title-photo" src="/assets/scenes/train/arrival.webp" alt="雨に濡れたきさらぎ駅。停まった列車の扉が開いている。"/><div className="title-shade"/><div className="title-content"><p className="title-kicker">きさらぎ駅</p><h1>帰線</h1><p className="title-reading">K I S E N</p><p className="title-copy">帰るための線を、見つける。</p><button className="start-button" onClick={()=>dispatch({type:'start'})}>扉の向こうへ <span>→</span></button><p className="title-meta">ひとりで遊ぶ脱出ゲーム<br/>進行は、このブラウザに自動保存されます。</p></div><span className="title-corner">NO. 05　／　帰線</span></main>;
 if(s.ending)return <main className="ending-screen"><img src="/assets/ending/home.webp" alt="朝の駅。帰ってきたホームに光が差す。"/><div className="ending-copy"><p>扉の外に、朝があった。</p><h1>帰線</h1><p className="ending-after">切符の裏に、覚えのない印がひとつ。</p><button onClick={()=>{setState(old=>({...old,ending:false,room:'return'}));setInspection('P38')}}>最後の車内へ戻る</button><button onClick={exportSave}>記録を残す</button></div></main>;
 const area=areas[s.room];
 return <main className="game-root">
  {!inspection?<div className="world-shell"><header className="world-header"><div><p className="small-brand">帰線</p><h1>{area.name}</h1></div><p className="area-subtitle">{area.subtitle}</p><div className="header-tools"><button aria-label="駅の地図" onClick={()=>setPanel('map')}>地図</button><button aria-label="設定と保存" onClick={()=>setPanel('settings')}>設定</button></div></header>
   <div className="scene-container"><div className={`scene-frame ${showTargets?'show-targets':''}`}>
    {loaded===scene?<><img className="scene-photo" src={scene} alt={`${area.name}の全景`}/>{s.room==='train'&&<>{open(s,'P02')&&<img className="scene-photo state-patch bag-open" src="/assets/scenes/train/explored.webp" alt="ふたの開いた鞄"/>}{s.notes.includes('ownTicket')&&<img className="scene-photo state-patch floor-clear" src="/assets/scenes/train/explored.webp" alt="切符を拾った床"/>}</>}
     {area.hotspots.map(h=><button key={h.id} className="hotspot" style={{left:`${h.x}%`,top:`${h.y}%`,width:`${h.w}%`,height:`${h.h}%`}} aria-label={h.label} onClick={()=>inspect(h.id)}><span className="hotspot-label">{h.label}</span><i/></button>)}
    </>:<div className="scene-loading">{loaded==='error'?'この場面の画像は、まだ制作中です。':'目が、暗さに慣れる。'}</div>}
    <div className="scene-links">{area.links.map((r,i)=><button key={r} className={area.links.length===1?'go-forward':i===0?'go-left':i===area.links.length-1?'go-right':'go-forward'} onClick={()=>move(r)}><span>{area.links.length===1?'↑':i===0?'‹':i===area.links.length-1?'›':'↑'}</span><small>{areas[r].name}</small></button>)}</div>
   </div></div>
   <footer className="inventory-bar"><button className="notes-button" onClick={()=>setPanel('notes')}><span>▤</span>記録</button><div className="inventory-items" aria-label="持ち物">{s.inventory.length?s.inventory.map(item=><button key={item} onClick={()=>{setActiveItem(item);setPanel('item')}}><span className="item-glyph">{itemGlyph[item]}</span><small>{itemNames[item]}</small></button>):<p className="empty-inventory">持ち物は、まだない。</p>}</div><button className={`targets-button ${showTargets?'selected':''}`} onClick={()=>setShowTargets(!showTargets)} aria-pressed={showTargets}>調べる場所</button></footer>
  </div>:<PuzzleView key={inspection} p={puzzleById[inspection]} s={s} dispatch={dispatch} message={message} onClose={()=>setInspection(null)} onNotes={()=>setPanel('notes')}/>}
  {notice&&<div className="toast" role="status">{notice}</div>}{saveError&&<div className="save-warning">自動保存ができません。「設定」から記録を書き出してください。</div>}
  {panel&&<div className="overlay-scrim" onClick={e=>{if(e.target===e.currentTarget)setPanel(null)}}><section className={`overlay-panel panel-${panel}`} role="dialog" aria-modal="true" aria-label={panel==='notes'?'観察の記録':panel==='map'?'駅の地図':panel==='item'?'持ち物':'設定'}><header><h2>{panel==='notes'?'観察の記録':panel==='map'?'駅の地図':panel==='item'&&activeItem?itemNames[activeItem]:'設定'}</h2><button onClick={()=>setPanel(null)}>閉じる ×</button></header>
   {panel==='notes'&&<div className="notebook"><nav>{s.notes.map(id=><button key={id} className={selectedNote===id?'selected':''} onClick={()=>setSelectedNote(id)}>{puzzleById[id]?.title??{homePhoto:'帰る駅の写真',ownTicket:'自分の切符',loop:'駅前の道',wallPhoto:'駅舎の外壁'}[id]??id}</button>)}</nav><article>{selectedNote==='homePhoto'?<><img src="/assets/documents/home-photo.webp" alt="出発前に撮った駅。時計の後ろに黄色い自転車置場。"/><p>帰るはずだった駅。<br/>朝七時に待ち合わせている。</p></>:selectedNote==='ownTicket'?<><PaperTicket ticket={sampleTicket(600,[{column:0,row:0,shape:'water'},{column:1,row:0,shape:'tower'}])}/><p>切欠きのある、使いかけの券。</p></>:selectedNote==='loop'?<p>歩いても、同じ傘の前へ戻った。<br/>置いた足跡も残っている。</p>:selectedNote==='wallPhoto'?<><img src="/assets/documents/wall.webp" alt="駅舎の外壁。四つの窓、東端の枠に欠け。"/><p>外壁の窓は四つ。東端の枠が欠けている。</p></>:<><h3>{puzzleById[selectedNote]?.title}</h3><p>{puzzleById[selectedNote]?.clue}</p></>}</article></div>}
   {panel==='map'&&<div className="map-panel"><p>歩いた場所の記録</p><div className="map-rooms">{s.visited.map(r=><button key={r} className={s.room===r?'selected':''} onClick={()=>{move(r);setPanel(null)}}>{areas[r].name}<small>{s.room===r?'現在地':'移動する'}</small></button>)}</div><p className="subtle">一度歩いた場所へ戻れます。</p></div>}
   {panel==='item'&&activeItem&&<div className="item-inspect">{activeItem==='ticket'?<PaperTicket ticket={s.ticket}/>:<div className="item-large">{itemGlyph[activeItem]}</div>}<p>{itemNames[activeItem]}</p>{activeItem==='photos'&&<button onClick={()=>{setPanel(null);setInspection('P03')}}>写真を並べる</button>}{activeItem==='ticket'&&<button onClick={()=>dispatch({type:'flipTicket'})}>裏返す</button>}<p className="subtle">使える場所で、取り付けたり動かしたりできます。</p></div>}
   {panel==='settings'&&<div className="settings-panel"><label><input type="checkbox" checked={showTargets} onChange={e=>setShowTargets(e.target.checked)}/> 調べられる物の範囲を表示</label><p>操作：物を押すと近づきます。戻るには左上の「戻る」、またはEsc。入れ替えは一枚を選び、相手に触れます。</p><p>音を聞かなくても、すべての情報を画面から確認できます。</p><button onClick={exportSave}>記録を書き出す</button><button onClick={()=>input.current?.click()}>記録を読み込む</button><input ref={input} hidden type="file" accept="application/json,.json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1048576)throw Error();const value=validateSave(JSON.parse(await f.text()));if(!value)throw Error();setState(value);setPanel(null);setInspection(null);message('記録を読み込んだ。')}catch{message('この記録は読み込めません。今の進行はそのままです。')}e.target.value=''}}/><hr/>{confirmReset?<div><p>このブラウザの進行を消して、最初から始めます。</p><button onClick={reset}>最初から始める</button><button onClick={()=>setConfirmReset(false)}>取り消す</button></div>:<button className="quiet" onClick={()=>setConfirmReset(true)}>最初から</button>}</div>}
  </section></div>}
 </main>;
}

