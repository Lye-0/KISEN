import { useSceneBack } from './SceneBack';
import { useCompact } from './useCompact';
import { Photo, Patch, Touch } from './Photo';
import { Surface } from './Surface';
import { TicketPaper } from './TicketBench';
import { planeMatrix } from './plane';
import type { Point2 } from './plane';
import type { State, Action } from './model';
export function TicketReader({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const compact = useCompact();
    const open = s.values.readerClamp?.[0] === 1, depth = s.mounted ? 1 : s.values.readerDepth?.[0] ?? 0;
    useSceneBack(!s.mounted && depth > 0, () => dispatch({ type: 'values', id: 'readerDepth', values: [0] }));
    const seated: [
        Point2,
        Point2,
        Point2,
        Point2
    ] = [[454, 395], [1240, 395], [1275, 511], [419, 511]];
    const hand: [
        Point2,
        Point2,
        Point2,
        Point2
    ] = [[450, 650], [1255, 650], [1235, 887], [414, 887]];
    const points = hand.map((p, i) => [p[0] + (seated[i][0] - p[0]) * depth, p[1] + (seated[i][1] - p[1]) * depth] as Point2) as typeof seated;
    const matrix = planeMatrix(808, 243, points);
    function slide() {
        if (s.mounted) {
            if (!open) {
                say('押さえが紙を挟んでいる。');
                return;
            }
            dispatch({ type: 'removeTicket' });
            return;
        }
        if (!open) {
            say('手前の押さえに当たる。');
            return;
        }
        if (s.draft.back) {
            say('紙の縁が、突起に当たる。');
            return;
        }
        if (depth === 0)
            dispatch({ type: 'values', id: 'readerDepth', values: [.65] });
        else
            dispatch({ type: 'mountTicket' });
    }
    return <section className="rm-ticket-reader"><Photo view={compact ? [360, 300, 1020, 640] : undefined} src={open ? '/assets/remake/reader/open.webp' : '/assets/remake/reader/closed.webp'} label="ホームの切符受け">
 <Surface><div className="rm-reader-card" style={{ width: 808, height: 243, transform: `matrix3d(${matrix.join(',')})`, filter: depth === 1 ? 'brightness(.76)' : 'none' }}><TicketPaper ticket={s.mounted ?? s.draft}/></div></Surface>
 {s.mounted && !open && <Patch src="/assets/remake/reader/closed.webp" rect={[23.7, 52.8, 55.3, 5.7]}/>}
 {s.mounted && <svg className="rm-reader-pin" viewBox="0 0 1672 941"><defs><clipPath id="reader-pin"><path d="M439 359Q448 353 459 359L468 405Q469 417 453 422Q440 424 433 416L432 384Z"/></clipPath></defs><image href="/assets/remake/reader/closed.webp" width="1672" height="941" clipPath="url(#reader-pin)"/></svg>}
 <Touch name={open ? '切符受けの押さえを閉める' : '切符受けの押さえを開く'} rect={[73.6, open ? 57 : 50, 8, 9]} act={() => {
            if (depth > 0 && depth < 1) {
                say('紙が途中に残っている。');
                return;
            }
            dispatch({ type: 'readerClamp' });
        }}/>
 <Touch name={s.mounted ? '設置した券を引き抜く' : depth > 0 ? '券を奥へ送る' : '券を受けに差す'} rect={s.mounted ? [26, 42, 49, 12] : depth > 0 ? [25, 51.5, 51, 18] : [25, 70, 49, 24]} act={slide} drag={(_, dy) => {
            if (dy > 0 && !s.mounted && depth > 0)
                dispatch({ type: 'values', id: 'readerDepth', values: [0] });
            else if (dy < 0 && !s.mounted || dy > 0 && s.mounted)
                slide();
        }}/>
 </Photo><div className="rm-reader-actions">{!s.mounted && depth === 0 && <><button onClick={() => dispatch({ type: 'flipTicket' })} disabled={depth > 0}>券を裏返す</button></>}</div></section>;
}
