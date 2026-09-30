import { useState } from 'react';
import { Photo, Touch, Patch } from './Photo';
import type { Action, State } from './model';
import { shedUnlocks } from './posters';
import { balanceAngle, balanceReleases } from './balance';
export function ShedDoor({ s, dispatch, say, enter }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    enter: () => void;
}) {
    const d = s.values.shedDigits ?? [0, 0, 0, 0];
    const turn = (i: number, step: number) => dispatch({ type: 'values', id: 'shedDigits', values: d.map((v, k) => i === k ? (v + step + 10) % 10 : v) });
    return <section className="rm-shed-lock"><Photo src="/assets/remake/lamp/door-lock.webp" label="小屋の扉の四つの輪と留め"><svg className="rm-surface-ink" viewBox="0 0 1672 941">{d.map((v, i) => <text key={i} x={[454, 639, 843, 1040][i]} y="482" fontFamily="serif" fontSize="90" fill="#2c2921" textAnchor="middle">{v}</text>)}</svg>{d.map((v, i) => <Touch key={i} name={`${i + 1}番目の小屋の錠：${v}`} rect={[[454, 639, 843, 1040][i] / 16.72 - 5.3, 32, 10.6, 29]} act={() => turn(i, 1)} drag={(_, dy) => turn(i, dy < 0 ? 1 : -1)}/>)}<Touch name="小屋の留めを引く" rect={[71, 27, 17, 43]} act={() => {
            if (shedUnlocks(d)) {
                dispatch({ type: 'shedDoor' });
                enter();
            }
            else
                say('留めが動かない。');
        }}/></Photo></section>;
}
export function LampShed({ s, dispatch, inspect, say }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: 'balanceBox' | 'lampWindow') => void;
    say: (m: string) => void;
}) {
    return <><Photo src={"/assets/remake/lamp/store" + (s.values.balanceOpen?.[0] === 1 ? "-open" : "") + ".webp"} label="灯具小屋の保管箱と西の窓">{s.locations.lamp === 'lightRack' && <Patch src="/assets/remake/lamp/store-lamp.webp" rect={[30, 28, 10, 24]}/>}<svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="700" y="502" width="380" height="272" viewBox="250 125 1150 835" preserveAspectRatio="none"><BalanceContents s={s}/><BalanceParts s={s}/></svg></svg><Touch name={s.locations.lamp === 'lightRack' ? '壁の灯具を取る' : '灯具の空の金具'} rect={[32, 36, 11, 23]} act={() => {
            if (s.locations.lamp === 'lightRack') {
                dispatch({ type: 'take', item: 'lamp' });
                say('灯具を取った。');
            }
            else
                say('灯具の金具が残っている。');
        }}/><Touch name="左右の重りの付いた保管箱" rect={[38, 49, 31, 39]} act={() => inspect('balanceBox')}/><Touch name="小屋の西の窓" rect={[0, 16, 27, 58]} act={() => dispatch({ type: 'look', camera: 1 })}/></Photo><button className="rm-passage-actions" onClick={() => dispatch({ type: "move", room: "forecourt", camera: 1 })}>入口へ戻る</button></>;
}
export function BalanceContents({ s }: {
    s: State;
}) { return s.values.balanceOpen?.[0] === 1 && s.locations.hood === 'balanceChest' ? <><ellipse cx="760" cy="762" rx="206" ry="14" fill="#000" opacity=".38"/><g transform="translate(570 718) skewX(-18) scale(1 .45)" style={{ filter: 'brightness(.68) sepia(.15)' }}><image href="/assets/remake/parts/shutter-blade.png" width="310" height="110"/><image href="/assets/remake/parts/shutter-blade.png" x="45" y="83" width="310" height="110"/></g></> : null; }
export function BalanceParts({ s }: {
    s: State;
}) {
    const v = s.values.balancePositions ?? [1, 1], angle = balanceAngle(v);
    const rad = angle * Math.PI / 180;
    return <><g transform={`rotate(${angle} 836 239)`}><image href="/assets/remake/parts/balance-beam.png" x="290" y="206" width="1092" height="100" preserveAspectRatio="none"/></g>{v.map((distance, i) => { const dx = (i ? 1 : -1) * distance * 150, x = 836 + dx * Math.cos(rad) - 50 * Math.sin(rad), y = 239 + dx * Math.sin(rad) + 50 * Math.cos(rad); return distance > 0 ? <g key={i}><svg x={x - 71} y={y - 32} width="142" height="300" viewBox={i ? '952 0 560 1024' : '180 0 520 1024'} preserveAspectRatio="xMidYMin meet"><image href="/assets/remake/parts/balance-weights.png" width="1672" height="1024"/></svg><text x={x} y={y + (i ? 172 : 186)} textAnchor="middle" fontSize="38" fontFamily="serif" fill="#302c25">{i ? 3 : 2}</text></g> : <g key={i}><svg x={i ? 1300 : 220} y="823" width="142" height="110" viewBox={i ? '952 610 560 414' : '180 610 520 414'} preserveAspectRatio="xMidYMid meet"><image href="/assets/remake/parts/balance-weights.png" width="1672" height="1024"/></svg><text x={i ? 1371 : 291} y="898" textAnchor="middle" fontSize="30" fill="#302c25">{i ? 3 : 2}</text></g>; })}</>;
}
export function BalanceBox({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const [active, setActive] = useState<0 | 1>(0), v = s.values.balancePositions ?? [1, 1], open = s.values.balanceOpen?.[0] === 1;
    const peg = (i: number, n: number) => { const a = balanceAngle(v) * Math.PI / 180, dx = (i ? 1 : -1) * n * 150; return { x: 836 + dx * Math.cos(a) - 50 * Math.sin(a), y: 239 + dx * Math.sin(a) + 50 * Math.cos(a) }; };
    const place = (i: 0 | 1, n: number) => dispatch({ type: 'balanceWeight', index: i, position: n });
    return <section className="rm-balance"><Photo src={'/assets/remake/lamp/balance-' + (open ? 'open' : 'closed') + '.webp'} zoomable zoomOrigin={open ? "45% 80%" : v[active] === 0 ? (active ? "82% 88%" : "17% 88%") : `${peg(active, v[active]).x / 16.72}% 35%`} limitZoomToSource zoomButtonOnly label={open ? '蓋の開いた保管箱' : '支点の両側に三つずつ吊り位置がある保管箱'}><svg className="rm-object-overlay" viewBox="0 0 1672 941"><BalanceContents s={s}/><BalanceParts s={s}/></svg>{!open ? <>{[0, 1].map(i => [1, 2, 3].map(n => { const p = peg(i, n); return <Touch key={i + '-' + n} name={`${i ? '右' : '左'}、支点から${n}の吊り位置`} rect={[(p.x - 50) / 16.72, (p.y - 45) / 9.41, 6, 13]} act={() => { setActive(i as 0 | 1); place(i as 0 | 1, n); }}/>; }))}{v.map((n, i) => { const p = peg(i, n); return n > 0 && <Touch key={'weight' + i} name={`${i ? '右' : '左'}の重りを動かす`} rect={[(p.x - 65) / 16.72, (p.y + 135) / 9.41, 8, 12]} act={() => setActive(i as 0 | 1)} drag={dx => place(i as 0 | 1, Math.max(0, Math.min(3, n + (i ? 1 : -1) * Math.sign(dx))))}/>; })}<Touch name="保管箱の留めを外す" rect={[72, 48, 17, 34]} act={() => {
                if (!balanceReleases(v)) {
                    say('傾いた腕が留めに当たっている。');
                    return;
                }
                dispatch({ type: 'balanceBox' });
            }}/></> : <><Touch name="保管箱の蓋を閉める" rect={[20, 0, 64, 24]} act={() => dispatch({ type: 'balanceBox' })}/>{s.locations.hood === 'balanceChest' && <Touch name="保管箱の覆いを取る" rect={[32, 57, 26, 26]} act={() => { dispatch({ type: 'take', item: 'hood' }); say('覆いを取った。'); }}/>}</>}</Photo><div className="rm-balance-controls">{!open && <><button aria-pressed={active === 0} onClick={() => setActive(0)}>左の重り 2</button><button aria-pressed={active === 1} onClick={() => setActive(1)}>右の重り 3</button><button onClick={() => place(active, Math.max(0, v[active] - 1))}>支点へ</button><button onClick={() => place(active, Math.min(3, v[active] + 1))}>外へ</button><button onClick={() => place(active, 0)}>重りを外す</button></>}{open && <button onClick={() => dispatch({ type: 'balanceBox' })}>蓋を閉める</button>}</div></section>;
}
