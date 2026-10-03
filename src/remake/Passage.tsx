import { Photo, Touch } from './Photo';
import type { Action, State } from './model';
import type { Focus } from './World';
export function Passage({ s, dispatch, inspect }: {
    s: State;
    dispatch: (a: Action) => void;
    inspect: (f: Focus) => void;
}) {
    const go = (camera: number) => dispatch({ type: 'look', camera });
    const cargo = () => dispatch({ type: 'move', room: 'cargo', camera: 0 });
    const open = s.values.northHatch?.[0] === 1;
    const photos = ['entry', 'north', 'landing' + (open ? '' : '-closed'), 'south'];
    const labels = ['荷物室の戸の先から見下ろす長い階段', '線路下を北へ通る地下横断通路', '線路の高さ近くまで上がった北の踊り場', '地下横断通路から見える荷物室側の階段'];
    return <section className="rm-passage"><Photo src={'./assets/remake/passage/' + photos[s.camera] + '.webp'} label={labels[s.camera]}>
  {s.camera === 0 && <Touch name="階段を下りる" rect={[28, 50, 44, 44]} act={() => go(1)}/>}
  {s.camera === 1 && <Touch name="通路の奥の階段へ進む" rect={[42, 35, 16, 31]} act={() => go(2)}/>}
  {s.camera === 2 && <><Touch name="踊り場の窓を見る" rect={[4, 5, 48, 61]} act={() => inspect('passageWindow')}/><Touch name={open ? '北ホームの開いた戸から出る' : '上の蓋を押し開ける'} rect={[64, 10, 30, 69]} act={() => open ? dispatch({ type: 'move', room: 'north', camera: 2 }) : dispatch({ type: 'northHatch' })}/></>}
  {s.camera === 3 && <Touch name="荷物室側の階段を上がる" rect={[42, 35, 16, 31]} act={() => go(0)}/>}
 </Photo><div className="rm-passage-actions">
  {s.camera === 0 && <button onClick={cargo}>荷物室へ戻る</button>}
  {s.camera === 1 && <button onClick={() => go(0)}>荷物室側の階段へ</button>}
  {s.camera === 2 && <button onClick={() => go(3)}>地下通路へ下りる</button>}
  {s.camera === 3 && <button onClick={() => go(2)}>北側の階段へ</button>}
 </div></section>;
}
