import { useSceneBack } from './SceneBack';
import { useCompact } from './useCompact';
import { useState } from 'react';
import { sketchPlaces, sketchPositions, sketchPrintedEdges } from './sketchGraph';
import { cutPaths } from './ticketGeometry';
import type { State, Action, Node } from './model';
const names = { O: '白沢側', D: '鉄塔', B: '給水槽', A: '踏切', S: 'きさらぎ', E: '分岐橋', F: '坑口', C: '保守小屋', R: '東線' };
const kinds = ['線をつなぐ', '交差を書き込む', '閉塞を書き込む'];
export function SketchPaper({ edges, selected, onChoose }: {
    edges: number[];
    selected?: number | null;
    onChoose?: (i: number) => void;
}) {
    const path = (a: number, b: number) => { const p = sketchPositions[a], q = sketchPositions[b]; return a === 6 && b === 8 ? 'M300 400C160 255 420 20 1050 125' : a === 1 && b === 6 ? 'M260 720C180 640 190 520 300 400' : `M${p.join(' ')}L${q.join(' ')}`; };
    return <svg viewBox="0 0 1200 900" className="rm-sketch-paper" aria-label="路線の略図と自分の書き込み"><image href="/assets/remake/parts/photo-back.webp" width="1200" height="900" preserveAspectRatio="none"/><g stroke="#665e46" strokeWidth="2" fill="none">{sketchPrintedEdges.map(([a, b]) => <path key={a + ':' + b} d={path(a, b)}/>)}<path d="M760 165L300 460" strokeDasharray="7 7" opacity=".55"/></g><g fill="#59533f" fontFamily="serif"><text x="60" y="65" fontSize="29">沿線略図</text><text x="60" y="850" fontSize="20">縮尺不同　／　鉛筆で追記</text><path d="M1130 235V160M1118 178L1130 160L1142 178" fill="none" stroke="#59533f" strokeWidth="2"/><text x="1130" y="145" fontSize="22" textAnchor="middle">北</text></g><g fill="none" strokeWidth="4.2" strokeLinecap="round">{Array.from({ length: edges.length / 3 }, (_, i) => { const [a, b, k] = edges.slice(i * 3, i * 3 + 3), p = sketchPositions[a], q = sketchPositions[b], x = (p[0] + q[0]) / 2, y = (p[1] + q[1]) / 2; return <g key={a + ':' + b} stroke={k === 2 ? '#783c32' : '#394859'}><path d={path(a, b)} strokeDasharray={k === 1 ? '12 8' : undefined}/>{k !== 0 && <path d={k === 1 ? `M${x - 17} ${y + 8}Q${x} ${y - 26} ${x + 17} ${y + 8}` : `M${x - 13} ${y - 13}L${x + 13} ${y + 13}M${x - 13} ${y + 13}L${x + 13} ${y - 13}`}/>}</g>; })}</g>{sketchPlaces.map((n, i) => {
            const [x, y] = sketchPositions[i];
            const isNode = 'ABCDEF'.includes(n);
            return <g key={n} transform={`translate(${x} ${y})`} role={onChoose ? 'button' : undefined} tabIndex={onChoose ? 0 : undefined} aria-label={onChoose ? names[n] + 'に書き込む' : undefined} aria-pressed={onChoose ? selected === i : undefined} onClick={() => onChoose?.(i)} onKeyDown={e => {
                    if (onChoose && ['Enter', ' '].includes(e.key)) {
                        e.preventDefault();
                        onChoose(i);
                    }
                }} className={onChoose ? 'rm-sketch-place' : undefined}><circle r="28" fill="#d5cdb2" stroke={selected === i ? '#394859' : '#6b654d'} strokeWidth={selected === i ? 4 : 1.5}/>{isNode ? <path d={cutPaths[n as Node]} fill="#555442"/> : <text y="9" textAnchor="middle" fill="#555442" fontFamily="serif" fontSize="27">{n}</text>}<text y="61" textAnchor="middle" fontFamily="serif" fontSize="23" fill="#504a37">{names[n]}</text>{onChoose && <rect x="-36" y="-36" width="72" height="72" fill="transparent"/>}</g>;
        })}</svg>;
}
export function RouteSketch({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const compact = useCompact();
    const [first, setFirst] = useState<number | null>(null), [kind, setKind] = useState(0), [close, setClose] = useState(compact);
    const edges = s.values.sketchEdges ?? [];
    const choose = (i: number) => {
        if (first === null || first === i) {
            setFirst(first === i ? null : i);
            return;
        }
        dispatch({ type: 'sketch', a: first, b: i, kind });
        setFirst(null);
    };
    useSceneBack(close, () => setClose(false));
    return <section className={'rm-route-sketch' + (close ? ' close' : '')}><div className="rm-sketch-scroll"><SketchPaper edges={edges} selected={first} onChoose={choose}/></div><div className="rm-document-controls"><label className="rm-sketch-kind">書き込み <select aria-label="書き込みの種類" value={kind} onChange={e => { setKind(Number(e.target.value)); setFirst(null); }}>{kinds.map((label, i) => <option key={label} value={i}>{label}</option>)}</select></label>{!close && <button onClick={() => setClose(true)}>図を広げる</button>}<button onClick={() => { dispatch({ type: 'record', id: 'routeSketch', values: edges }); say('略図への書き込みを記録した。'); }}>記録する</button></div></section>;
}
export function SketchNote({ values }: {
    values: number[];
}) { return <div className="rm-sketch-note"><SketchPaper edges={values}/></div>; }
