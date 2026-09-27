import sharp from 'sharp';
const root='C:/Users/kawau/.codex/generated_images/01a0e252-b185-7ae0-ad60-5d3b95cedb97/';
for(const [name,file,fx,fy] of [
 ['office','exec-f6a3ec6a-d734-4f4d-a904-396b3bc34c30.png',.333,.154],
 ['platform','exec-9933eab4-070d-4a5d-92ef-f80b18f30eb3.png',.468,.113],
 ['bridge','exec-7c86e901-5db1-41b1-94cd-af43afc996bb.png',.206,.197],
]){
 const {width,height}=await sharp(root+file).metadata();
 const radius=Math.round(width*.007);const left=Math.round(width*fx)-radius,top=Math.round(height*fy)-radius;
 const {data,info}=await sharp(root+file).extract({left,top,width:radius*2,height:radius*2}).greyscale().removeAlpha().raw().toBuffer({resolveWithObject:true});
 let best={score:Infinity,x:0,y:0};
 for(let y=2;y<info.height-2;y++)for(let x=2;x<info.width-2;x++){
  let sum=0;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)sum+=data[(y+dy)*info.width+x+dx];
  if(sum<best.score)best={score:sum,x:left+x,y:top+y};
 }
 console.log({name,width,height,pivot:best,normalized:[best.x/width,best.y/height]});
}
