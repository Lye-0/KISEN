import { useId } from 'react';
import { Photo } from './Photo';
import { crossingCameras, northRoof } from './crossingGeometry';
import { project, clipCameraPolygon } from './geometry';
import { glassPosts } from './glassGeometry';
import type { Action } from './model';
export type CrossingViewName = 'bridge' | 'window' | 'north';
export const crossingViewNames: CrossingViewName[] = ['bridge', 'window', 'north'];
const titles = { bridge: '橋上から見た屋根と旧線', window: '踊り場の窓から見た橋脚と地上線', north: '北ホームから見た旧線の終端と地上線' };
export function CrossingPhoto({ view }: {
    view: CrossingViewName;
}) {
    const id = useId().replaceAll(':', ''), c = crossingCameras[view], r = northRoof;
    const roof = clipCameraPolygon([[r.west, r.south, r.top], [r.east, r.south, r.top], [r.east, r.north, r.top], [r.west, r.north, r.top]], c).map(p => { const q = project(p, c); return q.x + ',' + q.y; }).join(' ');
    return <Photo src={'/assets/remake/crossing/' + view + '.webp'} label={titles[view]} zoomable limitZoomToSource><svg className="rm-object-overlay" viewBox="0 0 1672 941" aria-hidden="true"><defs><mask id={id}><rect width="1672" height="941" fill="white"/>{view === 'bridge' && <polygon points={roof} fill="black"/>}</mask></defs><g mask={'url(#' + id + ')'}>{glassPosts.slice(0, 2).map(p => { const [x, y] = p.position, base = project([x, y, 0], c), top = project([x, y, 2.1], c), h = base.y - top.y, w = h * .4 / 2.1; return <g key={p.id} style={{ filter: 'brightness(.46)' }}><svg x={base.x - w / 2} y={top.y} width={w} height={h} viewBox={p.color === 'white' ? '235 18 213 1152' : '873 18 212 1152'} preserveAspectRatio="none"><image href="/assets/remake/parts/field-posts.png" width="1312" height="1199"/></svg>{(p.color === 'white' ? [1.4] : [1.05, 1.4]).map(z => <rect key={z} x={base.x - w * .46} y={project([x, y, z], c).y - h * .055 / 2.1 / 2} width={w * .89} height={h * .055 / 2.1} fill={p.color === 'white' ? '#17211e' : '#c4c1b1'}/>)}</g>; })}</g></svg></Photo>;
}
export function CrossingView({ view, dispatch, say }: {
    view: CrossingViewName;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) { return <section className="rm-crossing-view"><CrossingPhoto view={view}/><div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'crossing-observation-' + view, values: [crossingViewNames.indexOf(view)] }); say('線路の景色を記録した。'); }}>記録する</button></div></section>; }
export function CrossingNote({ values }: {
    values: number[];
}) { return <div className="rm-crossing-note"><CrossingPhoto view={crossingViewNames[values[0]]}/></div>; }
