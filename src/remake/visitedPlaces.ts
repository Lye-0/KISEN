import { cargoInitial, stairsClear } from './cargo';
import type { Cargo } from './cargo';
import { cameraCounts } from './model';
import type { Room, State } from './model';

export const roomLabels: Record<Room, string> = { train: '到着車内', platform: '南ホーム', waiting: '待合室', forecourt: '駅前', office: '駅務室', lost: '忘れ物室', bridge: '跨線橋', cargo: '荷物室', passage: '地下横断通路', lamp: '灯具小屋', tunnel: 'トンネル側道', north: '北ホーム', return: '帰りの車内' };

// The list reveals names only. Connectivity stays internal, and unvisited rooms
// cannot be used as intermediate shortcuts. Dynamic obstructions still apply.
export function visitedPlaces(s: State) {
    const places = new Map<Room, number>();
    for (const visit of s.visited) {
        if (typeof visit !== 'string') continue;
        const [name, view, extra] = visit.split(':');
        const room = name as Room, camera = Number(view);
        if (extra !== undefined || view === undefined || !Object.hasOwn(cameraCounts, room) || !Number.isInteger(camera) || camera < 0 || camera >= cameraCounts[room] || room === 'return') continue;
        if (!places.has(room)) places.set(room, camera);
    }
    if (s.room !== 'return') places.set(s.room, s.camera);
    const reached = new Set<Room>();
    if (s.started && !s.ended && s.room !== 'return') {
        const edges: [Room, Room, boolean][] = [
            ['train', 'platform', true], ['platform', 'waiting', true],
            ['platform', 'bridge', true], ['waiting', 'forecourt', true],
            ['waiting', 'office', s.flags.includes('officeUnlocked')],
            ['office', 'lost', true], ['office', 'cargo', true],
            ['forecourt', 'lamp', s.values.shedOpen?.[0] === 1],
            ['bridge', 'north', s.values.gateOpen?.[0] === 1],
            ['cargo', 'passage', s.values.stairDoor?.[0] === 1 && stairsClear((s.values.cargo ?? cargoInitial) as Cargo)],
            ['passage', 'north', s.values.northHatch?.[0] === 1],
            ['north', 'tunnel', true],
        ];
        const queue: Room[] = [s.room];
        reached.add(s.room);
        for (let i = 0; i < queue.length; i++) {
            for (const [a, b, open] of edges) {
                const next = a === queue[i] ? b : b === queue[i] ? a : null;
                if (open && next && places.has(next) && !reached.has(next)) {
                    reached.add(next);
                    queue.push(next);
                }
            }
        }
    }
    return [...places].map(([room, camera]) => ({ room, camera, current: room === s.room, reachable: reached.has(room) }));
}
