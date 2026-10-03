import { useSceneBack } from './SceneBack';
import { DeskTabs } from './DeskTabs';
import { BenchFixtures } from './BenchFixtures';
import type { CSSProperties } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Photo, Patch, Touch } from './Photo';
import { CutShape } from './CutShape';
import { dieOrder } from './ticketGeometry';
import { selectedDeskTool } from './model';
import type { Action, State } from './model';
import { useCompact } from './useCompact';
export const toolNames = ['Ⅰ', 'Ⅱ', 'Ⅲ'];
const dieNames = ['丸形', '長方形', '半円形', '三角形', '菱形', '星形'];
export const toolX = [150, 580, 1010];
const slotPoint = (slot: number) => ({ x: 90 + slot % 6 * 180, y: slot < 6 ? 45 : 255 });
export function PunchGraphic({ tool, transform, closed = false }: {
    tool: number;
    transform: string;
    closed?: boolean;
}) {
    return <g data-desk-tool={tool} transform={transform} style={{ filter: 'drop-shadow(2px 4px 2px #0009)' }}><image href={'./assets/remake/parts/punch-' + (closed ? 'closed' : 'open') + '.png'} width="1536" height="1024"/>
    <text x="440" y="355" fontFamily="serif" fontSize="150" fill="#35332c" transform="rotate(13 440 355)">{toolNames[tool]}</text>
  </g>;
}
export function ToolTools({ s, lifted, largeLabels = false }: { s: State; lifted?: number; largeLabels?: boolean }) {
    const selected = selectedDeskTool(s);
    return <>{toolX.map((x, i) => i !== lifted && <g key={i}>
        <PunchGraphic tool={i} transform={`translate(${x} 210) scale(.26)`}/>
        <text x={x + 205} y="516" textAnchor="middle" fontFamily="serif" fontSize={largeLabels ? 44 : 26} fill="#bdb199">{toolNames[i]}</text>
        {selected === i && <path d={`M${x+168} 526h74`} stroke="#d3c396" strokeWidth="3"/>}
    </g>)}</>;
}
export function TrialSheet({ cuts, onCut, annotate = false, busy = false }: {
    cuts: number[];
    onCut?: (slot: number) => void;
    annotate?: boolean;
    busy?: boolean;
}) {
    const id = useId().replaceAll(':', '');
    const entries = Array.from({ length: cuts.length / 3 }, (_, i) => ({ tool: cuts[i * 3], die: cuts[i * 3 + 1], slot: cuts[i * 3 + 2] }));
    return <svg className="rm-trial-paper" viewBox="0 0 1080 300" role={onCut ? 'group' : 'img'} aria-label="試し切りの紙">
    <defs><mask id={id}><path d="M3 4L1077 1L1080 296L0 300Z" fill="white"/>{entries.map((cut, i) => {
            const p = slotPoint(cut.slot);
            return <g key={i} transform={`translate(${p.x} ${p.y}) scale(1.7)`}><CutShape cut={{ node: dieOrder[cut.die], tool: cut.tool }} fill="black"/></g>;
        })}</mask></defs>
    <image href="./assets/remake/parts/photo-back.webp" width="1080" height="300" preserveAspectRatio="none" mask={`url(#${id})`}/>
    {Array.from({ length: 12 }, (_, slot) => {
            const p = slotPoint(slot), used = [...new Set(entries.filter(e => e.slot === slot).map(e => toolNames[e.tool]))];
            return <g key={slot}>
        {onCut && <path d={`M${p.x - 8} ${slot < 6 ? 10 : 290}h16`} fill="none" stroke="#766b51" strokeWidth="1.4" opacity=".7"/>}
        {annotate && <text x={p.x} y={slot < 6 ? 120 : 202} fill="#625a47" textAnchor="middle" fontFamily="serif" fontSize="23">{used.join('・')}</text>}
        {onCut && <g role="button" tabIndex={0} className="rm-paper-cut-target" aria-label={`試し紙の${slot + 1}箇所目を切る`} aria-disabled={busy} onClick={() => !busy && onCut(slot)} onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!busy) onCut(slot);
                        }
                    }}><rect x={p.x - 85} y={slot < 6 ? 0 : 150} width="170" height="150" fill="transparent"/></g>}
      </g>;
        })}
  </svg>;
}
export function ToolTrial({ s, dispatch, say, openTicket, records }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    openTicket: () => void;
    records: () => void;
}) {
    const compact = useCompact(), selected = selectedDeskTool(s), die = s.values.ticketDie?.[0] ?? 0, hasDie = s.values.ticketDie !== undefined, cuts = s.values.toolCuts ?? [];
    const [detail, setDetail] = useState<'wide' | 'paper' | 'tools' | 'dies'>(compact ? selected === null ? 'tools' : hasDie ? 'paper' : 'dies' : 'wide');
    const [cutSlot, setCutSlot] = useState<number | null>(null);
    const busy = cutSlot !== null, timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useSceneBack(compact && detail !== 'wide', () => setDetail('wide'));
    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
    const p = cutSlot === null ? null : slotPoint(cutSlot), point = p ? { x: 330 + p.x, y: 560 + p.y } : null;
    const view: [number, number, number, number] | undefined = !compact || detail === 'wide' ? undefined : detail === 'paper' ? [300, 530, 1120, 360] : detail === 'dies' ? [460, 20, 640, 210] : [145, 200, 1265, 340];
    function cut(slot: number) {
        if (selected === null || !hasDie || busy) return;
        if (cuts.length >= 648) { say('新しい試し紙を出せる。'); return; }
        dispatch({ type: 'toolCut', tool: selected, die, slot });
        setCutSlot(slot);
        timer.current = setTimeout(() => setCutSlot(null), 200);
    }
    return <section className="rm-tool-trial" data-selected-tool={selected ?? ''} style={{ '--trial-ratio': view ? view[2] / view[3] : 1672 / 941 } as CSSProperties}>
    <DeskTabs active="tools" disabled={busy} change={next => { if (next === 'ticket') openTicket(); }}/>
    <Photo src="./assets/remake/ticket/bench.webp" label="三本の鋏と試し紙" view={view}><Patch src="./assets/remake/ticket/empty-stamp.webp" rect={[71.2, 0, 10.3, 30]}/>
    <svg className="rm-object-overlay" viewBox="0 0 1672 941">
        <BenchFixtures die={selected !== null && hasDie ? die : -1} service={s.values.stampSetting?.[0] ?? 1}/><ToolTools s={s} lifted={point && selected !== null ? selected : undefined} largeLabels={compact && detail === 'tools'}/>
        <foreignObject x="330" y="560" width="1080" height="300"><TrialSheet cuts={cuts} busy={busy} onCut={selected !== null && hasDie && (!compact || detail === 'paper') ? cut : undefined}/></foreignObject>
        {point && selected !== null && <PunchGraphic tool={selected} closed transform={`translate(${point.x} ${point.y}) rotate(${cutSlot! < 6 ? -90 : 90}) scale(.25) translate(-142 -230)`}/>}
    </svg>
    {(!compact || detail === 'tools') && toolX.map((x, i) => <Touch key={i} name={`${toolNames[i]}の鋏を選ぶ`} rect={[(x + 30) / 1672 * 100, 22, 20, 35]} act={() => {
        if (busy) return;
        dispatch({ type: 'selectTool', tool: i });
        if (compact) setDetail(hasDie ? 'paper' : 'dies');
    }}/>)}
    {(!compact || detail === 'dies') && dieOrder.map((_, i) => <Touch key={i} name={`${dieNames[i]}の刃を選ぶ`} rect={[29.2 + i * 5.88, 4.8, 5.5, 11]} act={() => {
        if (busy) return;
        dispatch({ type: 'selectDie', die: i });
        if (compact) setDetail(selected === null ? 'tools' : 'paper');
    }}/>)}
    {!s.mounted && (!compact || detail === 'wide') && <Touch name="紙の束から切符を一枚取る" rect={[86, 17, 12, 21]} act={() => { if (!busy) { dispatch({ type: 'newTicket' }); openTicket(); } }}/>}
    {compact && detail === 'wide' && <><Touch name="三本の鋏を近くで見る" rect={[10, 21, 75, 36]} act={() => setDetail('tools')}/><Touch name="試し紙を近くで見る" rect={[19, 59, 65, 32]} act={() => setDetail('paper')}/><Touch name="試す刃を近くで見る" rect={[28, 3, 37, 21]} act={() => setDetail('dies')}/></>}
    {(!compact || detail === 'wide') && <Touch name="乗車券控を見る" rect={[0, 18, 10, 42]} act={records}/>}
    </Photo>
    <div className="rm-document-controls rm-tool-controls"><span className="rm-tool-state">鋏：{selected === null ? '未選択' : toolNames[selected]}　刃：{hasDie ? dieNames[die] : '未選択'}</span>
    {cuts.length > 0 && <><button disabled={busy} onClick={() => dispatch({ type: 'newTrialPaper' })}>新しい試し紙</button><button disabled={busy} onClick={() => { dispatch({ type: 'record', id: 'toolTrial', values: cuts }); say('試し切りを記録した。'); }}>記録に残す</button></>}
    </div><p className="rm-operation-note">鋏と刃を選び、紙の切る位置を押す</p></section>;
}
