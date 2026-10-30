import type {Attempt,Progress} from './types';

export const studySteps=[
 {vi:'Bắt đầu',en:'Get ready',hint:'Biết mình sẽ học gì',hintEn:'Know what you will learn'},
 {vi:'Đọc hiểu',en:'Read & understand',hint:'Mỗi lần một phần kiến thức',hintEn:'One idea at a time'},
 {vi:'Khám phá',en:'Experiment',hint:'Thay đổi và quan sát',hintEn:'Change and observe'},
 {vi:'Giải thích',en:'Explain',hint:'Viết lại điều đã hiểu',hintEn:'Put it into your own words'},
 {vi:'Luyện tập',en:'Practise',hint:'Từng câu hỏi, không tính giờ',hintEn:'One question, no timer'},
 {vi:'Tổng kết',en:'Wrap up',hint:'Nhìn lại và học tiếp',hintEn:'Reflect and continue'}
] as const;

type LessonShape={id:string;topics:{id:string}[]};
export function lessonStepStatus(lesson:LessonShape,progress:Progress|undefined,attempts:Attempt[]):boolean[]{
 const units=progress?.units??[];
 return [!!progress&&(progress.module>1||units.length>0),lesson.topics.every(t=>units.includes(t.id)),!!progress?.simDone,!!progress?.post?.trim(),attempts.some(a=>a.lessonId===lesson.id),!!progress?.summary];
}
export function lessonIsComplete(lesson:LessonShape,progress:Progress|undefined,attempts:Attempt[]){return lessonStepStatus(lesson,progress,attempts).slice(1).every(Boolean);}
export function readingIndex(units:{id:string}[],read:string[],requested?:string){
 const requestedIndex=units.findIndex(u=>u.id===requested);
 if(requestedIndex>=0)return requestedIndex;
 const next=units.findIndex(u=>!read.includes(u.id));
 return next<0?0:next;
}
export function resumeModule(progress:Progress|undefined){return Math.max(1,Math.min(6,Number.isInteger(progress?.module)?progress!.module:1));}

// Topic records live inside the existing per-lesson simulation payload.
export function exploredTopics(units:{id:string}[],progress:Progress):string[]{
 const ids=units.map(u=>u.id),stored=progress.simState.exploredTopics;
 return Array.isArray(stored)?stored.filter((id):id is string=>typeof id==='string'&&ids.includes(id)):progress.simDone?ids:[];
}
export function explorationIndex(units:{id:string}[],progress:Progress,requested?:string){
 const active=units.findIndex(u=>u.id===(requested??progress.simState.activeTopicId));if(active>=0)return active;
 const explored=exploredTopics(units,progress),pending=units.findIndex(u=>progress.units.includes(u.id)&&!explored.includes(u.id));
 return pending>=0?pending:readingIndex(units,progress.units);
}
export function finishTopicExploration(units:{id:string}[],progress:Progress,index:number){
 const explored=[...new Set([...exploredTopics(units,progress),units[index].id])];
 const next=index+1<units.length?index+1:units.findIndex(u=>!explored.includes(u.id));
 return {explored,simDone:units.every(u=>explored.includes(u.id)),next};
}
export function topicScene(lesson:number,index:number){return lesson===7&&index===0?6:lesson;}
