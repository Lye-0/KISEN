import { expect, it } from 'vitest';
import { arrivalTicket } from './arrivalTicket';
import { arrivalPhotos, observation } from './arrivalPhotos';
import { newState, reduce, restore } from './model';
it('床の券の孔は車窓写真の増加列と整合し、室外からは拾えない', () => {
    expect(arrivalTicket.holes.map(h => `${h.node}:${h.side}`)).toEqual(['F:black', 'E:white', 'B:black', 'A:black']);
    arrivalPhotos.forEach((photo, at) => {
        for (const column of photo.visible)
            expect(observation(at, column)).toBe(column < at);
    });
    let s = newState();
    expect(reduce({ ...s, room: 'office' }, { type: 'take', item: 'ownTicket' }).locations.ownTicket).toBe('floor');
    s = reduce(s, { type: 'take', item: 'ownTicket' });
    expect(s.locations.ownTicket).toBe('inventory');
    expect(restore(JSON.parse(JSON.stringify(s)))?.locations.ownTicket).toBe('inventory');
});
