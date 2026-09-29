import { useRef, useState } from 'react';
import { Photo } from './Photo';
import { cutPaths } from './ticketGeometry';
import { arrivalPhotos, initialPhotoOrder, observation } from './arrivalPhotos';
import type { Action, State } from './model';
const captions = ['雨の窓越しの石造りの坑口', '雨の窓越しの鉄塔と柱', '雨の窓越しの鉄塔と柱', '雨の窓越しの踏切'];
// Hidden columns are absent fragments, rather than blank unpunched cells.
export function PhotoBack({ index }: {
    index: number;
}) {
    const columns = arrivalPhotos[index].visible;
    const [zoom, setZoom] = useState(false);
    return <div className="rm-photo-back"><svg style={zoom ? { transform: 'scale(2)', transformOrigin: '50% 50%' } : undefined} viewBox="0 0 1000 563" role="img" aria-label="写真の裏に貼られた券の部分写し">
 <image href="/assets/remake/parts/photo-back.webp" width="1000" height="563" preserveAspectRatio="none"/>
 <g transform="translate(245 170) rotate(-2 250 100)" fill="#49473d" fontFamily="serif">
 <path d="M0 0 L497 3 L502 213 L6 208 Z" fill="#ccc6ae"/>
 <text x="250" y="34" textAnchor="middle" fontSize="19">通 過 記 録　写</text>
 {columns.map((column, i) => <g key={column} transform={`translate(${25 + i * 228} 50)`}>
 <rect width="224" height="142" fill="none" stroke="#686252" strokeWidth="2"/><path d="M0 33H224" stroke="#686252"/>
 <text x="112" y="24" textAnchor="middle" fontSize="22">{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][column]}</text>
 {observation(index, column) && <path transform="translate(112 91) scale(1.5)" d={cutPaths[column === 0 ? 'F' : column === 1 ? 'E' : 'B']} fill="#49473d"/>}
 </g>)}
 </g></svg><button className="rm-photo-zoom" aria-label={zoom ? '券の写しの全体を見る' : '券の写しを拡大する'} onClick={() => setZoom(!zoom)}><span aria-hidden="true">{zoom ? '−' : '＋'}</span></button></div>;
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
    const selected = s.values.photoSelected?.[0] ?? 0, compare = s.values.photoCompare?.[0] === 1, backs = s.values.photoBacks ?? [];
    const setSelected = (n: number) => dispatch({ type: 'values', id: 'photoSelected', values: [n] });
    const setCompare = (v: boolean) => dispatch({ type: 'values', id: 'photoCompare', values: [v ? 1 : 0] });
    const setBacks = (values: number[]) => dispatch({ type: 'values', id: 'photoBacks', values });
    const start = useRef<{
        index: number;
        x: number;
        y: number;
    } | null>(null);
    function move(index: number, target: number) {
        if (target < 0 || target >= order.length || target === index)
            return;
        const next = [...order], [card] = next.splice(index, 1);
        next.splice(target, 0, card);
        dispatch({ type: 'values', id: 'photoOrder', values: next });
        setSelected(target);
    }
    return <section className={'rm-photographs rm-arrival-photos ' + (compare ? 'rm-compare' : '')} aria-label="手元の写真">
 <div className="rm-print-table">{(compare ? order.map((_, i) => i) : [selected]).map(slot => {
            const index = order[slot], back = backs.includes(index);
            return <figure key={index} className="rm-print">
 {back ? <PhotoBack index={index}/> : <Photo src={`/assets/remake/documents/${arrivalPhotos[index].id}.webp`} label={captions[index]} zoomable/>}
 <figcaption><span className="rm-photo-position">{slot + 1}</span><button onClick={() => setBacks(back ? backs.filter(n => n !== index) : [...backs, index])}>{back ? '表を見る' : '裏を見る'}</button>
 <button aria-label={`${slot + 1}枚目を前へ`} disabled={slot === 0} onClick={() => move(slot, slot - 1)}>←</button>
 <button className="rm-card-grip" aria-label={`${slot + 1}枚目を移動`} onPointerDown={e => { start.current = { index: slot, x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerUp={e => {
                    const p = start.current;
                    start.current = null;
                    if (!p)
                        return;
                    const dx = e.clientX - p.x, dy = e.clientY - p.y;
                    if (Math.hypot(dx, dy) > 30)
                        move(p.index, p.index + (Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : Math.sign(dy)));
                }} onPointerCancel={() => { start.current = null; }} onKeyDown={e => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        move(slot, slot + (e.key === 'ArrowLeft' ? -1 : 1));
                    }
                }}>⠿</button>
 <button aria-label={`${slot + 1}枚目を後へ`} disabled={slot === 3} onClick={() => move(slot, slot + 1)}>→</button></figcaption></figure>;
        })}</div>
 <div className="rm-document-controls">{!compare && <><button aria-label="前の写真" onClick={() => setSelected((selected + 3) % 4)}>〈</button><button aria-label="次の写真" onClick={() => setSelected((selected + 1) % 4)}>〉</button></>}<button aria-pressed={compare} onClick={() => setCompare(!compare)}>{compare ? '一枚ずつ見る' : '並べて見る'}</button><button onClick={() => { dispatch({ type: 'record', id: 'arrivalPhotos', values: order }); say('この並びを記録した。'); }}>記録に残す</button></div>
 </section>;
}
