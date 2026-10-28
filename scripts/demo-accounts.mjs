import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const root=new URL('../',import.meta.url),path=new URL('.sites-runtime/demo-access.json',root);
await mkdir(new URL('.sites-runtime/',root),{recursive:true});await mkdir(new URL('outputs/',root),{recursive:true});
let config;try{config=JSON.parse(await readFile(path,'utf8'));}catch{config={setupCode:randomBytes(24).toString('hex'),admin:{username:'quantri',name:'Quản trị TerraLab',password:randomBytes(15).toString('base64url')},reviewer:{username:'bien_tap',name:'Biên tập học liệu',password:randomBytes(15).toString('base64url')}};await writeFile(path,JSON.stringify(config,null,2));}
await writeFile(new URL('.dev.vars',root),'ADMIN_SETUP_CODE='+config.setupCode+'\n');
if(process.argv.includes('--configure-only')){console.log('Prepared local configuration; secrets remain in ignored local files.');process.exit(0);}
const base=process.env.TERRA_SEED_URL??'http://127.0.0.1:5173';
async function call(route,body,cookie=''){const res=await fetch(base+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...(process.env.TERRA_HOST_AUTH?{'OAI-Sites-Authorization':'Bearer '+process.env.TERRA_HOST_AUTH}:{})},body:JSON.stringify(body)});const data=await res.json();return {res,data,cookie:res.headers.get('set-cookie')?.split(';')[0]??''};}
async function account(value){let r=await call('auth/register',value);if(r.res.status===409)r=await call('auth/login',value);if(!r.res.ok)throw Error(r.data.error);return r;}
const admin=await account(config.admin);if(admin.data.user.role!=='admin'){const setup=await call('admin/setup',{code:config.setupCode},admin.cookie);if(!setup.res.ok)throw Error(setup.data.error);}
const reviewer=await account(config.reviewer);const role=await call('admin/roles',{userId:reviewer.data.user.id,role:'reviewer'},admin.cookie);if(!role.res.ok)throw Error(role.data.error);
await writeFile(new URL('outputs/TAI_KHOAN_DEMO.txt',root),'TERRALAB — TÀI KHOẢN DEMO RIÊNG TƯ\n\nĐịa chỉ: '+base+'\n\nQuản trị\nTên đăng nhập: '+config.admin.username+'\nMật khẩu: '+config.admin.password+'\n\nBiên tập / duyệt\nTên đăng nhập: '+config.reviewer.username+'\nMật khẩu: '+config.reviewer.password+'\n\nKhông đưa tệp này vào mã nguồn công khai. Người học tự tạo tài khoản riêng.\n');
console.log('Demo accounts ready. Private access details: outputs/TAI_KHOAN_DEMO.txt');
