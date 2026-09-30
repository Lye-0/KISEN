import { useId, useRef, useState } from 'react';
import { Photo } from './Photo';
import { nodes, trace } from './model';
import type { Action, State, Node } from './model';
import { cutPaths } from './ticketGeometry';
import { pointBearings, pointPositions, leverY, pointNames, pointLocked } from './pointMechanics';
import { useCompact } from './useCompact';
export function pointPhoto(node: Node, position: number) { return '/assets/remake/points/' + (node === 'E' ? 'wye-' : 'regular-') + position + '.webp'; }
function PointBank({ s, dispatch, say, only }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (v: string) => void;
    only?: number;
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
   <g role="slider" tabIndex={0} className="rm-point-grip" aria-label={pointNames[node] + 'の分岐レバー'} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={['Ⅰ', 'Ⅱ', 'Ⅲ'][value]} aria-disabled={locked} onKeyDown={e => {
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
   </g>
  </g>;
        })}
 </svg></Photo>;
}
export function PointControls({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (v: string) => void;
}) {
    const compact = useCompact(), index = s.values.pointSelected?.[0] ?? 0, node = nodes[index];
    const [close, setClose] = useState(compact), [observe, setObserve] = useState(false), [railDetail, setRailDetail] = useState(-1);
    const value = s.route[index], used = trace(s.route).path, locked = pointLocked(s, index, used);
    const views: [
        number,
        number,
        number,
        number
    ][] = node === 'E' ? [[180, 475, 500, 350], [1050, 475, 500, 350], [680, 0, 330, 290]] : [[625, 300, 430, 450]];
    const change = (n: number) => {
        if (locked) {
            say('留め金が下りている。');
            return;
        }
        dispatch({ type: 'route', index, value: Math.max(0, Math.min(pointPositions(node) - 1, n)) });
    };
    return <section className={'rm-points' + (observe ? ' observing' : '')} aria-label="北ホームの分岐操作器">
  <nav className="rm-point-tabs" aria-label="レバーを選ぶ">{nodes.map((n, i) => <button key={n} aria-label={pointNames[n] + 'のレバーを見る'} aria-pressed={i === index} onClick={() => { dispatch({ type: 'values', id: 'pointSelected', values: [i] }); setClose(true); setRailDetail(-1); }}><svg viewBox="-24 -24 48 48" aria-hidden="true"><path d={cutPaths[n]} fill="currentColor"/></svg></button>)}</nav>
  <div className="rm-point-layout"><div className={"rm-point-bank" + (close || observe ? " close" : "")}><PointBank s={s} dispatch={dispatch} say={say} only={close || observe ? index : undefined}/></div>
  {observe && <div className="rm-point-rail" style={railDetail >= 0 ? { width: `min(${views[railDetail][2]}px,65vw)` } : undefined}><Photo src={pointPhoto(node, value)} view={railDetail < 0 ? undefined : views[railDetail]} label="分岐のレールと現在の舌レール"/></div>}</div>
  <div className="rm-document-controls">
   {(close || observe) && <><button onClick={() => change(value - 1)} disabled={value === 0}>レバーを引く</button><button onClick={() => change(value + 1)} disabled={value === pointPositions(node) - 1}>押し戻す</button></>}
   {!observe && <button onClick={() => setClose(!close)}>{close ? '六本を見る' : '選んだレバーへ寄る'}</button>}
   <button onClick={() => { setObserve(!observe); setRailDetail(-1); }}>{observe ? '操作器だけ見る' : 'レールを見る'}</button>
   {observe && <><button onClick={() => setRailDetail(railDetail < 0 ? 0 : -1)}>{railDetail < 0 ? '接触部へ寄る' : '分岐全体を見る'}</button>{node === 'E' && railDetail >= 0 && <button onClick={() => setRailDetail((railDetail + 1) % 3)}>次の接触部</button>}</>}
   <button onClick={() => { dispatch({ type: 'record', id: 'point-observation-' + index, values: [index, value] }); say('操作器の位置を記録した。'); }}>記録に残す</button><button onClick={() => dispatch({ type: "look", camera: 0 })}>ホームの灯へ</button>
  </div>
 </section>;
}
export function PointNote({ values }: {
    values: number[];
}) {
    const [index, value] = values, node = nodes[index];
    return <div className="rm-point-note"><svg viewBox="-24 -24 48 48" aria-label={pointNames[node] + 'の刻印'}><path d={cutPaths[node]} fill="currentColor"/></svg><p>{['Ⅰ', 'Ⅱ', 'Ⅲ'][value]}</p><img src={pointPhoto(node, value)} alt="記録した位置のレール"/></div>;
}
