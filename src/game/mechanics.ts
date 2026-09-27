export function moveGrille(v:number[],part:number,delta:number):number[]|null {
 const n=[...v];
 if(part<2){const next=v[part]+delta;if(next<0||next>(part===0?6:4))return null;n[part]=next;
  const [x,y,a,b]=n;if(y===1&&![a,a+1].includes(x)||y===3&&x!==b||y===2&&![4,6].includes(x))return null;
 }else{if(v[1]===(part===2?1:3))return null;const next=v[part]+delta;if(next<0||next>(part===2?5:6))return null;n[part]=next;}
 return n;
}
export function turnClock(v:number[],ring:number):number[]|null{
 if(ring===1&&v[0]!==2)return null;
 if(ring===0&&![0,3].includes(v[1]))return null;
 return v.map((n,i)=>ring===i?(n+1)%4:n);
}
export const cargoColumns=[2,3,4];
export const cargoLengths=[3,2,2];
export function moveCargo(v:number[],piece:number,delta:number):number[]|null{
 const n=[...v];n[piece]+=delta;
 if(piece===3){if(n[3]<0||n[3]>4)return null}else if(n[piece]<0||n[piece]+cargoLengths[piece]>6)return null;
 for(let i=0;i<3;i++)if(n[i]<=2&&n[i]+cargoLengths[i]>2&&cargoColumns[i]>=n[3]&&cargoColumns[i]<n[3]+2)return null;
 return n;
}
export function holdCatch(v:number[],part:number):number[]{
 if(part===2){
  if(v[2]===2)return [0,0,0];
  if(v[2]===0)return v[0]===1?[1,0,1]:v;
  return v[1]===1?[1,1,2]:v;
 }
 if(v[2]===2||v[2]===1&&part===0)return v;
 const n=[...v];n[part]=1-n[part];if(v[2]===0)n[1-part]=0;return n;
}
export function shutterLight(v:number[],x:number):[number,number][]{
 const ranges:[number,number][]=[];
 for(const a of [-10+v[0]*80,390+v[0]*80])for(const b of [70+v[1]*80,470+v[1]*80]){
  const left=Math.max(x-32,a-35,b-35),right=Math.min(x+32,a+35,b+35);if(right>left)ranges.push([left-x,right-x]);
 }
 return ranges;
}
export function shuttersOpen(v:number[]){return [150,550].every(x=>shutterLight(v,x).some(([a,b])=>b-a>=64));}
