import { useId, useRef, useState } from 'react';
import type { PointerEvent, KeyboardEvent } from 'react';
import { CutShape } from './CutShape';
import { Photo } from './Photo';
import { expectedHoles, owns } from './model';
import type { State, Action } from './model';
import { fragmentInitial, fragmentOutlines, fragmentParts, fragmentRoutes, moveFragment, partCenters } from './ticketFragments';
export function FragmentArt({ id, back = false }: {
    id: number;
    back?: boolean;
}) {
    const key = useId().replaceAll(':', ''), sheet = Math.floor(id / 3), part = fragmentParts[id];
    return <g transform={back ? 'translate(480 0) scale(-1 1)' : undefined}>
    <defs><clipPath id={key + 'edge'}><polygon points={fragmentOutlines[part]}/></clipPath><mask id={key + 'holes'} maskUnits="userSpaceOnUse" x="0" y="0" width="480" height="235"><rect width="480" height="235" fill="white"/>{expectedHoles(fragmentRoutes[sheet]).filter(h => h.column >= 2).map(h => <g key={h.column} transform={`translate(${80 + (h.column - 2) * 160} ${h.side === 'white' ? 35 : 200})`}><CutShape cut={h} fill="black"/></g>)}</mask></defs>
    <g clipPath={'url(#' + key + 'edge)'} mask={'url(#' + key + 'holes)'}>
      <image href="/assets/remake/parts/photo-back.webp" width="480" height="235" preserveAspectRatio="none"/>
      <g stroke="#696753" fill="#565340" opacity={back ? .2 : .85} fontFamily="serif"><path d="M0 83H480M0 152H480M160 9V226M320 9V226" fill="none" strokeWidth=".8"/>{['Ⅲ', 'Ⅳ', 'Ⅴ'].map((s, i) => <text key={s} x={80 + i * 160} y="126" fontSize="24" textAnchor="middle" stroke="none">{s}</text>)}<text x="12" y="177" fontSize="12" stroke="none">再発行　0041</text></g>
      <g fill="none" stroke="#635540" opacity=".72" strokeWidth="1.5"><path d="M132 0C128 17 146 30 133 48L139 72M294 0C291 21 304 40 292 64"/>
        <path d={sheet === 0 ? 'M113 157C116 170 129 185 119 204S108 224 115 238M287 166C285 184 301 199 291 218L296 236' : 'M181 157C186 173 170 189 182 207S191 224 187 238M336 166C345 187 329 204 341 234'}/>
      </g><g fill="none" stroke="#a69773" strokeWidth=".7"><path d="M134 0C130 17 148 30 135 48L141 72M296 0C293 21 306 40 294 64"/><path d={sheet === 0 ? 'M115 157C118 170 131 185 121 204S110 224 117 238' : 'M183 157C188 173 172 189 184 207S193 224 189 238'}/></g>
    </g>
  </g>;
}
export function FragmentPile() { return <svg viewBox="0 0 300 160" role="img" aria-label="六枚の券の紙片"><g transform="translate(18 16) scale(.48)">{[2, 0, 4, 5, 1, 3].map((id, i) => <g key={id} transform={`translate(${i * 14} ${i * 18 - partCenters[fragmentParts[id]]}) rotate(${i % 2 ? 5 : -4} 240 117)`}><FragmentArt id={id}/></g>)}</g></svg>; }
export function FragmentLayout({ values }: {
    values: number[];
}) { return <svg viewBox="0 0 1100 734" className="rm-fragment-note" role="img" aria-label="記録した紙片の配置"><image href="/assets/remake/lost/table.webp" width="1100" height="734"/>{fragmentParts.map((p, id) => <g key={id} transform={`translate(${values[id * 4]} ${values[id * 4 + 1]}) rotate(${values[id * 4 + 2] * 180}) translate(-240 ${-partCenters[p]})`}><FragmentArt id={id} back={values[id * 4 + 3] === 1}/></g>)}</svg>; }
export function FragmentBoard({ s, dispatch, say, photos }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    photos: () => void;
}) {
    const poses = s.values.fragments ?? fragmentInitial;
    const [selected, setSelected] = useState<number | null>(null), [zoom, setZoom] = useState(false), [preview, setPreview] = useState<{
        id: number;
        pose: number[];
    } | null>(null);
    const svg = useRef<SVGSVGElement>(null), drag = useRef<{
        id: number;
        x: number;
        y: number;
        pose: number[];
        current: number[];
    } | null>(null);
    if (!owns(s, 'fragments'))
        return null;
    function point(e: PointerEvent) { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current!.getScreenCTM()!.inverse()); return p; }
    function update(id: number, pose: number[]) { dispatch({ type: 'fragmentMove', id, pose }); }
    function begin(e: PointerEvent, id: number) { e.stopPropagation(); const p = point(e), pose = poses.slice(id * 4, id * 4 + 4); setSelected(id); drag.current = { id, x: p.x, y: p.y, pose, current: pose }; svg.current!.setPointerCapture(e.pointerId); }
    function keyboard(e: KeyboardEvent, id: number) {
        const d = e.shiftKey ? 10 : 2, keys: Record<string, number[]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] };
        if (keys[e.key]) {
            e.preventDefault();
            const p = poses.slice(id * 4, id * 4 + 4);
            update(id, [p[0] + keys[e.key][0], p[1] + keys[e.key][1], p[2], p[3]]);
        }
        else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelected(id);
        }
    }
    const displayed = preview ? (() => { const v = [...poses]; v.splice(preview.id * 4, 4, ...preview.pose); return v; })() : poses;
    const order = [0, 1, 2, 3, 4, 5].filter(id => id !== selected);
    if (selected !== null)
        order.push(selected);
    return <section className="rm-fragment-board"><div className="rm-fragment-toolbar"><button onClick={() => setZoom(!zoom)} aria-pressed={zoom}>{zoom ? '全体を見る' : '紙片を拡大'}</button><div className="rm-fragment-selected"><button disabled={selected === null} onClick={() => { if (selected === null) return; const p = poses.slice(selected * 4, selected * 4 + 4); update(selected, [p[0], p[1], 1 - p[2], p[3]]); }}>半回転</button><button disabled={selected === null} onClick={() => { if (selected === null) return; const p = poses.slice(selected * 4, selected * 4 + 4); update(selected, [p[0], p[1], p[2], 1 - p[3]]); }}>裏返す</button></div><button onClick={() => { dispatch({ type: 'record', id: 'fragments', values: poses }); say('紙片の配置の写しを記録した。'); }}>配置の写しを残す</button></div>
    <div className={'rm-fragment-viewport' + (zoom ? ' is-zoomed' : '')}><svg ref={svg} viewBox="0 0 1100 734" className="rm-fragment-surface" aria-label="六枚の紙片を並べる比較台" onPointerMove={e => {
            const d = drag.current;
            if (!d)
                return;
            const p = point(e), v = moveFragment(poses, d.id, [d.pose[0] + p.x - d.x, d.pose[1] + p.y - d.y, d.pose[2], d.pose[3]], false);
            if (v) {
                d.current = v.slice(d.id * 4, d.id * 4 + 4);
                setPreview({ id: d.id, pose: d.current });
            }
        }} onPointerUp={() => {
            const d = drag.current;
            if (d)
                update(d.id, d.current);
            drag.current = null;
            setPreview(null);
        }} onPointerCancel={() => { drag.current = null; setPreview(null); }}>
      <image href="/assets/remake/lost/table.webp" width="1100" height="734" onPointerDown={e => {
            if (selected !== null) {
                const p = point(e), pose = poses.slice(selected * 4, selected * 4 + 4);
                update(selected, [p.x, p.y, pose[2], pose[3]]);
            }
        }}/>
      {order.map(id => <g key={id} role="button" tabIndex={0} aria-label={'紙片' + (id + 1)} aria-pressed={selected === id} className="rm-fragment-piece" transform={`translate(${displayed[id * 4]} ${displayed[id * 4 + 1]}) rotate(${displayed[id * 4 + 2] * 180}) translate(-240 ${-partCenters[fragmentParts[id]]})`} onPointerDown={e => begin(e, id)} onKeyDown={e => keyboard(e, id)}>
        <polygon points={fragmentOutlines[fragmentParts[id]]} transform={displayed[id * 4 + 3] ? 'translate(480 0) scale(-1 1)' : undefined} fill="transparent" stroke="transparent" strokeWidth={fragmentParts[id] === 1 ? 18 : 28}/>
        <g pointerEvents="none"><FragmentArt id={id} back={displayed[id * 4 + 3] === 1}/></g>
        {selected === id && <polygon points={fragmentOutlines[fragmentParts[id]]} transform={displayed[id * 4 + 3] ? 'translate(480 0) scale(-1 1)' : undefined} fill="none" stroke="#e7d2a0" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeDasharray="7 4" pointerEvents="none"/>}
      </g>)}
    </svg></div><div className="rm-fragment-picker">{[0, 1, 2, 3, 4, 5].map(id => <button key={id} aria-label={'紙片' + (id + 1) + 'を選ぶ'} aria-pressed={selected === id} onClick={() => setSelected(id)}><svg viewBox={`-10 ${partCenters[fragmentParts[id]] - 35} 500 70`}><FragmentArt id={id} back={poses[id * 4 + 3] === 1}/></svg></button>)}</div>
    <div className="rm-document-controls"><button onClick={photos}>同じ束の写真を見る</button></div><p className="rm-fragment-help">紙片を動かす・選んで置く。配置の写しは記録で見比べられる</p>
  </section>;
}
export function FragmentPhoto({ dispatch, say }: {
    dispatch?: (a: Action) => void;
    say?: (m: string) => void;
}) {
    return <section className="rm-fragment-photo"><figure className="rm-print"><Photo src="/assets/remake/journeys/f-white.webp" label="紙片と同じ束に残ったトンネルと標柱の車窓写真" zoomOrigin="56% 53%" zoomable limitZoomToSource zoomButtonOnly/></figure>{dispatch && <div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'fragmentPhoto', values: [] }); say?.('車窓の写真を記録した。'); }}>記録に残す</button></div>}</section>;
}
