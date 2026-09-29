import { it, expect } from 'vitest';
import { cargoInitial, moveCargo, stairsClear, chestClear, validCargo } from './cargo';
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
