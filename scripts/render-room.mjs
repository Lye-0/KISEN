import {project,buildingCameras,stationBuilding} from '../src/remake/geometry.ts';
import sharp from 'sharp';
import {cargoInitial,cargoBoxes,validCargo} from '../src/remake/cargo.ts';
const argument=process.argv.find(a=>a.startsWith('--cargo='));
const cargoState=argument?argument.split('=')[1].split(',').map(Number):cargoInitial;
if(!validCargo(cargoState))throw Error('Invalid cargo configuration');
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/remake/geometry',{recursive:true});
for(const room of stationBuilding.knownRooms){
 if(argument&&room.id!=='cargo')continue;
 const c=buildingCameras[room.id],parts=[];const left=room.from,right=room.to;
 const poly=(ps,fill)=>{const projected=ps.map(p=>project(p,c));parts.push(`<path d="M${projected.map(p=>p.x+' '+p.y).join('L')}Z" fill="${fill}" stroke="#625848" stroke-width="3"/>`)};
 poly([[left,-7,0],[right,-7,0],[right,-12,0],[left,-12,0]],'#8b8070');
 poly([[left,-7,4.2],[right,-7,4.2],[right,-12,4.2],[left,-12,4.2]],'#b0a58e');
 poly([[left,-7,0],[left,-12,0],[left,-12,4.2],[left,-7,4.2]],'#c0b499');
 poly([[right,-7,0],[right,-12,0],[right,-12,4.2],[right,-7,4.2]],'#a79b83');
 poly([[left,-12,0],[right,-12,0],[right,-12,4.2],[left,-12,4.2]],'#d1c5a7');
 for(const x of stationBuilding.windowCenters.filter(x=>x>left&&x<right)){
 poly([[x-.95,-11.96,1],[x+.95,-11.96,1],[x+.95,-11.96,3.3],[x-.95,-11.96,3.3]],'#4b4034');
 poly([[x-.82,-11.94,1.14],[x+.82,-11.94,1.14],[x+.82,-11.94,3.16],[x-.82,-11.94,3.16]],'#617f87');
 for(const dx of [-.27,.27])poly([[x+dx-.025,-11.92,1.14],[x+dx+.025,-11.92,1.14],[x+dx+.025,-11.92,3.16],[x+dx-.025,-11.92,3.16]],'#665640');
 poly([[x-.82,-11.92,2.05],[x+.82,-11.92,2.05],[x+.82,-11.92,2.13],[x-.82,-11.92,2.13]],'#665640');
 }
 if(room.id==='waiting'){
 // West-side street door appears at image right while facing south.
 poly([[.03,-9.7,0],[.03,-8.3,0],[.03,-8.3,2.5],[.03,-9.7,2.5]],'#554737');
 // East partition contains the actual service hatch and door to the office.
 poly([[5.97,-10.8,1.1],[5.97,-9.4,1.1],[5.97,-9.4,2.45],[5.97,-10.8,2.45]],'#705d42');
 poly([[5.97,-8.5,0],[5.97,-7.4,0],[5.97,-7.4,2.5],[5.97,-8.5,2.5]],'#554737');
 }
 if(room.id==='cargo'){
  const objectFaces=[];
  const face=(ps,color)=>{const q=ps.map(p=>project(p,c));objectFaces.push({depth:q.reduce((n,p)=>n+p.depth,0)/q.length,svg:`<path d="M${q.map(p=>p.x+' '+p.y).join('L')}Z" fill="${color}" stroke="#493d2d" stroke-width="3"/>`})};
  for(const b of cargoBoxes(cargoState)){const {x,y,w,d,h}=b;face([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],'#b39365');face([[x,y,0],[x,y+d,0],[x,y+d,h],[x,y,h]],'#7d603d');face([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#997747');face([[x,y+d,0],[x+w,y+d,0],[x+w,y+d,h],[x,y+d,h]],'#8b6943');}
  objectFaces.sort((a,b)=>b.depth-a.depth);parts.push(...objectFaces.map(p=>p.svg));
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#b7ab93"/>${parts.join('')}</svg>`;
 await writeFile('docs/remake/geometry/room-'+room.id+(argument?'_'+cargoState.join('-'):'')+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile('docs/remake/geometry/room-'+room.id+(argument?'_'+cargoState.join('-'):'')+'.png');
}
console.log('Interior bay guides: waiting=2, office=2, cargo=1.');


