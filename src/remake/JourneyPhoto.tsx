import { Photo } from './Photo';
import { encounterFor, encounterCamera, markerPosition } from './journeyEncounterGeometry';
import { project } from './geometry';
import type { Node, Side } from './model';
export function JourneyPhoto({ node, side, incoming, frame, label }: {
    node: Node;
    side: Side;
    incoming: string;
    frame: 0 | 1;
    label: string;
}) {
    const e = encounterFor(node, side, incoming);
    if (!e)
        return null;
    const camera = encounterCamera(e, frame);
    return <Photo src={'/assets/remake/journeys/' + e.id + '-' + frame + '.webp'} label={label} zoomable limitZoomToSource>
 <svg className="rm-object-overlay" viewBox="0 0 1672 941" aria-hidden="true">{(['white', 'black'] as const).slice().sort((a, b) => project(markerPosition(e, b), camera).depth - project(markerPosition(e, a), camera).depth).map(color => {
            const p = markerPosition(e, color), base = project(p, camera), top = project([p[0], p[1], 2.1], camera);
            if (base.depth <= .2 || top.depth <= .2)
                return null;
            const h = base.y - top.y, w = h * .4 / 2.1;
            if (base.x + w < 0 || base.x - w > 1672)
                return null;
            return <g key={color} style={{ filter: 'brightness(.66)' }}><ellipse cx={base.x} cy={base.y} rx={w * .75} ry={w * .18} fill="#000" opacity=".6"/><svg x={base.x - w / 2} y={top.y} width={w} height={h} viewBox={color === 'white' ? '235 18 213 1152' : '873 18 212 1152'} preserveAspectRatio="none"><image href="/assets/remake/parts/field-posts.png" width="1312" height="1199"/></svg>{(color === 'white' ? [1.4] : [1.05, 1.4]).map(z => <rect key={z} x={base.x - w * .46} y={project([p[0], p[1], z], camera).y - h * .055 / 2.1 / 2} width={w * .89} height={h * .055 / 2.1} fill={color === 'white' ? '#17211e' : '#c4c1b1'}/>)}</g>;
        })}</svg>
 </Photo>;
}
