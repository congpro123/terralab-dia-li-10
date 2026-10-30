import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Sky} from 'three/addons/objects/Sky.js';
import {HDRLoader} from 'three/addons/loaders/HDRLoader.js';

export function outdoorWorld(host:HTMLElement,position:THREE.Vector3,target:THREE.Vector3,background=true){
 const compact=host.clientWidth<600;
 let renderer:THREE.WebGLRenderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'default'});}let emergencyDispose=()=>{};try{renderer.debug.onShaderError=()=>{throw new Error('WebGL shader compilation failed');};
 renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1.35:1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;host.appendChild(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#b8c8ce');scene.fog=new THREE.FogExp2('#c4d0cb',.007);
 const camera=new THREE.PerspectiveCamera(48,1,.2,650);camera.position.copy(position);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=7;controls.maxDistance=90;controls.minPolarAngle=.28;controls.maxPolarAngle=Math.PI*.475;
 emergencyDispose=()=>controls.dispose();const sunDirection=new THREE.Vector3(-.55,.63,-.5).normalize();
 scene.add(new THREE.HemisphereLight(0xc8dfed,0x66634b,1.5));
 const sun=new THREE.DirectionalLight(0xffe5c0,2.7);sun.position.copy(sunDirection).multiplyScalar(100);sun.castShadow=true;sun.shadow.mapSize.set(compact?1024:2048,compact?1024:2048);Object.assign(sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:230});sun.shadow.bias=-.00025;sun.shadow.normalBias=.1;sun.shadow.radius=3;scene.add(sun);
 const sky=new Sky();sky.scale.setScalar(400);Object.assign(sky.material.uniforms.turbidity,{value:5});sky.material.uniforms.rayleigh.value=2;sky.material.uniforms.mieCoefficient.value=.006;sky.material.uniforms.mieDirectionalG.value=.8;sky.material.uniforms.sunPosition.value.copy(sunDirection);sky.visible=background;scene.add(sky);
 const textures:THREE.Texture[]=[],targets:THREE.WebGLRenderTarget[]=[];let disposed=false;
 const pmrem=new THREE.PMREMGenerator(renderer);const skyScene=new THREE.Scene();skyScene.add(sky.clone());try{const generated=pmrem.fromScene(skyScene,.04,.1,500);scene.environment=generated.texture;scene.environmentIntensity=.65;targets.push(generated);}catch{renderer.setRenderTarget(null);}finally{skyScene.clear();}
 new HDRLoader().load('/textures/environment/partly-cloudy-1k.hdr',hdr=>{if(disposed){hdr.dispose();return;}try{hdr.mapping=THREE.EquirectangularReflectionMapping;const map=pmrem.fromEquirectangular(hdr);scene.environment=map.texture;scene.environmentIntensity=.75;if(background){scene.background=hdr;scene.backgroundIntensity=.8;scene.backgroundBlurriness=.015;scene.backgroundRotation.y=1.7;}sky.visible=false;targets.push(map);textures.push(hdr);}catch{renderer.setRenderTarget(null);hdr.dispose();}},undefined,()=>{});
 const resize=()=>{if(!host.clientWidth||!host.clientHeight)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function dispose(){if(disposed)return;disposed=true;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();const geometry=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();scene.traverse(o=>{const mesh=o as THREE.Mesh;if(mesh.geometry)geometry.add(mesh.geometry);if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>{materials.add(m);for(const value of Object.values(m))if(value instanceof THREE.Texture)textures.push(value);});if(o instanceof THREE.InstancedMesh)o.dispose();});geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());new Set(textures).forEach(t=>t.dispose());targets.forEach(t=>t.dispose());pmrem.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
 return {THREE,scene,camera,controls,renderer,sunDirection,compact,textures,dispose};}catch(error){emergencyDispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();throw error;}
}

export async function groundTextures(renderer:THREE.WebGLRenderer){
 const loader=new THREE.TextureLoader(),names=['grass','rock','sand'] as const;
 const sets=await Promise.all(names.map(async name=>{const [map,normalMap,roughnessMap]=await Promise.all(['color','normal','roughness'].map(part=>loader.loadAsync(`/textures/terrain/${name==='grass'?'meadow':name}-${part}.jpg`).catch(()=>{const data=new Uint8Array(32*32*4);for(let i=0;i<32*32;i++){const v=part==='roughness'?220:100+Math.round(Math.sin(i*12.7)*Math.cos(i*.41)*22),color=part==='normal'?[128,128,255]:[v,v,v];data.set([...color,255],i*4);}const texture=new THREE.DataTexture(data,32,32);texture.needsUpdate=true;return texture;})));map.colorSpace=THREE.SRGBColorSpace;for(const texture of [map,normalMap,roughnessMap]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());}return {map,normalMap,roughnessMap};}));
 return {grass:sets[0],rock:sets[1],sand:sets[2]};
}

/** Organic ripple normal map from the MIT-licensed Three.js example assets. */
export function waterNormals(){const texture=new THREE.TextureLoader().load('/textures/water-normal.jpg');texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=4;return texture;}

export function disposeAsset(root:THREE.Object3D){root.traverse(o=>{const mesh=o as THREE.Mesh;mesh.geometry?.dispose();if(mesh.material)(Array.isArray(mesh.material)?mesh.material:[mesh.material]).forEach(m=>{for(const value of Object.values(m))if(value instanceof THREE.Texture)value.dispose();m.dispose();});});}
