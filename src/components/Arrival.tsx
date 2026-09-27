import type { GameState } from '../game/model';
import { PhotoStage } from './PhotoStage';
export function Arrival({s,set}:{s:GameState;set:(v:number[])=>void}){
 const station=s.values.P38?.[0]??0;const moment=s.values.P38?.[1]??0;
 const src=station===0?'/assets/ending/false-station.webp':station===1?'/assets/documents/home-photo.webp':`/assets/ending/home-${moment?'late':'early'}.webp`;
 const minute=moment?4:2;const a=minute*6*Math.PI/180;const h=(210+minute*.5)*Math.PI/180;
 return <div className="arrival-comparison"><section><h3>携帯に残っていた駅</h3><PhotoStage src="/assets/documents/home-photo.webp" alt="白沢駅。時計は黄色い自転車置場より手前。七時の写真。" className="arrival-photo"/></section><section><h3>いまの車窓　{moment?'次の記録':'最初の記録'}</h3><PhotoStage src={src} alt={station===0?'時計の柱が、自転車置場の屋根の後ろへ続く。':station===1?'出発前の写真と、時計も人影も同じ位置にある。':'時計は自転車置場より手前。白い自転車を出した人がいる。'} className="arrival-photo">{station===2&&<svg className="home-clock" viewBox="0 0 1448 1086" aria-label={`時計、7時${minute}分`}><g transform="translate(966 151)" stroke="#303b32" strokeLinecap="round"><path d={`M0 0L${Math.sin(a)*59} ${-Math.cos(a)*59}`} strokeWidth="4"/><path d={`M0 0L${Math.sin(h)*42} ${-Math.cos(h)*42}`} strokeWidth="6"/><circle r="5" fill="#303b32"/></g></svg>}</PhotoStage><div className="work-controls"><button onClick={()=>set([station,moment?0:1])}>{moment?'最初の記録を見返す':'しばらく眺める'}</button><button onClick={()=>set([(station+1)%3,0])}>この駅を見送る</button></div></section></div>;
}
