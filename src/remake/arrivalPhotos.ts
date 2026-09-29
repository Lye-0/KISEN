export type PhotoId = 'tunnel' | 'tower-east' | 'tower-west' | 'crossing';
export const arrivalPhotos = [
    { id: 'tunnel' as PhotoId, visible: [0, 1], punched: [], side: 'west' },
    { id: 'tower-east' as PhotoId, visible: [0, 1], punched: [0], side: 'east' },
    { id: 'tower-west' as PhotoId, visible: [1, 2], punched: [0, 1], side: 'west' },
    { id: 'crossing' as PhotoId, visible: [2, 3], punched: [0, 1, 2], side: 'north' },
];
export const initialPhotoOrder = [2, 0, 3, 1];
// A photographed mark can be unknown, absent, or present. Unknown is never treated as absent.
export function observation(photo: number, column: number): boolean | null { const p = arrivalPhotos[photo]; return !p?.visible.includes(column) ? null : p.punched.includes(column); }
export function consistentPhotoOrder(order: number[]) {
    for (let i = 0; i < order.length; i++)
        for (let j = i + 1; j < order.length; j++)
            for (let column = 0; column < 4; column++)
                if (observation(order[i], column) === true && observation(order[j], column) === false)
                    return false;
    return order.length === 4 && new Set(order).size === 4 && order.every(n => n >= 0 && n < 4);
}
export const arrivalCaseSides = [3, 1, 3, 0]; // North/East/South/West: photographic viewpoint, not the ticket's stamps.
