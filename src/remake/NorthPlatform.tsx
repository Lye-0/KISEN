import { useId, useState } from 'react';
import { Photo, Touch } from './Photo';
import { Surface } from './Surface';
import { planeMatrix } from './plane';
import { ShutterImage } from './Shutter';
import { platformPoint, platformPolygon, carriageSideY, lampRowY } from './platformGeometry';
import { illuminatedPorts, mounts, planks, services, stopAt, doorCenters, boardingGeometry } from './stopping';
import { validTicket, trace } from './model';
import type { Action, State, Item } from './model';
import type { Focus } from './World';
function Carriage({ s }: {
    s: State;
}) {
    if (s.train.position === 'absent' || s.train.position === 'departed')
        return null;
    const car = services.find(c => c.id === s.train.service)!;
    const target = stopAt(s.train.service, s.signals, s.locations.hood === 'signal', trace(s.route).end === 'O').firstDoor ?? 7;
    const progress = s.train.progress ?? 0;
    const first = s.train.position === 'stopped' ? s.train.firstDoor! : s.train.position === 'approaching' ? target - 28 * (1 - progress) ** 2 : (s.train.position === 'leaving' ? s.train.firstDoor! : target) + 28 * progress;
    // Both boarding doors keep their physical separation inside a longer carriage.
    // A second carriage is coupled at its west end.
    const longGap = car.gap === 6;
    const doorPixel = longGap ? 1561 : 1540;
    const pxPerMetre = longGap ? (1561 - 687) / 6 : (1540 - 813) / 4;
    const westEnd = first + (doorPixel - 2172) / pxPerMetre;
    const z = (y: number) => (longGap ? 493 - y : 523 - y) * 2.05 / (longGap ? 245 : 280) + .04;
    const projectPiece = (a: number, b: number, xa: number, xb: number, image: string, shade: number, key: string) => {
        const quad = [[xa, carriageSideY, z(0)], [xb, carriageSideY, z(0)], [xb, carriageSideY, z(724)], [xa, carriageSideY, z(724)]].map(([x, y, z]) => {
            const p = platformPoint(x, y, z);
            return [p.x, p.y] as [
                number,
                number
            ];
        }) as [
            [
                number,
                number
            ],
            [
                number,
                number
            ],
            [
                number,
                number
            ],
            [
                number,
                number
            ]
        ];
        return <div key={key} style={{ position: 'absolute', width: b - a, height: 724, transformOrigin: '0 0', transform: 'matrix3d(' + planeMatrix(b - a, 724, quad).join(',') + ')', overflow: 'hidden', filter: `brightness(${shade})` }}><img src={image} style={{ position: 'absolute', left: -a, width: 2172, height: 724, maxWidth: 'none' }} alt=""/></div>;
    };
    const closed = '/assets/remake/parts/' + (longGap ? 'return-car-gap6-closed' : 'return-car-closed') + '.png';
    const current = !longGap && s.train.position === 'stopped' ? '/assets/remake/parts/return-car.png' : closed;
    return <Surface>
        {projectPiece(0, 750, westEnd + .3, westEnd + .3 - 750 / pxPerMetre, closed, .58, 'coupled-car')}
        {projectPiece(0, 2172, first + doorPixel / pxPerMetre, westEnd, current, .64, 'board-car')}
    </Surface>;
}
export function NorthPlatform({ s, dispatch, inspect, selected, say }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: Focus) => void;
    selected: Item | null;
    say: (m: string) => void;
}) {
    const id = useId().replace(/:/g, ''), [detail, setDetail] = useState(false), [boardIndex, setBoardIndex] = useState(0);
    const center = platformPoint(boardIndex === 0 ? 7 : 11, carriageSideY);
    const visible = (x: number) => !detail || Math.abs(platformPoint(x, carriageSideY).x - center.x) < 210;
    const light = illuminatedPorts(s.signals, s.locations.hood === 'signal');
    const lampIndex = selected === 'lamp' ? 0 : selected === 'spareLamp' ? 1 : null;
    return <div className="rm-north"><Photo src="/assets/remake/north/platform.webp" label="北ホームの二つの踏み板と停車灯の取付列" view={detail ? [center.x - 210, 400, 420, 365] : undefined}>
 <Carriage s={s}/><svg className="rm-object-overlay" viewBox="0 0 1672 941"><defs><clipPath id={id + 'front'}><rect x="0" y={platformPoint(7, 7).y} width="1672" height={941 - platformPoint(7, 7).y}/>{planks.map(([a, b]) => <polygon key={a} points={platformPolygon([[a, 6.22, .04], [b, 6.22, .04], [b, 7.1, .04], [a, 7.1, .04]])}/>)}</clipPath><radialGradient id={id + 'glow'}><stop stopColor="#fff1b7" stopOpacity=".75"/><stop offset="1" stopColor="#ddbc73" stopOpacity="0"/></radialGradient></defs>
 <image href="/assets/remake/north/platform.webp" width="1672" height="941" clipPath={'url(#' + id + 'front)'}/>
 {s.signals.mounts.map((mark, i) => { const p = mark === null ? { x: 1190 - i * 26, y: 754 } : platformPoint(mark, lampRowY); const d = `M1280,750 C1180,778 ${p.x + 150},${p.y + 55} ${p.x},${p.y}`; return <g key={'cable' + i}><path d={d} fill="none" stroke="#000" strokeOpacity=".55" strokeWidth="5" transform="translate(1 2)"/><path d={d} fill="none" stroke="#262c27" strokeWidth="2.5"/></g>; })}
 {s.signals.mounts.map((mark, i) => {
            if (mark === null)
                return null;
            const p = platformPoint(mark, lampRowY), top = platformPoint(mark, lampRowY, .48), h = p.y - top.y, w = h * 1024 / 1536;
            return <g key={i}><ellipse cx={p.x} cy={p.y} rx={w * .26} ry="3" fill="#020504" opacity=".65"/><image href="/assets/remake/parts/marker-lamp.png" x={p.x - w / 2} y={p.y - h * .97} width={w} height={h}/>{light[i] && <ellipse cx={p.x} cy={p.y - h * .53} rx={w * .29} ry={h * .19} fill={'url(#' + id + 'glow)'}/>}</g>;
        })}
 <svg x="1200" y="624" width="240" height="135" viewBox="0 0 1672 941"><defs><clipPath id={id + 'housing'}><path d="M195 115Q205 80 270 80H1400Q1467 80 1467 140V630Q1467 695 1400 695H1340V854H1460V941H200V854H325V695H265Q195 695 195 630Z"/></clipPath></defs><g clipPath={'url(#' + id + 'housing)'}><image href="/assets/remake/signal/housing.webp" width="1672" height="941"/><ShutterImage s={s}/></g></svg>
 </svg>
 {mounts.filter(visible).map(mark => {
            const p = platformPoint(mark, lampRowY), i = s.signals.mounts.indexOf(mark);
            return <Touch key={mark} name={i >= 0 ? '停車灯を持ち上げる' : `取付穴 ${mark}`} rect={[(p.x - 31) / 16.72, (p.y - (i >= 0 ? 60 : 18)) / 9.41, 62 / 16.72, (i >= 0 ? 80 : 40) / 9.41]} act={() => {
                    if (i >= 0)
                        dispatch({ type: 'signalMount', lamp: i as 0 | 1, mark: null });
                    else if (lampIndex !== null)
                        dispatch({ type: 'signalMount', lamp: lampIndex, mark });
                    else
                        say('丸い取付穴。');
                }}/>;
        })}
 {!detail && <Touch name="遮光器と呼出機" rect={[72, 65, 15, 17]} act={() => inspect('signal')}/>}
 {(s.train.position === 'stopped' ? doorCenters(s.train) : []).filter(visible).map((x, i) => {
            const p = platformPoint(x, carriageSideY, 1.1);
            return <Touch key={i} name="扉へ足を渡す" rect={[(p.x - 36) / 16.72, (p.y - 70) / 9.41, 72 / 16.72, 140 / 9.41]} act={() => {
                    if (!boardingGeometry(s.train, s.signals, s.locations.hood === 'signal'))
                        say('踏み板から扉へ、足を渡せない。');
                    else if (!validTicket(s, s.mounted) || s.values.readerClamp?.[0] !== 0) {
                        inspect('reader');
                        say('切符受けの押さえを確かめる。');
                    }
                    else
                        dispatch({ type: 'board' });
                }}/>;
        })}
 </Photo><div className="rm-document-controls"><button onClick={() => setDetail(!detail)}>{detail ? 'ホーム全体を見る' : '踏み板を近くで見る'}</button>{detail && <button onClick={() => setBoardIndex(1 - boardIndex)}>もう一方の踏み板</button>}{s.train.position === 'stopped' && <button onClick={() => dispatch({ type: 'releaseTrain' })}>列車を送り出す</button>}</div></div>;
}
