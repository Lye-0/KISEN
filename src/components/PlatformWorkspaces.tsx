import type {GameState} from '../game/model';
import {gateTicketValid} from '../game/model';
import {PhotoStage} from './PhotoStage';
export function Boarding({s,v,set}:{s:GameState;v:number[];set:(v:number[])=>void}){
 if(s.trainAt!==2)return <PhotoStage src="/assets/scenes/closed/main.webp" alt="扉のない線路際。列車はまだ止まっていない。"/>;
 return <div className="boarding-study"><PhotoStage src={`/assets/closeups/train/steps-${gateTicketValid(s)?'open':'closed'}.webp`} alt="三つの扉の足元。手前には隙間、中央には踏板、奥には高い段差。"/><div className="work-controls">{['手前の足元','中央の踏板','奥の足元'].map((label,i)=><button key={i} className={v[0]===i?'selected':''} onClick={()=>set([i])}>{label}</button>)}</div></div>;
}
export function Traces({s,set}:{s:GameState;set:(v:number[])=>void}){
 return <div className="traces-photo"><svg viewBox="0 350 350 550" aria-label="車両の下に隠れていた線路際"><image href="/assets/scenes/platform/cleared.webp" width="1672" height="941"/>{!s.taken.includes('P31')&&<g role="button" tabIndex={0} aria-label="線路際の紙へ鉤を伸ばす" className="paper-reach" onClick={()=>set([1])} onKeyDown={e=>e.key==='Enter'&&set([1])}><rect x="113" y="628" width="105" height="100" fill="transparent"/><path d="M138 671l39-9 5 21-37 10Z" fill="#b2a481" stroke="#d1bea0"/></g>}{s.values.P31?.[0]===1&&<path d="M300 860L160 683q-14-12-5-16" stroke="#a6ab9f" strokeWidth="5" fill="none"/>}</svg><p className="engraved-note">線路際の白い角へ、鉤を伸ばせる。</p></div>;
}
export function PunchSelection({v,set}:{v:number[];set:(v:number[])=>void}){return <div className="blade-workspace">{[0,1,2].map(n=><button key={n} onClick={()=>set([n])} className={v[0]===n?'selected':''}><svg className="actual-punch" viewBox={`${884+n*54} 480 58 90`} aria-hidden="true"><image href="/assets/scenes/office/main.webp" width="1672" height="941"/></svg><svg viewBox="0 0 170 220" aria-label="三回分の試し切り"><rect x="10" y="10" width="150" height="200" rx="3" fill="#ddd1b2"/>{[0,1,2].map(i=><g key={i}><circle cx="85" cy={55+i*55} r="17" fill="#272d27"/>{n!==1&&<path d={`M${n?98:72} ${55+i*55}l${n?15:-15} -13v23Z`} fill="#272d27"/>}</g>)}</svg><span>{['左の鋏','中央の鋏','右の鋏'][n]}</span></button>)}</div>}
