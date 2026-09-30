import { eventOrder } from './recordings';
import type { EventKind } from './recordings';
export type CargoDocket = {
    number: number;
    event: EventKind;
    route: 'circle' | 'triangle';
    handling: 'received' | 'through';
};
export const cargoDockets: CargoDocket[] = [
    { number: 8, event: 'bell', route: 'circle', handling: 'received' },
    { number: 3, event: 'bell', route: 'circle', handling: 'through' },
    { number: 4, event: 'stop', route: 'circle', handling: 'received' },
    { number: 9, event: 'door', route: 'triangle', handling: 'received' },
    { number: 6, event: 'door', route: 'circle', handling: 'received' },
    { number: 2, event: 'passing', route: 'circle', handling: 'received' },
];
export const cargoEventNames: Record<EventKind, string> = { gate: '閉鎖', door: '扉閉', passing: '通過', bell: 'ベル', stop: '停止' };
export function cargoCode(offset = 3) { return eventOrder(offset).map(event => cargoDockets.find(d => d.event === event && d.route === 'circle' && d.handling === 'received')!.number); }
export const validCargoDigits = (v: unknown): v is number[] => Array.isArray(v) && v.length === 4 && v.every(n => Number.isInteger(n) && n >= 0 && n <= 9);
export const cargoUnlocks = (v: number[]) => validCargoDigits(v) && v.every((n, i) => n === cargoCode()[i]);
