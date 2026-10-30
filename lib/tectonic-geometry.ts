export type PlateBoundary='divergent'|'convergent'|'transform';
export type PlateSide=-1|1;
export type SolidGroup={start:number;count:number;materialIndex:number};
export const tectonicCameraLimits={minDistance:10,maxDistance:40,minPolarAngle:.28,maxPolarAngle:Math.PI*.485};
export const tectonicViews=[
 {position:[12,8,15],target:[0,0,0]},
 {position:[0,3.4,17],target:[0,-.2,0]},
 {position:[0,19,6.2],target:[0,0,0]},
] as const;
export function fittedTectonicView(index:number,aspect:number){const view=tectonicViews[index]??tectonicViews[0],scale=Math.max(1,1.15/Math.max(.65,aspect));return {position:view.position.map((n,i)=>view.target[i]+(n-view.target[i])*scale),target:[...view.target]};}
const clampProgress=(progress:number)=>Math.max(0,Math.min(1,progress));

/** Local topography and the cut faces share these exact boundary heights. */
export function plateHeight(x:number,z:number,side:PlateSide,boundary:PlateBoundary,continental:boolean,progress=1){
 const inner=3+side*x,p=clampProgress(progress);
 const relief=boundary==='convergent'?(continental?.12+2.18*p:side===1?.08+1.52*p:.08):boundary==='divergent'?.25+.33*p:0;
 const ridge=relief*Math.exp(-inner*inner*(boundary==='divergent'?.7:.4))*(.78+.13*Math.cos(z*1.8)+.09*Math.sin(z*3.1+x));
 return .12+.045*Math.sin(x*2.1+side)*Math.cos(z*2.3)+ridge;
}

/** A closed, layered volume. No independent floating surface or open edges. */
export function buildPlateSolid(side:PlateSide,boundary:PlateBoundary,continental=false,segments=48,progress=1){
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],groups:SolidGroup[]=[];
 const samples=Array.from({length:segments+1},(_,i)=>-3+i*6/segments),stride=segments+1;
 const vertex=(x:number,y:number,z:number,u:number,v:number)=>{const index=positions.length/3;positions.push(x,y,z);uvs.push(u,v);return index;};
 const group=(materialIndex:number,draw:()=>void)=>{const start=indices.length;draw();groups.push({start,count:indices.length-start,materialIndex});};
 const top=samples.flatMap(z=>samples.map(x=>vertex(x,plateHeight(x,z,side,boundary,continental,progress),z,x/3,z/3)));
 group(0,()=>{for(let z=0;z<segments;z++)for(let x=0;x<segments;x++){const a=top[z*stride+x],b=top[z*stride+x+1],c=top[(z+1)*stride+x],d=top[(z+1)*stride+x+1];indices.push(a,c,b,b,c,d);}});
 // Walk the perimeter so every wall faces outwards, including the rift faces.
 const edges=[samples.map(x=>[x,3]),samples.slice().reverse().map(z=>[3,z]),samples.slice().reverse().map(x=>[x,-3]),samples.map(z=>[-3,z])];
 const levels=[-.6,-1.3,-2.1];
 levels.forEach((bottom,layer)=>group(layer+1,()=>{for(const edge of edges){const pairs=edge.map(([x,z],i)=>[vertex(x,layer===0?plateHeight(x,z,side,boundary,continental,progress):levels[layer-1],z,i/segments*2,0),vertex(x,bottom,z,i/segments*2,1)]);for(let i=0;i<segments;i++){const [a,b]=pairs[i],[c,d]=pairs[i+1];indices.push(a,b,c,c,b,d);}}}));
 const bottom=samples.flatMap(z=>samples.map(x=>vertex(x,-2.1,z,x/3,z/3)));
 group(3,()=>{for(let z=0;z<segments;z++)for(let x=0;x<segments;x++){const a=bottom[z*stride+x],b=bottom[z*stride+x+1],c=bottom[(z+1)*stride+x],d=bottom[(z+1)*stride+x+1];indices.push(a,b,c,b,d,c);}});
 return {positions,uvs,indices,groups};
}

export function platePose(side:PlateSide,boundary:PlateBoundary,continental:boolean,progress:number){
 const p=clampProgress(progress);
 if(boundary==='divergent')return {x:side*(3.08+1.1*p),y:0,z:0,rotationZ:0,scaleX:1,scaleY:1};
 if(boundary==='transform')return {x:side*3.03,y:0,z:side*1.4*p,rotationZ:0,scaleX:1,scaleY:1};
 if(continental){const scaleX=1-.12*p,scaleY=1+.1*p;return {x:side*(3*scaleX+.3*(1-p)),y:2.1*(scaleY-1),z:0,rotationZ:0,scaleX,scaleY};}
 const rotationZ=side===-1?-.02-.36*p:0;
 return {x:side===-1?-3.2+p:3.2-.2*p,y:side===-1?3*Math.sin(rotationZ):0,z:0,rotationZ,scaleX:1,scaleY:1};
}
