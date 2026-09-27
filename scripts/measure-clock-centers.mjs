import sharp from 'sharp';
const root='public/assets/scenes/';
for(const [name,fx,fy] of [
 ['office',.333,.154],
 ['platform',.468,.113],
 ['bridge',.206,.197],
]){
 const file=`${name}/main.webp`;
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
