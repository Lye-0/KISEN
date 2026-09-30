import { expect, it } from 'vitest';
import { railCrossings, railLines, sites } from './routeGeometry';
import { connections, nodes } from './model';
it('現物の線は二口分岐モデルの全接続を持ち、誤認される交差だけが立体で分かれる', () => {
    for (const node of nodes)
        for (const pair of connections[node])
            for (const other of pair) {
                const edge = [node, other].sort().join('-');
                expect(Object.keys(railLines).some(id => id.split('-').sort().join('-') === edge), edge).toBe(true);
            }
    const crossings = railCrossings();
    expect(crossings.map(x => x.lines.sort().join('/'))).toEqual(['C-X/E-F']);
    expect(crossings[0].point?.x).toBeCloseTo(-46.923, 2);
    expect(Math.abs(crossings[0].point!.z1 - crossings[0].point!.z2)).toBeGreaterThan(3.5);
    const slope = (sites.X.z - sites.C.z) / Math.hypot(sites.X.x - sites.C.x, sites.X.y - sites.C.y);
    expect(slope).toBeLessThan(.04);
    const seenFromBridge = Math.hypot(crossings[0].point!.x + 8, crossings[0].point!.y - 25);
    expect(seenFromBridge).toBeLessThan(45);
});
