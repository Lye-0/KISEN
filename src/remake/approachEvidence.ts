import type { Node } from './model';
/** Surveyed appearance at each approach, as printed on the local operating slips.
 * These are observations, not ticket edges. Unknown destinations stay unknown in the UI. */
export const approachBands: Record<Node, Record<string, 1 | 2>> = {
    A: { S: 1, B: 2, C: 2 }, B: { A: 1, D: 2, E: 2 },
    C: { A: 2, E: 1, X: 1 }, D: { O: 1, B: 1, F: 2 },
    E: { B: 2, C: 1, F: 1 }, F: { E: 1, R: 2, D: 2 },
};
