import type {GameState} from '../game/model';
import {sceneBase,SceneLayers} from './SceneLayers';
import {SceneClocks} from './SceneClocks';
import {SceneDynamics} from './SceneDynamics';
import {WorldItems} from './WorldItems';
export function ScenePreview({s}:{s:GameState}){return <div className="reward-room"><img src={sceneBase(s)} alt="現在の場面"/><SceneLayers s={s}/><SceneClocks room={s.room} wound={s.opened.includes('P07')}/><SceneDynamics s={s}/><WorldItems s={s}/></div>}
