import { useState } from 'react';
import { Photo, Touch } from './Photo';
import { cargoBoxes, cargoInitial, moveCargo, stairsClear } from './cargo';
import type { Cargo } from './cargo';
import { project } from './geometry';
import type { Camera } from './geometry';
import type { Action, State } from './model';
// Asset-composition calibration. The final building-space camera still needs G1 reconciliation.
const camera: Camera = { position: [13.5, -14.5, 1.7], target: [13.5, -7.4, 1.4], focal: 750, width: 1672, height: 941 };
const objects = [
    { name: '長い木箱', image: 'long-crate', axis: 'depth' },
    { name: '幅広い木箱', image: 'wide-crate', axis: 'side' },
    { name: '空の台車', image: 'trolley', axis: 'side' },
    { name: '車輪付きの棚', image: 'shelf', axis: 'depth' },
] as const;
function bounds(box: ReturnType<typeof cargoBoxes>[number]) {
    const h = box.id === 'trolley' ? .9 : box.h;
    const points = [box.x, box.x + box.w].flatMap(x => [box.y, box.y + box.d].flatMap(y => [0, h].map(z => project([x, y, z], camera))));
    const x = Math.min(...points.map(p => p.x)), y = Math.min(...points.map(p => p.y));
    return { x, y, w: Math.max(...points.map(p => p.x)) - x, h: Math.max(...points.map(p => p.y)) - y };
}
export function CargoRoom({ s, dispatch, say, leave, descend }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    leave: () => void;
    descend: () => void;
}) {
    const [active, setActive] = useState<number | null>(null);
    const cargo = (s.values.cargo ?? cargoInitial) as Cargo;
    const clear = stairsClear(cargo), doorOpen = s.values.stairDoor?.[0] === 1;
    const attempt = (index: number, direction: number) => {
        if (!moveCargo(cargo, index, direction)) {
            say('ほかの荷に当たる。');
            return;
        }
        dispatch({ type: 'cargoMove', index, direction });
    };
    return <div className="rm-cargo"><Photo src={'/assets/remake/cargo/' + (doorOpen ? 'door-open' : 'empty') + '.webp'} label="荷物室の床の溝と、車輪付きの荷">
        <Touch name="駅務室へ戻る" rect={[0, 8, 13, 84]} act={leave}/>
        {clear && <Touch name={doorOpen ? '開いた階段戸を通る' : '奥の木戸'} rect={[61, 17, 11, 53]} act={() => {
                if (doorOpen)
                    descend();
                else
                    dispatch({ type: 'stairDoor' });
            }} style={{ zIndex: 5 }}/>}
        {cargoBoxes(cargo).map((box, index) => {
            const r = bounds(box), item = objects[index], depth = Math.round(r.y + r.h) + 20;
            return <div key={box.id}>
                <img className={'rm-cargo-prop' + (active === index ? ' selected' : '')} src={'/assets/remake/cargo/' + item.image + '.png'} draggable={false} alt="" aria-hidden="true" style={{ left: r.x / 16.72 + '%', top: r.y / 9.41 + '%', width: r.w / 16.72 + '%', height: r.h / 9.41 + '%', zIndex: depth }}/>
                <Touch name={item.name} rect={[r.x / 16.72, r.y / 9.41, r.w / 16.72, r.h / 9.41]} act={() => setActive(index)} drag={(dx, dy) => {
                    setActive(index);
                    attempt(index, item.axis === 'side' ? dx > 0 ? 1 : -1 : dy < 0 ? 1 : -1);
                }} style={{ zIndex: depth + 1 }}/>
            </div>;
        })}
    </Photo><div className="rm-cargo-footer"><button className="rm-cargo-return" aria-label="駅務室へ戻る" onClick={leave}>〈</button>{active !== null && <div className="rm-cargo-controls" aria-label={objects[active].name + 'を動かす'}><span>{objects[active].name}</span><button onClick={() => attempt(active, -1)}>{objects[active].axis === 'side' ? '← 左へ' : '↓ 手前へ'}</button><button onClick={() => attempt(active, 1)}>{objects[active].axis === 'side' ? '右へ →' : '奥へ ↑'}</button></div>}</div></div>;
}
