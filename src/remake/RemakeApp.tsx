import { SceneBackContext } from './SceneBack';
import { turnCamera } from './viewNavigation';
import { PlacesPanel } from './PlacesPanel';
import { roomLabels } from './visitedPlaces';
import { HintPanel } from './HintPanel';
import { getProgressHint } from './progressHints';
import { CrossingNote } from './CrossingView';
import { SketchNote } from './RouteSketch';
import { Ending, HomePhone } from './ReturnTrain';
import { DispatchNote } from './ReturnDispatch';
import { GlassNote } from './GlassWindow';
import { FreightNote } from './Freight';
import { NoticeBoardNote } from './NoticeBoard';
import { FragmentLayout, FragmentPhoto } from './FragmentBoard';
import { ClockChecks, ReceiptNote } from './ForgottenShelf';
import { BellAudio, BellNote } from './Bell';
import { LampNote } from './LampWindow';
import { PosterNote } from './PosterFragments';
import { CargoDocketsNote } from './CargoChest';
import { TrialSheet } from './ToolTrial';
import { useCallback, useEffect, useRef, useState } from 'react';
import { newState, reduce, restore, owns } from './model';
import type { Action, Item } from './model';
import { World, availableViews } from './World';
import type { Focus } from './World';
import { FocusView } from './FocusView';
import { ItemImage } from './ItemImage';
import { PhotoRecord } from './Photos';
import { RecordingStrips } from './Recorder';
import { ServiceRecordNote } from './ServiceRecords';
import { PointNote } from './PointControls';
import { JourneyRecordNote } from './JourneyRecords';
import { useModal } from './useModal';
import './remake.css';
const fixture = new URLSearchParams(location.search).get('remake');
const group = fixture === 'crossing' ? 'crossing' : fixture === 'ending' ? 'ending' : fixture === 'dispatch' ? 'dispatch' : fixture === 'glass' ? 'glass' : fixture === 'freight' ? 'freight' : fixture === 'fragments' ? 'fragments' : fixture === 'lost' ? 'lost' : fixture === 'optics' ? 'optics' : fixture === 'shed' ? 'shed' : fixture === 'reader' || fixture === 'ticket' ? 'ticket' : fixture === 'recorder' ? 'recorder' : fixture === 'photos' ? 'photos' : fixture === 'counter' ? 'counter' : fixture === 'stopping' ? 'stopping' : fixture === 'journeys' ? 'journeys' : fixture === 'points' ? 'points' : fixture === 'cargo' ? 'cargo' : '';
const saveKey = 'kisen-remake-v2' + (group ? ':' + group : '');
const initialFocus: Focus = fixture === 'crossing' ? 'passageWindow' : fixture === 'dispatch' ? 'dispatch' : fixture === 'fragments' ? 'fragments' : fixture === 'shed' ? 'posters' : fixture === 'reader' ? 'reader' : fixture === 'ticket' ? 'ticket' : fixture === 'journeys' ? 'journeyRecords' : fixture === 'cargo' ? 'cargoChest' : null;
function seed() {
    const s = newState();
    if (group === 'crossing') {
        s.room = 'passage';
        s.camera = 2;
        s.locations.envelope = 'inventory';
        s.locations.pin = 'inventory';
        s.locations.support = 'inventory';
        s.values.gateOpen = [1];
    }
    if (group === 'ending') {
        s.room = 'return';
        s.started = true;
        s.train = { service: 2, position: 'departed', firstDoor: 7 };
        s.values.returnTrip = [0, 0];
        s.mounted = { id: 1, service: 2, back: false, holes: [{ column: 0, node: 'A', side: 'white', tool: 1 }, { column: 1, node: 'B', side: 'white', tool: 1 }, { column: 2, node: 'E', side: 'black', tool: 1 }, { column: 3, node: 'F', side: 'white', tool: 1 }, { column: 4, node: 'D', side: 'black', tool: 1 }] };
    }
    if (group === 'dispatch') {
        s.room = 'north';
        s.locations.fragments = 'inventory';
    }
    if (group === 'glass') {
        s.room = 'north';
        s.camera = 1;
        s.locations.spareLamp = 'inventory';
    }
    if (group === 'freight') {
        s.room = 'bridge';
        s.camera = 3;
    }
    if (group === 'fragments') {
        s.room = 'lost';
        s.camera = 1;
        s.locations.fragments = 'inventory';
    }
    if (group === 'lost') {
        s.room = 'lost';
    }
    if (group === 'optics') {
        s.room = 'lamp';
        s.camera = 1;
        s.locations.lamp = 'inventory';
        s.locations.support = 'inventory';
    }
    if (group === 'shed') {
        s.room = 'forecourt';
    }
    if (group === 'cargo')
        s.room = 'cargo';
    if (group === 'points') {
        s.room = 'north';
        s.camera = 3;
    }
    if (group === 'journeys')
        s.room = 'office';
    if (group === 'recorder') {
        s.room = 'office';
        s.locations.knob = 'inventory';
        s.sound = true;
    }
    if (group === 'ticket') {
        s.room = 'office';
        s.locations.punch = 'toolBench'; s.values.toolSelected = [1];
        s.locations.ticket = 'inventory'; s.draft = { id: 1, holes: [], service: 0, back: false };
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
    if (group === 'stopping') {
        s.values.bellChannel = [1];
        s.room = 'north';
        s.locations.lamp = 'inventory';
        s.locations.spareLamp = 'inventory';
        s.locations.hood = 'inventory';
        s.locations.retainingPin = 'inventory';
        s.locations.ticket = 'inventory'; s.draft = { id: 1, holes: [], service: 0, back: false };
        s.locations.punch = 'toolBench'; s.values.toolSelected = [1];
        s.route = [0, 1, 0, 1, 1, 1];
    }
    if (fixture !== null)
        s.started = true;
    if (s.mounted) { s.draft = null; s.locations.ticket = 'reader'; }
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
const labels: Record<Item, string> = { phone: '携帯電話', retainingPin: '保持ピン', cargoDocket: '経路控', spareLamp: '交換灯具', photos: '写真', receipt: '受取票', envelope: '封筒', ownTicket: '到着券', officeKey: '駅務室の鍵', knob: '黒いつまみ', hook: '鉤付き棒', pin: '薄い片', support: '支え', lamp: '灯具', punch: '鋏', paper: '紙の束', fragments: '券の断片', hood: '覆い', ticket: '切符', counterRecords: '帳票' };
const documentFocus: Partial<Record<Item, Focus>> = { phone: 'homePhoto', fragments: 'fragments', cargoDocket: 'cargoDocket', photos: 'photos', receipt: 'receipt', envelope: 'map', ownTicket: 'arrivalTicket', ticket: 'paperView', counterRecords: 'notices' };
function recordTitle(id: string) {
    if (id === 'crossing-observation-bridge') return '跨線橋から見た線路';
    if (id === 'crossing-observation-window') return '地下の踊り場から見た線路';
    if (id === 'crossing-observation-north') return '北ホーム東端から見た線路';
    const titles: Record<string, string> = { fragments: '券の断片 — 配置の写し', clockChecks: '時計の点検写真と補正', receiptTray: '受取票の配置', posters: '掲示紙片の配置', routeSketch: '路線の略図', homePhoto: '携帯の保存写真', fragmentPhoto: '断片と同じ束の写真', recordings: '録音の記録', arrivalPhotos: '到着時の写真', serviceRecords: '運行資料', noticeBoard: '掲示', cargoDockets: '荷札', freight: '貨物の観察' };
    if (titles[id]) return titles[id];
    if (id.startsWith('journey-record-')) return '乗車券控の写真と部分写し';
    if (id.startsWith('bell-record-')) return 'ベルの押・返の記録';
    if (id.startsWith('toolTrial')) return '試し切りの紙';
    if (id.startsWith('lamp-observation-')) return '窓から見た灯具の状態';
    if (id.startsWith('glass-observation-')) return '観測窓の景色';
    if (id.startsWith('dispatch-record-')) return '呼出機の運行控';
    if (id.startsWith('point-observation-')) return '分岐の接続';
    return '観察記録';
}

export default function RemakeApp() {
    const [s, setS] = useState(load), [view, setView] = useState<{
        focus: Focus;
        trail: Focus[];
    }>({ focus: initialFocus, trail: [] }), [panel, setPanel] = useState<'settings' | 'notes' | 'hints' | 'places' | null>(null), [targets, setTargets] = useState(false), [message, setMessage] = useState(''), [selected, setSelected] = useState<Item | null>(null), [trainNotice, setTrainNotice] = useState(''), [sceneZoom, setSceneZoom] = useState(false);
    const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
    useEffect(() => {
        if (s.version !== 3 || !s.values.deskToolRevision) { const migrated = restore(s); if (migrated) setS(migrated); }
    }, [s.version, s.values.deskToolRevision]);
    useEffect(() => {
        if (selected && !owns(s, selected)) setSelected(null);
    }, [s.locations, selected]);
    useEffect(() => {
        const observed = { approaching: '列車が近づいてくる。', passing: '列車が止まらず、通り過ぎていく。', stopped: '列車が止まった。', leaving: '列車が離れていく。' };
        if (s.train.position in observed) setTrainNotice(observed[s.train.position as keyof typeof observed]);
    }, [s.train.position]);
    useEffect(() => setSceneZoom(false), [s.room, s.camera, view.focus]);
    const localBacks = useRef(new Map<symbol, { back: () => void; priority: number }>());
    const [localBackCount, setLocalBackCount] = useState(0);
    const registerBack = useCallback((back: () => void, priority: number) => {
        const token = Symbol(); localBacks.current.set(token, { back, priority }); setLocalBackCount(localBacks.current.size);
        return () => { localBacks.current.delete(token); setLocalBackCount(localBacks.current.size); };
    }, []);
    const focus = view.focus, timer = useRef<ReturnType<typeof setTimeout> | null>(null), file = useRef<HTMLInputElement>(null), panelRef = useModal(panel !== null, () => setPanel(null));
    const inspect = useCallback((next: Focus) => { setView(v => v.focus === next ? v : { focus: next, trail: (v.focus === 'tools' && next === 'ticket' || v.focus === 'ticket' && next === 'tools') ? v.trail : v.focus ? [...v.trail, v.focus] : [] }); setMessage(''); }, []);
    const close = useCallback(() => { const local = [...localBacks.current.values()].sort((a, b) => b.priority - a.priority)[0]; if (local) { local.back(); return; } setView(v => ({ focus: v.trail.at(-1) ?? null, trail: v.trail.slice(0, -1) })); setMessage(''); }, []);
    const dispatch = useCallback((a: Action) => {
        if (a.type !== 'heard' && a.type !== 'tick') {
            setMessage('');
            if (timer.current)
                clearTimeout(timer.current);
        }
        if (a.type === 'move' || a.type === 'travel')
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
    useEffect(() => {
        if (!['approaching', 'passing', 'leaving'].includes(s.train.position))
            return;
        const id = setInterval(() => dispatch({ type: 'trainAdvance', seconds: .1 }), 100);
        return () => clearInterval(id);
    }, [s.train.position, dispatch]);
    useEffect(() => {
        if (s.room !== 'return' || s.ended || (s.values.returnTrip?.[0] ?? 0) >= 12)
            return;
        const id = setInterval(() => dispatch({ type: 'returnAdvance', seconds: .25 }), 250);
        return () => clearInterval(id);
    }, [s.room, s.ended, s.values.returnTrip?.[0] >= 12, dispatch]);
    useEffect(() => {
        if (!s.started || s.ended)
            return;
        const id = setInterval(() => dispatch({ type: 'tick', seconds: 30 }), 30000);
        return () => clearInterval(id);
    }, [s.started, s.ended, dispatch]);
    const exportSave = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(s)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = 'KISEN-remake.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); };
    const inv = (Object.keys(s.locations) as Item[]).filter(i => i !== 'paper' && i !== 'punch' && owns(s, i)), views = availableViews[s.room] ?? [];
    const currentHint = panel === 'hints' ? getProgressHint(s, focus) : null;
    const showSelected = selected && owns(s, selected) && focus !== (documentFocus[selected] ?? 'item');
    const world = <World s={s} dispatch={dispatch} inspect={inspect} say={say} selected={selected}/>;
    if (!s.started && fixture === null)
        return <main id="rm-game" className="rm-title"><img src="./assets/remake/platform/train-open.webp" alt="誰もいないきさらぎ駅。列車の扉が開いている"/><div className="rm-title-copy"><p>きさらぎ駅</p><h1>帰線</h1><p className="rm-title-reading">K I S E N</p><p>帰るための線を、見つける。</p><button onClick={() => dispatch({ type: 'start' })}>{s.room === 'train' && !s.bag.mouth ? '車内へ' : '続きへ'}</button><p className="rm-title-meta">ひとりで遊ぶ脱出ゲーム<br />進行は、このブラウザに自動保存されます。</p></div></main>;
    if (s.ended)
        return <Ending s={s} review={() => dispatch({ type: 'returnReview' })} exportSave={exportSave}/>;
    return <SceneBackContext.Provider value={registerBack}><main id="rm-game" className={[targets ? 'rm-targets' : '', sceneZoom && !focus ? 'rm-scene-zoomed' : ''].join(' ')}><BellAudio s={s}/>
 <div className="rm-play-layer" inert={panel !== null}>
 <div className={'rm-stage ' + (focus === 'bag' ? 'rm-close' : '')}>{focus ? <><div className="rm-focus-backdrop" aria-hidden="true" inert><SceneBackContext.Provider value={null}>{world}</SceneBackContext.Provider></div><div className="rm-focused-scene"><FocusView focus={focus} s={s} dispatch={dispatch} say={say} selected={selected} onSelect={setSelected} close={close} inspect={inspect}/></div></> : world}</div>
 {!focus && s.room !== 'passage' && s.room !== 'tunnel' && s.room !== 'return' && views.length > 1 && <nav className="rm-world-nav" aria-label="周囲を見る"><button aria-label="左を見る" onClick={() => dispatch({ type: 'look', camera: turnCamera(s.room, s.camera, -1, views.length) })}>‹</button><button aria-label="右を見る" onClick={() => dispatch({ type: 'look', camera: turnCamera(s.room, s.camera, 1, views.length) })}>›</button></nav>}
 <div className="rm-top">{focus || localBackCount > 0 ? <div className="rm-location-controls"><button onClick={close} aria-label="前の場面へ戻る">〈 戻る</button><span className="rm-area-name">{roomLabels[s.room]}</span></div> : <div><span className="rm-wordmark">帰線</span><span className="rm-area-name">{roomLabels[s.room]}</span></div>}<div>{!focus && <button className="rm-scene-zoom-toggle" aria-label={sceneZoom ? '景色の全体へ' : '景色を大きく'} aria-pressed={sceneZoom} onClick={() => setSceneZoom(!sceneZoom)}>{sceneZoom ? '全景' : '拡大'}</button>}{s.room !== 'return' && <button aria-label="訪れた場所へ移動" onClick={() => setPanel('places')}>移動</button>}<button className="rm-hint-trigger" onClick={() => setPanel('hints')}>ヒント</button><button onClick={() => setPanel('notes')}>記録</button><button onClick={() => setPanel('settings')} aria-label="設定と保存">⋯</button></div></div>
 {showSelected && <div className="rm-held-item"><div className="rm-held-icon"><ItemImage item={selected} state={s}/></div><span className="rm-held-name">{labels[selected]}</span><button aria-label="選んだ持ち物を見る" onClick={() => inspect(documentFocus[selected] ?? 'item')}>見る</button><span className="rm-held-help">もう一度選ぶとしまう</span></div>}
 <div className="rm-bottom"><div className="rm-inventory" aria-label="持ち物">{inv.map(item => <button key={item} aria-label={labels[item]} className={selected === item ? 'selected' : ''} aria-pressed={selected === item} onClick={() => {
                const document = documentFocus[item];
                if (document && item !== 'ticket') { setSelected(null); inspect(document); } else setSelected(selected === item ? null : item);
            }}><span className="rm-inventory-art"><ItemImage item={item} state={s}/></span><span>{labels[item]}</span></button>)}</div><button className="rm-target-toggle" aria-pressed={targets} onClick={() => setTargets(!targets)}>調べる場所</button></div>
 {trainNotice && s.room === 'north' && <div className="rm-train-observation" role="status"><span>{trainNotice}</span><button aria-label="列車の気配の表示を閉じる" onClick={() => setTrainNotice('')}>×</button></div>}
 {message && <div className="rm-feedback" role="status">{message}</div>}
 </div>
 {panel && <div ref={panelRef} className="rm-scrim" onClick={e => {
                if (e.target === e.currentTarget)
                    setPanel(null);
            }}><section className={'rm-panel' + (panel === 'notes' ? ' rm-notes-panel' : panel === 'hints' ? ' rm-hints-panel' : panel === 'places' ? ' rm-places-panel' : '')} role="dialog" aria-modal="true" aria-label={panel === 'settings' ? '設定' : panel === 'hints' ? 'ヒント' : panel === 'places' ? '訪れた場所' : '記録'}><header><h2>{panel === 'settings' ? '設定' : panel === 'hints' ? 'ヒント' : panel === 'places' ? '訪れた場所' : '記録'}</h2><button onClick={() => setPanel(null)} aria-label="閉じる">×</button></header>{panel === 'places' ? <PlacesPanel s={s} travel={room => { dispatch({ type: 'travel', room }); setPanel(null); setSelected(null); }}/> : panel === 'hints' && currentHint ? <HintPanel key={currentHint.id} hint={currentHint} level={hintLevels[currentHint.id] ?? 0} onLevelChange={level => setHintLevels(previous => ({ ...previous, [currentHint.id]: level }))}/> : panel === 'settings' ? <><label><input type="checkbox" checked={s.sound} onChange={() => dispatch({ type: 'sound' })}/>音を鳴らす</label><label><input type="checkbox" checked={targets} onChange={e => setTargets(e.target.checked)}/>調べる場所を示す</label><button onClick={exportSave}>記録を書き出す</button><button onClick={() => file.current?.click()}>記録を読み込む</button><input ref={file} hidden type="file" accept="application/json" onChange={async (e) => {
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
                        setHintLevels({});
                        setTrainNotice('');
                        setPanel(null);
                        setView({ focus: initialFocus, trail: [] });
                        setSelected(null);
                    }
                    catch {
                        say('この記録は読み込めません。');
                    }
                    e.target.value = '';
                }}/><button onClick={() => { setS(seed()); setHintLevels({}); setTrainNotice(''); setView({ focus: initialFocus, trail: [] }); setPanel(null); setSelected(null); }}>最初から始める</button></> : <>{s.notes.length ? s.notes.map(n => <article key={n.id}><details><summary>{recordTitle(n.id)}</summary><div className="rm-record-body">{n.id === 'routeSketch' ? <SketchNote values={n.values}/> : n.id.startsWith('crossing-observation-') ? <CrossingNote values={n.values}/> : n.id === 'homePhoto' ? <HomePhone /> : n.id === 'fragmentPhoto' ? <FragmentPhoto /> : n.id === 'fragments' ? <FragmentLayout values={n.values}/> : n.id === 'receiptTray' ? <ReceiptNote values={n.values}/> : n.id === 'clockChecks' ? <ClockChecks s={{ ...s, values: { ...s.values, clockAdjust: n.values } }} dispatch={() => { }} say={() => { }} readOnly/> : n.id.startsWith('bell-record-') ? <BellNote values={n.values}/> : n.id.startsWith('lamp-observation-') ? <LampNote values={n.values}/> : n.id.startsWith('toolTrial') ? <TrialSheet cuts={n.values} annotate/> : n.id === 'recordings' ? <RecordingStrips offset={n.values[0]} heard={[n.values[1], n.values[2]]}/> : n.id.startsWith('dispatch-record-') ? <DispatchNote values={n.values}/> : n.id.startsWith('glass-observation-') ? <GlassNote values={n.values}/> : n.id === 'freight' ? <FreightNote /> : n.id === 'noticeBoard' ? <NoticeBoardNote values={n.values}/> : n.id === 'posters' ? <PosterNote values={n.values}/> : n.id === 'cargoDockets' ? <CargoDocketsNote /> : n.id === 'arrivalPhotos' ? <PhotoRecord order={n.values}/> : n.id === 'serviceRecords' ? <ServiceRecordNote ids={n.values}/> : n.id.startsWith("point-observation-") ? <PointNote values={n.values}/> : n.id.startsWith("journey-record-") ? <JourneyRecordNote values={n.values}/> : <p>観察記録</p>}</div></details></article>) : <p>観察したものが、ここに残ります。</p>}</>}</section></div>}
 </main></SceneBackContext.Provider>;
}
