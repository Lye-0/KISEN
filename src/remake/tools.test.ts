import { expect, it } from 'vitest';
import { expectedHoles, newState, reduce, restore, validTicket } from './model';
import { dieOrder, sameOpening } from './ticketGeometry';
it('全ての試し切りの組合せと九枚を超える比較用の券を再開できる', () => {
    let s = newState();
    s.room = 'office';
    for (let tool = 0; tool < 3; tool++) {
        s = reduce(s, { type: 'selectTool', tool });
        for (let die = 0; die < 6; die++) {
            s = reduce(s, { type: 'selectDie', die });
            for (let slot = 0; slot < 12; slot++) s = reduce(s, { type: 'toolCut', tool, die, slot });
        }
    }
    expect(s.values.toolCuts).toHaveLength(648);
    s = reduce(s, { type: 'take', item: 'paper' });
    for (let i = 0; i < 12; i++) {
        s = reduce(s, { type: 'ticketService', service: 1 });
        s = reduce(s, { type: 'newTicket' });
    }
    expect(s.savedTickets).toHaveLength(12);
    expect(s.savedTickets[0].id).toBe(1);
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
});
it('机で選んだ鋏を直接切り替え、持ち物には移さない', () => {
    let s = newState(); expect(reduce(s, { type: 'selectTool', tool: 0 })).toBe(s);
    s.room = 'office'; s = reduce(s, { type: 'selectTool', tool: 0 });
    expect(s.locations.punch).toBe('toolBench'); expect(s.values.toolSelected).toEqual([0]);
    s = reduce(s, { type: 'selectTool', tool: 1 });
    expect(s.values.toolSelected).toEqual([1]); expect(s.locations.punch).toBe('toolBench');
});
it('刃こぼれの残りは切り直せるが、余分に切った孔は元へ戻らない', () => {
    for (const node of ['A', 'B', 'C', 'D', 'E', 'F'] as const) {
        expect(sameOpening([{ node, tool: 0 }], node)).toBe(false);
        expect(sameOpening([{ node, tool: 2 }], node)).toBe(false);
        expect(sameOpening([{ node, tool: 0 }, { node, tool: 1 }], node)).toBe(true);
        expect(sameOpening([{ node, tool: 2 }, { node, tool: 1 }], node)).toBe(false);
    }
});
it('持ち替えても過去の孔は変わらず、券の実際の開口で判定する', () => {
    let s = newState();
    s.room = 'office';
    s.route = [0, 1, 0, 1, 1, 1];
    const holes = expectedHoles(s.route);
    s = reduce(s, { type: 'take', item: 'paper' });
    s.draft = { id: 1, service: 2, back: false, holes: holes.slice(1) };
    s = reduce(s, { type: 'selectTool', tool: 0 });
    s = reduce(s, { type: 'selectDie', die: dieOrder.indexOf(holes[0].node) });
    s = reduce(s, { type: 'punch', hole: holes[0] });
    expect(validTicket(s, s.draft)).toBe(false);
    s = reduce(s, { type: 'selectTool', tool: 1 });
    expect(validTicket(s, s.draft)).toBe(false);
    s = reduce(s, { type: 'punch', hole: holes[0] });
    expect(validTicket(s, s.draft)).toBe(true);
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
});
it('試し紙の孔と使った道具を保存し、新しい紙へ替えても前の記録を保持する', () => {
    let s = newState();
    s.room = 'office';
    s = reduce(s, { type: 'selectTool', tool: 2 });
    s = reduce(s, { type: 'selectDie', die: 1 });
    s = reduce(s, { type: 'toolCut', tool: 2, die: 1, slot: 7 });
    s = reduce(s, { type: 'record', id: 'toolTrial', values: s.values.toolCuts });
    s = reduce(s, { type: 'newTrialPaper' });
    expect(s.notes).toHaveLength(1);
    expect(s.values.toolCuts).toEqual([]);
    expect(s.notes.at(-1)?.values).toEqual([2, 1, 7]);
    expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    expect(restore({ ...s, values: { toolCuts: [3, 1, 7] } })).toBeNull();
});

it('三本・六種類の刃で、試し切りと切符加工が同じ鋏を使う', () => {
    for (let tool = 0; tool < 3; tool++) for (let die = 0; die < 6; die++) {
        let s = newState(); s.room = 'office';
        s = reduce(s, { type: 'newTicket' }); s = reduce(s, { type: 'selectTool', tool }); s = reduce(s, { type: 'selectDie', die });
        s = reduce(s, { type: 'toolCut', tool, die, slot: 0 });
        s = reduce(s, { type: 'punch', hole: { column: 0, side: 'white', node: dieOrder[die] } });
        expect(s.values.toolCuts).toEqual([tool,die,0]); expect(s.draft!.holes[0]).toMatchObject({tool, node:dieOrder[die]});
        expect(s.locations.punch).toBe('toolBench'); expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    }
});
it('旧保存の携帯していた鋏を優先し、過去の切り込みを変えずに机へ統合する', () => {
    const s = newState(); delete s.values.deskToolRevision; s.locations.punch = 'inventory';
    s.values.punchTool = [2]; s.values.toolSelected = [0]; s.values.toolCuts = [0,1,2];
    const loaded = restore(s)!;
    expect(loaded.locations.punch).toBe('toolBench'); expect(loaded.values.toolSelected).toEqual([2]);
    expect(loaded.values.punchTool).toBeUndefined(); expect(loaded.values.toolCuts).toEqual([0,1,2]);
    expect(restore(JSON.parse(JSON.stringify(loaded)))).toEqual(loaded);
});
it('選択と食い違う古い操作や、机の外からの加工を受け付けない', () => {
    let s = newState(); s.room = 'office'; s = reduce(s, { type: 'newTicket' });
    s = reduce(s, { type: 'selectTool', tool: 1 }); s = reduce(s, { type: 'selectDie', die: 0 });
    expect(reduce(s, { type: 'toolCut', tool: 0, die: 0, slot: 0 })).toBe(s);
    expect(reduce(s, { type: 'punch', hole: { column: 0, side: 'white', node: 'A' } })).toBe(s);
    expect(reduce(s, { type: 'put', item: 'punch', place: 'inventory' })).toBe(s);
    s.room = 'north'; expect(reduce(s, { type: 'punch', hole: { column: 0, side: 'white', node: 'E' } })).toBe(s);
});
