import { useState } from 'react';
import { poles, towerCameras, tower } from './geometry';
const xy = (x: number, y: number) => [190 + x * 8, 285 - y * 8];
const titles = ['塔', '踏切', '坑口'];
function ObservationPoint({ x, y }: {
    x: number;
    y: number;
}) {
    const [px, py] = xy(x, y), angle = Math.atan2(285 - py, 190 - px) * 180 / Math.PI;
    const side = Math.abs(x) > Math.abs(y) ? x < 0 ? '西' : '東' : y > 0 ? '北' : '南';
    return <g><g transform={`translate(${px} ${py}) rotate(${angle})`}><circle r="7" fill="#e6ddc5"/><path d="M7-3L13-6V6L7 3"/></g><text x={px + (side === '西' ? -24 : side === '東' ? 14 : -8)} y={py + (side === '北' ? -17 : side === '南' ? 30 : 6)} fontSize="17">{side}</text></g>;
}
function North() {
    return <g transform="translate(330 62)"><path d="M0 35V0M-7 12L0 0L7 12"/><text x="0" y="-10" textAnchor="middle">北</text></g>;
}
function Site({ index }: {
    index: number;
}) {
    const viewpoints = index === 0 ? [towerCameras.west.position, towerCameras.east.position, [0, 18], [0, -18]] : [[-18, 0], [18, 0], [0, 18], [0, -18]];
    return <g stroke="#515747" fill="none" strokeWidth="1.8" fontFamily="serif">
    <text x="35" y="52" fontSize="26">{titles[index]}</text><North />
    {index === 0 ? <>
      <path d={tower.corners.map(([x, y], i) => `${i ? 'L' : 'M'}${xy(x, y).join(' ')}`).join('') + 'Z'}/>
      <path d="M180 275L200 295M200 275L180 295"/>
      <g transform={`translate(${xy(tower.ladderX, tower.ladderY)[0] - 6} 277)`}><path d="M0 0V25M5 0V25M0 5H5M0 12H5M0 19H5"/></g>
      {poles.map(p => { const [x, y] = xy(p.base[0], p.base[1]); return <g key={p.id}><circle cx={x} cy={y} r="6" fill={p.scar === null ? '#57513f' : '#e7dfc8'}/>{p.scar !== null && <path d={`M${x - 6} ${y - 2}l12 4`} stroke="#57513f"/>}</g>; })}
      <path d="M168 285L128 253H88"/><text x="43" y="245" fontSize="18">梯子</text>
      <path d="M142 318L119 368H73"/><text x="38" y="389" fontSize="18">白い塗跡</text>
      <path d="M238 318L262 368H309"/><text x="269" y="389" fontSize="18">木柱</text>
      <path d="M30 459Q190 495 355 459" strokeDasharray="4 5" strokeWidth="1"/>
    </> : index === 1 ? <>
      <path d="M174 80V462M206 80V462M30 279H350M30 291H350"/>
      {Array.from({ length: 20 }, (_, i) => 34 + i * 16).filter(x => x < 170 || x > 210).map(x => <path key={x} d={`M${x} 275v20`} strokeWidth="1"/>)}
      <path d="M132 307L169 305L172 357H131Z" fill="#708b9744"/><text x="67" y="382" fontSize="18">青い小屋</text>
      <path d="M224 304V451M232 304V451M224 320H232M224 343H232M224 366H232M224 389H232M224 412H232M224 435H232"/>
      <text x="250" y="364" fontSize="18">石垣</text>
    </> : <>
      <path d="M190 220H268V350H190M190 220V264M190 305V350M30 279H260M30 291H260"/>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${35 + i * 16} 274v22`} strokeWidth="1"/>)}
      <rect x="121" y="217" width="51" height="30"/><path d="M121 217L146 207L172 217"/><text x="77" y="204" fontSize="18">小屋</text>
      <path d="M187 323h-11v12h-11v12h-11v12" strokeWidth="4"/><text x="102" y="388" fontSize="18">控え壁</text>
    </>}
    {viewpoints.map((p, i) => <ObservationPoint key={i} x={p[0]} y={p[1]}/>)}
    <text x="35" y="527" fontSize="17">○　点検位置</text>
  </g>;
}
export function MaintenanceMap({ embedded = false }: {
    embedded?: boolean;
}) {
    const [detail, setDetail] = useState<number | null>(null);
    return <section className={'rm-maintenance-map' + (embedded ? ' rm-map-embedded' : '')}>
    <div className="rm-map-sheet"><svg viewBox={detail === null ? '0 0 1200 760' : `${detail * 400} 105 400 560`} role="group" aria-label="北を上にした保守略図。塔、踏切、坑口と点検位置">
      <image href="/assets/remake/parts/photo-back.webp" width="1200" height="760" preserveAspectRatio="none"/>
      <g fill="#454b3e" fontFamily="serif"><text x="55" y="65" fontSize="30">沿線保守　見取図</text><text x="55" y="720" fontSize="18">位置照合用　／　縮尺不同</text><text x="1000" y="720" fontSize="18">保線係　控</text></g>
      <path d="M40 88H1160M40 679H1160M400 120V650M800 120V650" stroke="#73745a" strokeWidth="1" fill="none"/>
      {titles.map((title, i) => <g key={title} aria-hidden={detail !== null && detail !== i} transform={`translate(${i * 400} 105)`} className={detail === null ? 'rm-map-inset' : undefined} role={detail === null ? 'button' : undefined} tabIndex={detail === null ? 0 : undefined} aria-label={detail === null ? title + 'の図を近くで見る' : undefined} onClick={() => {
                if (detail === null)
                    setDetail(i);
            }} onKeyDown={e => {
                if (detail === null && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setDetail(i);
                }
            }}>
        <Site index={i}/>{detail === null && <rect x="15" y="10" width="370" height="540" fill="transparent"/>}
      </g>)}
    </svg></div>
    <div className="rm-map-controls">{detail !== null && <button aria-label="前の図" onClick={() => setDetail((detail + 2) % 3)}>〈</button>}<button onClick={() => setDetail(detail === null ? 0 : null)}>{detail === null ? '拡大する' : '全体を見る'}</button>{detail !== null && <button aria-label="次の図" onClick={() => setDetail((detail + 1) % 3)}>〉</button>}</div>
  </section>;
}
