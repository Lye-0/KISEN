import { PointBankScene } from './PointControls';
import { ReturnTrain } from './ReturnTrain';
import { GlassWindow } from './GlassWindow';
import { FreightWide } from './Freight';
import { NoticeBoardSurface } from './NoticeBoard';
import { ForgottenRoom, ReceiptBoardImage } from './ForgottenShelf';
import { LampWindow } from './LampWindow';
import { LampShed } from './LampShed';
import { BridgeGateWide } from './BridgeGate';
import { RailTagWide } from './RailTag';
import { NorthPlatform } from './NorthPlatform';
import { Passage } from './Passage';
import { CargoRoom } from './CargoRoom';
import { ToolScene } from './ToolScene';
import { Photo, Touch } from './Photo';
import { Train } from './Train';
import { Clock } from './Clock';
import { HatchImage } from './Hatch';
import { DrawerImage } from './CounterDrawer';
import { RecordCard } from './ServiceRecords';
import { RecorderImage } from './Recorder';
import { owns } from './model';
import type { Action, Item, Room, State } from './model';
export type Focus = 'pointDetail' | 'pointSlip' | 'routeSketch' | 'northTracks' | 'homePhoto' | 'returnTicket' | 'dispatch' | 'noticeBoard' | 'freight' | 'fragmentPhoto' | 'fragments' | 'receiptTray' | 'clockChecks' | 'bell' | 'posters' | 'shedDoor' | 'balanceBox' | 'lampWindow' | 'cargoChest' | 'cargoDockets' | 'cargoDocket' | 'points' | 'journeyRecords' | 'passageWindow' | 'crossing' | 'railTag' | 'hookRack' | 'bridgeGate' | 'arrivalTicket' | 'signal' | 'tools' | 'bag' | 'photos' | 'recorder' | 'case' | 'map' | 'ticket' | 'reader' | 'hatch' | 'counterDrawer' | 'notices' | 'platformClock' | 'receipt' | 'officeLock' | 'paperView' | 'item' | 'seat' | null;
export const availableViews: Partial<Record<Room, string[]>> = { return: ['扉と座席', '窓に近づく'], tunnel: ['観測窓の左', '観測窓の右'], lost: ['傘と受取棚・比較台'], lamp: ['保管箱と灯具', '西の窓'], train: ['座席と鞄', '前方の座席', '車端'], platform: ['駅舎側', '列車側', '西の階段'], waiting: ['南の窓', '窓口', '出入口'], forecourt: ['駅前', '東の側道'], office: ['机と南の窓', '北の保管区画'], cargo: ['箱と台車', '南の窓と柱'], passage: ['南の階段', '地下通路・北向き', '北の踊り場', '地下通路・南向き'], bridge: ['駅舎の屋根と北壁', '線路と屋根', '北端の保守柵', '西の留置線'], north: ['停車灯と踏み板', '西の橋階段', '東の線路と地下入口', '分岐操作器'] };
function CounterObjects({ s }: {
    s: State;
}) { const open = s.values.drawerOpen?.[0] === 1; return <svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="978" y="254" width="256" height="275" viewBox="436 166 784 632" preserveAspectRatio="none"><HatchImage s={s}/></svg><svg x={open ? 945 : 965} y={open ? 552 : 557} width={open ? 339 : 299} height={open ? 139 : 76} viewBox={open ? '55 252 1555 638' : '125 296 1415 350'} preserveAspectRatio="none"><DrawerImage s={s}/></svg><foreignObject x="690" y="275" width="100" height="195"><RecordCard id={0} inkOnly/></foreignObject><foreignObject x="800" y="310" width="72" height="141"><RecordCard id={1} inkOnly/></foreignObject></svg>; }
export function World({ s, dispatch, inspect, selected, say }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: Focus) => void;
    say: (m: string) => void;
    selected: Item | null;
}) {
    const move = (room: Room, camera = 0) => dispatch({ type: 'move', room, camera });
    const image = (src: string, label: string, children?: React.ReactNode) => <Photo src={'/assets/remake/' + src + '.webp'} label={label}>{children}</Photo>;
    if (s.room === 'return')
        return <ReturnTrain s={s} dispatch={dispatch} inspect={inspect} say={say}/>;
    if (s.room === 'tunnel')
        return <GlassWindow s={s} dispatch={dispatch} selected={selected} say={say}/>;
    if (s.room === 'north')
        return s.camera === 3 ? <PointBankScene s={s} inspect={() => inspect('points')}/> : s.camera === 2 ? image('north/east-crossing' + (s.values.northHatch?.[0] === 1 ? '' : '-closed'), '北ホーム東端の地下入口と線路', <><Touch name={s.values.northHatch?.[0] === 1 ? '地下への開いた階段を下りる' : '閉じた地下の蓋'} rect={[5, 40, 34, 48]} act={() => s.values.northHatch?.[0] === 1 ? move('passage', 2) : say('取っ手はあるが、内側から掛かっている。')}/><Touch name="旧線の橋脚と線路" rect={[30, 13, 60, 25]} act={() => inspect('northTracks')}/></>) : s.camera === 1 ? image('north/west-sidepath' + (s.values.gateOpen?.[0] === 1 ? '-open' : ''), '北ホームの西端から見た橋の階段と保守側道', <><Touch name="跨線橋へ上がる" rect={[23, 19, 24, 62]} act={() => s.values.gateOpen?.[0] === 1 ? move('bridge', 2) : say('上の保守柵が閉じている。')}/><Touch name="山側の保守側道を進む" rect={[0, 55, 20, 42]} act={() => move('tunnel', 0)}/></>) : <NorthPlatform s={s} dispatch={dispatch} inspect={inspect} selected={selected} say={say}/>;
    if (s.room === 'train')
        return <Train s={s} dispatch={dispatch} inspect={() => inspect('bag')} inspectCase={() => inspect('case')} inspectSeat={i => { dispatch({ type: 'values', id: 'seatFocus', values: [i] }); inspect('seat'); }} exit={() => move('platform', 0)}/>;
    if (s.room === 'platform')
        return s.camera === 2 ? image('platform/west-bridge', '南ホーム西端の跨線橋階段', <Touch name="西の跨線橋へ上がる" rect={[34, 17, 18, 55]} act={() => move('bridge', 0)}/>) : s.camera === 1 ? image('platform/train-open', 'ホームに停まる列車', <Touch name="車内へ入る" rect={[37, 23, 22, 57]} act={() => move('train')}/>) : image('platform/station', '南ホームから見た待合室', <><Clock ambient minutes={23 * 60 + 17} transform="translate(1030 302) scale(.72)"/><Touch name="待合室へ入る" rect={[36, 34, 20, 44]} act={() => move('waiting', 0)}/><Touch name="ホームの時計" rect={[57, 25, 9, 16]} act={() => inspect('platformClock')}/></>);
    if (s.room === 'bridge')
        return s.camera === 3 ? <FreightWide inspect={() => inspect('freight')}/> : s.camera === 1 ? <RailTagWide s={s} inspect={() => inspect('railTag')} observe={() => inspect('crossing')}/> : s.camera === 2 ? <BridgeGateWide s={s} dispatch={dispatch} inspect={() => inspect('bridgeGate')} enterNorth={() => move('north', 0)}/> : image('bridge/west-roof', '跨線橋から見える駅舎の北壁と西端', <Touch name="南ホームへ下りる" rect={[0, 56, 23, 44]} act={() => move('platform', 2)}/>);
    if (s.room === 'waiting') {
        if (s.camera === 0)
            return image('waiting/south', '待合室の二つの南窓とベンチ');
        if (s.camera === 2)
            return image('waiting/north', '待合室の出入口', <><Touch name="ホームへ出る" rect={[44, 19, 28, 58]} act={() => move('platform', 1)}/><Touch name="駅前へ出る" rect={[9, 25, 13, 51]} act={() => move('forecourt')}/></>);
        return image('waiting/east', '待合室の窓口と駅務室の扉', <><CounterObjects s={s}/><Touch name="受付の小戸" rect={[56, 24, 21, 34]} act={() => inspect('hatch')}/><Touch name="受付の引出し" rect={[57, 59, 19, 15]} act={() => inspect('counterDrawer')}/><Touch name="壁の時刻表" rect={[41, 28, 12, 24]} act={() => inspect('notices')}/><Touch name="駅務室の扉" rect={[25, 23, 15, 60]} act={() => {
                if (s.flags.includes('officeUnlocked'))
                    move('office', 0);
                else
                    inspect('officeLock');
            }}/></>);
    }
    if (s.room === 'lost')
        return <ForgottenRoom s={s} dispatch={dispatch} inspect={inspect}/>;
    if (s.room === 'lamp')
        return s.camera === 1 ? <LampWindow s={s} dispatch={dispatch} inspect={inspect} selected={selected} say={say}/> : <LampShed s={s} dispatch={dispatch} inspect={inspect} say={say}/>;
    if (s.room === 'forecourt')
        return s.camera === 1 ? image('lamp/path-' + (s.values.shedOpen?.[0] === 1 ? 'open' : 'closed'), '駅舎の東端から灯具小屋へ続く側道', <Touch name={s.values.shedOpen?.[0] === 1 ? '灯具小屋へ入る' : '灯具小屋の扉の錠'} rect={[44.5, 41, 13, 27]} act={() => s.values.shedOpen?.[0] === 1 ? move('lamp') : inspect('shedDoor')}/>) : image('forecourt/station', '六つの窓が並ぶ駅舎', <><Touch name="待合室へ戻る" rect={[13, 44, 7, 27]} act={() => move('waiting', 2)}/><svg className="rm-object-overlay" viewBox="0 0 1672 941" style={{ filter: "brightness(.62)" }}><svg x="1458" y="511" width="99" height="97" preserveAspectRatio="none" viewBox="0 0 900 730"><NoticeBoardSurface lift={s.values.noticeLift}/></svg></svg><Touch name="外の掲示板" rect={[86, 51, 9, 16]} act={() => inspect('noticeBoard')}/></>);
    if (s.room === 'office')
        return s.camera === 1 ? image(owns(s, 'hook') ? 'office/north-hook-empty' : 'office/north-hook', '駅務室の北側の保管区画', <><svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="773" y="419" width="120" height="120" viewBox="350 0 950 941" preserveAspectRatio="none" style={{ filter: 'brightness(.58)' }}><ReceiptBoardImage s={s}/></svg></svg><Touch name="待合室へ戻る" rect={[0, 23, 16, 65]} act={() => move('waiting', 1)}/><Touch name="傘立ての鉤付き棒" rect={[39, 47, 11, 32]} act={() => inspect('hookRack')}/><Touch name="忘れ物の棚へ近づく" rect={[51, 44, 20, 37]} act={() => move('lost')}/><Touch name="荷物室へ入る" rect={[84, 13, 16, 76]} act={() => move('cargo', 0)}/></>) : image('office/south', '駅務室の机と二つの窓', <><Clock ambient /><svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="457" y="502" width="180" height="147" viewBox="160 0 890 710" preserveAspectRatio="none"><RecorderImage s={s}/></svg></svg><ToolScene s={s}/><Touch name="机の録音機" rect={[26, 51, 20, 22]} act={() => inspect('recorder')}/><Touch name="机の鋏と用紙" rect={[44.8, 65.3, 29.5, 7.6]} act={() => inspect('tools')}/></>);
    if (s.room === 'cargo')
        return s.camera === 1 ? image('cargo/south', '荷物室の南壁、一つの窓と両脇の柱') : <CargoRoom s={s} dispatch={dispatch} say={say} leave={() => move('office', 1)} descend={() => move('passage', 0)} inspectChest={() => inspect('cargoChest')}/>;
    if (s.room === 'passage')
        return <Passage s={s} dispatch={dispatch} inspect={inspect}/>;
    return <p role="status">この場面はまだ用意されていません。</p>;
}
