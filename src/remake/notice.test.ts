import { expect, it } from 'vitest';
import { newState, reduce, restore, trace } from './model';
it('掲示の重なりは保存され、記録後の紙の上げ下げで過去の記録を変えない', () => {
    let s = newState();
    s.room = 'forecourt';
    s = reduce(s, { type: 'values', id: 'noticeLift', values: [1, 1] });
    s = reduce(s, { type: 'record', id: 'noticeBoard', values: s.values.noticeLift });
    s = reduce(s, { type: 'values', id: 'noticeLift', values: [0, 0] });
    expect(s.notes.at(-1)?.values).toEqual([1, 1]);
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    for (const values of [[1], [1, 2], [0, NaN], [0, 1, 0]])
        expect(restore({ ...s, values: { ...s.values, noticeLift: values } })).toBeNull();
    expect(restore({ ...s, notes: [{ id: 'noticeBoard', values: [2, 0] }] })).toBeNull();
});
it('貨車の観察は実物の写しで、観察や告知の記録が線路の閉塞を解除しない', () => {
    let s = newState();
    s.room = 'bridge';
    s = reduce(s, { type: 'look', camera: 3 });
    expect(s.camera).toBe(3);
    s = reduce(s, { type: 'record', id: 'freight', values: [] });
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(restore({ ...s, notes: [{ id: 'freight', values: [1] }] })).toBeNull();
    const old = [0, 0, 0, 0, 1, 1];
    expect(trace(old).end).toBe('occupied');
    expect(trace(old, false).path).toContain('D');
    expect(s.flags).toEqual([]);
    expect(s.route).toEqual(newState().route);
});
