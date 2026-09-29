import {tapeSamples,wav} from '../src/remake/recordings.ts';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('public/assets/remake/audio',{recursive:true});
for(const tape of ['A','B'])await writeFile(`public/assets/remake/audio/tape-${tape}.wav`,new Uint8Array(wav(tapeSamples(tape))));
console.log('Two deterministic 20-second recordings generated.');
