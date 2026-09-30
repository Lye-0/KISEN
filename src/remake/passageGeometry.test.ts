import { expect, it } from 'vitest';
import { passage as r, passageSteps, passageCameras, passageWindow } from './passageGeometry';
import { newState, reduce, restore } from './model';
it('横断通路は二本の線路の下で一定の深さと頭上の空間を保ち、両端だけで上がる', () => {
    expect(r.floor).toBe(-3);
    expect(r.ceiling - r.floor).toBeGreaterThan(2.2);
    for (const rail of [1, 5])
        expect(rail > r.southBottom && rail < r.northBottom && r.ceiling < 0).toBe(true);
    expect(r.northBottom - r.southBottom).toBe(10);
    const south = passageSteps('south'), north = passageSteps('north');
    expect(south).toHaveLength(18);
    expect(north).toHaveLength(15);
    expect(south[0].previousZ).toBe(0);
    expect(south.at(-1)?.z).toBe(-3);
    expect(south.at(-1)?.end).toBeCloseTo(r.southBottom);
    expect(north[0].previousZ).toBe(-3);
    expect(north.at(-1)?.z).toBe(-.75);
    expect(north.at(-1)?.end).toBeCloseTo(r.northTop);
    expect(passageCameras.landing.position[2]).toBeGreaterThan(0);
    expect(passageWindow.every(p => p[2] > 0)).toBe(true);
});
it('窓と出口は北の踊り場からだけ操作し、地下途中からホームへ飛ばない', () => {
    let s = { ...newState(), room: 'passage' as const, values: { stairDoor: [1] } };
    expect(reduce(s, { type: 'northHatch' })).toBe(s);
    expect(reduce(s, { type: 'look', camera: 2 })).toBe(s);
    s = reduce(s, { type: 'look', camera: 1 }) as typeof s;
    expect(reduce(s, { type: 'move', room: 'cargo' })).toBe(s);
    s = reduce(s, { type: 'look', camera: 2 }) as typeof s;
    s = reduce(s, { type: 'northHatch' }) as typeof s;
    expect(reduce(s, { type: 'move', room: 'north', camera: 2 }).room).toBe('north');
    s = reduce(s, { type: 'look', camera: 3 }) as typeof s;
    expect(reduce(s, { type: 'move', room: 'north' })).toBe(s);
});
it('以前の地下保存を対応する北側踊り場へ移し、棚と戸の状態を保持する', () => {
    const old = { ...newState(), room: 'tunnel', camera: 0, values: { stairDoor: [1], northHatch: [1], cargo: [0, 1, 0, 4] }, visited: ['tunnel:0', 'cargo:0'] };
    const s = restore(old)!;
    expect(s.room).toBe('passage');
    expect(s.camera).toBe(2);
    expect(s.values.cargo).toEqual(old.values.cargo);
    expect(s.visited).toEqual(['passage:2', 'cargo:0']);
    expect(restore(s)?.camera).toBe(2);
});
