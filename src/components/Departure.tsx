import type { WorkProps } from './CoreWorkspaces';
import { routeReady,signalsReady } from '../game/model';
import { ScenePreview } from './ScenePreview';
import { Signals } from './Signals';
export function Departure({s,dispatch,message}:WorkProps){
 const selected=s.values.P37?.[0]??0;const signal=s.values.P37?.[1]??-1;const actual=s.values.activeService?.[0]??0;
 const call=()=>{if(s.trainAt===0){message('到着した車両が、まだ線路を塞いでいる。');return}if(!routeReady(s)){message('遠くで車輪の音がしたが、このホームへは来ない。');return}dispatch({type:'callTrain',service:selected+1});message(selected===1&&signalsReady(s)?'灯りの間で、列車が止まった。':!signalsReady(s)?'停車位置の灯が暗い。列車は乗り口を通り過ぎた。':selected===0?'列車はこの乗り口に止まらず、通り過ぎた。':'列車は手前で止まったあと、乗り口を通り過ぎた。')};
 return <div className="departure-workspace"><ScenePreview s={s}/><div className="work-controls"><span>呼び出す便</span>{[0,1,2].map(n=><button key={n} className={n===selected?'selected':''} onClick={()=>dispatch({type:'values',id:'P37',value:[n,signal]})}>{n+1}</button>)}<button onClick={call}>この便を呼ぶ</button></div>{actual>0&&<div className="arrival-record"><span>{actual===2?'塔側から入ってきた。':'駅側から入ってきた。'}</span><span>{actual===2?'ベル → 停止':actual===1?'戻りは通過':'停止 → ベル'}</span></div>}{s.trainAt===2&&<Signals platform selected={signal} onSelect={n=>dispatch({type:'values',id:'P37',value:[selected,n]})}/>}</div>;
}
