import type { State } from './model';
import { Photo, Patch, Touch } from './Photo';
export function Train({ s, inspect, inspectCase }: {
    s: State;
    inspect: () => void; inspectCase: () => void;
}) {
    const state = s.bag.mouth ? 'north-bag-open' : s.bag.clasp ? s.bag.strap > .8 ? 'north-unlatched' : 'north-clasp-only' : s.bag.strap > .8 ? 'north-strap-aside' : 'north';
    return <Photo src={'/assets/remake/train/' + state + '.webp'} label="きさらぎ駅に停まった車内">
 {s.bag.mouth && s.locations.photos !== 'bag' && <Patch src="/assets/remake/train/north-empty.webp" rect={[32.3, 60.5, 8.2, 4.4]}/>}
 {s.locations.receipt === 'inventory' && <Patch src="/assets/remake/train/north-empty.webp" rect={[37.5, 52.5, 4.5, 6.2]}/>}
 <Patch src={'/assets/remake/train/case-'+(s.values.caseOpen?.[0]===1?(s.locations.officeKey==='inventory'?'empty':'open'):'closed')+'.webp'} rect={[87,5,13,34]}/><Touch name="乗務員用書類箱" rect={[87,6,11,31]} act={inspectCase}/><Touch name="座席の鞄" rect={[25, 50, 22, 28]} act={inspect}/>
 </Photo>;
}


