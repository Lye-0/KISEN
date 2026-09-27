import type {GameState,Action} from '../game/model';
import {rewards,itemNames} from '../game/model';
import {itemArt} from '../game/itemArt';
import {PaperTicket,sampleTicket} from './Figures';
import {PlateEvidence} from './PlateEvidence';
import {ItemEvidence} from './ItemEvidence';
import {ScenePreview} from './ScenePreview';
export function RewardView({id,s,dispatch,message}:{id:string;s:GameState;dispatch:(a:Action)=>void;message:(m:string)=>void}){
 const item=rewards[id];if(!item)return null;const taken=s.taken.includes(id);
 return <div className="reward-view"><ScenePreview s={s}/>{!taken?<button className="reward-object" onClick={()=>{dispatch({type:'take',id});message(`${itemNames[item]}を取った。`)}} aria-label={`${itemNames[item]}を取り出す`}>{item==='plate'?<PlateEvidence turn={s.route.plateTurn}/>:itemArt[item]?<img src={itemArt[item]} alt={itemNames[item]}/>:item==='paper'?<PaperTicket ticket={sampleTicket(990,[],0)}/>:<ItemEvidence item={item}/>}<span>{itemNames[item]}を取る</span></button>:<p className="world-feedback">ここにあった物は回収した。</p>}</div>;
}
