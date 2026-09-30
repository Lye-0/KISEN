import {createReadStream} from 'node:fs';
import {writeFile,mkdir} from 'node:fs/promises';
import {createInterface} from 'node:readline';
import ts from 'typescript';
const file='C:/Users/kawau/.codex/sessions/2026/09/27/rollout-2026-09-27T19-04-25-01a0e252-b185-7ae0-ad60-5d3b95cedb97.jsonl';
const rows=[];let active=false;
for await(const line of createInterface({input:createReadStream(file),crlfDelay:Infinity})){
 if(!line.includes('image_gen__imagegen'))continue;
 let entry;try{entry=JSON.parse(line)}catch{continue}
 const p=entry.payload;
 const source=p?.input??p?.arguments;if(typeof source!=='string')continue;if(source.includes('remakeTrainGeneration'))active=true;
 let calls=0;const syntax=ts.createSourceFile('call.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);const visit=node=>{if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.expression.getText(syntax)==='tools'&&node.expression.name.text==='image_gen__imagegen')calls++;ts.forEachChild(node,visit);};visit(syntax);
 if(active&&calls)rows.push({timestamp:entry.timestamp,callId:p.call_id,tool:p.name,source});
}
await mkdir('docs/remake/prompts',{recursive:true});await writeFile('docs/remake/prompts/imagegen-calls.json',JSON.stringify(rows,null,2)+'\n');console.log('Saved '+rows.length+' exact image-generation call records.');



