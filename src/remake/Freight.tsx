import { useSceneBack } from './SceneBack';
import { useState } from 'react';
import { Photo, Touch } from './Photo';
import { CargoDocketSheet } from './CargoChest';
import { owns } from './model';
import type { Action, State } from './model';
export const freightPhotos = { wide: './assets/remake/bridge/freight.webp', detail: './assets/remake/bridge/freight-detail.webp' };
export function FreightWide({ inspect }: {
    inspect: () => void;
}) { return <Photo src={freightPhotos.wide} label="跨線橋から西に見える給水槽、鉄塔、線路上の貨車"><Touch name="西の線路に留置された貨車を見る" rect={[44, 43, 12, 22]} act={inspect}/></Photo>; }
export function FreightFocus({ s, dispatch, say }: {
    s: State;
    dispatch: (a: Action) => void;
    say: (m: string) => void;
}) {
    const [detail, setDetail] = useState(false), compare = owns(s, 'cargoDocket');
    useSceneBack(detail, () => setDetail(false));
    return <section className={'rm-freight-focus' + (compare ? ' rm-freight-compare' : '')}><div className="rm-freight-pictures"><Photo src={detail ? freightPhotos.detail : freightPhotos.wide} label={detail ? '貨車尾部の二本の白い帯と二つの赤い灯' : '給水槽と鉄塔の間の線路に残る貨車'} zoomable onInspect={!detail ? () => setDetail(true) : undefined} limitZoomToSource zoomButtonOnly zoomOrigin={detail ? '50% 50%' : '49% 54%'}/>{compare && owns(s, 'cargoDocket') && <CargoDocketSheet />}</div><div className="rm-document-controls"><button onClick={() => { dispatch({ type: 'record', id: 'freight', values: [] }); say('西の線路の様子を記録した。'); }}>記録に残す</button></div></section>;
}
export function FreightNote() { return <div className="rm-freight-note"><Photo src={freightPhotos.wide} label="跨線橋から見た西の線路と留置された貨車" zoomable limitZoomToSource zoomButtonOnly zoomOrigin="49% 54%"/><Photo src={freightPhotos.detail} label="貨車の白い帯と二つの尾灯" zoomable limitZoomToSource zoomButtonOnly/></div>; }
