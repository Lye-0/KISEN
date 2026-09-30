export const sketchPlaces = ['O', 'D', 'B', 'A', 'S', 'E', 'F', 'C', 'R'] as const;
export const sketchPositions = [[100, 720], [260, 720], [620, 720], [830, 760], [1050, 760], [610, 400], [300, 400], [760, 165], [1050, 125]] as const;
export const sketchPrintedEdges: [
    [
        number,
        number
    ],
    ...Array<[
        number,
        number
    ]>
] = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 7], [2, 5], [7, 5], [1, 6], [6, 8]];
export const validSketch = (v: number[]) => v.length % 3 === 0 && v.length <= 108 && v.every(Number.isInteger) && Array.from({ length: v.length / 3 }, (_, i) => v.slice(i * 3, i * 3 + 3)).every(([a, b, k], i, all) => a >= 0 && a < b && b < 9 && k >= 0 && k <= 2 && all.findIndex(([aa, bb]) => a === aa && b === bb) === i);
export function changeSketch(v: number[], a: number, b: number, kind: number) {
    if (!validSketch(v) || ![a, b, kind].every(Number.isInteger) || a === b || a < 0 || b < 0 || a > 8 || b > 8 || kind < 0 || kind > 2)
        return v;
    const [lo, hi] = [a, b].sort((x, y) => x - y);
    const groups = Array.from({ length: v.length / 3 }, (_, i) => v.slice(i * 3, i * 3 + 3));
    const existing = groups.find(p => p[0] === lo && p[1] === hi);
    return [...groups.filter(p => p[0] !== lo || p[1] !== hi).flat(), ...(existing?.[2] === kind ? [] : [lo, hi, kind])];
}
