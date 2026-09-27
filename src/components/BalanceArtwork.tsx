import { useId } from 'react';
export function balanceAngle(v:number[],leftPresent=true){return Math.max(-15,Math.min(15,(3*v[1]-(leftPresent?2*v[0]:0))*3));}
export function BalanceArtwork({v,leftPresent=true,stand=true}:{v:number[];leftPresent?:boolean;stand?:boolean}){
 const id=useId().replaceAll(':','');const angle=balanceAngle(v,leftPresent),r=angle*Math.PI/180;
 const lx=360-v[0]*60*Math.cos(r),ly=120-v[0]*60*Math.sin(r),rx=360+v[1]*60*Math.cos(r),ry=120+v[1]*60*Math.sin(r);
 return <g><defs><linearGradient id={`${id}-metal`}><stop stopColor="#343b2e"/><stop offset=".3" stopColor="#a59d72"/><stop offset=".62" stopColor="#69694b"/><stop offset="1" stopColor="#2f382d"/></linearGradient><filter id={`${id}-shadow`}><feDropShadow dx="2" dy="4" stdDeviation="2" floodOpacity=".6"/></filter></defs>
  {stand&&<g stroke="#6f7967" strokeWidth="12" fill="none"><path d="M360 60V390"/><path d="M305 402H415" strokeWidth="23"/></g>}
  <g transform={`rotate(${angle} 360 120)`} stroke="#aaa380"><path d="M110 120H610" stroke="#7f8063" strokeWidth="13"/><path d="M110 116H610" stroke="#b4aa81" strokeWidth="2"/>{[1,2,3,4].flatMap(n=>[-1,1].map(sign=><path key={n*sign} d={`M${360+n*sign*60} 107v25`} stroke="#363e31" strokeWidth="3"/>))}</g>
  <g filter={`url(#${id}-shadow)`}><path d={`M${lx} ${ly}v75M${rx} ${ry}v75`} stroke="#aaa386" strokeWidth="4"/>
   {leftPresent?<image href="/assets/items/managementTag/main.webp" x={lx-40} y={ly+56} width="80" height="110"/>:<path d={`M${lx-15} ${ly+75}h30v9h-30Z`} fill="#8e967b"/>}
   <path d={`M${rx-37} ${ry+78}q37-13 74 0v100q-37 14-74 0Z`} fill={`url(#${id}-metal)`} stroke="#b2a27b" strokeWidth="2"/><text x={rx} y={ry+142} textAnchor="middle" fill="#1b2a20" fontSize="38" fontFamily="serif">3</text>
  </g><circle cx="360" cy="120" r="13" fill="#4c5643" stroke="#b3a37a" strokeWidth="3"/>
 </g>;
}
