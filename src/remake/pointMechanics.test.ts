import { expect, it } from 'vitest';
import { connections, nodes, newState, reduce, trace, restore } from './model';
import { physicalRailContacts, wyeSettings, pointLocked } from './pointMechanics';
it('通常ポイントと三つの連動ポイントの接触は二口旅程モデルと全位置で一致する', () => {
    for (const node of nodes)
        for (let i = 0; i < connections[node].length; i++)
            expect(physicalRailContacts(node, i)).toEqual([connections[node][i]]);
    for (let i = 0; i < 3; i++) {
        const settings = wyeSettings(i), active = settings.flatMap((other, corner) => other === null ? [] : [[corner, other]]);
        expect(active).toHaveLength(2);
        for (const [a, b] of active)
            expect(settings[b]).toBe(a);
        expect(settings.filter(v => v === null)).toHaveLength(1);
    }
});
it('レバーを戻すと現在の接触も戻り、未使用の分岐だけは列車進入中も操作できる', () => {
    let s = { ...newState(), room: 'north' as const, route: [0, 1, 0, 1, 1, 1] };
    const original = s.route.slice();
    s = reduce(s, { type: 'route', index: 4, value: 2 }) as typeof s;
    expect(physicalRailContacts('E', s.route[4])).toEqual([['C', 'F']]);
    s = reduce(s, { type: 'route', index: 4, value: 1 }) as typeof s;
    expect(s.route).toEqual(original);
    s = reduce(s, { type: 'call', service: 2 }) as typeof s;
    const used = trace(s.route).path;
    for (let i = 0; i < 6; i++)
        expect(pointLocked(s, i, used)).toBe(used.includes(nodes[i]));
    expect(reduce(s, { type: 'route', index: 4, value: 2 })).toBe(s);
    expect(reduce(s, { type: 'route', index: 2, value: 1 }).route[2]).toBe(1);
    expect(restore(JSON.parse(JSON.stringify(s)))?.route).toEqual(s.route);
});
it('操作位置の保存と観察記録で、不正な位置が画面の配列参照へ入らない', () => { const s = newState(); s.notes = [{ id: 'point-observation-4', values: [4, 2], at: 0 }]; expect(restore(s)?.notes[0].values).toEqual([4, 2]); for (const values of [[6, 0], [0, 2], [4, 3], [4.5, 1], [1]])
    expect(restore({ ...s, notes: [{ id: 'point-observation-1', values, at: 0 }] })).toBeNull(); expect(restore({ ...s, values: { pointSelected: [6] } })).toBeNull(); });
