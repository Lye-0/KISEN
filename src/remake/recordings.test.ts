import { it, expect } from 'vitest';
import { syncCandidates, eventOrder, tapeSamples, wav } from './recordings';
it('共通の閉鎖音だけでは三仮説が残り、欠灯で一つに絞れる', () => { expect(syncCandidates(false)).toEqual([-9, 3, 15]); expect(syncCandidates()).toEqual([3]); expect(eventOrder(3)).toEqual(['door', 'passing', 'bell', 'stop']); });
it('録音の合成は再現可能で、クリッピングせず有効なWAVへ出力される', () => { const a = tapeSamples('A'), b = tapeSamples('A'); expect(a).toEqual(b); let peak = 0, finite = true; for (const n of a) {
    finite = finite && Number.isFinite(n);
    peak = Math.max(peak, Math.abs(n));
} expect(finite).toBe(true); expect(peak).toBeLessThan(1); expect(peak).toBeGreaterThan(.1); const data = wav(a); expect(new TextDecoder().decode(new Uint8Array(data, 0, 4))).toBe('RIFF'); expect(data.byteLength).toBe(44 + a.length * 2); });
