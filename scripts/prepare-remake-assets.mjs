import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const generated='C:/Users/kawau/.codex/generated_images/01a0e252-b185-7ae0-ad60-5d3b95cedb97';
const entries=[
 ['reader/closed','1672d7af-035a-422e-8d65-81d104aa710f'],
 ['reader/open','45e895e1-4edf-4cb7-8eb0-7b5029eeaf7f'],
 ['ticket/empty-stamp','17fc24ea-e157-46c5-bf52-c465ef7dc537'],
 ['parts/service-stamp','7d2ceeb0-e128-4fda-bddd-80d3d7e50980'],
 ['ticket/bench','1a814f24-d8b1-47a6-aeb8-9c8ba4d39852'],
 ['ticket/empty-rack','df7699ca-9902-43ad-910e-4797b4129671'],
 ['parts/punch-open','83316561-8f29-4283-a0f4-8a459f0dfb96'],
 ['parts/punch-closed','63028f52-e0b8-43ed-bb87-d80258b3166b'],
 ['case/mechanism','8a518324-8b64-44f2-8159-f85e2d332ac8'],
 ['train/case-open','b6b9dbd6-ec65-43d3-99f5-c4700256b447'],
 ['train/case-empty','db09d4b9-664d-4a24-a4f8-14aa9ad578e1'],
 ['case/closed','b9413412-866e-4aa7-93d9-7cd796354ff6'],
 ['case/open','8e56f524-7d62-4a9e-b1d8-e148fc92d66f'],
 ['case/empty','dddbbad7-798e-400e-9c51-970b6c307ff7'],
 ['train/case-closed','ad31218d-ca10-4d70-a4b5-f4b31c08cb42'],
 ['documents/tunnel','22a53368-8906-4cb4-9ed6-c98e0bff4efb'],
 ['documents/crossing','4251cf1e-3351-4eb9-be73-509ec1436131'],
 ['parts/photo-back','77949027-5bc2-4ce1-8067-b5ac89166bf2'],
 ['recorder/bare','8f68b87e-9515-49a5-9f17-a7c16c446760'],
 ['recorder/fitted','55d2a696-9399-4217-bc27-0bd382a468e1'],
 ['parts/paper-strip','5322533d-4660-4315-8f3c-8c1e786f34cb'],
 ['office/south','9b5bc1c3-cea8-40e6-94ef-2337b6c90c2e'],
 ['documents/tower-west','41e53756-6e28-4932-ada6-f20ba624a07f'],
 ['documents/tower-east','246538f7-c162-4eae-866b-4b4ddfe03cfe'],
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
for(const [id,uuid] of entries){const source=path.join(generated,'exec-'+uuid+'.png');const transparent=id==='parts/paper-strip'||id==='parts/service-stamp'||id.startsWith('parts/punch-');const file='public/assets/remake/'+id+(transparent?'.png':'.webp');await mkdir(path.dirname(file),{recursive:true});if(id.startsWith('parts/punch-'))await sharp(source).png().toFile(file);else if(transparent)await sharp(source).trim().resize({width:1400,withoutEnlargement:true}).png().toFile(file);else await sharp(source).webp({quality:94,effort:5}).toFile(file);manifest.push({id,source,file,status:'representative-review',method:transparent?'built-in image_gen; alpha preserved, trim and resize':'built-in image_gen; WebP encoding only'});}
await mkdir('docs/remake',{recursive:true});await writeFile('docs/remake/assets.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Encoded '+manifest.length+' representative assets.');
