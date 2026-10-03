import { useSceneBack } from './SceneBack';
import { useEffect, useRef, useState } from 'react';
import { Photo, Touch } from './Photo';
import type { State, Action } from './model';
import { cargoDockets, cargoEventNames, cargoUnlocks } from './cargoDockets';
import type { CargoDocket } from './cargoDockets';
export function Docket({ docket, example }: {
    docket: CargoDocket;
    example?: boolean;
}) {
    return <svg viewBox="0 0 340 230" aria-label={example ? (docket.handling === 'received' ? '受領控' : '通過控') : `${cargoEventNames[docket.event]}、荷番号${docket.number}の荷札`} role="img">
 <image href="./assets/remake/parts/photo-back.webp" width="340" height="230" preserveAspectRatio="none"/>
 <g fill="#574c37" fontFamily="Yu Mincho,serif"><text x="24" y="42" fontSize="22">{example ? (docket.handling === 'received' ? '受領控' : '通過控') : '荷物取扱票'}</text><text x="24" y="87" fontSize="25">{example ? '9月7日' : cargoEventNames[docket.event]}</text><text x="230" y="84" fontSize="17">荷番号</text><text x="258" y="123" fontSize="35" textAnchor="middle">{example ? '—' : docket.number}</text></g>
 <path d="M25 110H195V207H25Z M220 145H310" stroke="#736349" fill="none" strokeWidth="1.8" opacity=".72"/>
 <g stroke="#755847" fill="none" strokeWidth="5" opacity=".83" transform={`translate(${docket.handling === 'received' ? 112 : 195} 159) rotate(-11)`}>{docket.route === 'circle' ? <circle r="28"/> : <path d="M0-29L30 25H-30Z"/>}</g>
 </svg>;
}
export function CargoDocketSheet() {
    return <div className="rm-freight-docket"><svg viewBox="0 0 700 470" aria-label="丸い路線印の荷物経路控え" role="img"><image href="./assets/remake/parts/photo-back.webp" width="700" height="470"/><g fill="#584d3b" fontFamily="Yu Mincho,serif"><text x="65" y="78" fontSize="30">荷物経路控</text><text x="65" y="132" fontSize="24">9月8日　　丸線</text><path d="M65 166H633" stroke="#71624b"/><text x="65" y="238" fontSize="29">給水槽　―　鉄塔</text><text x="65" y="298" fontSize="22">尾部照合印</text></g><g stroke="#755847" strokeWidth="5" fill="none" opacity=".82"><circle cx="546" cy="101" r="30"/><path d="M88 350H250V400H88Z M122 358V392 M215 358V392"/><circle cx="108" cy="375" r="4"/><circle cx="231" cy="375" r="4"/></g></svg></div>;
}
export function CargoDocketsView({ dispatch, say }: {
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const [active, setActive] = useState<number | null>(null);
    useSceneBack(active !== null, () => setActive(null));
    const selected = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (active !== null)
            selected.current?.scrollIntoView({ block: 'nearest' });
    }, [active]);
    return <section className="rm-cargo-dockets"><div className="rm-docket-examples"><Docket docket={{ number: 0, event: 'stop', route: 'circle', handling: 'received' }} example/><Docket docket={{ number: 0, event: 'passing', route: 'circle', handling: 'through' }} example/></div><div className="rm-docket-grid">{cargoDockets.map((d, i) => <button className={active === i ? 'selected' : ''} key={d.number} aria-label={`荷番号${d.number}の荷札を見る`} onClick={() => setActive(active === i ? null : i)}><Docket docket={d}/></button>)}</div>{active !== null && <div ref={selected} className="rm-docket-selected"><Docket docket={cargoDockets[active]}/></div>}<div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'cargoDockets', values: [] }); say('荷札を記録した。'); }}>記録に残す</button></div></section>;
}
export function CargoDocketsNote() { return <div className="rm-docket-note"><div className="rm-docket-examples"><Docket docket={{ number: 0, event: 'stop', route: 'circle', handling: 'received' }} example/><Docket docket={{ number: 0, event: 'passing', route: 'circle', handling: 'through' }} example/></div><div className="rm-docket-grid">{cargoDockets.map(d => <Docket key={d.number} docket={d}/>)}</div></div>; }
export function CargoChest({ s, dispatch, say, inspectDockets, inspectDocket }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    inspectDockets: () => void;
    inspectDocket: () => void;
}) {
    const [macro, setMacro] = useState(false);
    useSceneBack(macro, () => setMacro(false));
    const digits = s.values.cargoDigits ?? [0, 0, 0, 0], open = s.values.cargoOpen?.[0] === 1;
    const turn = (i: number, d = 1) => dispatch({ type: 'values', id: 'cargoDigits', values: digits.map((v, k) => k === i ? (v + d + 10) % 10 : v) });
    const release = () => {
        if (!open && !cargoUnlocks(digits)) {
            say('留めが動かない。');
            return;
        }
        dispatch({ type: 'cargoChest' });
        setMacro(false);
    };
    return <section className="rm-cargo-chest"><Photo src={'./assets/remake/cargo/chest-' + (open ? 'open' : macro ? 'mechanism' : 'closed') + '.webp'} view={macro && !open ? [290, 180, 1180, 610] : undefined} label={open ? '蓋を上げた幅広い荷物箱' : macro ? '丸い路線印と、荷物錠の四つの輪と留め' : '丸い路線印と四つの輪の付いた幅広い荷物箱'}>
 {!open && <svg className="rm-surface-ink" viewBox="0 0 1672 941"><circle cx={macro ? 464 : 803} cy={macro ? 609 : 438} r={macro ? 25 : 5} fill="none" stroke="#3b3020" strokeWidth={macro ? 5 : 1.2} opacity=".85"/>{digits.map((v, i) => <text key={i} x={macro ? 464 + i * 155 : 803 + i * 29.5} y={macro ? 488 : 421} fontSize={macro ? 105 : 29} textAnchor="middle" fontFamily="serif" fill="#3b3020">{v}</text>)}</svg>}
 {!open ? (macro ? <>{digits.map((v, i) => <Touch key={i} name={`${i + 1}番目の荷物錠：${v}`} rect={[23.5 + i * 9.27, 31, 8.9, 30]} act={() => turn(i)} drag={(_, dy) => turn(i, dy < 0 ? 1 : -1)}/>)}<Touch name="荷物錠の留めを回す" rect={[70, 29, 17, 56]} act={release}/></> : <><Touch name="荷物箱の四つの輪" rect={[44, 39, 17, 14]} act={() => setMacro(true)}/><Touch name="箱の上の荷札" rect={[69, 21, 19, 18]} act={inspectDockets}/></>) : <><Touch name="荷物箱の蓋を閉める" rect={[15, 0, 73, 22]} act={release}/>{s.locations.spareLamp === 'cargoChest' && <><img className="rm-chest-lamp" src="./assets/remake/parts/marker-lamp.png" alt=""/><Touch name="箱の交換灯具を取る" rect={[36, 14, 24, 23]} act={() => { dispatch({ type: 'take', item: 'spareLamp' }); say('交換灯具を取った。'); }}/></>}{s.locations.cargoDocket === 'cargoChest' && <div className="rm-chest-docket"><CargoDocketSheet /></div>}<Touch name={s.locations.cargoDocket === 'cargoChest' ? '箱の荷物経路控を取る' : '荷物経路控を見る'} rect={[62, 24, 20, 13]} act={() => {
                if (s.locations.cargoDocket === 'cargoChest') {
                    dispatch({ type: 'take', item: 'cargoDocket' });
                    say('経路控を取った。');
                }
                else
                    inspectDocket();
            }}/></>}
 </Photo><div className="rm-document-controls">{(macro || open) && <button onClick={inspectDockets}>荷札を手に取る</button>}</div></section>;
}
