'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Camera,Check,CheckCircle2,ChevronDown,FlaskConical,Info,Languages,Target} from 'lucide-react';
import type {Attempt,Mode,Progress,Unit,User} from '@/lib/types';
import {lessonStepStatus,readingIndex,studySteps,explorationIndex,exploredTopics,finishTopicExploration,topicScene} from '@/lib/learning';
import type {Lesson} from './TerraApp';
import LangText from './LangText';
import {InlinePair,Bilingual} from './Language';
import {translate} from '@/lib/language';
import Simulation from './Simulations';
import Quiz from './Quiz';
import {PhotoBanner,PhotoObservation} from './Photos';
type Props={lesson:Lesson;progress:Progress;module:number;focusId?:string;mode:Mode;user:User|null;attempts:Attempt[];sync:string;onMode:(m:Mode)=>void;onOpen:(n:number,m?:number,id?:string)=>void;onCatalog:()=>void;onProgress:(patch:Partial<Progress>)=>void;onAttempt:(a:Attempt)=>void;notify:(s:string)=>void};

export default function LessonWorkspace({lesson,progress:p,module,focusId,mode,user,attempts,sync,onMode,onOpen,onCatalog,onProgress,onAttempt,notify}:Props){
 const [outlineOpen,setOutlineOpen]=useState(false);const en=mode==='en';const t=(vi:string,english:string)=>translate(mode,vi,english);
 const done=lessonStepStatus(lesson,p,attempts),count=done.filter(Boolean).length;
 const index=module===3?explorationIndex(lesson.units,p,focusId):readingIndex(lesson.units,p.units,focusId),unit=lesson.units[index],focusIndex=index;
 const explored=exploredTopics(lesson.units,p),sceneN=topicScene(lesson.n,index);
 const topicStates=(p.simState.topicStates??{}) as Record<string,Record<string,unknown>>;
 const sceneSaved=topicStates[unit.id]??(sceneN===lesson.n&&(p.simState.activeTopicId===unit.id||!p.simState.activeTopicId)?p.simState:sceneN===6?{choice:'convergent',b:100}:undefined);
 const step=studySteps[module-1];
 const open=(m:number,id?:string)=>{setOutlineOpen(false);onOpen(lesson.n,m,id??([2,3].includes(m)?unit.id:undefined));};
 useEffect(()=>{document.getElementById('study-section-heading')?.focus({preventScroll:true});},[module,unit?.id]);
 function finishUnit(){onProgress({units:[...new Set([...p.units,unit.id])]});open(3,unit.id);}
 function finishExploration(){const result=finishTopicExploration(lesson.units,p,index);onProgress({simDone:result.simDone,simState:{...p.simState,exploredTopics:result.explored,activeTopicId:result.next>=0?lesson.units[result.next].id:unit.id}});if(result.next>=0)open(2,lesson.units[result.next].id);else open(4);}
 function finishSummary(){onProgress({summary:true});notify(t('Đã lưu tổng kết. Bạn có thể học bài tiếp theo.','Summary saved. You can continue to the next lesson.'));}
 return <div className={`lesson-workspace ${module===3?'is-exploring':''}`}>
  <div className="lesson-topline"><button className="text-button" onClick={onCatalog}><ArrowLeft size={17}/>{t('Danh sách bài học','All lessons')}</button><span className="save-state"><span className="live-dot"/>{sync==='saving'?t('Đang lưu…','Saving…'):sync==='synced'?t('Đã lưu tiến độ','Progress saved'):sync==='offline'?t('Lưu trên máy · chờ mạng','Saved locally · waiting for connection'):t('Tự lưu trên thiết bị','Saved on this device')}</span></div>
  <header className="study-lesson-title"><span className="eyebrow">{t('BÀI','LESSON')} {lesson.n}</span><h1><Bilingual vi={lesson.title} en={lesson.titleEn}/></h1></header>
  <div className="lesson-columns">
   <section className="study-main" aria-label={t('Nội dung đang học','Current learning activity')}>
    <div className="study-section-title"><span>{t('BƯỚC','STEP')} {module} / 6</span><h2 id="study-section-heading" tabIndex={-1}><Bilingual vi={[2,3].includes(module)?step.vi+' · Phần '+(index+1):step.vi} en={[2,3].includes(module)?step.en+' · Section '+(index+1):step.en}/></h2><p>{t(step.hint,step.hintEn)}</p></div>
    {module===1&&<>
     <section className="study-paper lesson-welcome"><h3>{t('Hôm nay, mình học gì?','What will we learn today?')}</h3><p>{t(lesson.goal,'Explore the key ideas, try an experiment and check your understanding, one step at a time.')}</p><button className="primary" onClick={()=>open(2)}>{t('Đọc và khám phá từng phần','Read and explore one section at a time')}<ArrowRight size={18}/></button><details className="study-extra"><summary>{t('Những điều bạn sẽ hiểu sau bài này','What you will understand after this lesson')}</summary><ul className="learning-outcomes">{lesson.topics.map(u=><li key={u.id}><CheckCircle2 size={19}/>{t(u.vi,u.en)}</li>)}</ul><div className="study-note"><Info size={18}/><p>{t('Không cần biết trước đáp án. Hãy đọc, thử và tự rút ra điều mới.','You do not need to know the answers yet. Read, experiment and discover.')}</p></div></details><details className="study-extra"><summary>{t('Ghi một dự đoán trước khi học (không bắt buộc)','Write a prediction before learning (optional)')}</summary><label>{t('Bạn đang nghĩ gì về chủ đề này?','What do you currently think about this topic?')}<textarea rows={3} maxLength={4000} value={p.pre} onChange={e=>onProgress({pre:e.target.value})}/></label></details></section>
     <PhotoBanner n={lesson.n} english={en}/>
    </>}
    {module===2&&<>
     <div className="reading-toolbar"><span><BookOpen size={17}/>{t('Phần','Section')} {index+1} / {lesson.units.length}</span><label><Languages size={17}/><select aria-label={t('Ngôn ngữ đọc','Reading language')} value={mode} onChange={e=>onMode(e.target.value as Mode)}><option value="vi">Tiếng Việt</option><option value="en">English</option><option value="parallel">Việt + English</option><option value="ondemand">Dịch khi cần</option></select></label></div>
     <nav className="reading-parts" aria-label={t('Các phần kiến thức','Reading sections')}>{lesson.units.map((u,i)=><button key={u.id} aria-current={i===index?'step':undefined} className={i===index?'current':p.units.includes(u.id)?'done':''} onClick={()=>open(2,u.id)} title={t(u.title.vi,u.title.en)}>{p.units.includes(u.id)?<Check size={15}/>:i+1}<span>{t(u.title.vi,u.title.en)}</span></button>)}</nav>
     <ReadingCard key={unit.id} unit={unit} mode={mode} number={index+1}/>
     <StepActions previousLabel={index?t('Phần trước','Previous section'):t('Bắt đầu','Get ready')} onPrevious={()=>index?open(2,lesson.units[index-1].id):open(1)} nextLabel={t('Đã hiểu · khám phá phần này','Understood · explore this section')} onNext={finishUnit}/>
     <button className="quiet-explore" onClick={()=>open(3,unit.id)}><FlaskConical size={16}/>{t('Muốn nhìn thử? Mở mô phỏng của phần này','Want to see it? Open the related experiment')}<ArrowRight size={15}/></button>
    </>}
    {module===3&&<>
     <div className="study-instruction"><FlaskConical size={23}/><div><h3>{t('Thay một điều kiện. Quan sát điều thay đổi.','Change one condition. Observe what happens.')}</h3><p>{t('Khám phá ngay phần vừa đọc. Lưu lượt quan sát này để chuyển sang phần kế tiếp.','Explore the section you just read. Save this observation to move to the next section.')}</p></div></div>
     <nav className="topic-exploration-path" aria-label={t('Các phần đọc và khám phá','Read and explore sections')}>{lesson.units.map((u,i)=><button key={u.id} aria-current={i===index?'step':undefined} className={i===index?'current':explored.includes(u.id)?'done':''} onClick={()=>open(3,u.id)}><span>{explored.includes(u.id)?<Check size={14}/>:i+1}</span>{t(u.title.vi,u.title.en)}</button>)}</nav>
     {focusIndex>=0&&<div className="study-context"><span>{t('Đang xem minh họa cho','Related to')}: {t(unit.title.vi,unit.title.en)}</span><button className="text-button" onClick={()=>open(2,focusId)}><ArrowLeft size={15}/>{t('Quay lại phần đang đọc','Return to reading')}</button></div>}
     <section className="topic-observation"><span className="eyebrow">{t('NHIỆM VỤ CỦA PHẦN NÀY','THIS SECTION’S OBSERVATION')}</span><p>{lesson.n===7?t(...([
 ['Chạy mô hình va chạm lục địa. Quan sát lớp đá bị ép và nâng lên. Đây là một ví dụ về tác động tạo địa hình của nội lực.','Play the continental collision. Watch the rock compress and rise: one example of relief formed by endogenic forces.'],
 ['Tăng mưa rồi giảm lớp phủ. Quan sát nước chảy tràn và bờ sông. Ngoại lực tác động trên bề mặt, khác với chuyển động từ bên trong Trái Đất.','Increase rain, then reduce vegetation. Observe runoff and the riverbank. Exogenic forces act at the surface, unlike movements from within Earth.'],
 ['Giữ độ dốc, tăng mưa. Theo dõi phần bờ bị khoét. Mô hình thể hiện bóc mòn; phong hóa là biến đổi hoặc phá vỡ vật liệu ngay tại chỗ.','Hold slope fixed and increase rain. Watch the bank retreat. The model demonstrates erosion; weathering alters or breaks material in place.'],
 ['Bấm Chạy để theo dõi các hạt trôi về hạ lưu; giảm mưa để so sánh dòng chảy. Mô hình minh họa vận chuyển; bồi tụ xảy ra khi tác nhân không còn đủ sức mang vật liệu.','Press Play to follow particles downstream; lower rain to compare the flow. This illustrates transport. Deposition occurs when the transporting agent can no longer carry its load.']
 ] as [string,string][])[index]):t(unit.check.prompt.vi,unit.check.prompt.en)}</p></section>
     <Simulation key={lesson.id+':'+unit.id} n={sceneN} heading={unit.title} lessonNumber={lesson.n} english={en} saved={sceneSaved} topicIndex={sceneN===lesson.n?index:undefined} onState={state=>{const previous=topicStates[unit.id];if(JSON.stringify(state)!==JSON.stringify(previous))onProgress({simState:{...p.simState,activeTopicId:unit.id,topicStates:{...topicStates,[unit.id]:state}}});}} onComplete={finishExploration}/>
     <p className="topic-next-note">{index<lesson.units.length-1?t('Sau khi lưu: đọc phần “'+lesson.units[index+1].title.vi+'”.','After saving: read “'+lesson.units[index+1].title.en+'”.'):t('Sau phần cuối, bạn sẽ giải thích điều đã quan sát rồi luyện tập.','After the final section, explain your observations and practise.')}</p>
     <details className="study-extra"><summary><Camera size={17}/>{t('Đối chiếu với ảnh thật','Compare with a real photograph')}</summary><PhotoObservation n={lesson.n} english={en}/></details>
     <details className="study-extra"><summary>{t('Nguồn dữ liệu và giới hạn mô hình','Data sources and model limitations')}</summary><p>{lesson.sim.data}</p><p>{lesson.sim.fallback}</p></details>
     <button className="text-button" onClick={()=>open(2,focusId)}><ArrowLeft size={16}/>{t('Quay lại đọc hiểu','Back to reading')}</button>
    </>}
    {module===4&&<>
     <section className="study-paper explanation-paper"><span className="eyebrow">{t('TỪ ĐIỀU VỪA QUAN SÁT','FROM WHAT YOU OBSERVED')}</span><h3>{t('Vì sao kết quả thay đổi?','Why did the result change?')}</h3><p>{t(lesson.sim.inquiry,'Describe one change you made, what happened and the geographical idea that explains it.')}</p><label htmlFor="study-explanation">{t('Giải thích bằng lời của bạn','Explain in your own words')}</label><textarea id="study-explanation" rows={6} maxLength={4000} value={p.post} onChange={e=>onProgress({post:e.target.value})} placeholder={t('Tôi đã thay đổi… Tôi quan sát thấy… Điều này xảy ra vì…','I changed… I observed… This happened because…')}/><span className="field-help">{t('Một vài câu là đủ. Câu trả lời được tự lưu khi bạn viết.','A few sentences are enough. Your answer saves as you type.')}</span><details className="study-extra"><summary>{t('Xem lại dự đoán hoặc thêm ghi chú','Review your prediction or add a note')}</summary><p><strong>{t('Dự đoán trước khi học:','Your earlier prediction:')}</strong> {p.pre||t('Bạn chưa ghi dự đoán.','No prediction recorded.')}</p><label>{t('Ghi chú quan sát','Observation notes')}<textarea rows={3} maxLength={4000} value={p.observation} onChange={e=>onProgress({observation:e.target.value})}/></label></details></section>
     <StepActions previousLabel={t('Xem lại mô phỏng','Revisit the experiment')} onPrevious={()=>open(3)} nextLabel={t('Lưu giải thích · sang luyện tập','Save explanation · practise')} onNext={()=>open(5)} disabled={!p.post.trim()}/>
     {!p.post.trim()&&<button className="text-button skip-step" onClick={()=>open(5)}>{t('Tôi muốn luyện trước, giải thích sau','Practise first, explain later')}</button>}
    </>}
    {module===5&&<Quiz key={lesson.id+':'+(focusId??'latest')} history={!!focusId} lessonId={lesson.id} questions={lesson.questions} user={user} english={en} onAttempt={onAttempt} existing={attempts.find(a=>focusId?a.id===focusId:a.lessonId===lesson.id)} onReview={id=>open(2,id)} onFinish={()=>open(6)}/>}
    {module===6&&<>
     <section className="study-paper summary-paper"><span className="summary-symbol"><CheckCircle2 size={35}/></span><h3>{t('Nhìn lại điều bạn đã học','Look back at what you learned')}</h3><p>{t('Bạn có thể quay lại phần còn chưa chắc trước khi học tiếp.','Revisit anything that is still unclear before you continue.')}</p><div className="summary-ideas">{lesson.units.map(u=><button key={u.id} onClick={()=>open(2,u.id)}><span><strong>{t(u.title.vi,u.title.en)}</strong><small>{t(u.definition.vi,u.definition.en)}</small></span><ArrowRight size={18}/></button>)}</div><details className="study-extra"><summary>{t('Kiểm tra lại một nhận định dễ nhầm','Check a common misconception')}</summary><LangText text={lesson.units[0].misconception} mode={mode}/><p>{t('Đây là nhận định dễ gây hiểu nhầm. Hãy đối chiếu với phần đọc hiểu để giải thích lại cho đúng.','This is a common misconception. Compare it with the reading section and explain it correctly.')}</p></details><button className={p.summary?'outline':'primary'} onClick={finishSummary}><Check size={17}/>{p.summary?t('Đã ghi nhận tổng kết','Summary recorded'):t('Tôi đã xem lại bài học','I have reviewed this lesson')}</button></section>
     <StepActions previousLabel={t('Xem lại lượt luyện','Review practice')} onPrevious={()=>open(5)} nextLabel={lesson.n<18?t('Học bài tiếp theo','Continue to next lesson'):t('Về danh sách bài học','Back to lessons')} onNext={()=>{finishSummary();lesson.n<18?onOpen(lesson.n+1,1):onCatalog();}}/>
    </>}
   </section>
   <aside className={`lesson-roadmap ${outlineOpen?'is-open':''}`} aria-label={t('Lộ trình bài học','Lesson roadmap')}>
    <div className="roadmap-title"><h2>{t('Lộ trình bài học','Your lesson path')}</h2><span>{count}/6</span></div><button className="roadmap-mobile" aria-expanded={outlineOpen} onClick={()=>setOutlineOpen(v=>!v)}><span>{t('Bước','Step')} {module}/6 · {t(step.vi,step.en)}</span><ChevronDown size={19}/></button>
    <div className="roadmap-body"><progress value={count} max={6} aria-label={t('Tiến độ các bước trong bài','Lesson step progress')}/><ol>{studySteps.map((s,i)=><li key={s.vi}><button className={module===i+1?'current':done[i]?'done':''} aria-current={module===i+1?'step':undefined} onClick={()=>open(i+1)}><span className="roadmap-number">{done[i]?<Check size={16}/>:i+1}</span><span><strong>{t(s.vi,s.en)}</strong><small>{module===i+1?t('Đang học','Current step'):done[i]?t('Đã xong','Done'):t(s.hint,s.hintEn)}</small></span></button></li>)}</ol><p>{t('Bạn có thể quay lại bất cứ bước nào.','You can return to any step.')}</p></div>
   </aside>
  </div>
 </div>;
}

