import {useId} from 'react';
const labels=['甲','乙','丙','丁'];
const numbers=['06','31','47','82'];
const holes=[[45,160],[75,130],[45,160],[90,180]];
function NoticePaper({number}:{number:number}){
 const n=number>=0&&number<4?number:0,id='notice-'+useId().replaceAll(':','');
 return <g><defs><mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="220"><path d="M10 8L166 4L174 209L3 214Z" fill="white"/>{holes[n].map((y,i)=><circle key={i} cx={n===2?157:18} cy={y} r="5" fill="black"/>)}</mask></defs><g mask={`url(#${id})`}><rect width="180" height="220" fill="#c7bc93"/><image href="/assets/parts/document/paper.png" x="-20" y="-25" width="220" height="270" preserveAspectRatio="none"/><text x="90" y="140" fill="#655440" fontSize="59" textAnchor="middle">{numbers[n]}</text></g></g>;
}
export function NoticeAssembly({v,set}:{v:number[];set?:(n:number[])=>void}){
 const left=v[0]??0,right=v[1]??1;
 return <div className="notice-workspace">{set&&<div className="notice-pieces">{labels.map((name,n)=><button key={n} aria-label={name} className={v.includes(n)?'selected':''} onClick={()=>n!==right&&set([right,n])}><svg viewBox="0 0 180 220" aria-hidden="true"><NoticePaper number={n}/></svg><span>{name}</span></button>)}</div>}<p className="engraved-note">{set?'紙を二枚選び、左から重ねる。　':''}左：{labels[left]}　右：{labels[right]}</p><svg className="joined-notices" viewBox="0 0 319 220" role="img" aria-label="重ねた掲示。重なった留め穴だけ、向こうが見える。"><NoticePaper number={left}/><g transform="translate(139 0)"><NoticePaper number={right}/></g></svg></div>;
}
export function UmbrellaReceipt({index}:{index:number}){
 const names=['赤','黒','青','透明'],times=['23:17','23:19','23:10','23:13'],places=['ホーム','ホーム','駅務室','駅務室'];
 return <div className="umbrella-receipt"><svg viewBox={`${[160,265,365,459][index]} 400 112 430`} aria-hidden="true"><image href="/assets/scenes/lost/main.webp" width="1672" height="941"/></svg><span>{names[index]}</span><time>{times[index]}</time><small>{places[index]}の時計</small></div>;
}
