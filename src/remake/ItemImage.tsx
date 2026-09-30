import { ReceiptPaper } from './Receipt';
import { TicketPaper } from './TicketBench';
import { arrivalTicket } from './arrivalTicket';
import type { Item, State } from './model';
const root = '/assets/remake/';
const art: Partial<Record<Item, string>> = {
    envelope: 'parts/seat-envelope.png',
    officeKey: 'parts/office-key.png',
    knob: 'parts/reel-cap.png',
    punch: 'parts/punch-open.png',
    lamp: 'parts/marker-lamp.png',
    spareLamp: 'parts/marker-lamp.png',
    counterRecords: 'parts/counter-folder.png',
    hook: 'parts/maintenance-hook.png',
    pin: 'parts/maintenance-tab.png',
    support: 'parts/folding-support.png',
};
export function ItemImage({ item, state }: {
    item: Item;
    state: State;
}) {
    if (art[item])
        return <img className="rm-item-image" src={root + art[item]} alt="" draggable={false}/>;
    if (item === 'photos')
        return <img className="rm-item-image" src={root + 'parts/inventory-photos.png'} alt="" draggable={false}/>;
    if (item === 'receipt')
        return <ReceiptPaper />;
    if (item === 'ownTicket' || item === 'ticket')
        return <TicketPaper ticket={item === 'ownTicket' ? arrivalTicket : state.mounted ?? state.draft}/>;
    if (item === 'paper')
        return <img className="rm-item-image" src={root + 'parts/inventory-paper.png'} alt="" draggable={false}/>;
    if (item === 'hood')
        return <svg viewBox="0 0 100 100" aria-hidden="true"><image href={root + 'parts/shutter-blade.png'} x="2" y="22" width="88" height="29"/><image href={root + 'parts/shutter-blade.png'} x="10" y="49" width="88" height="29"/></svg>;
    if (item === 'fragments')
        return <svg viewBox="0 0 100 100" aria-hidden="true"><defs><pattern id="rm-fragment-paper" width="100" height="100" patternUnits="userSpaceOnUse"><image href={root + 'parts/photo-back.webp'} width="100" height="100"/></pattern></defs><path d="M9 23H49V55L40 51L31 59L21 54L9 62Z M53 32H90V79L79 72L69 80L63 73L53 77Z" fill="url(#rm-fragment-paper)" stroke="#77705e" strokeWidth="2"/></svg>;
    const forms: Record<'hook' | 'pin' | 'support', string> = {
        hook: 'M20 86L24 80L72 23Q79 14 87 19Q94 25 86 34L75 46L69 39L80 28L72 32L31 89Z',
        pin: 'M13 47L79 43L90 49L79 54L13 53Z',
        support: 'M14 79L49 20L87 79L78 84L49 37L23 84Z',
    };
    return <svg viewBox="0 0 100 100" aria-hidden="true"><path d={forms[item as keyof typeof forms]} fill="#7b7f78" stroke="#353b39" strokeWidth="3"/></svg>;
}
