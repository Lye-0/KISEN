import { useState } from 'react';
import { Photo, Touch } from './Photo';
import { cargoBoxes, cargoInitial, moveCargo, stairsClear } from './cargo';
import type { Cargo } from './cargo';
import { cargoOfficeDoor, cargoStairDoor, cargoVisualBounds, projectedBounds } from './cargoGeometry';
import type { Action, State } from './model';
const objects = [
    { name: '長い木箱', image: 'long-crate', axis: 'depth' },
    { name: '幅広い木箱', image: 'wide-crate', axis: 'side' },
    { name: '空の台車', image: 'trolley', axis: 'side' },
    { name: '車輪付きの棚', image: 'shelf', axis: 'depth' },
] as const;
const office = projectedBounds(cargoOfficeDoor), stair = projectedBounds(cargoStairDoor);
export function CargoRoom({ s, dispatch, say, leave, descend, inspectChest }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    leave: () => void;
    descend: () => void;
    inspectChest: () => void;
}) {
    const [active, setActive] = useState<number | null>(null);
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
    return <div className="rm-cargo"><Photo src={'/assets/remake/cargo/' + (doorOpen ? 'door-open' : 'empty') + '.webp'} label="荷物室の床の溝と、車輪付きの荷">
        <Touch name="駅務室へ戻る" rect={[office.x / 16.72, office.y / 9.41, office.w / 16.72, office.h / 9.41]} act={leave}/>
        {clear && <Touch name={doorOpen ? '開いた階段戸を通る' : '奥の木戸'} rect={[stair.x / 16.72, stair.y / 9.41, stair.w / 16.72, stair.h / 9.41]} act={() => {
                if (doorOpen)
                    descend();
                else
                    dispatch({ type: 'stairDoor' });
            }} style={{ zIndex: 5 }}/>}
        {cargoBoxes(cargo).map((box, index) => {
            const r = cargoVisualBounds(index === 1 && s.values.cargoOpen?.[0] === 1 ? { ...box, h: 1.2 } : box), item = objects[index], depth = Math.round(r.y + r.h) + 20;
            return <div key={box.id}>
                <img className={'rm-cargo-prop' + (active === index ? ' selected' : '')} src={'/assets/remake/cargo/' + (index === 1 ? 'wide-crate-' + (s.values.cargoOpen?.[0] === 1 ? 'open' : 'locked') : item.image) + '.png'} draggable={false} alt="" aria-hidden="true" style={{ left: r.x / 16.72 + '%', top: r.y / 9.41 + '%', width: r.w / 16.72 + '%', height: r.h / 9.41 + '%', zIndex: depth }}/>
                {index === 1 && s.values.cargoOpen?.[0] === 1 && <svg className="rm-cargo-prop" viewBox="0 0 1400 1087" preserveAspectRatio="none" aria-hidden="true" style={{ left: r.x / 16.72 + '%', top: r.y / 9.41 + '%', width: r.w / 16.72 + '%', height: r.h / 9.41 + '%', zIndex: depth }}>{s.locations.spareLamp === 'cargoChest' && <image href="/assets/remake/parts/marker-lamp.png" x="580" y="320" width="150" height="200" style={{ filter: 'brightness(.7) sepia(.12)' }}/>}{s.locations.cargoDocket === 'cargoChest' && <image href="/assets/remake/parts/photo-back.webp" x="1000" y="448" width="180" height="75" transform="skewX(-6)" style={{ filter: 'brightness(.6)' }}/>}</svg>}
                <Touch name={item.name} rect={[r.x / 16.72, r.y / 9.41, r.w / 16.72, r.h / 9.41]} act={() => { setActive(index); if (index === 1) inspectChest(); }} onKeyDown={e => { const keys = item.axis === 'side' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowDown', 'ArrowUp']; const direction = keys.indexOf(e.key); if (direction >= 0) { e.preventDefault(); setActive(index); attempt(index, direction === 0 ? -1 : 1); } }} drag={(dx, dy) => {
                    setActive(index);
                    attempt(index, item.axis === 'side' ? dx > 0 ? 1 : -1 : dy < 0 ? 1 : -1);
                }} style={{ zIndex: depth + 1 }}/>
            </div>;
        })}
    </Photo><p className="rm-operation-note">荷を溝に沿ってドラッグする。選択中は矢印キーでも動かせる。</p></div>;
}
