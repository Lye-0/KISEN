import sharp from 'sharp';
import { writeFile,mkdir } from 'node:fs/promises';
import { platformPolygon as polygon, platformPoint as point, lampRowY } from '../src/remake/platformGeometry.ts';
import { planks,mounts } from '../src/remake/stopping.ts';
const out='C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/replan/verification/2026-09-30-stopping';
await mkdir(out,{recursive:true});
let parts=[];
const poly=(p,fill,stroke='#313a3c')=>parts.push(`<polygon points="${polygon(p)}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`);
poly([[-80,-20,-.9],[80,-20,-.9],[80,7,-.9],[-80,7,-.9]],'#2b3032');
// Far platform and only the minimal existing station building.
poly([[-20,-4,0],[30,-4,0],[30,-1,0],[-20,-1,0]],'#3c4240');
poly([[0,-6,0],[18,-6,0],[18,-6,3],[0,-6,3]],'#42473f');
poly([[-.3,-6.3,3.2],[18.3,-6.3,3.2],[18.3,-9,4.2],[-.3,-9,4.2]],'#262c2b');
for(const x of [1.5,4.5,7.5,10.5,13.5,16.5])poly([[x-.7,-5.98,1],[x+.7,-5.98,1],[x+.7,-5.98,2.5],[x-.7,-5.98,2.5]],'#172222');
for(const y of [.45,1.55,4.45,5.55])poly([[-40,y-.035,-.65],[40,y-.035,-.65],[40,y+.035,-.65],[-40,y+.035,-.65]],'#7b8380');
poly([[-20,7,-.9],[30,7,-.9],[30,7,0],[-20,7,0]],'#323b38');
poly([[-20,7,0],[30,7,0],[30,10,0],[-20,10,0]],'#525950');
for(const [a,b] of planks)poly([[a,6.22,.04],[b,6.22,.04],[b,7.1,.04],[a,7.1,.04]],'#aa9670');
// Fixed reference post, slightly behind the boarding edge so it remains visible.
poly([[-.04,6.7,0],[.04,6.7,0],[.04,6.7,1.4],[-.04,6.7,1.4]],'#c0bba8');
for(const x of mounts){const q=point(x,lampRowY);parts.push(`<ellipse cx="${q.x}" cy="${q.y}" rx="9" ry="4" fill="#181d1a" stroke="#868274"/>`);}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941"><rect width="1672" height="941" fill="#101b20"/>${parts.join('')}</svg>`;
await writeFile(out+'/platform-guide.svg',svg);await sharp(Buffer.from(svg)).png().toFile(out+'/platform-guide.png');
console.log(out+'/platform-guide.png');
