import { loadImage, createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'node:fs';
const IMG=32;
const img=await loadImage('./real/tiles_loose1.jpg');
const W=1500, H=Math.round(img.height*(1500/img.width));
const cv=createCanvas(W,H); cv.getContext('2d').drawImage(img,0,0,W,H);
const ctx=cv.getContext('2d');
const out=[];
let tries=0;
while(out.length<120 && tries<4000){
  tries++;
  const side=Math.round(30+Math.random()*70);
  const x=Math.round(Math.random()*(W-side)), y=Math.round(Math.random()*(H-side));
  const cell=createCanvas(IMG,IMG),cc=cell.getContext('2d');
  cc.drawImage(cv,x,y,side,side,0,0,IMG,IMG);
  const d=cc.getImageData(0,0,IMG,IMG).data;
  let dark=0; const g=new Array(IMG*IMG);
  for(let i=0;i<IMG*IMG;i++){const v=(0.299*d[i*4]+0.587*d[i*4+1]+0.114*d[i*4+2]);g[i]=v/255;if(v<80)dark++;}
  // wood/tafel: weinig donkere pixels (geen letter)
  if(dark/(IMG*IMG) < 0.03) out.push({g});
}
writeFileSync('./real/neg_wood.json', JSON.stringify(out));
console.log('wood negatives:', out.length);
