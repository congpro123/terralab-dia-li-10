export type PhotoAnchor={id:string;x:number;y:number};
export type PhotoBubble=PhotoAnchor&{left:number;top:number;width:number;height:number};
/** Projected, front-facing anchors only. Positions are relative to the globe viewport. */
export function arrangePhotoBubbles(anchors:PhotoAnchor[],width:number,height:number,distance:number,expanded:boolean){
 if(!expanded||distance>5.6)return [] as PhotoBubble[];
 const small=width<500,w=small?112:136,h=small?98:112,limit=small?2:3,gap=16;
 const bubbles:PhotoBubble[]=[];
 for(const anchor of anchors){
  const {x,y}=anchor;
  const options=[{left:x-w/2,top:y-h-24},{left:x-w/2,top:y+26},{left:x+27,top:y-h/2},{left:x-w-27,top:y-h/2}];
  for(const box of options){
   if(box.left<14||box.top<48||box.left+w>width-14||box.top+h>height-64)continue;
   // Keep the zoom controls and the other photographs clear.
   if(box.left+w>width-76&&box.top+h>height-172)continue;
   if(bubbles.some(b=>box.left<b.left+b.width+gap&&box.left+w+gap>b.left&&box.top<b.top+b.height+gap&&box.top+h+gap>b.top))continue;
   bubbles.push({...anchor,...box,width:w,height:h});break;
  }
  if(bubbles.length===limit)break;
 }
 return bubbles;
}
