import { sameOpening } from './ticketGeometry';
import { arrivalCaseSides } from './arrivalPhotos';
import { duration as tapeDuration } from './recordings';
export type Room = 'train' | 'platform' | 'waiting' | 'forecourt' | 'office' | 'lost' | 'bridge' | 'cargo' | 'lamp' | 'tunnel' | 'north' | 'return';
export type Item = 'counterRecords' | 'photos' | 'receipt' | 'envelope' | 'ownTicket' | 'officeKey' | 'knob' | 'hook' | 'pin' | 'support' | 'lamp' | 'punch' | 'paper' | 'fragments' | 'hood' | 'ticket';
export type Place = 'counter' | 'cashDrawer' | 'case' | 'bag' | 'handle' | 'seat' | 'floor' | 'inventory' | 'recorder' | 'lightStand' | 'signal' | 'reader';
export type Node = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Side = 'white' | 'black';
export type Hole = {
    column: number;
    node: Node;
    side: Side;
};
export interface Ticket {
    stamps?: number[];
    marks?: {
        service: number;
        back: boolean;
    }[];
    id: number;
    holes: Hole[];
    service: number;
    back: boolean;
}
export interface State {
    version: 2;
    started: boolean;
    room: Room;
    camera: number;
    visited: string[];
    locations: Partial<Record<Item, Place>>;
    bag: {
        strap: number;
        clasp: boolean;
        mouth: boolean;
    };
    seats: number[];
    window: {
        supported: boolean;
        latch: boolean;
        open: boolean;
    };
    values: Record<string, number[]>;
    flags: string[];
    notes: {
        id: string;
        values: number[];
        at: number;
    }[];
    route: number[];
    draft: Ticket;
    mounted: Ticket | null;
    savedTickets: Ticket[];
    train: {
        service: number;
        position: 'absent' | 'passing' | 'stopped' | 'departed';
    };
    elapsed: number;
    sound: boolean;
    ended: boolean;
}
export const newState = (): State => ({ version: 2, started: false, room: 'train', camera: 0, visited: ['train:0'], locations: { counterRecords: 'counter', knob: 'cashDrawer', photos: 'bag', receipt: 'handle', envelope: 'seat', ownTicket: 'floor' }, bag: { strap: 0, clasp: false, mouth: false }, seats: [0, 0, 0], window: { supported: false, latch: false, open: false }, values: {}, flags: [], notes: [], route: [0, 0, 0, 0, 0, 0], draft: { id: 1, holes: [], service: 0, back: false }, mounted: null, savedTickets: [], train: { service: 0, position: 'absent' }, elapsed: 0, sound: false, ended: false });
export const cameraCounts: Record<Room, number> = { train: 3, platform: 3, waiting: 3, forecourt: 2, office: 2, lost: 2, bridge: 3, cargo: 3, lamp: 2, tunnel: 2, north: 3, return: 2 };
export const owns = (s: State, item: Item) => s.locations[item] === 'inventory';
export const done = (s: State, id: string) => s.flags.includes(id);
const append = <T,>(a: T[], v: T) => a.includes(v) ? a : [...a, v];
export const connections: Record<Node, [
    string,
    string
][]> = { A: [['S', 'B'], ['S', 'C']], B: [['A', 'D'], ['A', 'E']], C: [['A', 'E'], ['A', 'X']], D: [['O', 'B'], ['O', 'F']], E: [['B', 'C'], ['B', 'F'], ['C', 'F']], F: [['E', 'R'], ['E', 'D']] };
export const nodes: Node[] = ['A', 'B', 'C', 'D', 'E', 'F'];
export const entrySide: Record<string, Side> = { 'S>A': 'white', 'B>A': 'black', 'C>A': 'black', 'A>B': 'white', 'D>B': 'black', 'E>B': 'black', 'A>C': 'black', 'E>C': 'white', 'X>C': 'white', 'O>D': 'white', 'B>D': 'white', 'F>D': 'black', 'B>E': 'black', 'C>E': 'white', 'F>E': 'white', 'E>F': 'white', 'R>F': 'black', 'D>F': 'black' };
export function trace(route: number[], current = true, start: 'S' | 'R' = 'S') {
    const path: string[] = [start], seen = new Set<string>();
    let previous: string = start, at = start === 'S' ? 'A' : 'F';
    while (nodes.includes(at as Node)) {
        const key = previous + '>' + at;
        if (seen.has(key))
            return { path: [...path, at], end: 'loop' };
        seen.add(key);
        path.push(at);
        const pair = connections[at as Node][route[nodes.indexOf(at as Node)] ?? 0];
        if (!pair?.includes(previous))
            return { path, end: 'disconnected' };
        const next = pair.find(n => n !== previous)!;
        if (current && (at === 'B' && next === 'D' || at === 'D' && next === 'B'))
            return { path: [...path, next], end: 'occupied' };
        previous = at;
        at = next;
    }
    return { path: [...path, at], end: at };
}
export const expectedHoles = (route: number[]): Hole[] => trace(route).path.filter(n => nodes.includes(n as Node)).map((node, column, all) => ({ column, node: node as Node, side: entrySide[(column ? all[column - 1] : 'S') + '>' + node] }));
export function validTicket(s: State, t: Ticket | null) {
    if (!t || trace(s.route).end !== 'O' || t.service !== 2 || t.stamps?.some(n => n !== 2) || t.marks?.some(m => m.service !== 2))
        return false;
    const expected = expectedHoles(s.route);
    return t.holes.every(h => expected.some(e => e.column === h.column && e.side === h.side)) && expected.every(e => sameOpening(t.holes.filter(h => h.column === e.column && h.side === e.side).map(h => h.node), e.node));
}
export type Action = {
    type: 'start';
} | {
    type: 'look';
    camera: number;
} | {
    type: 'move';
    room: Room;
    camera?: number;
} | {
    type: 'bagStrap';
    position: number;
} | {
    type: 'windowLift';
} | {
    type: 'windowBolt';
} | {
    type: 'windowOpen';
} | {
    type: 'counterDrawer';
} | {
    type: 'caseDoor';
} | {
    type: 'bagClasp';
} | {
    type: 'bagMouth';
} | {
    type: 'take';
    item: Item;
} | {
    type: 'put';
    item: Item;
    place: Place;
} | {
    type: 'seat';
    index: number;
} | {
    type: 'heard';
    tape: 'A' | 'B';
    seconds: number;
} | {
    type: 'values';
    id: string;
    values: number[];
} | {
    type: 'flag';
    id: string;
} | {
    type: 'record';
    id: string;
    values?: number[];
} | {
    type: 'route';
    index: number;
    value: number;
} | {
    type: 'punch';
    hole: Hole;
} | {
    type: 'flipTicket';
} | {
    type: 'ticketService';
    service: number;
} | {
    type: 'newTicket';
} | {
    type: 'readerClamp';
} | {
    type: 'mountTicket';
} | {
    type: 'removeTicket';
} | {
    type: 'call';
    service: number;
} | {
    type: 'board';
} | {
    type: 'end';
} | {
    type: 'sound';
} | {
    type: 'tick';
    seconds: number;
};
export function reduce(s: State, a: Action): State {
    switch (a.type) {
        case 'start': return { ...s, started: true };
        case 'look': {
            const camera = (a.camera + cameraCounts[s.room]) % cameraCounts[s.room];
            return { ...s, camera, visited: append(s.visited, s.room + ':' + camera) };
        }
        case 'move': {
            const camera = a.camera ?? 0;
            return { ...s, room: a.room, camera, visited: append(s.visited, a.room + ':' + camera) };
        }
        case 'bagStrap': return s.bag.mouth ? s : { ...s, bag: { ...s.bag, strap: Math.max(0, Math.min(1, a.position)) } };
        case 'windowLift': return s.window.open ? s : { ...s, window: { ...s.window, supported: !s.window.supported } };
        case 'windowBolt': return s.window.open || !s.window.supported && !s.window.latch ? s : { ...s, window: { ...s.window, latch: !s.window.latch } };
        case 'windowOpen': return !s.window.open && !s.window.latch ? s : { ...s, window: { ...s.window, open: !s.window.open, supported: !s.window.open } };
        case 'counterDrawer': {
            const open = s.values.drawerOpen?.[0] === 1;
            const v = s.values.drawerDigits ?? [0, 0, 0, 0];
            return !open && (v.length !== 4 || !v.every((n, i) => n === [2, 1, 4, 6][i])) ? s : { ...s, values: { ...s.values, drawerOpen: [open ? 0 : 1] } };
        }
        case 'caseDoor': {
            const open = s.values.caseOpen?.[0] === 1;
            const wheels = s.values.caseWheels ?? [0, 0, 0, 0];
            if (!open && (wheels.length !== 4 || !wheels.every((v, i) => v === arrivalCaseSides[i])))
                return s;
            return { ...s, values: { ...s.values, caseOpen: [open ? 0 : 1] }, locations: { ...s.locations, officeKey: s.locations.officeKey ?? 'case' } };
        }
        case 'bagClasp': return s.bag.mouth ? s : { ...s, bag: { ...s.bag, clasp: !s.bag.clasp } };
        case 'bagMouth': return !s.bag.mouth && (!s.bag.clasp || s.bag.strap < .8) ? s : { ...s, bag: { ...s.bag, mouth: !s.bag.mouth } };
        case 'take': {
            const at = s.locations[a.item];
            if (!at || at === 'counter' && !s.window.open || at === 'cashDrawer' && s.values.drawerOpen?.[0] !== 1 || at === 'inventory' || at === 'case' && s.values.caseOpen?.[0] !== 1 || at === 'bag' && !s.bag.mouth || at === 'seat' && s.seats[2] !== 1)
                return s;
            return { ...s, locations: { ...s.locations, [a.item]: 'inventory' } };
        }
        case 'put': return !s.locations[a.item] ? s : { ...s, locations: { ...s.locations, [a.item]: a.place } };
        case 'seat': return { ...s, seats: s.seats.map((v, i) => i === a.index ? 1 - v : v) };
        case 'heard': {
            if (!Number.isFinite(a.seconds))
                return s;
            const id = 'heard' + a.tape;
            const seconds = Math.max(s.values[id]?.[0] ?? 0, Math.min(tapeDuration, Math.max(0, a.seconds)));
            return { ...s, values: { ...s.values, [id]: [seconds] } };
        }
        case 'values': return { ...s, values: { ...s.values, [a.id]: a.values } };
        case 'flag': return { ...s, flags: append(s.flags, a.id) };
        case 'record': return { ...s, notes: [...s.notes.filter(n => n.id !== a.id), { id: a.id, values: [...(a.values ?? s.values[a.id] ?? [])], at: s.elapsed }] };
        case 'route': return s.room === 'return' || !nodes[a.index] || !connections[nodes[a.index]][a.value] ? s : { ...s, route: s.route.map((v, i) => i === a.index ? a.value : v) };
        case 'punch': return !owns(s, 'punch') || !owns(s, 'paper') || !Number.isInteger(a.hole.column) || a.hole.column < 0 || a.hole.column > 4 || !nodes.includes(a.hole.node) || !['white', 'black'].includes(a.hole.side) || s.draft.holes.some(h => h.column === a.hole.column && h.side === a.hole.side && h.node === a.hole.node) ? s : { ...s, draft: { ...s.draft, holes: [...s.draft.holes, a.hole] } };
        case 'flipTicket': return { ...s, draft: { ...s.draft, back: !s.draft.back } };
        case 'ticketService': {
            if (!Number.isInteger(a.service) || a.service < 1 || a.service > 6)
                return s;
            const marks = s.draft.marks ?? (s.draft.stamps ?? (s.draft.service ? [s.draft.service] : [])).map(service => ({ service, back: false }));
            const mark = { service: a.service, back: s.draft.back };
            return { ...s, draft: { ...s.draft, service: a.service, stamps: undefined, marks: marks.some(m => m.service === mark.service && m.back === mark.back) ? marks : [...marks, mark] } };
        }
        case 'newTicket': return !owns(s, 'paper') ? s : { ...s, savedTickets: (s.draft.holes.length || s.draft.service > 0) ? [...s.savedTickets.slice(-7), s.draft] : s.savedTickets, draft: { id: Math.max(s.draft.id, s.mounted?.id ?? 0, ...s.savedTickets.map(t => t.id)) + 1, holes: [], service: 0, back: false } };
        case 'readerClamp': return (s.values.readerDepth?.[0] ?? 0) > 0 && (s.values.readerDepth?.[0] ?? 0) < 1 ? s : { ...s, values: { ...s.values, readerClamp: [s.values.readerClamp?.[0] === 1 ? 0 : 1] } };
        case 'mountTicket': return s.mounted || !owns(s, 'paper') || s.draft.back || s.values.readerClamp?.[0] !== 1 || s.values.readerDepth?.[0] !== .65 ? s : { ...s, values: { ...s.values, readerDepth: [1] }, mounted: structuredClone(s.draft), draft: { id: s.draft.id + 1, holes: [], service: 0, back: false } };
        case 'removeTicket': return !s.mounted || s.values.readerClamp?.[0] !== 1 ? s : { ...s, values: { ...s.values, readerDepth: [0] }, draft: s.mounted, mounted: null, savedTickets: (s.draft.holes.length || s.draft.service > 0) ? [...s.savedTickets.slice(-7), s.draft] : s.savedTickets };
        case 'call': return { ...s, train: { service: a.service, position: trace(s.route).end === 'O' && a.service === 2 && done(s, 'signal') ? 'stopped' : 'passing' } };
        case 'board': return !validTicket(s, s.mounted) || s.values.readerClamp?.[0] !== 0 || s.train.position !== 'stopped' || !done(s, 'footing') ? s : { ...s, room: 'return', camera: 0, train: { ...s.train, position: 'departed' } };
        case 'end': return s.room === 'return' ? { ...s, ended: true } : s;
        case 'sound': return { ...s, sound: !s.sound };
        case 'tick': return { ...s, elapsed: s.elapsed + a.seconds };
    }
}
export function restore(value: unknown): State | null {
    if (!value || typeof value !== 'object')
        return null;
    const s = value as State;
    if (s.version !== 2 || !Object.hasOwn(cameraCounts, s.room) || !Number.isInteger(s.camera) || s.camera < 0 || s.camera >= cameraCounts[s.room] || typeof s.started !== 'boolean' || !s.locations || !s.bag || !Array.isArray(s.seats) || s.seats.length !== 3 || !s.seats.every(n => n === 0 || n === 1) || !Array.isArray(s.flags) || !Array.isArray(s.visited) || !s.values || !Array.isArray(s.notes) || !Number.isFinite(s.elapsed) || s.elapsed < 0 || !Array.isArray(s.route) || s.route.length !== 6 || !s.route.every((n, i) => Number.isInteger(n) && n >= 0 && n < connections[nodes[i]].length))
        return null;
    if (!Number.isFinite(s.bag.strap) || s.bag.strap < 0 || s.bag.strap > 1 || typeof s.bag.clasp !== 'boolean' || typeof s.bag.mouth !== 'boolean')
        return null;
    const ticket = (t: Ticket) => t && Number.isInteger(t.id) && t.id > 0 && Array.isArray(t.holes) && t.holes.length <= 60 && [0, 1, 2, 3, 4, 5, 6].includes(t.service) && typeof t.back === 'boolean' && (t.marks === undefined || Array.isArray(t.marks) && t.marks.length <= 12 && t.marks.every(m => m && Number.isInteger(m.service) && m.service >= 1 && m.service <= 6 && typeof m.back === 'boolean')) && (t.stamps === undefined || Array.isArray(t.stamps) && t.stamps.length <= 6 && t.stamps.every(n => Number.isInteger(n) && n >= 1 && n <= 6)) && t.holes.every(h => Number.isInteger(h.column) && h.column >= 0 && h.column < 5 && nodes.includes(h.node) && ['white', 'black'].includes(h.side));
    if (!ticket(s.draft) || s.mounted && !ticket(s.mounted) || !Array.isArray(s.savedTickets) || s.savedTickets.length > 8 || !s.savedTickets.every(ticket))
        return null;
    const numeric = (v: unknown): v is number[] => Array.isArray(v) && v.length <= 100 && v.every(n => typeof n === 'number' && Number.isFinite(n));
    if (!Object.values(s.values).every(numeric))
        return null;
    const order = (v: number[]) => v.length === 4 && new Set(v).size === 4 && v.every(n => Number.isInteger(n) && n >= 0 && n < 4);
    if (s.values.photoOrder && !order(s.values.photoOrder))
        return null;
    if (s.values.caseWheels && (s.values.caseWheels.length !== 4 || !s.values.caseWheels.every(n => Number.isInteger(n) && n >= 0 && n < 4)))
        return null;
    if (!s.notes.every(n => n && typeof n.id === 'string' && numeric(n.values) && (n.id !== 'arrivalPhotos' || order(n.values))))
        return null;
    return { ...s, locations: { counterRecords: 'counter', knob: 'cashDrawer', ...s.locations } };
}
