import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {project} from '../src/remake/geometry.ts';
import {passage as r,passageCameras,passageSteps} from '../src/remake/passageGeometry.ts';
const out=process.env.KISEN_REVIEW_DIR??'docs/remake/geometry/passage';
await mkdir(out,{recursive:true});
for(const name of ['entry','north','south']) {
 const c=passageCameras[name], faces=[];
 const poly=(points,fill)=>{const ps=points.map(p=>project(p,c));if(ps.some(p=>p.depth<.05))return;faces.push({depth:ps.reduce((a,p)=>a+p.depth,0)/ps.length,svg:`<polygon points="${ps.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="#242924" stroke-width="2"/>`});};
 const box=(y1,y2,z1,z2)=>{
 poly([[r.west,y1,z1],[r.east,y1,z1],[r.east,y2,z1],[r.west,y2,z1]],'#58594c');
 poly([[r.west,y2,z2],[r.east,y2,z2],[r.east,y1,z2],[r.west,y1,z2]],'#44483d');
 for(const x of [r.west,r.east])poly([[x,y1,z1],[x,y2,z1],[x,y2,z2],[x,y1,z2]],x===r.west?'#888979':'#777967');
 };
 const first=name==='entry'?r.southBottom: name==='north'?c.position[1]+.1:r.southBottom;
 const last=name==='south'?c.position[1]-.1:r.northBottom;
 box(first,last,r.floor,r.ceiling);
 for(const end of ['south','north']) for(const step of passageSteps(end)) {
  poly([[r.west,step.y,step.z],[r.east,step.y,step.z],[r.east,step.end,step.z],[r.west,step.end,step.z]],'#9b9984');
  poly([[r.west,step.y,step.previousZ],[r.east,step.y,step.previousZ],[r.east,step.y,step.z],[r.west,step.y,step.z]],'#737467');
  for(const x of [r.west,r.east])poly([[x,step.y,step.z],[x,step.end,step.z],[x,step.end,step.z+2.35],[x,step.y,step.previousZ+2.35]],x===r.west?'#888979':'#777967');
 }
 if(name==='entry'){
  box(c.position[1]+.1,r.southStart,0,3.2);
  // The cargo doorway is west of the upper landing.
 }
 for(const [y,z] of [[r.southStart,.0],[r.northTop,r.landingFloor]]) {
  const up=y<0?1:-1; const yfar=y-up*.75;
  poly([[r.west,yfar,z],[r.east,yfar,z],[r.east,yfar,z+2.2],[r.west,yfar,z+2.2]],'#263539');
 }
 faces.sort((a,b)=>b.depth-a.depth);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#161e20"/>${faces.map(f=>f.svg).join('')}</svg>`;
 await writeFile(`${out}/${name}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${out}/${name}.png`);
}
console.log(out);
