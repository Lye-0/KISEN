import { useEffect } from 'react';
import type { State, Action } from './model';
import { Photo, Patch, Touch, decode } from './Photo';
const root = '/assets/remake/bag/';
export function bagPhoto(s: State) { return root + (s.bag.mouth ? 'open' : s.bag.clasp ? s.bag.strap > .8 ? 'unlatched' : 'clasp-only' : s.bag.strap > .8 ? 'strap-aside' : 'closed') + '.webp'; }
export function Bag({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    useEffect(() => {
        for (const n of ['closed', 'strap-aside', 'clasp-only', 'unlatched', 'open', 'empty'])
            void decode(root + n + '.webp').catch(() => { });
    }, []);
    const mouth = () => {
        if (!s.bag.mouth && !s.bag.clasp) {
            say('留めが、口を押さえている。');
            return;
        }
        if (!s.bag.mouth && s.bag.strap < .8) {
            say('帯が張って、口が開かない。');
            return;
        }
        dispatch({ type: 'bagMouth' });
    };
    const strap = () => dispatch({ type: 'bagStrap', position: s.bag.strap > .8 ? 0 : 1 });
    return <Photo src={bagPhoto(s)} label="座席に置かれた革の鞄">
  {s.bag.mouth && s.locations.photos !== 'bag' && <Patch src={root + 'empty.webp'} rect={[36, 38, 26, 14]}/>}
  {s.locations.receipt === 'inventory' && <Patch src={root + 'empty.webp'} rect={[54.3, 15.5, 9.4, 16.5]}/>}
  {!s.bag.mouth && <><Touch name="肩の帯" rect={s.bag.strap > .8 ? [72, 49, 7, 38] : [47, 28, 8, 59]} act={strap} drag={dx => dispatch({ type: 'bagStrap', position: dx > 0 ? 1 : 0 })}/><Touch name="真鍮の留め" rect={s.bag.clasp ? [40, 24, 9, 14] : [40, 39, 8, 14]} act={() => dispatch({ type: 'bagClasp' })}/></>}
  <Touch name="鞄の口" rect={s.bag.mouth ? [23, 41, 16, 10] : [26, 25, 13, 10]} act={mouth} drag={mouth}/>
  {s.bag.mouth && s.locations.photos === 'bag' && <Touch name="中の写真" rect={[37, 39, 22, 12]} act={() => { dispatch({ type: 'take', item: 'photos' }); say('写真を手に取った。'); }}/>}
  {s.locations.receipt !== 'inventory' && <Touch name="持ち手の紙" rect={[55, 16, 8, 15]} act={() => { dispatch({ type: 'take', item: 'receipt' }); say('紙を手に取った。'); }}/>}
 </Photo>;
}
