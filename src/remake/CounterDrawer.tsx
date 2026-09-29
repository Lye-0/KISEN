import { useState } from 'react';
import { Photo, Touch } from './Photo';
import { useCompact } from './useCompact';
import type { State, Action } from './model';
export function drawerPhoto(s: State) { return '/assets/remake/counter/' + (s.values.drawerOpen?.[0] === 1 ? 'open' : 'closed') + '.webp'; }
export function DrawerLayers({ s }: {
    s: State;
}) { const open = s.values.drawerOpen?.[0] === 1, values = s.values.drawerDigits ?? [0, 0, 0, 0], centres = open ? [724, 777, 830, 883] : [734, 782, 830, 878]; return <><g fill="#3d3527" textAnchor="middle" fontFamily="serif" fontSize={open ? 46 : 43}>{values.map((n, i) => <text key={i} x={centres[i]} y={open ? 704 : 476}>{n}</text>)}</g>{open && s.locations.knob === 'cashDrawer' && <image href="/assets/remake/parts/reel-cap.png" x="960" y="437" width="53" height="27" preserveAspectRatio="none" style={{ filter: 'drop-shadow(2px 3px 2px #0009)' }}/>}</>; }
export function DrawerImage({ s }: {
    s: State;
}) { return <><image href={drawerPhoto(s)} width="1672" height="941"/><DrawerLayers s={s}/></>; }
export function CounterDrawer({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const compact = useCompact(), [detail, setDetail] = useState(false);
    const open = s.values.drawerOpen?.[0] === 1, values = s.values.drawerDigits ?? [0, 0, 0, 0];
    const centres = open ? [724, 777, 830, 883] : [734, 782, 830, 878];
    const crop: [
        number,
        number,
        number,
        number
    ] | undefined = !compact ? undefined : open ? [740, 330, 460, 300] : detail ? [630, 365, 340, 235] : [560, 305, 920, 360];
    function turn(i: number, d = 1) { dispatch({ type: 'values', id: 'drawerDigits', values: values.map((n, j) => i === j ? (n + d + 10) % 10 : n) }); }
    function pull() { if (!open && !values.every((n, i) => n === [2, 1, 4, 6][i])) {
        say('留めが残っている。');
        return;
    } dispatch({ type: 'counterDrawer' }); setDetail(false); }
    return <section className="rm-counter-drawer"><Photo view={crop} src={drawerPhoto(s)} label={open ? '開いた受付の引出し' : '受付の引出し'}>
 <svg className="rm-object-overlay" viewBox="0 0 1672 941"><DrawerLayers s={s}/></svg>
 {!open && (!compact || detail) && values.map((n, i) => <Touch key={i} name={`受付の${i + 1}番目の輪：${n}`} rect={[(centres[i] - 23) / 1672 * 100, 43.7, 2.8, 10]} act={() => turn(i)} drag={(_, dy) => turn(i, dy > 0 ? 1 : -1)}/>)}
 {!open && compact && !detail && <Touch name="時刻の輪を近くで見る" rect={[38.5, 40, 19.5, 20]} act={() => setDetail(true)}/>}
 {(!compact || !detail) && <Touch name={open ? '受付の引出しを押し戻す' : '受付の引出しを引く'} rect={open ? [35, 53, 33, 9] : [75, 42, 10, 23]} act={pull} drag={pull}/>}
 {open && s.locations.knob === 'cashDrawer' && <><Touch name="引出しの黒いつまみ" rect={[54, 41, 10, 10]} act={() => { dispatch({ type: 'take', item: 'knob' }); say('黒いつまみを取った。'); }}/></>}
 </Photo>{compact && detail && !open && <button className="rm-close-back" onClick={() => setDetail(false)}>引出し全体へ</button>}</section>;
}
