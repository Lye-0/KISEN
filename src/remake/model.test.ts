import { describe, it, expect } from 'vitest';
import { newState, reduce, trace, expectedHoles, validTicket, restore } from './model';
describe('remake:物の状態', () => {
    it('鞄は帯と留めの両方を外して開く。個別取得が残る', () => {
        let s = newState();
        s = reduce(s, { type: 'bagMouth' });
        expect(s.bag.mouth).toBe(false);
        s = reduce(s, { type: 'bagClasp' });
        s = reduce(s, { type: 'bagMouth' });
        expect(s.bag.mouth).toBe(false);
        s = reduce(s, { type: 'bagStrap', position: 1 });
        s = reduce(s, { type: 'bagMouth' });
        s = reduce(s, { type: 'take', item: 'photos' });
        expect(s.locations.photos).toBe('inventory');
        expect(s.locations.receipt).toBe('handle');
        expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s);
    });
    it('観察は現在値の写しであり後の操作に変わらない', () => {
        let s = newState();
        s = reduce(s, { type: 'values', id: 'tape', values: [-9] });
        s = reduce(s, { type: 'record', id: 'tape' });
        s = reduce(s, { type: 'values', id: 'tape', values: [3] });
        expect(s.notes[0].values).toEqual([-9]);
    });
});
describe('remake:現在の経路と券', () => {
    it('96配置には二つの帰路、未使用レバーを含む4つの有効配置がある', () => {
        const legal = Array.from({ length: 96 }, (_, n) => { let k = n; return [2, 2, 2, 2, 3, 2].map(limit => { const v = k % limit; k = Math.floor(k / limit); return v; }); }).map(v => trace(v)).filter(r => r.end === 'O');
        expect(legal).toHaveLength(4);
        expect(new Set(legal.map(r => r.path.join('-'))).size).toBe(2);
    });
    it('同じ分岐橋でも入る側が経路で変わる', () => {
        const b = expectedHoles([0, 1, 0, 1, 1, 1]), c = expectedHoles([1, 0, 0, 1, 2, 1]);
        expect(b.find(h => h.node === 'E')?.side).toBe('black');
        expect(c.find(h => h.node === 'E')?.side).toBe('white');
    });
    it('設置券は手元からの加工を受けず、現在の経路で再評価する', () => {
        let s = newState();
        s.route = [0, 1, 0, 1, 1, 1];
        s.draft = { id: 1, holes: expectedHoles(s.route), service: 2, back: true };
        s.values.toolSelected = [1];
        s.locations.ticket = 'inventory'; s.room = 'north';
        s = reduce(s, { type: 'flipTicket' });
        s.values.readerClamp = [1];
        s.values.readerDepth = [.65];
        s = reduce(s, { type: 'mountTicket' });
        expect(validTicket(s, s.mounted)).toBe(true);
        s = reduce(s, { type: 'punch', hole: { column: 0, node: 'C', side: 'white' } });
        expect(validTicket(s, s.mounted)).toBe(true);
        s = reduce(s, { type: 'route', index: 0, value: 1 });
        expect(validTicket(s, s.mounted)).toBe(false);
    });
    it('選択していない側から来た車両は、別の出口へ転送されない', () => {
        expect(trace([0, 1, 0, 1, 2, 1]).end).toBe('disconnected');
        expect(trace([0, 1, 0, 0, 1, 0], false, 'R').path).toEqual(['R', 'F', 'E', 'B', 'A', 'S']);
    });
    it('初回版の保存は新版へ混ぜない', () => { expect(restore({ version: 1 })).toBeNull(); });
});
it('便印の重ね押しで前の印が消えず、押した面も保存される', () => { let s = newState(); s.room = 'office'; s = reduce(s, { type: 'newTicket' }); s.route = [0, 1, 0, 1, 1, 1]; s.draft!.holes = expectedHoles(s.route); s = reduce(s, { type: 'ticketService', service: 1 }); s = reduce(s, { type: 'flipTicket' }); s = reduce(s, { type: 'ticketService', service: 2 }); expect(s.draft!.marks).toEqual([{ service: 1, back: false }, { service: 2, back: true }]); expect(validTicket(s, s.draft)).toBe(false); expect(restore(JSON.parse(JSON.stringify(s)))).toEqual(s); });
