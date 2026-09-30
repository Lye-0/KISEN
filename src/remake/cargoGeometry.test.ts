import { expect, it } from 'vitest';
import { cargoCamera, cargoRoom, cargoStairDoor, projectedBounds, cargoVisualBounds } from './cargoGeometry';
import { cargoBoxes, cargoInitial, validCargo, stairsClear } from './cargo';
import type { Cargo } from './cargo';
it('全ての荷の配置が駅舎の荷物室内にあり、戸の前を塞ぐ状態が通行判定と一致する', () => {
    expect(cargoCamera.position[0]).toBeGreaterThan(cargoRoom.west);
    expect(cargoCamera.position[0]).toBeLessThan(cargoRoom.east);
    expect(cargoCamera.position[1]).toBeGreaterThan(cargoRoom.south);
    expect(cargoCamera.position[1]).toBeLessThan(cargoRoom.north);
    let count = 0;
    for (let a = 0; a < 4; a++)
        for (let b = 0; b < 2; b++)
            for (let t = 0; t < 2; t++)
                for (let shelf = 0; shelf < 5; shelf++) {
                    const v: Cargo = [a, b, t, shelf];
                    if (!validCargo(v))
                        continue;
                    count++;
                    for (const box of cargoBoxes(v)) {
                        expect(box.x).toBeGreaterThanOrEqual(cargoRoom.west);
                        expect(box.x + box.w).toBeLessThanOrEqual(cargoRoom.east);
                        expect(box.y).toBeGreaterThanOrEqual(cargoRoom.south);
                        expect(box.y + box.d).toBeLessThanOrEqual(cargoRoom.north);
                        expect(box.h).toBeLessThan(cargoRoom.ceiling);
                        const view = cargoVisualBounds(box);
                        expect(view.y).toBeGreaterThan(0);
                        expect(view.y + view.h).toBeLessThan(941);
                    }
                    const rack = cargoBoxes(v)[3];
                    const blocked = rack.y < -8.5 && rack.y + rack.d > -9.4;
                    expect(stairsClear(v)).toBe(!blocked);
                }
    expect(count).toBe(21);
});
it('初期配置の棚は階段戸を覆う投影になり、退避後は戸が見える', () => {
    const door = projectedBounds(cargoStairDoor);
    const shelf = cargoVisualBounds(cargoBoxes(cargoInitial)[3]);
    expect(shelf.x).toBeLessThan(door.x);
    expect(shelf.x + shelf.w).toBeGreaterThan(door.x + door.w);
    expect(shelf.y).toBeLessThan(door.y);
    expect(shelf.y + shelf.h).toBeGreaterThan(door.y + door.h);
    const moved = cargoVisualBounds(cargoBoxes([0, 1, 0, 4])[3]);
    expect(moved.x + moved.w).toBeLessThan(door.x);
});
