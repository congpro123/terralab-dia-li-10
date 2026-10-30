export type PlateBoundary='divergent'|'convergent'|'transform';
export type PlateSide=-1|1;
export type SolidGroup={start:number;count:number;materialIndex:number};
export const tectonicCameraLimits={minDistance:10,maxDistance:27,minPolarAngle:.28,maxPolarAngle:Math.PI*.485};
export const tectonicViews=[
 {position:[12,8,15],target:[0,0,0]},
 {position:[0,3.4,17],target:[0,-.2,0]},
 {position:[0,19,6.2],target:[0,0,0]},
] as const;

/** Local topography and the cut faces share these exact boundary heights. */
export function plateHeight(x:number,z:number,side:PlateSide,boundary:PlateBoundary,continental:boolean){
 const inner=3+side*x;
 const relief=boundary==='convergent'?(continental?2.3:side===1?1.6:.08):boundary==='divergent'?.58:0;
 const ridge=relief*Math.exp(-inner*inner*(boundary==='divergent'?.7:.4))*(.78+.13*Math.cos(z*1.8)+.09*Math.sin(z*3.1+x));
 return .12+.045*Math.sin(x*2.1+side)*Math.cos(z*2.3)+ridge;
}

/** A closed, layered volume. No independent floating surface or open edges. */
export function buildPlateSolid(side:PlateSide,boundary:PlateBoundary,continental=false,segments=48){
 const positions:number[]=[],uvs:number[]=[],indices:number[]=[],groups:SolidGroup[]=[];
 const samples=Array.from({length:segments+1},(_,i)=>-3+i*6/segments),stride=segments+1;
 const vertex=(x:number,y:number,z:number,u:number,v:number)=>{const index=positions.length/3;positions.push(x,y,z);uvs.push(u,v);return index;};
 const group=(materialIndex:number,draw:()=>void)=>{const start=indices.length;draw();groups.push({start,count:indices.length-start,materialIndex});};
 const top=samples.flatMap(z=>samples.map(x=>vertex(x,plateHeight(x,z,side,boundary,continental),z,x/3,z/3)));
 group(0,()=>{for(let z=0;z<segments;z++)for(let x=0;x<segments;x++){const a=top[z*stride+x],b=top[z*stride+x+1],c=top[(z+1)*stride+x],d=top[(z+1)*stride+x+1];indices.push(a,c,b,b,c,d);}});
 // Walk the perimeter so every wall faces outwards, including the rift faces.
 const edges=[samples.map(x=>[x,3]),samples.slice().reverse().map(z=>[3,z]),samples.slice().reverse().map(x=>[x,-3]),samples.map(z=>[-3,z])];
 const levels=[-.6,-1.3,-2.1];
 levels.forEach((bottom,layer)=>group(layer+1,()=>{for(const edge of edges){const pairs=edge.map(([x,z],i)=>[vertex(x,layer===0?plateHeight(x,z,side,boundary,continental):levels[layer-1],z,i/segments*2,0),vertex(x,bottom,z,i/segments*2,1)]);for(let i=0;i<segments;i++){const [a,b]=pairs[i],[c,d]=pairs[i+1];indices.push(a,b,c,c,b,d);}}}));
 const bottom=samples.flatMap(z=>samples.map(x=>vertex(x,-2.1,z,x/3,z/3)));
 group(3,()=>{for(let z=0;z<segments;z++)for(let x=0;x<segments;x++){const a=bottom[z*stride+x],b=bottom[z*stride+x+1],c=bottom[(z+1)*stride+x],d=bottom[(z+1)*stride+x+1];indices.push(a,b,c,b,d,c);}});
 return {positions,uvs,indices,groups};
}

export function platePose(side:PlateSide,boundary:PlateBoundary,continental:boolean,time:number){
 const move=Math.sin(time*.45)*.18,subducting=boundary==='convergent'&&!continental&&side===-1;
 return {x:side*(boundary==='divergent'?3.42+move:3.03),y:subducting?-.35:0,z:boundary==='transform'?side*move*4:0,rotationZ:subducting?-.23:0};
}
