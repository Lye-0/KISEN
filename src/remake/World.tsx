import { ToolScene } from './ToolScene';
import { Photo, Touch } from './Photo';
import { Train } from './Train';
import { Clock } from './Clock';
import { HatchImage } from './Hatch';
import { DrawerImage } from './CounterDrawer';
import { RecordCard } from './ServiceRecords';
import { RecorderImage } from './Recorder';
import type { Action, Item, Room, State } from './model';
export type Focus = 'tools' | 'bag' | 'photos' | 'recorder' | 'case' | 'map' | 'ticket' | 'reader' | 'hatch' | 'counterDrawer' | 'notices' | 'platformClock' | 'receipt' | 'officeLock' | 'paperView' | 'item' | 'seat' | null;
export const availableViews: Partial<Record<Room, string[]>> = { train: ['座席と鞄', '前方の座席', '車端'], platform: ['駅舎側', '列車側'], waiting: ['南の窓', '窓口', '出入口'], forecourt: ['駅前'], office: ['机と南の窓', '北の保管区画'] };
function CounterObjects({ s }: {
    s: State;
}) { const open = s.values.drawerOpen?.[0] === 1; return <svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="978" y="254" width="256" height="275" viewBox="436 166 784 632" preserveAspectRatio="none"><HatchImage s={s}/></svg><svg x={open ? 945 : 965} y={open ? 552 : 557} width={open ? 339 : 299} height={open ? 139 : 76} viewBox={open ? '55 252 1555 638' : '125 296 1415 350'} preserveAspectRatio="none"><DrawerImage s={s}/></svg><foreignObject x="690" y="275" width="100" height="195"><RecordCard id={0} inkOnly/></foreignObject><foreignObject x="800" y="310" width="72" height="141"><RecordCard id={1} inkOnly/></foreignObject></svg>; }
export function World({ s, dispatch, inspect }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: Focus) => void;
    say: (m: string) => void;
    selected: Item | null;
}) {
    const move = (room: Room, camera = 0) => dispatch({ type: 'move', room, camera });
    const image = (src: string, label: string, children?: React.ReactNode) => <Photo src={'/assets/remake/' + src + '.webp'} label={label}>{children}</Photo>;
    if (s.room === 'train')
        return <Train s={s} dispatch={dispatch} inspect={() => inspect('bag')} inspectCase={() => inspect('case')} inspectSeat={i => { dispatch({ type: 'values', id: 'seatFocus', values: [i] }); inspect('seat'); }} exit={() => move('platform', 0)}/>;
    if (s.room === 'platform')
        return s.camera === 1 ? image('platform/train', 'ホームに停まる列車', <Touch name="車内へ入る" rect={[37, 23, 22, 57]} act={() => move('train')}/>) : image('platform/station', '南ホームから見た待合室', <><Clock minutes={23 * 60 + 17} transform="translate(1030 302) scale(.72)"/><Touch name="待合室へ入る" rect={[36, 34, 20, 44]} act={() => move('waiting', 0)}/><Touch name="ホームの時計" rect={[57, 25, 9, 16]} act={() => inspect('platformClock')}/></>);
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
    if (s.room === 'forecourt')
        return image('forecourt/station', '六つの窓が並ぶ駅舎', <Touch name="待合室へ戻る" rect={[13, 44, 7, 27]} act={() => move('waiting', 2)}/>);
    if (s.room === 'office')
        return s.camera === 1 ? image('office/north', '駅務室の北側の保管区画', <><Touch name="待合室へ戻る" rect={[0, 23, 16, 65]} act={() => move('waiting', 1)}/></>) : image('office/south', '駅務室の机と二つの窓', <><Clock /><svg className="rm-object-overlay" viewBox="0 0 1672 941"><svg x="457" y="502" width="180" height="147" viewBox="160 0 890 710" preserveAspectRatio="none"><RecorderImage s={s}/></svg></svg><ToolScene s={s}/><Touch name="机の録音機" rect={[26, 51, 20, 22]} act={() => inspect('recorder')}/><Touch name="机の鋏と用紙" rect={[44.8, 65.3, 29.5, 7.6]} act={() => inspect('tools')}/></>);
    return <p role="status">この場面はまだ用意されていません。</p>;
}
