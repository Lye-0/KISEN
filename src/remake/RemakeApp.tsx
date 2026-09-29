import { TrialSheet } from './ToolTrial';
import { useCallback, useEffect, useRef, useState } from 'react';
import { newState, reduce, restore, owns } from './model';
import type { Action, Item, Room } from './model';
import { World, availableViews } from './World';
import type { Focus } from './World';
import { FocusView, itemArt } from './FocusView';
import { PhotoRecord } from './Photos';
import { RecordingStrips } from './Recorder';
import { ServiceRecordNote } from './ServiceRecords';
import { useModal } from './useModal';
import './remake.css';
const fixture = new URLSearchParams(location.search).get('remake');
const group = fixture === 'reader' || fixture === 'ticket' ? 'ticket' : fixture === 'recorder' ? 'recorder' : fixture === 'photos' ? 'photos' : fixture === 'counter' ? 'counter' : '';
const saveKey = 'kisen-remake-v2' + (group ? ':' + group : '');
const initialFocus: Focus = fixture === 'reader' ? 'reader' : fixture === 'ticket' ? 'ticket' : null;
function seed() {
    const s = newState();
    if (group === 'recorder') {
        s.room = 'office';
        s.locations.knob = 'inventory';
        s.sound = true;
    }
    if (group === 'ticket') {
        s.room = 'office';
        s.locations.punch = 'inventory';
        s.locations.paper = 'inventory';
        s.values.ticketDie = [0];
    }
    if (group === 'photos') {
        s.locations.photos = 'inventory';
        s.locations.envelope = 'inventory';
    }
    if (group === 'counter') {
        s.room = 'waiting';
        s.camera = 1;
    }
    s.visited = [s.room + ':' + s.camera];
    return s;
}
function load() {
    try {
        return restore(JSON.parse(localStorage.getItem(saveKey) ?? 'null')) ?? seed();
    }
    catch {
        return seed();
    }
}
const labels: Record<Item, string> = { photos: '写真', receipt: '受取票', envelope: '封筒', ownTicket: '到着券', officeKey: '駅務室の鍵', knob: '黒いつまみ', hook: '鉤付き棒', pin: '薄い片', support: '支え', lamp: '灯具', punch: '鋏', paper: '用紙', fragments: '券の断片', hood: '覆い', ticket: '切符', counterRecords: '帳票' };
const documentFocus: Partial<Record<Item, Focus>> = { photos: 'photos', receipt: 'receipt', envelope: 'map', paper: 'paperView', counterRecords: 'notices' };
const roomLabels: Record<Room, string> = { train: '到着車内', platform: '南ホーム', waiting: '待合室', forecourt: '駅前', office: '駅務室', lost: '忘れ物室', bridge: '跨線橋', cargo: '荷物室', lamp: '灯具小屋', tunnel: 'トンネル側道', north: '北ホーム', return: '帰りの車内' };
export default function RemakeApp() {
    const [s, setS] = useState(load), [view, setView] = useState<{
        focus: Focus;
        trail: Focus[];
    }>({ focus: initialFocus, trail: [] }), [panel, setPanel] = useState<'settings' | 'notes' | null>(null), [targets, setTargets] = useState(false), [message, setMessage] = useState(''), [selected, setSelected] = useState<Item | null>(null);
    const focus = view.focus, timer = useRef<ReturnType<typeof setTimeout> | null>(null), file = useRef<HTMLInputElement>(null), panelRef = useModal(panel !== null, () => setPanel(null));
    const inspect = useCallback((next: Focus) => { setView(v => v.focus === next ? v : { focus: next, trail: v.focus ? [...v.trail, v.focus] : [] }); setMessage(''); }, []);
    const close = useCallback(() => { setView(v => ({ focus: v.trail.at(-1) ?? null, trail: v.trail.slice(0, -1) })); setMessage(''); }, []);
    const dispatch = useCallback((a: Action) => {
        if (a.type !== 'heard' && a.type !== 'tick') {
            setMessage('');
            if (timer.current)
                clearTimeout(timer.current);
        }
        if (a.type === 'move')
            setView({ focus: null, trail: [] });
        setS(s => reduce(s, a));
    }, []);
    const say = useCallback((m: string) => {
        setMessage(m);
        if (timer.current)
            clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(''), 3500);
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem(saveKey, JSON.stringify(s));
        }
        catch {
            say('保存できません。設定から記録を書き出せます。');
        }
    }, [s, say]);
    useEffect(() => {
        const key = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (panel)
                    setPanel(null);
                else
                    close();
            }
        };
        window.addEventListener('keydown', key);
        return () => window.removeEventListener('keydown', key);
    }, [panel, close]);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    const exportSave = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'KISEN-remake.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); };
    const inv = (Object.keys(s.locations) as Item[]).filter(i => owns(s, i)), views = availableViews[s.room] ?? [];
    const showSelected = selected && owns(s, selected) && focus !== (documentFocus[selected] ?? 'item');
    const world = <World s={s} dispatch={dispatch} inspect={inspect} say={say} selected={selected}/>;
    return <main id="rm-game" className={targets ? 'rm-targets' : ''}>
 <div className={'rm-stage ' + (focus === 'bag' ? 'rm-close' : '')}>{focus ? <><div className="rm-focus-backdrop" aria-hidden="true" inert>{world}</div><div className="rm-focused-scene"><FocusView focus={focus} s={s} dispatch={dispatch} say={say} selected={selected} onSelect={setSelected} close={close} inspect={inspect}/></div></> : world}</div>
 {!focus && views.length > 1 && <nav className="rm-world-nav" aria-label="周囲を見る"><button aria-label="左を見る" onClick={() => dispatch({ type: 'look', camera: (s.camera + views.length - 1) % views.length })}>‹</button><button aria-label="右を見る" onClick={() => dispatch({ type: 'look', camera: (s.camera + 1) % views.length })}>›</button></nav>}
 <div className="rm-top">{focus ? <button onClick={close} aria-label="前の場面へ戻る">〈 戻る</button> : <div><span className="rm-wordmark">帰線</span><span className="rm-area-name">{roomLabels[s.room]}</span></div>}<div><button onClick={() => setPanel('notes')}>記録</button><button onClick={() => setPanel('settings')} aria-label="設定と保存">⋯</button></div></div>
 {showSelected && <div className="rm-held-item">{itemArt[selected] && !['officeLock', 'recorder', 'ticket', 'reader'].includes(focus ?? '') && <img src={itemArt[selected]} alt={labels[selected]} draggable={false}/>}<button aria-label="選んだ持ち物を見る" onClick={() => inspect(documentFocus[selected] ?? 'item')}>見る</button></div>}
 <div className="rm-bottom"><div className="rm-inventory" aria-label="持ち物">{inv.map(item => <button key={item} className={selected === item ? 'selected' : ''} aria-pressed={selected === item} onClick={() => {
                if (selected === item)
                    inspect(documentFocus[item] ?? 'item');
                else
                    setSelected(item);
            }}>{labels[item]}</button>)}</div><button className="rm-target-toggle" aria-pressed={targets} onClick={() => setTargets(!targets)}>調べる場所</button></div>
 {message && <div className="rm-feedback" role="status">{message}</div>}
 {panel && <div ref={panelRef} className="rm-scrim" onClick={e => {
                if (e.target === e.currentTarget)
                    setPanel(null);
            }}><section className="rm-panel" role="dialog" aria-modal="true" aria-label={panel === 'settings' ? '設定' : '記録'}><header><h2>{panel === 'settings' ? '設定' : '記録'}</h2><button onClick={() => setPanel(null)} aria-label="閉じる">×</button></header>{panel === 'settings' ? <><label><input type="checkbox" checked={s.sound} onChange={() => dispatch({ type: 'sound' })}/>音を鳴らす</label><label><input type="checkbox" checked={targets} onChange={e => setTargets(e.target.checked)}/>調べる場所を示す</label><button onClick={exportSave}>記録を書き出す</button><button onClick={() => file.current?.click()}>記録を読み込む</button><input ref={file} hidden type="file" accept="application/json" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f)
                        return;
                    try {
                        if (f.size > 1048576)
                            throw Error();
                        const next = restore(JSON.parse(await f.text()));
                        if (!next)
                            throw Error();
                        setS(next);
                        setPanel(null);
                        setView({ focus: initialFocus, trail: [] });
                        setSelected(null);
                    }
                    catch {
                        say('この記録は読み込めません。');
                    }
                    e.target.value = '';
                }}/><button onClick={() => { setS(seed()); setView({ focus: initialFocus, trail: [] }); setPanel(null); setSelected(null); }}>試作を初期状態へ戻す</button></> : <>{s.notes.length ? s.notes.map(n => <article key={n.id}>{n.id.startsWith('toolTrial') ? <TrialSheet cuts={n.values} annotate/> : n.id === 'recordings' ? <RecordingStrips offset={n.values[0]} heard={[n.values[1], n.values[2]]}/> : n.id === 'arrivalPhotos' ? <PhotoRecord order={n.values}/> : n.id === 'serviceRecords' ? <ServiceRecordNote ids={n.values}/> : <p>観察記録</p>}</article>) : <p>観察したものが、ここに残ります。</p>}</>}</section></div>}
 <span className="rm-dev-label">代表場面の検証 / {group === 'ticket' ? 'Q31–32' : group === 'recorder' ? 'Q12' : group === 'counter' ? 'Q04–05' : '探索一巡'}</span>
 </main>;
}
