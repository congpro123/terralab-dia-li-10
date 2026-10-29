import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {landscapeHeight,riverCenter} from './landscape';
import {disposeAsset} from './outdoor';

export async function plantForest(scene:THREE.Scene,compact:boolean){
 const loader=new THREE.TextureLoader();const [map,alphaMap,normalMap,roughnessMap]=await Promise.all(['color','alpha','normal','roughness'].map(part=>loader.loadAsync(`/textures/foliage/oak-${part}.jpg`)));map.colorSpace=THREE.SRGBColorSpace;
 const wind={value:0};const leafMaterial=new THREE.MeshStandardMaterial({map,alphaMap,normalMap,normalScale:new THREE.Vector2(.35,.35),roughnessMap,roughness:.95,side:THREE.DoubleSide,alphaTest:.55,color:0xd9e4bb});
 leafMaterial.onBeforeCompile=shader=>{shader.uniforms.forestWind=wind;shader.vertexShader='uniform float forestWind;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\ntransformed.x+=sin(forestWind*1.4+instanceMatrix[3].x*.7+instanceMatrix[3].z*.5)*.065*(position.y+.6);\n#endif');};
 const leafCount=compact?360:600,maxTrees=compact?65:110,leafVariants:THREE.InstancedMesh[]=[];
 for(let tile=0;tile<6;tile++){const geometry=new THREE.PlaneGeometry(.64,.93),uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(uv.getX(i)+tile%3)/3,(uv.getY(i)+Math.floor(tile/3))/2);const mesh=new THREE.InstancedMesh(geometry,leafMaterial,maxTrees*leafCount/6);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);leafVariants.push(mesh);}
 const bark=new THREE.MeshStandardMaterial({color:'#73624b',roughness:1});
 const branches=new THREE.InstancedMesh(new THREE.CylinderGeometry(.055,.12,1,7),bark,maxTrees*9);branches.castShadow=true;branches.frustumCulled=false;scene.add(branches);
 let seed=73;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const trees:{x:number;z:number;height:number;turn:number;shade:number}[]=[];while(trees.length<maxTrees){const x=(rand()-.5)*135,z=-125+rand()*190;if(Math.abs(x-riverCenter(z))<5.5)continue;trees.push({x,z,height:4+rand()*4,turn:rand()*Math.PI*2,shade:.8+rand()*.25});}
 const localLeaves=Array.from({length:leafCount},(_,i)=>{const limb=i%8,phi=limb*2.39996,y=.45+limb*.052,spread=.18+rand()*.10,theta=rand()*Math.PI*2,r=Math.cbrt(rand());return {x:Math.cos(phi)*spread+Math.cos(theta)*r*.18,y:y+(rand()-.5)*.26,z:Math.sin(phi)*spread+Math.sin(theta)*r*.18,rx:rand()*Math.PI,ry:rand()*Math.PI*2,rz:rand()*Math.PI,size:.72+rand()*.7};});
 const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
 const undergrowth:{mesh:THREE.InstancedMesh;seeds:{x:number;z:number;size:number;turn:number}[]}[]=[];
 let alive=true;
 for(const [name,count,scale] of [['fern_02',compact?6:14,2.4],['grass_medium_02',compact?25:60,5]] as const){
  new GLTFLoader().load(`/models/${name}/${name}.gltf`,gltf=>{if(!alive){disposeAsset(gltf.scene);return;}gltf.scene.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const material=o.material as THREE.MeshStandardMaterial;material.transparent=false;material.alphaTest=.5;material.side=THREE.DoubleSide;const instance=new THREE.InstancedMesh(o.geometry,material,count);instance.receiveShadow=true;instance.frustumCulled=false;const seeds=Array.from({length:count},()=>{const z=-75+rand()*125,side=rand()>.5?1:-1,x=riverCenter(z)+side*(4+rand()*26);return{x,z,size:scale*(.6+rand()*.7),turn:rand()*6.28};});undergrowth.push({mesh:instance,seeds});scene.add(instance);});update(lastDensity,lastSlope,lastCold);},undefined,()=>{});
 }
 let lastDensity=.7,lastSlope=50,lastCold=false;
 function update(density:number,slope:number,cold=false){lastDensity=density;lastSlope=slope;lastCold=cold;const visible=Math.max(0,Math.min(trees.length,Math.round(trees.length*density))),variantIndex=[0,0,0,0,0,0];let branchIndex=0;
  for(let i=0;i<visible;i++){const tree=trees[i],h=tree.height*(cold?.78:1),base=landscapeHeight(tree.x,tree.z,slope),cos=Math.cos(tree.turn),sin=Math.sin(tree.turn);
   for(let j=0;j<9;j++){const phi=(j-1)*2.39996+tree.turn,start=new THREE.Vector3(tree.x,base+(j?(.28+j*.05)*h:0),tree.z),end=j?new THREE.Vector3(tree.x+Math.cos(phi)*h*.28,base+(.5+j*.045)*h,tree.z+Math.sin(phi)*h*.28):new THREE.Vector3(tree.x,base+h*.92,tree.z),length=start.distanceTo(end);dummy.position.copy(start).add(end).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(up,end.sub(start).normalize());dummy.scale.set(j?h*.20:h*.6,length,j?h*.20:h*.6);dummy.updateMatrix();branches.setMatrixAt(branchIndex++,dummy.matrix);}
   for(let k=0;k<localLeaves.length;k++){const leaf=localLeaves[k],tile=k%6;dummy.position.set(tree.x+(leaf.x*cos-leaf.z*sin)*h,base+leaf.y*h,tree.z+(leaf.x*sin+leaf.z*cos)*h);dummy.rotation.set(leaf.rx,leaf.ry+tree.turn,leaf.rz);dummy.scale.setScalar(leaf.size*h/6);dummy.updateMatrix();leafVariants[tile].setMatrixAt(variantIndex[tile],dummy.matrix);color.set(cold?'#b1beaa':'#e1e8c9').multiplyScalar(tree.shade);leafVariants[tile].setColorAt(variantIndex[tile]++,color);}
  }
  branches.count=branchIndex;branches.instanceMatrix.needsUpdate=true;leafVariants.forEach((mesh,i)=>{mesh.count=variantIndex[i];mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;});
  for(const {mesh,seeds} of undergrowth){const count=Math.round(seeds.length*density);for(let i=0;i<count;i++){const p=seeds[i];dummy.position.set(p.x,landscapeHeight(p.x,p.z,slope),p.z);dummy.rotation.set(0,p.turn,0);dummy.scale.setScalar(p.size);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.count=count;mesh.instanceMatrix.needsUpdate=true;}
 }
 return {update,animate:(time:number)=>{wind.value=time;},stop:()=>{alive=false;}};
}
