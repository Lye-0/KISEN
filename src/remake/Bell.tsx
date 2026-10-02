import { Photo, Touch } from './Photo';
import { useEffect, useId, useRef, useState } from 'react';
import { bellPulse, bellReturns, bellRecord, bellSamples, readBellRecord } from './bellCircuit';
import type { State, Action } from './model';
let bellAudio: AudioContext | null = null;
export function useBell(s: State, audible = false) {
    const inputs = s.values.bellInputs ?? [], channel = s.values.bellChannel?.[0] ?? 0;
    const [now, setNow] = useState(Date.now);
    const played = useRef(new Set<number>());
    const ring = () => {
        if (!s.sound)
            return;
        const ctx = bellAudio ?? (bellAudio = new AudioContext());
        void ctx.resume();
        const samples = bellSamples(ctx.sampleRate), buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
        buffer.copyToChannel(samples, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
    };
    const returns = bellReturns(inputs[0] ?? 0, inputs, channel);
    const key = returns.join(','), lastInput = inputs.at(-1) ?? 0;
    useEffect(() => {
        let frame = 0;
        const targets = key ? key.split(',').map(Number) : [];
        const tick = () => {
            const time = Date.now();
            setNow(time);
            for (const at of targets)
                if (time >= at && time < at + 280 && !played.current.has(at)) {
                    played.current.add(at);
                    if (audible)
                        ring();
                }
            if (time < Math.max(targets.at(-1) ?? 0, lastInput) + 300)
                frame = requestAnimationFrame(tick);
        };
        tick();
        return () => cancelAnimationFrame(frame);
    }, [key, lastInput, s.sound, audible]);
    return { now, inputs, returns, channel, reply: bellPulse(now, returns), input: bellPulse(now, inputs), ring };
}
export function BellTrace({ inputs, returns, now, start, inkOnly = false }: {
    inputs: number[];
    returns: number[];
    now: number;
    start: number;
    inkOnly?: boolean;
}) {
    const observed = returns.filter(t => t <= now), duration = Math.max(3000, ...inputs.map(t => t - start + 400), ...observed.map(t => t - start + 400)), x = (t: number) => 55 + (t - start) / duration * 620;
    return <svg viewBox="0 0 730 150" role="img" aria-label={`押した回数 ${inputs.length}、返答 ${observed.length}`} style={{ width: '100%', maxWidth: 730, background: inkOnly ? 'transparent' : '#b6ab8c', color: '#27261f' }}><text x="9" y="51" fontSize="17" fill="currentColor">押</text><text x="9" y="111" fontSize="17" fill="currentColor">返</text>{[46, 106].map(y => <path key={y} d={`M45 ${y} H700`} stroke="#494536" strokeWidth="1"/>)}{inputs.map(t => <path key={t} d={`M${x(t) - 3} 46v-23h6v23`} fill="none" stroke="#322b22" strokeWidth="2"/>)}{observed.map(t => <path key={t} d={`M${x(t) - 3} 106v-23h6v23`} fill="none" stroke="#322b22" strokeWidth="2"/>)}</svg>;
}
export function BellImage({ channel, reply = false }: {
    channel: number;
    reply?: boolean;
}) {
    const id = useId().replaceAll(':', '');
    return <><image href="/assets/remake/lamp/bell.webp" width="1672" height="941"/><defs><radialGradient id={id + 'reply'}><stop stopColor="#fff7cc"/><stop offset=".65" stopColor="#f2dc93" stopOpacity=".8"/><stop offset="1" stopColor="#e8c567" stopOpacity="0"/></radialGradient></defs><text x="855" y="138" textAnchor="middle" fill="#b4a580" fontFamily="serif" fontSize="35">Ⅰ</text><text x="1086" y="138" textAnchor="middle" fill="#b4a580" fontFamily="serif" fontSize="35">Ⅱ</text><g className="rm-bell-wiring" fill="none" stroke="#ab9b78" strokeWidth="2.5" opacity=".7" aria-label="接点から応答灯と停車灯へ続く配線図"><path d="M1210 395h190m-150 0v-18m115 18v18"/><circle cx="1250" cy="365" r="12"/><path d="M1245 378v7h10v-7M1365 413v18h-42m42 0h42"/>{[1320,1410].map(x => <g key={x}><path d={`M${x} 431v10`}/><circle cx={x} cy="454" r="13"/><path d={`M${x-5} 467v7h10v-7`}/></g>)}<text x="1227" y="345" fill="#ab9b78" stroke="none" fontFamily="serif" fontSize="18">応答灯</text><text x="1365" y="502" textAnchor="middle" fill="#ab9b78" stroke="none" fontFamily="serif" fontSize="18">停車灯</text><path d="M970 350v45h240"/></g><g transform={'rotate(' + (channel ? 28 : -28) + ' 970 298)'}><image href="/assets/remake/parts/point-shaft.png" x="959" y="141" width="22" height="157" preserveAspectRatio="none"/><image href="/assets/remake/parts/point-grip.png" x="919" y="113" width="102" height="38"/></g>{reply && <ellipse cx="1375" cy="283" rx="97" ry="102" fill={'url(#' + id + 'reply)'}/>}</>;
}
export function BellPanel({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const b = useBell(s), [wiring, setWiring] = useState(false);
    return <section className="rm-bell-device"><Photo view={wiring ? [875, 325, 600, 220] : undefined} src="/assets/remake/lamp/bell.webp" label="ベル、接点の切替、二本の記録針と押しボタン" zoomable limitZoomToSource zoomButtonOnly zoomOrigin="45% 68%"><svg className="rm-object-overlay" viewBox="0 0 1672 941"><BellImage channel={b.channel} reply={b.reply}/><svg x="476" y="535" width="555" height="198"><BellTrace inputs={b.inputs} returns={b.returns} now={b.now} start={b.inputs[0] ?? 0} inkOnly/></svg></svg><Touch name="接点Ⅰに合わせる" rect={[48, 9, 10, 27]} act={() => dispatch({ type: 'bellChannel', channel: 0 })}/><Touch name="接点Ⅱに合わせる" rect={[58, 9, 10, 27]} act={() => dispatch({ type: 'bellChannel', channel: 1 })}/><Touch name="ベルの押しボタン" rect={[78, 59, 12, 19]} act={() => {
            if (b.inputs.length >= 32) {
                say('紙の端に達した。');
                return;
            }
            b.ring();
            dispatch({ type: 'bellStrike', time: Date.now() });
        }}/><Touch name="記録紙を送る" rect={[68, 78, 6, 11]} act={() => dispatch({ type: 'bellReset' })}/></Photo><div className="rm-document-controls rm-bell-controls"><button onClick={() => setWiring(!wiring)}>{wiring ? '装置の全体へ' : '配線の刻印を見る'}</button><button disabled={!b.inputs.length} onClick={() => dispatch({ type: 'bellReset' })}>新しい記録紙を送る</button><button disabled={!b.inputs.length} onClick={() => { dispatch({ type: 'record', id: 'bell-record-' + b.inputs[0], values: bellRecord(b.inputs[0], b.inputs, b.channel, Date.now()) }); say('紙に残った間隔を記録した。'); }}>記録する</button></div>{wiring && <p className="rm-operation-note">応答灯と二つの停車灯は、同じ切替接点へつながっている。</p>}</section>;
}
export function BellNote({ values }: {
    values: number[];
}) { const r = readBellRecord(values); return r ? <><p>{r.channel ? 'Ⅱ' : 'Ⅰ'}</p><BellTrace inputs={r.inputs} returns={r.responses} start={0} now={Infinity}/></> : null; }
export function BellAudio({ s }: {
    s: State;
}) { useBell(s, true); return null; }
