import { useEffect } from 'react';
import { Photo, Touch, decode } from './Photo';
import { owns } from './model';
import type { Action, Item, State } from './model';
const root = '/assets/remake/bridge/';
function stage(s: State) { return owns(s, 'pin') ? 'empty' : s.values.tagDepth?.[0] === 2 ? s.values.tagCaught?.[0] === 1 ? 'caught' : 'extended' : s.values.tagDepth?.[0] === 1 ? 'inserted' : 'initial'; }
export function RailTagWide({ s, inspect, observe }: {
    s: State;
    inspect: () => void;
    observe: () => void;
}) {
    useEffect(() => {
        for (const name of ['east-tag', 'east-tag-empty'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    return <Photo src={root + 'east-tag' + (stage(s) === 'empty' ? '-empty' : '') + '.webp'} label="跨線橋から見た線路と濡れた手すり">
        <Touch name="線路を跨ぐ古い高架" rect={[12, 13, 72, 24]} act={observe}/>
        <Touch name="濡れた手すりの下側" rect={[27, 69, 47, 30]} act={inspect}/>
    </Photo>;
}
export function RailTagDetail({ s, dispatch, selected, say }: {
    s: State;
    dispatch: (a: Action) => void;
    selected: Item | null;
    say: (m: string) => void;
}) {
    useEffect(() => {
        for (const name of ['rail-tag', 'rail-tag-inserted', 'rail-tag-extended', 'rail-tag-caught', 'rail-tag-empty'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    const state = stage(s);
    return <Photo src={root + 'rail-tag' + (state === 'initial' ? '' : '-' + state) + '.webp'} label="手すりの隙間と外側に吊るされた薄い金具">
        {state === 'initial' && <><Touch name="手すりの上側" rect={[30, 16, 33, 27]} act={() => say(owns(s, 'hook') && selected === 'hook' ? '棒を上から差し出すと、手すりに当たって金具まで届かない。' : '手すりの外側に金具が吊られている。上からは手が届かない。')}/><Touch name="手すりの下の隙間" rect={[14, 43, 28, 33]} act={() => !owns(s, 'hook') || selected !== 'hook' ? say('隙間から手を伸ばしても、外側に吊られた金具までは届かない。') : dispatch({ type: 'tagInsert' })}/></>}
        {state === 'inserted' && <><Touch name="棒を奥へ送る" rect={[40, 49, 21, 23]} act={() => dispatch({ type: 'tagExtend' })}/><Touch name="棒を手前へ戻す" rect={[12, 69, 25, 28]} act={() => dispatch({ type: 'tagWithdraw' })}/></>}
        {state === 'extended' && <><Touch name="鉤を上へ返す" rect={[54, 45, 15, 24]} act={() => dispatch({ type: 'tagTurn' })}/><Touch name="棒を手前へ戻す" rect={[12, 69, 25, 28]} act={() => dispatch({ type: 'tagWithdraw' })}/></>}
        {state === 'caught' && <><Touch name="鉤を下へ戻す" rect={[54, 45, 15, 24]} act={() => dispatch({ type: 'tagTurn' })}/><Touch name="棒と札を引き寄せる" rect={[12, 69, 25, 28]} act={() => dispatch({ type: 'tagWithdraw' })}/></>}
    </Photo>;
}
