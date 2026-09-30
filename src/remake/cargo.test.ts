import { it, expect } from 'vitest';
import { cargoInitial, moveCargo, stairsClear, chestClear, validCargo } from './cargo';
import { newState, reduce, restore } from './model';
import type { State } from './model';
it('箱と棚が実際に干渉し、退避して棚を動かした後で箱を戻せる', () => {
    let v = cargoInitial;
    expect(validCargo(v)).toBe(true);
    expect(moveCargo(v, 3, 1)).toBeNull();
    expect(moveCargo(v, 2, -1)).toBeNull();
    expect(moveCargo(v, 0, -1)).toBeNull();
    for (const [i, d] of [[1, 1], [0, -1], [2, -1], [3, 1], [3, 1], [3, 1], [2, 1], [0, 1], [1, -1]]) {
        const next = moveCargo(v, i, d);
        expect(next).not.toBeNull();
        v = next!;
    }
    expect(stairsClear(v)).toBe(true);
    expect(chestClear(v)).toBe(true);
});
it('荷物箱を先に調べる別順を、作業完了フラグで止めない', () => { expect(chestClear(cargoInitial)).toBe(true); expect(stairsClear(cargoInitial)).toBe(false); });
it('北ホームの閉じた地下蓋は外から先取りできない', () => {
    const north: State = { ...newState(), room: 'north', camera: 2 };
    expect(reduce(north, { type: 'northHatch' })).toBe(north);
    expect(reduce(north, { type: 'move', room: 'tunnel' })).toBe(north);
});
it('保存された荷物配置の短い配列、干渉、範囲外を復元しない', () => {
    for (const cargo of [[1], [1, 0, 1, 2], [4, 0, 1, 1]])
        expect(restore({ ...newState(), values: { cargo } })).toBeNull();
    expect(moveCargo(cargoInitial, 1.5, 1)).toBeNull();
});
it('荷物を実際に動かしてから階段戸を開き、保存後も逆操作できる', () => {
    let s: State = { ...newState(), room: 'cargo' };
    expect(reduce(s, { type: 'stairDoor' })).toBe(s);
    for (const [index, direction] of [[1, 1], [0, -1], [2, -1], [3, 1], [3, 1], [3, 1]])
        s = reduce(s, { type: 'cargoMove', index, direction });
    expect(stairsClear(s.values.cargo as typeof cargoInitial)).toBe(true);
    s = reduce(s, { type: 'stairDoor' });
    expect(s.values.stairDoor).toEqual([1]);
    const saved = restore(JSON.parse(JSON.stringify(s)))!;
    expect(saved.values.cargo).toEqual(s.values.cargo);
    expect(reduce(saved, { type: 'cargoMove', index: 2, direction: -1 })).toBe(saved);
    const tunnel = reduce(saved, { type: 'move', room: 'tunnel' });
    expect(tunnel.room).toBe('tunnel');
    expect(reduce(tunnel, { type: 'move', room: 'north' })).toBe(tunnel);
    const opened = reduce(tunnel, { type: 'northHatch' });
    const north = reduce(opened, { type: 'move', room: 'north', camera: 2 });
    expect(north.room).toBe('north');
    expect(reduce(north, { type: 'move', room: 'tunnel' }).room).toBe('tunnel');
});
