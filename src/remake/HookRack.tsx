import { useEffect } from 'react';
import { Photo, Touch, decode } from './Photo';
import { owns } from './model';
import type { Action, State } from './model';
const root = './assets/remake/office/';
export function HookRack({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    useEffect(() => {
        for (const name of ['hook-close', 'hook-ring-turned', 'hook-empty'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    const taken = owns(s, 'hook'), turned = s.values.rackRing?.[0] === 1;
    return <Photo src={root + (taken ? 'hook-empty' : turned ? 'hook-ring-turned' : 'hook-close') + '.webp'} label="木の傘立てに固定された鉤付きの鉄棒">
        {!taken && <Touch name="鉤付き棒を持ち上げる" rect={[50, 20, 14, 25]} act={() => {
                if (!turned)
                    say('曲がった先が輪に当たる。');
                else
                    dispatch({ type: 'take', item: 'hook' });
            }}/>}
        <Touch name="工具の輪を傾ける" rect={[48, 46, 13, 22]} act={() => taken ? say('輪は木枠に残っている。') : dispatch({ type: 'rackRing' })}/>
    </Photo>;
}
