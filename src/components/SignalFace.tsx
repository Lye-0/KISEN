import {useId} from 'react';
import {shutterLight} from '../game/mechanics';
import {PhotoStage} from './PhotoStage';
export function SignalFace({v,powered,diffuse}:{v:number[];powered:boolean;diffuse:boolean}){
 const id=useId().replaceAll(':','');
 return <PhotoStage src="./assets/closeups/signal/box.webp" alt="信号箱の前面。停車・回送・停車の三つの窓。" className="signal-face"><svg viewBox="0 0 1672 941" aria-hidden="true"><defs><filter id={`${id}-glow`}><feGaussianBlur stdDeviation="11"/></filter></defs>{[0,1,2].map(n=>{const x=[376,742,1116][n];const ranges=powered&&(diffuse||n===1)?shutterLight(v,[150,350,550][n]):[];return <g key={n}>{ranges.map(([a,b],i)=><g key={i}><rect x={x+(a+32)*234/64} y="302" width={(b-a)*234/64} height="197" fill="#efd9a1" opacity=".3" filter={`url(#${id}-glow)`}/><rect x={x+(a+32)*234/64} y="302" width={(b-a)*234/64} height="197" fill="#e3c581" opacity=".48" style={{mixBlendMode:'screen'}}/></g>)}<text x={x+117} y="667" fill="#bdb596" fontSize="28" letterSpacing="8" textAnchor="middle">{n===1?'回送':'停車'}</text></g>})}</svg></PhotoStage>;
}
