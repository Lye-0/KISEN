export type Tape = 'A' | 'B';
export type EventKind = 'footsteps' | 'gate' | 'door' | 'passing' | 'bell' | 'stop';
export interface TapeEvent {
    at: number;
    kind: EventKind;
    lamps?: 1 | 2;
}
export const duration = 20;
export const tapes: Record<Tape, TapeEvent[]> = {
    A: [{ at: 1.2, kind: 'footsteps' }, { at: 4, kind: 'gate', lamps: 2 }, { at: 9, kind: 'passing' }, { at: 14, kind: 'stop' }, { at: 16, kind: 'gate', lamps: 1 }],
    B: [{ at: 1, kind: 'gate', lamps: 2 }, { at: 3, kind: 'door' }, { at: 9, kind: 'bell' }, { at: 13, kind: 'gate', lamps: 1 }, { at: 17, kind: 'footsteps' }],
};
export function syncCandidates(useLamps = true) {
    return Array.from({ length: 31 }, (_, i) => i - 12).filter(shift => {
        let shared = 0;
        for (const e of tapes.B.filter(e => e.kind === 'gate')) {
            const time = e.at + shift;
            if (time < 0 || time > duration)
                continue;
            shared++;
            if (!tapes.A.some(a => a.kind === 'gate' && a.at === time && (!useLamps || a.lamps === e.lamps)))
                return false;
        }
        return shared > 0;
    });
}
export function eventOrder(offset: number) { return [...tapes.A, ...tapes.B.map(e => ({ ...e, at: e.at + offset }))].filter(e => ['door', 'passing', 'bell', 'stop'].includes(e.kind)).sort((a, b) => a.at - b.at).map(e => e.kind); }
// Original synthesized foley. The same events drive sound, the moving needle and recorded marks.
export function tapeSamples(which: Tape, rate = 22050) {
    const out = new Float32Array(duration * rate);
    let seed = which === 'A' ? 139 : 251;
    const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
    let low = 0;
    for (let i = 0; i < out.length; i++) {
        low = .94 * low + .06 * noise();
        out[i] = low * .024 + noise() * .002;
    }
    const sound = (at: number, seconds: number, sample: (t: number) => number) => { const start = Math.round(at * rate); for (let j = 0; j < seconds * rate && start + j < out.length; j++)
        if (start + j >= 0)
            out[start + j] += sample(j / rate); };
    const bell = (at: number, base: number, strength: number) => sound(at, 1.5, t => strength * (Math.sin(t * base * 2 * Math.PI) * Math.exp(-t * 4) + .35 * Math.sin(t * base * 2.71 * 2 * Math.PI) * Math.exp(-t * 7)));
    for (const e of tapes[which]) {
        if (e.kind === 'gate') {
            bell(e.at, 880, .14);
            if (e.lamps === 2)
                bell(e.at + .29, 880, .13);
            sound(e.at + .55, .3, t => noise() * .10 * Math.exp(-t * 25));
        }
        if (e.kind === 'door') {
            sound(e.at, .8, t => noise() * .065 * Math.sin(Math.PI * t / .8));
            sound(e.at + .75, .2, t => (noise() * .17 + Math.sin(t * 110 * 2 * Math.PI) * .12) * Math.exp(-t * 35));
        }
        if (e.kind === 'passing')
            sound(e.at, 2.2, t => { const envelope = Math.sin(Math.PI * t / 2.2); const clack = Math.exp(-((t % .21) / .018)); return envelope * (Math.sin(2 * Math.PI * 52 * t) * .085 + noise() * .055 + clack * noise() * .1); });
        if (e.kind === 'bell') {
            bell(e.at, 670, .2);
            bell(e.at + .55, 670, .17);
        }
        if (e.kind === 'stop')
            sound(e.at, 1.3, t => (noise() * .09 + Math.sin(2 * Math.PI * (370 * t - 90 * t * t)) * .025) * (1 - t / 1.3));
        if (e.kind === 'footsteps')
            for (const d of [0, .48, .95])
                sound(e.at + d, .2, t => (Math.sin(t * 75 * 2 * Math.PI) * .075 + noise() * .05) * Math.exp(-t * 28));
    }
    return out;
}
export function wav(samples: Float32Array, rate = 22050) {
    const buffer = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buffer);
    const text = (at: number, s: string) => [...s].forEach((c, i) => v.setUint8(at + i, c.charCodeAt(0)));
    text(0, 'RIFF');
    v.setUint32(4, 36 + samples.length * 2, true);
    text(8, 'WAVE');
    text(12, 'fmt ');
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);
    v.setUint32(24, rate, true);
    v.setUint32(28, rate * 2, true);
    v.setUint16(32, 2, true);
    v.setUint16(34, 16, true);
    text(36, 'data');
    v.setUint32(40, samples.length * 2, true);
    samples.forEach((n, i) => v.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, n)) * 32767), true));
    return buffer;
}
