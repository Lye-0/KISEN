import { expect, it } from 'vitest';
import { shutterOptics, boardingGeometry, freshSignals, illuminatedPorts, mounts, services, stopAt, supportedDoors } from './stopping';
import { expectedHoles, newState, reduce, restore } from './model';
it('進入と退去の途中で保存再開しても呼び直しや停止位置を混同しない', () => {
    let s = reduce(ready(), { type: 'call', service: 2 });
    s = reduce(s, { type: 'trainAdvance', seconds: 1 });
    s = restore(JSON.parse(JSON.stringify(s)))!;
    expect(s.train.progress).toBe(.25);
    for (let i = 0; i < 3; i++)
        s = reduce(s, { type: 'trainAdvance', seconds: 1 });
    expect(s.train.firstDoor).toBe(7);
    s = reduce(s, { type: 'releaseTrain' });
    s = reduce(s, { type: 'trainAdvance', seconds: 1 });
    s = restore(JSON.parse(JSON.stringify(s)))!;
    expect(s.train.position).toBe('leaving');
    expect(reduce(s, { type: 'call', service: 5 })).toBe(s);
    for (let i = 0; i < 3; i++)
        s = reduce(s, { type: 'trainAdvance', seconds: 1 });
    expect(s.train.position).toBe('absent');
    expect(reduce(s, { type: 'trainAdvance', seconds: NaN })).toBe(s);
});
function ready() {
    let s = newState();
    s.room = 'north';
    s.values.bellChannel = [1];
    s.route = [0, 1, 0, 1, 1, 1];
    s.locations = { ...s.locations, lamp: 'inventory', spareLamp: 'inventory', hood: 'inventory', retainingPin: 'inventory' };
    s = reduce(s, { type: 'signalHood' });
    s = reduce(s, { type: 'shutter', plate: 0, step: 2 });
    s = reduce(s, { type: 'shutter', plate: 1, step: 3 });
    s = reduce(s, { type: 'signalMount', lamp: 0, mark: 7 });
    s = reduce(s, { type: 'signalMount', lamp: 1, mark: 11 });
    s.locations.ticket = 'reader'; s.mounted = { id: 1, holes: expectedHoles(s.route), service: 2, back: false };
    s.values.readerClamp = [0];
    return s;
}
it('全便・全灯具配置を走査し、第2便の7/11mだけが両方の扉を支える', () => {
    const safe: string[] = [];
    for (const service of services)
        for (const a of mounts)
            for (const b of mounts) {
                if (a === b)
                    continue;
                const signals = { mounts: [a, b] as [
                        number,
                        number
                    ], shutters: [2, 3] as [
                        number,
                        number
                    ] };
                const train = stopAt(service.id, signals, true, true);
                if (boardingGeometry(train, signals, true))
                    safe.push(`${service.id}:${a}/${b}`);
            }
    expect(safe).toEqual(['2:7/11', '2:11/7']);
});
it('二枚の羽根の実開口が同時に二つの光路を通すのは一配置', () => {
    const open: number[][] = [];
    for (let a = 0; a < 5; a++)
        for (let b = 0; b < 5; b++) {
            const s = { ...freshSignals(), shutters: [a, b] as [
                    number,
                    number
                ] };
            if (illuminatedPorts(s, true).every(Boolean))
                open.push([a, b]);
            expect(illuminatedPorts(s, false)).toEqual([false, false]);
        }
    expect(open).toEqual([[2, 3]]);
});
it('到着の直前に灯具を移すと現在の位置で止まり、停車後には車両が動かない', () => {
    let s = reduce(ready(), { type: 'call', service: 2 });
    s = reduce(s, { type: 'signalMount', lamp: 0, mark: 6 });
    s = reduce(s, { type: 'signalMount', lamp: 1, mark: 10 });
    s = reduce(s, { type: 'trainArrive' });
    expect(s.train.firstDoor).toBe(6);
    expect(supportedDoors(s.train)).toEqual([false, false]);
    s = reduce(s, { type: 'signalMount', lamp: 0, mark: 7 });
    s = reduce(s, { type: 'signalMount', lamp: 1, mark: 11 });
    expect(s.train.firstDoor).toBe(6);
    expect(reduce(s, { type: 'board' }).room).toBe('north');
    s = reduce(s, { type: 'releaseTrain' });
    for (let i = 0; i < 4; i++)
        s = reduce(s, { type: 'trainAdvance', seconds: 1 });
    s = reduce(s, { type: 'call', service: 2 });
    s = reduce(s, { type: 'trainArrive' });
    expect(reduce(s, { type: 'board' }).room).toBe('return');
});
it('観察フラグは停車や乗車を許可せず、灯具の回収・覆いの取外しを再評価する', () => {
    let s = ready();
    s.signals.shutters = [0, 0];
    s.flags = ['signal', 'footing'];
    s = reduce(reduce(s, { type: 'call', service: 2 }), { type: 'trainArrive' });
    expect(s.train.position).toBe('passing');
    for (const action of [{ type: 'signalMount', lamp: 0, mark: null }, { type: 'signalHood' }, { type: 'readerClamp' }] as const) {
        let t = reduce(reduce(ready(), { type: 'call', service: 2 }), { type: 'trainArrive' });
        t = reduce(t, action);
        expect(reduce(t, { type: 'board' }).room).toBe('north');
    }
});
it('6m間隔の便を止められても足場が不成立で、呼び直せる', () => {
    let s = ready();
    s = reduce(s, { type: 'signalMount', lamp: 0, mark: 6 });
    s = reduce(s, { type: 'signalMount', lamp: 1, mark: 12 });
    s = reduce(reduce(s, { type: 'call', service: 5 }), { type: 'trainArrive' });
    expect(s.train.position).toBe('stopped');
    expect(supportedDoors(s.train)).toEqual([false, false]);
    expect(reduce(s, { type: 'call', service: 2 })).toBe(s);
    expect(reduce(s, { type: 'board' })).toBe(s);
    expect(reduce(s, { type: 'releaseTrain' }).train.position).toBe('leaving');
});
it('使用中の分岐は固定し、未使用の枝と出発後の入力を区別する', () => {
    let s = reduce(ready(), { type: 'call', service: 2 });
    expect(reduce(s, { type: 'route', index: 0, value: 1 })).toBe(s);
    expect(reduce(s, { type: 'route', index: 2, value: 1 }).route[2]).toBe(1);
    s = reduce(reduce(s, { type: 'trainArrive' }), { type: 'board' });
    expect(reduce(s, { type: 'move', room: 'north' })).toBe(s);
    expect(reduce(s, { type: 'releaseTrain' })).toBe(s);
});
it('灯具の個体・配置・停車位置を保存し、旧試作の進行も保持する', () => {
    const s = reduce(reduce(ready(), { type: 'call', service: 2 }), { type: 'trainArrive' });
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(restore({ ...s, signals: { ...s.signals, mounts: [7, 7] } })).toBeNull();
    expect(restore({ ...s, signals: { ...s.signals, mounts: [null, 11] } })).toBeNull();
    expect(restore({ ...s, train: { ...s.train, firstDoor: NaN } })).toBeNull();
    const legacy = { ...s, signals: undefined, train: { service: 2, position: 'stopped' } };
    const migrated = restore(legacy)!;
    expect(migrated.mounted).toEqual(s.mounted);
    expect(migrated.train.position).toBe('absent');
    expect(migrated.locations.lamp).toBe('inventory');
    expect(restore(JSON.parse(JSON.stringify(migrated)))).toEqual(migrated);
});
it('重複取付や所在のない取付、汎用の移動操作による設置の迂回を拒否する', () => {
    const s = ready();
    expect(reduce(s, { type: 'signalMount', lamp: 0, mark: 11 })).toBe(s);
    expect(reduce(s, { type: 'take', item: 'lamp' })).toBe(s);
    expect(reduce(s, { type: 'put', item: 'lamp', place: 'inventory' })).toBe(s);
    const empty = newState();
    empty.room = 'north';
    expect(reduce(empty, { type: 'signalMount', lamp: 0, mark: 7 })).toBe(empty);
    expect(reduce(empty, { type: 'signalHood' })).toBe(empty);
});
it('現在の回線へ接続していなければ、同じ灯具と路線でも通過する', () => { let s = ready(); s.values.bellChannel = [0]; s = reduce(reduce(s, { type: 'call', service: 2 }), { type: 'trainArrive' }); expect(s.train.position).toBe('passing'); const old = ready(); delete old.values.bellChannel; expect(restore(old)?.values.bellChannel).toEqual([1]); });

it('穴の重なり・光路開通・通電を別々に扱う', () => {
    const s = freshSignals();
    s.shutters = [1, 2];
    expect(shutterOptics(s, true, true).transmitted).toEqual([false, false]);
    s.shutters = [2, 3];
    expect(shutterOptics(s, true, true)).toEqual({ powered: true, aligned: [true, true], transmitted: [true, true] });
    expect(shutterOptics(s, true, false)).toEqual({ powered: false, aligned: [true, true], transmitted: [false, false] });
    expect(shutterOptics(s, false, true).transmitted).toEqual([false, false]);
});

it('重なりだけ・光路まで開通・未通電で列車の通過と停止も一致する', () => {
    for (const [shutters, power, position] of [[[1, 2], 1, 'passing'], [[2, 3], 1, 'stopped'], [[2, 3], 0, 'passing']] as const) {
        let s = ready(); s.signals.shutters = [...shutters]; s.values.bellChannel = [power];
        s = reduce(s, { type: 'call', service: 2 });
        s = reduce(s, { type: 'trainArrive' });
        expect(s.train.position).toBe(position);
    }
});
