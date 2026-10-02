import { useSceneBack } from './SceneBack';
import { DeskTabs } from './DeskTabs';
import { TicketDecoration } from './TicketDecoration';
import { PaperEdgeFilter } from './PaperEdgeFilter';
import { BenchStamp } from './BenchFixtures';
import { PunchGraphic, toolNames } from './ToolTrial';
import { useCompact } from './useCompact';
import { useModal } from './useModal';
import { useEffect, useId, useRef, useState } from 'react';
import { Photo, Patch, Touch } from './Photo';
import type { Action, Hole, State, Ticket } from './model';
import { dieOrder } from './ticketGeometry';
import { CutShape } from './CutShape';
import { owns } from './model';
const dieNames = ['丸形', '長方形', '半円形', '三角形', '菱形', '星形'];
const paperOutline = 'M0 0H800V235H0V70A18 18 0 0 0 0 34V0Z';
export function TicketPaper({ ticket, aim, view, returnMark, highlightColumn }: {
    ticket: Ticket;
    returnMark?: boolean;
    highlightColumn?: number;
    aim?: (column: number, side: 'white' | 'black') => void;
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
 <g mask={`url(#${id})`}><image href="/assets/remake/parts/photo-back.webp" width="800" height="235" preserveAspectRatio="none"/>
 <TicketDecoration id={id}/>
 <path d="M12 87H788V148H12Z" fill="#ae8152" opacity=".12"/>

 {highlightColumn !== undefined && <rect x={highlightColumn * 160 + 3} y="4" width="154" height="226" fill="#aa884a" fillOpacity=".09" stroke="#8e7543" strokeWidth="2"/>}
 <g fill="#565340" stroke="#696753" opacity={ticket.back ? .3 : .85} fontFamily="serif"><path d="M18 83H782M18 152H782" fill="none" strokeWidth="1.1"/>{[0, 1, 2, 3, 4].map(c => <g key={c}><path d={`M${c * 160} 9V226`} strokeWidth=".7"/><text x={80 + c * 160} y="126" textAnchor="middle" stroke="none" fontSize="24">{['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'][c]}</text></g>)}<text x="28" y="177" stroke="none" fontSize="14" fontWeight="bold" letterSpacing="2">普通乗車券</text></g>
 {marks.map((m, i) => <g key={i} transform={m.back ? 'translate(800 0) scale(-1 1)' : undefined} opacity={m.back === ticket.back ? .85 : .22}><text x={770 - i % 2 * 2} y={178 + i % 2 * 2} fill="#813e30" fontFamily="serif" fontSize="19" textAnchor="end">第 {m.service} 便</text></g>)}
 {returnMark && ticket.back && <g transform="translate(570 111) rotate(-11)" fill="none" stroke="#503933" strokeWidth="2.4" opacity=".63"><circle r="22"/><path d="M-11 12V-9H9M-11 2H4L12-8M-2 2V13"/></g>}
 </g></g></g>
 {aim && [0, 1, 2, 3, 4].flatMap(c => (['white', 'black'] as const).map(side => <g key={c + side} role="button" tabIndex={0} className="rm-paper-cut-target" aria-label={`${c + 1}列目・切欠きから${side === 'white' ? '近い' : '遠い'}縁に鋏を差す`} onClick={() => aim(c, side)} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    aim(c, side);
                }
            }}><rect x={(ticket.back ? 4 - c : c) * 160 + 30} y={side === 'white' ? 3 : 166} width="100" height="66" fill="transparent"/></g>))}
 </svg>;
}
function TicketChads({ tickets }: {
    tickets: Ticket[];
}) {
    const id = useId().replaceAll(':', '');
    const cuts = tickets.flatMap(t => t.holes.map((h, i) => ({ hole: h, previous: t.holes.slice(0, i).filter(p => p.column === h.column && p.side === h.side) }))).slice(-8);
    return <g>{cuts.map(({ hole, previous }, i) => <g key={i} transform={`translate(${550 + i * 49} ${740 + i % 2 * 23}) rotate(${i * 37})`} style={{ filter: 'drop-shadow(1px 2px 1px #0008)' }}><defs><mask id={id + i} x="-24" y="-24" width="48" height="48" maskUnits="userSpaceOnUse"><CutShape cut={hole} fill="white"/>{previous.map((p, j) => <CutShape key={j} cut={p} fill="black"/>)}</mask></defs><g mask={`url(#${id + i})`}><image href="/assets/remake/parts/photo-back.webp" x="-24" y="-24" width="48" height="48" preserveAspectRatio="none"/></g></g>)}</g>;
}
export function TicketBench({ s, dispatch, say, records, tools }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    records: () => void;
    tools: () => void;
}) {
    const compact = useCompact(), hasPaper = owns(s, 'paper'), hasTool = owns(s, 'punch'), hasDie = s.values.ticketDie !== undefined;
    const [detail, setDetail] = useState<'wide' | 'paper' | 'dies' | 'stamp'>('wide');
    const crop: [
        number,
        number,
        number,
        number
    ] | undefined = !compact || detail === 'wide' ? undefined : detail === 'paper' ? [370, 100, 940, 800] : detail === 'dies' ? [450, 15, 650, 245] : [1120, 0, 340, 340];
    const [aim, setAim] = useState<Omit<Hole, 'node'> | null>(null), [squeezed, setSqueezed] = useState(false), [archive, setArchive] = useState(false), [stamping, setStamping] = useState(false);
    useSceneBack(Boolean(aim) && !squeezed && !stamping, () => setAim(null), 35);
    useSceneBack(compact && detail !== 'wide', () => { setAim(null); setDetail('wide'); });
    const archiveRef = useModal(archive, () => setArchive(false));
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    const die = s.values.ticketDie?.[0] ?? 0, stamp = s.values.stampSetting?.[0] ?? 1;
    const paperY = s.values.ticketPaperY?.[0] ?? 420;
    const point = aim ? { x: 430 + 80 + (s.draft.back ? 4 - aim.column : aim.column) * 160, y: paperY + (aim.side === 'white' ? 35 : 200) } : null;
    const toolTransform = point ? `translate(${point.x} ${point.y}) rotate(${aim!.side === 'white' ? -90 : 90}) scale(.33) translate(-142 -230)` : 'translate(1240 590) scale(.25)';
    const clipId = useId().replaceAll(':', '');
    function cut() {
        if (!aim || squeezed || stamping)
            return;
        dispatch({ type: 'punch', hole: { ...aim, node: dieOrder[die] } });
        setSqueezed(true);
        timer.current = setTimeout(() => { setSqueezed(false); setAim(null); }, 260);
    }
    const tool = (upper = false) => <g transform={toolTransform} clipPath={upper && point ? `url(#${clipId})` : undefined}>{hasTool && <PunchGraphic tool={s.values.punchTool?.[0] ?? 1} closed={squeezed} transform="translate(0 0)"/>}</g>;
    return <section className="rm-ticket-bench"><DeskTabs active="ticket" disabled={squeezed || stamping} change={next => { if (next === 'tools') tools(); }}/><Photo view={crop} src="/assets/remake/ticket/bench.webp" label="刃と用紙を置いた駅務室の机">
 {hasTool && hasDie && <Patch src="/assets/remake/ticket/empty-rack.webp" rect={[28.3 + die * 5.88, 4, 6.1, 12]}/>}
 <Patch src="/assets/remake/ticket/empty-stamp.webp" rect={[71.2, 0, 10.3, 30]}/><svg className="rm-ticket-work" viewBox="0 0 1672 941"><defs><clipPath id={clipId}><path d="M0 0H1536V1024H480V425L20 290V245H0Z"/></clipPath></defs>
 {point && tool()}
 {hasPaper && <foreignObject x="426" y={paperY - 4} width="808" height="243"><TicketPaper ticket={s.draft} aim={!hasTool || !hasDie || compact && detail !== 'paper' ? undefined : (column, side) => {
                if (!squeezed) {
                    dispatch({ type: 'values', id: 'ticketPaperY', values: [side === 'white' ? 480 : 235] });
                    setAim({ column, side });
                }
            }}/></foreignObject>}
 <TicketChads tickets={[...s.savedTickets, ...(s.mounted ? [s.mounted] : []), s.draft]}/>
 {tool(true)}
 <BenchStamp service={stamp} transform={stamping ? `translate(-55 ${paperY - 70})` : undefined}/>
 {point && (!compact || detail === 'paper') && <g role="button" tabIndex={0} aria-label="鋏を握る" className="rm-punch-grip" onClick={cut} onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cut();
                }
            }}><circle cx={point.x + (aim!.side === 'white' ? 70 : -70)} cy={point.y + (aim!.side === 'white' ? -180 : 180)} r="80" fill="transparent"/></g>}
 </svg>
 {(!compact || detail === 'dies') && dieOrder.map((_, i) => <Touch key={i} name={dieNames[i] + 'の刃を取り付ける'} rect={[29.2 + i * 5.88, 4.8, 5.5, 11]} act={() => {
                if (!hasTool) {
                    say('鋏を手に取ってから。');
                    return;
                }
                if (!squeezed) {
                    dispatch({ type: 'values', id: 'ticketDie', values: [i] });
                    if (compact)
                        setDetail('paper');
                }
            }}/>)}
 {(!compact || detail === 'stamp') && <><Touch name="便印の輪を回す" rect={[72, 16, 7.5, 11]} act={() => dispatch({ type: 'values', id: 'stampSetting', values: [stamp % 6 + 1] })}/>
 <Touch name="便印を押す" rect={[73, 0, 7, 15]} act={() => {
                if (!hasPaper || stamping || squeezed)
                    return;
                setAim(null);
                setDetail('paper');
                setStamping(true);
                dispatch({ type: 'ticketService', service: stamp });
                timer.current = setTimeout(() => { setStamping(false); say('便印を押した。'); }, 320);
            }}/></>}
 {(!compact || detail === 'wide') && <Touch name="新しい用紙を取る" rect={[86, 17, 12, 21]} act={() => {
                if (!squeezed && !stamping) {
                    dispatch(hasPaper ? { type: 'newTicket' } : { type: 'take', item: 'paper' });
                    setDetail('paper');
                    setAim(null);
                }
            }}/>}
 {compact && detail === 'wide' && <><Touch name="用紙を近くで見る" rect={[25, 40, 52, 38]} act={() => setDetail('paper')}/><Touch name="刃置き場を近くで見る" rect={[28, 3, 37, 21]} act={() => setDetail('dies')}/><Touch name="便印を近くで見る" rect={[71, 0, 12, 31]} act={() => setDetail('stamp')}/></>}{(!compact || detail === 'wide') && <Touch name="乗車券控を見る" rect={[0, 23, 12, 45]} act={records}/>} </Photo>{archive && <div ref={archiveRef} className="rm-ticket-archive" role="dialog" aria-modal="true" aria-label="切った券の比較"><div>{[...s.savedTickets, s.draft].map(t => <figure key={t.id}><TicketPaper ticket={t}/><figcaption>{t.id === s.draft.id ? '手元の券' : '前に切った券'}</figcaption></figure>)}</div><div className="rm-document-controls"><button onClick={() => setArchive(false)}>机へ戻す</button></div></div>}<div className="rm-ticket-actions">{hasPaper && (!compact || detail === 'paper') && <button disabled={squeezed || stamping} onClick={() => { dispatch({ type: 'flipTicket' }); setAim(null); }}>券を裏返す</button>}{(s.savedTickets.length > 0 || s.draft.holes.length > 0) && <button onClick={() => setArchive(true)}>切った券を見る</button>}<span className="rm-tool-state">鋏：{hasTool ? toolNames[s.values.punchTool?.[0] ?? 1] : '机上'}　刃：{hasDie ? dieNames[die] : '未装着'}</span></div></section>;
}
