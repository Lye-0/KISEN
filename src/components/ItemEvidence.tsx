import { useState } from 'react';
import { StationPlan } from './Figures';
import type { Item } from '../game/model';
export function ItemEvidence({item}:{item:Item}){
 const [back,setBack]=useState(false);
 if(item==='tracingMap')return <><StationPlan flip={back}/><p>薄い紙は灯りを通す。印刷は裏まで透けている。</p><button onClick={()=>setBack(!back)}>裏返す</button></>;
 if(item==='routeTag')return <div className="route-tag artifact-paper"><small>路線札</small><strong>○</strong><p>給水　　ハ</p><p className="document-footnote">到着扱い</p></div>;
 if(item==='stub')return <div className="artifact-paper segment-stub"><small>区間の控え</small><h3>通用範囲</h3><p>給水槽・鉄塔・小屋<br/>隧道・白沢</p><hr/><p>既に通った印は引き継げる。<br/>新券に、同じ区間を重ねて刻まない。</p></div>;
 if(item==='managementTag')return <div className="management-tag-view"><button className="metal-tag" onClick={()=>setBack(!back)} aria-label="管理札を裏返す"><img src={`/assets/items/managementTag/${back?'back':'main'}.webp`} alt={back?'裏面に2の刻印':'表面に三日月と保管の刻印'}/></button><p>平らで重い金属。上に細長い差込穴。</p><button onClick={()=>setBack(!back)}>裏返す</button></div>;
 return null;
}
