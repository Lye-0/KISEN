import {project,buildingCameras,stationBuilding} from '../src/remake/geometry.ts';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/remake/geometry',{recursive:true});
for(const name of ['street','bridge']){
 const c=buildingCameras[name],parts=[];
 const poly=(points,fill,stroke='#665c4c')=>{const ps=points.map(p=>project(p,c));parts.push({depth:ps.reduce((n,p)=>n+p.depth,0)/ps.length,svg:`<path d="M${ps.map(p=>p.x+' '+p.y).join('L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`})};
 const front=-12,back=-6,height=4.2;
 poly([[0,front,0],[18,front,0],[18,front,height],[0,front,height]],'#d1c5a7');
 poly([[0,front,0],[0,back,0],[0,back,height],[0,front,height]],'#b5a78c');
 poly([[18,front,0],[18,back,0],[18,back,height],[18,front,height]],'#b5a78c');
 poly([[-.3,front-.4,height],[18.3,front-.4,height],[18.3,-9,5.7],[-.3,-9,5.7]],'#5c605d');
 poly([[-.3,back+.4,height],[18.3,back+.4,height],[18.3,-9,5.7],[-.3,-9,5.7]],'#484e4c');
 poly([[0,front,height],[0,back,height],[0,-9,5.7]],'#b5a78c');
 poly([[18,front,height],[18,back,height],[18,-9,5.7]],'#b5a78c');
 // Render façade objects after the façade, since they lie on the same plane.
 parts.sort((a,b)=>b.depth-a.depth);
 const background=parts.map(p=>p.svg).join('');parts.length=0;
 poly([[-.03,-9.7,0],[-.03,-8.3,0],[-.03,-8.3,2.5],[-.03,-9.7,2.5]],'#44382c');
 for(let i=0;i<=6;i++){const x=i*3;poly([[x-.06,front-.025,0],[x+.06,front-.025,0],[x+.06,front-.025,4.2],[x-.06,front-.025,4.2]],'#695a45')}
 for(const x of stationBuilding.windowCenters){
 poly([[x-.95,front-.04,1],[x+.95,front-.04,1],[x+.95,front-.04,3.3],[x-.95,front-.04,3.3]],'#4b4034');
 poly([[x-.82,front-.06,1.14],[x+.82,front-.06,1.14],[x+.82,front-.06,3.16],[x-.82,front-.06,3.16]],'#8a9e91');
 for(const dx of [-.27,.27])poly([[x+dx-.025,front-.08,1.14],[x+dx+.025,front-.08,1.14],[x+dx+.025,front-.08,3.16],[x+dx-.025,front-.08,3.16]],'#665640');
 poly([[x-.82,front-.08,2.05],[x+.82,front-.08,2.05],[x+.82,front-.08,2.13],[x-.82,front-.08,2.13]],'#665640');
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#a4b1b0"/><rect y="440" width="1672" height="501" fill="#686c62"/>${background}${parts.map(p=>p.svg).join('')}</svg>`;
 await writeFile('docs/remake/geometry/building-'+name+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile('docs/remake/geometry/building-'+name+'.png');
}
console.log('Building street and bridge guides share six actual bays.');

