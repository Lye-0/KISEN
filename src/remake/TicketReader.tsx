import { useCompact } from './useCompact';
import { Photo, Patch, Touch } from './Photo';
import { Surface } from './Surface';
import { TicketPaper } from './TicketBench';
import { planeMatrix } from './plane';
import { owns } from './model';
import type { State, Action, Item } from './model';
const matrix = planeMatrix(808, 243, [[454, 395], [1240, 395], [1275, 511], [419, 511]]);
export function TicketReader({ s, dispatch, say, selected }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    selected: Item | null;
}) {
    const compact = useCompact(), open = s.values.readerClamp?.[0] === 1;
    function slide() {
        if (!open) { say('押さえが閉じている。'); return; }
        if (s.mounted) { dispatch({ type: 'removeTicket' }); return; }
        if (selected !== 'ticket' || !owns(s, 'ticket') || !s.draft) { say('手元の切符を選ぶ。'); return; }
        if (s.draft.back) { say('紙の縁が、突起に当たる。'); return; }
        dispatch({ type: 'mountTicket' });
    }
    return <section className="rm-ticket-reader"><Photo view={compact ? [360, 300, 1020, 640] : undefined} src={open ? '/assets/remake/reader/open.webp' : '/assets/remake/reader/closed.webp'} label="ホームの切符受け">
    {s.mounted && <Surface><div className="rm-reader-card" data-ticket-id={s.mounted.id} style={{ width: 808, height: 243, transform: `matrix3d(${matrix.join(',')})`, filter: 'brightness(.76)' }}><TicketPaper ticket={s.mounted}/></div></Surface>}
    {s.mounted && !open && <Patch src="/assets/remake/reader/closed.webp" rect={[23.7, 52.8, 55.3, 5.7]}/>}
    {s.mounted && <svg className="rm-reader-pin" viewBox="0 0 1672 941"><defs><clipPath id="reader-pin"><path d="M439 359Q448 353 459 359L468 405Q469 417 453 422Q440 424 433 416L432 384Z"/></clipPath></defs><image href="/assets/remake/reader/closed.webp" width="1672" height="941" clipPath="url(#reader-pin)"/></svg>}
    <Touch name={open ? '切符受けの押さえを閉める' : '切符受けの押さえを開く'} rect={[73.6, open ? 57 : 50, 8, 9]} act={() => dispatch({ type: 'readerClamp' })}/>
    <Touch name={s.mounted ? '設置した切符を引き抜く' : '選んだ切符を受けに差す'} rect={[26, 42, 49, 13]} act={slide} drag={(_, dy) => { if (s.mounted ? dy > 0 : dy < 0) slide(); }}/>
    </Photo></section>;
}
