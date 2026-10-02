import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {project,clipCameraPolygon} from '../src/remake/geometry.ts';
import {crossingCameras,oldRailPoint,oldBridge,northRoof,crossingRails,oldBuffer} from '../src/remake/crossingGeometry.ts';
const out=path.resolve(process.env.KISEN_REVIEW_DIR??'docs/remake/geometry/crossing');await mkdir(out,{recursive:true});
for(const [name,camera] of Object.entries(crossingCameras)){
 const shapes=[];
 const polygon=(pts,fill,stroke='#33372f',sw=1)=>{const clipped=clipCameraPolygon(pts,camera);if(clipped.length<3)return;const pp=clipped.map(p=>project(p,camera));shapes.push({depth:pp.reduce((v,p)=>v+p.depth,0)/pp.length,svg:`<polygon points="${pp.map(p=>p.x+','+p.y).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`});};
 const box=(a,b,color)=>{const[x,y,z]=a,[xx,yy,zz]=b;for(const p of [[[x,y,z],[xx,y,z],[xx,yy,z],[x,yy,z]],[[x,y,zz],[x,yy,zz],[xx,yy,zz],[xx,y,zz]],[[x,y,z],[x,y,zz],[xx,y,zz],[xx,y,z]],[[x,yy,z],[xx,yy,z],[xx,yy,zz],[x,yy,zz]],[[x,y,z],[x,yy,z],[x,yy,zz],[x,y,zz]],[[xx,y,z],[xx,y,zz],[xx,yy,zz],[xx,yy,z]]])polygon(p,color);};
 const strip=(a,b,width,fill)=>{const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*width/2,ny=dx/len*width/2;polygon([[a[0]+nx,a[1]+ny,a[2]],[a[0]-nx,a[1]-ny,a[2]],[b[0]-nx,b[1]-ny,b[2]],[b[0]+nx,b[1]+ny,b[2]]],fill);};
 polygon([[-90,-10,-.04],[30,-10,-.04],[30,70,-.04],[-90,70,-.04]],'#323b35','#323b35');shapes[shapes.length-1].depth=1e9;
 for(let y=20;y<50;y+=1){const a=oldRailPoint(y),b=oldRailPoint(y+1);strip([a[0],a[1],a[2]-.16],[b[0],b[1],b[2]-.16],3.2,'#4c514a');for(const x of [-1.3,1.3]){polygon([[a[0]+x,a[1],a[2]-.16],[b[0]+x,b[1],b[2]-.16],[b[0]+x,b[1],b[2]-.65],[a[0]+x,a[1],a[2]-.65]],'#775546');}}
 for(const y of oldBridge.pierYs){const p=oldRailPoint(y);box([p[0]-1.25,y-.6,0],[p[0]+1.25,y+.6,p[2]-.65],y===23?'#8b8a76':'#777768');if(y===23)box([p[0]-1.26,y-.62,1.5],[p[0]+1.26,y-.61,1.62],'#b4b29b');}
 for(const {id,points} of crossingRails())for(let seg=1;seg<points.length;seg++){const a=points[seg-1],b=points[seg],len=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/len,dy=(b[1]-a[1])/len,nx=-dy,ny=dx;for(let m=0;m<len;m+=.7){const t=m/len,p=a.map((n,i)=>n+(b[i]-n)*t);const h=id==='C-X'?.05:0;strip([p[0]-nx*1.05,p[1]-ny*1.05,p[2]+h],[p[0]+nx*1.05,p[1]+ny*1.05,p[2]+h],.17,'#5b584c');}for(const side of [-.62,.62])strip([a[0]+nx*side,a[1]+ny*side,a[2]+.13],[b[0]+nx*side,b[1]+ny*side,b[2]+.13],.09,id==='E-F'?'#56dce6':id==='C-X'?'#e9af58':'#b6b5a3');}
 const bp=oldBuffer;box([bp[0]-1.15,bp[1]-.2,bp[2]+.1],[bp[0]+1.15,bp[1]+.15,bp[2]+1.1],'#775547');
 // The long northern canopy is a foreground occluder, not another rail connection.
 const r=northRoof;box([r.west,r.south,r.bottom],[r.east,r.north,r.top],'#535a52');for(const x of [-15,-9,-3,3,9,15])for(const y of [7.2,9.8])box([x-.07,y-.07,0],[x+.07,y+.07,r.bottom],'#6b7469');
 // Site D pylon, visible to the south; portal F faces east.
 const portal=[-61,36];box([portal[0]-.35,portal[1]-3,0],[portal[0]+.35,portal[1]+3,5.8],'#7d8173');box([portal[0]-.36,portal[1]-2.5,0],[portal[0]+.36,portal[1]+2.5,4.95],'#151f1d');
 shapes.sort((a,b)=>b.depth-a.depth);const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#17272b"/>${shapes.map(s=>s.svg).join('')}</svg>`;
 await writeFile(path.join(out,name+'.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(path.join(out,name+'.png'));
}
console.log(out);
