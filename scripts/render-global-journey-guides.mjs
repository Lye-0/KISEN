import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {project,clipCameraPolygon,tower,poles,towerWorld} from '../src/remake/geometry.ts';
import {encounters,encounterCamera,markerPosition} from '../src/remake/journeyEncounterGeometry.ts';
import {crossingRails,oldRailPoint,oldBridge,oldBuffer} from '../src/remake/crossingGeometry.ts';
const out=path.resolve(process.env.KISEN_REVIEW_DIR??'docs/remake/geometry/global-journeys');await mkdir(out,{recursive:true});
for(const e of encounters)for(const frame of [0,1]){
 const camera=encounterCamera(e,frame),shapes=[];
 const polygon=(pts,fill,stroke='#33372f',sw=1)=>{const clipped=clipCameraPolygon(pts,camera);if(clipped.length<3)return;const pp=clipped.map(p=>project(p,camera));shapes.push({depth:pp.reduce((v,p)=>v+p.depth,0)/pp.length,svg:`<polygon points="${pp.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`});};
 const box=(a,b,color)=>{const[x,y,z]=a,[xx,yy,zz]=b;for(const p of [[[x,y,z],[xx,y,z],[xx,yy,z],[x,yy,z]],[[x,y,zz],[x,yy,zz],[xx,yy,zz],[xx,y,zz]],[[x,y,z],[x,y,zz],[xx,y,zz],[xx,y,z]],[[x,yy,z],[xx,yy,z],[xx,yy,zz],[x,yy,zz]],[[x,y,z],[x,yy,z],[x,yy,zz],[x,y,zz]],[[xx,y,z],[xx,y,zz],[xx,yy,zz],[xx,yy,z]]])polygon(p,color);};
 const strip=(a,b,width,fill)=>{const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*width/2,ny=dx/len*width/2;polygon([[a[0]+nx,a[1]+ny,a[2]],[a[0]-nx,a[1]-ny,a[2]],[b[0]-nx,b[1]-ny,b[2]],[b[0]+nx,b[1]+ny,b[2]]],fill);};
 const line=(a,b,color,width=4)=>{const q=[a,b].map(p=>project(p,camera));if(q.some(p=>p.depth<=.1))return;shapes.push({depth:(q[0].depth+q[1].depth)/2,svg:`<path d="M${q[0].x} ${q[0].y}L${q[1].x} ${q[1].y}" stroke="${color}" stroke-width="${width}" fill="none"/>`});};
 polygon([[-100,-30,-.04],[45,-30,-.04],[45,220,-.04],[-100,220,-.04]],'#323b35','#323b35');shapes.at(-1).depth=1e9;
 if(e.kind==='bridge'){
  for(let y=20;y<50;y++){const a=oldRailPoint(y),b=oldRailPoint(y+1);strip([a[0],a[1],a[2]-.16],[b[0],b[1],b[2]-.16],3.2,'#4c514a');for(const x of [-1.3,1.3])polygon([[a[0]+x,a[1],a[2]-.16],[b[0]+x,b[1],b[2]-.16],[b[0]+x,b[1],b[2]-.65],[a[0]+x,a[1],a[2]-.65]],'#775546');}
  for(const y of oldBridge.pierYs){const p=oldRailPoint(y);box([p[0]-1.25,y-.6,0],[p[0]+1.25,y+.6,p[2]-.65],'#81806f');if(y===23)box([p[0]-1.26,y-.62,1.5],[p[0]+1.26,y-.61,1.62],'#b4b29b');}
  const b=oldBuffer;box([b[0]-1.15,b[1]-.2,b[2]+.1],[b[0]+1.15,b[1]+.15,b[2]+1.1],'#775547');box([-61.35,33,0],[-60.65,39,5.8],'#7d8173');box([-60.64,33.5,0],[-60.63,38.5,4.95],'#151f1d');
 }
 for(const{id,points}of crossingRails())for(let seg=1;seg<points.length;seg++){
  const a=points[seg-1],b=points[seg],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dy=(b[1]-a[1])/len,nx=-dy,ny=dx;
  for(let m=0;m<len;m+=.7){const t=m/len,p=a.map((n,i)=>n+(b[i]-n)*t);strip([p[0]-nx*1.05,p[1]-ny*1.05,p[2]+.05],[p[0]+nx*1.05,p[1]+ny*1.05,p[2]+.05],.17,'#5b584c');}
  for(const side of [-.62,.62])for(let m=0;m<len;m+=1){const p=a.map((n,i)=>n+(b[i]-n)*m/len),q=a.map((n,i)=>n+(b[i]-n)*Math.min(m+1,len)/len);strip([p[0]+nx*side,p[1]+ny*side,p[2]+.13],[q[0]+nx*side,q[1]+ny*side,q[2]+.13],.07,'#b6b5a3');}
 }
 if(e.kind==='tank'){const[x,y]=e.landmark;for(const dx of [-1.1,1.1])for(const dy of [-1.1,1.1])box([x+dx-.12,y+dy-.12,0],[x+dx+.12,y+dy+.12,4.5],'#535e56');box([x-1.4,y-1.4,4.4],[x+1.4,y+1.4,6.2],'#72735e');}
 if(e.kind==='hut'){const[x,y]=e.landmark;box([x-1.5,y-1.3,0],[x+1.5,y+1.3,2.8],'#75796c');polygon([[x-1.65,y-1.5,2.8],[x+1.65,y-1.5,2.8],[x+1.65,y,3.7],[x-1.65,y,3.7]],'#4d5a57');polygon([[x-1.65,y,3.7],[x+1.65,y,3.7],[x+1.65,y+1.5,2.8],[x-1.65,y+1.5,2.8]],'#58625c');}
 if(e.kind==='pylon'){
  const local=towerWorld;
  for(const p of poles){const q=local(p.base[0],p.base[1],0);box([q[0]-p.radius,q[1]-p.radius,0],[q[0]+p.radius,q[1]+p.radius,p.height],'#3b3025');if(p.scar)box([q[0]-.16,q[1]-.16,p.scar-.32],[q[0]+.16,q[1]+.16,p.scar+.32],'#c5c5b7');}
  for(const[x,y]of tower.corners)line(local(x,y,0),local(x,y,tower.height),'#748177',6);
  for(let j=0;j<4;j++)for(let z=0;z<tower.height;z+=3){const a=tower.corners[j],b=tower.corners[(j+1)%4];line(local(a[0],a[1],z),local(b[0],b[1],z),'#748177',4);line(local(a[0],a[1],z),local(b[0],b[1],z+3),'#67756c',4);line(local(b[0],b[1],z),local(a[0],a[1],z+3),'#67756c',4);}
  for(const dx of [-.16,.16])line(local(tower.ladderX,tower.ladderY+dx,0),local(tower.ladderX,tower.ladderY+dx,12),'#a46d34',5);for(let z=.2;z<12;z+=.35)line(local(tower.ladderX,tower.ladderY-.16,z),local(tower.ladderX,tower.ladderY+.16,z),'#a46d34',3);
 }
 shapes.sort((a,b)=>b.depth-a.depth);const body=shapes.map(s=>s.svg).join(''),frameEdge='<rect width="64" height="941" fill="#504739"/><rect x="64" width="12" height="941" fill="#aaa18c"/>';
 const picture=(posts='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#17272b"/>${body}${posts}${frameEdge}</svg>`;
 await writeFile(path.join(out,e.id+'-'+frame+'.svg'),picture());await sharp(Buffer.from(picture())).png().toFile(path.join(out,e.id+'-'+frame+'.png'));
 const markerShapes=[];for(const side of ['white','black']){const p=markerPosition(e,side),b=project(p,camera),t=project([p[0],p[1],2.1],camera);if(b.depth<=.2)continue;const h=b.y-t.y,w=h*.4/2.1;markerShapes.push(`<rect x="${b.x-w/2}" y="${t.y}" width="${w}" height="${h}" fill="${side==='white'?'#d7d5c5':'#343a35'}" stroke="#111"/>`);for(const z of side==='white'?[1.4]:[1.05,1.4])markerShapes.push(`<rect x="${b.x-w/2}" y="${project([p[0],p[1],z],camera).y}" width="${w}" height="${h*.055/2.1}" fill="${side==='white'?'#343a35':'#d7d5c5'}"/>`);}
 await sharp(Buffer.from(picture(markerShapes.join('')))).png().toFile(path.join(out,e.id+'-'+frame+'-posts.png'));
}
console.log(out);
