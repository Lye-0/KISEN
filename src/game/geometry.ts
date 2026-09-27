export type Point={x:number;y:number};
export type Obstacle={x:number;y:number;w:number;h:number};
export function firstContact(a:Point,b:Point,rect:Obstacle):number|null{
 let lo=0,hi=1;
 for(const [start,delta,min,max] of [[a.x,b.x-a.x,rect.x,rect.x+rect.w],[a.y,b.y-a.y,rect.y,rect.y+rect.h]]){
  if(Math.abs(delta)<1e-9){if(start<min||start>max)return null;continue}
  const p=(min-start)/delta,q=(max-start)/delta;lo=Math.max(lo,Math.min(p,q));hi=Math.min(hi,Math.max(p,q));if(lo>hi)return null;
 }
 return lo;
}
export const lampOrigin={x:100,y:210};
export const lampObstacles=[{x:250,y:205,w:50,h:115},{x:240,y:90,w:260,h:22}];
export function beam(v:number[]){
 const target={x:325+65*v[1],y:70+80*v[0]};
 const hit=Math.min(1,...lampObstacles.map(r=>firstContact(lampOrigin,target,r)??1));
 return {target,end:{x:lampOrigin.x+(target.x-lampOrigin.x)*hit,y:lampOrigin.y+(target.y-lampOrigin.y)*hit},clear:hit===1};
}
export function plaqueLit(v:number[]){const b=beam(v);return b.clear&&Math.hypot(b.target.x-520,b.target.y-150)<30}
export const hookOrigin={x:70,y:340};
export const hookObstacles=[{x:170,y:115,w:430,h:25},{x:280,y:140,w:20,h:105}];
export function hookReach(v:number[]){
 const angle=[-35,-25,-15,-5][v[0]]*Math.PI/180,length=[350,400,450,500][v[1]];
 const end={x:70+Math.cos(angle)*length,y:340+Math.sin(angle)*length};const tip={x:end.x,y:end.y+(v[2]?-16:16)};
 const clear=hookObstacles.every(r=>firstContact(hookOrigin,end,r)===null&&firstContact(end,tip,r)===null);
 return {end,tip,clear,caught:clear&&Math.hypot(tip.x-553,tip.y-195)<8};
}
