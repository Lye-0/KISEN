import type { Node } from './model';
export type Site = Node | 'S' | 'R' | 'O' | 'X' | 'bend';
export type Position = {
    x: number;
    y: number;
    z: number;
};
/** Metres. The station footprint is x=0..18; the wider railway uses this same frame. */
export const sites: Record<Site, Position> = {
    S: { x: 0, y: 5, z: 0 }, R: { x: 18, y: 5, z: 0 },
    A: { x: -12, y: 5, z: 0 }, B: { x: -24, y: 0, z: 0 },
    C: { x: -22, y: 150, z: 0 }, D: { x: -54, y: 0, z: 0 },
    E: { x: -33, y: 30, z: 0 }, F: { x: -49, y: 30, z: 0 },
    O: { x: -65, y: 0, z: 0 }, X: { x: -49, y: 20, z: 4.5 },
    bend: { x: -26, y: 180, z: 0 },
};
export const railLines: Record<string, Site[]> = {
    'S-A': ['S', 'A'], 'A-B': ['A', 'B'], 'A-C': ['A', 'C'],
    'B-D': ['B', 'D'], 'B-E': ['B', 'E'], 'C-E': ['C', 'E'], 'C-X': ['C', 'X'],
    'E-F': ['E', 'F'], 'R-F': ['R', 'bend', 'F'], 'F-D': ['F', 'D'], 'D-O': ['D', 'O'],
};
export function crossing2d(a: Position, b: Position, c: Position, d: Position) {
    const abx = b.x - a.x, aby = b.y - a.y, cdx = d.x - c.x, cdy = d.y - c.y;
    const den = abx * cdy - aby * cdx;
    if (Math.abs(den) < 1e-8)
        return null;
    const acx = c.x - a.x, acy = c.y - a.y;
    const t = (acx * cdy - acy * cdx) / den, u = (acx * aby - acy * abx) / den;
    if (t <= 0 || t >= 1 || u <= 0 || u >= 1)
        return null;
    return { x: a.x + t * abx, y: a.y + t * aby, z1: a.z + t * (b.z - a.z), z2: c.z + u * (d.z - c.z) };
}
export function railCrossings() {
    const out: {
        lines: [
            string,
            string
        ];
        point: ReturnType<typeof crossing2d>;
    }[] = [];
    for (const [name, path] of Object.entries(railLines))
        for (const [other, otherPath] of Object.entries(railLines)) {
            if (name >= other)
                continue;
            for (let i = 1; i < path.length; i++)
                for (let j = 1; j < otherPath.length; j++) {
                    const a = path[i - 1], b = path[i], c = otherPath[j - 1], d = otherPath[j];
                    if ([a, b].some(site => [c, d].includes(site)))
                        continue;
                    const p = crossing2d(sites[a], sites[b], sites[c], sites[d]);
                    if (p)
                        out.push({ lines: [name, other], point: p });
                }
        }
    return out;
}
