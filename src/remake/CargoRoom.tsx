import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { Photo, Touch } from './Photo';
import { cargoBoxes, cargoInitial, moveCargo, stairsClear } from './cargo';
import type { Cargo } from './cargo';
import { cargoOfficeDoor, cargoStairDoor, cargoVisualBounds, projectedBounds } from './cargoGeometry';
import type { Action, State } from './model';
const objects = [
    { name: '長い木箱', image: 'long-crate', axis: 'depth' },
    { name: '幅広い木箱', image: 'wide-crate-locked', axis: 'side' },
    { name: '空の台車', image: 'trolley', axis: 'side' },
    { name: '車輪付きの棚', image: 'shelf', axis: 'depth' },
] as const;
const office = projectedBounds(cargoOfficeDoor), stair = projectedBounds(cargoStairDoor);
export function CargoRoom({ s, dispatch, say, leave, descend, inspectChest, active, select, interactive }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    leave: () => void;
    descend: () => void;
    inspectChest: () => void;
    active: number | null;
    select: (index: number) => void;
    interactive: boolean;
}) {
    const selectors = useRef<(HTMLButtonElement | null)[]>([]);
    const returnSelection = useRef(active);
    useEffect(() => { returnSelection.current = active; }, [active]);
    // Restore focus on returning to the room, never in the inert backdrop.
    useEffect(() => {
        if (interactive && returnSelection.current !== null)
            selectors.current[returnSelection.current]?.focus({ preventScroll: true });
    }, [interactive]);
    const cargo = (s.values.cargo ?? cargoInitial) as Cargo;
    const clear = stairsClear(cargo), doorOpen = s.values.stairDoor?.[0] === 1;
    const attempt = (index: number, direction: number) => {
        if (index === 1 && s.values.cargoOpen?.[0] === 1) {
            say('蓋が開いている。');
            return;
        }
        if (!moveCargo(cargo, index, direction)) {
            say('ほかの荷に当たる。');
            return;
        }
        dispatch({ type: 'cargoMove', index, direction });
    };
    const handleKey = (e: KeyboardEvent, index: number) => {
        const keys = objects[index].axis === 'side' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowDown', 'ArrowUp'];
        const direction = keys.indexOf(e.key);
        if (direction >= 0) {
            e.preventDefault();
            select(index);
            attempt(index, direction === 0 ? -1 : 1);
        }
    };
    const lidOpen = s.values.cargoOpen?.[0] === 1;
    const blocked = active === null || active === 1 && lidOpen;
    return <div className="rm-cargo"><Photo src={'./assets/remake/cargo/' + (doorOpen ? 'door-open' : 'empty') + '.webp'} label="荷物室の床の溝と、車輪付きの荷">
        <Touch name="駅務室へ戻る" rect={[office.x / 16.72, office.y / 9.41, office.w / 16.72, office.h / 9.41]} act={leave}/>
        {clear && <Touch name={doorOpen ? '開いた階段戸を通る' : '奥の木戸'} rect={[stair.x / 16.72, stair.y / 9.41, stair.w / 16.72, stair.h / 9.41]} act={() => {
                if (doorOpen)
                    descend();
                else
                    dispatch({ type: 'stairDoor' });
            }} style={{ zIndex: 5 }}/>}
        {cargoBoxes(cargo).map((box, index) => {
            const hit = cargoVisualBounds(box), r = index === 1 && lidOpen ? cargoVisualBounds({ ...box, h: 1.2 }) : hit, item = objects[index], depth = Math.round(r.y + r.h) + 20;
            return <div key={box.id}>
                <img className={'rm-cargo-prop' + (active === index ? ' selected' : '')} src={'./assets/remake/cargo/' + (index === 1 ? 'wide-crate-' + (s.values.cargoOpen?.[0] === 1 ? 'open' : 'locked') : item.image) + '.png'} draggable={false} alt="" aria-hidden="true" style={{ left: r.x / 16.72 + '%', top: r.y / 9.41 + '%', width: r.w / 16.72 + '%', height: r.h / 9.41 + '%', zIndex: depth }}/>
                {index === 1 && s.values.cargoOpen?.[0] === 1 && <svg className="rm-cargo-prop" viewBox="0 0 1400 1087" preserveAspectRatio="none" aria-hidden="true" style={{ left: r.x / 16.72 + '%', top: r.y / 9.41 + '%', width: r.w / 16.72 + '%', height: r.h / 9.41 + '%', zIndex: depth }}>{s.locations.spareLamp === 'cargoChest' && <image href="./assets/remake/parts/marker-lamp.png" x="580" y="320" width="150" height="200" style={{ filter: 'brightness(.7) sepia(.12)' }}/>}{s.locations.cargoDocket === 'cargoChest' && <image href="./assets/remake/parts/photo-back.webp" x="1000" y="448" width="180" height="75" transform="skewX(-6)" style={{ filter: 'brightness(.6)' }}/>}</svg>}
                <Touch name={item.name} rect={[hit.x / 16.72, hit.y / 9.41, hit.w / 16.72, hit.h / 9.41]} act={() => select(index)} onKeyDown={e => handleKey(e, index)} drag={(dx, dy) => {
                    select(index);
                    attempt(index, item.axis === 'side' ? dx > 0 ? 1 : -1 : dy < 0 ? 1 : -1);
                }} style={{ zIndex: depth + 1 }}/>
            </div>;
        })}
    </Photo>
    <div className="rm-cargo-selection" role="group" aria-label="動かす荷物">
        {objects.map((item, index) => <button key={item.name} ref={el => { selectors.current[index] = el; }} aria-pressed={active === index} onClick={() => select(index)} onKeyDown={e => handleKey(e, index)}>{item.name}</button>)}
    </div>
    <div className="rm-cargo-actions" onKeyDown={e => { if (active !== null) handleKey(e, active); }}>
        {active === null ? <span>動かす荷物を選ぶ</span> : <>
            <button disabled={blocked} onClick={() => attempt(active, -1)}>{objects[active].axis === 'side' ? '← 左へ' : '↓ 手前へ'}</button>
            <button disabled={blocked} onClick={() => attempt(active, 1)}>{objects[active].axis === 'side' ? '右へ →' : '奥へ ↑'}</button>
            {active === 1 && <><button onClick={inspectChest}>箱を調べる</button>{lidOpen && <button onClick={() => { dispatch({ type: 'cargoChest' }); selectors.current[1]?.focus({ preventScroll: true }); }}>蓋を閉める</button>}</>}
        </>}
    </div>
    <p className="rm-operation-note">{active === 1 && lidOpen ? '箱を動かすには、蓋を閉める。' : '荷物を選び、矢印キー・移動ボタン・ドラッグで動かす。'}</p></div>;
}
