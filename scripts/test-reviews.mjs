import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import vm from 'node:vm';
import ts from 'typescript';
const db=new DatabaseSync(':memory:');
for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
const users={a:{id:'a',name:'Learner A',role:'student'},b:{id:'b',name:'Learner B',role:'student'},teacher:{id:'teacher',name:'Teacher',role:'teacher'}};
for(const u of Object.values(users))db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?)').run(u.id,u.id,u.name,'unused','unused',u.role,'2026-01-01');
const database=()=>({prepare(sql){let values=[];return {bind(...v){values=v;return this;},async first(){return db.prepare(sql).get(...values)??null;},async all(){return {results:db.prepare(sql).all(...values)};},async run(){return {meta:db.prepare(sql).run(...values)};}};}});
function load(file,imports={}){const out={exports:{}};const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports:out.exports,require:n=>{if(!(n in imports))throw Error('Unexpected import '+n);return imports[n];},Response,Request,URL,console,Date,crypto});return out.exports;}
const feedback=load('lib/feedback.ts');
for(const raw of [null,{},[],{rating:0,comment:''},{rating:6,comment:''},{rating:2.5,comment:''},{rating:'5',comment:''},{rating:5,comment:42},{rating:4,comment:'x'.repeat(2001)}])assert.equal(feedback.reviewInput(raw),null);
assert.equal(feedback.reviewInput({rating:5,comment:' hello '}).comment,'hello');
const route=load('app/api/[...path]/route.ts',{'cloudflare:workers':{env:{}},'@/data/curriculum.server.json':{default:[{id:'LES-02'},{id:'LES-03'}]},'@/data/question-translations.json':{},'@/data/question-feedback.server.json':{},'@/data/content':{lessonContent:{}},'@/lib/auth':{database,getUser:async r=>users[r.headers.get('x-test-user')]??null,rateLimit:async()=>true},'@/lib/grading':{},'@/lib/feedback':feedback});
async function call(path,body,user,origin){const r=await route.GET(new Request('https://geosim.test/api/reviews/'+path,{method:body===undefined?'GET':'POST',headers:{...(user?{'x-test-user':user}:{}),...(origin?{origin}:{}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}));return {status:r.status,data:await r.json()};}
assert.equal((await call('LES-02')).data.summary.total,0);
assert.equal((await call('LES-02',{rating:5,comment:'Guest'})).status,401);
assert.equal((await call('LES-02',{rating:5,comment:'Cross-site'},'a','https://evil.test')).status,403);
assert.equal((await call('LES-999')).status,404);
assert.equal((await call('LES-02',{rating:6,comment:''},'a')).status,400);
assert.equal((await call('LES-02',{rating:5,comment:'A useful lesson'},'a')).status,200);
assert.equal((await call('LES-02',{rating:3,comment:'Question from B'},'b')).status,200);
let all=await call('LES-02');assert.equal(all.data.summary.total,2);assert.equal(all.data.summary.average,4);assert.ok(all.data.reviews.every(r=>!r.canEdit&&!r.canDelete));assert.ok(all.data.reviews.every(r=>!('user_id' in r)));
let overview=await call('summary');assert.equal(overview.status,200);assert.equal(overview.data.summaries['LES-02'].total,2);assert.equal(overview.data.summaries['LES-02'].average,4);assert.equal(overview.data.summaries['LES-03'],undefined);
const bReview=(await call('LES-02',undefined,'b')).data.reviews.find(r=>r.canEdit);assert.equal(bReview.canDelete,true);
assert.equal((await call('LES-02/remove',{id:bReview.id},'a')).status,404);
assert.equal((await call('LES-03/remove',{id:bReview.id},'b')).status,404);
assert.equal((await call('LES-02',{rating:4,comment:'<script>alert(1)</script>\nUpdated'},'a')).status,200);
all=await call('LES-02',undefined,'a');assert.equal(all.data.summary.total,2);assert.equal(all.data.summary.average,3.5);assert.equal(all.data.mine.comment,'<script>alert(1)</script>\nUpdated');assert.equal((await call('LES-03')).data.summary.total,0);
overview=await call('summary');assert.equal(overview.data.summaries['LES-02'].total,2);assert.equal(overview.data.summaries['LES-02'].average,3.5);assert.equal((await call('LES-03',{rating:1,comment:''},'b')).status,200);overview=await call('summary');assert.equal(overview.data.summaries['LES-03'].average,1);assert.equal(overview.data.summaries['LES-02'].total,2);
assert.equal((await call('LES-02/remove',{id:bReview.id},'teacher')).status,200);
assert.equal((await call('LES-02/remove',{id:'a:LES-02'},'a')).status,200);
assert.equal((await call('LES-02')).data.summary.total,0);
for(let i=0;i<23;i++){const id='many'+i;db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?)').run(id,id,id,'unused','unused','student','2026');db.prepare('INSERT INTO lesson_reviews VALUES (?,?,?,?,?,?,?)').run(id,id,'LES-02',4,'Paginated','2026','2026');}
const first=(await call('LES-02')).data,next=(await call('LES-02?offset=20')).data;assert.equal(first.reviews.length,20);assert.equal(first.hasMore,true);assert.equal(next.reviews.length,3);assert.equal(next.hasMore,false);assert.equal(new Set([...first.reviews,...next.reviews].map(r=>r.id)).size,23);assert.equal(first.summary.total,23);
db.close();
console.log('PASS review validation, real SQLite migrations/queries, guest reading, authentication, cross-origin rejection, account ownership, teacher moderation, upserts, aggregates, lesson isolation and pagination.');
