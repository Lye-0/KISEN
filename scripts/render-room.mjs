import {project,buildingCameras,stationBuilding} from '../src/remake/geometry.ts';
import sharp from 'sharp';
import {cargoInitial,cargoBoxes,validCargo} from '../src/remake/cargo.ts';
import {cargoOfficeDoor,cargoStairDoor} from '../src/remake/cargoGeometry.ts';
const argument=process.argv.find(a=>a.startsWith('--cargo='));
const cargoState=argument?argument.split('=')[1].split(',').map(Number):cargoInitial;
if(!validCargo(cargoState))throw Error('Invalid cargo configuration');
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('docs/remake/geometry',{recursive:true});
for(const room of stationBuilding.knownRooms){
 if(argument&&room.id!=='cargo')continue;
 const c=buildingCameras[room.id],parts=[];const left=room.from,right=room.to;
 const back=room.id==='cargo'?-6:-12,front=room.id==='cargo'?-11.65:-7,sign=room.id==='cargo'?-1:1;
 const poly=(ps,fill)=>{const projected=ps.map(p=>project(p,c));parts.push(`<path d="M${projected.map(p=>p.x+' '+p.y).join('L')}Z" fill="${fill}" stroke="#625848" stroke-width="3"/>`)};
 const ceiling=room.id==='cargo'?3.2:4.2;
 poly([[left,front,0],[right,front,0],[right,back,0],[left,back,0]],'#8b8070');
 poly([[left,front,ceiling],[right,front,ceiling],[right,back,ceiling],[left,back,ceiling]],'#b0a58e');
 poly([[left,front,0],[left,back,0],[left,back,ceiling],[left,front,ceiling]],'#c0b499');
 poly([[right,front,0],[right,back,0],[right,back,ceiling],[right,front,ceiling]],'#a79b83');
 poly([[left,back,0],[right,back,0],[right,back,ceiling],[left,back,ceiling]],'#d1c5a7');
 for(const x of stationBuilding.windowCenters.filter(x=>x>left&&x<right)){
 const top=room.id==='cargo'?2.9:3.3;
 poly([[x-.95,back+sign*.04,1],[x+.95,back+sign*.04,1],[x+.95,back+sign*.04,top],[x-.95,back+sign*.04,top]],'#4b4034');
 poly([[x-.82,back+sign*.06,1.14],[x+.82,back+sign*.06,1.14],[x+.82,back+sign*.06,top-.14],[x-.82,back+sign*.06,top-.14]],'#617f87');
 for(const dx of [-.27,.27])poly([[x+dx-.025,back+sign*.08,1.14],[x+dx+.025,back+sign*.08,1.14],[x+dx+.025,back+sign*.08,top-.14],[x+dx-.025,back+sign*.08,top-.14]],'#665640');
 poly([[x-.82,back+sign*.08,2.05],[x+.82,back+sign*.08,2.05],[x+.82,back+sign*.08,2.13],[x-.82,back+sign*.08,2.13]],'#665640');
 }
 if(room.id==='waiting'){
 // West-side street door appears at image right while facing south.
 poly([[.03,-9.7,0],[.03,-8.3,0],[.03,-8.3,2.5],[.03,-9.7,2.5]],'#554737');
 // East partition contains the actual service hatch and door to the office.
 poly([[5.97,-10.8,1.1],[5.97,-9.4,1.1],[5.97,-9.4,2.45],[5.97,-10.8,2.45]],'#705d42');
 poly([[5.97,-8.5,0],[5.97,-7.4,0],[5.97,-7.4,2.5],[5.97,-8.5,2.5]],'#554737');
 }
 if(room.id==='cargo'){
  poly(cargoOfficeDoor,'#554737');poly(cargoStairDoor,'#554737');
  const objectFaces=[];
  const face=(ps,color)=>{const q=ps.map(p=>project(p,c));objectFaces.push({depth:q.reduce((n,p)=>n+p.depth,0)/q.length,svg:`<path d="M${q.map(p=>p.x+' '+p.y).join('L')}Z" fill="${color}" stroke="#493d2d" stroke-width="3"/>`})};
  for(const b of cargoBoxes(cargoState)){const {x,y,w,d,h}=b;face([[x,y,h],[x+w,y,h],[x+w,y+d,h],[x,y+d,h]],'#b39365');face([[x,y,0],[x,y+d,0],[x,y+d,h],[x,y,h]],'#7d603d');face([[x+w,y,0],[x+w,y+d,0],[x+w,y+d,h],[x+w,y,h]],'#997747');face([[x,y,0],[x+w,y,0],[x+w,y,h],[x,y,h]],'#8b6943');}
  objectFaces.sort((a,b)=>b.depth-a.depth);parts.push(...objectFaces.map(p=>p.svg));
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><rect width="1672" height="941" fill="#b7ab93"/>${parts.join('')}</svg>`;
 await writeFile('docs/remake/geometry/room-'+room.id+(argument?'_'+cargoState.join('-'):'')+'.svg',svg);await sharp(Buffer.from(svg)).png().toFile('docs/remake/geometry/room-'+room.id+(argument?'_'+cargoState.join('-'):'')+'.png');
}
console.log('Interior bay guides: waiting=2, office=2, cargo=1.');


