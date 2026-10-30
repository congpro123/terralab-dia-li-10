import {plateHeight,platePose,type PlateBoundary} from '@/lib/tectonic-geometry';

/** Accessible 2D fallback driven by the same one-way process as the 3D scene. */
export default function TectonicDiagram({boundary,continental,progress,english}:{boundary:PlateBoundary;continental:boolean;progress:number;english:boolean}){
 const transform=boundary==='transform',scale=32;
 return <svg viewBox="0 0 620 340" role="img" aria-label={english?'Moving tectonic plates at the selected process stage':'Hai mảng kiến tạo chuyển động theo giai đoạn đã chọn'}>
  <defs><pattern id="plate-rock" width="170" height="130" patternUnits="userSpaceOnUse"><image href="/textures/terrain/rock-color.jpg" width="170" height="130" opacity=".65"/></pattern></defs>
  <rect width="620" height="340" fill="#e8e9df"/>
  {!transform&&<rect x="30" y="218" width="560" height="31" fill="#87745e"/>}
  {!transform&&boundary==='divergent'&&<rect x={310-(.08+1.1*progress)*scale} y="145" width={(.16+2.2*progress)*scale} height="73" fill="#ad5b38"/>}
  {([-1,1] as const).map(side=>{
   const pose=platePose(side,boundary,continental,progress);
   if(transform)return <g key={side} transform={`translate(${310+pose.x*29} ${157+pose.z*26})`}>
    <rect x="-87" y="-92" width="174" height="184" fill={side===-1?'#84917b':'#a19a7e'}/><rect x="-87" y="-92" width="174" height="184" fill="url(#plate-rock)"/>
    <path d="M-87 15H87" stroke="#e7d6ad" strokeWidth="5"/>
   </g>;
   const top=Array.from({length:49},(_,i)=>{const x=-3+i/8;return `${i?'L':'M'}${x*scale} ${-plateHeight(x,0,side,boundary,continental,progress)*scale}`;}).join(' ');
   return <g key={side} transform={`translate(${310+pose.x*scale} ${150-pose.y*scale}) rotate(${-pose.rotationZ*180/Math.PI}) scale(${pose.scaleX} ${pose.scaleY})`}>
    <path d={`${top}L96 67.2H-96Z`} fill={side===-1?'#879981':'#a49e7c'}/><path d={`${top}L96 67.2H-96Z`} fill="url(#plate-rock)"/>
    <path d="M-96 20H96M-96 42H96" stroke="#6b5945" opacity=".8" strokeWidth="3"/>
   </g>;
  })}
  <text x="310" y="306" textAnchor="middle" fill="#50684d" fontSize="13">{transform?(english?'The pale rock band becomes offset':'Dải đá sáng dịch lệch theo hai mảng'):(english?'Drag the timeline to inspect each stage':'Kéo thanh diễn tiến để xem từng giai đoạn')}</text>
 </svg>;
}
