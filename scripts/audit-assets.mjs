import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const manifest=JSON.parse(await readFile('docs/assets/manifest.json','utf8'));
const errors=[];const known=new Set(manifest.map(a=>a.path));let total=0;
async function files(dir){return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat()}
for(const asset of manifest){
 try{const filename=path.join('public',asset.path);const m=await sharp(filename).metadata();const bytes=(await stat(filename)).size;total+=bytes;
  if(m.width!==asset.width||m.height!==asset.height)errors.push(`寸法不一致: ${asset.path}`);
  if(!m.width||!m.height||bytes===0)errors.push(`空の画像: ${asset.path}`);
  if(asset.path.startsWith('/assets/items/')&&!m.hasAlpha)errors.push(`持ち物画像にアルファがない: ${asset.path}`);
 }catch(e){errors.push(`読込不能: ${asset.path}: ${e.message}`)}
}
for(const filename of await files('public/assets')){const url='/'+filename.replaceAll('\\','/').replace(/^public\//,'');if(!known.has(url))errors.push(`採用一覧外のファイル: ${url}`)}
for(const filename of await files('src')){
 const source=await readFile(filename,'utf8');for(const match of source.matchAll(/["'](\/assets\/[^"'`]+\.(?:png|webp|jpg|svg))["']/g)){if(!known.has(match[1]))errors.push(`未登録の参照 ${filename}: ${match[1]}`)}
}
// Dynamic room and terminal scene paths must also resolve.
for(const room of ['platform','waiting','forecourt','office','lost','bridge','store','lamp','tunnel','closed','return'])if(!known.has(`/assets/scenes/${room}/main.webp`))errors.push(`全景がない: ${room}`);
for(const suffix of ['early','late'])if(!known.has(`/assets/ending/home-${suffix}.webp`))errors.push(`終幕差分がない: ${suffix}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`${manifest.length}点の採用素材、${(total/1048576).toFixed(1)} MiB。寸法・アルファ・静的参照・採用一覧外ファイルを検査。動的URLと画像内容はブラウザ検証で補完。`);
