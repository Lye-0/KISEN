import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const generated='C:/Users/kawau/.codex/generated_images/01a0e252-b185-7ae0-ad60-5d3b95cedb97';
const entries=[
 ['train/north','a81c6887-c55b-41cc-b9d0-49f654f0fe43'],
 ['train/north-bag-open','f27c78a4-b246-4dab-abb2-77b928e2af8e'],
 ['train/north-strap-aside','a8bf38a7-c964-430f-8c27-d115bae09bd2'],
 ['train/north-unlatched','9eec69da-79a4-4801-a2e4-173dde4c919f'],
 ['train/north-clasp-only','337eddd6-cd9f-4bfb-b312-4742653a0231'],
 ['train/north-empty','0e1f4d8e-3b53-4a18-b2ab-5b0c6af435c0'],
 ['bag/closed','8f8bac7c-59f2-4087-a801-162350dd2414'],
 ['bag/strap-aside','83b02196-e628-4a8c-b1c7-7ccb7b8506d6'],
 ['bag/unlatched','0a3ea4ee-dffb-4b58-9c4a-d20c50fd4bf8'],
 ['bag/clasp-only','72091297-2239-4e03-b819-0b6a68000fa3'],
 ['bag/open','912d0ca5-f5d5-4544-9ece-cb5b0ac216c8'],
 ['bag/empty','4d73b2a4-be36-49c0-9a1d-7b73202a8c67'],
];
const manifest=[];
for(const [id,uuid] of entries){const source=path.join(generated,'exec-'+uuid+'.png');const file='public/assets/remake/'+id+'.webp';await mkdir(path.dirname(file),{recursive:true});await sharp(source).webp({quality:94,effort:5}).toFile(file);manifest.push({id,source,file,status:'representative-review',method:'built-in image_gen; WebP encoding only'});}
await mkdir('docs/remake',{recursive:true});await writeFile('docs/remake/assets.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Encoded '+manifest.length+' representative assets.');
