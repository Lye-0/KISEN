import {shutterLight} from '../game/mechanics';
import type { GameState } from '../game/model';
import { BalanceArtwork } from './BalanceArtwork';
import {beam,plaqueLit} from '../game/geometry';
export function SceneDynamics({s}:{s:GameState}){
 if(s.room==='lamp'){
 const v=s.values.P22??[0,0],mounted=s.installed.includes('bracket'),b=beam(v),lit=mounted&&plaqueLit(v);const end={x:1168-(b.end.x-100)*1.114,y:263+(b.end.y-210)*.717};
 return <svg className="scene-dynamics" viewBox="0 0 1672 941" aria-hidden="true"><g transform="translate(273 394) scale(.54) translate(-360 -120)"><BalanceArtwork v={s.values.P23??[4,4]} leftPresent={s.installed.includes('managementTag')} stand={false}/></g><image href="./assets/items/plate/main.webp" x="655" y="188" width="100" height="63" opacity={lit?1:.5}/>{lit&&<text x="704" y="226" fill="#d0c7a4" fontSize="18" textAnchor="middle">ヘ → ニ</text>}{mounted&&<><path d={`M1168 263L${end.x} ${end.y-26}L${end.x} ${end.y+26}Z`} fill="#dbcda0" opacity=".12"/><image href="./assets/items/bracket/main.webp" x="1180" y="388" width="71" height="41"/><defs><radialGradient id="sceneLampLens"><stop stopColor="#f7e6b5" stopOpacity=".6"/><stop offset="1" stopColor="#cfaf69" stopOpacity=".1"/></radialGradient></defs><ellipse cx="1168" cy="263" rx="17" ry="33" fill="url(#sceneLampLens)"/></>}</svg>;
 }
 if(s.room==='closed'){
  const powered=s.installed.includes('lamp');const v=s.values.P28??[0,0];
  return <svg className="scene-dynamics" viewBox="0 0 1672 941" aria-hidden="true"><defs><filter id="signalBloom"><feGaussianBlur stdDeviation="8"/></filter></defs>{s.installed.includes('tracingMap')&&<path d="M1018 284l96-6v10l-96 6Z" fill="#bdaf87" stroke="#696b4e"/>}{powered&&<><image href="./assets/items/lamp/main.webp" x="1017" y="286" width="65" height="79"/><circle cx="1050" cy="331" r="10" fill="#ead599" opacity=".7"/>{[0,1,2].map(n=>{const ranges=s.installed.includes('tracingMap')||n===1?shutterLight(v,[150,350,550][n]):[];return ranges.map(([a,b],i)=>{const left=1026+n*44+(a+32)*26/64,width=(b-a)*26/64;return <g key={n+'-'+i}><rect x={left} y="240" width={width} height="21" fill="#e7c885" opacity=".4" filter="url(#signalBloom)"/><rect x={left} y="240" width={width} height="20" fill="#decc91" opacity=".7"/></g>})})}</>}</svg>;
 }
 return null;
}
