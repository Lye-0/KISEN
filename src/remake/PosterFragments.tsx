import { useId } from 'react';
import type { State, Action } from './model';
import { posters } from './posters';
export function Poster({ index, back = false }: {
    index: number;
    back?: boolean;
}) {
    const p = posters[index], id = useId().replace(/:/g, '');
    return <svg viewBox="0 0 240 360" aria-label={p.name + 'の紙の' + (back ? '裏' : '表')} role="img"><defs><clipPath id={id}><path d="M4 0L234 0L240 26L235 54L240 80L235 108L240 137L235 165L240 195L235 225L240 256L235 290L240 321L234 360H5L0 329L5 301L0 271L5 239L0 204L5 170L0 133L5 102L0 74L5 35Z"/></clipPath><mask id={id + 'm'}><rect width="240" height="360" fill="white"/>{p.left.map((v, i) => <circle key={'l' + i} cx="8" cy={v * 3.6} r="5" fill="black"/>)}{p.right.map((v, i) => <circle key={'r' + i} cx="232" cy={v * 3.6} r="5" fill="black"/>)}</mask></defs><g clipPath={'url(#' + id + ')'} mask={'url(#' + id + 'm)'} style={{ transform: back ? 'translateX(240px) scaleX(-1)' : undefined }}><image href="./assets/remake/parts/photo-back.webp" width="240" height="360" preserveAspectRatio="none"/>{!back && <><path d="M0 27H240M0 35H240" stroke="#917754" opacity=".65"/><text x="118" y="62" fill="#5f503c" fontFamily="Yu Mincho,serif" textAnchor="middle" fontSize="16">灯具保管</text><svg x="0" y="80" width="240" height="118" viewBox={index === 2 ? '0 0 836 941' : index === 0 ? '836 0 836 941' : index === 1 ? '220 0 836 941' : '650 0 836 941'} preserveAspectRatio="none"><image href="./assets/remake/lamp/path-closed.webp" width="1672" height="941"/></svg><g fill="#514733" fontFamily="Consolas,Menlo,monospace" style={{ fontVariantNumeric: 'slashed-zero' }} fontWeight="bold" fontSize="32" textAnchor="middle">{[0, 1, 2, 3].map(i => <g key={i}><text x="2" y={254 + i * 28}>{p.leftCode[i]}</text><text x="238" y={254 + i * 28}>{p.rightCode[i]}</text></g>)}</g></>}</g></svg>;
}
export function Posters({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const pair = s.values.posterPair ?? [0, 1], backs = s.values.posterBacks ?? [];
    const set = (i: number, n: number) => dispatch({ type: 'values', id: 'posterPair', values: pair.map((v, k) => k === i ? n : v) });
    return <section className="rm-posters"><div className="rm-poster-tray">{posters.map((p, i) => <button draggable onDragStart={e => e.dataTransfer.setData("text/plain", String(i))} key={p.name} aria-label={p.name + 'の紙を裏返す'} aria-pressed={backs.includes(i)} onClick={() => dispatch({ type: 'values', id: 'posterBacks', values: backs.includes(i) ? backs.filter(v => v !== i) : [...backs, i] })}><Poster index={i} back={backs.includes(i)}/><span>{p.name}　↶</span></button>)}</div><div className="rm-poster-pair">{pair.map((n, i) => <div key={i} onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault();
                const n = Number(e.dataTransfer.getData("text/plain"));
                if (Number.isInteger(n) && n >= 0 && n < 4)
                    set(i, n);
            }}><select aria-label={(i ? '右' : '左') + 'へ置く紙'} value={n} onChange={e => set(i, +e.target.value)}>{posters.map((p, k) => <option key={p.name} value={k}>{p.name}</option>)}</select><Poster index={n} back={backs.includes(n)}/></div>)}</div><div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'posters', values: [...pair, ...backs] }); say('紙の配置を記録した。'); }}>配置を記録する</button></div></section>;
}
export function PosterNote({ values }: {
    values: number[];
}) { return <div className="rm-poster-pair">{values.slice(0, 2).map((n, i) => <Poster key={i} index={n} back={values.slice(2).includes(n)}/>)}</div>; }
