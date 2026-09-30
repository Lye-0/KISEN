import { useState } from 'react';
import { Photo, Touch } from './Photo';
import { TicketPaper } from './TicketBench';
import type { State, Action } from './model';
import type { Focus } from './World';
const root = '/assets/remake/return/';
export function ReturnTrain({ s, dispatch, inspect, say }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: Focus) => void;
    say: (m: string) => void;
}) {
    const seconds = s.values.returnTrip?.[0] ?? 0, arrived = seconds >= 10, open = seconds >= 12;
    const src = root + (open ? 'open' : arrived ? 'closed' : 'travelling') + '.webp';
    return <section className={'rm-return-train' + (s.camera === 1 ? ' rm-return-window' : '')}>
 <Photo src={src} label={open ? '白沢に停まり、開いた扉の外に朝のホームが見える' : arrived ? '白沢に停まった車内。窓の外に黄色い自転車置場' : '帰りの車内。暗い林が窓の向こうを流れる'} view={s.camera === 1 ? [80, 130, 640, 625] : undefined}>
 {s.camera === 0 && <Touch name={open ? '開いた扉からホームへ降りる' : '帰りの列車の扉'} rect={[48.8, 10, 30.5, 77]} act={() => open ? dispatch({ type: 'end' }) : say(arrived ? '列車が止まった。' : '窓の外を、林が流れている。')}/>}
 </Photo>
 <div className="rm-document-controls rm-return-controls"><button onClick={() => dispatch({ type: 'look', camera: s.camera === 0 ? 1 : 0 })}>{s.camera === 0 ? '窓に近づく' : '扉を見る'}</button><button onClick={() => inspect('homePhoto')}>携帯の写真を見る</button>{s.mounted && <button onClick={() => inspect('returnTicket')}>使った切符を見る</button>}</div>
 </section>;
}
export function HomePhone({ dispatch, say }: {
    dispatch?: (a: Action) => void;
    say?: (m: string) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    return <section className={'rm-home-phone' + (expanded ? ' rm-phone-expanded' : '')}>
 {expanded ? <Photo src={root + 'home-photo.webp'} label="携帯に残る白沢の写真。白と青の駅名標、黄色い自転車置場、三台の自転車" zoomable zoomButtonOnly limitZoomToSource/> : <div className="rm-phone-device"><img src="/assets/remake/parts/phone.png" alt="黒い携帯電話"/><div className="rm-phone-screen"><p>保存した写真</p><img src={root + 'home-photo.webp'} alt="白沢の駅名標と黄色い自転車置場"/><p>白沢</p><button onClick={() => setExpanded(true)}>写真を見る</button></div></div>}
 <div className="rm-document-controls"><button onClick={() => setExpanded(!expanded)}>{expanded ? '携帯に戻す' : '写真を広げる'}</button>{dispatch && <button onClick={() => { dispatch({ type: 'record', id: 'homePhoto' }); say?.('写真を記録した。'); }}>記録する</button>}</div>
 </section>;
}
export function ReturnTicket({ s }: {
    s: State;
}) {
    const [back, setBack] = useState(false);
    return s.mounted ? <section className="rm-hand-paper"><TicketPaper ticket={{ ...s.mounted, back }} returnMark={s.values.returnTrip?.[1] === 1}/><button onClick={() => setBack(!back)}>切符を裏返す</button></section> : null;
}
export function Ending({ s, review, exportSave }: {
    s: State;
    review: () => void;
    exportSave: () => void;
}) {
    const [ticket, setTicket] = useState(false);
    return <main id="rm-game" className="rm-ending"><Photo src={root + 'home.webp'} label="朝の白沢。黄色い自転車置場と静かな住宅の路地"/><div className="rm-ending-copy"><p>扉の外に、朝があった。</p><h1>帰線</h1><p className="rm-ending-after">切符の裏に、覚えのない印がひとつ。</p><div><button onClick={() => setTicket(!ticket)}>{ticket ? '景色に戻る' : '切符を見る'}</button><button onClick={review}>最後の車内へ戻る</button><button onClick={exportSave}>記録を書き出す</button></div></div>{ticket && s.mounted && <div className="rm-ending-ticket"><TicketPaper ticket={{ ...s.mounted, back: true }} returnMark/></div>}</main>;
}
