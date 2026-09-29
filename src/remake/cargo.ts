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
    if (v.some((n, i) => !Number.isInteger(n) || n < 0 || n > [3, 1, 1, 4][i]))
        return false;
    const cells = occupied(v).flat().map(c => c.join(':'));
    return cells.length === new Set(cells).size;
}
export function moveCargo(v: Cargo, index: number, direction: number): Cargo | null {
    if (index < 0 || index > 3 || ![-1, 1].includes(direction))
        return null;
    const n = [...v] as Cargo;
    n[index] += direction;
    return validCargo(n) ? n : null;
}
export const stairsClear = (v: Cargo) => !occupied(v).flat().some(([x, y]) => x === 2 && (y === 1 || y === 2));
export const chestClear = (v: Cargo) => !occupied(v).flat().some(([x, y]) => x === 2 && y === 0);
export function cargoBoxes(v: Cargo) {
    const x0 = 12.65, y0 = -11.75, step = .8;
    return [
        { id: 'long', x: x0, y: y0 + v[0] * step, w: .7, d: 2.3, h: .95 },
        { id: 'wide', x: x0 + v[1] * step, y: y0, w: 1.5, d: .7, h: .7 },
        { id: 'trolley', x: x0 + v[2] * step, y: y0 + 3 * step, w: 1.5, d: .7, h: .25 },
        { id: 'shelf', x: x0 + 2 * step, y: y0 + v[3] * step, w: .75, d: 1.5, h: 2.6 },
    ];
}
