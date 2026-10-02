import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {project} from '../src/remake/geometry.ts';
import {sites,railLines} from '../src/remake/routeGeometry.ts';
import {crossingCameras} from '../src/remake/crossingGeometry.ts';
const dir='docs/remake/geometry/crossing-readable-2026-10-02';
for(const [name,c] of Object.entries(crossingCameras)){
 let svg=await readFile(`${dir}/${name}.svg`,'utf8');
 const point=(id)=>project([sites[id].x,sites[id].y,.15],c);
 const paths=['B-E','C-E','E-F','F-D','R-F'].map(id=>{const ps=railLines[id].map(point).filter(p=>p.depth>0);return `<path d="${ps.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')}" fill="none" stroke="${id==='E-F'?'#39f1ff':'#f4df8b'}" stroke-width="${id==='E-F'?6:3}"/>`;}).join('');
 const dots=['E','F'].map(id=>{const p=point(id);return `<circle cx="${p.x}" cy="${p.y}" r="8" fill="#ff714e"/><text x="${p.x}" y="${p.y+45}" text-anchor="middle" font-size="26" fill="white">${id==='E'?'GROUND JUNCTION':'TUNNEL-SIDE JUNCTION'}</text>`;}).join('');
 svg=svg.replace('</svg>',paths+dots+'</svg>');await writeFile(`${dir}/${name}-routes.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${dir}/${name}-routes.png`);
}
