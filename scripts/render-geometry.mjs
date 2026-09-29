import {project,towerCameras,poles,tower} from '../src/remake/geometry.ts';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/remake/geometry',{recursive:true});
for(const side of ['west','east']){
 const c=towerCameras[side],parts=[];
 const line=(a,b,color,width=5)=>{const p=project(a,c),q=project(b,c);parts.push({depth:(p.depth+q.depth)/2,svg:`<path d="M${p.x} ${p.y}L${q.x} ${q.y}" stroke="${color}" stroke-width="${width}" fill="none"/>`})};
 for(let i=0;i<4;i++){const a=tower.corners[i],b=tower.corners[(i+1)%4];line([...a,0],[...a,12],'#333b40',9);for(let z=0;z<=12;z+=3){line([...a,z],[...b,z],'#505a5d',7);if(z<12){line([...a,z],[...b,z+3],'#697276',5);line([...b,z],[...a,z+3],'#697276',5)}}}
 for(const y of [-1.22,-.68])line([-1.23,y,0],[-1.23,y,12],'#a56632',6);
 for(let z=.3;z<12;z+=.4)line([-1.24,-1.22,z],[-1.24,-.68,z],'#a56632',4);
 for(const pole of poles){const a=project(pole.base,c),b=project([pole.base[0],pole.base[1],pole.height],c),r=c.focal*pole.radius/a.depth;let svg=`<path d="M${a.x} ${a.y}L${b.x} ${b.y}" stroke="#272e31" stroke-width="${r*2}"/>`;if(pole.scar){const p=project([pole.base[0],pole.base[1],pole.scar],c);svg+=`<path d="M${p.x-2} ${p.y-20}v39" stroke="#f5f0dc" stroke-width="${r*1.8}"/>`}parts.push({depth:(a.depth+b.depth)/2,svg});}
 const repair=[[-.35,1.22,7.15],[.35,1.22,7.15],[0,1.22,7.8]].map(p=>project(p,c));parts.push({depth:repair.reduce((n,p)=>n+p.depth,0)/3,svg:`<path d="M${repair.map(p=>p.x+' '+p.y).join('L')}Z" fill="#bb5b25" stroke="#5c3627" stroke-width="3"/>`});
 parts.sort((a,b)=>b.depth-a.depth);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><rect width="1672" height="941" fill="#b0b7b7"/><path d="M0 760H1672V941H0Z" fill="#727a6f"/>${parts.map(p=>p.svg).join('')}</svg>`;
 await writeFile('docs/remake/geometry/tower-'+side+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile('docs/remake/geometry/tower-'+side+'.png');
}
console.log('Two construction views rendered from one geometry; these are authoring guides, not game assets.');

