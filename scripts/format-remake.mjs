import ts from 'typescript';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
const stage='C:/Users/kawau/Documents/MY DEVELOPMENT TEMP/脱出ゲーム/5_KISEN/replan/workbench/source';
const destination=path.resolve('src/remake');
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});
const requested=new Set(process.argv.slice(2));
let count=0;
for(const name of await readdir(stage)){
 if(!/\.tsx?$/.test(name)||requested.size&&!requested.has(name))continue;
 const file=path.join(stage,name),source=await readFile(file,'utf8');
 const syntax=ts.createSourceFile(name,source,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 if(syntax.parseDiagnostics.length)throw Error('Parse error in '+name);
 const formatted=printer.printFile(syntax);
 await writeFile(file,formatted);await writeFile(path.join(destination,name),formatted);count++;
}
console.log('Formatted '+count+' authored TypeScript files.');
