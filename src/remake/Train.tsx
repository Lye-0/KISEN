import { useEffect, useId } from 'react';
import type { Action, State } from './model';
import { Photo, Patch, Touch, decode } from './Photo';
const root = '/assets/remake/train/';
export function trainBagPhoto(s: State) { return root + (s.bag.mouth ? 'north-bag-open' : s.bag.clasp ? s.bag.strap > .8 ? 'north-unlatched' : 'north-clasp-only' : s.bag.strap > .8 ? 'north-strap-aside' : 'north') + '.webp'; }
function BagMasks({ s }: {
    s: State;
}) { const id = useId().replaceAll(':', ''); return <>{s.bag.mouth && s.locations.photos !== 'bag' && <><defs><clipPath id={id + 'p'}><rect x="540" y="569" width="138" height="42"/></clipPath></defs><image href={root + 'north-empty.webp'} width="1672" height="941" clipPath={`url(#${id + 'p'})`}/></>}{s.locations.receipt === 'inventory' && <><defs><clipPath id={id + 'r'}><rect x="627" y="494" width="76" height="59"/></clipPath></defs><image href={root + 'north-empty.webp'} width="1672" height="941" clipPath={`url(#${id + 'r'})`}/></>}</>; }
function BagImage({ s }: {
    s: State;
}) { return <><image href={trainBagPhoto(s)} width="1672" height="941"/><BagMasks s={s}/></>; }
function NearSeatLayers({ s }: {
    s: State;
}) {
    const id = useId().replaceAll(':', ''), raised = s.seats[2] === 1, source = root + (raised ? 'near-empty-raised' : 'near-empty-normal') + '.webp';
    // The foreground bag and the back behind it are separate physical layers.
    const bag = 'M432 582Q444 548 488 541L538 535Q538 509 577 501Q620 490 638 509L641 535L704 542Q730 550 734 582L749 709Q688 732 600 721L445 707Q428 701 431 678Z M552 531Q552 514 581 509Q613 508 628 525L630 534Z';
    return <><defs><clipPath id={id + 'seat'}><path d="M242 348L885 345Q913 350 915 387L949 654L916 731L267 731L242 633L278 530L242 402Z"/></clipPath><clipPath id={id + 'bag'}><path d={bag} clipRule="evenodd"/>{s.bag.strap > .8 && <path d="M707 552Q766 586 775 638L791 718Q775 741 750 720L740 637Q733 601 706 589Z"/>}</clipPath><clipPath id={id + 'receipt'}><path d="M640 507L672 521L663 550L633 541Z"/></clipPath><clipPath id={id + 'pocket'}><path d="M729 487Q780 511 850 489L858 565Q797 570 738 548Z"/></clipPath></defs>
 <image href={source} width="1672" height="941" clipPath={`url(#${id + 'seat'})`}/>
 <g clipPath={`url(#${id + 'bag'})`}><BagImage s={s}/></g>{s.locations.receipt !== 'inventory' && <image href={trainBagPhoto(s)} width="1672" height="941" clipPath={`url(#${id + 'receipt'})`}/>}
 {raised && s.locations.envelope === 'seat' && <><image href="/assets/remake/parts/seat-envelope.png" x="761" y="446" width="65" height="103" transform="rotate(2 793 497)" style={{ filter: 'brightness(.62) saturate(.75) blur(.5px) drop-shadow(2px 4px 3px #000b)' }}/><image href={source} width="1672" height="941" clipPath={`url(#${id + 'pocket'})`}/></>}
 </>;
}
export function Train({ s, dispatch, inspect, inspectCase, inspectSeat, exit, say, closeSeat }: {
    s: State;
    dispatch?: (a: Action) => void;
    inspect: () => void;
    inspectCase: () => void;
    inspectSeat?: (i: number) => void;
    exit?: () => void;
    say?: (m: string) => void;
    closeSeat?: number;
}) {
    const cabinetId = useId().replaceAll(':', '');
    const camera = closeSeat === undefined ? s.camera : closeSeat === 2 ? 0 : 1;
    useEffect(() => {
        for (const name of ['north', 'north-bag-open', 'north-strap-aside', 'north-unlatched', 'north-clasp-only', 'north-empty', 'case-open', 'case-empty', 'near-empty-normal', 'near-empty-raised', 'forward-left-raised', 'forward-right-raised', 'east-seats-10', 'east-seats-01', 'east-seats-11'])
            void decode(root + name + '.webp').catch(() => { });
    }, []);
    const act = (i: number) => {
        if (closeSeat !== undefined)
            { dispatch?.({ type: 'seat', index: i }); say?.(s.seats[i] ? '背を元の向きへ戻した。' : '背が反転し、裏のポケットが見える。'); }
        else
            inspectSeat?.(i);
    };
    if (camera === 2)
        return <Photo src={root + 'west-end.webp'} label="一枚扉と赤い消火器箱"><Touch name="車端の一枚扉" rect={[40, 9, 20, 75]} act={() => say?.('車端の扉は締め切られている。')}/></Photo>;
    if (camera === 1)
        return <Photo src={root + 'forward.webp'} view={closeSeat === 1 ? [325, 340, 470, 400] : closeSeat === 0 ? [1045, 340, 505, 400] : undefined} label="前方の二列の座席">
 {s.seats[1] === 1 && <Patch src={root + 'forward-left-raised.webp'} rect={[16, 37, 33, 62]}/>}{s.seats[0] === 1 && <Patch src={root + 'forward-right-raised.webp'} rect={[54, 37, 42, 62]}/>}
 {(closeSeat === undefined || closeSeat === 1) && <Touch name={closeSeat === undefined ? '中央の座席の背' : s.seats[1] ? '座席の背を戻す' : '座席の背を倒す'} rect={[35, 43, 10, 27]} act={() => act(1)}/>}
 {(closeSeat === undefined || closeSeat === 0) && <Touch name={closeSeat === undefined ? '奥の座席の背' : s.seats[0] ? '座席の背を戻す' : '座席の背を倒す'} rect={[75, 43, 15, 27]} act={() => act(0)}/>}
 {closeSeat !== undefined && s.seats[closeSeat] === 1 && <Touch name="座席裏のポケット" rect={closeSeat === 1 ? [27, 53, 13, 9] : [71, 53, 13, 9]} act={() => say?.('ポケットの中は空だった。')}/>}
 </Photo>;
    const forward = s.seats[0] + '' + s.seats[1];
    return <Photo src={root + 'near-empty-normal.webp'} view={closeSeat === 2 ? [685, 365, 330, 260] : undefined} label="きさらぎ駅に停まった車内">

 {forward !== '00' && <Patch src={root + 'east-seats-' + forward + '.webp'} rect={[38.5, 33, 24.8, 41]}/>}
 <svg className="rm-object-overlay" viewBox="0 0 1672 941"><NearSeatLayers s={s}/></svg>
 {s.locations.ownTicket === 'inventory' && <svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs><filter id={cabinetId + 'floorSoft'} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter><mask id={cabinetId + 'floorMask'}><ellipse cx="1508" cy="846" rx="90" ry="54" fill="white" filter={`url(#${cabinetId}floorSoft)`}/></mask></defs><image href={root + 'floor-clear.webp'} width="1672" height="941" mask={`url(#${cabinetId}floorMask)`}/></svg>}
 {s.values.caseOpen?.[0] === 1 && <svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs><clipPath id={cabinetId}><path d="M1476 104L1672 49V382L1462 356Z"/></clipPath></defs><image href={root + 'case-' + (s.locations.officeKey === 'inventory' ? 'empty' : 'open') + '.webp'} width="1672" height="941" clipPath={`url(#${cabinetId})`}/></svg>}
 {closeSeat === undefined && <><Touch name="乗務員用書類箱" rect={[87, 6, 11, 31]} act={inspectCase}/><Touch name="前方の座席へ寄る" rect={[40, 34, 23, 10]} act={() => dispatch?.({ type: 'look', camera: 1 })}/><Touch name="座席の鞄" rect={[25, 50, 22, 28]} act={inspect}/>{exit && <Touch name="二枚扉からホームへ降りる" rect={[69, 8, 16, 79]} act={exit}/>}</>}
 {closeSeat === undefined && s.locations.ownTicket === 'floor' && <Touch name="床の到着券" rect={[85, 77, 12, 20]} act={() => { dispatch?.({ type: 'take', item: 'ownTicket' }); say?.('切符を拾った。'); }}/>}
 <Touch name={closeSeat === undefined ? '手前の座席の背' : s.seats[2] ? '座席の背を戻す' : '座席の背を倒す'} rect={[54, 46, 5, 13]} act={() => act(2)}/>
 {s.seats[2] === 1 && s.locations.envelope === 'seat' && <Touch name="座席裏の封筒" rect={[44, 46, 8, 12]} act={() => { dispatch?.({ type: 'take', item: 'envelope' }); say?.('封筒を手に取った。'); }}/>}
 {closeSeat === 2 && s.seats[2] === 1 && s.locations.envelope !== 'seat' && <Touch name="座席裏の空のポケット" rect={[44, 46, 8, 12]} act={() => say?.('ポケットの中は空だった。')}/>}
 <Patch src={root + 'near-door-open.webp'} rect={[66.3, 0, 20.2, 94]}/>
 </Photo>;
}
