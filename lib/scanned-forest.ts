import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {landscapeHeight,riverCenter} from './landscape';
import {disposeAsset} from './outdoor';

/** Capture the scanned trees once; use full geometry only close to the viewer. */
export async function plantForest(scene:THREE.Scene,renderer:THREE.WebGLRenderer,camera:THREE.Camera,compact:boolean,cancelled:()=>boolean){
 const source=await new GLTFLoader().loadAsync('/models/pine_sapling/pine_sapling.gltf');
 if(cancelled()){disposeAsset(source.scene);throw new Error('Scene closed');}
 const sourceMeshes:THREE.Mesh[]=[];source.scene.traverse(o=>{if(o instanceof THREE.Mesh)sourceMeshes.push(o);});
 const maxTrees=compact?190:340,maxNear=compact?2:4,targets:THREE.WebGLRenderTarget[]=[],sprites:THREE.InstancedMesh[]=[],detail:THREE.InstancedMesh[]=[];
 const oldTarget=renderer.getRenderTarget(),oldClear=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha();
 for(const original of sourceMeshes){
  const geometry=original.geometry.clone();geometry.computeBoundingBox();const box=geometry.boundingBox!,size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());geometry.translate(-center.x,-box.min.y,-center.z);geometry.scale(1/size.y,1/size.y,1/size.y);
  const sample=new THREE.Mesh(geometry,original.material),capture=new THREE.Scene();capture.environment=scene.environment;capture.environmentIntensity=.9;capture.add(sample,new THREE.HemisphereLight(0xc8dfed,0x66634b,1.5));const sun=new THREE.DirectionalLight(0xffe5c0,2.7);sun.position.set(-.55,.63,-.5);capture.add(sun);
  const lens=new THREE.OrthographicCamera(-.65,.65,.65,-.65,.1,10);lens.position.set(0,.5,3);lens.lookAt(0,.5,0);lens.updateProjectionMatrix();
  const target=new THREE.WebGLRenderTarget(compact?512:768,compact?512:768,{type:THREE.HalfFloatType,generateMipmaps:true,minFilter:THREE.LinearMipmapLinearFilter});renderer.setClearColor(0x000000,0);renderer.setRenderTarget(target);renderer.clear();renderer.render(capture,lens);targets.push(target);
  const card=new THREE.PlaneGeometry(1.3,1.3);card.translate(0,.5,0);const material=new THREE.MeshBasicMaterial({map:target.texture,alphaTest:.3,side:THREE.DoubleSide});const sprite=new THREE.InstancedMesh(card,material,maxTrees);sprite.frustumCulled=false;scene.add(sprite);sprites.push(sprite);
  const near=new THREE.InstancedMesh(geometry,original.material,maxNear);near.castShadow=true;near.receiveShadow=true;near.frustumCulled=false;near.count=0;scene.add(near);detail.push(near);
 }
 renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldClear,oldAlpha);
 let seed=73;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const trees:{x:number;z:number;height:number;turn:number;variant:number;y:number}[]=[];
 while(trees.length<maxTrees){const x=(rand()-.5)*140,z=-135+rand()*205;if(Math.abs(x-riverCenter(z))<5.3)continue;trees.push({x,z,y:0,height:5.5+rand()*6.5,turn:rand()*6.28,variant:Math.floor(rand()*sprites.length)});}
 const dummy=new THREE.Object3D(),position=new THREE.Vector3();let alive=true,density=.7,slope=50,visible=0,lastLOD=0;
 const undergrowth:{mesh:THREE.InstancedMesh;seeds:{x:number;z:number;size:number;turn:number}[]}[]=[];
 for(const [name,count,scale] of [['fern_02',compact?8:18,2],['grass_medium_02',compact?12:25,2.5]] as const)new GLTFLoader().load(`/models/${name}/${name}.gltf`,gltf=>{if(!alive){disposeAsset(gltf.scene);return;}gltf.scene.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const material=o.material as THREE.MeshStandardMaterial;material.transparent=false;material.alphaTest=.5;material.side=THREE.DoubleSide;const mesh=new THREE.InstancedMesh(o.geometry,material,count),seeds=Array.from({length:count},()=>{const z=-80+rand()*125;return {z,x:riverCenter(z)+(rand()>.5?1:-1)*(4+rand()*23),size:scale*(.7+rand()*.7),turn:rand()*6.28};});mesh.receiveShadow=true;mesh.frustumCulled=false;undergrowth.push({mesh,seeds});scene.add(mesh);});update(density,slope);},undefined,()=>{});
 // Fine blades fill the foreground without the cost of thousands of scanned clumps.
 const blade=new THREE.PlaneGeometry(.07,.6,1,4),bp=blade.attributes.position,bladeColors:number[]=[];for(let i=0;i<bp.count;i++){const y=bp.getY(i)+.3;bp.setXYZ(i,bp.getX(i)*(1-y/.65),y,Math.pow(y,2)*.65);const c=new THREE.Color('#344b22').lerp(new THREE.Color('#809b44'),y/.6);bladeColors.push(c.r,c.g,c.b);}blade.setAttribute('color',new THREE.Float32BufferAttribute(bladeColors,3));blade.computeVertexNormals();const grassCount=compact?6000:15000,grass=new THREE.InstancedMesh(blade,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}),grassCount),grassSeeds=Array.from({length:grassCount},()=>{const z=-35+rand()*95,x=riverCenter(z)+(rand()>.5?1:-1)*(4+rand()*32);return{x,z,size:.55+rand()*1.2,turn:rand()*6.28};});grass.receiveShadow=true;grass.frustumCulled=false;scene.add(grass);
 let nearest=new Set<number>();
 function rebuild(){const farCounts=sprites.map(()=>0),nearCounts=detail.map(()=>0);for(let i=0;i<visible;i++){const p=trees[i],isNear=nearest.has(i),mesh=isNear?detail[p.variant]:sprites[p.variant],index=isNear?nearCounts[p.variant]++:farCounts[p.variant]++;dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,isNear?p.turn:Math.atan2(camera.position.x-p.x,camera.position.z-p.z),0);dummy.scale.setScalar(p.height);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}sprites.forEach((mesh,i)=>{mesh.count=farCounts[i];mesh.instanceMatrix.needsUpdate=true;});detail.forEach((mesh,i)=>{mesh.count=nearCounts[i];mesh.instanceMatrix.needsUpdate=true;});}
 function update(nextDensity:number,nextSlope:number,cold=false){density=nextDensity;slope=nextSlope;visible=Math.round(maxTrees*Math.max(0,Math.min(1,density)));for(const p of trees)p.y=landscapeHeight(p.x,p.z,slope);nearest=new Set();lastLOD=0;
  for(const {mesh,seeds} of undergrowth){const count=Math.round(seeds.length*density);for(let i=0;i<count;i++){const p=seeds[i];dummy.position.set(p.x,landscapeHeight(p.x,p.z,slope),p.z);dummy.rotation.set(0,p.turn,0);dummy.scale.setScalar(p.size*(cold?.8:1));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.count=count;mesh.instanceMatrix.needsUpdate=true;}
  grass.count=Math.round(grassCount*density);for(let i=0;i<grass.count;i++){const p=grassSeeds[i];dummy.position.set(p.x,landscapeHeight(p.x,p.z,slope),p.z);dummy.rotation.set(0,p.turn,Math.sin(i)*.15);dummy.scale.setScalar(p.size*(cold?.65:1));dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);}grass.instanceMatrix.needsUpdate=true;rebuild();
 }
 return {update,animate:(_time:number)=>{if(performance.now()-lastLOD>350){lastLOD=performance.now();const close=trees.slice(0,visible).map((p,i)=>({i,d:camera.position.distanceTo(position.set(p.x,p.y+p.height*.5,p.z))})).filter(p=>p.d<24).sort((a,b)=>a.d-b.d).slice(0,maxNear);nearest=new Set(close.map(p=>p.i));}rebuild();},stop:()=>{alive=false;targets.forEach(t=>t.dispose());disposeAsset(source.scene);}};
}
