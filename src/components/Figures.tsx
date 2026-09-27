import { useId } from 'react';
import type { Punch, Shape, Ticket } from '../game/model';
import { ticketOutline } from '../game/ticketRules';
export const symbols:Record<Shape,string>={cross:'╳',tower:'△',water:'○',shed:'⌂',tunnel:'∩',home:'◇'};
export const shapeLabels:Record<Shape,string>={cross:'十字',tower:'三角',water:'丸',shed:'五角',tunnel:'アーチ',home:'ひし形'};
export const shapePath:Record<Shape,string>={cross:'M-9-3H-3V-9H3V-3H9V3H3V9H-3V3H-9Z',tower:'M0-11L10 8H-10Z',water:'M-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0',shed:'M-10 0L0-10L10 0V10H-10Z',tunnel:'M-10 10V-1A10 10 0 0 1 10-1V10H5V0A5 5 0 0 0-5 0V10Z',home:'M0-12L11 0L0 12L-11 0Z'};
export function Hole({shape,x=0,y=0,fill='currentColor'}:{shape:Shape;x?:number;y?:number;fill?:string}){return <path d={shapePath[shape]} transform={`translate(${x} ${y})`} fill={fill}/>}
export function PaperTicket({ticket,onPunch,compact=false}:{ticket:Ticket;onPunch?:(column:number,row:0|1)=>void;compact?:boolean}){
 const instance=useId();const id=`paper-${instance.replaceAll(':','')}-${compact?'small':'large'}`;
 return <svg className="paper-ticket" viewBox="0 0 600 270" role={onPunch?'group':'img'} aria-label={`切符 ${ticket.id}、${ticket.holes.length}個の孔、${ticket.service||'未選択'}便`}>
   <defs><filter id={`${id}-shadow`}><feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity=".4"/></filter><mask id={id}><path fill="white" d={ticketOutline}/>{ticket.holes.map((h,i)=><Hole key={i} shape={h.shape} x={115+h.column*88} y={h.row===0?72:202} fill="black"/>)}</mask></defs>
   <g transform={ticket.back?'translate(600 0) scale(-1 1)':undefined}>
     <g filter={`url(#${id}-shadow)`}><g mask={`url(#${id})`}><image href="/assets/parts/ticket/paper.png" x="10" y="2" width="580" height="268" preserveAspectRatio="none"/><g opacity={ticket.back?.23:1}><path d="M45 95H558M45 177H558" stroke="#6a5643" strokeWidth="1"/>
       {Array.from({length:5},(_,c)=><g key={c}><path d={`M${115+c*88} 39V229`} stroke="#958565" strokeWidth=".7" strokeDasharray="2 6"/><text x={115+c*88} y="45" fontSize="12" fill="#716650" textAnchor="middle">{c+1}</text></g>)}
       <text x="295" y="133" textAnchor="middle" fontSize="23" fill="#524630" letterSpacing="8">通 行 券</text><text x="295" y="157" textAnchor="middle" fontSize="13" fill="#756750">帰線　　{ticket.service?`第 ${ticket.service} 便`:'＿＿便'}　　片道</text>
       <path d="M44 23H566V247H44" fill="none" stroke="#8f7b56" strokeWidth="1"/>
     </g></g></g>
     {onPunch&&Array.from({length:5},(_,c)=>([0,1] as const).map(r=><g key={`${c}-${r}`} className="punch-position" tabIndex={0} role="button" aria-label={`${c+1}列 ${r===0?'上段':'下段'}に穴を開ける`} onClick={()=>onPunch(c,r)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onPunch(c,r)}}}><rect x={73+c*88} y={r===0?28:158} width="84" height="88" rx="4" fill="transparent"/><path d={`M${105+c*88} ${r===0?72:202}h20m-10-10v20`} stroke="#776440" strokeWidth="1" opacity=".35"/></g>))}
   </g>
 </svg>;
}
export function sampleTicket(id:number,holes:Punch[],service=1):Ticket{return {id,holes,service,back:false}}
export function StationPlan({flip=false,extension=0,onSelect}:{flip?:boolean;extension?:number;onSelect?:(n:number)=>void}){
 return <svg className="station-plan" viewBox="0 0 720 420" role="img" aria-label="駅平面図。西の改札、東の欠けた窓、三つの区画。">
  <rect width="720" height="420" fill="#d2c6a7"/><g opacity=".08">{Array.from({length:22},(_,i)=><path key={i} d={`M0 ${i*20}H720`} stroke="#4a514c"/>)}</g>
  <g transform={flip?'translate(720 0) scale(-1 1)':undefined} fill="none" stroke="#52615a" strokeWidth="3">
   <path d="M90 300V180H600V300Z M260 180V300 M430 180V300 M60 120H660 M60 94H660"/>
   <path d="M143 300h55m115 0h55m115 0h55" stroke="#9b4c3d" strokeWidth="7"/>
   <path d="M524 294l-7 9 9 3" stroke="#43433a"/>
   <path d="M100 260h-45v-45h45"/>
   {extension>0&&<path className="plan-addition" d={`M${[0,90,260,430][extension]??430} 180V139H${[0,260,430,600][extension]??600}V180`} stroke="#a05d3e" strokeWidth="4" strokeDasharray="8 5"/>}
  </g>
  <text x="360" y="365" textAnchor="middle" fill="#536057" fontSize="18" transform={flip?'translate(720 0) scale(-1 1)':undefined}>構内図　薄紙写し</text>
  {onSelect&&[1,2,3].map(n=><g role="button" tabIndex={0} aria-label={`${n}番目の区画を北へ延ばす`} className="plan-choice" key={n} onClick={()=>onSelect(n)} onKeyDown={e=>e.key==='Enter'&&onSelect(n)}><rect x={flip?720-(90+n*170):90+(n-1)*170} y="133" width="170" height="48" fill="transparent"/><text x={flip?720-(175+(n-1)*170):175+(n-1)*170} y="165" fill="#6b6c52" fontSize="20" textAnchor="middle">＋</text></g>)}
 </svg>;
}
