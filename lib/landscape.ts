const fract=(n:number)=>n-Math.floor(n);
function hash(x:number,z:number){return fract(Math.sin(x*127.1+z*311.7)*43758.5453);}
export function terrainNoise(x:number,z:number){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);return (hash(ix,iz)*(1-u)+hash(ix+1,iz)*u)*(1-v)+(hash(ix,iz+1)*(1-u)+hash(ix+1,iz+1)*u)*v;}
export function riverCenter(z:number){return Math.sin(z*.035)*7+Math.sin(z*.084)*1.4;}
export function riverLevel(z:number){return 1.4-z*.028;}
export function landscapeHeight(x:number,z:number,slope=50){
 const d=Math.abs(x-riverCenter(z)),edge=Math.max(0,d-2.8),ridge=(1-Math.exp(-edge/17))*(12+slope*.14),detail=(terrainNoise(x*.075,z*.075)*3+terrainNoise(x*.25,z*.25)*.7)*Math.min(1,edge/7);
 return riverLevel(z)-.9+Math.min(1,d/3.4)*1.1+ridge*(.65+terrainNoise(x*.012,z*.014)*.7)+detail;
}
