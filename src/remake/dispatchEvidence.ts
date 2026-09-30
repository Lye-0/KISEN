import { services } from './stopping';
import type { TrainState } from './stopping';
export const dispatchRows = services.map(s => ({ service: s.id, car: s.gap === 4 ? 0 : 1, bell: s.timing === 'before' ? .7 : .3, stop: s.timing === 'passing' ? null : s.timing === 'before' ? .3 : .7 }));
export const directionRows = services.map(s => ({ service: s.id, toward: s.direction === 'return' ? '白沢' : '山上' }));
export const carRecords = [
    { code: 'イ', gap: 4, body: '/assets/remake/dispatch/car-short.webp', window: '/assets/remake/dispatch/window-short.webp', windowSize: [1620, 971] as [
            number,
            number
        ] },
    { code: 'ロ', gap: 6, body: '/assets/remake/dispatch/car-long.webp', window: '/assets/remake/dispatch/window-long.webp', windowSize: [1671, 941] as [
            number,
            number
        ] }
] as const;
export const validDispatchRecord = (v: number[]) => v.length === 4 && Number.isInteger(v[0]) && v[0] >= 0 && v[0] <= 2 && v.slice(1).every(n => n === 0 || n === 1);
export const travelDirection = (service: number) => services.find(s => s.id === service)?.direction === 'return' ? -1 : 1;
export function firstDoorAt(t: TrainState, target: number) { const p = t.progress ?? 0, d = travelDirection(t.service); return t.position === 'stopped' ? t.firstDoor! : t.position === 'approaching' ? target - d * 28 * (1 - p) ** 2 : (t.position === 'leaving' ? t.firstDoor! : target) + d * 28 * p; }
