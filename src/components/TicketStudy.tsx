import { useState } from 'react';
import { SHAPES } from '../game/model';
import type { Punch,Shape } from '../game/model';
import { Hole,PaperTicket,sampleTicket,shapeLabels } from './Figures';
import { ticketExamples,rowForJourney } from '../game/ticketRules';
const journeys=ticketExamples.map(j=>({...j,row:rowForJourney(j.direction),route:`${j.route}　／　きさらぎ駅${j.direction==='into'?'へ':'から'}`}));
export function TicketStudy({trial,v,set,message}:{trial:boolean;v:number[];set:(n:number[])=>void;message:(s:string)=>void}){
 const [localExample,setLocalExample]=useState(0);const example=trial?localExample:(v[2]??0);const setExample=(i:number)=>trial?setLocalExample(i):set([v[0],v[1],i]);const [blade,setBlade]=useState<Shape>('cross');
 const j=journeys[example];const sample=sampleTicket(800+example,j.stops.map((shape,column)=>({column,row:j.row,shape})),1);
 const trialHoles:Punch[]=v.flatMap((n,i)=>n>=0&&n<6?[{column:i%5,row:(i<5?0:1) as 0|1,shape:SHAPES[n]}]:[]);
 const lower=journeys[trial?2:v[0]??1];
 return <div className="ticket-rules"><section className="ticket-evidence"><div className="work-controls">{journeys.map((e,i)=><button key={i} aria-pressed={example===i} className={example===i?'selected':''} onClick={()=>setExample(i)}>{e.name}</button>)}</div><p className="journey-caption">{j.name}　{j.route}</p><PaperTicket ticket={sample} compact/></section>
  {!trial?<section className="ticket-overlay"><div className="work-controls"><span>重ねる券</span>{journeys.map((e,i)=><button key={i} aria-pressed={v[0]===i} className={v[0]===i?'selected':''} onClick={()=>set([i,v[1],example])}>{e.name}</button>)}</div><p className="journey-caption">{lower.route}</p><div className="overlapping-tickets"><PaperTicket ticket={sample} compact/><div style={{transform:`translateX(${v[1]*14.667}%)`}}><PaperTicket ticket={sampleTicket(820+(v[0]??1),lower.stops.map((shape,column)=>({column,row:lower.row,shape})))} compact/></div></div><div className="work-controls"><button onClick={()=>set([v[0],Math.max(-3,v[1]-1),example])}>重ねた券を左へ</button><button onClick={()=>set([v[0],Math.min(3,v[1]+1),example])}>重ねた券を右へ</button></div></section>:<section className="trial-paper"><p className="journey-caption">試し紙　きさらぎ駅から　給水槽 → 鉄塔</p><PaperTicket ticket={sampleTicket(899,trialHoles,1)} onPunch={(c,r)=>{const i=r*5+c;if(v[i]!==-1){message('ここには、もう穴がある。新しい試し紙に替えられる。');return}set(v.map((n,k)=>k===i?SHAPES.indexOf(blade):n))}}/><div className="study-blades">{SHAPES.map(shape=><button key={shape} aria-label={`${shapeLabels[shape]}の試し鋏`} className={blade===shape?'selected':''} onClick={()=>setBlade(shape)}><svg viewBox="-25 -25 50 50"><Hole shape={shape}/></svg></button>)}<button onClick={()=>set(Array(10).fill(-1))}>新しい試し紙</button></div></section>}
 </div>;
}
