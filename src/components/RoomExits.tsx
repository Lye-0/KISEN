import type { Action,GameState,Room } from '../game/model';
import { open } from '../game/model';
import { areas } from '../game/content';
import { exitPoses } from '../game/exits';
export function RoomExits({s,dispatch,move,message}:{s:GameState;dispatch:(a:Action)=>void;move:(r:Room)=>void;message:(s:string)=>void}){
 if(s.room==='forecourt'&&s.view===1)return <div className="scene-links"><button className="go-forward" onClick={()=>{dispatch({type:'view',value:0});dispatch({type:'note',id:'loop'});message('曲がり角の先に、同じ駅と赤い傘。足跡まで残っている。')}}><span>↑</span><small>道の先へ</small></button><button className="go-left" onClick={()=>dispatch({type:'view',value:0})}><span>‹</span><small>引き返す</small></button></div>;
 return <div className="scene-links">{areas[s.room].links.map((room,i)=>{const p=exitPoses[s.room]?.[room];return <button key={room} className={p?'door-link':i===0?'go-left':'go-right'} style={p?{left:p[0]+'%',top:p[1]+'%',right:'auto',bottom:'auto',transform:'translate(-50%,-50%)'}:undefined} onClick={()=>move(room)}><span>{p?.[2]??(i===0?'‹':'›')}</span><small>{room==='closed'&&!open(s,'P16')?'北側へ':areas[room].name}</small></button>})}</div>;
}
