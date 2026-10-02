import { describe, expect, it } from 'vitest';
import { newState, reduce, restore } from './model';
import type { Room } from './model';
import { visitedPlaces } from './visitedPlaces';

function state(rooms: Room[], room: Room = rooms[0]) {
    return { ...newState(), started: true, room, visited: rooms.map(r => `${r}:0`) };
}
describe('訪れた場所への移動', () => {
    it('未訪問の場所を表示せず、視点を場所単位にまとめる', () => {
        const s = state(['train', 'platform']);
        s.visited.push('train:1', 'platform:2', 'unknown:0', 'office:999');
        expect(visitedPlaces(s).map(p => p.room)).toEqual(['train', 'platform']);
    });
    it('訪れたことのある場面へ戻り、持ち物・謎・訪問記録を変えない', () => {
        const s = state(['train', 'platform', 'waiting']);
        s.visited[2] = 'waiting:2';
        const next = reduce(s, { type: 'travel', room: 'waiting' });
        expect(next).toEqual({ ...s, room: 'waiting', camera: 2 });
        expect(restore(JSON.parse(JSON.stringify(next)))).toEqual(next);
    });
    it('未訪問の中間地点や目的地を飛び越えない', () => {
        const s = state(['train', 'waiting']);
        expect(reduce(s, { type: 'travel', room: 'waiting' })).toBe(s);
        expect(reduce(s, { type: 'travel', room: 'platform' })).toBe(s);
    });
    it.each([
        ['waiting', 'office', 'officeUnlocked'],
        ['forecourt', 'lamp', 'shedOpen'],
        ['bridge', 'north', 'gateOpen'],
        ['passage', 'north', 'northHatch'],
    ] as const)('%sと%sの閉じた経路は通れない', (a, b, gate) => {
        const s = state([a, b]);
        expect(reduce(s, { type: 'travel', room: b })).toBe(s);
        if (gate === 'officeUnlocked') s.flags.push(gate);
        else s.values[gate] = [1];
        expect(reduce(s, { type: 'travel', room: b }).room).toBe(b);
        s.room = b;
        expect(reduce(s, { type: 'travel', room: a }).room).toBe(a);
    });
    it('階段戸が開いていても荷で塞がれていたら迂回しない', () => {
        const s = state(['cargo', 'passage']);
        s.values.stairDoor = [1];
        expect(reduce(s, { type: 'travel', room: 'passage' })).toBe(s);
        s.values.cargo = [0, 1, 0, 3];
        expect(reduce(s, { type: 'travel', room: 'passage' }).room).toBe('passage');
        s.values.stairDoor = [0];
        expect(reduce(s, { type: 'travel', room: 'passage' })).toBe(s);
    });
    it('別の訪問済み経路が通れるときは使える', () => {
        const s = state(['platform', 'bridge', 'north', 'waiting', 'office', 'cargo', 'passage']);
        s.flags.push('officeUnlocked');
        s.values.cargo = [0, 1, 0, 3];
        s.values.stairDoor = [1];
        s.values.northHatch = [1];
        expect(reduce(s, { type: 'travel', room: 'north' }).room).toBe('north');
        s.values.northHatch = [0];
        expect(reduce(s, { type: 'travel', room: 'north' })).toBe(s);
    });
    it('側道からの復帰でも未訪問の視点を追加しない', () => {
        const s = state(['north', 'tunnel'], 'tunnel');
        s.visited[0] = 'north:1';
        expect(reduce(s, { type: 'travel', room: 'north' })).toEqual({ ...s, room: 'north', camera: 1 });
    });
    it('帰りの列車への侵入・乗車後の逆戻り・終了後の移動を拒否する', () => {
        const s = state(['train', 'platform', 'return']);
        expect(reduce(s, { type: 'travel', room: 'return' })).toBe(s);
        const riding = { ...s, room: 'return' as const };
        expect(reduce(riding, { type: 'travel', room: 'platform' })).toBe(riding);
        const ended = { ...s, ended: true };
        expect(reduce(ended, { type: 'travel', room: 'platform' })).toBe(ended);
    });
});
