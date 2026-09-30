import { expect, it } from 'vitest';
import { dispatchRows, directionRows, carRecords, firstDoorAt } from './dispatchEvidence';
import { newState, reduce, restore } from './model';
import { fPhotoCamera, windowCorners, photoWindowHit } from './vehicleWindow';
import { project } from './geometry';
import { glassPosts, tunnelPortal } from './glassGeometry';
it('運行の順番・車体・進行方向がそれぞれ別の候補を残し、三つを合わせると第二便になる', () => {
    const choices = (after: boolean, short: boolean, home: boolean) => dispatchRows.filter(r => (!after || r.stop !== null && r.stop > r.bell) && (!short || carRecords[r.car].gap === 4) && (!home || directionRows.find(d => d.service === r.service)?.toward === '白沢')).map(r => r.service);
    expect(choices(true, true, true)).toEqual([2]);
    expect(choices(false, true, true)).toEqual([2, 3]);
    expect(choices(true, false, true)).toEqual([2, 5]);
    expect(choices(true, true, false)).toEqual([2, 4]);
});
it('白沢行は東から西へ進み、停車後は受け口を動かしても車両の位置が変わらない', () => {
    const train = { service: 2, position: 'approaching' as const, firstDoor: null };
    expect(firstDoorAt({ ...train, progress: 0 }, 7)).toBeGreaterThan(firstDoorAt({ ...train, progress: .7 }, 7));
    expect(firstDoorAt({ ...train, service: 4, progress: 0 }, 7)).toBeLessThan(firstDoorAt({ ...train, service: 4, progress: .7 }, 7));
    expect(firstDoorAt({ service: 2, position: 'stopped', firstDoor: 7 }, 9)).toBe(7);
    expect(firstDoorAt({ service: 2, position: 'leaving', firstDoor: 7, progress: .5 }, 9)).toBeLessThan(7);
});
it('資料の任意の写しが保存され、閲覧は分岐や乗車の状態を変えない', () => {
    const s = newState(), n = reduce(s, { type: 'record', id: 'dispatch-record-1-1-1-1', values: [1, 1, 1, 1] });
    expect(n.route).toEqual(s.route);
    expect(n.train).toEqual(s.train);
    expect(n.flags).toEqual([]);
    expect(restore(JSON.parse(JSON.stringify(n)))).toEqual(n);
    expect(restore({ ...s, notes: [{ id: 'dispatch-record-bad', values: [1, 1, 2, 0], at: 0 }] })).toBeNull();
});
it('車窓の四辺は全てカメラの前にあり、近面の切断を窓枠として描かない', () => {
    for (const p of windowCorners)
        expect(project(p, fPhotoCamera).depth).toBeGreaterThan(.02);
});
it('EからFへ向かう車窓は手前の白柱と同じ坑口を実際の窓を通して写せる', () => {
    const p = glassPosts[0].position;
    expect(p[0]).toBeLessThan(fPhotoCamera.position[0]);
    expect(photoWindowHit([p[0], p[1], 1.4])).not.toBeNull();
    expect(photoWindowHit([tunnelPortal.x, tunnelPortal.y, 0])).not.toBeNull();
    expect(photoWindowHit([tunnelPortal.x, tunnelPortal.y, 5.8])).not.toBeNull();
});
