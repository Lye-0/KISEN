import { useEffect, useRef, useState } from 'react';
import { Photo, Touch } from './Photo';
import { useCompact } from './useCompact';
import { owns } from './model';
import type { Action, Item, State } from './model';
export function OfficeLock({ s, dispatch, say, selected, onSelect, enter }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    selected: Item | null;
    onSelect: (i: Item | null) => void;
    enter: () => void;
}) {
    const compact = useCompact(), [phase, setPhase] = useState(0), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current)
        clearTimeout(timer.current); }, []);
    function unlock() { if (phase)
        return; if (s.flags.includes('officeUnlocked')) { say('錠の留めは外れている。'); return; } if (selected !== 'officeKey' || !owns(s, 'officeKey')) {
        say(selected ? 'この形では鍵穴に入らない。' : '鍵穴がある。');
        return;
    } setPhase(1); timer.current = setTimeout(() => { setPhase(2); dispatch({ type: 'flag', id: 'officeUnlocked' }); timer.current = setTimeout(() => { setPhase(0); onSelect(null); say('錠の留めが外れた。'); }, 240); }, 140); }
    return <Photo view={compact ? [680, 120, 360, 740] : undefined} src="./assets/remake/office/lock.webp" label="駅務室の扉の取っ手と鍵穴">
 {phase > 0 && <svg className="rm-object-overlay" viewBox="0 0 1672 941"><g transform={`translate(855 643) rotate(${phase === 1 ? -60 : -95}) scale(.16 .11) translate(-400 -1410)`}><image href="./assets/remake/parts/office-key.png" width="1024" height="1536"/></g></svg>}
 <Touch name="駅務室の鍵穴" rect={[46.5, 60, 10, 16]} act={unlock}/><Touch name={s.flags.includes('officeUnlocked') ? '開錠した扉の取っ手' : '駅務室の取っ手'} rect={[43, 20, 16, 27]} act={() => { if (s.flags.includes('officeUnlocked'))
        enter();
    else
        say('鍵が掛かっている。'); }}/>
 </Photo>;
}
