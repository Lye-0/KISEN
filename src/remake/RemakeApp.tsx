import {useCallback,useEffect,useRef,useState} from 'react';
import {newState,reduce,restore,owns} from './model';
import type {Action,Item} from './model';
import {Bag} from './Bag';
import {Train} from './Train';
import './remake.css';
const saveKey='kisen-remake-v2';
function load(){try{return restore(JSON.parse(localStorage.getItem(saveKey)??'null'))??newState()}catch{return newState()}}
export default function RemakeApp(){
 const [s,setS]=useState(load),[focus,setFocus]=useState<'bag'|null>(null),[panel,setPanel]=useState<'settings'|'notes'|null>(null),[targets,setTargets]=useState(false),[message,setMessage]=useState('');
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),file=useRef<HTMLInputElement>(null);
 const dispatch=useCallback((a:Action)=>{setMessage('');if(timer.current)clearTimeout(timer.current);setS(s=>reduce(s,a))},[]);
 const say=useCallback((m:string)=>{setMessage(m);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setMessage(''),4000)},[]);
 useEffect(()=>{try{localStorage.setItem(saveKey,JSON.stringify(s))}catch{say('保存できません。設定から記録を書き出せます。')}},[s,say]);
 useEffect(()=>{const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){if(panel)setPanel(null);else setFocus(null)}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape)},[panel]);
 const exportSave=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(s)],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download='KISEN-remake.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
 const inv=(Object.keys(s.locations) as Item[]).filter(i=>owns(s,i));
 return <main id="rm-game" className={targets?'rm-targets':''}>
 <div className={`rm-stage ${focus ? 'rm-close' : ''}`}>{focus==='bag'?<Bag s={s} dispatch={dispatch} say={say}/>:<Train s={s} inspect={()=>setFocus('bag')}/>}</div>
 <div className="rm-top">{focus?<button onClick={()=>{setFocus(null);setMessage('')}} aria-label="車内へ戻る">〈 戻る</button>:<span className="rm-wordmark">帰線</span>}<div><button onClick={()=>setPanel('notes')}>記録</button><button onClick={()=>setPanel('settings')} aria-label="設定と保存">⋯</button></div></div>
 <div className="rm-bottom"><div className="rm-inventory" aria-label="持ち物">{inv.map(item=><button key={item} onClick={()=>say(item==='receipt'?'持ち手から取った受取票。':item==='photos'?'鞄から取り出した写真の束。':item)}>{item==='photos'?'写真':item==='receipt'?'受取票':item}</button>)}</div><button className="rm-target-toggle" aria-pressed={targets} onClick={()=>setTargets(!targets)}>調べる場所</button></div>
 {message&&<div className="rm-feedback" role="status">{message}</div>}
 {panel&&<div className="rm-scrim" onClick={e=>{if(e.target===e.currentTarget)setPanel(null)}}><section className="rm-panel" role="dialog" aria-modal="true" aria-label={panel==='settings'?'設定':'記録'}><header><h2>{panel==='settings'?'設定':'記録'}</h2><button onClick={()=>setPanel(null)} aria-label="閉じる">×</button></header>{panel==='settings'?<><label><input type="checkbox" checked={targets} onChange={e=>setTargets(e.target.checked)}/>調べる場所を示す</label><button onClick={exportSave}>記録を書き出す</button><button onClick={()=>file.current?.click()}>記録を読み込む</button><input ref={file} hidden type="file" accept="application/json" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>1048576)throw Error();const next=restore(JSON.parse(await f.text()));if(!next)throw Error();setS(next);setPanel(null);setFocus(null)}catch{say('この記録は読み込めません。')}e.target.value=''}}/><button onClick={()=>{setS(newState());setFocus(null);setPanel(null)}}>試作を初期状態へ戻す</button></>:<p>観察したものが、ここに残ります。</p>}</section></div>}
 <span className="rm-dev-label">代表場面の検証 / Q01</span>
 </main>;
}

