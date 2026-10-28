'use client';
import {useEffect,useRef,useState} from 'react';
import {earthSunDirection} from '@/lib/models';
export default function Globe({kind='globe',day=80,hour=12,tilt=23.5,playing=true,boundary='divergent',continental=false,speed=1,onFailure}:{kind?:string;day?:number;hour?:number;tilt?:number;playing?:boolean;boundary?:string;continental?:boolean;speed?:number;onFailure?:()=>void}){
 const host=useRef<HTMLDivElement>(null);const [failed,setFailed]=useState(false);
 const state=useRef({day,hour,tilt,playing,boundary,continental,speed});state.current={day,hour,tilt,playing,boundary,continental,speed};
 useEffect(()=>{
  let cancelled=false;let cleanup=()=>{};
  async function init(){
   try{
    const THREE=await import('three');const {OrbitControls}=await import('three/addons/controls/OrbitControls.js');
    if(cancelled||!host.current)return;
    const el=host.current;const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
    const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(0,1,kind==='plates'?9:7.7);
    const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=4.5;controls.maxDistance=12;controls.autoRotate=kind==='globe';controls.autoRotateSpeed=.45;
    scene.add(new THREE.AmbientLight(0x8bb6b7,kind==='earth'?.13:1.2));const key=new THREE.DirectionalLight(0xffefcf,3.1);key.position.set(-4,2,4);scene.add(key);const rim=new THREE.DirectionalLight(0x59c9d1,kind==='earth'?.12:2);rim.position.set(3,0,-3);scene.add(rim);
    const objects:import('three').Object3D[]=[];const arrows:import('three').ArrowHelper[]=[];const earthGroup=new THREE.Group();scene.add(earthGroup);
    let earth:import('three').Mesh|undefined;let texture:import('three').CanvasTexture|undefined;
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
     const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#153a49';ctx.fillRect(0,0,2048,1024);
     ctx.strokeStyle='rgba(148,195,184,.17)';ctx.lineWidth=1;for(let x=0;x<=2048;x+=2048/24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,1024);ctx.stroke();}for(let y=0;y<=1024;y+=1024/12){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(2048,y);ctx.stroke();}
     try{const data=await fetch('/land-110m.json').then(r=>r.json()) as import('topojson-specification').Topology<{land:import('topojson-specification').GeometryObject}>;const {feature}=await import('topojson-client');const geo=feature(data,data.objects.land) as unknown as {geometry?:{type:string;coordinates:number[][][][]};features?:{geometry:{type:string;coordinates:number[][][][]}}[]};const land=geo.geometry?{geometry:geo.geometry}:geo.features![0];
      const polys=land.geometry.type==='MultiPolygon'?land.geometry.coordinates:[land.geometry.coordinates as unknown as number[][][]];ctx.fillStyle='#87a996';ctx.strokeStyle='#c3d0ac';ctx.lineWidth=.65;
      for(const poly of polys){ctx.beginPath();for(const ring of poly){ring.forEach(([lon,lat],i)=>{const x=(lon+180)/360*2048,y=(90-lat)/180*1024;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();}ctx.fill('evenodd');ctx.stroke();}
     }catch{throw new Error('Coastline asset unavailable');}
     if(cancelled){renderer.dispose();return;}
     texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
     earth=new THREE.Mesh(new THREE.SphereGeometry(1.65,64,48),new THREE.MeshStandardMaterial({map:texture,roughness:.84,metalness:.08}));earthGroup.add(earth);
     const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(1.69,48,32),new THREE.MeshBasicMaterial({color:0x74d2d0,transparent:true,opacity:.055,side:THREE.BackSide}));earthGroup.add(atmosphere);
     if(kind==='earth'){
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,-2.15,0),new THREE.Vector3(0,2.15,0)]),new THREE.LineBasicMaterial({color:0xf0bc6c}));earthGroup.add(line);
      const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.18,.006,8,128),new THREE.MeshBasicMaterial({color:0xc1c4aa,transparent:true,opacity:.6}));orbit.rotation.x=Math.PI/2;scene.add(orbit);
     }else if(kind==='globe'){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.12,.007,8,180),new THREE.MeshBasicMaterial({color:0x92b5a0,transparent:true,opacity:.45}));ring.rotation.set(1.1,.3,-.4);scene.add(ring);
     }
    }
    const starPositions=[];let seed=42;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<160;i++)starPositions.push((rnd()-.5)*24,(rnd()-.5)*18,-4-rnd()*8);const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xadc7c1,size:.018,transparent:true,opacity:.7})));
    const resize=()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(el);resize();
    const lost=(e:Event)=>{e.preventDefault();setFailed(true);onFailure?.();};renderer.domElement.addEventListener('webglcontextlost',lost);
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let elapsed=0;let last=performance.now();
    renderer.setAnimationLoop(()=>{
      if(cancelled)return;const s=state.current;const now=performance.now();const dt=Math.min((now-last)/1000,.05);last=now;if(s.playing&&!reduced)elapsed+=dt*s.speed;
      if(kind==='earth'&&earth){earthGroup.rotation.z=-s.tilt*Math.PI/180;earth.rotation.y=s.hour/24*Math.PI*2+elapsed*.17;const sun=earthSunDirection(s.day,s.tilt);key.position.set(sun.x*5,0,sun.z*5);}
      if(kind==='plates'){const [a,b]=objects;const movement=Math.sin(elapsed*.35)*.35;if(s.boundary==='transform'){a.position.set(-1.25,0,movement);b.position.set(1.25,0,-movement);a.rotation.z=0;b.rotation.z=0;arrows[0].setDirection(new THREE.Vector3(0,0,-1));arrows[1].setDirection(new THREE.Vector3(0,0,1));}else{const divergent=s.boundary==='divergent';const sign=divergent?1:-1;a.position.set(-1.3-sign*movement,divergent||s.continental?0:-.17,0);b.position.set(1.3+sign*movement,0,0);a.rotation.z=divergent?0:s.continental?.12:-.23;b.rotation.z=!divergent&&s.continental?-.12:0;arrows[0].setDirection(new THREE.Vector3(-sign,0,0));arrows[1].setDirection(new THREE.Vector3(sign,0,0));}}
      controls.autoRotate=kind==='globe'&&!reduced&&s.playing;controls.update();renderer.render(scene,camera);
    });
    cleanup=()=>{renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{const m=o as import('three').Mesh;m.geometry?.dispose();if(m.material){for(const material of Array.isArray(m.material)?m.material:[m.material])material.dispose();}});texture?.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();};
   }catch{if(!cancelled){setFailed(true);onFailure?.();}}
  }init();return()=>{cancelled=true;cleanup();};
 },[kind,onFailure]);
 return <div className="globe-host" ref={host} role="img" aria-label={kind==='plates'?'Mô hình tương tác ranh giới mảng':'Quả địa cầu tương tác — kéo để xoay, cuộn để phóng to'}>{failed&&<div className="globe-fallback"><div className="flat-earth">◉</div><p>Chuyển sang hoạt động 2D để tiếp tục khám phá.</p></div>}</div>;
}
