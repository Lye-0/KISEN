import type { GameState } from '../game/model';
import { BalanceArtwork } from './BalanceArtwork';
export function SceneDynamics({s}:{s:GameState}){
 if(s.room==='lamp')return <svg className="scene-dynamics" viewBox="0 0 1672 941" aria-hidden="true"><g transform="translate(273 394) scale(.54) translate(-360 -120)"><BalanceArtwork v={s.values.P23??[4,4]} leftPresent={s.installed.includes('managementTag')} stand={false}/></g></svg>;
 if(s.room==='closed'){
  const powered=s.installed.includes('lamp');const v=s.values.P28??[0,0];
  return <svg className="scene-dynamics" viewBox="0 0 1672 941" aria-hidden="true"><defs><filter id="signalBloom"><feGaussianBlur stdDeviation="8"/></filter></defs>{powered&&<><rect x="1015" y="295" width="50" height="32" rx="5" fill="#353e30" stroke="#979978" strokeWidth="2"/><circle cx="1040" cy="308" r="12" fill="#ead599"/>{[0,1,2].map(n=>{const x=[150,350,550][n];const on=(s.installed.includes('tracingMap')||n===1)&&[-10+v[0]*80,390+v[0]*80].some(a=>Math.abs(x-a)<35)&&[70+v[1]*80,470+v[1]*80].some(a=>Math.abs(x-a)<35);return on&&<g key={n}><path d={`M${1024+n*44} 238l30-2v25l-30 2Z`} fill="#e7c885" opacity=".55" filter="url(#signalBloom)"/><path d={`M${1026+n*44} 241l26-2v19l-26 2Z`} fill="#decc91" opacity=".7"/></g>})}</>}</svg>;
 }
 return null;
}
