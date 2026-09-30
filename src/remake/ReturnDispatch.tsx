import { useState } from 'react';
import { Photo } from './Photo';
import { dispatchRows, directionRows, carRecords } from './dispatchEvidence';
import { owns } from './model';
import type { Action, State } from './model';
const paper = '/assets/remake/parts/photo-back.webp';
function BellMark({ x, y }: {
    x: number;
    y: number;
}) { return <g transform={`translate(${x} ${y})`} fill="none" stroke="#514938" strokeWidth="3"><path d="M-17 12Q-12 8-12-5Q-12-19 0-19Q12-19 12-5Q12 8 17 12Z M-4 18Q0 23 4 18 M0-19v-7"/></g>; }
function StopMark({ x, y }: {
    x: number;
    y: number;
}) { return <g transform={`translate(${x} ${y})`} fill="none" stroke="#514938" strokeWidth="3"><path d="M-15-17H15V17H-15Z M0-15V15"/><path d="M-22 22H22"/></g>; }
export function DispatchSheet({ inkOnly = false }: {
    inkOnly?: boolean;
} = {}) { return <svg width="800" height="1100" viewBox="0 0 800 1100" role="img" aria-label="呼出番号、車体符号、予鈴と停車の順番を記した運行控">{!inkOnly && <image href={paper} width="800" height="1100" preserveAspectRatio="none"/>}<g fill="#514938" fontFamily="serif" textAnchor="middle"><text x="400" y="91" fontSize="44">夜間運行控</text><text x="400" y="148" fontSize="24">九月一日 改正</text><path d="M65 188H735V827H65Z M205 188V827M328 188V827" stroke="#776d56" fill="none" strokeWidth="2"/><text x="136" y="227" fontSize="24">呼出番号</text><text x="266" y="227" fontSize="24">車体</text><text x="531" y="227" fontSize="24">取扱順序</text>{dispatchRows.map((row, i) => { const y = 292 + i * 93; return <g key={row.service}><path d={`M65 ${y + 41}H735`} stroke="#93876b"/><text x="136" y={y + 12} fontSize="37">{row.service}</text><text x="267" y={y + 12} fontSize="31">{carRecords[row.car].code}</text><path d={`M375 ${y}H687m-12-7 12 7-12 7`} stroke="#756a51" fill="none"/><BellMark x={375 + row.bell * 290} y={y - 5}/>{row.stop !== null ? <StopMark x={375 + row.stop * 290} y={y - 5}/> : <text x="576" y={y - 13} fontSize="24">通過</text>}</g>; })}<BellMark x={181} y={908}/><text x="259" y="917" fontSize="26">予鈴</text><StopMark x={448} y={908}/><text x="538" y="917" fontSize="26">停車</text><text x="400" y="1018" fontSize="23">車体照合票　別添</text></g></svg>; }
export function DirectionSheet() { return <svg viewBox="0 0 900 680" role="img" aria-label="北ホームの西に白沢方面、東に山上方面を示す方向票と呼出番号"><image href={paper} width="900" height="680" preserveAspectRatio="none"/><g fill="#514938" fontFamily="serif" textAnchor="middle"><text x="450" y="85" fontSize="43">北ホーム　方向票</text><path d="M435 201H465V405H435Z M93 410H806 M105 399l-12 11 12 11M794 399l12 11-12 11" stroke="#655a41" fill="none" strokeWidth="3"/><text x="450" y="300" fontSize="27" transform="rotate(-90 450 300)">ホーム</text><text x="210" y="359" fontSize="38">白沢方</text><text x="690" y="359" fontSize="38">山上方</text><text x="210" y="479" fontSize="32">{directionRows.filter(r => r.toward === '白沢').map(r => r.service).join('・')}</text><text x="690" y="479" fontSize="32">{directionRows.filter(r => r.toward === '山上').map(r => r.service).join('・')}</text><text x="450" y="551" fontSize="23">呼出番号</text><path d="M734 208V142m-9 14 9-14 9 14" stroke="#655a41" fill="none" strokeWidth="2"/><text x="734" y="126" fontSize="24">北</text><text x="146" y="606" fontSize="24">西</text><text x="754" y="606" fontSize="24">東</text></g></svg>; }
export function DispatchPocket() { return <g style={{ filter: 'brightness(.64)' }}><image href="/assets/remake/parts/dispatch-pocket.png" x="270" y="710" width="260" height="215" preserveAspectRatio="none"/><svg x="294" y="728" width="208" height="127" viewBox="0 0 800 620" preserveAspectRatio="none" style={{ mixBlendMode: 'multiply', opacity: .82 }}><DispatchSheet inkOnly/></svg></g>; }
export function CarSheet({ car, detail }: {
    car: number;
    detail: boolean;
}) { const c = carRecords[car]; return <figure className="rm-car-sheet"><figcaption>車体照合　{c.code}</figcaption><Photo src={detail ? c.window : c.body} dimensions={detail ? c.windowSize : undefined} label={detail ? `${c.code}車の中央窓の接写` : `${c.code}車の側面検査写真`} zoomable limitZoomToSource zoomButtonOnly zoomOrigin="50% 50%"/>{!detail && <svg viewBox="0 0 900 165" role="img" aria-label={`乗降扉中心の間隔 ${c.gap}メートル`}><g stroke="#514938" fill="none" strokeWidth="2"><path d="M230 20V95H670V20 M230 66l15-6m-15 6 15 6 M670 66l-15-6m15 6-15 6"/><path d="M206 10H254V37H206Z M646 10H694V37H646Z"/></g><text x="450" y="79" fontSize="37" fontFamily="serif" textAnchor="middle" fill="#514938">{c.gap} m</text><text x="450" y="141" fontSize="23" fontFamily="serif" textAnchor="middle" fill="#514938">乗降扉中心</text></svg>}</figure>; }
function DispatchContent({ values }: {
    values: number[];
}) {
    const [page, car, detail, compare] = values;
    return page === 0 ? <DispatchSheet /> : page === 2 ? <DirectionSheet /> : <div className={'rm-dispatch-cars' + (compare ? ' is-comparing' : '')}>
 {Boolean(compare) && <figure className="rm-car-sheet"><figcaption>紙片と一緒にあった写真</figcaption><Photo src="/assets/remake/journeys/f-white.webp" label="紙片に添えられた車窓と標柱の写真" zoomable limitZoomToSource zoomButtonOnly zoomOrigin="56% 53%"/></figure>}<CarSheet car={car} detail={Boolean(detail)}/></div>;
}
export function ReturnDispatch({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) { const [page, setPage] = useState(0), [car, setCar] = useState(0), [detail, setDetail] = useState(false), [compare, setCompare] = useState(false), [paperNear, setPaperNear] = useState(false); const values = [page, car, Number(detail), Number(compare)]; return <section className="rm-dispatch"><div className="rm-dispatch-tabs">{['運行控', '車体照合', '方向票'].map((label, i) => <button key={label} onClick={() => setPage(i)} aria-pressed={page === i}>{label}</button>)}</div><div className={'rm-dispatch-content rm-dispatch-page-' + page}><div className={"rm-dispatch-paper" + (paperNear && page !== 1 ? " is-near" : "")}><DispatchContent values={values}/></div></div><div className="rm-document-controls">{page !== 1 && <button onClick={() => setPaperNear(!paperNear)}>{paperNear ? "紙の全体を見る" : "紙を拡大する"}</button>}{page === 1 && <>{carRecords.map((c, i) => <button key={c.code} aria-pressed={car === i} onClick={() => setCar(i)}>{c.code}車</button>)}<button onClick={() => setDetail(!detail)}>{detail ? '車体全体を見る' : '窓を近くで見る'}</button>{owns(s, 'fragments') && <button onClick={() => setCompare(!compare)}>{compare ? '一枚ずつ見る' : '車窓写真と並べる'}</button>}</>}<button onClick={() => { dispatch({ type: 'record', id: 'dispatch-record-' + values.join('-'), values }); say('運行控を記録した。'); }}>記録する</button></div></section>; }
export function DispatchNote({ values }: {
    values: number[];
}) { return <div className={'rm-dispatch-note rm-dispatch-page-' + values[0]}><DispatchContent values={values}/></div>; }
