import { PointConnection } from './PointConnection';
import { useId, useRef } from 'react';
import { Photo, Touch } from './Photo';
import { nodes, trace } from './model';
import type { Action, State, Node } from './model';
import { cutPaths } from './ticketGeometry';
import { pointBearings, pointPositions, leverY, pointNames, pointLocked } from './pointMechanics';
import type { Focus } from './World';
export function pointPhoto(node: Node, position: number) { return '/assets/remake/points/' + (node === 'E' ? 'wye-' : 'regular-') + position + '.webp'; }
function PointBank({ s, dispatch, say, only, inspectLever, inspectWhole }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (v: string) => void;
    only?: number;
    inspectLever?: (index: number) => void;
    inspectWhole?: () => void;
}) {
    const id = useId().replaceAll(':', '');
    const drag = useRef<{
        index: number;
        y: number;
        position: number;
        scale: number;
    } | null>(null);
    const used = trace(s.route).path;
    const change = (index: number, value: number) => {
        if (pointLocked(s, index, used)) {
            say('留め金が下りている。');
            return;
        }
        dispatch({ type: 'values', id: 'pointSelected', values: [index] });
        dispatch({ type: 'route', index, value: Math.max(0, Math.min(pointPositions(nodes[index]) - 1, value)) });
    };
    const selected = only === undefined ? nodes.map((_, i) => i) : [only];
    return <Photo src="/assets/remake/points/bank.webp" view={only === undefined ? undefined : [pointBearings[only] - 105, 280, 210, 440]} label="六本の分岐レバーと図形の刻印">
 <svg className="rm-object-overlay" viewBox="0 0 1672 941">
 {selected.map(index => {
            const node = nodes[index], x = pointBearings[index], value = s.route[index], y = leverY(node, value), max = pointPositions(node) - 1, locked = pointLocked(s, index, used);
            return <g key={node}>
   <path d={cutPaths[node]} transform={`translate(${x} 646) scale(.65)`} fill="#33291b" opacity=".8"/>
   <text x={x} y="309" textAnchor="middle" fontSize="18" fontFamily="serif" fill="#2c2419" opacity=".8">{['Ⅰ', 'Ⅱ', 'Ⅲ'][value]}</text>
   <ellipse cx={x} cy="582" rx="19" ry="17" fill="#131812"/><path d={`M${x + 7} 582V${y + 28}`} stroke="#000" strokeWidth="16" strokeOpacity=".35" transform="translate(3 2)"/>
                    <image href="/assets/remake/parts/point-shaft.png" x={x - 7} y={y + 20} width="14" height={582 - y - 20} preserveAspectRatio="none" style={{ filter: 'brightness(.65) blur(.18px)' }}/>
   <image href="/assets/remake/parts/point-grip.png" x={x - 53} y={y - 19} width="106" height="40" preserveAspectRatio="none" style={{ filter: 'brightness(.7) drop-shadow(3px 4px 2px #0009)' }}/>
   {locked && <g><g transform={`translate(${x - 58} 560) rotate(-90)`}><image href="/assets/remake/parts/point-shaft.png" x="-8" y="0" width="16" height="116" preserveAspectRatio="none" style={{ filter: 'brightness(.65) drop-shadow(-2px 2px 1px #000b)' }}/></g><defs><clipPath id={id + 'lock' + index}><circle cx={x + 62} cy="560" r="12"/></clipPath></defs><image href="/assets/remake/points/bank.webp" x={x + 62 - 416} y={560 - 316} width="1672" height="941" clipPath={'url(#' + id + 'lock' + index + ')'}/></g>}
   {!inspectWhole && <g role="slider" tabIndex={0} className="rm-point-grip" aria-label={pointNames[node] + 'の分岐レバー'} aria-orientation="vertical" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={['Ⅰ', 'Ⅱ', 'Ⅲ'][value]} aria-disabled={locked} onKeyDown={e => {
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                        e.preventDefault();
                        change(index, e.key === 'Home' ? 0 : e.key === 'End' ? max : value + (['ArrowUp', 'ArrowLeft'].includes(e.key) ? -1 : 1));
                    }
                }} onPointerDown={e => {
                    if (locked) {
                        say('留め金が下りている。');
                        return;
                    }
                    e.currentTarget.setPointerCapture(e.pointerId);
                    drag.current = { index, y: e.clientY, position: value, scale: e.currentTarget.ownerSVGElement!.getBoundingClientRect().width / 1672 };
                }} onPointerMove={e => {
                    const d = drag.current;
                    if (d?.index === index)
                        change(index, d.position + Math.round((e.clientY - d.y) / ((node === 'E' ? 56 : 112) * d.scale)));
                }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
    <rect x={x - 75} y="335" width="150" height="275" fill="transparent"/>
   </g>}
   {inspectLever && <g role="button" tabIndex={0} className="rm-point-base" aria-label={pointNames[node] + 'のレバーを詳しく見る'} onClick={() => inspectLever(index)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inspectLever(index); } }}><rect x={x - 100} y="615" width="200" height="200" fill="transparent"/></g>}
  </g>;
        })}
 </svg>{inspectWhole && <Touch name="分岐操作器を調べる" rect={[13, 29, 76, 63]} act={inspectWhole}/>}</Photo>;
}
export function PointBankScene({ s, inspect }: { s: State; inspect: () => void }) {
    return <PointBank s={s} dispatch={() => {}} say={() => {}} inspectWhole={inspect}/>;
}
export function PointControls({ s, dispatch, say, inspect, detail = false, slipOnly = false }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (v: string) => void;
    inspect: (focus: Focus) => void;
    detail?: boolean;
    slipOnly?: boolean;
}) {
    const index = s.values.pointSelected?.[0] ?? 0, node = nodes[index], value = s.route[index];
    if (slipOnly) return <section className="rm-point-sheet-view"><PointConnection node={node} position={value}/></section>;
    const select = (i: number) => { dispatch({ type: 'values', id: 'pointSelected', values: [i] }); inspect('pointDetail'); };
    return <section className={'rm-points-direct' + (detail ? ' is-detail' : '')} aria-label="北ホームの分岐操作器">
        {detail ? <div className="rm-point-direct-layout">
            <div className="rm-direct-lever"><PointBank s={s} dispatch={dispatch} say={say} only={index}/></div>
            <button className="rm-direct-sheet" aria-label="操作札を大きく見る" onClick={() => inspect('pointSlip')}><PointConnection node={node} position={value}/></button>
            <div className="rm-direct-rail"><Photo src={pointPhoto(node, value)} label="選んだレバーにつながるレールの現在の状態" zoomable limitZoomToSource/></div>
        </div> : <div className="rm-point-overview"><PointBank s={s} dispatch={dispatch} say={say} inspectLever={select}/></div>}
        <div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'point-observation-' + index, values: [index, value] }); say('操作器の位置を記録した。'); }}>記録に残す</button></div>
    </section>;
}
export function PointNote({ values }: {
    values: number[];
}) {
    const [index, value] = values, node = nodes[index];
    return <div className="rm-point-note"><svg viewBox="-24 -24 48 48" aria-label={pointNames[node] + 'の刻印'}><path d={cutPaths[node]} fill="currentColor"/></svg><p>{['Ⅰ', 'Ⅱ', 'Ⅲ'][value]}</p><PointConnection node={node} position={value}/><img src={pointPhoto(node, value)} alt="記録した位置のレール"/></div>;
}
