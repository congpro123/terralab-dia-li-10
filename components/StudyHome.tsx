'use client';
import {ArrowRight,BookOpen,Check} from 'lucide-react';
import catalog from '@/data/catalog.json';
import type {Progress} from '@/lib/types';
import {resumeModule,studySteps} from '@/lib/learning';
import PlanetAtlas from './PlanetAtlas';
import {PhotoArt} from './Photos';

export default function StudyHome({english=false,recent,onOpen,onCatalog}:{english?:boolean;recent?:Progress;onOpen:(n:number,m?:number)=>void;onCatalog:()=>void}){
 const t=(vi:string,en:string)=>english?en:vi;
 const current=catalog.find(l=>l.id===recent?.lessonId),start=current??catalog[0];
 return <>
  <section className="study-home">
   <div className="home-copy">
    <span className="eyebrow">{t('ĐỊA LÍ 10 · KẾT NỐI TRI THỨC','GEOGRAPHY 10 · KẾT NỐI TRI THỨC')}</span>
    <h1>{t('Hiểu Trái Đất.','Understand Earth.')}<br/><span>{t('Học từng bước.','One step at a time.')}</span></h1>
    <p>{t('Đọc từng ý. Thử mô phỏng. Tự kiểm tra kiến thức. Một lộ trình rõ ràng để hiểu thế giới quanh bạn.','Read one idea. Try an experiment. Check your understanding. A clear path to the world around you.')}</p>
    {current&&<div className="resume-card"><BookOpen size={20}/><div><small>{t('BẠN ĐANG HỌC','CONTINUE WHERE YOU LEFT OFF')}</small><strong>{t('Bài','Lesson')} {current.n}. {english?current.titleEn:current.title}</strong><span>{t('Bước','Step')} {resumeModule(recent)}/6 · {english?studySteps[resumeModule(recent)-1].en:studySteps[resumeModule(recent)-1].vi}</span></div></div>}
    <div className="home-actions"><button className="primary large" onClick={()=>onOpen(start.n,current?resumeModule(recent):1)}>{current?t('Tiếp tục bài đang học','Continue learning'):t('Bắt đầu học từ Bài 2','Start with Lesson 2')}<ArrowRight size={20}/></button><button className="text-button" onClick={onCatalog}>{t('Chọn bài khác','Choose a lesson')}</button></div>
    <div className="home-reassurance"><span><Check size={16}/>{t('Học thử không cần đăng nhập','Explore without signing in')}</span></div>
   </div>
   <PlanetAtlas english={english} onOpen={onOpen}/>
  </section>
  <section className="home-lessons"><div className="section-heading"><div><span className="eyebrow">{t('BẮT ĐẦU TỪ NỀN TẢNG','BUILD YOUR FOUNDATIONS')}</span><h2>{t('Những bài học đầu tiên','Your first lessons')}</h2></div><button className="text-button" onClick={onCatalog}>{t('Xem đủ 17 bài','View all 17 lessons')}<ArrowRight size={17}/></button></div><div className="course-grid">{catalog.slice(0,3).map(l=><button className="course-card" key={l.id} onClick={()=>onOpen(l.n,1)}><PhotoArt n={l.n}/><div><span className="eyebrow">{t('BÀI','LESSON')} {l.n}</span><h3>{english?l.titleEn:l.title}</h3><span className="course-card-foot">{l.topics.length} {t('phần kiến thức','short sections')}<ArrowRight size={18}/></span></div></button>)}</div></section>
 </>;
}
