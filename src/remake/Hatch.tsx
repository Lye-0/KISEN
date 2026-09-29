import { useEffect } from 'react';
import { Photo, Touch, decode } from './Photo';
import { useCompact } from './useCompact';
import type { State, Action } from './model';
export function hatchPhoto(s: State) { const state = s.window.open ? 'empty' : s.window.latch ? (s.window.supported ? 'released-raised' : 'released') : (s.window.supported ? 'raised' : 'closed'); return '/assets/remake/hatch/' + state + '.webp'; }
export function HatchLayers({ s }: {
    s: State;
}) { return s.window.open && s.locations.counterRecords !== 'inventory' ? <image href="/assets/remake/parts/counter-folder.png" x="748" y="666" width="201" height="76" preserveAspectRatio="none"/> : null; }
export function HatchImage({ s }: {
    s: State;
}) { return <><image href={hatchPhoto(s)} width="1672" height="941"/><HatchLayers s={s}/></>; }
export function Hatch({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const compact = useCompact();
    useEffect(() => { for (const name of ['closed', 'raised', 'released', 'released-raised', 'empty'])
        void decode('/assets/remake/hatch/' + name + '.webp').catch(() => { }); }, []);
    function lift() { if (s.window.open || s.window.latch)
        dispatch({ type: 'windowOpen' });
    else
        dispatch({ type: 'windowLift' }); }
    return <Photo view={compact ? [330, 120, 1000, 780] : undefined} src={hatchPhoto(s)} label="受付の木の小戸"><svg className="rm-object-overlay" viewBox="0 0 1672 941"><HatchLayers s={s}/></svg>
 <Touch name="小戸の指掛け" rect={s.window.open ? [43, 39, 14, 13] : [43, 74, 14, 13]} act={lift} drag={(_, dy) => { if (s.window.open ? dy > 0 : dy < 0)
        lift(); }}/>
 {!s.window.open && <Touch name="小戸の掛け金" rect={[66, 54, 11, 15]} act={() => { if (!s.window.supported && !s.window.latch) {
        say('戸の重みが掛かっている。');
        return;
    } dispatch({ type: 'windowBolt' }); }}/>}
 {s.window.open && s.locations.counterRecords !== 'inventory' && <Touch name="窓口の帳票" rect={[43, 68, 16, 13]} act={() => { dispatch({ type: 'take', item: 'counterRecords' }); say('帳票を手に取った。'); }}/>}
 </Photo>;
}
