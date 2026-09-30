// Two surviving excerpts, not complete journey tickets. Their earlier columns are lost.
export const fragmentRoutes = [[1, 0, 0, 1, 2, 1], [0, 1, 0, 1, 1, 1]];
export const fragmentSize = { width: 480, height: 235, boardWidth: 1100, boardHeight: 734 };
export const fragmentParts = [0, 1, 2, 0, 1, 2] as const;
export const partCenters = [17.5, 117.5, 217.5];
export const partHeights = [45, 230, 45];
// Each tuple is the physical fragment's center x/y, half turns, face.
export const fragmentInitial = [800, 100, 1, 0, 295, 330, 0, 0, 805, 610, 0, 1, 295, 175, 0, 1, 805, 410, 1, 0, 290, 655, 1, 0];
export function validFragments(v: unknown): v is number[] {
    return Array.isArray(v) && v.length === 24 && v.every((n, i) => typeof n === 'number' && Number.isFinite(n) && (i % 4 === 0 ? n >= 250 && n <= 850 : i % 4 === 1 ? n >= partHeights[fragmentParts[Math.floor(i / 4)]] / 2 + 30 && n <= 714 - partHeights[fragmentParts[Math.floor(i / 4)]] / 2 : n === 0 || n === 1));
}
export function fragmentOrigin(v: number[], id: number) {
    return [v[id * 4], v[id * 4 + 1] - (v[id * 4 + 2] ? -1 : 1) * (partCenters[fragmentParts[id]] - 117.5)];
}
export function moveFragment(v: number[], id: number, pose: number[], snap = true): number[] | null {
    if (!Number.isInteger(id) || id < 0 || id > 5 || pose.length !== 4 || !pose.every(Number.isFinite) || ![0, 1].includes(pose[2]) || ![0, 1].includes(pose[3]))
        return null;
    const h = partHeights[fragmentParts[id]], out = [...v];
    out.splice(id * 4, 4, Math.max(250, Math.min(850, pose[0])), Math.max(h / 2 + 30, Math.min(714 - h / 2, pose[1])), pose[2], pose[3]);
    if (snap) {
        const origin = fragmentOrigin(out, id);
        // Align a nearby compatible tear regardless of which ticket it came from.
        // No identity, hole, fibre or solution lookup occurs in the interaction.
        for (let other = 0; other < 6; other++) {
            if (Math.abs(fragmentParts[id] - fragmentParts[other]) !== 1 || out[other * 4 + 2] !== pose[2] || out[other * 4 + 3] !== pose[3])
                continue;
            const target = fragmentOrigin(out, other);
            if (Math.hypot(origin[0] - target[0], origin[1] - target[1]) <= 7) {
                out[id * 4] += target[0] - origin[0];
                out[id * 4 + 1] += target[1] - origin[1];
                break;
            }
        }
    }
    return validFragments(out) ? out : null;
}
export const tearTop = [[0, 35], [26, 32], [48, 38], [72, 34], [96, 36], [118, 31], [145, 37], [174, 33], [202, 36], [226, 32], [250, 37], [278, 34], [306, 38], [331, 32], [358, 36], [387, 33], [414, 37], [444, 31], [465, 36], [480, 35]];
export const tearBottom = [[0, 225], [26, 222], [48, 228], [72, 224], [96, 226], [118, 221], [145, 227], [174, 223], [202, 226], [226, 222], [250, 227], [278, 224], [306, 228], [331, 224], [358, 220], [377, 205], [387, 198], [402, 201], [414, 199], [434, 218], [465, 226], [480, 225]];
const line = (points: number[][]) => points.map(([x, y]) => `${x},${y}`).join(' ');
export const fragmentOutlines = [
    '0,0 480,0 ' + line([...tearTop].reverse()),
    line(tearTop) + ' ' + line([...tearBottom].reverse()),
    line(tearBottom) + ' 480,235 0,235',
];
