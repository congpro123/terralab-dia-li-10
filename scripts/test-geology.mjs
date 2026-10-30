import assert from 'node:assert/strict';
import {buildPlateSolid,plateHeight,platePose,plateBottom,subductionMantleDepth,fittedTectonicView,tectonicCameraLimits} from '../lib/tectonic-geometry.ts';

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

for(const boundary of ['divergent','convergent','transform'])for(const continental of [false,true])for(const side of [-1,1])for(const segments of [32,48])for(const progress of [0,.5,1]){
 auditSolid(buildPlateSolid(side,boundary,continental,segments,progress));
 const pose=platePose(side,boundary,continental,progress);assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.scaleX>0&&pose.scaleY>0,'Deformation cannot invert a solid');
 if(boundary==='divergent')assert.ok(Math.abs(pose.x)-3>.05,'Separating plates retain an open rift throughout animation');
 if(boundary==='transform'){assert.equal(pose.y,0);assert.equal(pose.rotationZ,0);}
}
let previousGap=0,previousOffset=-1,previousDepth=1,previousMountain=-1,previousCollisionGap=1;
for(const progress of [0,.25,.5,.75,1]){
 const gap=platePose(1,'divergent',false,progress).x-platePose(-1,'divergent',false,progress).x-6;
 assert.ok(gap>previousGap,'Divergence must keep opening rather than oscillating backwards');previousGap=gap;
 const offset=platePose(1,'transform',false,progress).z-platePose(-1,'transform',false,progress).z;
 assert.ok(offset>previousOffset,'Transform motion must visibly offset the plates in one direction');previousOffset=offset;
 const oceanic=platePose(-1,'convergent',false,progress),depth=oceanic.y+3*Math.sin(oceanic.rotationZ)+plateHeight(3,0,-1,'convergent',false,progress)*Math.cos(oceanic.rotationZ);
 const deepest=oceanic.y+3*Math.sin(oceanic.rotationZ)+plateBottom*Math.cos(oceanic.rotationZ);assert.ok(deepest>plateBottom-subductionMantleDepth,'The descending slab stays inside the displayed mantle volume');
 assert.ok(depth<previousDepth,'The oceanic inner edge must actually descend over time');previousDepth=depth;
 const continental=platePose(-1,'convergent',true,progress),mountain=continental.y+continental.scaleY*plateHeight(3,0,-1,'convergent',true,progress),collisionGap=-2*(continental.x+3*continental.scaleX);
 assert.ok(mountain>previousMountain&&collisionGap<previousCollisionGap,'Collision must shorten the gap and uplift the mountain');previousMountain=mountain;previousCollisionGap=collisionGap;
 assert.ok(Math.abs(continental.y-2.1*continental.scaleY+2.1)<1e-8,'Thickening remains anchored to the underlying layer');
}
assert.ok(previousGap>2&&previousOffset>2.5&&previousDepth<-1.8&&previousMountain>2,'Changes must be visible, not tiny arrow-only motions');
for(const aspect of [.65,1,1.8,2.6])for(let i=0;i<3;i++){const view=fittedTectonicView(i,aspect),d=view.position.map((n,j)=>n-view.target[j]),radius=Math.hypot(...d),polar=Math.acos(d[1]/radius);assert.ok(radius>=tectonicCameraLimits.minDistance&&radius<=tectonicCameraLimits.maxDistance);assert.ok(polar>=tectonicCameraLimits.minPolarAngle&&polar<=tectonicCameraLimits.maxPolarAngle,'Camera presets must be reachable without fighting the orbit constraints');assert.ok(2*radius*Math.tan(24*Math.PI/180)*aspect>=16,'The moving model fits on portrait and landscape screens');}
console.log('PASS 72 sealed tectonic solids across motion stages; one-way divergence, subduction, collision and lateral offset; fitted mobile/desktop cameras.');
