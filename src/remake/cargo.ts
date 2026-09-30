export type Cargo = [
    number,
    number,
    number,
    number
];
export const cargoInitial: Cargo = [1, 0, 1, 1];
// Grid is an authoring constraint for actual floor guides, not a separate game board.
// long crate: col 0, 3 rows; wide crate: row 0, 2 cols;
// trolley: row 3, 2 cols; wheeled shelf: col 2, 2 rows.
export function occupied(v: Cargo) {
    return [
        Array.from({ length: 3 }, (_, i) => [0, v[0] + i]),
        Array.from({ length: 2 }, (_, i) => [v[1] + i, 0]),
        Array.from({ length: 2 }, (_, i) => [v[2] + i, 3]),
        Array.from({ length: 2 }, (_, i) => [2, v[3] + i]),
    ];
}
export function validCargo(v: Cargo) {
    if (!Array.isArray(v) || v.length !== 4 || v.some((n, i) => !Number.isInteger(n) || n < 0 || n > [3, 1, 1, 4][i]))
        return false;
    const cells = occupied(v).flat().map(c => c.join(':'));
    return cells.length === new Set(cells).size;
}
export function moveCargo(v: Cargo, index: number, direction: number): Cargo | null {
    if (!validCargo(v) || !Number.isInteger(index) || index < 0 || index > 3 || ![-1, 1].includes(direction))
        return null;
    const n = [...v] as Cargo;
    n[index] += direction;
    return validCargo(n) ? n : null;
}
export const stairsClear = (v: Cargo) => !occupied(v).flat().some(([x, y]) => x === 2 && (y === 1 || y === 2));
export const chestClear = (v: Cargo) => !occupied(v).flat().some(([x, y]) => x === 2 && y === 0);
export const cargoGrid = { x: 12.6, y: -10.1, stepX: .8, stepY: .55 };
export function cargoBoxes(v: Cargo) {
    const { x: x0, y: y0, stepX, stepY } = cargoGrid;
    return [
        { id: 'long', x: x0, y: y0 + v[0] * stepY, w: .7, d: 1.55, h: .75 },
        { id: 'wide', x: x0 + v[1] * stepX, y: y0, w: 1.5, d: .5, h: .65 },
        { id: 'trolley', x: x0 + v[2] * stepX, y: y0 + 3 * stepY, w: 1.5, d: .5, h: .25 },
        { id: 'shelf', x: x0 + 2 * stepX, y: y0 + v[3] * stepY, w: .75, d: 1.05, h: 2.5 },
    ];
}
