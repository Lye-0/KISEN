import { cargoUnlocks, validCargoDigits } from './cargoDockets';
import { sameOpening } from './ticketGeometry';
import { cargoInitial, moveCargo, stairsClear, validCargo } from './cargo';
import type { Cargo } from './cargo';
import { arrivalCaseSides } from './arrivalPhotos';
import { duration as tapeDuration } from './recordings';
import { freshSignals, freshTrain, mounts, stopAt, boardingGeometry, validSignals, validTrain } from './stopping';
import type { SignalState, TrainState } from './stopping';
export type Room = 'train' | 'platform' | 'waiting' | 'forecourt' | 'office' | 'lost' | 'bridge' | 'cargo' | 'passage' | 'lamp' | 'tunnel' | 'north' | 'return';
export type Item = 'cargoDocket' | 'spareLamp' | 'counterRecords' | 'photos' | 'receipt' | 'envelope' | 'ownTicket' | 'officeKey' | 'knob' | 'hook' | 'pin' | 'support' | 'lamp' | 'punch' | 'paper' | 'fragments' | 'hood' | 'ticket';
export type Place = 'cargoChest' | 'bridgeGate' | 'toolRack' | 'railTag' | 'toolBench' | 'counter' | 'cashDrawer' | 'case' | 'bag' | 'handle' | 'seat' | 'floor' | 'inventory' | 'recorder' | 'lightStand' | 'signal' | 'reader';
export type Node = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type Side = 'white' | 'black';
export type Hole = {
    tool?: number;
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
    signals: SignalState;
    train: TrainState;
    elapsed: number;
    sound: boolean;
    ended: boolean;
}
export const newState = (): State => ({ version: 2, started: false, room: 'train', camera: 0, visited: ['train:0'], locations: { spareLamp: 'cargoChest', cargoDocket: 'cargoChest', support: 'bridgeGate', hook: 'toolRack', pin: 'railTag', punch: 'toolBench', paper: 'toolBench', counterRecords: 'counter', knob: 'cashDrawer', photos: 'bag', receipt: 'handle', envelope: 'seat', ownTicket: 'floor' }, bag: { strap: 0, clasp: false, mouth: false }, seats: [0, 0, 0], window: { supported: false, latch: false, open: false }, values: { passageRevision: [1] }, flags: [], notes: [], route: [0, 0, 0, 0, 0, 0], draft: { id: 1, holes: [], service: 0, back: false }, mounted: null, savedTickets: [], signals: freshSignals(), train: freshTrain(), elapsed: 0, sound: false, ended: false });
export const cameraCounts: Record<Room, number> = { train: 3, platform: 3, waiting: 3, forecourt: 2, office: 2, lost: 2, bridge: 3, cargo: 3, passage: 4, lamp: 2, tunnel: 2, north: 4, return: 2 };
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
    return t.holes.every(h => expected.some(e => e.column === h.column && e.side === h.side)) && expected.every(e => sameOpening(t.holes.filter(h => h.column === e.column && h.side === e.side), e.node));
}
export type Action = {
    type: 'cargoChest';
} | {
    type: 'cargoMove';
    index: number;
    direction: number;
} | {
    type: 'stairDoor';
} | {
    type: 'northHatch';
} | {
    type: 'gateInstallSupport';
} | {
    type: 'rackRing';
} | {
    type: 'tagInsert';
} | {
    type: 'tagExtend';
} | {
    type: 'tagTurn';
} | {
    type: 'tagWithdraw';
} | {
    type: 'gateSupport';
} | {
    type: 'gateRod';
} | {
    type: 'gateDoor';
} | {
    type: 'trainAdvance';
    seconds: number;
} | {
    type: 'signalMount';
    lamp: 0 | 1;
    mark: number | null;
} | {
    type: 'signalHood';
} | {
    type: 'shutter';
    plate: 0 | 1;
    step: number;
} | {
    type: 'trainArrive';
} | {
    type: 'releaseTrain';
} | {
    type: 'toolCut';
    tool: number;
    die: number;
    slot: number;
} | {
    type: 'toolTake';
    tool: number;
} | {
    type: 'toolReturn';
} | {
    type: 'newTrialPaper';
} | {
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
    if (s.room === 'return' && !['look', 'end', 'sound', 'tick', 'record'].includes(a.type))
        return s;
    switch (a.type) {
        case 'cargoChest': {
            if (s.room !== 'cargo')
                return s;
            const open = s.values.cargoOpen?.[0] === 1;
            return !open && !cargoUnlocks(s.values.cargoDigits ?? [0, 0, 0, 0]) ? s : { ...s, values: { ...s.values, cargoOpen: [open ? 0 : 1] } };
        }
        case 'cargoMove': {
            if (s.room !== 'cargo' || a.index === 1 && s.values.cargoOpen?.[0] === 1)
                return s;
            const next = moveCargo((s.values.cargo ?? cargoInitial) as Cargo, a.index, a.direction);
            return next ? { ...s, values: { ...s.values, cargo: next } } : s;
        }
        case 'stairDoor': return s.room !== 'cargo' || !stairsClear((s.values.cargo ?? cargoInitial) as Cargo) ? s : { ...s, values: { ...s.values, stairDoor: [s.values.stairDoor?.[0] === 1 ? 0 : 1] } };
        case 'northHatch': return (s.room !== 'passage' || s.camera !== 2) && (s.room !== 'north' || s.values.northHatch?.[0] !== 1) ? s : { ...s, values: { ...s.values, northHatch: [s.values.northHatch?.[0] === 1 ? 0 : 1] } };
        case 'rackRing': return s.room !== 'office' || s.camera !== 1 || s.locations.hook !== 'toolRack' ? s : { ...s, values: { ...s.values, rackRing: [s.values.rackRing?.[0] === 1 ? 0 : 1] } };
        case 'tagInsert': return s.room !== 'bridge' || s.camera !== 1 || !owns(s, 'hook') || s.locations.pin !== 'railTag' || s.values.tagDepth?.[0] ? s : { ...s, values: { ...s.values, tagDepth: [1] } };
        case 'tagExtend': return s.room !== 'bridge' || s.camera !== 1 || s.values.tagDepth?.[0] !== 1 ? s : { ...s, values: { ...s.values, tagDepth: [2] } };
        case 'tagTurn': return s.room !== 'bridge' || s.camera !== 1 || s.values.tagDepth?.[0] !== 2 ? s : { ...s, values: { ...s.values, tagCaught: [s.values.tagCaught?.[0] === 1 ? 0 : 1] } };
        case 'tagWithdraw': return s.room !== 'bridge' || s.camera !== 1 || s.values.tagDepth?.[0] !== 2 ? s : s.values.tagCaught?.[0] === 1 ? { ...s, locations: { ...s.locations, pin: 'inventory' }, values: { ...s.values, tagDepth: [0], tagCaught: [0] } } : { ...s, values: { ...s.values, tagDepth: [0] } };
        case 'gateSupport': {
            if (s.room !== 'bridge' || s.camera !== 2 || s.locations.support !== 'bridgeGate' || s.values.gateRod?.[0] === 1 || s.values.gateOpen?.[0] === 1)
                return s;
            return { ...s, values: { ...s.values, gateSupport: [s.values.gateSupport?.[0] === 1 ? 0 : 1] } };
        }
        case 'gateRod': {
            if (s.room !== 'bridge' || s.camera !== 2 || s.values.gateSupport?.[0] !== 1 || s.values.gateOpen?.[0] === 1 || s.values.gateRod?.[0] !== 1 && !owns(s, 'pin'))
                return s;
            return { ...s, values: { ...s.values, gateRod: [s.values.gateRod?.[0] === 1 ? 0 : 1] } };
        }
        case 'gateDoor': {
            if (s.room !== 'bridge' || s.camera !== 2 || s.values.gateOpen?.[0] !== 1 && s.values.gateRod?.[0] !== 1)
                return s;
            return { ...s, values: { ...s.values, gateOpen: [s.values.gateOpen?.[0] === 1 ? 0 : 1] } };
        }
        case 'gateInstallSupport': return s.room !== 'bridge' || s.camera !== 2 || s.values.gateOpen?.[0] === 1 || !owns(s, 'support') ? s : { ...s, locations: { ...s.locations, support: 'bridgeGate' }, values: { ...s.values, gateSupport: [0] } };
        case 'trainAdvance': {
            if (!['approaching', 'passing', 'leaving'].includes(s.train.position) || !Number.isFinite(a.seconds) || a.seconds <= 0)
                return s;
            const progress = (s.train.progress ?? 0) + Math.min(a.seconds, 1) / (s.train.position === 'approaching' ? 4 : 3);
            return progress < 1 ? { ...s, train: { ...s.train, progress } } : { ...s, train: s.train.position === 'approaching' ? stopAt(s.train.service, s.signals, s.locations.hood === 'signal', trace(s.route).end === 'O') : freshTrain() };
        }
        case 'signalMount': {
            if (s.room !== 'north' || ![0, 1].includes(a.lamp) || a.mark !== null && (!mounts.some(m => m === a.mark) || s.signals.mounts[1 - a.lamp] === a.mark))
                return s;
            const item = a.lamp === 0 ? 'lamp' : 'spareLamp';
            if (!owns(s, item) && s.locations[item] !== 'signal')
                return s;
            const positions = [...s.signals.mounts] as SignalState['mounts'];
            positions[a.lamp] = a.mark;
            return { ...s, signals: { ...s.signals, mounts: positions }, locations: { ...s.locations, [item]: a.mark === null ? 'inventory' : 'signal' } };
        }
        case 'signalHood': return s.room !== 'north' || !owns(s, 'hood') && s.locations.hood !== 'signal' ? s : { ...s, locations: { ...s.locations, hood: s.locations.hood === 'signal' ? 'inventory' : 'signal' } };
        case 'shutter': return s.room !== 'north' || s.locations.hood !== 'signal' || ![0, 1].includes(a.plate) || !Number.isInteger(a.step) || a.step < 0 || a.step > 4 ? s : { ...s, signals: { ...s.signals, shutters: s.signals.shutters.map((v, i) => i === a.plate ? a.step : v) as [
                    number,
                    number
                ] } };
        case 'trainArrive': return s.train.position !== 'approaching' ? s : { ...s, train: stopAt(s.train.service, s.signals, s.locations.hood === 'signal', trace(s.route).end === 'O') };
        case 'releaseTrain': return s.train.position !== 'stopped' || s.room !== 'north' ? s : { ...s, train: { ...s.train, position: 'leaving', progress: 0 } };
        case 'toolTake': return s.room !== 'office' || owns(s, 'punch') || ![0, 1, 2].includes(a.tool) ? s : { ...s, locations: { ...s.locations, punch: 'inventory' }, values: { ...s.values, punchTool: [a.tool] } };
        case 'toolReturn': return s.room !== 'office' || !owns(s, 'punch') ? s : { ...s, locations: { ...s.locations, punch: 'toolBench' } };
        case 'toolCut': {
            if (s.room !== 'office' || ![0, 1, 2].includes(a.tool) || !Number.isInteger(a.die) || a.die < 0 || a.die > 5 || !Number.isInteger(a.slot) || a.slot < 0 || a.slot > 11)
                return s;
            const cuts = s.values.toolCuts ?? [];
            if (cuts.length >= 648 || cuts.some((n, i) => i % 3 === 0 && n === a.tool && cuts[i + 1] === a.die && cuts[i + 2] === a.slot))
                return s;
            return { ...s, values: { ...s.values, toolCuts: [...cuts, a.tool, a.die, a.slot] } };
        }
        case 'newTrialPaper': {
            const cuts = s.values.toolCuts ?? [], page = s.values.toolPage?.[0] ?? 0;
            if (!cuts.length)
                return s;
            return { ...s, values: { ...s.values, toolCuts: [], toolPage: [page + 1] }, notes: [...s.notes.filter(n => n.id !== 'toolTrial' || n.values.length !== cuts.length || n.values.some((v, i) => v !== cuts[i])), { id: 'toolTrial-' + page, values: [...cuts], at: s.elapsed }] };
        }
        case 'start': return { ...s, started: true };
        case 'look': {
            const camera = (a.camera + cameraCounts[s.room]) % cameraCounts[s.room];
            if (s.room === 'passage' && !([[1], [0, 2], [3], [0, 2]][s.camera]).includes(camera))
                return s;
            return { ...s, camera, visited: append(s.visited, s.room + ':' + camera) };
        }
        case 'move': {
            if ((s.room === 'bridge' && a.room === 'north' || s.room === 'north' && a.room === 'bridge') && s.values.gateOpen?.[0] !== 1)
                return s;
            if ((s.room === 'cargo' && a.room === 'passage' || s.room === 'passage' && a.room === 'cargo') && s.values.stairDoor?.[0] !== 1 || (s.room === 'north' && a.room === 'passage' || s.room === 'passage' && a.room === 'north') && s.values.northHatch?.[0] !== 1)
                return s;
            if (s.room === 'passage' && (a.room === 'north' && s.camera !== 2 || a.room === 'cargo' && ![0, 3].includes(s.camera)))
                return s;
            const camera = a.camera ?? 0;
            return { ...s, room: a.room, camera, values: { ...s.values, passageRevision: [1] }, visited: append(s.visited, a.room + ':' + camera) };
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
            if (at === 'cargoChest' && (s.room !== 'cargo' || s.values.cargoOpen?.[0] !== 1))
                return s;
            if (a.item === 'support' && at === 'bridgeGate')
                return s.room !== 'bridge' || s.camera !== 2 || s.values.gateOpen?.[0] !== 1 ? s : { ...s, locations: { ...s.locations, support: 'inventory' }, values: { ...s.values, gateSupport: [0], gateRod: [0] } };
            if (a.item === 'hook' && (at !== 'toolRack' || s.room !== 'office' || s.camera !== 1 || s.values.rackRing?.[0] !== 1))
                return s;
            if (a.item === 'pin' && at === 'railTag')
                return s;
            if (a.item === 'ownTicket' && at === 'floor' && s.room !== 'train')
                return s;
            if (at === 'signal')
                return s;
            if (a.item === 'punch' && at === 'toolBench' || a.item === 'paper' && at === 'toolBench' && s.room !== 'office')
                return s;
            if (!at || at === 'counter' && !s.window.open || at === 'cashDrawer' && s.values.drawerOpen?.[0] !== 1 || at === 'inventory' || at === 'case' && s.values.caseOpen?.[0] !== 1 || at === 'bag' && !s.bag.mouth || at === 'seat' && s.seats[2] !== 1)
                return s;
            return { ...s, locations: { ...s.locations, [a.item]: 'inventory' } };
        }
        case 'put': return !s.locations[a.item] || ['signal', 'toolRack', 'railTag', 'bridgeGate'].includes(a.place) || ['signal', 'toolRack', 'railTag', 'bridgeGate'].includes(s.locations[a.item]!) ? s : { ...s, locations: { ...s.locations, [a.item]: a.place } };
        case 'seat': return { ...s, seats: s.seats.map((v, i) => i === a.index ? 1 - v : v) };
        case 'heard': {
            if (!Number.isFinite(a.seconds))
                return s;
            const id = 'heard' + a.tape;
            const seconds = Math.max(s.values[id]?.[0] ?? 0, Math.min(tapeDuration, Math.max(0, a.seconds)));
            return { ...s, values: { ...s.values, [id]: [seconds] } };
        }
        case 'values': return a.id === 'cargoDigits' && !validCargoDigits(a.values) || ['cargoOpen', 'gateSupport', 'gateRod', 'gateOpen', 'rackRing', 'tagDepth', 'tagCaught'].includes(a.id) ? s : { ...s, values: { ...s.values, [a.id]: a.values } };
        case 'flag': return { ...s, flags: append(s.flags, a.id) };
        case 'record': return { ...s, notes: [...s.notes.filter(n => n.id !== a.id), { id: a.id, values: [...(a.values ?? s.values[a.id] ?? [])], at: s.elapsed }] };
        case 'route': return !nodes[a.index] || !connections[nodes[a.index]][a.value] || ['approaching', 'passing', 'leaving', 'stopped'].includes(s.train.position) && trace(s.route).path.includes(nodes[a.index]) ? s : { ...s, route: s.route.map((v, i) => i === a.index ? a.value : v) };
        case 'punch': return !owns(s, 'punch') || !owns(s, 'paper') || !Number.isInteger(a.hole.column) || a.hole.column < 0 || a.hole.column > 4 || !nodes.includes(a.hole.node) || !['white', 'black'].includes(a.hole.side) || s.draft.holes.some(h => h.column === a.hole.column && h.side === a.hole.side && h.node === a.hole.node && (h.tool ?? 1) === (s.values.punchTool?.[0] ?? 1)) ? s : { ...s, draft: { ...s.draft, holes: [...s.draft.holes, { ...a.hole, tool: s.values.punchTool?.[0] ?? 1 }] } };
        case 'flipTicket': return { ...s, draft: { ...s.draft, back: !s.draft.back } };
        case 'ticketService': {
            if (!Number.isInteger(a.service) || a.service < 1 || a.service > 6)
                return s;
            const marks = s.draft.marks ?? (s.draft.stamps ?? (s.draft.service ? [s.draft.service] : [])).map(service => ({ service, back: false }));
            const mark = { service: a.service, back: s.draft.back };
            return { ...s, draft: { ...s.draft, service: a.service, stamps: undefined, marks: marks.some(m => m.service === mark.service && m.back === mark.back) ? marks : [...marks, mark] } };
        }
        case 'newTicket': return !owns(s, 'paper') ? s : { ...s, savedTickets: (s.draft.holes.length || s.draft.service > 0) ? [...s.savedTickets, s.draft] : s.savedTickets, draft: { id: Math.max(s.draft.id, s.mounted?.id ?? 0, ...s.savedTickets.map(t => t.id)) + 1, holes: [], service: 0, back: false } };
        case 'readerClamp': return (s.values.readerDepth?.[0] ?? 0) > 0 && (s.values.readerDepth?.[0] ?? 0) < 1 ? s : { ...s, values: { ...s.values, readerClamp: [s.values.readerClamp?.[0] === 1 ? 0 : 1] } };
        case 'mountTicket': return s.mounted || !owns(s, 'paper') || s.draft.back || s.values.readerClamp?.[0] !== 1 || s.values.readerDepth?.[0] !== .65 ? s : { ...s, values: { ...s.values, readerDepth: [1] }, mounted: structuredClone(s.draft), draft: { id: s.draft.id + 1, holes: [], service: 0, back: false } };
        case 'removeTicket': return !s.mounted || s.values.readerClamp?.[0] !== 1 ? s : { ...s, values: { ...s.values, readerDepth: [0] }, draft: s.mounted, mounted: null, savedTickets: (s.draft.holes.length || s.draft.service > 0) ? [...s.savedTickets, s.draft] : s.savedTickets };
        case 'call': return s.room !== 'north' || s.train.position !== 'absent' || !Number.isInteger(a.service) || a.service < 1 || a.service > 6 ? s : { ...s, train: { service: a.service, position: 'approaching', firstDoor: null } };
        case 'board': return s.room !== 'north' || !validTicket(s, s.mounted) || s.values.readerClamp?.[0] !== 0 || trace(s.route).end !== 'O' || !boardingGeometry(s.train, s.signals, s.locations.hood === 'signal') ? s : { ...s, room: 'return', camera: 0, train: { ...s.train, position: 'departed' } };
        case 'end': return s.room === 'return' ? { ...s, ended: true } : s;
        case 'sound': return { ...s, sound: !s.sound };
        case 'tick': return { ...s, elapsed: s.elapsed + a.seconds };
    }
}
export function restore(value: unknown): State | null {
    if (!value || typeof value !== 'object')
        return null;
    let s = value as State;
    // Earlier representative saves used the exterior-sidepath name for this underpass.
    if (s.room === 'tunnel' && s.values && !s.values.passageRevision && [0, 1].includes(s.camera))
        s = { ...s, room: 'passage', camera: s.camera === 0 ? 2 : 3, values: { ...s.values, passageRevision: [1] }, visited: Array.isArray(s.visited) ? s.visited.map(v => v === 'tunnel:0' ? 'passage:2' : v === 'tunnel:1' ? 'passage:3' : v) : s.visited };
    const legacy = s.signals === undefined;
    const signals = legacy ? freshSignals() : s.signals;
    const train = legacy ? (s.room === 'return' ? { service: 2, position: 'departed' as const, firstDoor: 7 } : freshTrain()) : s.train;
    if (!validSignals(signals) || !validTrain(train))
        return null;
    if (!legacy && ['lamp', 'spareLamp'].some((item, i) => (signals.mounts[i] !== null) !== (s.locations?.[item as Item] === 'signal')))
        return null;
    if (s.version !== 2 || !Object.hasOwn(cameraCounts, s.room) || !Number.isInteger(s.camera) || s.camera < 0 || s.camera >= cameraCounts[s.room] || typeof s.started !== 'boolean' || !s.locations || !s.bag || !Array.isArray(s.seats) || s.seats.length !== 3 || !s.seats.every(n => n === 0 || n === 1) || !Array.isArray(s.flags) || !Array.isArray(s.visited) || !s.values || !Array.isArray(s.notes) || !Number.isFinite(s.elapsed) || s.elapsed < 0 || !Array.isArray(s.route) || s.route.length !== 6 || !s.route.every((n, i) => Number.isInteger(n) && n >= 0 && n < connections[nodes[i]].length))
        return null;
    if (!Number.isFinite(s.bag.strap) || s.bag.strap < 0 || s.bag.strap > 1 || typeof s.bag.clasp !== 'boolean' || typeof s.bag.mouth !== 'boolean')
        return null;
    const ticket = (t: Ticket) => t && Number.isInteger(t.id) && t.id > 0 && Array.isArray(t.holes) && t.holes.length <= 180 && [0, 1, 2, 3, 4, 5, 6].includes(t.service) && typeof t.back === 'boolean' && (t.marks === undefined || Array.isArray(t.marks) && t.marks.length <= 12 && t.marks.every(m => m && Number.isInteger(m.service) && m.service >= 1 && m.service <= 6 && typeof m.back === 'boolean')) && (t.stamps === undefined || Array.isArray(t.stamps) && t.stamps.length <= 6 && t.stamps.every(n => Number.isInteger(n) && n >= 1 && n <= 6)) && t.holes.every(h => Number.isInteger(h.column) && h.column >= 0 && h.column < 5 && nodes.includes(h.node) && (h.tool === undefined || [0, 1, 2].includes(h.tool)) && ['white', 'black'].includes(h.side));
    if (!ticket(s.draft) || s.mounted && !ticket(s.mounted) || !Array.isArray(s.savedTickets) || !s.savedTickets.every(ticket))
        return null;
    const numeric = (v: unknown): v is number[] => Array.isArray(v) && v.length <= 768 && v.every(n => typeof n === 'number' && Number.isFinite(n));
    if (!Object.values(s.values).every(numeric))
        return null;
    for (const [name, max] of [['pointSelected', 5], ['journeySelected', 3], ['journeyStop', 1], ['journeyFrame', 1], ['journeyCompare', 1]] as const)
        if (s.values[name] && (s.values[name].length !== 1 || !Number.isInteger(s.values[name][0]) || s.values[name][0] < 0 || s.values[name][0] > max))
            return null;
    if (s.values.journeyBacks && (s.values.journeyBacks.length > 4 || new Set(s.values.journeyBacks).size !== s.values.journeyBacks.length || s.values.journeyBacks.some(n => !Number.isInteger(n) || n < 0 || n > 3)))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('journey-record-') && (!numeric(n.values) || ![2, 3].includes(n.values.length) || !Number.isInteger(n.values[0]) || n.values[0] < 0 || n.values[0] > 3 || ![0, 1].includes(n.values[1]) || n.values.length === 3 && ![0, 1].includes(n.values[2]))))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('point-observation-') && (!numeric(n.values) || n.values.length !== 2 || !Number.isInteger(n.values[0]) || n.values[0] < 0 || n.values[0] > 5 || !Number.isInteger(n.values[1]) || n.values[1] < 0 || n.values[1] >= connections[nodes[n.values[0]]].length)))
        return null;
    if (s.values.cargoDigits && !validCargoDigits(s.values.cargoDigits))
        return null;
    if (s.values.cargo && !validCargo(s.values.cargo as Cargo))
        return null;
    for (const name of ['cargoOpen', 'stairDoor', 'northHatch'])
        if (s.values[name] && (s.values[name].length !== 1 || ![0, 1].includes(s.values[name][0])))
            return null;
    for (const name of ['rackRing', 'tagCaught'])
        if (s.values[name] && (s.values[name].length !== 1 || ![0, 1].includes(s.values[name][0])))
            return null;
    if (s.values.tagDepth && (s.values.tagDepth.length !== 1 || ![0, 1, 2].includes(s.values.tagDepth[0])))
        return null;
    if (s.values.tagCaught?.[0] === 1 && s.values.tagDepth?.[0] !== 2)
        return null;
    for (const name of ['gateSupport', 'gateRod', 'gateOpen'])
        if (s.values[name] && (s.values[name].length !== 1 || ![0, 1].includes(s.values[name][0])))
            return null;
    if (s.values.gateRod?.[0] === 1 && (s.values.gateSupport?.[0] !== 1 || (s.locations.support ?? 'bridgeGate') !== 'bridgeGate') || s.values.gateSupport?.[0] === 1 && (s.locations.support ?? 'bridgeGate') !== 'bridgeGate' || s.values.gateOpen?.[0] === 1 && s.values.gateRod?.[0] !== 1 && s.locations.support !== 'inventory')
        return null;
    const trials = (v: number[]) => v.length <= 648 && v.length % 3 === 0 && v.every((n, i) => Number.isInteger(n) && n >= 0 && n <= (i % 3 === 0 ? 2 : i % 3 === 1 ? 5 : 11));
    if (s.values.toolCuts && !trials(s.values.toolCuts))
        return null;
    for (const name of ['punchTool', 'toolSelected'])
        if (s.values[name] && (s.values[name].length !== 1 || ![0, 1, 2].includes(s.values[name][0])))
            return null;
    for (const name of ['toolDie', 'ticketDie'])
        if (s.values[name] && (s.values[name].length !== 1 || !Number.isInteger(s.values[name][0]) || s.values[name][0] < 0 || s.values[name][0] > 5))
            return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('toolTrial') && (!numeric(n.values) || !trials(n.values))))
        return null;
    if (s.values.toolPage && (s.values.toolPage.length !== 1 || !Number.isInteger(s.values.toolPage[0]) || s.values.toolPage[0] < 0))
        return null;
    const order = (v: number[]) => v.length === 4 && new Set(v).size === 4 && v.every(n => Number.isInteger(n) && n >= 0 && n < 4);
    if (s.values.photoOrder && !order(s.values.photoOrder))
        return null;
    if (s.values.caseWheels && (s.values.caseWheels.length !== 4 || !s.values.caseWheels.every(n => Number.isInteger(n) && n >= 0 && n < 4)))
        return null;
    if (!s.notes.every(n => n && typeof n.id === 'string' && numeric(n.values) && (n.id !== 'arrivalPhotos' || order(n.values))))
        return null;
    const notes = s.notes.filter(n => n.id !== 'toolTrial' || !s.notes.some(other => other.id.startsWith('toolTrial-') && other.values.length === n.values.length && other.values.every((v, i) => v === n.values[i])));
    const locations = { spareLamp: 'cargoChest', cargoDocket: 'cargoChest', support: 'bridgeGate', hook: 'toolRack', pin: 'railTag', punch: 'toolBench', paper: 'toolBench', counterRecords: 'counter', knob: 'cashDrawer', ...s.locations } as State['locations'];
    if (legacy)
        for (const item of ['lamp', 'spareLamp', 'hood'] as Item[])
            if (locations[item] === 'signal')
                locations[item] = 'inventory';
    return { ...s, signals, train, notes, values: s.values.toolDie && !s.values.ticketDie ? { ...s.values, ticketDie: s.values.toolDie } : s.values, locations };
}
