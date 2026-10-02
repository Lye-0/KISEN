import { useSceneBack } from './SceneBack';
import { useState } from 'react';
import { Touch } from './Photo';
import { Poster } from './PosterFragments';
import type { Action, State } from './model';
const layers = [{ date: '8月12日', title: '線路修繕', route: '分岐橋　―　トンネル', x: 455, y: 200, w: 485, h: 590 }, { date: '9月1日', title: '旅客取扱', route: '給水槽　―　分岐橋', x: 485, y: 224, w: 465, h: 565 }, { date: '9月8日', title: '貨物留置', route: '給水槽　―　鉄塔', x: 518, y: 252, w: 435, h: 535 }];
function Paper({ index, lifted = false }: {
    index: number;
    lifted?: boolean;
}) {
    const p = layers[index];
    return <g transform={`translate(${p.x} ${p.y})`}>
 <path d={`M5 8L${p.w + 4} 4L${p.w + 8} ${lifted ? 94 : p.h + 7}L6 ${lifted ? 111 : p.h + 11}Z`} fill="#070909" opacity=".6"/>
 <g transform={lifted ? 'scale(1 .15)' : undefined}>
 <image href="/assets/remake/parts/photo-back.webp" width={p.w} height={p.h} preserveAspectRatio="none"/>
 <path d={`M0 0H${p.w}V${p.h - 9}L${p.w - 25} ${p.h - 14}L${p.w - 35} ${p.h}H0Z`} fill={index === 0 ? '#59452d' : index === 1 ? '#917952' : '#b19a70'} opacity=".19"/>
 <path d={`M16 37H${p.w - 17}M20 ${p.h - 106}H${p.w - 20}`} stroke="#796747" strokeWidth="2"/>
 <g visibility={lifted ? "hidden" : undefined} fill="#514331" fontFamily="Yu Mincho,serif" textAnchor="middle"><text x={p.w / 2} y="220" fontSize="34">{p.title}</text><text x={p.w / 2} y="280" fontSize="27">{p.route}</text><text x={p.w - 55} y={p.h - 57} fontSize="28" textAnchor="end">{p.date}</text></g>
 {index === 2 && !lifted && <circle cx={p.w / 2} cy="334" r="39" fill="none" stroke="#805946" strokeWidth="6" opacity=".8"/>}
 <path d="M4 30Q20 30 22 58L16 128" fill="none" stroke="#795333" strokeWidth="6" opacity=".46"/>
 </g>
 {lifted && <path d={`M0 82Q${p.w / 2} 115 ${p.w} 80L${p.w} 105Q${p.w / 2} 137 0 111Z`} fill="#b8a37e" stroke="#776447" strokeWidth="1"/>}
 <ellipse cx="14" cy="17" rx="8" ry="5" fill="#322e26"/><ellipse cx={p.w - 14} cy="15" rx="7" ry="5" fill="#322e26"/>
 </g>;
}
export function NoticeBoardSurface({ lift = [0, 0], papers = true, near = false }: {
    lift?: number[];
    papers?: boolean;
    near?: boolean;
}) { return <svg width="900" height="730" viewBox={near ? "440 190 540 650" : "386 140 900 730"} role="img" aria-label={`重なる告知。${layers[lift[0] === 1 ? (lift[1] === 1 ? 0 : 1) : 2].title}、${layers[lift[0] === 1 ? (lift[1] === 1 ? 0 : 1) : 2].date}、${layers[lift[0] === 1 ? (lift[1] === 1 ? 0 : 1) : 2].route}。右側に四枚の破れた紙。`}><image href="/assets/remake/forecourt/notice-board.webp" width="1672" height="941"/>{papers && <><g aria-hidden={lift[0] !== 1 || lift[1] !== 1}><Paper index={0}/></g><g aria-hidden={lift[0] !== 1 || lift[1] === 1}><Paper index={1} lifted={lift[1] === 1}/></g><g aria-hidden={lift[0] === 1}><Paper index={2} lifted={lift[0] === 1}/></g>{[0, 1, 2, 3].map(i => <svg key={i} x={1002 + i % 2 * 109} y={230 + Math.floor(i / 2) * 267} width="103" height="244" viewBox="0 0 240 360" preserveAspectRatio="none"><Poster index={i}/></svg>)}</>}</svg>; }
export function NoticeBoard({ s, dispatch, say, posters }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
    posters: () => void;
}) {
    const [near, setNear] = useState(false);
    useSceneBack(near, () => setNear(false));
    const rect = (x: number, y: number, w: number, h: number): [
        number,
        number,
        number,
        number
    ] => near ? [(x - 440) / 540 * 100, (y - 190) / 650 * 100, w / 540 * 100, h / 650 * 100] : [(x - 386) / 900 * 100, (y - 140) / 730 * 100, w / 900 * 100, h / 730 * 100];
    const lift = s.values.noticeLift ?? [0, 0], toggle = (i: number) => dispatch({ type: 'values', id: 'noticeLift', values: lift.map((v, k) => k === i ? 1 - v : v) });
    return <section className="rm-notice-board"><div className={"rm-notice-face" + (near ? " rm-notice-near" : "")}><NoticeBoardSurface lift={lift} near={near}/>{!near && <Touch name="紙を近くで見る" rect={rect(530, 440, 380, 240)} act={() => setNear(true)}/>}<Touch name={lift[0] ? '手前の紙を下ろす' : '手前の紙の端を持ち上げる'} rect={rect(518, lift[0] ? 329 : 725, 435, 75)} act={() => toggle(0)}/>{lift[0] === 1 && <Touch name={lift[1] ? '中の紙を下ろす' : '中の紙の端を持ち上げる'} rect={rect(485, lift[1] ? 296 : 721, 465, 70)} act={() => toggle(1)}/>}{!near && <Touch name="右側の四枚の破れた紙を比べる" rect={[68, 12, 25, 78]} act={posters}/>}</div><div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'noticeBoard', values: lift }); say('掲示の重なりを記録した。'); }}>記録に残す</button></div></section>;
}
export function NoticeBoardNote({ values }: {
    values: number[];
}) { return <div className="rm-notice-note"><NoticeBoardSurface lift={values}/></div>; }
