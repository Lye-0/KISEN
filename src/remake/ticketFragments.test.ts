import { describe, expect, it } from 'vitest';
import { newState, reduce, restore, trace, expectedHoles } from './model';
import { fragmentInitial, fragmentOrigin, fragmentRoutes, moveFragment, validFragments } from './ticketFragments';
import { fragmentOutlines } from './ticketFragments';
import { insideCut } from './ticketGeometry';
describe('surviving ticket fragments', () => {
    it('leaves the lower fragment ambiguous by hole shape, while the upper hole distinguishes sheets', () => {
        // Parse each fixed outline once, not once for every sampled pixel.
        const outlines = fragmentOutlines.map(outline => outline.split(' ').map(point => point.split(',').map(Number)));
        const polygon = (part: number, x: number, y: number) => {
            const p = outlines[part];
            let inside = false;
            for (let i = 0, j = p.length - 1; i < p.length; j = i++)
                if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0])
                    inside = !inside;
            return inside;
        };
        const silhouette = (sheet: number, part: number) => {
            const holes = expectedHoles(fragmentRoutes[sheet]).filter(h => h.column >= 2), pixels: number[] = [];
            for (let y = .5; y < 235; y += 1)
                for (let x = .5; x < 480; x += 1)
                    if (polygon(part, x, y))
                        pixels.push(Number(holes.some(h => insideCut(h.node, x - 80 - (h.column - 2) * 160, y - (h.side === 'white' ? 35 : 200)))));
            return pixels;
        };
        expect(silhouette(0, 2)).toEqual(silhouette(1, 2));
        expect(silhouette(0, 0)).not.toEqual(silhouette(1, 0));
    });
    it('keeps both excerpts as real partial journeys with the same final two passages', () => {
        const paths = fragmentRoutes.map(r => trace(r, false));
        expect(paths.map(p => p.end)).toEqual(['O', 'O']);
        expect(paths.map(p => p.path.slice(-4))).toEqual([['E', 'F', 'D', 'O'], ['E', 'F', 'D', 'O']]);
        const excerpts = fragmentRoutes.map(r => expectedHoles(r).filter(h => h.column >= 2));
        expect(excerpts[0].map(h => [h.node, h.side])).toEqual([['E', 'white'], ['F', 'white'], ['D', 'black']]);
        expect(excerpts[1].map(h => [h.node, h.side])).toEqual([['E', 'black'], ['F', 'white'], ['D', 'black']]);
        // Shared F/D openings cannot identify every join; the lost earlier columns cannot be copied.
        expect(excerpts[0].slice(1)).toEqual(excerpts[1].slice(1));
        expect(excerpts.every(e => e.length === 3)).toBe(true);
    });
    it('aligns either sheet at the same small distance and remains reversible', () => {
        const v = [...fragmentInitial];
        v.splice(4, 4, 400, 260, 0, 0);
        v.splice(16, 4, 800, 450, 0, 0);
        const same = moveFragment(v, 0, [403, 164, 0, 0])!;
        const mixed = moveFragment(v, 3, [403, 164, 0, 0])!;
        expect(fragmentOrigin(same, 0)).toEqual([400, 260]);
        expect(fragmentOrigin(mixed, 3)).toEqual([400, 260]);
        const far = moveFragment(v, 0, [410, 160, 0, 0])!;
        expect(fragmentOrigin(far, 0)).toEqual([410, 260]);
        const back = [...v];
        back.splice(4, 4, 400, 260, 1, 1);
        const flipped = moveFragment(back, 0, [403, 356, 1, 1])!;
        expect(fragmentOrigin(flipped, 0)).toEqual([400, 260]);
        expect(moveFragment(same, 0, [600, 70, 1, 1])?.slice(0, 4)).toEqual([600, 70, 1, 1]);
    });
    it('saves only owned physical pieces, rejects malformed poses, and preserves older saves', () => {
        const initial = newState();
        expect(reduce(initial, { type: 'fragmentMove', id: 0, pose: [400, 80, 0, 0] })).toBe(initial);
        const owned = { ...initial, locations: { ...initial.locations, fragments: 'inventory' as const } };
        const moved = reduce(owned, { type: 'fragmentMove', id: 0, pose: [400, 80, 0, 1] });
        expect(validFragments(moved.values.fragments)).toBe(true);
        expect(restore(JSON.parse(JSON.stringify(moved)))?.values.fragments).toEqual(moved.values.fragments);
        expect(restore(JSON.parse(JSON.stringify(owned)))).not.toBeNull();
        expect(reduce(owned, { type: 'values', id: 'fragments', values: fragmentInitial })).toBe(owned);
        expect(reduce(owned, { type: 'fragmentMove', id: 6, pose: [400, 80, 0, 1] })).toBe(owned);
        expect(reduce(owned, { type: 'fragmentMove', id: 0, pose: [NaN, 80, 0, 1] })).toBe(owned);
        expect(restore({ ...moved, values: { ...moved.values, fragments: [400, 80, 0, 1] } })).toBeNull();
    });
});
