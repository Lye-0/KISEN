import type { Node } from './model';
export const dieOrder: Node[] = ['E', 'F', 'D', 'B', 'A', 'C'];
export const cutPaths: Record<Node, string> = {
    A: 'M0-18L18 0L0 18L-18 0Z',
    B: 'M0-17L17 15H-17Z',
    C: 'M0-18L4.23-5.83L17.12-5.56L6.85 2.23L10.58 14.56L0 7.2L-10.58 14.56L-6.85 2.23L-17.12-5.56L-4.23-5.83Z',
    D: 'M-17 8A17 17 0 0 1 17 8Z',
    E: 'M-17 0A17 17 0 1 0 17 0A17 17 0 1 0-17 0Z',
    F: 'M-17-11H17V11H-17Z',
};
const polygons: Partial<Record<Node, [
    number,
    number
][]>> = {
    A: [[0, -18], [18, 0], [0, 18], [-18, 0]], B: [[0, -17], [17, 15], [-17, 15]],
    C: [[0, -18], [4.23, -5.83], [17.12, -5.56], [6.85, 2.23], [10.58, 14.56], [0, 7.2], [-10.58, 14.56], [-6.85, 2.23], [-17.12, -5.56], [-4.23, -5.83]]
};
export function insideCut(node: Node, x: number, y: number): boolean {
    if (node === 'E')
        return x * x + y * y <= 289;
    if (node === 'F')
        return Math.abs(x) <= 17 && Math.abs(y) <= 11;
    if (node === 'D')
        return y <= 8 && x * x + (y - 8) * (y - 8) <= 289;
    const p = polygons[node]!;
    let inside = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const [xi, yi] = p[i], [xj, yj] = p[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            inside = !inside;
    }
    return inside;
}
// Optical comparison at a fixed 0.2 design-unit sampling pitch. Repeated cuts are a union.
// It recognises the resulting opening, including a smaller cut subsequently swallowed by a larger one.
const signatures = new Map<Node, Uint8Array>();
function signature(node: Node) {
    let a = signatures.get(node);
    if (!a) {
        a = new Uint8Array(201 * 201);
        for (let y = 0; y < 201; y++)
            for (let x = 0; x < 201; x++)
                a[y * 201 + x] = insideCut(node, -20 + x * .2, -20 + y * .2) ? 1 : 0;
        signatures.set(node, a);
    }
    return a;
}
export function sameOpening(cuts: Node[], expected: Node) {
    if (!cuts.length)
        return false;
    const target = signature(expected), actual = [...new Set(cuts)].map(signature);
    return target.every((v, i) => v === Number(actual.some(s => s[i] === 1)));
}