function StepActions({previousLabel,onPrevious,nextLabel,onNext,disabled=false}:{previousLabel:string;onPrevious:()=>void;nextLabel:string;onNext:()=>void;disabled?:boolean}){return <div className="study-step-actions"><button className="text-button" onClick={onPrevious}><ArrowLeft size={17}/>{previousLabel}</button><button className="primary" onClick={onNext} disabled={disabled}>{nextLabel}<ArrowRight size={18}/></button></div>;}

function ReadingCard({unit,number,mode}:{unit:Unit;number:number;mode:Mode}){
 const [answer,setAnswer]=useState<number|null>(null),[term,setTerm]=useState(false);const en=mode==='en';const t=(vi:string,en:string)=>translate(mode,vi,en);
 return <article className="reading-card" id={unit.id}>
  <header><span className="eyebrow">{t('KIẾN THỨC','IDEA')} {number}</span><h3>{<InlinePair text={unit.title} mode={mode}/>}</h3></header>
  <LangText text={unit.body} mode={mode} className="reading-body"/>
  <div className="reading-example"><span>{t('VÍ DỤ DỄ HÌNH DUNG','A CONCRETE EXAMPLE')}</span><LangText text={unit.example} mode={mode}/></div>
  <button className="term-chip" aria-expanded={term} onClick={()=>setTerm(v=>!v)}><Languages size={16}/>{t(unit.term.vi,unit.term.en)}<ChevronDown size={16}/></button>{term&&<div className="term-definition"><LangText text={unit.definition} mode={mode}/></div>}
  <div className="quick-check"><span className="eyebrow"><Target size={16}/>{t('THỬ KIỂM TRA ĐIỀU VỪA HIỂU','CHECK YOUR UNDERSTANDING')}</span><LangText text={unit.check.prompt} mode={mode}/><div className="quick-options">{unit.check.options.map((o,i)=><button key={i} className={answer===i?(i===unit.check.answer?'correct':'incorrect'):''} aria-pressed={answer===i} onClick={()=>setAnswer(i)}><span>{answer===i?(i===unit.check.answer?<Check size={17}/>:<XMark/>):String.fromCharCode(65+i)}</span>{<InlinePair text={o} mode={mode}/>}</button>)}</div>{answer!==null&&<div className="quick-feedback" role="status"><strong>{answer===unit.check.answer?(t('Bạn đã hiểu đúng.','That is right.')):(t('Cùng xem lại một chút.','Let us look again.'))}</strong><LangText text={unit.check.explanation} mode={mode}/></div>}</div>
 </article>;
}
function XMark(){return <span aria-hidden="true">×</span>;}
