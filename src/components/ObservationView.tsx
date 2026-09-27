import type { GameState,Punch } from '../game/model';
import { SHAPES } from '../game/model';
import { puzzleById } from '../game/content';
import { PaperTicket,sampleTicket,StationPlan } from './Figures';
import { WindowPhotos } from './WindowPhotos';
import { Timeline } from './CoreWorkspaces';
import { HiddenPlatform } from './HiddenPlatform';
import { EvidenceContent } from './EvidenceContent';
export function ObservationView({id,s}:{id:string;s:GameState}){
 const v=s.observations?.[id]??[];
 if(id==='junctionPlate')return <><h3>小屋の保守札</h3><p>ヘ → ニ</p></>;
 if(id==='towerPlate')return <><h3>路線ケースの内側</h3><p>△ 鉄塔　ニ</p></>;
 if(id==='P16'&&v.length===5)return <><h3>描き足した駅の構造</h3><HiddenPlatform v={v}/></>;
 if(id==='P12'&&v.length>=1)return <><h3>重ねた二本の記録</h3><Timeline offset={v[0]}/></>;
 if(id==='P03'&&v.length===5)return <><h3>記録した写真の並び</h3><WindowPhotos order={v}/></>;
 if(['P06','P16'].includes(id)&&v.length>=2)return <><h3>記録した平面</h3><StationPlan flip={!v[0]}/><p>観察した時の向きのまま。</p></>;
 if(id==='P24'&&v.length===10){const holes:Punch[]=v.flatMap((n,i)=>n>=0&&n<6?[{column:i%5,row:(i<5?0:1) as 0|1,shape:SHAPES[n]}]:[]);return <><h3>試し紙</h3><PaperTicket ticket={sampleTicket(950,holes)}/><p>給水槽から塔への印を試した紙。</p></>}
 if(id==='P11'&&v.length===2)return <><h3>時計の補正についての記録</h3><p>ホーム {v[0]-6>0?'+':''}{v[0]-6}<br/>駅務室 {v[1]-6>0?'+':''}{v[1]-6}</p><p>{puzzleById[id].clue}</p></>;
 if(id==='P33'&&v.length===6)return <><h3>未使用と思った区間</h3><p>{['踏切','塔','給水槽','小屋','隧道','帰駅'].filter((_,i)=>v[i]).join('・')||'まだ選んでいない。'}</p></>;
 return <><h3>{puzzleById[id]?.title}</h3>{puzzleById[id]&&<EvidenceContent p={puzzleById[id]}/>} {v.length>0&&<p className="observation-caption">記録時の配置：{v.map(n=>n+1).join(' ／ ')}</p>}</>;
}


