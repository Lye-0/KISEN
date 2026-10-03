import { useId } from 'react';
import { encounterFor, encounterCamera, markerPosition } from './journeyEncounterGeometry';
import { railLines, sites } from './routeGeometry';
import { SurveyPost } from './SurveyPost';
import type { Node, Side } from './model';
import type { Vec3 } from './geometry';

const places: Record<string, string> = { A: '踏切', B: '給水槽', C: '保守小屋', D: '鉄塔', E: '分岐橋', F: '坑口' };
export function journeyApproach(node: Node, incoming: string) {
    // The E–F connection is still a separate observation puzzle.
    return node === 'E' && incoming === 'F' ? '西側の線から' : `${places[incoming] ?? incoming}側の線から`;
}
/** A survey sketch kept with the photographs. It supplies the camera and track context
 * missing from a cropped photograph; it does not select a post or show a ticket answer. */
export function JourneyPlan({ node, side, incoming, frame }: { node: Node; side: Side; incoming: string; frame?: number | null }) {
    const id = useId().replaceAll(':', ''), e = encounterFor(node, side, incoming);
    if (!e) return null;
    const a = sites[node], b = sites[incoming as keyof typeof sites];
    const length = Math.hypot(a.x - b.x, a.y - b.y), dx = (a.x - b.x) / length, dy = (a.y - b.y) / length;
    const local = (p: Vec3) => ({ x: (p[0] - a.x) * dy - (p[1] - a.y) * dx, y: -(p[0] - a.x) * dx - (p[1] - a.y) * dy });
    const posts = (['white', 'black'] as const).map(color => ({ color, ...local(markerPosition(e, color)) }));
    const cameras = ([0, 1] as const).map(f => local(encounterCamera(e, f).position));
    const max = Math.max(e.early + 4, ...posts.map(p => p.y + 5));
    const scale = 224 / (max + 5), map = (p: { x: number; y: number }) => ({ x: 350 + p.x * scale, y: 102 + (p.y + 5) * scale });
    const path = (p: Vec3) => { const q = map(local(p)); return `${q.x},${q.y}`; };
    const rails = Object.values(railLines).filter(line => line.includes(node));
    const nodeAt = map({ x: 0, y: 0 });
    return <svg className="rm-journey-plan" viewBox="0 0 700 400" role="img" aria-label={`${places[node]}の撮影位置の見取図。${journeyApproach(node, incoming)}進み、1から2へ移動。上が列車の前方。標柱と線路、二つの撮影位置を描いた図。`}>
        <defs><clipPath id={id}><rect x="180" y="78" width="340" height="254"/></clipPath></defs>
        <image href="/assets/remake/parts/photo-back.webp" width="700" height="400" preserveAspectRatio="none"/>
        <g fontFamily="serif" fill="#514d3d">
            <text x="24" y="38" fontSize="28">撮影手帖　／　{places[node]}</text>
            <text x="24" y="68" fontSize="26">{journeyApproach(node, incoming)}　・　前方窓の連写</text>
            <text x="24" y="364" fontSize="26">1・2：撮影位置　　矢印：進行方向</text>
            <text x="24" y="391" fontSize="26">扇形：写真に写る方向　　縮尺不同</text>
        </g>
        <g clipPath={`url(#${id})`}>
            {([0, 1] as const).map(f => {
                const c = encounterCamera(e, f), l = Math.hypot(c.target[0] - c.position[0], c.target[1] - c.position[1]);
                const fx = (c.target[0] - c.position[0]) / l, fy = (c.target[1] - c.position[1]) / l;
                const rays = [76, 1672].map(px => { const spread = (px - 836) / c.focal; return path([c.position[0] + fx * 34 + fy * spread * 34, c.position[1] + fy * 34 - fx * spread * 34, 0]); });
                return <polygon key={f} points={[path(c.position), ...rays].join(' ')} fill="#666b51" fillOpacity=".025" stroke="#797e64" strokeOpacity=".6" strokeWidth="1.5" strokeDasharray={f ? '5 4' : undefined}/>;
            })}
            <g fill="none" stroke="#716c57" strokeWidth="7" strokeLinejoin="round">{rails.map((line, i) => <polyline key={i} points={line.map(n => { const s = sites[n]; return path([s.x, s.y, s.z]); }).join(' ')}/>)}</g>
            <g fill="none" stroke="#d8cdb1" strokeWidth="2" strokeLinejoin="round">{rails.map((line, i) => <polyline key={i} points={line.map(n => { const s = sites[n]; return path([s.x, s.y, s.z]); }).join(' ')}/>)}</g>
            <circle cx={nodeAt.x} cy={nodeAt.y} r="6" fill="#565747"/>
            {cameras.map((c, i) => { const p = map(c), width = scale * 3.2, height = scale * 3.4; return <g key={i} opacity={frame == null || frame === i ? 1 : .55}>
                <path d={`M${p.x} ${p.y + height}V${p.y}H${p.x + width}V${p.y + height}Z`} fill="#ded5bb" stroke="#454c42" strokeWidth="2"/>
                <path d={`M${p.x + 3} ${p.y + 1}H${p.x + width - 3}`} stroke="#454c42" strokeWidth="3"/>
                <circle cx={p.x} cy={p.y} r="4" fill="#454c42"/>
                <path d={`M${p.x + width + 14} ${p.y + 7}V${p.y - 19}M${p.x + width + 8} ${p.y - 11}L${p.x + width + 14} ${p.y - 19}L${p.x + width + 20} ${p.y - 11}`} fill="none" stroke="#454c42" strokeWidth="2"/>
                <text x={p.x - 12} y={p.y + 8} textAnchor="end" fontFamily="serif" fontSize="27" fill="#454c42">{i + 1}</text>
            </g>; })}
        </g>
        {posts.map((post, i) => { const p = map(post), x = i === 0 ? 95 : 605, y = 147;
            return <g key={post.color}>
                <path d={`M${x + (i === 0 ? 22 : -22)} ${y + 43}L${p.x} ${p.y}`} fill="none" stroke="#76715a" strokeWidth="1.5"/>
                <circle cx={p.x} cy={p.y} r="5" fill={post.color === 'white' ? '#e3d9be' : '#4c4d41'} stroke="#555344" strokeWidth="2"/>
                <SurveyPost bands={post.color === 'white' ? 1 : 2} x={x} y={y}/>
            </g>;
        })}
    </svg>;
}
