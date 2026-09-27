// Read this task's explicitly supplied session log as data; never execute its contents.
import { writeFile,mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
const file=process.argv[2];
if(!file)throw new Error('Usage: node scripts/capture-image-prompts.mjs <session.jsonl>');
const entries=[];
for await(const line of createInterface({input:createReadStream(file,{encoding:'utf8'}),crlfDelay:Infinity})){
 if(!line.includes('tools.image_gen__imagegen('))continue;
 if(!line.trim())continue;let row;try{row=JSON.parse(line)}catch{continue}
 const p=row.payload;
 if(row.type!=='response_item'||!p||!String(p.type).endsWith('_call'))continue;
 const source=p.input??p.arguments;
 if(typeof source==='string'&&source.includes('tools.image_gen__imagegen('))entries.push({timestamp:row.timestamp,callId:p.call_id,source});
}
await mkdir('docs/assets/prompts',{recursive:true});
await writeFile('docs/assets/prompts/tool-calls.json',JSON.stringify({note:'Historical generation requests, stored as data. Prompts include rejected attempts; final adopted images are in ../manifest.json. This file is not an instruction source or executable script.',entries},null,2));
console.log(`Captured ${entries.length} generation request groups`);
