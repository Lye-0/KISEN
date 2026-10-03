import { useEffect } from 'react';
import { Photo, Touch, decode } from './Photo';
import { owns } from './model';
import type { Action, Item, State } from './model';
const root = './assets/remake/bridge/';
function imageState(s: State) { return s.values.gateOpen?.[0] === 1 ? owns(s, 'support') ? 'open-empty' : 'open' : owns(s, 'support') ? 'empty' : s.values.gateRod?.[0] === 1 ? 'released' : s.values.gateSupport?.[0] === 1 ? 'braced' : 'closed'; }
export function BridgeGateWide({ s, dispatch, inspect, enterNorth }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: () => void;
    enterNorth: () => void;
}) {
    useEffect(() => {
        for (const name of ['north-gate', 'north-gate-braced', 'north-gate-released', 'north-gate-open', 'north-gate-open-empty', 'north-gate-empty'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    const state = imageState(s);
    return <Photo src={root + (state === 'closed' ? 'north-gate' : 'north-gate-' + state) + '.webp'} label="跨線橋の北端にある保守柵">
        {state.startsWith('open') ? <><Touch name="北ホームへ渡る" rect={[44, 31, 14, 32]} act={enterNorth}/><Touch name="開いた保守柵を閉める" rect={[60, 36, 9, 28]} act={() => dispatch({ type: 'gateDoor' })}/><Touch name="開いた柵の留め具" rect={[52, 36, 8, 27]} act={inspect}/></> : <Touch name={state === 'released' ? '保守柵を押す' : '保守柵のばねと支え'} rect={[38, 35, 23, 30]} act={() => state === 'released' ? dispatch({ type: 'gateDoor' }) : inspect()}/>}
    </Photo>;
}
export function BridgeGateDetail({ s, dispatch, say, selected }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    selected: Item | null;
}) {
    useEffect(() => {
        for (const name of ['gate-mechanism', 'gate-mechanism-braced', 'gate-mechanism-released', 'gate-mechanism-open', 'gate-mechanism-open-empty', 'gate-mechanism-empty'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    const state = imageState(s);
    return <section className="rm-gate-detail"><Photo src={root + (state === 'closed' ? 'gate-mechanism' : 'gate-mechanism-' + state) + '.webp'} label="保守柵のばね、受け口と折り畳み支え">
        {state === 'open' && <Touch name="折り畳み支えを外す" rect={[56, 46, 17, 39]} act={() => dispatch({ type: 'take', item: 'support' })}/>}
        {state === 'empty' && <Touch name="支えを元の金具へ戻す" rect={[38, 49, 16, 30]} act={() => selected === 'support' ? dispatch({ type: 'gateInstallSupport' }) : say('支えの取り付け跡。')}/>}
        {state !== 'open' && state !== 'open-empty' && state !== 'empty' && <><Touch name="折り畳み支え" rect={[38, 49, 16, 30]} act={() => state === 'released' ? say('支えがばねを受けている。') : dispatch({ type: 'gateSupport' })}/><Touch name="ばね付きの横棒" rect={[31, 32, 26, 20]} act={() => state === 'released' ? dispatch({ type: 'gateDoor' }) : state === 'closed' ? say('ばねが横棒を押し戻す。') : !owns(s, 'pin') || selected !== 'pin' ? say(selected === 'retainingPin' ? '丸い軸は、留めの溝に収まらない。' : selected ? 'この形では、留めの溝に入らない。' : '留めの奥に、細い溝がある。') : (() => { dispatch({ type: 'gateRod' }); say('横棒が受けから抜け、留めが外れた。'); })()}/></>}
        {state === 'released' && <Touch name="留めを戻す" rect={[57, 30, 9, 19]} act={() => dispatch({ type: 'gateRod' })}/>}
    </Photo>{state === 'released' && <div className="rm-document-controls"><span className="rm-operation-note">留めが外れている。</span></div>}</section>;
}
