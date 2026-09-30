import { useState } from 'react';
import { Photo } from './Photo';
import { TicketPaper } from './TicketBench';
import { journeyExamples, examplePhoto, journeyExtractViews } from './journeyExamples';
import { useCompact } from './useCompact';
import type { Action, Node, State, Ticket } from './model';
const names: Record<Node, string> = { A: '踏切', B: '給水槽', C: '保守小屋', D: '鉄塔', E: '分岐橋', F: 'トンネル' };
function TicketExtract({ ticket, back = false }: {
    ticket: Ticket;
    back?: boolean;
}) {
    const t = { ...ticket, back };
    const views = journeyExtractViews(back);
    return <div className={'rm-journey-fragments' + (back ? ' back' : '')} role="img" aria-label="券の端と二つの列の部分写し">
        <div className="rm-journey-edge"><TicketPaper ticket={t} view={views.edge}/></div>
        <div className="rm-journey-middle"><TicketPaper ticket={t} view={views.middle}/></div>
    </div>;
}
export function JourneyRecords({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (text: string) => void;
}) {
    const compact = useCompact();
    const index = Math.max(0, Math.min(3, s.values.journeySelected?.[0] ?? 0));
    const selected = Math.max(0, Math.min(1, s.values.journeyStop?.[0] ?? 0));
    const frame = s.values.journeyFrame?.[0] === 1 ? 1 : 0;
    const compare = s.values.journeyCompare?.[0] === 1;
    const backs = s.values.journeyBacks ?? [];
    const record = journeyExamples[index], column = record.observed[selected], hole = record.ticket.holes[column];
    const [paperOnly, setPaperOnly] = useState(false);
    const choose = (n: number) => { dispatch({ type: 'values', id: 'journeySelected', values: [n] }); dispatch({ type: 'values', id: 'journeyStop', values: [0] }); dispatch({ type: 'values', id: 'journeyFrame', values: [0] }); };
    return <section className={'rm-journey-records' + (paperOnly ? ' paper-only' : '')} aria-label="乗車券控の連続写真と部分写し">
        <nav className="rm-journey-tabs" aria-label="控えを選ぶ">{journeyExamples.map((r, i) => <button key={r.id} aria-pressed={index === i} onClick={() => choose(i)}>{r.id}</button>)}</nav>
        <div className="rm-journey-layout">
            {!paperOnly && <div className="rm-journey-film">
                <nav className="rm-journey-stops" aria-label="写真の順序">{record.observed.map((col, i) => <button key={col} aria-pressed={selected === i} onClick={() => { dispatch({ type: 'values', id: 'journeyStop', values: [i] }); dispatch({ type: 'values', id: 'journeyFrame', values: [0] }); }}>写真 {col + 1}</button>)}</nav>
                <div className="rm-journey-frames">{(compact ? [frame] : [0, 1]).map(f => <figure className="rm-print" key={index + ':' + selected + ':' + f}><Photo src={examplePhoto(hole.node, hole.side, f as 0 | 1)} label={names[hole.node] + 'と標柱の連続写真'} zoomable zoomOrigin="50% 50%"/><figcaption>{column + 1}-{f + 1}</figcaption></figure>)}</div>
                {compact && <div className="rm-document-controls"><button onClick={() => dispatch({ type: 'values', id: 'journeyFrame', values: [1 - frame] })}>{frame ? '前の写真' : '続きの写真'}</button></div>}
            </div>}
            <div className={'rm-journey-papers' + (compare ? ' compare' : '')}>
                {(compare ? [0, 1, 2, 3] : [index]).map(i => {
            const r = journeyExamples[i];
            return <figure key={i} className={'rm-journey-extract' + (i === index ? ' selected' : '')}>
                    <button className="rm-journey-heading" aria-label={'控え' + r.id + 'を見る'} onClick={() => choose(i)}>{r.id}　{r.title}</button>
                    <TicketExtract ticket={r.ticket} back={backs.includes(i)}/>
                    <figcaption>券の部分写</figcaption>
                </figure>;
        })}
            </div>
        </div>
        <div className="rm-document-controls rm-journey-controls">
            <button onClick={() => dispatch({ type: 'values', id: 'journeyBacks', values: backs.includes(index) ? backs.filter(i => i !== index) : [...backs, index] })}>券を裏返す</button>
            <button aria-pressed={compare} onClick={() => dispatch({ type: 'values', id: 'journeyCompare', values: [compare ? 0 : 1] })}>{compare ? '一枚ずつ見る' : '券を並べる'}</button>
            <button onClick={() => setPaperOnly(!paperOnly)}>{paperOnly ? '写真と券を見る' : '券だけ見る'}</button>
            <button onClick={() => { dispatch({ type: 'record', id: 'journey-record-' + index + '-' + selected, values: [index, selected, backs.includes(index) ? 1 : 0] }); say('この控えを記録した。'); }}>記録に残す</button>
        </div>
    </section>;
}
export function JourneyRecordNote({ values }: {
    values: number[];
}) {
    const index = Math.max(0, Math.min(3, values[0] ?? 0)), stop = Math.max(0, Math.min(1, values[1] ?? 0));
    const r = journeyExamples[index], hole = r.ticket.holes[r.observed[stop]];
    return <div className="rm-journey-note"><p>{r.id}　{r.title}</p><div>{[0, 1].map(frame => <figure key={frame}><Photo src={examplePhoto(hole.node, hole.side, frame as 0 | 1)} label={names[hole.node] + 'の連続写真 ' + (frame + 1)} zoomable zoomOrigin="50% 50%"/></figure>)}</div><TicketExtract ticket={r.ticket} back={values[2] === 1}/></div>;
}
