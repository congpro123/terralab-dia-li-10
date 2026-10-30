export type SceneScheduler={setTimeout:(fn:()=>void,ms:number)=>unknown;clearTimeout:(id:unknown)=>void};
/** A scene must either render or release its resources and report one failure. */
export function createSceneGuard(onFailure:(error:unknown)=>void,timeoutMs=20000,scheduler:SceneScheduler={setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id as ReturnType<typeof setTimeout>)}){
 let active=true,rendered=false;const detach:(()=>void)[]=[];
 const timer=scheduler.setTimeout(()=>fail(new Error('Scene loading timed out')),timeoutMs);
 function clear(){scheduler.clearTimeout(timer);detach.splice(0).forEach(fn=>fn());}
 function fail(error:unknown){if(!active)return;active=false;clear();onFailure(error);}
 return {ready(){const first=!rendered;rendered=true;scheduler.clearTimeout(timer);return first;},fail,close(){active=false;clear();},observe(canvas:EventTarget){const lost=(event:Event)=>{event.preventDefault();fail(new Error('WebGL context lost'));};canvas.addEventListener('webglcontextlost',lost);detach.push(()=>canvas.removeEventListener('webglcontextlost',lost));},frame(fn:()=>void){return ()=>{if(!active)return;try{fn();}catch(error){fail(error);}};}};
}
export function isModuleFailure(error:unknown){return /dynamically imported module|importing a module script|chunkloaderror|loading chunk|failed to fetch.*module|module script.*failed/i.test(String(error instanceof Error?error.message:error));}
/** Refresh a stale application at most once per published release; retain URL hash and saved drafts. */
export async function recoverStaleModule(error:unknown){
 if(!isModuleFailure(error)||typeof window==='undefined'||!navigator.onLine)return false;
 try{const response=await fetch('/release.json',{cache:'no-store'});if(!response.ok)return false;const {release}=await response.json() as {release?:unknown};if(typeof release!=='string'||!/^[a-f0-9]{12}$/.test(release))return false;
 const url=new URL(window.location.href);if(url.searchParams.get('v')===release||sessionStorage.getItem('terra-recovered-release')===release)return false;
 sessionStorage.setItem('terra-recovered-release',release);url.searchParams.set('v',release);window.location.replace(url.href);return true;
 }catch{return false;}
}
