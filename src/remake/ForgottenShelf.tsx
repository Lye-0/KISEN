import { useSceneBack } from './SceneBack';
import { FragmentPile } from './FragmentBoard';
export { FragmentPile } from './FragmentBoard';
import { useId, useState } from 'react';
import { Photo, Touch } from './Photo';
import { Clock, ClockHands } from './Clock';
import { propertyReceipts, receiptInitial, receiptTrayReleases } from './lostProperty';
import type { Action, State } from './model';
export function PropertyReceipt({ id }: {
    id: number;
}) {
    const r = propertyReceipts[id], clip = useId().replaceAll(':', ''), color = { blue: '#25466a', red: '#7d342b', clear: '#aca794', black: '#282a26' }[r.color];
    return <svg viewBox="0 0 340 230" role="img" aria-label={r.label + 'の傘、' + Math.floor(r.minutes / 60) + '時' + r.minutes % 60 + '分、' + (r.clock === 'office' ? '室内' : 'ホーム') + '時計'}><defs><mask id={clip}><rect width="340" height="230" fill="white"/>{r.cuts.map(n => <rect key={n} x={40 + n * 60} y="207" width="20" height="25" fill="black"/>)}</mask></defs><g mask={'url(#' + clip + ')'}><image href="/assets/remake/parts/photo-back.webp" width="340" height="230" preserveAspectRatio="none"/><path d="M18 49H322M19 195H321" stroke="#8a806b"/><g fill="#4d4537" fontFamily="serif"><text x="22" y="34" fontSize="25">受取票</text><text x="319" y="34" textAnchor="end" fontSize="20">9月8日</text><text x="95" y="88" fontSize="22">{r.feature}</text><text x="95" y="143" fontSize="42">{Math.floor(r.minutes / 60)}:{String(r.minutes % 60).padStart(2, '0')}</text><text x="95" y="179" fontSize="22">{r.clock === 'office' ? '室内時計' : 'ホーム時計'}</text></g><g stroke={color} strokeWidth="5" fill="none"><path d={r.color === 'red' ? 'M35 100V70H66V84' : 'M35 100V82C35 63 66 63 66 83'}/><path d="M35 100L20 175H71L55 100Z" fill={color} opacity={r.color === 'clear' ? .3 : .8}/>{r.color === 'clear' && <path d="M38 101L29 174M47 101L54 174" strokeWidth="2"/>}{r.color === 'black' && <path d="M23 142L61 152M30 140L27 148M43 143L40 153M55 147L52 157" stroke="#bfb095" strokeWidth="2"/>}</g></g></svg>;
}
const positions = [[471, 91, 300, 204], [875, 91, 300, 204], [465, 380, 305, 207], [876, 380, 305, 207]];
export function ReceiptTray({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const [selected, setSelected] = useState<number | null>(null), slots = s.values.receiptSlots ?? receiptInitial, open = s.values.receiptOpen?.[0] === 1;
    const place = (slot: number, id = selected) => {
        if (open)
            return;
        if (id !== null) {
            dispatch({ type: 'receiptPlace', receipt: id, slot });
            setSelected(slots[slot] >= 0 && slots[slot] !== id ? slots[slot] : null);
        }
        else if (slots[slot] >= 0) {
            dispatch({ type: 'receiptRemove', slot });
            setSelected(slots[slot]);
        }
    };
    return <section className="rm-receipt-tray"><Photo src={'/assets/remake/lost/tray-' + (open ? 'open' : 'closed') + '.webp'} label="四つの受取票の差し口と連動した引出し" view={[350, 0, 950, 941]} zoomable limitZoomToSource zoomButtonOnly zoomOrigin="49% 38%"><svg className="rm-object-overlay" viewBox="0 0 1672 941"><ReceiptBoardImage s={s}/></svg>{positions.map(([x, y, w, h], i) => <button key={i} className="rm-touch rm-receipt-slot" style={{ left: x / 16.72 + '%', top: y / 9.41 + '%', width: w / 16.72 + '%', height: h / 9.41 + '%' }} aria-label={['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i] + 'の差し口' + (slots[i] >= 0 ? '、' + propertyReceipts[slots[i]].label + 'の票' : '、空')} disabled={open} draggable={!open && slots[i] >= 0} onDragStart={e => { setSelected(slots[i]); e.dataTransfer.setData('text/plain', String(slots[i])); }} onClick={() => place(i)} onDragOver={e => e.preventDefault()} onDrop={e => {
                e.preventDefault();
                const raw = e.dataTransfer.getData('text/plain');
                const value = raw.trim() ? Number(raw) : NaN;
                if (Number.isInteger(value))
                    place(i, value);
            }}/>)}<Touch name={open ? '受取棚の引出しを閉じる' : '受取棚の留めを引く'} rect={[41, 64, 17, 20]} act={() => {
            if (!open && !receiptTrayReleases(slots)) {
                say('差し口の下で留めが当たる。');
                return;
            }
            dispatch({ type: 'receiptTray' });
        }}/>{open && s.locations.fragments === 'lostDrawer' && <Touch name="引出しの券の断片を取る" rect={[34, 80, 31, 20]} act={() => { dispatch({ type: 'take', item: 'fragments' }); say('紙片の束を取った。'); }}/>}</Photo><div className={'rm-receipt-bank' + (open ? ' is-open' : '')}>{propertyReceipts.map(r => slots.includes(r.id) ? <div key={r.id} className="rm-receipt-placeholder" aria-hidden="true"/> : <button key={r.id} disabled={open} aria-label={r.label + 'の受取票を選ぶ'} draggable={!open} onDragStart={e => { setSelected(r.id); e.dataTransfer.setData('text/plain', String(r.id)); }} aria-pressed={selected === r.id} onClick={() => setSelected(selected === r.id ? null : r.id)}><PropertyReceipt id={r.id}/></button>)}</div><p className="rm-receipt-selection" role="status">{open ? '引出しが開いている。' : selected === null ? '票を選んで、差し口へ置く' : propertyReceipts[selected].label + 'の票を選択中'}</p><div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'receiptTray', values: slots }); say('受取票の並びを記録した。'); }}>並びを記録する</button></div></section>;
}
export function ClockChecks({ s, dispatch, say, readOnly = false }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    readOnly?: boolean;
}) {
    const adjust = s.values.clockAdjust ?? [0, 0];
    const [closeClock, setCloseClock] = useState<number | null>(null);
    useSceneBack(closeClock !== null, () => setCloseClock(null));
    return <section className={'rm-clock-checks' + (closeClock !== null ? ' is-close' : '')}><div className="rm-clock-check-photos">{[0, 1].filter(i => closeClock === null || closeClock === i).map(i => <figure key={i}><figcaption>{i ? '室内' : 'ホーム'}</figcaption><Photo src={i ? '/assets/remake/office/south.webp' : '/assets/remake/platform/station.webp'} view={i ? [128, 158, 133, 180] : [935, 207, 188, 195]} label={'撮影記録の' + (i ? '室内' : 'ホーム') + 'の時計'} zoomable onInspect={() => setCloseClock(closeClock === null ? i : null)}><Clock minutes={23 * 60 + (i ? 12 : 17)} transform={i ? 'translate(198 251) rotate(-3) scale(.62 1)' : 'translate(1030 302) scale(.72)'}/></Photo><p>同時撮影　9/8　23:14</p></figure>)}</div><div className="rm-clock-corrections">{['ホーム', '室内'].map((name, i) => <div key={name}><span>{name}</span>{!readOnly && <input type="range" min="-10" max="10" step="1" aria-label={name + 'の補正（分）'} value={adjust[i]} onChange={e => dispatch({ type: 'values', id: 'clockAdjust', values: adjust.map((n, j) => i === j ? Number(e.target.value) : n) })}/>}<output>{adjust[i] > 0 ? '+' : ''}{adjust[i]}分</output></div>)}</div>{!readOnly && <button onClick={() => { dispatch({ type: 'record', id: 'clockChecks', values: adjust }); say('時計の補正を書き留めた。'); }}>補正を記録する</button>}</section>;
}
export function ReceiptNote({ values }: {
    values: number[];
}) { return <div className="rm-receipt-note">{values.map((v, i) => <div key={i}>{v >= 0 ? <PropertyReceipt id={v}/> : <span>{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i]}</span>}</div>)}</div>; }
export function ForgottenRoom({ s, dispatch, inspect }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: 'receiptTray' | 'clockChecks' | 'fragments') => void;
}) {
    return <section className={s.camera === 1 ? 'rm-property-table' : 'rm-property-room'}><Photo src="/assets/remake/lost/room.webp" label={s.camera === 1 ? '保管区画の比較台と時計の写真' : '四本の傘と受取棚'} view={s.camera === 1 ? [1005, 350, 667, 495] : undefined}><svg className="rm-object-overlay" viewBox="0 0 1672 941">{s.camera === 0 && <svg x="674" y="100" width="335" height="398" viewBox="350 0 950 941" preserveAspectRatio="none" style={{ filter: 'brightness(.72)' }}><ReceiptBoardImage s={s}/></svg>}<g transform="translate(1160 382) skewX(-20) scale(1 .36)" style={{ filter: 'brightness(.8) drop-shadow(2px 3px 2px #0007)' }}>{[0, 1].map(i => <g key={i} transform={'translate(' + (i * 175) + ' ' + (i * 12) + ')'}><image href="/assets/remake/parts/photo-back.webp" width="150" height="185"/><svg x="12" y="15" width="126" height="137" viewBox={i ? '128 158 133 180' : '935 207 188 195'}><image href={'/assets/remake/' + (i ? 'office/south' : 'platform/station') + '.webp'} width="1672" height="941"/><ClockHands minutes={23 * 60 + (i ? 12 : 17)} transform={i ? 'translate(198 251) rotate(-3) scale(.62 1)' : 'translate(1030 302) scale(.72)'}/></svg><text x="75" y="173" textAnchor="middle" fontSize="12" fill="#554c3d">9/8 23:14</text></g>)}</g>{s.locations.fragments === 'inventory' && <svg x="1450" y="397" width="192" height="35" viewBox="0 0 300 160" preserveAspectRatio="none" style={{ filter: 'brightness(.65) drop-shadow(2px 3px 2px #0008)' }}><FragmentPile /></svg>}</svg>{s.camera === 0 && <Touch name="四つの受取票の棚" rect={[40, 10, 22, 43]} act={() => inspect('receiptTray')}/>}{s.locations.fragments === 'inventory' && <Touch name="比較台に券の断片を広げる" rect={[86.7, 38.5, 12.5, 10]} act={() => inspect('fragments')}/>}<Touch name="比較台の時計の点検写真" rect={[68.3, 38.5, 17.9, 8]} act={() => inspect('clockChecks')}/></Photo><button className="rm-passage-actions" onClick={() => dispatch({ type: 'move', room: 'office', camera: 1 })}>駅務室へ戻る</button></section>;
}
export function ReceiptBoardImage({ s }: {
    s: State;
}) { const slots = s.values.receiptSlots ?? receiptInitial, open = s.values.receiptOpen?.[0] === 1; return <><image href={'/assets/remake/lost/tray-' + (open ? 'open' : 'closed') + '.webp'} width="1672" height="941"/><text x="825" y="40" fontSize="29" fontFamily="serif" fill="#bdb293" textAnchor="middle">受取順</text>{positions.map(([x, y, w, h], i) => <g key={i}><text x={x - 30} y={y + 45} textAnchor="middle" fill="#b6a98a" fontFamily="serif" fontSize="28">{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ'][i]}</text>{slots[i] >= 0 && <svg x={x} y={y} width={w} height={h}><PropertyReceipt id={slots[i]}/></svg>}</g>)}{open && s.locations.fragments === 'lostDrawer' && <svg x="660" y="824" width="315" height="94" preserveAspectRatio="none"><FragmentPile /></svg>}</>; }
