import { expect, it } from 'vitest';
import { stagedHint, ticketAnswer, cargoHintMoves } from './hintStages';
import { newState, nodes, trace, validTicket } from './model';
import type { Hole } from './model';
import { pointNames } from './pointMechanics';
import { moveCargo, stairsClear, validCargo } from './cargo';
import type { Cargo } from './cargo';
import { cargoUnlocks } from './cargoDockets';
import { shedUnlocks } from './posters';
import { illuminatedPorts } from './stopping';
import { receiptTrayReleases } from './lostProperty';
import { balanceReleases } from './balance';
const hint = (id: string, s = newState()) => stagedHint({ id, title: id, clues: ['着眼点', 'その奥を調べる'] }, s);
it('謎ごとに段階数を変え、最初から暗証番号を明かさない', () => {
    expect(hint('arrival-clasp').clues).toHaveLength(2);
    expect(hint('bell-live').clues).toHaveLength(3);
    expect(hint('shed-code').clues).toHaveLength(4);
    expect(hint('arrival-case').clues).toHaveLength(5);
    expect(hint('ticket-check').clues).toHaveLength(5);
    expect(hint('shed-code').clues.slice(0, 2).join('')).not.toContain('4・7・0・6');
    expect(hint('drawer-code').clues.slice(0, 2).join('')).not.toContain('21時46分');
});
it('表示する最終暗証番号で実際の錠が開く', () => {
    const digits = (id: string) => hint(id).clues.at(-1)!.match(/「([0-9・]+)」/)![1].split('・').map(Number);
    expect(cargoUnlocks(digits('cargo-code'))).toBe(true);
    expect(shedUnlocks(digits('shed-code'))).toBe(true);
});
it('最終段階に書いたレバー位置で白沢へつながる', () => {
    const text = hint('route').clues.at(-1)!;
    const route = nodes.map(n => ['Ⅰ','Ⅱ','Ⅲ'].indexOf(text.match(new RegExp(pointNames[n] + '([ⅠⅡⅢ])'))![1]));
    expect(trace(route).end).toBe('O');
});
it('どちらの有効経路でも最終ヒントの切り込みで乗車券が成立する', () => {
    for (const route of [[0,1,0,1,1,1], [1,0,0,1,2,1]]) {
        const s = newState(); s.route = route;
        const text = ticketAnswer(s);
        const holes = [...text.matchAll(/([ⅠⅡⅢⅣⅤ])列：([^。]+)。切欠きから(近い|遠い)縁/g)].map(m => ({ column: ['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ'].indexOf(m[1]), node: nodes.find(n => pointNames[n] === m[2])!, side: m[3] === '近い' ? 'white' : 'black', tool: 1 })) as Hole[];
        expect(holes).toHaveLength(5);
        expect(validTicket(s, { id: 1, service: 2, back: false, holes, marks: [{ service: 2, back: false }] })).toBe(true);
    }
});
it('移動済みの荷物にも、現在位置から実行可能な手順を示す', () => {
    let checked = 0;
    for (let a = 0; a <= 3; a++) for (let b = 0; b <= 1; b++) for (let c = 0; c <= 1; c++) for (let d = 0; d <= 4; d++) {
        let state: Cargo = [a,b,c,d]; if (!validCargo(state)) continue;
        for (const move of cargoHintMoves(state)) { const next = moveCargo(state, move.index, move.direction); expect(next).not.toBeNull(); state = next!; }
        expect(stairsClear(state)).toBe(true); checked++;
    }
    expect(checked).toBeGreaterThan(1);
});
it('最終段階に書いた羽根・票・重りの配置が実判定を満たす', () => {
    const shutter = hint('signal-shutters').clues.at(-1)!;
    const positions = [...shutter.matchAll(/(\d)番目/g)].map(m => Number(m[1]) - 1) as [number,number];
    expect(illuminatedPorts({ mounts: [7,11], shutters: positions }, true)).toEqual([true,true]);
    const colors: Record<string,number> = { 青:2, 赤:0, 透明:3, 黒:1 };
    const order = [...hint('receipts-order').clues.at(-1)!.matchAll(/(青|赤|透明|黒)23:/g)].map(m => colors[m[1]]);
    expect(receiptTrayReleases(order)).toBe(true);
    const balance = hint('balance').clues.at(-1)!;
    const distances = [...balance.matchAll(/(\d)番目/g)].map(m => Number(m[1]));
    expect(balanceReleases(distances)).toBe(true);
});
it('すべての段階を作っても保存・配置・所持品を変更しない', () => {
    const s = newState(), before = structuredClone(s);
    for (const id of ['arrival-case','drawer-code','cargo-code','shed-code','receipts-order','balance','cargo-path','route','ticket-check','signal-shutters','signal-power','service']) hint(id, s);
    expect(s).toEqual(before);
});

it('録音紙を動かした後も、現在位置からの調整量が合う', () => {
    const s = newState(); s.values.tapeOffset = [8];
    expect(hint('cargo-code', s).clues[2]).toContain('左へ5目盛り');
    s.values.tapeOffset = [3]; expect(hint('cargo-code', s).clues[2]).toContain('今の位置で合っています');
});
it('写真の現在の一覧番号で並べ替え順を示す', () => {
    const s = newState(); s.values.photoOrder = [2,0,3,1];
    expect(hint('arrival-case', s).clues[3]).toContain('2→4→1→3');
    s.values.photoOrder = [0,1,2,3]; expect(hint('arrival-case', s).clues[3]).toContain('1→2→3→4');
});
