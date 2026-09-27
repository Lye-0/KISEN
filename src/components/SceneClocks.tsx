import type { Room } from '../game/model';
const cameras:Partial<Record<Room,{x:number;y:number;radius:number;minute:number;scaleX:number}>>={
 office:{x:556,y:144,radius:49,minute:12,scaleX:.94},
 platform:{x:782,y:106,radius:48,minute:17,scaleX:.9},
 bridge:{x:345,y:184,radius:20,minute:17,scaleX:.85},
};
export function SceneClocks({room,wound=false}:{room:Room;wound?:boolean}){
 const c=cameras[room];if(!c)return null;const minute=c.minute+(wound?1:0);
 const end=(angle:number,length:number)=>[Math.sin(angle*Math.PI/180)*length,-Math.cos(angle*Math.PI/180)*length];
 const m=end(minute*6,c.radius*.88),h=end(330+minute*.5,c.radius*.58);
 return <svg className="scene-clock" viewBox="0 0 1672 941" role="img" aria-label={`${room==='office'?'駅務室':'ホーム'}の時計、23時${minute}分`}><g transform={`translate(${c.x} ${c.y}) scale(${c.scaleX} 1)`} stroke="#171d15" strokeLinecap="round"><path d={`M0 0L${m[0]} ${m[1]}`} strokeWidth={c.radius>30?2.7:1.3}/><path d={`M0 0L${h[0]} ${h[1]}`} strokeWidth={c.radius>30?3.4:1.6}/><circle r={c.radius>30?3.1:1.5} fill="#1c2119" stroke="none"/></g></svg>;
}
