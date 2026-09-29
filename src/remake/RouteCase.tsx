import { useState } from 'react';
import { Photo, Touch } from './Photo';
import type { State, Action } from './model';
import { arrivalCaseSides } from './arrivalPhotos';
const directions=['北','東','南','西'];
export function RouteCase({s,dispatch,say}:{s:State;dispatch:(a:Action)=>void;say:(m:string)=>void}) {
 const [close,setClose]=useState(false);
 const wheels=s.values.caseWheels??[0,0,0,0],open=s.values.caseOpen?.[0]===1;
 const src='/assets/remake/case/'+(open?(s.locations.officeKey==='inventory'?'empty':'open'):'closed')+'.webp';
 function turn(index:number,d=1){dispatch({type:'values',id:'caseWheels',values:wheels.map((v,i)=>i===index?(v+d+4)%4:v)});}
 function release(){if(!open&&!wheels.every((v,i)=>v===arrivalCaseSides[i])){say('留めが残っている。');return;}dispatch({type:'caseDoor'});setClose(false);}
 const engraving=(macro=false)=><g fill="#3b3326" fontFamily="serif" textAnchor="middle">{wheels.map((v,i)=><text key={i} x={macro?300+i*169:605+i*29} y={macro?550:410} fontSize={macro?80:18}>{directions[v]}</text>)}<text x={macro?543:647} y={macro?1370:558} fontSize={macro?48:13} fill="#c1b79d">撮影した側</text></g>;
 return <section className="rm-route-case">{close&&!open?<div className="rm-case-mechanism"><svg viewBox="0 0 1086 1448" aria-label="書類箱の四つの輪">
 <image href="/assets/remake/case/mechanism.webp" width="1086" height="1448"/>{engraving(true)}
 {wheels.map((v,i)=><g key={i} role="button" tabIndex={0} aria-label={`${i+1}番目の輪：${directions[v]}`} className="rm-mechanism-control" onClick={()=>turn(i)} onKeyDown={e=>{if(['Enter',' ','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();turn(i,e.key==='ArrowDown'?-1:1);}}}><rect x={219+i*169} y="350" width="163" height="320" fill="transparent"/></g>)}
 <g role="button" tabIndex={0} aria-label="留めを回す" className="rm-mechanism-control" onClick={release} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();release();}}}><rect x="220" y="730" width="280" height="525" fill="transparent"/></g>
 </svg><button onClick={()=>setClose(false)}>箱の全体へ</button></div>:<Photo src={src} label={open?'開いた乗務員用書類箱':'乗務員用書類箱'}>
 {!open&&<svg className="rm-surface-ink" viewBox="0 0 1672 941">{engraving()}</svg>}
 {!open?<Touch name="書類箱の輪と留め" rect={[33,35,12,23]} act={()=>setClose(true)}/>:<><Touch name="書類箱を閉める" rect={[73,20,18,64]} act={release}/>{s.locations.officeKey!=='inventory'&&<Touch name="駅務室の鍵" rect={[47,27,10,27]} act={()=>{dispatch({type:'take',item:'officeKey'});say('駅務室の鍵を取った。');}}/>}</>}
 </Photo>}</section>;
}

