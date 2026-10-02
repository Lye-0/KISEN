import { FieldMarkers } from './FieldMarkers';
import { useId, useMemo } from 'react';
import { Photo, Touch } from './Photo';
import { BellImage, useBell } from './Bell';
import { beamAt, beamHalfAngle, initialLampAim, opticalBarriers, opticalCameras, fieldMarkers } from './lampOptics';
import { project, clipCameraPolygon } from './geometry';
import type { Vec3 } from './geometry';
import { newState } from './model';
import type { Action, Item, State } from './model';
function BeamMask({ braced, aim }: {
    braced: boolean;
    aim: number[];
}) {
    const cells = useMemo(() => {
        const out: {
            points: string;
            opacity: number;
        }[] = [];
        const add = (vertices: Vec3[], sample: Vec3) => {
            const hit = beamAt(sample, braced, aim);
            if (!hit.lit)
                return;
            const points = clipCameraPolygon(vertices, opticalCameras.field).map(p => { const v = project(p, opticalCameras.field); return v.x + ',' + v.y; }).join(' ');
            if (points)
                out.push({ points, opacity: Math.min(1, (beamHalfAngle - hit.angle) / beamHalfAngle * 4) });
        };
        for (let x = -65; x < 22; x += 1.5)
            for (let y = -2; y < 46; y += 1.5)
                add([[x, y, .04], [x + 1.5, y, .04], [x + 1.5, y + 1.5, .04], [x, y + 1.5, .04]], [x + .75, y + .75, .04]);
        for (const wall of opticalBarriers)
            for (let x = wall.minX; x < wall.maxX; x += .2)
                for (let z = wall.low; z < wall.high; z += .08) {
                    const xx = Math.min(x + .2, wall.maxX), zz = Math.min(z + .08, wall.high);
                    add([[x, wall.y - .001, z], [xx, wall.y - .001, z], [xx, wall.y - .001, zz], [x, wall.y - .001, zz]], [(x + xx) / 2, wall.y - .002, (z + zz) / 2]);
                }
        for (const m of fieldMarkers)
            for (let z = 0; z < 2.1; z += .15) {
                const [x, y] = m.position;
                add([[x - .25, y - .1, z], [x + .25, y - .1, z], [x + .25, y - .1, z + .15], [x - .25, y - .1, z + .15]], [x, y - .1, z + .075]);
            }
        return out;
    }, [braced, aim[0], aim[1]]);
    return <>{cells.map((p, i) => <polygon key={i} points={p.points} fill="white" opacity={p.opacity}/>)}</>;
}
export function LampWindow({ s, dispatch, selected, say, inspect, field = false, readOnly = false }: {
    s: State;
    dispatch: (a: Action) => void;
    selected: Item | null;
    say: (m: string) => void;
    inspect: (f: 'lampWindow' | 'bell') => void;
    field?: boolean;
    readOnly?: boolean;
}) {
    const id = useId().replaceAll(':', ''), aim = s.values.lightAim ?? initialLampAim, braced = s.locations.support === 'lightStand', mounted = s.locations.lamp === 'lightStand' ? 'lamp' : s.locations.spareLamp === 'lightStand' ? 'spareLamp' : null;
    const bell = useBell(s, false), source = '/assets/remake/lamp/' + (field ? 'field' : 'window') + '.webp';
    const aimBy = (dx: number, dy: number) => { dispatch({ type: 'lightAim', aim: [Math.max(-9, Math.min(9, aim[0] + dx)), Math.max(-9, Math.min(9, aim[1] + dy))] }); say(dx ? (dx > 0 ? '灯具を左へ振った。' : '灯具を右へ振った。') : dy > 0 ? '灯具を上へ向けた。' : '灯具を下へ向けた。'); };
    const fit = () => {
        if (mounted) {
            dispatch({ type: 'lightMount', item: mounted });
            return;
        }
        if (selected === 'support') {
            dispatch({ type: 'lightBrace' });
            return;
        }
        if (selected === 'lamp' || selected === 'spareLamp')
            dispatch({ type: 'lightMount', item: selected });
        else
            say('手元の道具を選んで、受け口へ合わせられる。');
    };
    const y = braced ? 533 : 720;
    return <section className="rm-lamp-window"><Photo src={source} zoomable={field} limitZoomToSource zoomButtonOnly zoomOrigin="61% 45%" label={field ? '西の窓から見た線路と二つの標柱' : '小屋の西の窓と灯具の受け口'}><svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs><filter id={id + 'soft'}><feGaussianBlur stdDeviation="5"/></filter><mask id={id + 'beam'}><g filter={`url(#${id}soft)`}>{mounted && field && <BeamMask braced={braced} aim={aim}/>}</g></mask><radialGradient id={id + 'glow'}><stop stopColor="#fff4ba"/><stop offset=".28" stopColor="#ecd88e" stopOpacity=".9"/><stop offset="1" stopColor="#dbb35f" stopOpacity="0"/></radialGradient></defs>{field ? <><g style={{ filter: 'brightness(.14)' }}><image href={source} width="1672" height="941"/><FieldMarkers /></g><g mask={'url(#' + id + 'beam)'}><image style={{ filter: 'brightness(1.5)' }} href={source} width="1672" height="941"/><rect width="1672" height="941" fill="#ffe6a6" opacity=".32"/><FieldMarkers /></g>{bell.reply && <ellipse cx="1342" cy="423" rx="80" ry="75" fill={`url(#${id}glow)`}/>}</> : <><FieldMarkers view="window" braced={braced} aim={aim} mounted={Boolean(mounted)}/>{braced && <image href="/assets/remake/parts/folding-support.png" x="977" y="665" width="70" height="176" preserveAspectRatio="none"/>}{mounted && <g transform={`rotate(${aim[1] * 1.2} 1013 ${y})`}><image href="/assets/remake/parts/lamp-rear.png" x="936" y={y - 85} width="161" height="242"/><ellipse cx="950" cy={y} rx="12" ry="22" fill={`url(#${id}glow)`}/><g transform={`rotate(${aim[0] * -5} 1013 ${y + 124})`} stroke="#b7ac8b" strokeWidth="3"><path d={`M1013 ${y + 137}V${y + 97}`}/><path d={`M1008 ${y + 103}L1013 ${y + 97}L1018 ${y + 103}`}/></g></g>}{bell.reply && <ellipse cx="929" cy="464" rx="14" ry="13" fill={`url(#${id}glow)`}/>}<svg x="1195" y="510" width="190" height="201" viewBox="215 45 1365 850" preserveAspectRatio="none"><BellImage channel={bell.channel} reply={bell.reply}/></svg></>}</svg>{!field && <><Touch name="西の窓から線路をよく見る" rect={[25, 35, 33, 28]} act={() => inspect('lampWindow')}/><Touch name={mounted ? '灯具を外す' : '受け口に道具を取り付ける'} rect={[55, (y - 85) / 9.41, 12, 26]} act={fit} drag={(dx, dy) => mounted && aimBy(-Math.sign(dx) * .5, -Math.sign(dy) * .5)}/>{braced && !mounted && <Touch name="受け口の支え金具を取る" rect={[58, 70, 8, 20]} act={() => dispatch({ type: 'lightBrace' })}/>}<Touch name="壁のベルと二つの接点" rect={[73, 53, 11, 24]} act={() => inspect('bell')}/><Touch name="窓辺のベルを押す" rect={[79, 65, 5, 8]} act={() => {
                if (bell.inputs.length >= 32) {
                    inspect('bell');
                    return;
                }
                bell.ring();
                dispatch({ type: 'bellStrike', time: Date.now() });
            }}/></>}</Photo>{mounted && !readOnly && <div className="rm-lamp-controls rm-axis-controls">{['左右', '上下'].map((label, axis) => <label key={label}><span>{label}</span><input type="range" min="-9" max="9" step=".5" aria-label={'灯具の' + label + 'の向き'} value={-aim[axis]} onChange={e => { const delta = -Number(e.target.value) - aim[axis]; aimBy(axis === 0 ? delta : 0, axis === 1 ? delta : 0); }}/><span aria-hidden="true">{axis ? '上 ↔ 下' : '左 ↔ 右'}</span></label>)}</div>}{field && !readOnly && <button onClick={() => { dispatch({ type: 'record', id: 'lamp-observation-' + Number(braced) + '-' + aim.join(','), values: [Number(braced), ...aim, Number(Boolean(mounted))] }); say('窓から見た状態を記録した。'); }}>記録する</button>}</section>;
}
export function LampNote({ values }: {
    values: number[];
}) { const s = newState(); s.locations.support = values[0] ? 'lightStand' : 'inventory'; s.locations.lamp = values[3] ? 'lightStand' : 'inventory'; s.values.lightAim = values.slice(1, 3); return <LampWindow s={s} dispatch={() => { }} selected={null} say={() => { }} inspect={() => { }} field readOnly/>; }
