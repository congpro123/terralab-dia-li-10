'use client';
import {useEffect,useRef,useState} from 'react';
import {earthSunDirection} from '@/lib/models';
import {geographicVector,type Destination} from '@/lib/exploration';
import {photos} from './Photos';
export default function Globe({kind='globe',day=80,hour=12,tilt=23.5,playing=true,boundary='divergent',continental=false,speed=1,onFailure,places,focusPlace,zoomCommand,onSelectPlace,english=false}:{kind?:string;day?:number;hour?:number;tilt?:number;playing?:boolean;boundary?:string;continental?:boolean;speed?:number;onFailure?:()=>void;places?:Destination[];focusPlace?:{place:Destination;sequence:number}|null;zoomCommand?:{direction:number;sequence:number};onSelectPlace?:(p:Destination)=>void;english?:boolean}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false);
 const markerRefs=useRef<Record<string,HTMLButtonElement|null>>({});const commands=useRef({focusPlace,zoomCommand});commands.current={focusPlace,zoomCommand};
 const state=useRef({day,hour,tilt,playing,boundary,continental,speed});state.current={day,hour,tilt,playing,boundary,continental,speed};
 useEffect(()=>{
  let cancelled=false;let cleanup=()=>{};
  async function init(){
   try{
    const THREE=await import('three');const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
    if(cancelled||!host.current)return;
    const el=host.current;const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;el.appendChild(renderer.domElement);
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,kind==='plates'?1:.35,kind==='plates'?9:7.1);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=places?3.1:4.5;controls.maxDistance=12;controls.autoRotate=kind==='globe';controls.autoRotateSpeed=.45;
    let autoSpin=true;const stopSpin=()=>{autoSpin=false;flight=null;};controls.addEventListener('start',stopSpin);
    let lastFocus=-1,lastZoom=-1,flight:import('three').Vector3|null=null;
    scene.add(new THREE.AmbientLight(0xffffff,kind==='earth'?.035:kind==='plates'?1.1:1.3));const key=new THREE.DirectionalLight(0xfff5e8,3.3);key.position.set(-3,2,5);scene.add(key);const rim=new THREE.DirectionalLight(0x609fff,kind==='earth'?.035:.65);rim.position.set(3,0,-3);scene.add(rim);
    const objects:import('three').Object3D[]=[];const arrows:import('three').ArrowHelper[]=[];const earthGroup=new THREE.Group();scene.add(earthGroup);
    let earth:import('three').Mesh|undefined,clouds:import('three').Mesh|undefined;const textures:import('three').Texture[]=[];
    cleanup=()=>{controls.dispose();textures.forEach(t=>t.dispose());scene.traverse(o=>{const m=o as import('three').Mesh;m.geometry?.dispose();if(m.material)for(const mat of Array.isArray(m.material)?m.material:[m.material])mat.dispose();});renderer.dispose();renderer.domElement.remove();};
    const mat=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.75,metalness:.05});
    if(kind==='plates'){
     const plateA=new THREE.Group(),plateB=new THREE.Group();earthGroup.add(plateA,plateB);objects.push(plateA,plateB);
     const colors=[0xc88a56,0x8e543b,0xe18f47];
     for(const [g,side] of [[plateA,-1],[plateB,1]] as const){
      for(let i=0;i<3;i++){const block=new THREE.Mesh(new THREE.BoxGeometry(2.4,.3,2.7),mat(colors[i]));block.position.set(0,-i*.3,0);g.add(block);}
      const top=new THREE.Mesh(new THREE.BoxGeometry(2.4,.09,2.7),mat(side===-1?0x6da99a:0x8cb9a0));top.position.y=.2;g.add(top);
      const arrow=new THREE.ArrowHelper(new THREE.Vector3(side,0,0),new THREE.Vector3(0,.65,0),.8,0xf4e9d1,.2,.12);g.add(arrow);arrows.push(arrow);g.position.x=side*1.4;
     }
     const mantle=new THREE.Mesh(new THREE.BoxGeometry(6,.55,3),mat(0xd65336));mantle.position.y=-1.2;earthGroup.add(mantle);earthGroup.rotation.set(.3,-.3,0);
    }else{
     const loader=new THREE.TextureLoader();
     const texture=await loader.loadAsync('/images/earth.webp');textures.push(texture);
     const cloudMap=await loader.loadAsync('/images/clouds.webp');textures.push(cloudMap);
     if(cancelled){textures.forEach(t=>t.dispose());controls.dispose();renderer.dispose();renderer.domElement.remove();return;}
     texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
     cloudMap.colorSpace=THREE.NoColorSpace;cloudMap.anisotropy=4;
     earth=new THREE.Mesh(new THREE.SphereGeometry(1.65,96,64),new THREE.MeshStandardMaterial({map:texture,roughness:.87,metalness:0}));earth.rotation.y=.55;earthGroup.add(earth);
     clouds=new THREE.Mesh(new THREE.SphereGeometry(1.663,96,64),new THREE.MeshStandardMaterial({color:0xffffff,alphaMap:cloudMap,transparent:true,opacity:.94,depthWrite:false,roughness:1}));earthGroup.add(clouds);
     const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.71,64,48),new THREE.ShaderMaterial({uniforms:{sun:{value:key.position.clone().normalize()}},vertexShader:'varying vec3 n; varying vec3 v; void main(){vec4 w=modelMatrix*vec4(position,1.0);n=normalize(mat3(modelMatrix)*normal);v=normalize(cameraPosition-w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:'uniform vec3 sun; varying vec3 n; varying vec3 v; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(v))),3.5);float lit=smoothstep(-0.25,0.7,dot(normalize(n),sun));gl_FragColor=vec4(0.22,0.56,1.0,rim*(0.09+lit*0.48));}',transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending}));earthGroup.add(atmosphere);
     if(places){const initial=geographicVector(18,100,7.1);camera.position.set(initial.x,initial.y,initial.z).applyAxisAngle(new THREE.Vector3(0,1,0),.55);controls.update();}
     if(kind==='earth'){
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-2.15,0),new THREE.Vector3(0,2.15,0)]),new THREE.LineBasicMaterial({color:0xf0bc6c}));earthGroup.add(line);
      const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.18,.006,8,128),new THREE.MeshBasicMaterial({color:0xc1c4aa,transparent:true,opacity:.6}));orbit.rotation.x=Math.PI/2;scene.add(orbit);
     }
    }
    const starPositions=[];let seed=42;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<160;i++)starPositions.push((rnd()-.5)*24,(rnd()-.5)*18,-4-rnd()*8);const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xadc7c1,size:.018,transparent:true,opacity:.7})));
    const resize=()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const lost=(e:Event)=>{e.preventDefault();setFailed(true);onFailure?.();};renderer.domElement.addEventListener('webglcontextlost',lost);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let elapsed=0;let last=performance.now();
    renderer.setAnimationLoop(()=>{
      if(cancelled)return;const s=state.current;const now=performance.now();const dt=Math.min((now-last)/1000,.05);last=now;if(s.playing&&!reduced)elapsed+=dt*s.speed;
      if(earth&&clouds){if(kind==='earth'){earthGroup.rotation.z=-s.tilt*Math.PI/180;earth.rotation.y=s.hour/24*Math.PI*2+elapsed*.17;const sun=earthSunDirection(s.day,s.tilt);key.position.set(sun.x*5,0,sun.z*5);}else{earthGroup.rotation.z=places?0:.12;earth.rotation.y=places?.length ? .55 : .55+elapsed*.035;}clouds.rotation.y=earth.rotation.y+elapsed*.007;for(const object of earthGroup.children){const m=(object as import('three').Mesh).material;if(m instanceof THREE.ShaderMaterial&&m.uniforms.sun)m.uniforms.sun.value.copy(key.position).normalize();}}
      if(kind==='plates'){const [a,b]=objects;const movement=Math.sin(elapsed*.35)*.35;if(s.boundary==='transform'){a.position.set(-1.25,0,movement);b.position.set(1.25,0,-movement);a.rotation.z=0;b.rotation.z=0;arrows[0].setDirection(new THREE.Vector3(0,0,-1));arrows[1].setDirection(new THREE.Vector3(0,0,1));}else{const divergent=s.boundary==='divergent';const sign=divergent?1:-1;a.position.set(-1.3-sign*movement,divergent||s.continental?0:-.17,0);b.position.set(1.3+sign*movement,0,0);a.rotation.z=divergent?0:s.continental?.12:-.23;b.rotation.z=!divergent&&s.continental?-.12:0;arrows[0].setDirection(new THREE.Vector3(-sign,0,0));arrows[1].setDirection(new THREE.Vector3(sign,0,0));}}
      if(places&&earth){
       const command=commands.current;
       if(command.focusPlace&&command.focusPlace.sequence!==lastFocus){lastFocus=command.focusPlace.sequence;autoSpin=false;scene.updateMatrixWorld(true);const p=command.focusPlace.place,v=geographicVector(p.lat,p.lon);flight=earth.localToWorld(new THREE.Vector3(v.x,v.y,v.z)).normalize().multiplyScalar(4.7);}
       if(command.zoomCommand&&command.zoomCommand.sequence!==lastZoom){lastZoom=command.zoomCommand.sequence;if(command.zoomCommand.direction){autoSpin=false;flight=camera.position.clone().normalize().multiplyScalar(THREE.MathUtils.clamp(camera.position.length()*(command.zoomCommand.direction>0?.77:1.3),3.1,12));}}
       if(flight){camera.position.lerp(flight,reduced?1:Math.min(1,dt*4.5));if(camera.position.distanceTo(flight)<.015)flight=null;}
       key.position.copy(camera.position).add(new THREE.Vector3(-3,3,1));
      }
      controls.autoRotate=kind==='globe'&&!reduced&&s.playing&&autoSpin;controls.update();renderer.render(scene,camera);
      if(places&&earth){const occupied:{x:number;y:number}[]=[];const near=camera.position.length()<6.6;for(const p of places){const node=markerRefs.current[p.id];if(!node)continue;const g=geographicVector(p.lat,p.lon,1.68),world=earth.localToWorld(new THREE.Vector3(g.x,g.y,g.z));const towardCamera=camera.position.clone().sub(world).normalize();const front=world.clone().normalize().dot(towardCamera)>.12;const screen=world.clone().project(camera),x=(screen.x*.5+.5)*el.clientWidth,y=(-screen.y*.5+.5)*el.clientHeight;const inside=screen.z<1&&x>38&&x<el.clientWidth-38&&y>55&&y<el.clientHeight-55;const clear=!near||occupied.every(v=>Math.hypot(v.x-x,v.y-y)>95);const visible=front&&inside&&clear;node.style.left=x+'px';node.style.top=y+'px';node.style.visibility=visible?'visible':'hidden';node.style.pointerEvents=visible?'auto':'none';node.tabIndex=visible?0:-1;node.setAttribute('aria-hidden',String(!visible));node.classList.toggle('is-near',near);if(visible)occupied.push({x,y});}}
    });
    cleanup=()=>{renderer.setAnimationLoop(null);observer.disconnect();controls.removeEventListener('start',stopSpin);controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{const m=o as import('three').Mesh;m.geometry?.dispose();if(m.material){for(const material of Array.isArray(m.material)?m.material:[m.material])material.dispose();}});textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
   }catch{cleanup();if(!cancelled){setFailed(true);onFailure?.();}}
  }init();return()=>{cancelled=true;cleanup();};
 },[kind,onFailure]);
 return <div className="globe-host" ref={host} role={places?'group':'img'} aria-label={kind==='plates'?'Mô hình tương tác ranh giới mảng':'Địa cầu với ảnh vệ tinh NASA — kéo để xoay, cuộn để phóng to'}>{places&&!failed&&<div className="globe-hotspots">{places.map(p=><button key={p.id} ref={el=>{markerRefs.current[p.id]=el;}} className="globe-hotspot" style={{visibility:'hidden'}} onClick={()=>onSelectPlace?.(p)} aria-label={(english?'Open ':'Mở ')+(english?p.nameEn:p.name)}><span className="hotspot-dot"/><span className="hotspot-preview"><img src={photos[p.photo].src.replace('.webp','-480.webp')} alt="" width="64" height="45"/><span>{english?p.nameEn:p.name}</span></span></button>)}</div>}{failed&&<div className="globe-fallback"><img src="/images/lesson-5-960.webp" alt="Trái Đất được chụp từ Apollo 17"/><p>Ảnh Apollo 17 / NASA. Mở hoạt động 2D để tiếp tục khám phá.</p></div>}</div>;
}
