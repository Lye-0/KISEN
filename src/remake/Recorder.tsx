import { useEffect, useRef, useState } from 'react';
import type { Action, Item, State } from './model';
import { owns } from './model';
import { Photo, Patch, Touch } from './Photo';
import { tapes, duration } from './recordings';
import type { Tape, EventKind } from './recordings';
const root = '/assets/remake/recorder/';
const names: Record<EventKind, string> = { footsteps: '足音', gate: '閉鎖', door: '扉', passing: '通過', bell: 'ベル', stop: '停止' };
export function RecordingStrips({ offset, heard, onOffset }: {
    offset: number;
    heard: [
        number,
        number
    ];
    onOffset?: (n: number) => void;
}) {
    const grip = useRef<{
        x: number;
        offset: number;
        unit: number;
    } | null>(null);
    const paper = (tape: Tape, y: number, shift: number) => <g transform={`translate(${370 + shift * 28} ${y})`} key={tape}>
  <image href="/assets/remake/parts/paper-strip.png" x="-40" y="-6" width="720" height="126" preserveAspectRatio="none" style={{ filter: 'sepia(.12) brightness(.88)' }}/>
  <text x="-8" y="52" fill="#58462f" fontSize="28" fontFamily="serif">{tape}</text>
  <path d="M40 35H640" stroke="#77674d" strokeWidth="1.5" opacity=".65"/>
  {Array.from({ length: 21 }, (_, i) => <path key={i} d={`M${50 + i * 28} 29v${i % 4 === 0 ? 13 : 8}`} stroke="#796e55" strokeWidth="1" opacity=".65"/>)}
  {tapes[tape].filter(e => e.at <= heard[tape === 'A' ? 0 : 1]).map((e, i) => <g key={i} transform={`translate(${50 + e.at * 28} 0)`}><path d="M0 23v29" stroke="#534634" strokeWidth="2"/>{e.kind === 'gate' && <><circle cx="-9" cy="20" r="5" fill="#6e6046"/><circle cx="9" cy="20" r="5" fill={e.lamps === 2 ? '#6e6046' : 'none'} stroke="#6e6046" strokeWidth="1.5"/></>}<text y={e.kind === 'gate' && e.at > 12 ? 110 : 78} textAnchor="middle" fontSize="28" fill="#50432f" fontFamily="Yu Mincho,serif">{names[e.kind]}</text></g>)}
  {onOffset && tape === 'B' && <g className="rm-strip-grip" role="slider" tabIndex={0} aria-label="Bの記録紙" aria-valuemin={-12} aria-valuemax={18} aria-valuenow={offset} onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); const width = e.currentTarget.ownerSVGElement!.getBoundingClientRect().width; grip.current = { x: e.clientX, offset, unit: 28 * width / 1500 }; }} onPointerMove={e => {
                if (grip.current)
                    onOffset(Math.max(-12, Math.min(18, Math.round(grip.current.offset + (e.clientX - grip.current.x) / grip.current.unit))));
            }} onPointerUp={e => { grip.current = null; if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => { grip.current = null; }} onKeyDown={e => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                    e.preventDefault();
                    onOffset(Math.max(-12, Math.min(18, offset + (e.key === 'ArrowRight' ? 1 : -1))));
                }
            }}><rect x="-35" y="-3" width="710" height="118" fill="transparent"/></g>}
 </g>;
    return <svg className="rm-record-strips" viewBox="0 0 1500 300" role="group" aria-label="二本の記録紙">{paper('A', 10, 0)}{paper('B', 160, offset)}</svg>;
}
export function Recorder({ s, dispatch, say, selected, onSelect }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    selected: Item | null;
    onSelect: (i: Item | null) => void;
}) {
    const [tape, setTape] = useState<Tape>('A'), [time, setTime] = useState(0), [playing, setPlaying] = useState(false), [paperOpen, setPaperOpen] = useState(false);
    const player = useRef<HTMLAudioElement>(null), tapeRef = useRef<Tape>(tape);
    tapeRef.current = tape;
    const fitted = s.locations.knob === 'recorder';
    const heardA = s.values.heardA?.[0] ?? 0, heardB = s.values.heardB?.[0] ?? 0;
    const heard: [
        number,
        number
    ] = [Math.max(heardA, tape === 'A' ? time : 0), Math.max(heardB, tape === 'B' ? time : 0)];
    const offset = s.values.tapeOffset?.[0] ?? 0;
    const remember = () => { const current = player.current?.currentTime ?? 0; dispatch({ type: 'heard', tape, seconds: current }); dispatch({ type: 'values', id: 'playhead' + tape, values: [current] }); };
    const stop = () => { player.current?.pause(); setPlaying(false); remember(); };
    const play = () => {
        if (!fitted) {
            say('右の巻軸が、まだ押さえられていない。');
            return;
        }
        const p = player.current;
        if (!p)
            return;
        if (p.ended)
            p.currentTime = 0;
        void p.play().then(() => {
            if (!p.paused)
                setPlaying(true);
        }).catch(() => say('再生できません。もう一度再生ボタンに触れてください。'));
    };
    const rewind = () => {
        stop();
        if (player.current)
            player.current.currentTime = 0;
        setTime(0);
    };
    const choose = (next: Tape) => {
        if (next === tape)
            return;
        stop();
        setTape(next);
        setTime(0);
    };
    useEffect(() => {
        if (!fitted) {
            player.current?.pause();
            setPlaying(false);
        }
    }, [fitted]);
    useEffect(() => {
        const element = player.current;
        return () => {
            const seconds = element?.currentTime ?? 0;
            element?.pause();
            if (seconds > 0) {
                dispatch({ type: 'heard', tape: tapeRef.current, seconds });
                dispatch({ type: 'values', id: 'playhead' + tapeRef.current, values: [seconds] });
            }
        };
    }, [dispatch]);
    useEffect(() => {
        if (!paperOpen)
            return;
        const previous = document.activeElement as HTMLElement;
        const id = requestAnimationFrame(() => document.querySelector<HTMLElement>('.rm-paper-comparison [role="slider"]')?.focus());
        return () => {
            cancelAnimationFrame(id);
            if (previous?.isConnected)
                previous.focus();
        };
    }, [paperOpen]);
    const active = [...tapes[tape]].reverse().find(e => time >= e.at && time < e.at + 1.1);
    return <div className="rm-recorder">
  <audio ref={player} src={`/assets/remake/audio/tape-${tape}.wav`} preload="metadata" muted={!s.sound} onLoadedMetadata={() => {
            if (player.current)
                player.current.currentTime = s.values['playhead' + tape]?.[0] ?? 0;
        }} onTimeUpdate={() => {
            const current = player.current?.currentTime ?? 0;
            setTime(current);
            if (tapes[tape].some(e => e.at <= current && e.at > (s.values['heard' + tape]?.[0] ?? 0)))
                dispatch({ type: 'heard', tape, seconds: current });
        }} onEnded={() => { setPlaying(false); dispatch({ type: 'heard', tape, seconds: duration }); }}/>
  <Photo src={root + 'bare.webp'} label="机の録音機と二つのテープケース">
   {fitted && <Patch src={root + 'fitted.webp'} rect={[48.7, 12.7, 6.3, 12]}/>}
   <Touch name="右の巻軸" rect={[49, 12, 6, 12]} act={() => {
            if (fitted) {
                stop();
                dispatch({ type: 'put', item: 'knob', place: 'inventory' });
                onSelect(null);
            }
            else if (selected === 'knob' && owns(s, 'knob')) {
                dispatch({ type: 'put', item: 'knob', place: 'recorder' });
                onSelect(null);
            }
            else
                say('短いねじ山が露出している。');
        }}/>
   <Touch name="録音を再生" rect={[32.6, 57.3, 5.3, 9]} act={play}/><Touch name="録音を止める" rect={[38.1, 57.3, 5.3, 9]} act={stop}/><Touch name="巻き戻す" rect={[26.9, 57.3, 5.3, 9]} act={rewind}/>
   <Touch name="テープA" rect={[67.5, 64, 20, 14]} act={() => choose('A')} className={tape === 'A' ? 'rm-current-tape' : ''}/><Touch name="テープB" rect={[72, 78, 20, 16]} act={() => choose('B')} className={tape === 'B' ? 'rm-current-tape' : ''}/>
   {!paperOpen && <div className="rm-paper-on-desk"><RecordingStrips offset={offset} heard={heard}/></div>}
   <Touch name="記録紙Aを手に取る" rect={[25.8, 74.5, 27, 6.5]} act={() => setPaperOpen(true)}/><Touch name="記録紙Bを手に取る" rect={[25.8 + offset * 1.027, 80.5, 27, 6.5]} act={() => setPaperOpen(true)}/>
   {playing && <span className="rm-tape-running" aria-hidden="true"/>}
  </Photo>
  <div className="rm-audio-caption" aria-live="polite">{playing ? `${tape}　${active ? names[active.kind] : ''}` : `${tape}　${Math.floor(time)} / ${duration}`}</div>
  {paperOpen && <section className="rm-paper-comparison" role="dialog" aria-modal="true" aria-label="手元で記録を比べる" onKeyDown={e => {
                if (e.key === 'Escape') {
                    e.stopPropagation();
                    setPaperOpen(false);
                }
                if (e.key === 'Tab') {
                    const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button,[role=slider]'));
                    const target = e.shiftKey ? items.at(-1) : items[0];
                    if (e.shiftKey && document.activeElement === items[0] || !e.shiftKey && document.activeElement === items.at(-1)) {
                        e.preventDefault();
                        target?.focus();
                    }
                }
            }} onClick={e => {
                if (e.target === e.currentTarget)
                    setPaperOpen(false);
            }}><RecordingStrips offset={offset} heard={heard} onOffset={n => dispatch({ type: 'values', id: 'tapeOffset', values: [n] })}/><div className="rm-document-controls"><button onClick={playing ? stop : play}>{playing ? '停止' : '再生'}</button><button onClick={() => choose(tape === 'A' ? 'B' : 'A')}>録音 {tape === 'A' ? 'B' : 'A'}</button><button onClick={() => { dispatch({ type: 'record', id: 'recordings', values: [offset, ...heard] }); say('重ね方を記録した。'); }}>記録に残す</button><button onClick={() => setPaperOpen(false)}>机へ戻す</button></div></section>}
 </div>;
}
