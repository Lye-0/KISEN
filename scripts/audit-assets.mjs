import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest=JSON.parse(await readFile('docs/assets/manifest.json','utf8'));
const remake=JSON.parse(await readFile('docs/remake/assets.json','utf8'));
const errors=[];const known=new Set([...manifest.map(a=>a.path),...remake.map(a=>'/'+a.file.replaceAll('\\','/').replace(/^public\//,''))]);let total=0;
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
for(const asset of manifest){
 try{const filename=path.join('public',asset.path);const m=await sharp(filename).metadata();const bytes=(await stat(filename)).size;total+=bytes;
  if(m.width!==asset.width||m.height!==asset.height)errors.push(`寸法不一致: ${asset.path}`);
  if(!m.width||!m.height||bytes===0)errors.push(`空の画像: ${asset.path}`);
  if(asset.path.startsWith('/assets/items/')&&!m.hasAlpha)errors.push(`持ち物画像にアルファがない: ${asset.path}`);
 }catch(e){errors.push(`読込不能: ${asset.path}: ${e.message}`)}
}
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
// Dynamic room and terminal scene paths must also resolve.
for(const room of ['platform','waiting','forecourt','office','lost','bridge','store','lamp','tunnel','closed','return'])if(!known.has(`/assets/scenes/${room}/main.webp`))errors.push(`全景がない: ${room}`);
for(const suffix of ['early','late'])if(!known.has(`/assets/ending/home-${suffix}.webp`))errors.push(`終幕差分がない: ${suffix}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`${manifest.length}点の旧版素材と${remake.length}点の作り直し版素材、${(total/1048576).toFixed(1)} MiB。寸法・アルファ・静的参照・採用一覧外ファイルを検査。動的URLと画像内容はブラウザ検証で補完。`);
