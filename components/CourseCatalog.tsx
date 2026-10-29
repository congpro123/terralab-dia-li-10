'use client';
import {useState} from 'react';
import {ArrowRight,Search,CheckCircle2,Timer,X} from 'lucide-react';
import catalog from '@/data/catalog.json';
import {chapterNames,chapterEn} from './Illustrations';
import {PhotoArt} from './Photos';
import ExplorationIntro from './ExplorationIntro';
import type {Attempt,Progress} from '@/lib/types';
import {lessonIsComplete} from '@/lib/learning';
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
export default function CourseCatalog({english=false,lab=false,progress,attempts,onOpen}:{english?:boolean;lab?:boolean;progress:Record<string,Progress>;attempts:Attempt[];onOpen:(n:number,m?:number)=>void}){
 const [query,setQuery]=useState(''),[chapter,setChapter]=useState(0);const t=(vi:string,en:string)=>english?en:vi;
 const filtered=catalog.filter(l=>(!chapter||l.chapter===chapter)&&normalize(`Bai ${l.n} ${l.title} ${l.titleEn}`).includes(normalize(query)));
 return <>
  {lab?<ExplorationIntro english={english} onOpen={onOpen}/>: <div className="page-heading"><span className="eyebrow">{lab?t('THỬ NGHIỆM & QUAN SÁT','EXPERIMENT & OBSERVE'):t('BÀI HỌC CỦA BẠN','YOUR LESSONS')}</span><h1>{lab?t('Bạn muốn khám phá điều gì?','What would you like to explore?'):t('Chọn một bài. Học theo từng bước.','Choose a lesson. Follow the steps.')}</h1><p>{lab?t('Chọn một mô phỏng, làm theo hướng dẫn và xem điều gì thay đổi.','Choose an experiment, follow the guidance and observe what changes.'):t('Có thể học từ Bài 2 hoặc chọn chủ đề bạn đang cần ôn. Mỗi bài đều có hướng dẫn từ đầu đến cuối.','Begin with Lesson 2 or choose a topic you need. Every lesson includes a guided path.')}</p></div>}
  <div className="catalog-tools"><label className="search-field"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label={t('Tìm bài học','Search lessons')} placeholder={t('Tìm theo số bài hoặc tên chủ đề…','Search by lesson number or topic…')}/>{query&&<button aria-label={t('Xóa tìm kiếm','Clear search')} onClick={()=>setQuery('')}><X size={18}/></button>}</label><select aria-label={t('Lọc theo chương','Filter by chapter')} value={chapter} onChange={e=>setChapter(+e.target.value)}><option value={0}>{t('Tất cả các chương','All chapters')}</option>{chapterNames.slice(1).map((c,i)=><option key={i} value={i+1}>{english?chapterEn[i+1]:c}</option>)}</select></div>
  <p className="catalog-count" role="status">{filtered.length} {t(lab?'mô phỏng':'bài học',lab?'experiments':'lessons')}</p>
  {filtered.length?<div className="course-grid">{filtered.map(l=>{const done=lessonIsComplete(l,progress[l.id],attempts);return <button className="course-card" key={l.id} onClick={()=>onOpen(l.n,lab?3:undefined)}><div className="course-image"><PhotoArt n={l.n}/>{done&&<span className="course-done"><CheckCircle2 size={15}/>{t('Đã hoàn thành','Completed')}</span>}</div><div><div className="course-meta"><span className="eyebrow">{t('BÀI','LESSON')} {String(l.n).padStart(2,'0')}</span><span><Timer size={14}/>{l.minutes} {t('phút','min')}</span></div><h2>{english?l.titleEn:l.title}</h2><p>{english?chapterEn[l.chapter]:chapterNames[l.chapter]}</p><span className="course-card-foot">{lab?t('Mở mô phỏng','Open experiment'):progress[l.id]?t('Tiếp tục học','Continue learning'):t('Bắt đầu bài học','Begin lesson')}<ArrowRight size={19}/></span></div></button>;})}</div>:<div className="empty-state"><Search size={30}/><h2>{t('Chưa tìm thấy bài phù hợp','No matching lessons')}</h2><p>{t('Thử tên ngắn hơn hoặc chọn lại tất cả các chương.','Try a shorter term or clear the chapter filter.')}</p><button className="outline" onClick={()=>{setQuery('');setChapter(0);}}>{t('Xóa bộ lọc','Clear filters')}</button></div>}
 </>;
}
