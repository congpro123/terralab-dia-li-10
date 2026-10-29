import placeData from '../data/destinations.json' with {type:'json'};
export type Region='vietnam'|'asia'|'europe'|'africa'|'americas'|'oceania';
export type Destination={id:string;lat:number;lon:number;name:string;nameEn:string;country:string;countryEn:string;photo:number|string;lesson?:number;description:string;descriptionEn:string;question?:string;questionEn?:string;source:string;sourceName:string;region:Region;category:'nature'|'culture'};
export const destinations=placeData as Destination[];
export const regions:[Region,string,string][]=[['vietnam','Việt Nam','Viet Nam'],['asia','Châu Á','Asia'],['europe','Châu Âu','Europe'],['africa','Châu Phi','Africa'],['americas','Châu Mỹ','Americas'],['oceania','Châu Đại Dương','Oceania']];
export function filterDestinations(places:Destination[],query:string,region:string,lessonsOnly=false){const clean=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();const q=clean(query.trim());return places.filter(p=>(region==='all'||p.region===region)&&(!lessonsOnly||!!p.lesson)&&clean(p.name+' '+p.nameEn+' '+p.country+' '+p.countryEn).includes(q));}
// Three.js SphereGeometry uses -cos(phi), sin(phi), with Greenwich at texture u=0.5.
export function geographicVector(lat:number,lon:number,radius=1){const p=lat*Math.PI/180,l=lon*Math.PI/180;return {x:radius*Math.cos(p)*Math.cos(l),y:radius*Math.sin(p),z:-radius*Math.cos(p)*Math.sin(l)};}
export const LUNAR_DAY=24+50/60;
// Idealised equilibrium tide: lunar component + smaller solar component.
// phase=0/new, 90/first quarter, 180/full, 270/last quarter; no local basin response.
export function tideState(hour:number,phase:number){const theta=hour/LUNAR_DAY*Math.PI*2,phi=phase*Math.PI/180;const level=Math.cos(2*theta)+.46*Math.cos(2*(theta+phi));const derivative=-Math.sin(2*theta)-.46*Math.sin(2*(theta+phi));const amplitude=Math.sqrt(1+.46**2+2*.46*Math.cos(2*phi));return {level,amplitude,rising:derivative>0,stationary:Math.abs(derivative)<1e-6,range:2*amplitude};}
