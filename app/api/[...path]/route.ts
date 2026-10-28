import {env} from 'cloudflare:workers';
import curriculum from '@/data/curriculum.server.json';
import {lessonContent} from '@/data/content';
import {database,getUser,randomId,randomSalt,hashPassword,sessionCookie,digest,auditLog,rateLimit} from '@/lib/auth';
import {grade,selfAssess} from '@/lib/grading';
import type {Attempt,Progress} from '@/lib/types';
import type {Unit} from '@/lib/types';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,headers:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const fail=(message:string,status=400)=>json({error:message},status);
const validPair=(p:unknown):boolean=>!!p&&typeof p==='object'&&['vi','en'].every(k=>typeof (p as Record<string,unknown>)[k]==='string'&&String((p as Record<string,unknown>)[k]).trim().length>0&&String((p as Record<string,unknown>)[k]).length<=12000);
function validUnit(raw:unknown):raw is Unit{if(!raw||typeof raw!=='object')return false;const u=raw as Unit;return typeof u.id==='string'&&[u.title,u.body,u.example,u.misconception,u.term,u.definition].every(validPair)&&!!u.check&&validPair(u.check.prompt)&&validPair(u.check.explanation)&&Array.isArray(u.check.options)&&u.check.options.length===2&&u.check.options.every(validPair)&&Number.isInteger(u.check.answer)&&u.check.answer>=0&&u.check.answer<2;}
async function handle(request:Request){
 try{
  const path=new URL(request.url).pathname.slice(5).split('/').filter(Boolean);
  const method=request.method;
  if(method!=='GET'){
    const origin=request.headers.get('origin');
    if(origin&&origin!==new URL(request.url).origin)return fail('Yêu cầu không hợp lệ.',403);
    if(Number(request.headers.get('content-length')??0)>150000)return fail('Nội dung quá lớn.',413);
  }
  const user=await getUser(request);
  if(path[0]==='session'&&method==='GET')return json({user});
  if(path[0]==='health'&&method==='GET'){await database().prepare('SELECT id FROM users LIMIT 1').first();return json({ok:true,app:'TerraLab',version:'demo-1'});}
  if(path[0]==='auth'&&method==='POST'){
    const body=await request.json() as Record<string,string>;
    const username=String(body.username??'').trim().toLowerCase();
    const password=String(body.password??'');
    if(path[1]==='logout'){
      const token=request.headers.get('cookie')?.match(/(?:^|;\s*)terra_session=([^;]+)/)?.[1];
      if(token)await database().prepare('DELETE FROM sessions WHERE id=?').bind(await digest(token)).run();
      return json({ok:true},200,{'Set-Cookie':'terra_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'});
    }
    if(!/^[a-z0-9_]{3,32}$/.test(username)||password.length<8||password.length>128)return fail('Tên đăng nhập gồm 3–32 chữ không dấu, số hoặc dấu gạch dưới. Mật khẩu từ 8–128 ký tự.');
    const ip=request.headers.get('cf-connecting-ip')??'local';
    if(!await rateLimit(`auth:${ip}:${username}`)||!await rateLimit(`auth-ip:${ip}`,60))return fail('Bạn đã thử nhiều lần. Hãy thử lại sau 15 phút.',429);
    if(path[1]==='register'){
      const name=String(body.name??'').trim();if(name.length<1||name.length>60)return fail('Tên hiển thị cần từ 1–60 ký tự.');
      if(await database().prepare('SELECT id FROM users WHERE username=?').bind(username).first())return fail('Tên đăng nhập đã được sử dụng.',409);
      const salt=randomSalt();const id=randomId();
      await database().prepare('INSERT INTO users (id,username,name,password_hash,salt,role,created_at) VALUES (?,?,?,?,?,?,?)').bind(id,username,name,await hashPassword(password,salt),salt,'student',new Date().toISOString()).run();
      return json({user:{id,username,name,role:'student'}},201,{'Set-Cookie':await sessionCookie(id,request)});
    }
    if(path[1]==='login'){
      const row=await database().prepare('SELECT * FROM users WHERE username=?').bind(username).first<{id:string;username:string;name:string;role:string;salt:string;password_hash:string}>();
      const candidate=await hashPassword(password,row?.salt??'constant-time-dummy-salt');
      if(!row||candidate!==row.password_hash)return fail('Tên đăng nhập hoặc mật khẩu chưa đúng.',401);
      return json({user:{id:row.id,username:row.username,name:row.name,role:row.role}},200,{'Set-Cookie':await sessionCookie(row.id,request)});
    }
    return fail('Không tìm thấy thao tác.',404);
  }
  if(path[0]==='glossary'&&method==='GET'){
    const rows=await database().prepare("SELECT lesson_id,data FROM content_versions WHERE status='published' ORDER BY created_at").all<{lesson_id:string;data:string}>();
    const published=new Map(rows.results.map(r=>[r.lesson_id,JSON.parse(r.data).units as Unit[]]));
    return json({terms:curriculum.flatMap(l=>(published.get(l.id)??lessonContent[l.n]??[]).map(u=>({id:u.id,lesson:l.n,term:u.term,definition:u.definition})))});
  }
  if(path[0]==='lessons'&&method==='GET'){
    const l=curriculum.find(l=>l.id===path[1]);if(!l)return fail('Không tìm thấy bài học.',404);
    const override=await database().prepare("SELECT id,data FROM content_versions WHERE lesson_id=? AND status='published' ORDER BY created_at DESC LIMIT 1").bind(l.id).first<{id:string;data:string}>();
    const content=override?JSON.parse(override.data).units:lessonContent[l.n];
    return json({...l,version:override?.id??'demo-1',units:content,questions:l.questions.map(({answer,explanation,rubric,unit,tolerance,...q})=>q)});
  }
  if(path[0]==='progress'){
    if(!user)return fail('Đăng nhập để đồng bộ tiến độ.',401);
    if(method==='GET'){
      const rows=await database().prepare('SELECT data,revision,updated_at FROM progress WHERE user_id=?').bind(user.id).all<{data:string;revision:number;updated_at:string}>();
      return json({progress:rows.results.map(r=>({...JSON.parse(r.data),revision:r.revision,updatedAt:r.updated_at}))});
    }
    if(method==='POST'){
      const p=await request.json() as Progress;
      const target=curriculum.find(l=>l.id===p.lessonId);
      if(!target||!Number.isInteger(p.module)||p.module<1||p.module>6||!Array.isArray(p.units)||p.units.length>target.topics.length||new Set(p.units).size!==p.units.length||p.units.some(id=>!target.topics.some(t=>t.id===id))||!Number.isInteger(p.revision)||p.revision<0)return fail('Tiến độ chưa hợp lệ.');
      const cleaned={...p,pre:String(p.pre??'').slice(0,4000),post:String(p.post??'').slice(0,4000),observation:String(p.observation??'').slice(0,4000)};
      const id=`${user.id}:${p.lessonId}`;const now=new Date().toISOString();
      const result=await database().prepare('INSERT INTO progress (id,user_id,lesson_id,data,revision,updated_at) VALUES (?,?,?,?,1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,revision=progress.revision+1,updated_at=excluded.updated_at WHERE progress.revision=?').bind(id,user.id,p.lessonId,JSON.stringify(cleaned),now,p.revision??0).run();
      const row=await database().prepare('SELECT data,revision,updated_at FROM progress WHERE id=?').bind(id).first<{data:string;revision:number;updated_at:string}>();
      if(!result.meta.changes)return json({error:'Tiến độ đã thay đổi trên thiết bị khác.',conflict:{...JSON.parse(row!.data),revision:row!.revision}},409);
      return json({revision:row?.revision,updatedAt:now});
    }
  }
  if(path[0]==='attempts'){
    if(method==='GET'){
      if(!user)return json({attempts:[]});
      const rows=await database().prepare('SELECT data FROM attempts WHERE user_id=? ORDER BY created_at DESC LIMIT 200').bind(user.id).all<{data:string}>();return json({attempts:rows.results.map(r=>JSON.parse(r.data))});
    }
    if(method==='POST'&&path.length===1){
      const b=await request.json() as {lessonId:string;id:string;responses:Record<string,string>};
      const l=curriculum.find(l=>l.id===b.lessonId);if(!l||!b.responses||typeof b.responses!=='object'||!/^[-a-zA-Z0-9]{12,80}$/.test(b.id))return fail('Bài nộp chưa hợp lệ.');
      if(!await rateLimit(`submit:${user?.id??request.headers.get('cf-connecting-ip')??'guest'}`,80,60000))return fail('Vui lòng chờ một phút trước khi nộp lại.',429);
      if(user){const old=await database().prepare('SELECT user_id,data FROM attempts WHERE id=?').bind(b.id).first<{user_id:string;data:string}>();if(old)return old.user_id===user.id?json(JSON.parse(old.data)):fail('Mã lượt luyện không hợp lệ.',409);}
      const result=grade(l.questions,b.responses,l.id,b.id);
      if(user)await database().prepare('INSERT INTO attempts (id,user_id,lesson_id,version,data,created_at) VALUES (?,?,?,?,?,?)').bind(result.id,user.id,l.id,result.version,JSON.stringify(result),result.createdAt).run();
      return json(result,201);
    }
    if(method==='POST'&&path[2]==='self'){
      if(!user)return fail('Cần đăng nhập để lưu điểm tự đánh giá.',401);
      const row=await database().prepare('SELECT data FROM attempts WHERE id=? AND user_id=?').bind(path[1],user.id).first<{data:string}>();if(!row)return fail('Không tìm thấy lượt luyện.',404);
      const b=await request.json() as {points:Record<string,number>};const result=selfAssess(JSON.parse(row.data),b.points??{});
      await database().prepare('UPDATE attempts SET data=? WHERE id=? AND user_id=?').bind(JSON.stringify(result),path[1],user.id).run();return json(result);
    }
  }
  if(path[0]==='admin'){
    if(path[1]==='setup'&&method==='POST'){
      const vars=env as unknown as Record<string,string>;if(!vars.ADMIN_SETUP_CODE)return fail('Chưa cấu hình mã thiết lập.',403);
      if(!await rateLimit(`setup:${request.headers.get('cf-connecting-ip')??'local'}`,5))return fail('Vui lòng thử lại sau.',429);
      const b=await request.json() as {code:string};if(b.code!==vars.ADMIN_SETUP_CODE||!user)return fail('Mã thiết lập chưa đúng hoặc chưa đăng nhập.',403);
      const activated=await database().prepare("UPDATE users SET role='admin' WHERE id=? AND NOT EXISTS (SELECT id FROM users WHERE role='admin')").bind(user.id).run();if(!activated.meta.changes)return fail('Hệ thống đã có quản trị viên.',409);await auditLog(user,'setup-admin',user.id);return json({ok:true});
    }
    if(!user||!['admin','editor','reviewer','teacher'].includes(user.role))return fail('Bạn không có quyền truy cập.',403);
    if(path[1]==='overview'&&method==='GET'){
      const versions=await database().prepare('SELECT id,lesson_id,author_id,reviewer_id,status,created_at FROM content_versions ORDER BY created_at DESC LIMIT 100').all();
      const users=user.role==='admin'?(await database().prepare('SELECT id,username,name,role,created_at FROM users ORDER BY created_at DESC LIMIT 100').all()).results:[];
      const counts=await database().prepare('SELECT COUNT(*) as total FROM attempts').first();
      const logs=user.role==='admin'?(await database().prepare('SELECT action,target,created_at FROM audit ORDER BY created_at DESC LIMIT 30').all()).results:[];
      return json({versions:versions.results,users,attemptCount:counts?.total??0,logs});
    }
    if(path[1]==='roles'&&method==='POST'){
      if(user.role!=='admin')return fail('Chỉ quản trị viên được phân quyền.',403);
      const b=await request.json() as {userId:string;role:string};if(!['student','teacher','editor','reviewer'].includes(b.role)||b.userId===user.id)return fail('Vai trò chưa hợp lệ.');
      await database().prepare('UPDATE users SET role=? WHERE id=?').bind(b.role,b.userId).run();await auditLog(user,'role:'+b.role,b.userId);return json({ok:true});
    }
    if(path[1]==='content'&&method==='GET'){
      const row=await database().prepare('SELECT * FROM content_versions WHERE id=?').bind(path[2]).first<{data:string}>();if(!row)return fail('Không tìm thấy phiên bản.',404);return json({...row,data:JSON.parse(row.data)});
    }
    if(path[1]==='content'&&method==='POST'){
      if(!['admin','editor','reviewer'].includes(user.role))return fail('Bạn không có quyền biên tập.',403);
      const b=await request.json() as {lessonId:string;units:unknown[]};const l=curriculum.find(l=>l.id===b.lessonId);
      if(!l||!Array.isArray(b.units)||b.units.length!==l.topics.length)return fail('Số cụm kiến thức chưa khớp bài học.');
      if(!b.units.every(validUnit)||new Set((b.units as Unit[]).map(u=>u.id)).size!==l.topics.length||(b.units as Unit[]).some(u=>!l.topics.some(t=>t.id===u.id)))return fail('Mỗi cụm cần mã đúng bài, đủ hai ngôn ngữ, ví dụ và kiểm tra nhanh hợp lệ.');
      const id=randomId();await database().prepare('INSERT INTO content_versions (id,lesson_id,author_id,status,data,created_at) VALUES (?,?,?,?,?,?)').bind(id,l.id,user.id,'draft',JSON.stringify({units:b.units}),new Date().toISOString()).run();await auditLog(user,'draft',id);return json({id});
    }
    if(path[1]==='review'&&method==='POST'){
      const b=await request.json() as {id:string;action:string};const v=await database().prepare('SELECT * FROM content_versions WHERE id=?').bind(b.id).first<{id:string;lesson_id:string;author_id:string;status:string}>();if(!v)return fail('Không tìm thấy phiên bản.',404);
      if(b.action==='submit'&&v.status==='draft'&&(v.author_id===user.id||user.role==='admin')){
        await database().prepare("UPDATE content_versions SET status='review' WHERE id=?").bind(v.id).run();
      }else if(b.action==='publish'&&v.status==='review'&&['admin','reviewer'].includes(user.role)&&v.author_id!==user.id){
        await database().batch([database().prepare("UPDATE content_versions SET status='archived' WHERE lesson_id=? AND status='published'").bind(v.lesson_id),database().prepare("UPDATE content_versions SET status='published',reviewer_id=? WHERE id=?").bind(user.id,v.id)]);
      }else return fail('Cần gửi duyệt trước và người duyệt phải khác người soạn.',403);
      await auditLog(user,b.action,v.id);return json({ok:true});
    }
  }
  return fail('Không tìm thấy dữ liệu.',404);
 }catch(error){if(error instanceof SyntaxError)return fail('Dữ liệu gửi lên chưa đúng định dạng.');console.error('TerraLab API error',error instanceof Error?error.message:'unknown');return fail('Chưa thể xử lý. Dữ liệu đang nhập vẫn được giữ; bạn có thể thử lại.',500);}
}
export const GET=handle;export const POST=handle;export const PATCH=handle;
