import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import {project,tower,poles} from '../src/remake/geometry.ts';
import {encounters,encounterCamera,markerPosition} from '../src/remake/journeyEncounterGeometry.ts';
const out=process.env.KISEN_REVIEW_DIR ?? 'docs/remake/geometry/journeys';
await mkdir(out,{recursive:true});
for(const e of encounters)for(const frame of [0,1]) {
 const c=encounterCamera(e,frame),faces=[],direction=e.side==='white'?1:-1;
 const poly=(ps,fill)=>{const q=ps.map(p=>project(p,c));if(q.some(p=>p.depth<=.2))return;faces.push({depth:q.reduce((s,p)=>s+p.depth,0)/q.length,svg:`<polygon points="${q.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="#202623" stroke-width="1.5"/>`})};
 const line=(a,b,color,width=4)=>{const q=[a,b].map(p=>project(p,c));if(q.some(p=>p.depth<=.2))return;faces.push({depth:(q[0].depth+q[1].depth)/2,svg:`<path d="M${q.map(p=>p.x+' '+p.y).join('L')}" fill="none" stroke="${color}" stroke-width="${width}"/>`})};
 const box=(x,y,z,w,d,h,color)=>{poly([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]],color);poly([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],color);poly([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]],color);poly([[x,y+d,z],[x,y,z],[x,y,z+h],[x,y+d,z+h]],color);poly([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]],color)};
 const railNear=c.position[1]+direction*2, railFar=direction*50;
 for(const x of [-.62,.62])line([x,railNear,0],[x,railFar,0],'#717873',5);
 for(let k=2;k<25;k++)line([-1.1,c.position[1]+direction*k*1.5,-.02],[1.1,c.position[1]+direction*k*1.5,-.02],'#494336',5);
 for(const side of ['white','black']) {const [x,y]=markerPosition(e,side),color=side==='white'?'#c5c9bf':'#343d37';box(x-.2,y-.2,0,.4,.4,2.1,color);for(const z of side==='white'?[1.4]:[1.05,1.4]){const start=faces.length;box(x-.205,y-.205,z,.41,.41,.075,side==='white'?'#404940':'#b9bfb0');faces.slice(start).forEach(f=>f.depth-=1)}}
 const x=e.landmark[0];
 if(e.kind==='tank') {for(const dx of [-1.1,1.1])for(const y of [-1.1,1.1])box(x+dx-.12,y-.12,0,.24,.24,4.5,'#535e56');box(x-1.4,-1.4,4.4,2.8,2.8,1.8,'#72735e');}
 if(e.kind==='bridge') {for(const dx of [-5.5,5.5])box(dx-.4,-.5,0,.8,1,3.95,'#787970');box(-6.2,-.6,3.95,12.4,1.2,.4,'#77533d');for(const y of [-.36,.36])line([-6.2,y,4.35],[6.2,y,4.35],'#89928b',4);}
 if(e.kind==='hut') {box(x-1.5,-1.3,0,3,2.6,2.8,'#75796c');poly([[x-1.65,-1.5,2.8],[x+1.65,-1.5,2.8],[x+1.65,0,3.7],[x-1.65,0,3.7]],'#4d5a57');poly([[x-1.65,0,3.7],[x+1.65,0,3.7],[x+1.65,1.5,2.8],[x-1.65,1.5,2.8]],'#58625c');}
 if(e.kind==='pylon') {
  for(const p of poles){const px=x+p.base[0],py=p.base[1];box(px-p.radius,py-p.radius,0,p.radius*2,p.radius*2,p.height,'#3b3025');if(p.scar){const start=faces.length;box(px-p.radius-.006,py-p.radius-.006,p.scar-.32,p.radius*2+.012,p.radius*2+.012,.64,'#c5c5b7');faces.slice(start).forEach(f=>f.depth-=1)}line([px-.4,py,8.8],[px+.4,py,8.8],'#403829',3)}
  for(const z of [8.65,9.1])line([x-6,-3.1,z],[x+6,-3.1,z],'#37372e',2);
  for(const [dx,dy] of tower.corners)line([x+dx,dy,0],[x+dx,dy,tower.height],'#748177',6);
  for(let j=0;j<4;j++)for(let z=0;z<tower.height;z+=3){const a=tower.corners[j],b=tower.corners[(j+1)%4];line([x+a[0],a[1],z],[x+b[0],b[1],z],'#748177',4);line([x+a[0],a[1],z],[x+b[0],b[1],z+3],'#67756c',4);line([x+b[0],b[1],z],[x+a[0],a[1],z+3],'#67756c',4)}
  for(const dx of [-.16,.16])line([x+tower.ladderX,tower.ladderY+dx,0],[x+tower.ladderX,tower.ladderY+dx,tower.height],'#a46d34',5);
  for(let z=.2;z<tower.height;z+=.35)line([x+tower.ladderX,tower.ladderY-.16,z],[x+tower.ladderX,tower.ladderY+.16,z],'#a46d34',3);
 }
 faces.sort((a,b)=>b.depth-a.depth);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#172229"/><path d="M0 600H1672V941H0Z" fill="#202c25"/>${faces.map(p=>p.svg).join('')}<rect x="0" y="0" width="75" height="941" fill="#524536"/><rect x="75" y="0" width="12" height="941" fill="#b5a37e"/></svg>`;
 await writeFile(`${out}/${e.id}-${frame}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${out}/${e.id}-${frame}.png`);
}
console.log(out);
