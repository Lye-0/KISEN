import { project } from './geometry';
import { fieldMarkers, opticalCameras, beamAt } from './lampOptics';
export function FieldMarkers({ view = 'field', braced = false, aim = [0, 0], mounted = false }: {
    view?: 'field' | 'window';
    braced?: boolean;
    aim?: number[];
    mounted?: boolean;
}) {
    const camera = opticalCameras[view];
    return <>{fieldMarkers.map(m => {
            const [x, y] = m.position, base = project([x, y, 0], camera), top = project([x, y, 2.1], camera), h = base.y - top.y, w = h * .4 / 2.1;
            const rings = m.color === 'white' ? [1.4] : [1.05, 1.4], lit = mounted && beamAt([x, y, 1.25], braced, aim).lit;
            return <g key={m.id} style={{ filter: 'brightness(' + (view === 'field' ? .75 : lit ? .75 : .13) + ')' }}><svg x={base.x - w / 2} y={top.y} width={w} height={h} viewBox={m.color === 'white' ? '235 18 213 1152' : '873 18 212 1152'} preserveAspectRatio="none"><image href="./assets/remake/parts/field-posts.png" width="1312" height="1199"/></svg>{rings.map(z => <rect key={z} x={base.x - w * .46} y={project([x, y, z], camera).y - h * .055 / 2.1 / 2} width={w * .89} height={h * .055 / 2.1} fill={m.color === 'white' ? '#17211e' : '#c4c1b1'} opacity=".88"/>)}</g>;
        })}</>;
}
