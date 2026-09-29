/** Metres along the platform, measured from its fixed baseline post. */
export const planks = [[6, 8], [10, 12]] as const;
export const mounts = [6, 7, 8, 9, 10, 11, 12, 13] as const;
export const doorHalfWidth = .5;
export const services = [
    { id: 1, direction: 'outbound', timing: 'passing', gap: 4 },
    { id: 2, direction: 'return', timing: 'after', gap: 4 },
    { id: 3, direction: 'return', timing: 'before', gap: 4 },
    { id: 4, direction: 'outbound', timing: 'after', gap: 4 },
    { id: 5, direction: 'return', timing: 'after', gap: 6 },
    { id: 6, direction: 'return', timing: 'before', gap: 6 },
] as const;
export interface SignalState {
    mounts: [
        number | null,
        number | null
    ];
    shutters: [
        number,
        number
    ];
}
export interface TrainState {
    progress?: number;
    service: number;
    position: 'absent' | 'approaching' | 'passing' | 'leaving' | 'stopped' | 'departed';
    /** Captured on arrival; moving the lamps cannot move a stopped carriage. */
    firstDoor: number | null;
}
export const freshSignals = (): SignalState => ({ mounts: [null, null], shutters: [0, 0] });
export const freshTrain = (): TrainState => ({ service: 0, position: 'absent', firstDoor: null });
/** Millimetres in the shutter housing; also used to draw the actual slots. */
export const lightPorts = [30, 70] as const;
export const shutterSlotCenters = (plate: number, step: number) => [10 - plate * 10 + step * 10, 50 - plate * 10 + step * 10];
export function illuminatedPorts(s: SignalState, hoodInstalled: boolean): boolean[] {
    return lightPorts.map(port => hoodInstalled && s.shutters.every((step, plate) => shutterSlotCenters(plate, step).some(slot => Math.abs(slot - port) <= 1)));
}
export function litCenters(s: SignalState, hoodInstalled: boolean): number[] {
    const light = illuminatedPorts(s, hoodInstalled);
    return s.mounts.flatMap((mark, i) => mark !== null && light[i] ? [mark] : []).sort((a, b) => a - b);
}
export function stopAt(service: number, signals: SignalState, hood: boolean, routeOpen: boolean): TrainState {
    const car = services.find(c => c.id === service), lights = litCenters(signals, hood);
    const stops = routeOpen && car?.direction === 'return' && car.timing === 'after' && lights.length === 2 && lights[1] - lights[0] === car.gap;
    return { service, position: stops ? 'stopped' : 'passing', firstDoor: stops ? lights[0] : null };
}
export function doorCenters(t: TrainState): number[] {
    const car = services.find(c => c.id === t.service);
    return car && t.firstDoor !== null ? [t.firstDoor, t.firstDoor + car.gap] : [];
}
export function supportedDoors(t: TrainState): boolean[] {
    return doorCenters(t).map(center => planks.some(([a, b]) => center - doorHalfWidth >= a && center + doorHalfWidth <= b));
}
export function boardingGeometry(t: TrainState, signals: SignalState, hood: boolean): boolean {
    const doors = doorCenters(t), lights = litCenters(signals, hood);
    return t.position === 'stopped' && doors.length === 2 && supportedDoors(t).every(Boolean) && lights.length === 2 && doors.every((center, i) => center === lights[i]);
}
export function validSignals(v: unknown): v is SignalState {
    if (!v || typeof v !== 'object')
        return false;
    const s = v as SignalState;
    return Array.isArray(s.mounts) && s.mounts.length === 2 && s.mounts.every(n => n === null || mounts.some(m => m === n)) && (s.mounts[0] === null || s.mounts[1] === null || s.mounts[0] !== s.mounts[1]) && Array.isArray(s.shutters) && s.shutters.length === 2 && s.shutters.every(n => Number.isInteger(n) && n >= 0 && n <= 4);
}
export function validTrain(v: unknown): v is TrainState {
    if (!v || typeof v !== 'object')
        return false;
    const t = v as TrainState;
    if (!Number.isInteger(t.service) || t.service < 0 || t.service > 6 || !['absent', 'approaching', 'passing', 'leaving', 'stopped', 'departed'].includes(t.position))
        return false;
    if (t.progress !== undefined && (!Number.isFinite(t.progress) || t.progress < 0 || t.progress >= 1))
        return false;
    if (t.position === 'stopped' || t.position === 'leaving' || t.position === 'departed')
        return (t.service === 2 || t.service === 5) && typeof t.firstDoor === 'number' && mounts.some(n => n === t.firstDoor) && mounts.some(n => n === (t.firstDoor! + (t.service === 5 ? 6 : 4)));
    return t.firstDoor === null && (t.position === 'absent' || t.service > 0);
}
