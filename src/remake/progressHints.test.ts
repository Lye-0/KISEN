import { describe, expect, it } from 'vitest';
import { getProgressHint } from './progressHints';
import { newState, reduce, restore, expectedHoles } from './model';
import { stopAt } from './stopping';
const id = (s: ReturnType<typeof newState>) => getProgressHint(s).id;
function office() {
    const s = newState(); s.started = true; s.room = 'office'; s.visited = ['train:0','office:0']; s.flags = ['officeUnlocked'];
    Object.assign(s.locations, { photos: 'inventory', receipt: 'inventory', envelope: 'inventory', ownTicket: 'inventory', officeKey: 'inventory' });
    return s;
}
function ready() {
    const s = office(); s.room = 'north'; s.visited.push('north:0');
    Object.assign(s.locations, { fragments: 'inventory', lamp: 'signal', spareLamp: 'signal', hood: 'signal', retainingPin: 'signal', cargoDocket: 'inventory', ticket: 'reader', punch: 'inventory' });
    s.values.shedOpen = [1]; s.values.bellChannel = [1]; s.values.readerClamp = [0]; s.values.callService = [2];
    s.route = [0,1,0,1,1,1]; s.signals = { mounts: [7,11], shutters: [2,3] };
    s.mounted = { id: 20, service: 2, back: false, holes: expectedHoles(s.route) };
    return s;
}
describe('progress-sensitive hints', () => {
    it('moves from paper to the remaining bag operations using actual actions', () => {
        let s = newState();
        expect(id(s)).toBe('arrival-receipt');
        s = reduce(s,{ type:'take',item:'receipt' }); expect(id(s)).toBe('arrival-clasp');
        s = reduce(s,{ type:'bagClasp' }); expect(id(s)).toBe('arrival-strap');
        s = reduce(s,{ type:'bagStrap',position:1 }); expect(id(s)).toBe('arrival-bag-open');
        s = reduce(s,{ type:'bagMouth' }); expect(id(s)).toBe('arrival-photos-take');
        s = reduce(s,{ type:'take',item:'photos' }); expect(id(s)).toBe('arrival-seat');
        s = reduce(s,{ type:'seat',index:2 }); expect(id(s)).toBe('arrival-envelope-take');
        s = reduce(s,{ type:'take',item:'envelope' }); expect(id(s)).toBe('arrival-ticket');
        s = reduce(s,{type:'take',item:'ownTicket'}); expect(id(s)).toBe('arrival-case');
    });
    it('does not treat a visit to the freely accessible bridge as opening the office', () => {
        let s = newState(); s = reduce(s,{type:'move',room:'bridge'}); s = reduce(s,{type:'move',room:'train'});
        expect(id(s)).toBe('arrival-receipt');
    });
    it('advances from an open case to using the collected key', () => {
        let s = newState(); s.values.caseOpen = [1]; s.locations.officeKey = 'case';
        expect(id(s)).toBe('arrival-key-take');
        s = reduce(s,{type:'take',item:'officeKey'}); expect(id(s)).toBe('office-unlock');
    });
    it('uses unfinished local puzzles without assuming that a saved note means solved', () => {
        const s = office(); s.room = 'lost'; s.notes = [{id:'clockChecks',values:[0,0],at:0}];
        expect(getProgressHint(s,'clockChecks').id).toBe('receipts-order');
        s.values.receiptSlots = [2,0,3,1]; expect(getProgressHint(s,'receiptTray').id).toBe('receipts-pull');
        s.values.receiptOpen = [1]; expect(getProgressHint(s,'receiptTray').id).toBe('fragments-take');
        s.locations.fragments = 'inventory'; expect(getProgressHint(s,'fragments').id).toBe('fragments-compare');
    });
    it('does not ask for a second copy of a collected box item', () => {
        const s = office(); s.room = 'lamp'; s.values.shedOpen = [1]; s.values.balanceOpen = [1];
        s.locations.lamp = 'inventory'; s.locations.hood = 'signal';
        const h = getProgressHint(s,'balanceBox');
        expect(h.id).toBe('balance-take'); expect(h.clues[0]).toContain('保持ピン'); expect(h.clues[0]).not.toContain('覆い');
    });
    it('advances through hook extraction and the released gate', () => {
        let s = office(); s.locations.hook = 'inventory'; s.room = 'bridge'; s.camera = 1;
        expect(getProgressHint(s,'railTag').id).toBe('rail-insert');
        s = reduce(s,{type:'tagInsert'}); expect(getProgressHint(s,'railTag').id).toBe('rail-extend');
        s = reduce(s,{type:'tagExtend'}); expect(getProgressHint(s,'railTag').id).toBe('rail-turn');
        s = reduce(s,{type:'tagTurn'}); expect(getProgressHint(s,'railTag').id).toBe('rail-withdraw');
        s = reduce(s,{type:'tagWithdraw'}); s.camera=2;
        expect(getProgressHint(s,'bridgeGate').id).toBe('gate-brace');
        s=reduce(s,{type:'gateSupport'}); expect(getProgressHint(s,'bridgeGate').id).toBe('gate-slot');
        s=reduce(s,{type:'gateRod'}); expect(getProgressHint(s,'bridgeGate').id).toBe('gate-push');
        s=reduce(s,{type:'gateDoor'}); expect(getProgressHint(s,'bridgeGate').id).toBe('north-enter');
    });
    it('accepts the underground approach instead of requiring the bridge route', () => {
        const s=office(); s.room='passage'; s.values.stairDoor=[1];
        expect(id(s)).toBe('north-underpass');
    });
    it('recognizes lamps installed elsewhere instead of sending the player to unopened boxes', () => {
        const s=ready(); s.signals.mounts[0]=null; s.locations.lamp='glassStand';
        expect(id(s)).toBe('lamps-retrieve'); expect(getProgressHint(s).clues[0]).toContain('観測窓');
    });
    it('recognizes an installed knob as acquired', () => {
        const s=office(); s.locations.counterRecords='inventory'; s.locations.knob='recorder';
        expect(getProgressHint(s,'recorder').id).toBe('cargo-code');
    });
    it('prioritizes the current focus in parallel puzzles', () => {
        const s=office(); s.locations.counterRecords='inventory'; s.locations.knob='recorder';
        expect(getProgressHint(s,'cargoChest').id).toBe('cargo-code');
        expect(getProgressHint(s,'clockChecks').id).toBe('receipts-order');
    });
    it('does not nag the player about earlier materials when departure is ready', () => {
        const s=ready(); s.locations.knob='cashDrawer'; s.locations.fragments='lostDrawer';
        expect(id(s)).toBe('call');
    });
    it('adapts while the train approaches, passes, stops, and leaves', () => {
        let s=reduce(ready(),{type:'call',service:2});
        expect(id(s)).toBe('train-approaching');
        s=reduce(s,{type:'trainArrive'}); expect(id(s)).toBe('board');
        s=reduce(s,{type:'releaseTrain'}); expect(id(s)).toBe('train-wait');
        const wrong=reduce(ready(),{type:'call',service:1});
        expect(id(reduce(wrong,{type:'trainArrive'}))).toBe('train-wait');
    });
    it('uses the captured door position when lamps move after arrival', () => {
        let s=ready(); s.train=stopAt(2,s.signals,true,true);
        s=reduce(s,{type:'signalMount',lamp:0,mark:8});
        expect(id(s)).toBe('train-reposition');
    });
    it('distinguishes a valid loose ticket from an installed ticket and an open clamp', () => {
        const s=ready(); s.draft=s.mounted!; s.mounted=null; s.locations.ticket='inventory';
        expect(id(s)).toBe('reader-insert');
        s.draft.back=true; expect(id(s)).toBe('reader-face');
        s.draft.back=false; s.train=stopAt(2,s.signals,true,true);
        expect(id(s)).toBe('reader-insert');
        s.mounted=s.draft; s.draft=null; s.locations.ticket='reader'; s.values.readerClamp=[1]; expect(id(s)).toBe('reader-close');
    });
    it('rechecks a ticket that no longer matches the chosen valid route', () => {
        const s=ready(); s.mounted!.holes=[]; expect(id(s)).toBe('ticket-recheck-mounted');
    });
    it('resumes the same recommendation after normal save restoration', () => {
        const s=ready(); s.signals.shutters=[0,0];
        const next=restore(JSON.parse(JSON.stringify(s))); expect(next).not.toBeNull();
        expect(getProgressHint(next!)).toEqual(getProgressHint(s));
    });
    it('shows journey and completed states without sending the player back to puzzles', () => {
        const s=ready(); s.room='return'; s.values.returnTrip=[0,0]; expect(id(s)).toBe('return-travel');
        s.values.returnTrip=[10,0]; expect(id(s)).toBe('return-arrived');
        s.values.returnTrip=[12,0]; expect(id(s)).toBe('return-exit');
        s.values.returnTrip=[12,1]; expect(id(s)).toBe('complete');
        s.ended=true; expect(id(s)).toBe('complete');
    });
    it('does not change game state when requesting a hint', () => {
        const s=ready(), snapshot=JSON.stringify(s);
        getProgressHint(s); getProgressHint(s,'signal'); expect(JSON.stringify(s)).toBe(snapshot);
    });
});

it('guides the newly unlocked door without repeating the key operation', () => {
    const s=newState(); s.started=true; s.room='waiting'; s.flags=['officeUnlocked']; s.locations.officeKey='inventory';
    expect(getProgressHint(s,'officeLock').id).toBe('office-enter');
});
it('describes an already mounted observation lamp instead of telling the player to install it again', () => {
    const s=ready(); s.room='lamp'; s.locations.lamp='lightStand'; s.signals.mounts[0]=null;
    expect(getProgressHint(s,'lampWindow').id).toBe('lamp-observe');
});

it('遮光器のヒントは固定光路と未通電を区別する', () => {
    const s = ready(); s.signals.shutters = [1, 2];
    expect(getProgressHint(s, 'signal').id).toBe('signal-shutters');
    expect(getProgressHint(s, 'signal').clues.join('')).toContain('その奥');
    expect(getProgressHint(s, 'signal').clues.join('')).not.toMatch(/刻印|正解|2, ?3/);
    s.signals.shutters = [2, 3]; s.values.bellChannel = [0];
    expect(getProgressHint(s, 'signal').id).toBe('signal-power');
});
