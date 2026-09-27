const studyPatterns=[[0,3,6,9,12],[0,2,5,7,10],[1,4,7,10]];
const platformPatterns=[[1,4,6,9,11],[0,3,6,9,12],[2,4,8,10]];
export function Signals({selected,onSelect,platform=false}:{selected:number;onSelect:(n:number)=>void;platform?:boolean}){
 const patterns=platform?platformPatterns:studyPatterns;const reference=platform?platformPatterns[0]:studyPatterns[1];
 const strip=(a:number[])=> <svg viewBox="0 0 520 55" aria-label={`光の記録、${a.join('、')}の位置で点灯`}><path d="M15 40H505" stroke="#67745d"/>{a.map(n=><path key={n} d={`M${25+n*37} 40v-30h9v30`} fill="#c9c49b" stroke="#d8d0a4" strokeWidth="2"/>)}</svg>;
 return <div className="signal-comparison"><div className="reference-signal"><span>現場灯</span>{strip(reference)}</div><p className="engraved-note">同じ瞬間を写した、三つの合図。</p>{patterns.map((a,i)=><button key={i} className={selected===i?'selected':''} onClick={()=>onSelect(i)} aria-label={`${platform?['左の合図','中央の合図','右の合図'][i]:['記録A','記録B','記録C'][i]}を選ぶ`}><span>{platform?['左','中央','右'][i]:['A','B','C'][i]}</span>{strip(a)}</button>)}</div>;
}
