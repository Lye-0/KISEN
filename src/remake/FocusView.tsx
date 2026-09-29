import {Train} from './Train';
import { Bag } from './Bag';
import { Photos } from './Photos';
import { Recorder } from './Recorder';
import { RouteCase } from './RouteCase';
import { MaintenanceMap } from './MaintenanceMap';
import { TicketBench, TicketPaper } from './TicketBench';
import { TicketReader } from './TicketReader';
import { Hatch } from './Hatch';
import { CounterDrawer } from './CounterDrawer';
import { ServiceRecords } from './ServiceRecords';
import { OfficeLock } from './OfficeLock';
import { Receipt } from './Receipt';
import { Photo } from './Photo';
import { Clock } from './Clock';
import type { Focus } from './World';
import type { Action, Item, State } from './model';
export const itemArt: Partial<Record<Item, string>> = { envelope:'/assets/remake/parts/seat-envelope.png',officeKey: '/assets/remake/parts/office-key.png', knob: '/assets/remake/parts/reel-cap.png', punch: '/assets/remake/parts/punch-open.png', counterRecords: '/assets/remake/parts/counter-folder.png' };
export function FocusView({ focus, s, dispatch, say, selected, onSelect, close }: {
    focus: Focus;
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    selected: Item | null;
    onSelect: (i: Item | null) => void;
    close: () => void;
}) {
    switch (focus) {
        case 'seat': return <Train s={s} dispatch={dispatch} closeSeat={s.values.seatFocus?.[0]??2} inspect={()=>{}} inspectCase={()=>{}} say={say}/>;
        case 'bag': return <Bag s={s} dispatch={dispatch} say={say}/>;
        case 'photos': return <Photos s={s} dispatch={dispatch} say={say}/>;
        case 'recorder': return <Recorder s={s} dispatch={dispatch} say={say} selected={selected} onSelect={onSelect}/>;
        case 'case': return <RouteCase s={s} dispatch={dispatch} say={say}/>;
        case 'map': return <MaintenanceMap />;
        case 'ticket': return <TicketBench s={s} dispatch={dispatch} say={say}/>;
        case 'reader': return <TicketReader s={s} dispatch={dispatch} say={say}/>;
        case 'hatch': return <Hatch s={s} dispatch={dispatch} say={say}/>;
        case 'counterDrawer': return <CounterDrawer s={s} dispatch={dispatch} say={say}/>;
        case 'notices': return <ServiceRecords s={s} dispatch={dispatch} say={say}/>;
        case 'receipt': return <Receipt />;
        case 'platformClock': return <Photo src="/assets/remake/platform/station.webp" view={[935, 207, 188, 195]} label="ホームの時計"><Clock minutes={23 * 60 + 17} transform="translate(1030 302) scale(.72)"/></Photo>;
        case 'officeLock': return <OfficeLock s={s} dispatch={dispatch} say={say} selected={selected} onSelect={onSelect} enter={() => { dispatch({ type: 'move', room: 'office', camera: 0 }); close(); }}/>;
        case 'paperView': return <div className="rm-hand-paper"><TicketPaper ticket={s.draft}/><button onClick={() => dispatch({ type: 'flipTicket' })}>裏返す</button></div>;
        case 'item': return <div className="rm-hand-item">{selected && itemArt[selected] && <img src={itemArt[selected]} alt="手元の持ち物"/>}</div>;
        default: return null;
    }
}
