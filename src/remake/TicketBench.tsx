import { useSceneBack } from './SceneBack';
import { DeskTabs } from './DeskTabs';
import { TicketDecoration } from './TicketDecoration';
import { PaperEdgeFilter } from './PaperEdgeFilter';
import { BenchStamp } from './BenchFixtures';
import { PunchGraphic, toolNames, ToolTools, toolX } from './ToolTrial';
import { useCompact } from './useCompact';
import { useModal } from './useModal';
import { useEffect, useId, useRef, useState } from 'react';
import { Photo, Patch, Touch } from './Photo';
import type { Action, Hole, State, Ticket } from './model';
import { dieOrder } from './ticketGeometry';
import { CutShape } from './CutShape';
import { owns, selectedDeskTool } from './model';
const dieNames = ['丸形', '長方形', '半円形', '三角形', '菱形', '星形'];
const paperOutline = 'M0 0H800V235H0V70A18 18 0 0 0 0 34V0Z';
export function TicketPaper({ ticket, onCut, view, returnMark, highlightColumn, busy = false }: {
    ticket: Ticket;
    returnMark?: boolean;
    highlightColumn?: number;
    onCut?: (column: number, side: 'white' | 'black') => void;
    busy?: boolean;
    view?: [
        number,
        number,
        number,
        number
    ];
}) {
    const id = useId().replaceAll(':', '');
    const marks = ticket.marks ?? (ticket.stamps ?? (ticket.service ? [ticket.service] : [])).map(service => ({ service, back: false }));
    return <svg viewBox={view ? view.join(' ') : '-4 -4 808 243'} className="rm-ticket-paper" aria-label="切った孔が残る乗車券">
 <defs><PaperEdgeFilter id={id + "edge"}/><mask id={id} maskUnits="userSpaceOnUse" x="-4" y="-4" width="808" height="243"><path d={paperOutline} fill="white"/>{ticket.holes.map((h, i) => <g key={i} transform={`translate(${80 + h.column * 160} ${h.side === 'white' ? 35 : 200})`}><CutShape cut={h} fill="black"/></g>)}</mask></defs>
 <g filter={`url(#${id}edge)`}><g transform={ticket.back ? 'translate(800 0) scale(-1 1)' : undefined}>
 <g mask={`url(#${id})`}><image href="./assets/remake/parts/photo-back.webp" width="800" height="235" preserveAspectRatio="none"/>
 <TicketDecoration id={id}/>
 <path d="M12 87H788V148H12Z" fill="#ae8152" opacity=".12"/>

 {highlightColumn !== undefined && <rect x={highlightColumn * 160 + 3} y="4" width="154" height="226" fill="#aa884a" fillOpacity=".09" stroke="#8e7543" strokeWidth="2"/>}
 <g fill="#565340" stroke="#696753" opacity={ticket.back ? .3 : .85} fontFamily="serif"><path d="M18 83H782M18 152H782" fill="none" strokeWidth="1.1"/>{[0, 1, 2, 3, 4].map(c => <g key={c}><path d={`M${c * 160} 9V226`} strokeWidth=".7"/><text x={80 + c * 160} y="126" textAnchor="middle" stroke="none" fontSize="24">{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][c]}</text></g>)}<text x="28" y="177" stroke="none" fontSize="14" fontWeight="bold" letterSpacing="2">普通乗車券</text></g>
 {marks.map((m, i) => <g key={i} transform={m.back ? 'translate(800 0) scale(-1 1)' : undefined} opacity={m.back === ticket.back ? .85 : .22}><text x={770 - i % 2 * 2} y={178 + i % 2 * 2} fill="#813e30" fontFamily="serif" fontSize="19" textAnchor="end">第 {m.service} 便</text></g>)}
 {returnMark && ticket.back && <g transform="translate(570 111) rotate(-11)" fill="none" stroke="#503933" strokeWidth="2.4" opacity=".63"><circle r="22"/><path d="M-11 12V-9H9M-11 2H4L12-8M-2 2V13"/></g>}
 </g></g></g>
 {onCut && [0, 1, 2, 3, 4].flatMap(c => (['white', 'black'] as const).map(side => <g key={c + side} role="button" tabIndex={0} className="rm-paper-cut-target" aria-label={`${c + 1}列目・切欠きから${side === 'white' ? '近い' : '遠い'}縁を切る`} aria-disabled={busy} onClick={() => !busy && onCut(c, side)} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!busy) onCut(c, side);
                }
            }}><rect x={(ticket.back ? 4 - c : c) * 160 + 5} y={side === 'white' ? 0 : 120} width="150" height="115" fill="transparent"/></g>))}
 </svg>;
}
function TicketChads({ tickets }: {
    tickets: Ticket[];
}) {
    const id = useId().replaceAll(':', '');
    const cuts = tickets.flatMap(t => t.holes.map((h, i) => ({ hole: h, previous: t.holes.slice(0, i).filter(p => p.column === h.column && p.side === h.side) }))).slice(-8);
    return <g>{cuts.map(({ hole, previous }, i) => <g key={i} transform={`translate(${550 + i * 49} ${845 + i % 2 * 23}) rotate(${i * 37})`} style={{ filter: 'drop-shadow(1px 2px 1px #0008)' }}><defs><mask id={id + i} x="-24" y="-24" width="48" height="48" maskUnits="userSpaceOnUse"><CutShape cut={hole} fill="white"/>{previous.map((p, j) => <CutShape key={j} cut={p} fill="black"/>)}</mask></defs><g mask={`url(#${id + i})`}><image href="./assets/remake/parts/photo-back.webp" x="-24" y="-24" width="48" height="48" preserveAspectRatio="none"/></g></g>)}</g>;
}
export function TicketBench({ s, dispatch, records, tools }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    records: () => void;
    tools: () => void;
}) {
    const compact = useCompact(), hasPaper = owns(s, 'ticket') && s.draft !== null, selected = selectedDeskTool(s), hasDie = s.values.ticketDie !== undefined;
    const [detail, setDetail] = useState<'wide' | 'paper' | 'dies' | 'stamp' | 'tools'>(s.draft ? 'paper' : 'wide');
    const crop: [number, number, number, number] | undefined = !compact || detail === 'wide' ? undefined : detail === 'paper' ? [370, 510, 940, 355] : detail === 'dies' ? [450, 15, 650, 245] : detail === 'tools' ? [145, 200, 1265, 340] : [1120, 0, 340, 340];
    const [cutPoint, setCutPoint] = useState<Omit<Hole, 'node'> | null>(null), [archive, setArchive] = useState(false), [stamping, setStamping] = useState(false);
    const busy = cutPoint !== null || stamping;
    useSceneBack(compact && detail !== 'wide', () => setDetail('wide'));
    const archiveRef = useModal(archive, () => setArchive(false)), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
    const die = s.values.ticketDie?.[0] ?? 0, stamp = s.values.stampSetting?.[0] ?? 1, paperY = 560;
    const point = cutPoint ? { x: 510 + (s.draft?.back ? 4 - cutPoint.column : cutPoint.column) * 160, y: paperY + (cutPoint.side === 'white' ? 35 : 200) } : null;
    function cut(column: number, side: 'white' | 'black') {
        if (selected === null || !hasDie || !hasPaper || busy) return;
        dispatch({ type: 'punch', hole: { column, side, node: dieOrder[die] } });
        setCutPoint({ column, side });
        timer.current = setTimeout(() => setCutPoint(null), 200);
    }
    return <section className="rm-ticket-bench" data-selected-tool={selected ?? ''}>
    <DeskTabs active="ticket" disabled={busy} change={next => { if (next === 'tools') tools(); }}/>
    <Photo view={crop} src="./assets/remake/ticket/bench.webp" label="刃と切符を置いた駅務室の机">
    {selected !== null && hasDie && <Patch src="./assets/remake/ticket/empty-rack.webp" rect={[28.3 + die * 5.88, 4, 6.1, 12]}/>}
    <Patch src="./assets/remake/ticket/empty-stamp.webp" rect={[71.2, 0, 10.3, 30]}/>
    <svg className="rm-ticket-work" viewBox="0 0 1672 941"><ToolTools s={s} lifted={point && selected !== null ? selected : undefined} largeLabels={compact && detail === 'tools'}/>
        {hasPaper && s.draft && <foreignObject x="426" y={paperY - 4} width="808" height="243"><TicketPaper ticket={s.draft} busy={busy} onCut={selected !== null && hasDie && (!compact || detail === 'paper') ? cut : undefined}/></foreignObject>}
        <TicketChads tickets={[...s.savedTickets, ...(s.mounted ? [s.mounted] : []), ...(s.draft ? [s.draft] : [])]}/>
        {point && selected !== null && <PunchGraphic tool={selected} closed transform={`translate(${point.x} ${point.y}) rotate(${cutPoint!.side === 'white' ? -90 : 90}) scale(.33) translate(-142 -230)`}/>}
        <BenchStamp service={stamp} transform={stamping ? `translate(-55 ${paperY - 70})` : undefined}/>
    </svg>
    {(!compact || detail === 'tools') && toolX.map((x, i) => <Touch key={i} name={`${toolNames[i]}の鋏を選ぶ`} rect={[(x + 30) / 1672 * 100, 22, 20, 35]} act={() => { if (!busy) { dispatch({ type: 'selectTool', tool: i }); if (compact) setDetail(hasDie ? 'paper' : 'dies'); } }}/>)}
    {(!compact || detail === 'dies') && dieOrder.map((_, i) => <Touch key={i} name={dieNames[i] + 'の刃を選ぶ'} rect={[29.2 + i * 5.88, 4.8, 5.5, 11]} act={() => { if (!busy) { dispatch({ type: 'selectDie', die: i }); if (compact) setDetail('paper'); } }}/>) }
    {(!compact || detail === 'stamp') && <><Touch name="便印の輪を回す" rect={[72, 16, 7.5, 11]} act={() => { if (!busy) dispatch({ type: 'values', id: 'stampSetting', values: [stamp % 6 + 1] }); }}/>
    <Touch name="便印を押す" rect={[73, 0, 7, 15]} act={() => { if (!hasPaper || busy) return; setStamping(true); dispatch({ type: 'ticketService', service: stamp }); timer.current = setTimeout(() => { setStamping(false); if (compact) setDetail('paper'); }, 240); }}/></>}
    {!s.mounted && (!compact || detail === 'wide') && <Touch name="紙の束から切符を一枚取る" rect={[86, 17, 12, 21]} act={() => { if (!busy) { dispatch({ type: 'newTicket' }); setDetail('paper'); } }}/>}
    {compact && detail === 'wide' && <><Touch name="三本の鋏を近くで見る" rect={[10, 21, 75, 36]} act={() => setDetail('tools')}/><Touch name="切符を近くで見る" rect={[25, 59, 52, 27]} act={() => setDetail('paper')}/><Touch name="刃置き場を近くで見る" rect={[28, 3, 37, 21]} act={() => setDetail('dies')}/><Touch name="便印を近くで見る" rect={[71, 0, 12, 31]} act={() => setDetail('stamp')}/></>}
    {(!compact || detail === 'wide') && <Touch name="乗車券控を見る" rect={[0, 23, 12, 45]} act={records}/>}
    </Photo>
    {archive && <div ref={archiveRef} className="rm-ticket-archive" role="dialog" aria-modal="true" aria-label="切った券の比較"><div>{[...s.savedTickets, ...(s.draft ? [s.draft] : [])].map(t => <figure key={t.id}><TicketPaper ticket={t}/><figcaption>{t.id === s.draft?.id ? '手元の券' : '前に切った券'}</figcaption></figure>)}</div><div className="rm-document-controls"><button onClick={() => setArchive(false)}>机へ戻す</button></div></div>}
    <div className="rm-ticket-actions">{hasPaper && (!compact || detail === 'paper') && <button disabled={busy} onClick={() => dispatch({ type: 'flipTicket' })}>券を裏返す</button>}{(s.savedTickets.length > 0 || (s.draft?.holes.length ?? 0) > 0) && <button disabled={busy} onClick={() => setArchive(true)}>切った券を見る</button>}<span className="rm-tool-state">鋏：{selected === null ? '未選択' : toolNames[selected]}　刃：{hasDie ? dieNames[die] : '未選択'}</span></div>
    </section>;
}
