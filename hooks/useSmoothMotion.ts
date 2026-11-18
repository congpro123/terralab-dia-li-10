'use client';
import {useEffect,type RefObject} from 'react';

// Progressive enhancement: content is visible even when animation APIs are unavailable.
export function useSmoothMotion(ref:RefObject<HTMLElement|null>,route:string){
 useEffect(()=>{
  const root=ref.current;if(!root)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(preference.matches||typeof root.animate!=='function'||typeof IntersectionObserver==='undefined')return;
  let stopped=false,frame=0;const seen=new WeakSet<Element>(),active=new Set<Animation>();
  const run=(element:HTMLElement,frames:Keyframe[],options:KeyframeAnimationOptions)=>{if(stopped||preference.matches)return;const animation=element.animate(frames,options);active.add(animation);animation.onfinish=animation.oncancel=()=>active.delete(animation);};
  run(root,[{opacity:.6},{opacity:1}],{duration:240,easing:'ease-out'});
  const observer=new IntersectionObserver(entries=>{
   let order=0;
   for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);
    run(entry.target as HTMLElement,[{opacity:.35,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:460,delay:Math.min(order++*45,180),easing:'cubic-bezier(.2,.75,.25,1)'});
   }
  },{threshold:.08});
  const scan=()=>{frame=0;if(stopped)return;root.querySelectorAll<HTMLElement>('.home-copy,.planet-explorer,.course-card,.guide-hero,.guide-steps article,.guide-demo,.guide-tips>section,.lesson-reviews,.reading-card,.study-paper,.field-lab').forEach(element=>{if(!seen.has(element)){seen.add(element);observer.observe(element);}});};
  scan();const mutations=new MutationObserver(()=>{if(!frame&&!stopped)frame=requestAnimationFrame(scan);});mutations.observe(root,{childList:true,subtree:true});
  const stop=()=>{stopped=true;observer.disconnect();mutations.disconnect();cancelAnimationFrame(frame);active.forEach(animation=>animation.cancel());active.clear();};
  const changed=()=>{if(preference.matches)stop();};preference.addEventListener('change',changed);
  return()=>{stop();preference.removeEventListener('change',changed);};
 },[ref,route]);
}
