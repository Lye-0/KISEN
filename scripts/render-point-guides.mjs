import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {project} from '../src/remake/geometry.ts';
import {railCamera,wyeCamera,wyePorts,wyeJoints,railCurve} from '../src/remake/pointMechanics.ts';
const out=process.env.KISEN_REVIEW_DIR??'docs/remake/geometry/points';await mkdir(out,{recursive:true});
for(const kind of ['regular','wye']) {
 const c=kind==='wye'?wyeCamera:railCamera,parts=[];
 const line=(points,color,width=5)=>{const q=points.map(([x,y])=>project([x,y,.12],c));parts.push(`<polyline points="${q.map(p=>p.x+','+p.y).join(' ')}" stroke="${color}" stroke-width="${width}" fill="none"/>`);};
 const track=(center)=>{
  for(let i=0;i<center.length;i+=2){const p=center[i],next=center[Math.min(i+1,center.length-1)],dx=next[0]-p[0],dy=next[1]-p[1],n=Math.hypot(dx,dy)||1;line([[p[0]-dy/n*1.1,p[1]+dx/n*1.1],[p[0]+dy/n*1.1,p[1]-dx/n*1.1]],'#62543c',7);}
  for(const sign of [-1,1])line(center.map((p,i)=>{const prev=center[Math.max(0,i-1)],next=center[Math.min(center.length-1,i+1)],dx=next[0]-prev[0],dy=next[1]-prev[1],n=Math.hypot(dx,dy)||1;return[p[0]+sign*dy/n*.5335,p[1]-sign*dx/n*.5335];}),'#afb1a3',4);
 };
 if(kind==='regular'){
  track(Array.from({length:24},(_,i)=>[0,-12+i/3]));
  for(const port of [1,2])track(Array.from({length:73},(_,i)=>railCurve(port,i/72)));
 } else {
  for(let i=0;i<3;i++)track(Array.from({length:32},(_,j)=>wyePorts[i].map((v,n)=>v+(wyeJoints[i][n]-v)*j/31)));
  for(const [a,b] of [[0,1],[0,2],[1,2]])track(Array.from({length:50},(_,i)=>wyeJoints[a].map((v,n)=>v+(wyeJoints[b][n]-v)*i/49)));
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#2d352e"/>${parts.join('')}</svg>`;await writeFile(`${out}/${kind}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${out}/${kind}.png`);
}
console.log(out);
