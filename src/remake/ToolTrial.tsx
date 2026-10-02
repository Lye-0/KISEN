import { useSceneBack } from './SceneBack';
import { DeskTabs } from './DeskTabs';
import { BenchFixtures } from './BenchFixtures';
import type { CSSProperties } from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Photo, Patch, Touch } from './Photo';
import { CutShape } from './CutShape';
import { dieOrder } from './ticketGeometry';
import { owns } from './model';
import type { Action, State } from './model';
import { useCompact } from './useCompact';
export const toolNames = ['Ⅰ', 'Ⅱ', 'Ⅲ'];
const dieNames = ['丸形', '長方形', '半円形', '三角形', '菱形', '星形'];
const toolX = [150, 580, 1010];
const slotPoint = (slot: number) => ({ x: 90 + slot % 6 * 180, y: slot < 6 ? 45 : 255 });
export function PunchGraphic({ tool, transform, closed = false }: {
    tool: number;
    transform: string;
    closed?: boolean;
}) {
    return <g transform={transform} style={{ filter: 'drop-shadow(2px 4px 2px #0009)' }}><image href={'/assets/remake/parts/punch-' + (closed ? 'closed' : 'open') + '.png'} width="1536" height="1024"/>
    <text x="440" y="355" fontFamily="serif" fontSize="50" fill="#35332c" transform="rotate(13 440 355)">{toolNames[tool]}</text>
  </g>;
}
export function ToolTools({ s, lifted }: {
    s: State;
    lifted?: number;
}) {
    const carried = owns(s, 'punch') ? s.values.punchTool?.[0] ?? 1 : -1;
    return <>{toolX.map((x, i) => i !== carried && i !== lifted && <PunchGraphic key={i} tool={i} transform={`translate(${x} 210) scale(.26)`}/>)}</>;
}
export function TrialSheet({ cuts, aim, annotate = false, half }: {
    cuts: number[];
    aim?: (slot: number) => void;
    annotate?: boolean;
    half?: number;
}) {
    const id = useId().replaceAll(':', '');
    const entries = Array.from({ length: cuts.length / 3 }, (_, i) => ({ tool: cuts[i * 3], die: cuts[i * 3 + 1], slot: cuts[i * 3 + 2] }));
    return <svg className="rm-trial-paper" viewBox="0 0 1080 300" role={aim ? 'group' : 'img'} aria-label="試し切りの紙">
    <defs><mask id={id}><path d="M3 4L1077 1L1080 296L0 300Z" fill="white"/>{entries.map((cut, i) => {
            const p = slotPoint(cut.slot);
            return <g key={i} transform={`translate(${p.x} ${p.y}) scale(1.7)`}><CutShape cut={{ node: dieOrder[cut.die], tool: cut.tool }} fill="black"/></g>;
        })}</mask></defs>
    <image href="/assets/remake/parts/photo-back.webp" width="1080" height="300" preserveAspectRatio="none" mask={`url(#${id})`}/>
    {Array.from({ length: 12 }, (_, slot) => {
            const p = slotPoint(slot), used = [...new Set(entries.filter(e => e.slot === slot).map(e => toolNames[e.tool]))];
            return <g key={slot}>
        {aim && <path d={`M${p.x - 8} ${slot < 6 ? 10 : 290}h16`} fill="none" stroke="#766b51" strokeWidth="1.4" opacity=".7"/>}
        {annotate && <text x={p.x} y={slot < 6 ? 120 : 202} fill="#625a47" textAnchor="middle" fontFamily="serif" fontSize="23">{used.join('・')}</text>}
        {aim && (half === undefined || (slot % 6 < 3 ? 0 : 1) === half) && <g role="button" tabIndex={0} className="rm-paper-cut-target" aria-label={`試し紙の${slot + 1}箇所目に鋏を差す`} onClick={() => aim(slot)} onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            aim(slot);
                        }
                    }}><rect x={p.x - 65} y={p.y - 40} width="130" height="80" fill="transparent"/></g>}
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
    const compact = useCompact(), selected = s.values.toolSelected?.[0] ?? 0, die = s.values.ticketDie?.[0] ?? 0, hasDie = s.values.ticketDie !== undefined, cuts = s.values.toolCuts ?? [];
    const carried = owns(s, 'punch') ? s.values.punchTool?.[0] ?? 1 : -1;
    const [detail, setDetail] = useState<'wide' | 'paper' | 'tools' | 'dies'>('wide');
    const [paperHalf, setPaperHalf] = useState(0);
    const [heldTrialTool, setHeldTrialTool] = useState<number | null>(s.values.toolSelected?.[0] ?? null);
    const handTool = heldTrialTool ?? (carried >= 0 ? carried : null);
    const [aim, setAim] = useState<number | null>(null), [pressed, setPressed] = useState(false);
    useSceneBack(aim !== null && !pressed, () => setAim(null), 35);
    useSceneBack(compact && detail !== 'wide', () => { setAim(null); setDetail('wide'); });
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => () => {
        if (timer.current)
            clearTimeout(timer.current);
    }, []);
    const p = aim === null ? null : slotPoint(aim), point = p ? { x: 330 + p.x, y: 480 + p.y } : null;
    const view: [
        number,
        number,
        number,
        number
    ] | undefined = !compact || detail === 'wide' ? undefined : detail === 'paper' ? [300 + paperHalf * 560, 280, 570, 700] : detail === 'dies' ? [460, 20, 640, 210] : [145, 245, 1265, 200];
    function cut() {
        if (aim === null || pressed)
            return;
        if (cuts.length >= 648) {
            say('新しい試し紙を出せる。');
            return;
        }
        dispatch({ type: 'toolCut', tool: selected, die, slot: aim });
        setPressed(true);
        timer.current = setTimeout(() => { setPressed(false); setAim(null); }, 260);
    }
    return <section className="rm-tool-trial" style={{ '--trial-ratio': view ? view[2] / view[3] : 1672 / 941 } as CSSProperties}><DeskTabs active="tools" disabled={pressed} change={next => { if (next === 'ticket') openTicket(); }}/><Photo src="/assets/remake/ticket/bench.webp" label="三本の鋏と試し紙" view={view}><Patch src="/assets/remake/ticket/empty-stamp.webp" rect={[71.2, 0, 10.3, 30]}/>
    <svg className="rm-object-overlay" viewBox="0 0 1672 941">
      <BenchFixtures die={hasDie ? die : -1} service={s.values.stampSetting?.[0] ?? 1}/><ToolTools s={s} lifted={point ? selected : handTool ?? undefined}/>
      <foreignObject x="330" y="480" width="1080" height="300"><TrialSheet cuts={cuts} half={compact ? paperHalf : undefined} aim={hasDie && (!compact || detail === 'paper') ? slot => {
            if (!pressed) {
                setAim(slot);
                setDetail('paper');
            }
        } : undefined}/></foreignObject>
      {point ? <PunchGraphic tool={selected} closed={pressed} transform={`translate(${point.x} ${point.y}) rotate(${aim! < 6 ? -90 : 90}) scale(.25) translate(-142 -230)`}/> : handTool !== null && <PunchGraphic tool={handTool} transform="translate(1150 680) scale(.2)"/>}
      {point && <g role="button" tabIndex={0} aria-label="鋏を握る" className="rm-punch-grip" onClick={cut} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cut(); } }}><circle cx={point.x + (aim! < 6 ? 53 : -53)} cy={point.y + (aim! < 6 ? -136 : 136)} r="62" fill="transparent"/></g>}
    </svg>
    {(!compact || detail === 'tools') && toolX.map((x, i) => i !== carried && i !== handTool && <Touch key={i} name={`${toolNames[i]}の鋏を選ぶ`} rect={[(x + 30) / 1672 * 100, 27, 20, 20]} act={() => {
                if (!pressed) {
                    dispatch({ type: 'values', id: 'toolSelected', values: [i] });
                    setHeldTrialTool(i);
                    setAim(null);
                    if (compact)
                        setDetail('paper');
                }
            }}/>)}
    {(!compact || detail === 'dies') && dieOrder.map((_, i) => <Touch key={i} name={`${dieNames[i]}の刃で試す`} rect={[29.2 + i * 5.88, 4.8, 5.5, 11]} act={() => {
                if (!pressed) {
                    dispatch({ type: 'values', id: 'ticketDie', values: [i] });
                    setAim(null);
                    if (compact)
                        setDetail('paper');
                }
            }}/>)}
    {!s.mounted && (!compact || detail === 'wide') && <Touch name="紙の束から切符を一枚取る" rect={[86, 17, 12, 21]} act={() => {
                if (pressed) return;
                dispatch({ type: 'newTicket' });
                setAim(null);
                openTicket();
            }}/>} 
    {compact && detail === 'wide' && <><Touch name="三本の鋏を近くで見る" rect={[10, 25, 75, 21]} act={() => setDetail('tools')}/><Touch name="試し紙を近くで見る" rect={[19, 49, 65, 38]} act={() => setDetail('paper')}/><Touch name="試す刃を近くで見る" rect={[28, 3, 37, 21]} act={() => setDetail('dies')}/></>}
    {(!compact || detail === 'wide') && <Touch name="乗車券控を見る" rect={[0, 18, 10, 42]} act={records}/>}
    {handTool !== null && !point && (!compact || detail === 'wide' || detail === 'paper' && paperHalf === 1) && <Touch name="手元の鋏を選ぶ" rect={[68, 72, 22, 22]} act={() => dispatch({ type: 'values', id: 'toolSelected', values: [handTool] })}/>}
  </Photo><div className="rm-document-controls rm-tool-controls">
    {compact && detail === 'paper' && <button onClick={() => { setAim(null); setPaperHalf(1 - paperHalf); }}>{paperHalf ? '紙の左側' : '紙の右側'}</button>}
    <span className="rm-tool-state">鋏：{toolNames[selected]}　刃：{hasDie ? dieNames[die] : '未装着'}</span>
    {carried < 0 ? <button disabled={pressed} onClick={() => { dispatch({ type: 'toolTake', tool: selected }); setHeldTrialTool(null); setAim(null); say('鋏を手に取った。'); }}>{toolNames[selected]}の鋏を持つ</button> : <button disabled={pressed} onClick={() => { dispatch({ type: 'toolReturn' }); setHeldTrialTool(null); setAim(null); }}>鋏を机へ戻す</button>}
    <button disabled={pressed || !cuts.length} onClick={() => { dispatch({ type: 'newTrialPaper' }); setAim(null); }}>新しい試し紙</button>
    <button disabled={!cuts.length} onClick={() => { dispatch({ type: 'record', id: 'toolTrial', values: cuts }); say('試し切りを記録した。'); }}>記録に残す</button>
  </div><p className="rm-operation-note">紙の縁に鋏を差し、持ち手を押して切る。引くときは「戻る」</p></section>;
}
