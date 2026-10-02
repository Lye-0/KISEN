import { useSceneBack } from './SceneBack';
import { DispatchPocket } from './ReturnDispatch';
import { liveCircuit, signalReady, owns } from './model';
import { useId, useRef, useState } from 'react';
import { Photo, Touch } from './Photo';
import { lightPorts, shutterOptics, shutterSlotCenters } from './stopping';
import type { Action, State } from './model';
const unit = 10.25, origin = 322.5;
export function ShutterImage({ s, controls = false, dispatch }: {
    s: State;
    controls?: boolean;
    dispatch?: (a: Action) => void;
}) {
    const id = useId().replace(/:/g, ''), drag = useRef<{
        x: number;
        step: number;
        scale: number;
    } | null>(null);
    const fitted = signalReady(s), optics = shutterOptics(s.signals, fitted, liveCircuit(s));
    return <svg viewBox="0 0 1672 941" className="rm-object-overlay" style={{ touchAction: controls ? 'none' : undefined }} aria-label={'二枚の遮光羽根。' + (optics.aligned.every(Boolean) ? optics.powered ? '穴の奥に明るく光るガラスが見える。' : '穴の奥に鈍いガラスの反射が見える。' : '穴の奥は暗い。')}>
 <text x="733" y="647" textAnchor="middle" fontSize="30" fill="#c3bfae">{s.values.callService?.[0] ?? 1}</text><text x="970" y="591" textAnchor="middle" fontSize="17" fill="#999b8c">呼出</text><defs><clipPath id={id + 'cavity'}><rect x="381" y="281" width="909" height="226"/></clipPath>
 {[0, 1].map(plate => <mask key={plate} id={id + plate} maskUnits="userSpaceOnUse" x="300" y="270" width="1040" height="270"><rect x="300" y="270" width="1040" height="270" fill="white"/>{shutterSlotCenters(plate, s.signals.shutters[plate]).map(x => <rect key={x} x={origin + x * unit - 52} y="352" width="104" height="100" rx="4" fill="black"/>)}</mask>)}
 <linearGradient id={id + 'grip'} x2="0" y2="1"><stop stopColor="#818481"/><stop offset=".4" stopColor="#383c39"/><stop offset="1" stopColor="#161b19"/></linearGradient></defs>
    {fitted && <image href="/assets/remake/parts/retaining-pin.png" x="1284" y="264" width="54" height="234"/>}{[306, 465].map(y => <g key={y}><rect x="1287" y={y} width="51" height="22" rx="5" fill={'url(#' + id + 'grip)'} stroke="#777971"/><ellipse cx="1311" cy={y + 4} rx="8" ry="3" fill="#090e0c"/>{fitted && <rect x="1308" y={y - 4} width="6" height="12" fill="#575b55"/>}</g>)}
 <svg x="381" y="240" width="909" height="310" viewBox={`514 ${optics.powered ? 106 : 576} 643 179`} preserveAspectRatio="none" data-shutter-power={optics.powered} data-shutter-transmitted={optics.transmitted.every(Boolean)}>
 <image href="/assets/remake/signal/optical-backplate-v2.png" width="1672" height="941"/>
 </svg>
 {lightPorts.map((port, i) => <svg key={port} x={origin + port * unit - 62} y="340" width="124" height="124" viewBox={`${[689, 980][i] - 44} ${optics.powered ? 155 : 625} 88 88`} preserveAspectRatio="none">
 <image href="/assets/remake/signal/optical-backplate-v2.png" width="1672" height="941"/>
 </svg>)}
 {!fitted && <g stroke="#4c5149" fill="none" opacity=".7"><path d="M390 305H1278M390 487H1278"/>{[470, 1120].map(x => <g key={x}><path d={'M' + x + ' 307v178'}/><circle cx={x} cy="329" r="5"/><circle cx={x} cy="461" r="5"/></g>)}</g>}{fitted && <><g clipPath={'url(#' + id + 'cavity)'}>{[0, 1].map(plate => <g key={plate} mask={'url(#' + id + plate + ')'}><rect x="380" y="280" width="920" height="230" fill={plate ? '#343a39' : '#171c1c'}/><svg x={-230 + s.signals.shutters[plate] * unit * 10} y="280" width="1640" height="230" viewBox="60 205 2040 315" preserveAspectRatio="none" opacity={plate ? .75 : .5}><image href="/assets/remake/parts/shutter-blade.png" width="2172" height="724"/></svg></g>)}</g>
 {[0, 1].map(plate => {
                const step = s.signals.shutters[plate], x = origin + (18 + step * 10) * unit, y = plate ? 509 : 264;
                return <g key={plate} className="rm-shutter-grip" role={controls ? 'slider' : undefined} aria-orientation={controls ? 'horizontal' : undefined} tabIndex={controls ? 0 : undefined} aria-label={plate ? '手前の羽根' : '奥の羽根'} aria-valuemin={0} aria-valuemax={4} aria-valuenow={step} style={{ pointerEvents: controls ? 'auto' : 'none', cursor: 'ew-resize', touchAction: 'none' }} onKeyDown={e => {
                        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                            e.preventDefault();
                            dispatch?.({ type: 'shutter', plate: plate as 0 | 1, step: e.key === 'Home' ? 0 : e.key === 'End' ? 4 : Math.max(0, Math.min(4, step + (e.key === 'ArrowRight' ? 1 : -1))) });
                        }
                    }} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, step, scale: e.currentTarget.ownerSVGElement!.getBoundingClientRect().width / 1672 }; }} onPointerMove={e => {
                        if (drag.current) {
                            const d = drag.current;
                            dispatch?.({ type: 'shutter', plate: plate as 0 | 1, step: Math.max(0, Math.min(4, d.step + Math.round((e.clientX - d.x) / (unit * 10 * d.scale)))) });
                        }
                    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
 <title>持ち手を左右に動かす</title>{controls && <g pointerEvents="none" stroke="#8a8d7e" strokeWidth="1.3" opacity=".6"><path d={`M${origin + 18 * unit - 75} ${y}H${origin + 58 * unit + 75}`}/>{[0, 1, 2, 3, 4].map(n => <path key={n} d={`M${origin + (18 + n * 10) * unit} ${y - 17}v34`}/>)}</g>}
 <rect x={x - 70} y={y - 56} width="140" height="112" fill="transparent"/><rect x={x - 48} y={y - 10} width="96" height="20" rx="8" fill={'url(#' + id + 'grip)'} stroke="#828079" strokeWidth="1.5"/>{[0, 1, 2].map(n => <path key={n} d={`M${x - 10 + n * 10},${y - 5}v10`} stroke="#131817" strokeWidth="2"/>)}</g>;
            })}</>}
 <DispatchPocket /></svg>;
}
export function Shutter({ s, dispatch, reader, say, papers }: {
    s: State;
    dispatch: (a: Action) => void;
    reader: () => void;
    papers: () => void;
    say: (m: string) => void;
}) {
    const [detail, setDetail] = useState(false), fitted = signalReady(s);
    useSceneBack(detail, () => setDetail(false));
    const service = s.values.callService?.[0] ?? 1;
    const fit = () => {
        if (!fitted && !owns(s, 'hood')) {
            say('覆いがない。');
            return;
        }
        if (!fitted && !owns(s, 'retainingPin')) {
            say('右端の抜け止めを留められない。');
            return;
        }
        dispatch({ type: 'signalHood' });
    };
    return <div className="rm-shutter"><Photo src="/assets/remake/signal/housing.webp" label="停車灯へつながる遮光器" view={detail ? [330, 220, 1000, 360] : undefined}><ShutterImage s={s} controls dispatch={dispatch}/><Touch name={fitted ? '覆いを取り外す' : '覆いを取り付ける'} rect={[76, 28, 6, 27]} act={fit}/>{fitted && !detail && <Touch name="羽根を近くで見る" rect={[29, 35, 42, 14]} act={() => setDetail(true)}/>}{!detail && <><Touch name="呼出機の運行控" rect={[14, 75, 18, 24]} act={papers}/><Touch name="呼び出す便を選ぶ" rect={[40, 61, 8, 12]} act={() => dispatch({ type: 'values', id: 'callService', values: [service % 6 + 1] })}/><Touch name="呼出ボタンを押す" rect={[55, 62, 7, 10]} act={() => dispatch({ type: 'call', service })}/></>}</Photo>
 <div className="rm-document-controls"><button onClick={reader}>切符受けを見る</button></div>
 </div>;
}
