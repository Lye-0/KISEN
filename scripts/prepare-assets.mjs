import sharp from 'sharp';
import { mkdir,writeFile,readFile,rename,stat } from 'node:fs/promises';
import path from 'node:path';
const source='C:/Users/kawau/.codex/generated_images/01a0e252-b185-7ae0-ad60-5d3b95cedb97';
const assets=[
 ['exec-6c903d76-ca40-44b7-b853-4e74d05a5092.png','scenes/train/arrival.webp'],
 ['exec-22e3f359-ebbc-4da5-ae8a-d8cfa24af0d1.png','scenes/train/explored.webp'],
 ['exec-8d50a23f-df9b-4357-ab29-0307990a7e8c.png','closeups/route/board.webp'],
 ['exec-ce4fa08c-e01a-41f1-a26b-61c9621ced10.png','closeups/ticket/desk.webp'],
 ['exec-80ed5608-1419-4b91-a75b-9f21e82e6eba.png','closeups/metal/box.webp'],
 ['exec-a5bc01c9-dd01-4ab6-bf9a-8e637ee4ab9c.png','closeups/metal/box-open.webp'],
 ['exec-7202a1d9-58f2-4af3-8513-e76dc539ed74.png','closeups/metal/box-empty.webp'],
 ['exec-9933eab4-070d-4a5d-92ef-f80b18f30eb3.png','scenes/platform/main.webp'],
 ['exec-9f059b78-c96a-4f1d-b102-612ebf38dd9d.png','scenes/waiting/main.webp'],
 ['exec-fa926ec2-ae9d-4037-bb59-03dd61c7b71e.png','closeups/ticket/empty.webp'],
 ['exec-0e741a76-a0a8-4f92-8e15-dc64d8a60f84.png','parts/ticket/paper.png'],
 ['exec-60aad8c4-7b06-43ca-84d8-a5936bfba8c5.png','documents/home-photo.webp'],
 ['exec-203b8636-4fd3-45b6-a9c2-a396fa5887af.png','documents/window/frame-4.webp'],
 ['exec-885d8e1d-e160-4658-8de9-0df8dbda1153.png','documents/window/frame-2.webp'],
 ['exec-9752b2da-0156-4cfe-a33e-17b48a177c6a.png','documents/window/frame-3.webp'],
 ['exec-36050091-8e7c-43ba-b37d-841e8fd61ea6.png','documents/window/frame-1.webp'],
 ['exec-1418e6d2-8bea-452c-8a69-bcafaa6f6a82.png','documents/window/frame-0.webp'],
 ['exec-03c06c2e-809e-4236-be6f-c3afb1768609.png','scenes/forecourt/main.webp'],
 ['exec-03c06c2e-809e-4236-be6f-c3afb1768609.png','documents/wall.webp'],
 ['exec-7c86e901-5db1-41b1-94cd-af43afc996bb.png','scenes/bridge/main.webp'],
 ['exec-be335911-cd7f-40ad-8bca-584677dd67dd.png','scenes/forecourt/loop.webp'],
 ['exec-e95328c4-85c1-4541-b575-daa25bc6d5f9.png','scenes/train/box-open.webp'],
 ['exec-435058dd-89d7-4983-8052-9c6e64dd3e34.png','closeups/bag/closed.webp'],
 ['exec-a3155e0d-03ce-4db0-870f-688750b0950c.png','closeups/route-case/closed.webp'],
 ['exec-4e9e39e4-8a39-4ad2-baee-65ea5229be34.png','parts/document/paper.png'],
 ['exec-bb35aec0-e38b-4480-8238-2ffe8173f5b1.png','scenes/office/main.webp'],
 ['exec-98498657-375e-4e34-8a69-171729d15a21.png','scenes/lost/main.webp'],
 ['exec-369d0059-b9ab-485c-b50e-3800fe498100.png','scenes/store/main.webp'],
 ['exec-f2ebd853-bda6-4be2-89f9-36c304717fce.png','closeups/bag/latch.webp'],
 ['exec-e6367e6e-89fb-4e32-b611-9110e51b0bd0.png','closeups/route-case/open.webp'],
 ['exec-c1703170-2ac7-42c5-9ab5-514c3673ba23.png','closeups/route-case/empty.webp'],
 ['exec-404ed63f-9ee6-456b-9710-5346f1756f34.png','closeups/bag/open.webp'],
 ['exec-7fd437ac-fe06-4af3-b275-d4d6496eb06f.png','closeups/bag/empty.webp'],
 ['exec-b5f9921e-5a2c-4f52-8e73-057f80bb8e5e.png','scenes/lamp/main.webp'],
 ['exec-5b307bc3-8dda-4e8a-95e0-9df037d51ccb.png','scenes/tunnel/main.webp'],
 ['exec-bb3ffe8f-bdf2-48b6-950f-f2bd69d8f739.png','scenes/closed/main.webp'],
 ['exec-3ec1b179-da00-4d10-9bd0-c9fb1032ccd8.png','scenes/return/main.webp'],
 ['exec-18b6d34e-6b73-45ed-9e1e-c124af568767.png','ending/home-early.webp'],
 ['exec-5102ee61-ef99-472e-a1fe-abd6f9ba100d.png','items/smallKey/main.webp'],
 ['exec-991ac0c9-7a60-4b77-a4a5-523ca2dd4e11.png','items/officeKey/main.webp'],
 ['exec-e96ceb8d-51aa-452d-9412-ed97c1fab50f.png','items/lamp/main.webp'],
 ['exec-8a5e5d70-7639-481b-b063-b5320801941c.png','items/plate/main.webp'],
 ['exec-8d7fd9d2-bb11-4a32-999a-53d702f07868.png','items/handle/main.webp'],
 ['exec-50c80aeb-cea3-4c51-b388-805423bac341.png','items/managementTag/main.webp'],
 ['exec-5b638880-5feb-4feb-9c4f-31451e0e1677.png','ending/home-late.webp'],
 ['exec-93cbdc4d-168e-483d-ba16-1b0216846737.png','ending/false-station.webp'],
 ['exec-fbd152fa-0a44-462c-b520-9eb5bab2cef9.png','scenes/closed/boardable.webp'],
 ['exec-1f75ae23-4f39-4bac-a8c6-ebbbcb98228c.png','closeups/locks/numeric.webp'],
 ['exec-7017abdc-8f03-4363-bf5e-c4ad0024b02a.png','scenes/waiting/open.webp'],
 ['exec-6e5f7b05-6324-4847-9e32-bc3f10a8aef2.png','scenes/office/changed.webp'],
 ['exec-d68549bd-7cc4-4e77-91bc-0ddb610a9146.png','scenes/lost/open.webp'],
 ['exec-a7528792-2636-42b2-8cbc-dee00b7fe5a2.png','scenes/store/open.webp'],
 ['exec-030a7ce0-f911-4aa3-ac03-cb00ceeb3c18.png','items/managementTag/back.webp'],
 ['exec-e6918aed-aaf4-44ff-b385-081219e23a60.png','scenes/closed/arrived.webp'],
 ['exec-de6db1dd-9a05-4863-9c75-c295cc111436.png','ending/home.webp'],
 ['exec-d22b491f-2412-476d-a7f8-d83b2c5dc5ae.png','scenes/lamp/open.webp'],
 ['exec-993ed596-0db2-43b2-8ee3-d4d8bf6efea4.png','items/hook/main.webp'],
 ['exec-23e797fe-7c28-4917-840e-d8a28fa2dd10.png','items/knob/main.webp'],
 ['exec-abcaa897-ecf2-443f-aa6c-39ecc03acfa3.png','items/bracket/main.webp'],
 ['exec-59157371-081a-4877-ba73-7f29a10afc69.png','scenes/platform/cleared.webp'],
 ['exec-e69b696c-9ece-4117-8ab7-eb1f1ee8f3f7.png','scenes/train/case-open.webp'],
 ['exec-1dc11673-f786-44d2-b1a4-5add91504069.png','scenes/closed/drawer.webp'],
 ['exec-d796bf7d-2082-4b3c-b32a-8df4a826e3d7.png','closeups/train/steps-open.webp'],
 ['exec-1e80e25b-4662-43c2-abad-e24696e3f45b.png','items/punch/main.webp'],
 ['exec-63f89946-a7cc-484d-928a-c47f3d70692a.png','items/bridgePin/main.webp'],
 ['exec-454cc7b8-89a7-45c5-ae3e-f4df8e54cf20.png','closeups/train/steps-closed.webp'],
 ['exec-d42b6a85-5190-40af-b1bf-81f1b5c87f8b.png','closeups/gate/latch.webp'],
 ['exec-053f6427-f2cb-4b8c-826e-8e8452253e43.png','scenes/train/stabled.webp'],
 ['exec-c5cb0c8c-4cf9-493a-986a-910eea6a0241.png','scenes/office/tray.webp'],
 ['exec-0cdc16e6-9889-4963-a356-09328e6608d0.png','closeups/signal/box.webp'],
];
const manifest=[];
let prior=[];try{prior=JSON.parse(await readFile('docs/assets/manifest.json','utf8'))}catch{}
for(const [from,to] of assets){
 const out=path.resolve('public/assets',to);await mkdir(path.dirname(out),{recursive:true});
 const previous=prior.find(a=>a.path===`/assets/${to}`&&a.source===from);let reusable=false;
 if(previous){try{const m=await sharp(out).metadata();await sharp(out).stats();reusable=m.width===previous.width&&m.height===previous.height}catch{}}
 if(!reusable){
  const pipeline=sharp(path.join(source,from));if(to.startsWith('items/'))pipeline.resize({width:768,height:768,fit:'inside',withoutEnlargement:true});
  const temporary=`${out}.tmp-${process.pid}`;
  await (to.endsWith('.png')?pipeline.png():pipeline.webp({quality:91})).toFile(temporary);
  for(let retry=0;;retry++){try{await rename(temporary,out);break}catch(error){if(retry===5)throw error;await new Promise(resolve=>setTimeout(resolve,200))}}
 }
 const {width,height}=await sharp(out).metadata();const bytes=(await stat(out)).size;manifest.push({source:from,path:`/assets/${to}`,width,height,bytes,method:'built-in image_gen; encoding and inventory-size reduction only'});
}
await mkdir('docs/assets',{recursive:true});await writeFile('docs/assets/manifest.json',JSON.stringify(manifest,null,2));
console.log(`${manifest.length} image assets prepared`);
