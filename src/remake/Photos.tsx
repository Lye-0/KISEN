import { useSceneBack } from './SceneBack';
import { TicketDecoration } from './TicketDecoration';
import { PaperEdgeFilter } from './PaperEdgeFilter';
import { MaintenanceMap } from './MaintenanceMap';
import { owns } from './model';
import { useEffect, useId, useRef, useState } from 'react';
import { Photo } from './Photo';
import { cutPaths } from './ticketGeometry';
import { arrivalPhotos, initialPhotoOrder, observation } from './arrivalPhotos';
import type { Action, State } from './model';
const captions = ['雨の窓越しの石造りの坑口', '雨の窓越しの鉄塔と柱', '雨の窓越しの鉄塔と柱', '雨の窓越しの踏切'];
// Hidden columns are absent fragments, rather than blank unpunched cells.
export function PhotoBack({ index, onInspect }: {
    index: number;
    onInspect?: () => void;
}) {
    const columns = arrivalPhotos[index].visible;
    const id = useId().replaceAll(':', '');
    const slip = 'M0 0 L497 3 L502 213 L6 208 Z';
    const holes = columns.flatMap((column, i) => observation(index, column) ? [{ x: 137 + i * 228, path: cutPaths[column === 0 ? 'F' : column === 1 ? 'E' : 'B'] }] : []);
    const [zoom, setZoom] = useState(false);
    useSceneBack(zoom, () => setZoom(false), 40);
    return <div className="rm-photo-back"><svg style={zoom ? { transform: 'scale(2)', transformOrigin: '50% 50%' } : undefined} viewBox="0 0 1000 563" role="img" aria-label="写真の裏に貼られた券の部分写し">
 <image href="/assets/remake/parts/photo-back.webp" width="1000" height="563" preserveAspectRatio="none"/>
 <g transform="translate(245 170) rotate(-2 250 100)" fill="#49473d" fontFamily="serif">
 <defs><PaperEdgeFilter id={id + 'edge'}/><mask id={id + 'slip'} maskUnits="userSpaceOnUse" x="-5" y="-5" width="515" height="225"><path d={slip} fill="white"/>{holes.map((hole, i) => <path key={i} transform={`translate(${hole.x} 141) scale(1.5)`} d={hole.path} fill="black"/>)}</mask></defs>
 <g filter={`url(#${id}edge)`}><g mask={`url(#${id}slip)`}>
 <image href="/assets/remake/parts/photo-back.webp" width="502" height="213" preserveAspectRatio="none"/><path d={slip} fill="#c9ac77" opacity=".18"/><TicketDecoration id={id} width={502} height={213}/>
 <text x="250" y="35" textAnchor="middle" fontSize="19" fontWeight="bold" letterSpacing="2">普通乗車券　部分写</text>
 {columns.map((column, i) => <g key={column} transform={`translate(${25 + i * 228} 50)`}>
 <rect width="224" height="142" fill="none" stroke="#686252" strokeWidth="2"/><path d="M0 33H224" stroke="#686252"/>
 <text x="112" y="24" textAnchor="middle" fontSize="22">{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][column]}</text>
 </g>)}
 </g></g></g></svg><button className="rm-photo-zoom" aria-label={zoom ? '券の写しの全体を見る' : '券の写しを拡大する'} onClick={() => onInspect ? onInspect() : setZoom(!zoom)}><span aria-hidden="true">{zoom ? '−' : '＋'}</span></button></div>;
}
export function PhotoRecord({ order }: {
    order: number[];
}) {
    return <div className="rm-photo-record">{order.map((index, slot) => <figure key={index}><img src={`/assets/remake/documents/${arrivalPhotos[index].id}.webp`} alt={captions[index]}/><figcaption>{slot + 1}</figcaption></figure>)}</div>;
}
export function Photos({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (message: string) => void;
}) {
    const order = s.values.photoOrder ?? initialPhotoOrder;
    const [mapOpen, setMapOpen] = useState(false), [compareOpen, setCompare] = useState(true);
    const showMap = owns(s, 'envelope') && mapOpen;
    const selected = s.values.photoSelected?.[0] ?? 0, compare = !showMap && compareOpen, backs = s.values.photoBacks ?? [];
    const setSelected = (n: number) => dispatch({ type: 'values', id: 'photoSelected', values: [n] });
    const setBacks = (values: number[]) => dispatch({ type: 'values', id: 'photoBacks', values });
    useSceneBack(mapOpen || !compareOpen, () => { setMapOpen(false); setCompare(true); }, 10);
    const viewer = useRef<HTMLElement>(null);
    const cards = useRef<HTMLDivElement>(null);
    const start = useRef<{ index: number; x: number; y: number; moved: boolean } | null>(null);
    const suppressClick = useRef(false);
    const [picked, setPicked] = useState<number | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const [target, setTarget] = useState<number | null>(null);
    const pointer = useRef({ x: 0, y: 0 });
    function targetAt(x: number, y: number) {
        const bounds = viewer.current?.getBoundingClientRect();
        if (!bounds || x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) return null;
        const card = Array.from(cards.current?.querySelectorAll<HTMLElement>('[data-photo-slot]') ?? []).find(el => {
            const r = el.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });
        return card ? Number(card.dataset.photoSlot) : null;
    }
    useEffect(() => {
        if (dragging === null) return;
        let frame = 0, previous = 0;
        const scroll = (time: number) => {
            const el = viewer.current, p = pointer.current;
            if (el && start.current?.moved) {
                const r = el.getBoundingClientRect();
                const direction = p.x < r.left || p.x > r.right || p.y < r.top || p.y > r.bottom ? 0 : p.y < r.top + 56 ? -1 : p.y > r.bottom - 56 ? 1 : 0;
                if (direction) {
                    el.scrollTop += direction * Math.min(time - (previous || time), 32) * .45;
                    setTarget(targetAt(p.x, p.y));
                }
            }
            previous = time;
            frame = requestAnimationFrame(scroll);
        };
        frame = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(frame);
    }, [dragging]);
    useEffect(() => { setPicked(null); setTarget(null); setDragging(null); start.current = null; }, [compare]);
    function cancel() {
        start.current = null;
        setDragging(null);
        setTarget(null);
    }
    function move(index: number, destination: number) {
        if (destination < 0 || destination >= order.length || destination === index) return;
        const next = [...order];
        [next[index], next[destination]] = [next[destination], next[index]];
        dispatch({ type: 'values', id: 'photoOrder', values: next });
        setSelected(destination);
        setPicked(null);
    }
    return <section ref={viewer} className={'rm-photographs rm-arrival-photos ' + (compare ? 'rm-compare' : '') + (showMap ? ' rm-with-map' : '')} aria-label="手元の写真">
 <div className={showMap ? 'rm-photo-map-layout' : undefined}><div className={showMap ? 'rm-photo-map-photo' : undefined}><div ref={cards} className="rm-print-table">{(compare ? order.map((_, i) => i) : [selected]).map(slot => {
            const index = order[slot], back = backs.includes(index);
            return <figure key={index} data-photo-slot={slot} className={"rm-print" + (dragging === slot ? " rm-card-dragging" : "") + (picked === slot ? " rm-card-picked" : "") + (target === slot && dragging !== slot ? " rm-card-drop-target" : "")}>
 {back ? <PhotoBack index={index} onInspect={compare ? () => { setSelected(slot); setCompare(false); } : undefined}/> : <Photo src={`/assets/remake/documents/${arrivalPhotos[index].id}.webp`} label={captions[index]} zoomable onInspect={compare ? () => { setSelected(slot); setCompare(false); } : undefined}/>}
 <figcaption><span className="rm-photo-position">{slot + 1}</span><button onClick={() => setBacks(back ? backs.filter(n => n !== index) : [...backs, index])}>{back ? '表を見る' : '裏を見る'}</button>
 {compare && <button className="rm-card-grip" aria-label={`${slot + 1}枚目を移動`} aria-pressed={picked === slot} aria-describedby="rm-photo-move-help" onPointerDown={e => {
                    if (!e.isPrimary || e.button !== 0) return;
                    suppressClick.current = false;
                    start.current = { index: slot, x: e.clientX, y: e.clientY, moved: false };
                    pointer.current = { x: e.clientX, y: e.clientY };
                    setDragging(slot);
                    e.currentTarget.setPointerCapture(e.pointerId);
                }} onPointerMove={e => {
                    const p = start.current;
                    if (!p) return;
                    pointer.current = { x: e.clientX, y: e.clientY };
                    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 6) p.moved = true;
                    if (p.moved) setTarget(targetAt(e.clientX, e.clientY));
                }} onPointerUp={e => {
                    const p = start.current;
                    if (!p) return;
                    const destination = targetAt(e.clientX, e.clientY);
                    suppressClick.current = p.moved;
                    if (p.moved) {
                        setPicked(null);
                        if (destination !== null) move(p.index, destination);
                    }
                    cancel();
                    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
                }} onPointerCancel={() => { suppressClick.current = true; cancel(); setPicked(null); }} onLostPointerCapture={cancel} onClick={() => {
                    if (suppressClick.current) { suppressClick.current = false; return; }
                    if (picked !== null && picked !== slot) move(picked, slot);
                    else setPicked(picked === slot ? null : slot);
                }} onKeyDown={e => {
                    if (e.key === 'Escape') { cancel(); setPicked(null); return; }
                    const columns = 2;
                    const destination = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : e.key === 'ArrowLeft' ? slot - 1 : e.key === 'ArrowRight' ? slot + 1 : e.key === 'ArrowUp' ? slot - columns : e.key === 'ArrowDown' ? slot + columns : null;
                    if (destination !== null) { e.preventDefault(); move(slot, destination); }
                }}>⠿</button>}</figcaption></figure>;
        })}</div>{showMap && <nav className="rm-photo-browse" aria-label="写真を選ぶ"><button onClick={() => setSelected((selected + 3) % 4)}>前の写真</button><button onClick={() => setSelected((selected + 1) % 4)}>次の写真</button></nav>}</div>{showMap && <MaintenanceMap embedded/>}</div>
 {compare && <p id="rm-photo-move-help" className="rm-photo-move-help">⠿をドラッグ、または選んでから移動先の⠿を押す</p>}
 <div className="rm-document-controls">{owns(s, 'envelope') && <button aria-pressed={showMap} onClick={() => { setMapOpen(!showMap); setCompare(showMap); }}>{showMap ? '写真だけを見る' : '略図と見比べる'}</button>}<button onClick={() => { dispatch({ type: 'record', id: 'arrivalPhotos', values: order }); say('この並びを記録した。'); }}>記録に残す</button></div>
 </section>;
}
