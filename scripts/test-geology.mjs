import assert from 'node:assert/strict';
import {buildPlateSolid,plateHeight,platePose,tectonicViews,tectonicCameraLimits} from '../lib/tectonic-geometry.ts';

// Weld only for the audit: rendered walls retain hard edges for their normals.
function auditSolid(solid){
 const {positions,indices,groups}=solid,vertices=[],welded=new Map(),edges=new Map();
 for(let i=0;i<positions.length;i+=3){
  const point=positions.slice(i,i+3);assert.ok(point.every(Number.isFinite));
  const key=point.map(n=>Math.round(n*1e6)).join(',');
  if(!welded.has(key))welded.set(key,welded.size);
  vertices.push(welded.get(key));
 }
 let volume=0;
 for(let i=0;i<indices.length;i+=3){
  const ids=indices.slice(i,i+3),points=ids.map(id=>positions.slice(id*3,id*3+3)),[a,b,c]=points;
  const ab=b.map((n,j)=>n-a[j]),ac=c.map((n,j)=>n-a[j]);
  const cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
  assert.ok(cross.reduce((s,n)=>s+n*n,0)>1e-12,'No collapsed or stretched-to-zero faces');
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  for(let e=0;e<3;e++){
   const from=vertices[ids[e]],to=vertices[ids[(e+1)%3]],key=[Math.min(from,to),Math.max(from,to)].join('/');
   const edge=edges.get(key)??{count:0,balance:0};edge.count++;edge.balance+=from<to?1:-1;edges.set(key,edge);
  }
 }
 for(const edge of edges.values()){assert.equal(edge.count,2,'Every surface edge joins exactly two faces; no floating sheet or open seam');assert.equal(edge.balance,0,'Joined faces must face outwards consistently');}
 assert.ok(volume>72,'The plate encloses a positive rock volume');
 assert.equal(groups.reduce((n,g)=>n+g.count,0),indices.length,'All faces have a material');
}

for(const boundary of ['divergent','convergent','transform'])for(const continental of [false,true])for(const side of [-1,1])for(const segments of [32,48]){
 auditSolid(buildPlateSolid(side,boundary,continental,segments));
 for(const time of [0,3.5,10.5,40]){
  const pose=platePose(side,boundary,continental,time);assert.ok(Object.values(pose).every(Number.isFinite));
  if(boundary==='divergent')assert.ok(Math.abs(pose.x)-3>.2,'Separating plates retain an open rift throughout animation');
  if(boundary==='transform'){assert.equal(pose.y,0);assert.equal(pose.rotationZ,0);}
 }
}
const descending=platePose(-1,'convergent',false,0),innerHeight=plateHeight(3,0,-1,'convergent',false);
assert.ok(descending.y+3*Math.sin(descending.rotationZ)+innerHeight*Math.cos(descending.rotationZ)<-.7,'The oceanic inner edge dips beneath the other plate');
for(const view of tectonicViews){const d=view.position.map((n,i)=>n-view.target[i]),radius=Math.hypot(...d),polar=Math.acos(d[1]/radius);assert.ok(radius>=tectonicCameraLimits.minDistance&&radius<=tectonicCameraLimits.maxDistance);assert.ok(polar>=tectonicCameraLimits.minPolarAngle&&polar<=tectonicCameraLimits.maxPolarAngle,'Camera presets must be reachable without fighting the orbit constraints');}
console.log('PASS sealed tectonic volumes, outward faces and non-degenerate geometry in all boundaries, crust types and mobile/desktop meshes; reachable camera presets.');
