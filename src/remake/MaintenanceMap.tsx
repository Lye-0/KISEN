import { useState } from 'react';
export function MaintenanceMap(){
 const [zoom,setZoom]=useState(false);
 return <section className="rm-maintenance-map"><div className="rm-map-sheet"><svg viewBox="0 0 1200 850" style={zoom?{width:'max(160%, 900px)',maxWidth:'none'}:undefined} role="img" aria-label="北を上に描かれた保守略図。坑口、塔と二本の柱、踏切の配置">
 <image href="/assets/remake/parts/photo-back.webp" width="1200" height="850" preserveAspectRatio="none"/>
 <g stroke="#52584a" fill="none" strokeWidth="2.4" fontFamily="serif">
 <text x="90" y="95" fill="#41483d" stroke="none" fontSize="30">沿線保守　見取図</text><path d="M1050 145V68m-12 24 12-25 12 25"/><text x="1040" y="52" fill="#41483d" stroke="none" fontSize="21">北</text>
 <path d="M70 125H1130M70 740H1130" strokeWidth="1"/>
 <g transform="translate(90 170)">
 <text x="0" y="0" fill="#41483d" stroke="none" fontSize="24">坑口</text>
 <path d="M230 70H330V305H230M230 90V145m0 70v70M210 155H330M210 203H330"/>
 <path d="M-5 155H212M-5 203H212" strokeWidth="3"/><path d="M10 148V210m20-62v62m20-62v62m20-62v62m20-62v62m20-62v62m20-62v62m20-62v62m20-62v62" strokeWidth="1"/>
 <rect x="140" y="75" width="70" height="50"/><path d="M140 75L175 62L210 75M210 235h-16v15h-16v15h-16"/>
 <text x="142" y="110" fill="#41483d" stroke="none" fontSize="17">小屋</text>
 </g>
 <g transform="translate(505 210)">
 <text x="0" y="-40" fill="#41483d" stroke="none" fontSize="24">塔</text>
 <rect x="75" y="80" width="54" height="54"/><path d="M75 80L129 134M129 80L75 134M65 103v32m-8-32v32m0-27h8m-8 8h8m-8 8h8m-8 8h8"/>
 <circle cx="-25" cy="170" r="11"/><circle cx="240" cy="170" r="11" fill="#55594d"/>
 <path d="M-35 165l20 10M-35 172l14 8" strokeWidth="5" stroke="#e9dfc3"/>
 <path d="M-25 157V142L10 138M240 157V140" strokeWidth="1"/>
 <text x="-60" y="127" fill="#41483d" stroke="none" fontSize="17">白い塗跡</text><text x="210" y="126" fill="#41483d" stroke="none" fontSize="17">木柱</text>
 <path d="M58 120H30V87" strokeWidth="1"/><text x="0" y="77" fill="#41483d" stroke="none" fontSize="17">梯子</text>
 <path d="M-50 285Q102 360 268 285" strokeDasharray="5 5" strokeWidth="1"/>
 </g>
 <g transform="translate(875 245)">
 <text x="0" y="-75" fill="#41483d" stroke="none" fontSize="24">踏切</text>
 <path d="M70-20V370M120-20V370M-35 100H265M-35 119H265"/>
 <path d="M-20 92v35m25-35v35m25-35v35m25-35v35m80-35v35m25-35v35m25-35v35m25-35v35m25-35v35" strokeWidth="1"/>
 <rect x="-12" y="149" width="62" height="78" fill="#75939944"/><path d="M-12 149l31-10 31 10M143 149V350m8-201v201m-8-180h8m-8 30h8m-8 30h8m-8 30h8m-8 30h8m-8 30h8"/>
 <text x="-18" y="250" fill="#41483d" stroke="none" fontSize="17">青い小屋</text><text x="161" y="220" fill="#41483d" stroke="none" fontSize="17" writingMode="tb">石垣</text>
 </g>
 <text x="90" y="785" fill="#66624e" stroke="none" fontSize="18">位置照合用　／　縮尺不同</text><text x="925" y="785" fill="#66624e" stroke="none" fontSize="18">保線係　控</text>
 </g></svg></div><button onClick={()=>setZoom(!zoom)}>{zoom?'全体を見る':'拡大する'}</button></section>;
}

