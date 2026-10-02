import { visitedPlaces } from './visitedPlaces';
import { changeSketch, validSketch } from './sketchGraph';
import { validDispatchRecord } from './dispatchEvidence';
import { validGlassRecord } from './glassGeometry';
import { validNoticeLift } from './notice';
import { fragmentInitial, moveFragment, validFragments } from './ticketFragments';
import { placeReceipt, receiptInitial, receiptTrayReleases, validClockAdjust, validReceiptSlots } from './lostProperty';
import { validAim } from './lampOptics';
import { validBellTimes, readBellRecord } from './bellCircuit';
import { validBalance, balanceReleases } from './balance';
import { validShedDigits, shedUnlocks } from './posters';
import { cargoUnlocks, validCargoDigits } from './cargoDockets';
import { dieOrder, sameOpening } from './ticketGeometry';
import { cargoInitial, moveCargo, stairsClear, validCargo } from './cargo';
import type { Cargo } from './cargo';
import { arrivalCaseSides } from './arrivalPhotos';
import { duration as tapeDuration } from './recordings';
import { freshSignals, freshTrain, mounts, stopAt, boardingGeometry, validSignals, validTrain } from './stopping';
import type { SignalState, TrainState } from './stopping';
export type Room = 'train' | 'platform' | 'waiting' | 'forecourt' | 'office' | 'lost' | 'bridge' | 'cargo' | 'passage' | 'lamp' | 'tunnel' | 'north' | 'return';
export type Item = 'phone' | 'retainingPin' | 'cargoDocket' | 'spareLamp' | 'counterRecords' | 'photos' | 'receipt' | 'envelope' | 'ownTicket' | 'officeKey' | 'knob' | 'hook' | 'pin' | 'support' | 'lamp' | 'punch' | 'paper' | 'fragments' | 'hood' | 'ticket';
export type Place = 'lostDrawer' | 'lightRack' | 'balanceChest' | 'cargoChest' | 'bridgeGate' | 'toolRack' | 'railTag' | 'toolBench' | 'counter' | 'cashDrawer' | 'case' | 'bag' | 'handle' | 'seat' | 'floor' | 'inventory' | 'recorder' | 'lightStand' | 'glassStand' | 'signal' | 'reader';
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
    version: 3;
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
    draft: Ticket | null;
    mounted: Ticket | null;
    savedTickets: Ticket[];
    signals: SignalState;
    train: TrainState;
    elapsed: number;
    sound: boolean;
    ended: boolean;
}
export const newState = (): State => ({ version: 3, started: false, room: 'train', camera: 0, visited: ['train:0'], locations: { phone: 'inventory', retainingPin: 'balanceChest', fragments: 'lostDrawer', lamp: 'lightRack', hood: 'balanceChest', spareLamp: 'cargoChest', cargoDocket: 'cargoChest', support: 'bridgeGate', hook: 'toolRack', pin: 'railTag', punch: 'toolBench', paper: 'toolBench', counterRecords: 'counter', knob: 'cashDrawer', photos: 'bag', receipt: 'handle', envelope: 'seat', ownTicket: 'floor' }, bag: { strap: 0, clasp: false, mouth: false }, seats: [0, 0, 0], window: { supported: false, latch: false, open: false }, values: { deskToolRevision: [1], retainingPinRevision: [1], passageRevision: [1], bellChannel: [0] }, flags: [], notes: [], route: [0, 0, 0, 0, 0, 0], draft: null, mounted: null, savedTickets: [], signals: freshSignals(), train: freshTrain(), elapsed: 0, sound: false, ended: false });
export const selectedDeskTool = (s: State): number | null => s.values.toolSelected?.[0] ?? null;
export const cameraCounts: Record<Room, number> = { train: 3, platform: 3, waiting: 3, forecourt: 2, office: 2, lost: 1, bridge: 4, cargo: 3, passage: 4, lamp: 2, tunnel: 2, north: 4, return: 2 };
export const signalReady = (s: State) => s.locations.hood === 'signal' && s.locations.retainingPin === 'signal';
export const liveCircuit = (s: State) => s.values.bellChannel?.[0] === 1;
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
    type: 'sketch';
    a: number;
    b: number;
    kind: number;
} | {
    type: 'returnAdvance';
    seconds: number;
} | {
    type: 'returnReview';
} | {
    type: 'glassLamp';
    item: 'lamp' | 'spareLamp';
} | {
    type: 'fragmentMove';
    id: number;
    pose: number[];
} | {
    type: 'receiptPlace';
    receipt: number;
    slot: number;
} | {
    type: 'receiptRemove';
    slot: number;
} | {
    type: 'receiptTray';
} | {
    type: 'lightMount';
    item: 'lamp' | 'spareLamp';
} | {
    type: 'lightBrace';
} | {
    type: 'lightAim';
    aim: number[];
} | {
    type: 'bellChannel';
    channel: number;
} | {
    type: 'bellStrike';
    time: number;
} | {
    type: 'bellReset';
} | {
    type: 'shedDoor';
} | {
    type: 'balanceBox';
} | {
    type: 'balanceWeight';
    index: 0 | 1;
    position: number;
} | {
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
    type: 'selectTool';
    tool: number;
} | {
    type: 'selectDie';
    die: number;
} | {
    type: 'newTrialPaper';
} | {
    type: 'start';
} | {
    type: 'look';
    camera: number;
} | {
    type: 'travel';
    room: Room;
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
    if (s.room === 'return' && !['look', 'end', 'returnAdvance', 'returnReview', 'sound', 'tick', 'record'].includes(a.type))
        return s;
    switch (a.type) {
        case 'sketch': return !owns(s, 'envelope') ? s : { ...s, values: { ...s.values, sketchEdges: changeSketch(s.values.sketchEdges ?? [], a.a, a.b, a.kind) } };
        case 'fragmentMove': {
            if (!owns(s, 'fragments'))
                return s;
            const v = moveFragment(s.values.fragments ?? fragmentInitial, a.id, a.pose);
            return v ? { ...s, values: { ...s.values, fragments: v } } : s;
        }
        case 'receiptPlace': {
            if (s.room !== 'lost' || s.values.receiptOpen?.[0] === 1)
                return s;
            const slots = placeReceipt(s.values.receiptSlots ?? receiptInitial, a.receipt, a.slot);
            return slots ? { ...s, values: { ...s.values, receiptSlots: slots } } : s;
        }
        case 'receiptRemove': return s.room !== 'lost' || s.values.receiptOpen?.[0] === 1 || !Number.isInteger(a.slot) || a.slot < 0 || a.slot > 3 ? s : { ...s, values: { ...s.values, receiptSlots: (s.values.receiptSlots ?? receiptInitial).map((n, i) => i === a.slot ? -1 : n) } };
        case 'receiptTray': {
            const open = s.values.receiptOpen?.[0] === 1;
            return s.room !== 'lost' || !open && !receiptTrayReleases(s.values.receiptSlots ?? receiptInitial) ? s : { ...s, values: { ...s.values, receiptOpen: [open ? 0 : 1] } };
        }
        case 'glassLamp': {
            if (s.room !== 'tunnel' || !['lamp', 'spareLamp'].includes(a.item))
                return s;
            const mounted = s.locations[a.item] === 'glassStand';
            if (!mounted && (!owns(s, a.item) || s.locations.lamp === 'glassStand' || s.locations.spareLamp === 'glassStand'))
                return s;
            return { ...s, locations: { ...s.locations, [a.item]: mounted ? 'inventory' : 'glassStand' } };
        }
        case 'lightMount': {
            if (s.room !== 'lamp')
                return s;
            const mounted = s.locations[a.item] === 'lightStand';
            if (!mounted && (!owns(s, a.item) || s.locations.lamp === 'lightStand' || s.locations.spareLamp === 'lightStand'))
                return s;
            return { ...s, locations: { ...s.locations, [a.item]: mounted ? 'inventory' : 'lightStand' } };
        }
        case 'lightBrace': {
            if (s.room !== 'lamp' || s.locations.lamp === 'lightStand' || s.locations.spareLamp === 'lightStand' || !['inventory', 'lightStand'].includes(s.locations.support ?? ''))
                return s;
            return { ...s, locations: { ...s.locations, support: s.locations.support === 'lightStand' ? 'inventory' : 'lightStand' } };
        }
        case 'lightAim': return s.room !== 'lamp' || !validAim(a.aim) ? s : { ...s, values: { ...s.values, lightAim: a.aim } };
        case 'bellChannel': return s.room !== 'lamp' || ![0, 1].includes(a.channel) || a.channel === (s.values.bellChannel?.[0] ?? 0) ? s : { ...s, values: { ...s.values, bellChannel: [a.channel], bellInputs: [] } };
        case 'bellReset': return s.room !== 'lamp' ? s : { ...s, values: { ...s.values, bellInputs: [] } };
        case 'bellStrike': {
            const inputs = [...(s.values.bellInputs ?? []), a.time];
            return s.room !== 'lamp' || !validBellTimes(inputs) ? s : { ...s, values: { ...s.values, bellInputs: inputs } };
        }
        case 'shedDoor': return s.room !== 'forecourt' || !shedUnlocks(s.values.shedDigits ?? []) ? s : { ...s, values: { ...s.values, shedOpen: [1] } };
        case 'balanceWeight': return s.room !== 'lamp' || s.values.balanceOpen?.[0] === 1 || ![0, 1].includes(a.index) || !Number.isInteger(a.position) || a.position < 0 || a.position > 3 ? s : { ...s, values: { ...s.values, balancePositions: (s.values.balancePositions ?? [1, 1]).map((n, i) => i === a.index ? a.position : n) } };
        case 'balanceBox': {
            const open = s.values.balanceOpen?.[0] === 1;
            return s.room !== 'lamp' || !open && !balanceReleases(s.values.balancePositions ?? [1, 1]) ? s : { ...s, values: { ...s.values, balanceOpen: [open ? 0 : 1] } };
        }
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
            return progress < 1 ? { ...s, train: { ...s.train, progress } } : { ...s, train: s.train.position === 'approaching' ? stopAt(s.train.service, s.signals, signalReady(s), trace(s.route).end === 'O' && liveCircuit(s)) : freshTrain() };
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
        case 'signalHood': {
            if (s.room !== 'north')
                return s;
            const removing = signalReady(s);
            if (!removing && (!owns(s, 'hood') || !owns(s, 'retainingPin')))
                return s;
            return { ...s, locations: { ...s.locations, hood: removing ? 'inventory' : 'signal', retainingPin: removing ? 'inventory' : 'signal' } };
        }
        case 'shutter': return s.room !== 'north' || !signalReady(s) || ![0, 1].includes(a.plate) || !Number.isInteger(a.step) || a.step < 0 || a.step > 4 ? s : { ...s, signals: { ...s.signals, shutters: s.signals.shutters.map((v, i) => i === a.plate ? a.step : v) as [
                    number,
                    number
                ] } };
        case 'trainArrive': return s.train.position !== 'approaching' ? s : { ...s, train: stopAt(s.train.service, s.signals, signalReady(s), trace(s.route).end === 'O' && liveCircuit(s)) };
        case 'releaseTrain': return s.train.position !== 'stopped' || s.room !== 'north' ? s : { ...s, train: { ...s.train, position: 'leaving', progress: 0 } };
        case 'selectTool': return s.room !== 'office' || ![0, 1, 2].includes(a.tool) ? s : { ...s, values: { ...s.values, toolSelected: [a.tool] } };
        case 'selectDie': return s.room !== 'office' || !Number.isInteger(a.die) || a.die < 0 || a.die > 5 ? s : { ...s, values: { ...s.values, ticketDie: [a.die] } };
        case 'toolCut': {
            if (s.room !== 'office' || a.tool !== selectedDeskTool(s) || a.die !== s.values.ticketDie?.[0] || ![0, 1, 2].includes(a.tool) || !Number.isInteger(a.die) || a.die < 0 || a.die > 5 || !Number.isInteger(a.slot) || a.slot < 0 || a.slot > 11)
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
        case 'travel': {
            const place = visitedPlaces(s).find(p => p.room === a.room);
            if (!place || place.current || !place.reachable) return s;
            return { ...s, room: place.room, camera: place.camera };
        }
        case 'move': {
            if (a.room === 'tunnel' && (s.room !== 'north' || s.camera !== 1) || s.room === 'tunnel' && (a.room !== 'north' || (a.camera ?? 0) !== 1))
                return s;
            if (a.room === 'lamp' && (s.room !== 'forecourt' || s.values.shedOpen?.[0] !== 1))
                return s;
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
            if (a.item === 'paper') return s.draft || s.mounted ? s : reduce(s, { type: 'newTicket' });
            if (a.item === 'ticket') return s;
            const at = s.locations[a.item];
            if (at === 'lostDrawer' && (s.room !== 'lost' || s.values.receiptOpen?.[0] !== 1))
                return s;
            if (at === 'lightStand' || at === 'glassStand')
                return s;
            if (at === 'lightRack' && s.room !== 'lamp' || at === 'balanceChest' && (s.room !== 'lamp' || s.values.balanceOpen?.[0] !== 1))
                return s;
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
            if (a.item === 'punch' && at === 'toolBench')
                return s;
            if (!at || at === 'counter' && !s.window.open || at === 'cashDrawer' && s.values.drawerOpen?.[0] !== 1 || at === 'inventory' || at === 'case' && s.values.caseOpen?.[0] !== 1 || at === 'bag' && !s.bag.mouth || at === 'seat' && s.seats[2] !== 1)
                return s;
            return { ...s, locations: { ...s.locations, [a.item]: 'inventory' } };
        }
        case 'put': return ['paper', 'ticket', 'phone', 'punch'].includes(a.item) || !s.locations[a.item] || ['lostDrawer', 'glassStand', 'lightStand', 'lightRack', 'balanceChest', 'signal', 'toolRack', 'railTag', 'bridgeGate'].includes(a.place) || ['glassStand', 'lightStand', 'lightRack', 'balanceChest', 'signal', 'toolRack', 'railTag', 'bridgeGate'].includes(s.locations[a.item]!) ? s : { ...s, locations: { ...s.locations, [a.item]: a.place } };
        case 'seat': return { ...s, seats: s.seats.map((v, i) => i === a.index ? 1 - v : v) };
        case 'heard': {
            if (!Number.isFinite(a.seconds))
                return s;
            const id = 'heard' + a.tape;
            const seconds = Math.max(s.values[id]?.[0] ?? 0, Math.min(tapeDuration, Math.max(0, a.seconds)));
            return { ...s, values: { ...s.values, [id]: [seconds] } };
        }
        case 'values': return ['toolSelected', 'punchTool', 'ticketDie', 'toolDie', 'deskToolRevision'].includes(a.id) || a.id === 'readerDepth' || a.id === 'sketchEdges' || a.id === 'returnTrip' || a.id === 'clockAdjust' && !validClockAdjust(a.values) || ['fragments', 'receiptSlots', 'receiptOpen', 'lightAim', 'bellChannel', 'bellInputs'].includes(a.id) || a.id === 'shedDigits' && !validShedDigits(a.values) || a.id === 'posterPair' && (a.values.length !== 2 || !a.values.every(n => Number.isInteger(n) && n >= 0 && n < 4)) || a.id === 'posterBacks' && (new Set(a.values).size !== a.values.length || !a.values.every(n => Number.isInteger(n) && n >= 0 && n < 4)) || ['shedOpen', 'balanceOpen', 'balancePositions'].includes(a.id) || a.id === 'cargoDigits' && !validCargoDigits(a.values) || ['cargoOpen', 'gateSupport', 'gateRod', 'gateOpen', 'rackRing', 'tagDepth', 'tagCaught'].includes(a.id) ? s : { ...s, values: { ...s.values, [a.id]: a.values } };
        case 'flag': return { ...s, flags: append(s.flags, a.id) };
        case 'record': return { ...s, notes: [...s.notes.filter(n => n.id !== a.id), { id: a.id, values: [...(a.values ?? s.values[a.id] ?? [])], at: s.elapsed }] };
        case 'route': return !nodes[a.index] || !connections[nodes[a.index]][a.value] || ['approaching', 'passing', 'leaving', 'stopped'].includes(s.train.position) && trace(s.route).path.includes(nodes[a.index]) ? s : { ...s, route: s.route.map((v, i) => i === a.index ? a.value : v) };
        case 'punch': return s.room !== 'office' || !s.draft || selectedDeskTool(s) === null || dieOrder[s.values.ticketDie?.[0] ?? -1] !== a.hole.node || !owns(s, 'ticket') || !Number.isInteger(a.hole.column) || a.hole.column < 0 || a.hole.column > 4 || !nodes.includes(a.hole.node) || !['white', 'black'].includes(a.hole.side) || s.draft.holes.some(h => h.column === a.hole.column && h.side === a.hole.side && h.node === a.hole.node && (h.tool ?? 1) === selectedDeskTool(s)) ? s : { ...s, draft: { ...s.draft, holes: [...s.draft.holes, { ...a.hole, tool: selectedDeskTool(s)! }] } };
        case 'flipTicket': return !s.draft || !owns(s, 'ticket') ? s : { ...s, draft: { ...s.draft, back: !s.draft.back } };
        case 'ticketService': {
            if (!s.draft || !owns(s, 'ticket') || !Number.isInteger(a.service) || a.service < 1 || a.service > 6)
                return s;
            const marks = s.draft.marks ?? (s.draft.stamps ?? (s.draft.service ? [s.draft.service] : [])).map(service => ({ service, back: false }));
            const mark = { service: a.service, back: s.draft.back };
            return { ...s, draft: { ...s.draft, service: a.service, stamps: undefined, marks: marks.some(m => m.service === mark.service && m.back === mark.back) ? marks : [...marks, mark] } };
        }
        case 'newTicket': {
            if (s.room !== 'office' || s.mounted) return s;
            const previous = s.draft;
            const id = Math.max(0, previous?.id ?? 0, ...s.savedTickets.map(t => t.id)) + 1;
            return { ...s, locations: { ...s.locations, paper: 'toolBench', ticket: 'inventory' },
                savedTickets: previous && (previous.holes.length || previous.service > 0 || previous.marks?.length || previous.stamps?.length) ? [...s.savedTickets, previous] : s.savedTickets,
                draft: { id, holes: [], service: 0, back: false } };
        }
        case 'readerClamp': return { ...s, values: { ...s.values, readerClamp: [s.values.readerClamp?.[0] === 1 ? 0 : 1] } };
        case 'mountTicket': return s.room !== 'north' || s.mounted || !s.draft || !owns(s, 'ticket') || s.draft.back || s.values.readerClamp?.[0] !== 1 ? s : {
            ...s, locations: { ...s.locations, ticket: 'reader' }, values: { ...s.values, readerDepth: [1] }, mounted: s.draft, draft: null
        };
        case 'removeTicket': return s.room !== 'north' || !s.mounted || s.draft || s.values.readerClamp?.[0] !== 1 ? s : {
            ...s, locations: { ...s.locations, ticket: 'inventory' }, values: { ...s.values, readerDepth: [0] }, draft: s.mounted, mounted: null
        };
        case 'call': return s.room !== 'north' || s.train.position !== 'absent' || !Number.isInteger(a.service) || a.service < 1 || a.service > 6 ? s : { ...s, train: { service: a.service, position: 'approaching', firstDoor: null } };
        case 'board': return !liveCircuit(s) || s.room !== 'north' || !validTicket(s, s.mounted) || s.values.readerClamp?.[0] !== 0 || trace(s.route).end !== 'O' || !boardingGeometry(s.train, s.signals, signalReady(s)) ? s : { ...s, room: 'return', camera: 0, values: { ...s.values, returnTrip: [0, 0] }, train: { ...s.train, position: 'departed' } };
        case 'returnAdvance': return s.room !== 'return' || s.ended || !Number.isFinite(a.seconds) || a.seconds <= 0 || a.seconds > 1 ? s : { ...s, values: { ...s.values, returnTrip: [Math.min(12, (s.values.returnTrip?.[0] ?? 0) + a.seconds), s.values.returnTrip?.[1] ?? 0] } };
        case 'end': return s.room === 'return' && s.values.returnTrip?.[0] === 12 ? { ...s, ended: true, values: { ...s.values, returnTrip: [12, 1] } } : s;
        case 'returnReview': return s.room === 'return' && s.ended ? { ...s, ended: false, camera: 0 } : s;
        case 'sound': return { ...s, sound: !s.sound };
        case 'tick': return !Number.isFinite(a.seconds) || a.seconds <= 0 || a.seconds > 3600 ? s : { ...s, elapsed: s.elapsed + a.seconds };
    }
}
export function restore(value: unknown): State | null {
    if (!value || typeof value !== 'object')
        return null;
    let s = value as State;
    const savedVersion = (value as { version?: number }).version;
    // A crop of the same shelf is not a second facing direction.
    if (s.room === 'lost' && s.camera === 1) s = { ...s, camera: 0 };
    if (Array.isArray(s.visited) && s.visited.includes('lost:1')) s = { ...s, visited: [...new Set(s.visited.map(v => v === 'lost:1' ? 'lost:0' : v))] };

    // Earlier representative saves used the exterior-sidepath name for this underpass.
    if (s.room === 'tunnel' && s.values && !s.values.passageRevision && [0, 1].includes(s.camera))
        s = { ...s, room: 'passage', camera: s.camera === 0 ? 2 : 3, values: { ...s.values, passageRevision: [1] }, visited: Array.isArray(s.visited) ? s.visited.map(v => v === 'tunnel:0' ? 'passage:2' : v === 'tunnel:1' ? 'passage:3' : v) : s.visited };
    if (s.values && s.room === 'return' && !s.values.returnTrip)
        s = { ...s, values: { ...s.values, returnTrip: s.ended ? [12, 1] : [0, 0] } };
    const legacy = s.signals === undefined;
    const signals = legacy ? freshSignals() : s.signals;
    const train = legacy ? (s.room === 'return' ? { service: 2, position: 'departed' as const, firstDoor: 7 } : freshTrain()) : s.train;
    if (!validSignals(signals) || !validTrain(train))
        return null;
    if (!legacy && ['lamp', 'spareLamp'].some((item, i) => (signals.mounts[i] !== null) !== (s.locations?.[item as Item] === 'signal')))
        return null;
    if (![2, 3].includes(savedVersion ?? 0) || !Object.hasOwn(cameraCounts, s.room) || !Number.isInteger(s.camera) || s.camera < 0 || s.camera >= cameraCounts[s.room] || typeof s.started !== 'boolean' || !s.locations || !s.bag || !Array.isArray(s.seats) || s.seats.length !== 3 || !s.seats.every(n => n === 0 || n === 1) || !Array.isArray(s.flags) || !Array.isArray(s.visited) || !s.values || !Array.isArray(s.notes) || !Number.isFinite(s.elapsed) || s.elapsed < 0 || !Array.isArray(s.route) || s.route.length !== 6 || !s.route.every((n, i) => Number.isInteger(n) && n >= 0 && n < connections[nodes[i]].length))
        return null;
    if (!Number.isFinite(s.bag.strap) || s.bag.strap < 0 || s.bag.strap > 1 || typeof s.bag.clasp !== 'boolean' || typeof s.bag.mouth !== 'boolean')
        return null;
    const ticket = (t: Ticket | null) => t && Number.isInteger(t.id) && t.id > 0 && Array.isArray(t.holes) && t.holes.length <= 180 && [0, 1, 2, 3, 4, 5, 6].includes(t.service) && typeof t.back === 'boolean' && (t.marks === undefined || Array.isArray(t.marks) && t.marks.length <= 12 && t.marks.every(m => m && Number.isInteger(m.service) && m.service >= 1 && m.service <= 6 && typeof m.back === 'boolean')) && (t.stamps === undefined || Array.isArray(t.stamps) && t.stamps.length <= 6 && t.stamps.every(n => Number.isInteger(n) && n >= 1 && n <= 6)) && t.holes.every(h => Number.isInteger(h.column) && h.column >= 0 && h.column < 5 && nodes.includes(h.node) && (h.tool === undefined || [0, 1, 2].includes(h.tool)) && ['white', 'black'].includes(h.side));
    if (s.draft !== null && !ticket(s.draft) || s.mounted !== null && !ticket(s.mounted) || !Array.isArray(s.savedTickets) || !s.savedTickets.every(ticket))
        return null;
    if (s.locations.phone !== undefined && s.locations.phone !== 'inventory')
        return null;
    if (s.values.returnTrip && (s.values.returnTrip.length !== 2 || !Number.isFinite(s.values.returnTrip[0]) || s.values.returnTrip[0] < 0 || s.values.returnTrip[0] > 12 || ![0, 1].includes(s.values.returnTrip[1]) || s.values.returnTrip[1] === 1 && s.values.returnTrip[0] !== 12))
        return null;
    if (s.ended && (s.room !== 'return' || s.values.returnTrip?.[0] !== 12 || s.values.returnTrip?.[1] !== 1))
        return null;
    if (s.values.sketchEdges && !validSketch(s.values.sketchEdges))
        return null;
    const numeric = (v: unknown): v is number[] => Array.isArray(v) && v.length <= 768 && v.every(n => typeof n === 'number' && Number.isFinite(n));
    if (!Object.values(s.values).every(numeric))
        return null;
    for (const [name, max] of [['pointSelected', 5], ['journeySelected', 3], ['journeyStop', 1], ['journeyFrame', 1], ['journeyCompare', 1]] as const)
        if (s.values[name] && (s.values[name].length !== 1 || !Number.isInteger(s.values[name][0]) || s.values[name][0] < 0 || s.values[name][0] > max))
            return null;
    if (s.values.lightAim && !validAim(s.values.lightAim) || s.values.bellInputs && !validBellTimes(s.values.bellInputs) || s.values.bellChannel && (s.values.bellChannel.length !== 1 || ![0, 1].includes(s.values.bellChannel[0])))
        return null;
    if (s.locations.lamp === 'glassStand' && s.locations.spareLamp === 'glassStand' || Object.entries(s.locations).some(([item, at]) => at === 'glassStand' && !['lamp', 'spareLamp'].includes(item)))
        return null;
    if (s.notes.some(n => n?.id === 'routeSketch' && (!Array.isArray(n.values) || !validSketch(n.values))))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('crossing-observation-') && (n.values?.length !== 1 || !Number.isInteger(n.values[0]) || n.values[0] < 0 || n.values[0] > 2)))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('dispatch-record-') && (!numeric(n.values) || !validDispatchRecord(n.values))))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('glass-observation-') && (!numeric(n.values) || !validGlassRecord(n.values))))
        return null;
    if (s.locations.lamp === 'lightStand' && s.locations.spareLamp === 'lightStand')
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('bell-record-') && (!numeric(n.values) || !readBellRecord(n.values))))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('lamp-observation-') && (!numeric(n.values) || n.values.length !== 4 || ![0, 1].includes(n.values[0]) || ![0, 1].includes(n.values[3]) || !validAim(n.values.slice(1, 3)))))
        return null;
    if (s.values.receiptSlots && !validReceiptSlots(s.values.receiptSlots) || s.values.receiptOpen && (s.values.receiptOpen.length !== 1 || ![0, 1].includes(s.values.receiptOpen[0])) || s.values.receiptOpen?.[0] === 1 && !receiptTrayReleases(s.values.receiptSlots ?? receiptInitial))
        return null;
    if (s.values.fragments && !validFragments(s.values.fragments) || s.notes.some(n => n?.id === 'fragments' && !validFragments(n.values)))
        return null;
    if (s.values.clockAdjust && !validClockAdjust(s.values.clockAdjust))
        return null;
    if (s.notes.some(n => n?.id === 'clockChecks' && (!numeric(n.values) || !validClockAdjust(n.values))))
        return null;
    if (s.notes.some(n => n?.id === 'receiptTray' && (!numeric(n.values) || !validReceiptSlots(n.values))))
        return null;
    if (s.values.journeyBacks && (s.values.journeyBacks.length > 4 || new Set(s.values.journeyBacks).size !== s.values.journeyBacks.length || s.values.journeyBacks.some(n => !Number.isInteger(n) || n < 0 || n > 3)))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('journey-record-') && (!numeric(n.values) || ![2, 3].includes(n.values.length) || !Number.isInteger(n.values[0]) || n.values[0] < 0 || n.values[0] > 3 || ![0, 1].includes(n.values[1]) || n.values.length === 3 && ![0, 1].includes(n.values[2]))))
        return null;
    if (s.notes.some(n => typeof n?.id === 'string' && n.id.startsWith('point-observation-') && (!numeric(n.values) || n.values.length !== 2 || !Number.isInteger(n.values[0]) || n.values[0] < 0 || n.values[0] > 5 || !Number.isInteger(n.values[1]) || n.values[1] < 0 || n.values[1] >= connections[nodes[n.values[0]]].length)))
        return null;
    if (s.values.shedDigits && !validShedDigits(s.values.shedDigits) || s.values.balancePositions && !validBalance(s.values.balancePositions))
        return null;
    for (const name of ['shedOpen', 'balanceOpen'])
        if (s.values[name] && (s.values[name].length !== 1 || ![0, 1].includes(s.values[name][0])))
            return null;
    if (s.values.balanceOpen?.[0] === 1 && !balanceReleases(s.values.balancePositions ?? [1, 1]))
        return null;
    if (s.notes.some(n => n?.id === 'freight' && (!numeric(n.values) || n.values.length !== 0)))
        return null;
    if (s.values.noticeLift && !validNoticeLift(s.values.noticeLift) || s.notes.some(n => n?.id === 'noticeBoard' && (!numeric(n.values) || !validNoticeLift(n.values))))
        return null;
    if (s.values.posterPair && (s.values.posterPair.length !== 2 || !s.values.posterPair.every(n => Number.isInteger(n) && n >= 0 && n < 4)))
        return null;
    if (s.values.posterBacks && (new Set(s.values.posterBacks).size !== s.values.posterBacks.length || !s.values.posterBacks.every(n => Number.isInteger(n) && n >= 0 && n < 4)))
        return null;
    if (s.notes.some(n => n?.id === 'posters' && (!numeric(n.values) || n.values.length < 2 || n.values.length > 6 || !n.values.every(v => Number.isInteger(v) && v >= 0 && v < 4))))
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
    if (s.values.gateRod?.[0] === 1 && (s.values.gateSupport?.[0] !== 1 || (s.locations.support ?? 'bridgeGate') !== 'bridgeGate') || s.values.gateSupport?.[0] === 1 && (s.locations.support ?? 'bridgeGate') !== 'bridgeGate' || s.values.gateOpen?.[0] === 1 && s.values.gateRod?.[0] !== 1 && !['inventory', 'lightStand'].includes(s.locations.support ?? ''))
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
    const locations = { phone: 'inventory', retainingPin: 'balanceChest', fragments: 'lostDrawer', lamp: 'lightRack', hood: 'balanceChest', spareLamp: 'cargoChest', cargoDocket: 'cargoChest', support: 'bridgeGate', hook: 'toolRack', pin: 'railTag', punch: 'toolBench', paper: 'toolBench', counterRecords: 'counter', knob: 'cashDrawer', ...s.locations } as State['locations'];
    if (legacy)
        for (const item of ['lamp', 'spareLamp', 'hood', 'retainingPin'] as Item[])
            if (locations[item] === 'signal')
                locations[item] = 'inventory';
    if (!s.values.retainingPinRevision && locations.hood === 'signal')
        locations.retainingPin = 'signal';
    if ((locations.hood === 'signal') !== (locations.retainingPin === 'signal') || !['balanceChest', 'inventory', 'signal'].includes(locations.retainingPin ?? ''))
        return null;
    if (s.values.retainingPinRevision && (s.values.retainingPinRevision.length !== 1 || s.values.retainingPinRevision[0] !== 1))
        return null;
    if (!s.values.bellChannel && (train.position !== 'absent' || locations.lamp === 'signal' || locations.spareLamp === 'signal'))
        s = { ...s, values: { ...s.values, bellChannel: [1] } };
    s = { ...s, values: { ...s.values, retainingPinRevision: [1] } };
    if (!s.values.deskToolRevision) {
        const tool = locations.punch === 'inventory' ? s.values.punchTool?.[0] ?? 1 : s.values.toolSelected?.[0] ?? s.values.punchTool?.[0];
        const values = { ...s.values, deskToolRevision: [1] };
        delete values.punchTool;
        if (tool !== undefined) values.toolSelected = [tool];
        locations.punch = 'toolBench';
        s = { ...s, values };
    } else if (s.values.deskToolRevision.length !== 1 || s.values.deskToolRevision[0] !== 1 || locations.punch !== 'toolBench' || s.values.punchTool !== undefined) return null;
    let draft = s.draft, mounted = s.mounted, savedTickets = [...s.savedTickets];
    if (savedVersion === 2) {
        // Legacy mounting spawned a second blank automatically. Preserve meaningful work,
        // but leave exactly one active physical ticket and keep the stack on the desk.
        if (mounted) {
            if (draft && JSON.stringify(draft) !== JSON.stringify(mounted) && (draft.holes.length || draft.service || draft.marks?.length || draft.stamps?.length)) savedTickets.push(draft);
            draft = null;
        } else if (locations.paper !== 'inventory' && locations.ticket !== 'inventory') {
            if (draft && (draft.holes.length || draft.service || draft.marks?.length || draft.stamps?.length)) savedTickets.push(draft);
            draft = null;
        }
        locations.paper = 'toolBench';
        if (mounted) locations.ticket = 'reader';
        else if (draft) locations.ticket = 'inventory';
        else delete locations.ticket;
        // Repair old independently-created ticket IDs without throwing any contents away.
        const active = [...(draft ? [draft] : []), ...(mounted ? [mounted] : [])];
        const used = new Map(active.map(t => [t.id, t]));
        let next = Math.max(0, ...used.keys(), ...savedTickets.map(t => t.id)) + 1;
        savedTickets = savedTickets.flatMap(t => {
            const previous = used.get(t.id);
            if (previous && JSON.stringify(previous) === JSON.stringify(t)) return [];
            const result = previous ? { ...t, id: next++ } : t;
            used.set(result.id, result); return [result];
        });
    }
    if (locations.paper !== 'toolBench' || draft && mounted || (draft !== null) !== (locations.ticket === 'inventory') || (mounted !== null) !== (locations.ticket === 'reader') || locations.ticket !== undefined && !['inventory', 'reader'].includes(locations.ticket)) return null;
    const tickets = [...(draft ? [draft] : []), ...(mounted ? [mounted] : []), ...savedTickets];
    if (new Set(tickets.map(t => t.id)).size !== tickets.length) return null;
    s = { ...s, version: 3, draft, mounted, savedTickets, values: { ...s.values, ...(savedVersion === 2 && (s.values.readerDepth !== undefined || mounted) ? { readerDepth: [mounted ? 1 : 0] } : {}) } };
    return { ...s, signals, train, notes, values: s.values.toolDie && !s.values.ticketDie ? { ...s.values, ticketDie: s.values.toolDie } : s.values, locations };
}
