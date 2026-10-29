const fract=(n:number)=>n-Math.floor(n);
function hash(x:number,z:number){return fract(Math.sin(x*127.1+z*311.7)*43758.5453);}
export function terrainNoise(x:number,z:number){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;}
export function riverCenter(z:number){return Math.sin(z*.035)*7+Math.sin(z*.084)*1.4;}
export function riverLevel(z:number){return 1.4-z*.028;}
/** An accelerated teaching stage, in scene units; not a flood forecast. */
export function riverStage(runoff:number){return Math.max(0,Math.min(2.8,runoff*.028));}
/** Small, irregular bank retreat becomes visible only in the erosion lesson. */
export function riverBankErosion(x:number,z:number,runoff:number,cover:number){
 const distance=Math.abs(x-riverCenter(z)),force=Math.max(0,(runoff-32)/68)*(1-Math.max(0,Math.min(100,cover))/130);
 const bend=.58+.42*Math.sin(z*.18+Math.sin(z*.035)*2.3)**2;
 return force*bend*.8*Math.exp(-(((distance-4.2)/1.55)**2));
}
/** Find the waterline on one side by intersecting water height with terrain. */
export function floodedBankWidth(z:number,side:-1|1,stage:number,slope:number,runoff=0,cover=100,erosion=false){
 const center=riverCenter(z),surface=riverLevel(z)+stage;
 const height=(distance:number)=>landscapeHeight(center+side*distance,z,slope)-(erosion?riverBankErosion(center+side*distance,z,runoff,cover):0);
 let low=0,high=24;
 if(height(high)<surface)return high;
 for(let i=0;i<11;i++){const mid=(low+high)/2;if(height(mid)<surface)low=mid;else high=mid;}
 return (low+high)/2;
}
export function landscapeHeight(x:number,z:number,slope=50){
 const d=Math.abs(x-riverCenter(z)),edge=Math.max(0,d-2.8),ridge=(1-Math.exp(-edge/24))*(9+slope*.10),detail=(terrainNoise(x*.075,z*.075)*2+terrainNoise(x*.25,z*.25)*.5)*Math.min(1,edge/7);
 return riverLevel(z)-.9+Math.min(1,d/3.4)*1.1+ridge*(.65+terrainNoise(x*.012,z*.014)*.7)+detail;
}
