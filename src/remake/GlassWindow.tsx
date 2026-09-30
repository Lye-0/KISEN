import { useId } from 'react';
import { Photo, Touch } from './Photo';
import { glass, glassCameras, glassPosts, reflect, projectedPost, glassExposure } from './glassGeometry';
import { project, clipCameraPolygon, tower } from './geometry';
import type { Vec3 } from './geometry';
import { owns } from './model';
import { railLines, sites } from './routeGeometry';
import type { Action, Item, State } from './model';
function GlassReflection({ view }: {
    view: number;
}) {
    const c = glassCameras[view], segments: [
        Vec3,
        Vec3
    ][] = [];
    const local = (x: number, y: number, z: number): Vec3 => [-54 - y, 8 + x, z];
    const corners = tower.corners.flatMap(([x, y]) => [project(reflect(local(x, y, 0)), c), project(reflect(local(x, y, 12)), c)]);
    const x = Math.min(...corners.map(p => p.x)), y = Math.min(...corners.map(p => p.y)), w = Math.max(...corners.map(p => p.x)) - x, h = Math.max(...corners.map(p => p.y)) - y;
    const sleepers: [
        Vec3,
        Vec3
    ][] = [];
    for (const edge of ['F-D', 'B-D']) {
        const path = railLines[edge].map(n => sites[n]);
        for (let i = 1; i < path.length; i++) {
            let a: Vec3 = [path[i - 1].x, path[i - 1].y, 0], b: Vec3 = [path[i].x, path[i].y, 0];
            const plane = glass.y - .1;
            if (a[1] > plane && b[1] > plane)
                continue;
            if (a[1] > plane) {
                const t = (plane - b[1]) / (a[1] - b[1]);
                a = a.map((v, k) => b[k] + t * (v - b[k])) as Vec3;
            }
            if (b[1] > plane) {
                const t = (plane - a[1]) / (b[1] - a[1]);
                b = b.map((v, k) => a[k] + t * (v - a[k])) as Vec3;
            }
            const length = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / length, ny = (b[0] - a[0]) / length;
            for (const side of [-.62, .62])
                segments.push([[a[0] + nx * side, a[1] + ny * side, 0], [b[0] + nx * side, b[1] + ny * side, 0]]);
            for (let n = 0; n < length; n += 1.2) {
                const x = a[0] + (b[0] - a[0]) * n / length, y = a[1] + (b[1] - a[1]) * n / length;
                sleepers.push([[x - nx, y - ny, 0], [x + nx, y + ny, 0]]);
            }
        }
    }
    const path = segments.map(([a, b]) => [project(reflect(a), c), project(reflect(b), c)]).filter(v => v.every(p => p.depth > .1)).map(q => `M${q[0].x},${q[0].y}L${q[1].x},${q[1].y}`).join('');
    const ties = sleepers.map(([a, b]) => [project(reflect(a), c), project(reflect(b), c)]).filter(v => v.every(p => p.depth > .1)).map(q => `M${q[0].x},${q[0].y}L${q[1].x},${q[1].y}`).join('');
    return <><image href="/assets/remake/parts/glass-tower.png" x={x} y={y} width={w} height={h} preserveAspectRatio="none"/><path d={ties} stroke="#82755a" strokeWidth="3" fill="none" opacity=".3"/><path d={path} stroke="#a3ac9e" strokeWidth="2.4" fill="none" opacity=".55"/></>;
}
export function GlassView({ view, lit, children }: {
    view: number;
    lit: boolean;
    children?: React.ReactNode;
}) {
    const id = useId().replaceAll(':', ''), c = glassCameras[view], ex = glassExposure(lit);
    const polygon = clipCameraPolygon([[glass.minX, glass.y, glass.sill], [glass.maxX, glass.y, glass.sill], [glass.maxX, glass.y, glass.head], [glass.minX, glass.y, glass.head]], c).map(p => { const q = project(p, c); return q.x + ',' + q.y; }).join(' ');
    const source = `/assets/remake/tunnel/glass-${view}.webp`, lamp = view === 0 ? [703, 798] : [716, 756];
    return <Photo src={source} label="側道のガラスと、その向こうのトンネル・線路・標柱" zoomable limitZoomToSource zoomButtonOnly zoomOrigin="65% 52%">
  <svg className="rm-object-overlay" viewBox="0 0 1672 941" aria-hidden="true"><defs><clipPath id={id}><polygon points={polygon}/></clipPath></defs>
   <image href={source} width="1672" height="941" style={{ filter: `brightness(${lit ? .85 : .37})` }}/>
   <g clipPath={`url(#${id})`}>
    <g opacity={ex.reflected}><GlassReflection view={view}/></g>
    {glassPosts.map((p, i) => {
            const q = projectedPost(i, view), h = q.base.y - q.top.y, w = h * .4 / 2.1;
            return <g key={p.id} opacity={p.reflected ? ex.reflected : 1} style={{ filter: p.reflected ? undefined : `brightness(${ex.transmitted})` }}>
     <svg x={q.base.x - w / 2} y={q.top.y} width={w} height={h} viewBox={p.color === 'white' ? '235 18 213 1152' : '873 18 212 1152'} preserveAspectRatio="none"><image href="/assets/remake/parts/field-posts.png" width="1312" height="1199"/></svg>
     {(p.color === 'white' ? [1.4] : [1.05, 1.4]).map(z => <rect key={z} x={q.base.x - w * .46} y={project([q.at[0], q.at[1], z], c).y - h * .055 / 2.1 / 2} width={w * .89} height={h * .055 / 2.1} fill={p.color === 'white' ? '#17211e' : '#c4c1b1'}/>)}</g>;
        })}
   </g>
   {lit && <image href="/assets/remake/parts/lamp-rear.png" x={lamp[0] - 71} y={lamp[1] - 212} width="142" height="235" style={{ filter: 'brightness(.65)' }}/>}
  </svg>{children}
 </Photo>;
}
export function GlassWindow({ s, dispatch, selected, say }: {
    s: State;
    dispatch: (a: Action) => void;
    selected: Item | null;
    say: (m: string) => void;
}) {
    const mounted = s.locations.lamp === 'glassStand' ? 'lamp' : s.locations.spareLamp === 'glassStand' ? 'spareLamp' : null;
    const fit = () => {
        if (mounted) {
            dispatch({ type: 'glassLamp', item: mounted });
            return;
        }
        const item = selected === 'lamp' || selected === 'spareLamp' ? selected : owns(s, 'spareLamp') ? 'spareLamp' : owns(s, 'lamp') ? 'lamp' : null;
        if (item)
            dispatch({ type: 'glassLamp', item });
        else
            say('灯具の軸が入る受け口がある。');
    };
    return <section className="rm-glass-window"><GlassView view={s.camera} lit={Boolean(mounted)}><Touch name={mounted ? '観測窓の灯具を外す' : '観測窓の受け口'} rect={s.camera === 0 ? [37, 63, 11, 31] : [38, 58, 11, 33]} act={fit}/></GlassView><div className="rm-document-controls"><button onClick={fit}>{mounted ? '灯具を外す' : '灯具を取り付ける'}</button><button onClick={() => { dispatch({ type: 'record', id: 'glass-observation-' + s.camera + '-' + Number(Boolean(mounted)), values: [s.camera, Number(Boolean(mounted))] }); say('窓越しの景色を記録した。'); }}>記録する</button><button onClick={() => dispatch({ type: 'move', room: 'north', camera: 1 })}>側道を戻る</button></div></section>;
}
export function GlassNote({ values }: {
    values: number[];
}) { return <div className="rm-glass-note"><GlassView view={values[0]} lit={values[1] === 1}/></div>; }
