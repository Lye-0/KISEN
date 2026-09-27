import sharp from 'sharp';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
const source='C:/Users/kawau/.codex/generated_images/01a0e252-b185-7ae0-ad60-5d3b95cedb97';
const assets=[
 ['exec-fc05535d-2cd7-450e-aff6-fb1fd03fa561.png','scenes/train/arrival.webp'],
 ['exec-22e3f359-ebbc-4da5-ae8a-d8cfa24af0d1.png','scenes/train/explored.webp'],
 ['exec-8d50a23f-df9b-4357-ab29-0307990a7e8c.png','closeups/route/board.webp'],
 ['exec-2730d26e-532d-4992-b456-f8ceaacf2c95.png','closeups/ticket/desk.webp'],
 ['exec-80ed5608-1419-4b91-a75b-9f21e82e6eba.png','closeups/metal/box.webp'],
 ['exec-a5bc01c9-dd01-4ab6-bf9a-8e637ee4ab9c.png','closeups/metal/box-open.webp'],
 ['exec-7202a1d9-58f2-4af3-8513-e76dc539ed74.png','closeups/metal/box-empty.webp'],
 ['exec-f6fc244d-748f-4940-931d-e4861cfc914f.png','scenes/platform/main.webp'],
];
const manifest=[];
for(const [from,to] of assets){
 const out=path.resolve('public/assets',to);await mkdir(path.dirname(out),{recursive:true});
 await sharp(path.join(source,from)).webp({quality:91}).toFile(out);
 const {width,height,size}=await sharp(out).metadata();manifest.push({source:from,path:`/assets/${to}`,width,height,bytes:size,method:'built-in image_gen; WebP encoding only'});
}
await mkdir('docs/assets',{recursive:true});await writeFile('docs/assets/manifest.json',JSON.stringify(manifest,null,2));
console.log(`${manifest.length} image assets prepared`);
