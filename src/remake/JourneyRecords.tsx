import { useSceneBack } from './SceneBack';
import { useState } from 'react';
import { JourneyPhoto } from './JourneyPhoto';
import { TicketPaper } from './TicketBench';
import { journeyExamples, journeyExtractViews } from './journeyExamples';
import { arrivalTicket } from './arrivalTicket';
import { owns } from './model';
import type { Action, Node, State, Ticket } from './model';
const names: Record<Node, string> = { A: '踏切', B: '給水槽', C: '保守小屋', D: '鉄塔', E: '分岐橋', F: 'トンネル' };
function TicketExtract({ ticket, back = false, highlight }: {
    ticket: Ticket;
    back?: boolean;
    highlight?: number;
}) {
    const t = { ...ticket, back };
    const views = journeyExtractViews(back);
    return <div className={'rm-journey-fragments' + (back ? ' back' : '')} role="img" aria-label="券の端と二つの列の部分写し">
        <div className="rm-journey-edge"><TicketPaper ticket={t} view={views.edge}/></div>
        <div className="rm-journey-middle"><TicketPaper ticket={t} view={views.middle} highlightColumn={highlight}/></div>
    </div>;
}
export function JourneyRecords({ s, dispatch, say, sketch }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (text: string) => void;
    sketch: () => void;
}) {
    const index = Math.max(0, Math.min(3, s.values.journeySelected?.[0] ?? 0));
    const selected = Math.max(0, Math.min(1, s.values.journeyStop?.[0] ?? 0));
    const [frame, setFrame] = useState<number | null>(null);
    const backs = s.values.journeyBacks ?? [];
    const record = journeyExamples[index], column = record.observed[selected], hole = record.ticket.holes[column];
    const [paperOnly, setPaperOnly] = useState(false);
    useSceneBack(frame !== null || paperOnly, () => { setFrame(null); setPaperOnly(false); });
    const arrivalCompare = s.values.journeyArrivalCompare?.[0] === 1;
    const setArrivalCompare = (value: boolean) => dispatch({ type: 'values', id: 'journeyArrivalCompare', values: [Number(value)] });
    const choose = (n: number) => { dispatch({ type: 'values', id: 'journeySelected', values: [n] }); dispatch({ type: 'values', id: 'journeyStop', values: [0] }); setFrame(null); };
    return <section className={'rm-journey-records' + (paperOnly ? ' paper-only' : '')} aria-label="乗車券控の連続写真と部分写し">
        <div className="rm-journey-header"><span className="rm-journey-current">控え {record.id}</span>{owns(s, 'envelope') && <button className="rm-journey-map" aria-label="路線の略図を見る" onClick={sketch}>略図</button>}</div>
        <div className="rm-journey-scroll">
        {!paperOnly && <p className="rm-operation-note">選んだ列の連続写真を、同じ列の部分写しと照合する。</p>}
        <div className="rm-journey-layout">
            {!paperOnly && <div className="rm-journey-film">
                <nav className="rm-journey-stops" aria-label="写真の順序">{record.observed.map((col, i) => <button key={col} aria-pressed={selected === i} onClick={() => { dispatch({ type: 'values', id: 'journeyStop', values: [i] }); setFrame(null); }}>{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][col]}列</button>)}</nav>
                <div className={"rm-journey-frames" + (frame !== null ? " is-single" : "")}>{(frame === null ? [0, 1] : [frame]).map(f => <figure className="rm-print" key={index + ':' + selected + ':' + f}>
                    <button className="rm-journey-photo-open" aria-label={frame === null ? `${f + 1}枚目の写真を大きく見る` : '二枚を並べる'} onClick={() => setFrame(frame === null ? f : null)}>
                        <JourneyPhoto node={hole.node} side={hole.side} incoming={record.path[column]} frame={f as 0 | 1} label={names[hole.node] + 'と標柱の連続写真'} zoomable={false}/>
                        <span className="rm-journey-photo-symbol" aria-hidden="true">{frame === null ? '＋' : '−'}</span>
                    </button><figcaption>{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][column]}-{f + 1}</figcaption>
                </figure>)}</div>

            </div>}
            <div className={'rm-journey-papers' + (!paperOnly ? ' compare' : '')}>
                {(paperOnly ? [index] : [0, 1, 2, 3]).map(i => {
            const r = journeyExamples[i];
            return <figure key={i} className={'rm-journey-extract' + (i === index ? ' selected' : '')}>
                    <button className="rm-journey-ticket-open" aria-label={'控え' + r.id + (paperOnly ? 'の一覧へ戻る' : 'の写真と部分写しを選ぶ')} aria-pressed={i === index} onClick={() => { if (paperOnly) setPaperOnly(false); else choose(i); }}>
                        <span className="rm-journey-heading">{r.id}　{r.title}</span>
                        <TicketExtract ticket={r.ticket} back={backs.includes(i)} highlight={column}/>
                    </button>
                    {!paperOnly && i === index && <button className="rm-journey-enlarge" aria-label={'控え' + r.id + 'を大きく見る'} onClick={() => setPaperOnly(true)}>＋</button>}
                    <figcaption>券の部分写　Ⅱ・Ⅲ列　{backs.includes(i) ? '裏' : '表'}</figcaption><button className="rm-journey-flip" aria-label={'控え' + r.id + 'を裏返す'} onClick={() => dispatch({ type: 'values', id: 'journeyBacks', values: backs.includes(i) ? backs.filter(n => n !== i) : [...backs, i] })}>裏返す</button>
                </figure>;
        })}
            </div>
        </div>
        {arrivalCompare && owns(s, 'ownTicket') && <figure className="rm-arrival-comparison"><figcaption>手元の到着券</figcaption><TicketPaper ticket={{ ...arrivalTicket, back: s.values.arrivalTicketBack?.[0] === 1 }}/><button onClick={() => dispatch({ type: 'values', id: 'arrivalTicketBack', values: [s.values.arrivalTicketBack?.[0] === 1 ? 0 : 1] })}>到着券を裏返す</button></figure>}
        </div><div className="rm-document-controls rm-journey-controls">
            {owns(s, 'ownTicket') && <button aria-pressed={arrivalCompare} onClick={() => setArrivalCompare(!arrivalCompare)}>{arrivalCompare ? '到着券をしまう' : '到着券と比べる'}</button>}
            <button onClick={() => { dispatch({ type: 'record', id: 'journey-record-' + index + '-' + selected, values: [index, selected, backs.includes(index) ? 1 : 0] }); say('この控えを記録した。'); }}>記録に残す</button>
        </div>
    </section>;
}
export function JourneyRecordNote({ values }: {
    values: number[];
}) {
    const index = Math.max(0, Math.min(3, values[0] ?? 0)), stop = Math.max(0, Math.min(1, values[1] ?? 0));
    const r = journeyExamples[index], hole = r.ticket.holes[r.observed[stop]];
    return <div className="rm-journey-note"><p>{r.id}　{r.title}</p><div>{[0, 1].map(frame => <figure key={frame}><JourneyPhoto node={hole.node} side={hole.side} incoming={r.path[r.observed[stop]]} frame={frame as 0 | 1} label={names[hole.node] + 'の連続写真 ' + (frame + 1)}/></figure>)}</div><TicketExtract ticket={r.ticket} back={values[2] === 1}/></div>;
}
