import {project,buildingCameras,stationBuilding} from '../src/remake/geometry.ts';
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/remake/geometry',{recursive:true});
for(const name of ['street','bridge']){
 const c=buildingCameras[name],parts=[],roofMasks=[];
 const poly=(points,fill,stroke='#665c4c')=>{const ps=points.map(p=>project(p,c));parts.push({depth:ps.reduce((n,p)=>n+p.depth,0)/ps.length,svg:`<path d="M${ps.map(p=>p.x+' '+p.y).join('L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`})};
 const roof=(points,fill)=>{poly(points,fill);roofMasks.push(parts.at(-1).svg.replace(/fill="[^"]+"/,'fill="black"').replace(/stroke="[^"]+"/,'stroke="black"'));};
 const front=-12,back=-6,height=4.2;
 const south=c.position[1]<front,north=c.position[1]>back,west=c.position[0]<0,east=c.position[0]>18;
 if(south)poly([[0,front,0],[18,front,0],[18,front,height],[0,front,height]],'#d1c5a7');
 if(north)poly([[0,back,0],[18,back,0],[18,back,height],[0,back,height]],'#d1c5a7');
 if(west){poly([[0,front,0],[0,back,0],[0,back,height],[0,front,height]],'#b5a78c');poly([[0,front,height],[0,back,height],[0,-9,5.7]],'#b5a78c');}
 if(east){poly([[18,front,0],[18,back,0],[18,back,height],[18,front,height]],'#b5a78c');poly([[18,front,height],[18,back,height],[18,-9,5.7]],'#b5a78c');}
 if(-1.5*(c.position[1]-(front-.4))+3.4*(c.position[2]-height)>0)roof([[-.3,front-.4,height],[18.3,front-.4,height],[18.3,-9,5.7],[-.3,-9,5.7]],'#5c605d');
 if(1.5*(c.position[1]-(back+.4))+3.4*(c.position[2]-height)>0)roof([[-.3,back+.4,height],[18.3,back+.4,height],[18.3,-9,5.7],[-.3,-9,5.7]],'#484e4c');
 parts.sort((a,b)=>b.depth-a.depth);const background=parts.map(p=>p.svg).join('');parts.length=0;
 if(west)poly([[-.03,-9.7,0],[-.03,-8.3,0],[-.03,-8.3,2.5],[-.03,-9.7,2.5]],'#44382c');
 const window=(x,y,w=1.9)=>{poly([[x-w/2,y,1],[x+w/2,y,1],[x+w/2,y,3.3],[x-w/2,y,3.3]],'#4b4034');poly([[x-w/2+.12,y,1.14],[x+w/2-.12,y,1.14],[x+w/2-.12,y,3.16],[x-w/2+.12,y,3.16]],'#8a9e91');for(const dx of [-w/6,w/6])poly([[x+dx-.025,y,1.14],[x+dx+.025,y,1.14],[x+dx+.025,y,3.16],[x+dx-.025,y,3.16]],'#665640');poly([[x-w/2+.12,y,2.05],[x+w/2-.12,y,2.05],[x+w/2-.12,y,2.13],[x-w/2+.12,y,2.13]],'#665640');};
 if(south){for(let i=0;i<=6;i++){const x=i*3;poly([[x-.06,front-.025,0],[x+.06,front-.025,0],[x+.06,front-.025,4.2],[x-.06,front-.025,4.2]],'#695a45');}for(const x of stationBuilding.windowCenters)window(x,front-.08);}
 if(north){for(const x of [0,6,12,15,18])poly([[x-.06,back+.025,0],[x+.06,back+.025,0],[x+.06,back+.025,4.2],[x-.06,back+.025,4.2]],'#695a45');window(1,back+.08,1.35);window(5,back+.08,1.35);window(7.5,back+.08,1.5);window(10.5,back+.08,1.5);poly([[2,back+.08,0],[4,back+.08,0],[4,back+.08,2.7],[2,back+.08,2.7]],'#44382c');poly([[12.8,back+.08,0],[14.2,back+.08,0],[14.2,back+.08,2.7],[12.8,back+.08,2.7]],'#44382c');}
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#a4b1b0"/><rect y="440" width="1672" height="501" fill="#686c62"/>${background}<defs><mask id="below-roof"><rect width="1672" height="941" fill="white"/>${roofMasks.join('')}</mask></defs><g mask="url(#below-roof)">${parts.map(p=>p.svg).join('')}</g></svg>`;
 await writeFile('docs/remake/geometry/building-'+name+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile('docs/remake/geometry/building-'+name+'.png');
}
console.log('Guides render only building faces visible from their physical camera locations.');
