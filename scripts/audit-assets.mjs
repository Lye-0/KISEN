import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const remake=JSON.parse(await readFile('docs/remake/assets.json','utf8'));
const errors=[];const known=new Set([...remake.map(a=>'/'+a.file.replaceAll('\\','/').replace(/^public\//,''))]);let total=0;
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
for(const asset of remake){
 const filename=asset.file.replaceAll('\\','/');
 try{const bytes=(await stat(filename)).size;total+=bytes;if(!bytes)errors.push(`空の素材: ${asset.id}`);
  const ext=path.extname(filename);if(ext==='.wav'){const header=(await readFile(filename)).subarray(0,12);if(header.toString('ascii',0,4)!=='RIFF'||header.toString('ascii',8,12)!=='WAVE')errors.push(`不正な音声: ${asset.id}`)}
  else{const m=await sharp(filename).metadata();if(!m.width||!m.height)errors.push(`空の画像: ${asset.id}`);if(asset.method?.includes('alpha preserved')&&!m.hasAlpha)errors.push(`アルファがない: ${asset.id}`)}
 }catch(e){errors.push(`読込不能: ${asset.id}: ${e.message}`)}
}
for(const filename of await files('public/assets')){const url='/'+filename.replaceAll('\\','/').replace(/^public\//,'');if(!known.has(url))errors.push(`採用一覧外のファイル: ${url}`)}
for(const filename of await files('src')){
 const source=await readFile(filename,'utf8');for(const match of source.matchAll(/["'](?:\.)?(\/assets\/[^"'`]+\.(?:png|webp|jpg|svg))["']/g)){if(!known.has(match[1]))errors.push(`未登録の参照 ${filename}: ${match[1]}`)}
}
// Check finite dynamic families in addition to literal references.
const dynamicIds = [
 ...['regular-0','regular-1','wye-0','wye-1','wye-2'].map(id => `points/${id}.webp`),
 ...['b-white','b-black','c-black','d-white','e-white','e-white-c','e-black'].flatMap(id => [0,1].map(frame => `journeys/${id}-${frame}.webp`)),
 ...[0,1].map(view => `tunnel/glass-${view}.webp`),
 ...['A','B'].map(tape => `audio/tape-${tape}.wav`),
];
for(const id of dynamicIds)if(!known.has(`/assets/remake/${id}`))errors.push(`動的参照がない: ${id}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`${remake.length}点の素材、${(total/1048576).toFixed(1)} MiB。寸法・アルファ・静的参照・採用一覧外ファイルを検査。動的URLと画像内容はブラウザ検証で補完。`);
