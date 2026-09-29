import { useState } from 'react';
import type { Action, State } from './model';
export function RecordCard({ id, inkOnly = false }: {
    id: number;
    inkOnly?: boolean;
}) {
    const old = id === 0, date = id === 3;
    const times = old ? ['19:12', '19:48', '20:36', '21:26', '21:58'] : ['19:20', '20:12', '20:48', '21:46', '22:18'];
    return <svg viewBox="0 0 700 920" className="rm-service-paper" preserveAspectRatio={inkOnly ? 'none' : undefined} style={inkOnly ? { height: '100%', mixBlendMode: 'multiply', opacity: .85 } : undefined} role="img" aria-label={['八月の受付時刻表', '臨時運休の掲示', '九月の受付時刻表', '窓口の日付票'][id]}>{!inkOnly && <image href="/assets/remake/parts/photo-back.webp" width="700" height="920" preserveAspectRatio="none"/>}
 <g fill="#494333" fontFamily="serif" textAnchor="middle">
 {date ? <><text x="350" y="150" fontSize="38">受付日</text><text x="350" y="430" fontSize="112">九月</text><text x="350" y="620" fontSize="142">八日</text><path d="M95 235H605M95 765H605" stroke="#8c8063"/><text x="350" y="835" fontSize="26">きさらぎ駅</text></> : id === 1 ? <><text x="350" y="150" fontSize="54">臨時運休</text><path d="M90 210H610" stroke="#857559"/><text x="350" y="310" fontSize="40">九月八日</text><text x="350" y="485" fontSize="73">22:18</text><text x="350" y="600" fontSize="34">臨時便の受付を休止</text><text x="350" y="805" fontSize="27">駅務係</text></> : <><text x="350" y="125" fontSize="45">乗車受付時刻</text><text x="350" y="195" fontSize="30">{old ? '八月一日 改正' : '九月一日 改正'}</text><text x="350" y="270" fontSize="28">白沢方面</text><path d="M110 310H590V785H110Z M110 380H590M110 461H590M110 542H590M110 623H590M110 704H590M300 310V785" fill="none" stroke="#746a53" strokeWidth="2"/><text x="205" y="354" fontSize="28">区分</text><text x="445" y="354" fontSize="28">時　分</text>{times.map((time, i) => <g key={time}><text x="205" y={435 + i * 81} fontSize="29">{!old && i === 4 ? '臨時' : '定期'}</text><text x="445" y={438 + i * 81} fontSize="42">{time}</text></g>)}<text x="350" y="855" fontSize="25">きさらぎ駅</text></>}
 </g></svg>;
}
export function ServiceRecords({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const ids = s.locations.counterRecords === 'inventory' ? [0, 1, 2, 3] : [0, 1];
    const [index, setIndex] = useState(0), [compare, setCompare] = useState(false), [zoom, setZoom] = useState(false);
    return <section className={'rm-service-records ' + (compare ? 'rm-record-grid' : '') + (zoom ? ' rm-record-zoom' : '')}><div className="rm-service-sheets">{(compare ? ids : [ids[index % ids.length]]).map(id => <figure key={id}><RecordCard id={id}/></figure>)}</div><div className="rm-document-controls">{!compare && <><button aria-label="前の紙" onClick={() => setIndex((index + ids.length - 1) % ids.length)}>〈</button><button aria-label="次の紙" onClick={() => setIndex((index + 1) % ids.length)}>〉</button></>}<button onClick={() => setCompare(!compare)}>{compare ? '一枚ずつ見る' : '並べて見る'}</button><button onClick={() => setZoom(!zoom)}>{zoom ? '全体を見る' : '拡大する'}</button><button onClick={() => { dispatch({ type: 'record', id: 'serviceRecords', values: ids }); say('帳票を記録した。'); }}>記録に残す</button></div></section>;
}
export function ServiceRecordNote({ ids }: {
    ids: number[];
}) { return <div className="rm-service-note">{ids.map(id => <RecordCard key={id} id={id}/>)}</div>; }
