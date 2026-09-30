export const bellDelay = 900;
export const recordedBellSpacing = 550;
export function bellReturns(start: number, inputs: number[], channel: number) { return !inputs.length ? [] : channel === 0 ? [start + bellDelay, start + bellDelay + recordedBellSpacing] : inputs.map(t => t + bellDelay); }
export const bellPulse = (now: number, times: number[]) => times.some(t => now >= t && now < t + 280);
export const validBellTimes = (v: number[]) => v.length <= 32 && v.every((n, i) => Number.isInteger(n) && n >= 0 && (i === 0 || n > v[i - 1]));
export function bellRecord(start: number, inputs: number[], channel: number, now: number) { const responses = bellReturns(start, inputs, channel).filter(t => t <= now); return [channel, start, inputs.length, ...inputs.map(t => t - start), responses.length, ...responses.map(t => t - start)]; }
export function readBellRecord(values: number[]) { const channel = values[0], start = values[1], count = values[2]; if (![0, 1].includes(channel) || !Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 1 || count > 32)
    return null; const inputs = values.slice(3, 3 + count), rc = values[3 + count], responses = values.slice(4 + count); if (!Number.isInteger(rc) || rc < 0 || rc > 32 || responses.length !== rc || !validBellTimes(inputs) || !validBellTimes(responses) || inputs.some(n => n < 0) || responses.some(n => n < 0))
    return null; return { channel, start, inputs, responses }; }
export function bellSamples(rate = 22050) { const samples = new Float32Array(rate); for (let i = 0; i < samples.length; i++) {
    const t = i / rate, fade = Math.min(1, (1 - t) / .06);
    samples[i] = fade * .2 * (Math.sin(2 * Math.PI * 670 * t) * Math.exp(-t * 4) + .35 * Math.sin(2 * Math.PI * 670 * 2.71 * t) * Math.exp(-t * 7));
} return samples; }
