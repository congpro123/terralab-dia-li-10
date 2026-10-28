import type {Attempt,MarkedQuestion} from './types';
export type AnswerKey = {id:string;theory:string;type:string;bloom:string;stem:string;options:string[];answer:string;explanation:string;points:number;rubric:string;unit?:string;tolerance?:string};
export const roundedScore=(earned:number,max:number)=>Math.round(earned/max*100)/10;
export function grade(questions:AnswerKey[],responses:Record<string,string>,lessonId:string,id:string,version='demo-1'):Attempt {
  const marked=questions.map(q=>{
    const response=String(responses[q.id]??'').slice(0,4000).trim();
    let earned:number|null=0;
    if(q.type==='short'&&response) {
      earned=null;
      if(q.id==='Q-13-009'){
        const unit=/(m³\s*\/\s*s|m3\s*\/\s*s|m\^3\s*\/\s*s)/i.test(response);
        const nums=response.replace(/,/g,'.').match(/-?\d+(?:\.\d+)?/g)?.map(Number)??[];
        if(unit&&nums.some(v=>Math.abs(v-5200)<=0.5)) earned=2;
      }
    } else if(q.type!=='short') earned=response===String(q.answer)?q.points:0;
    return {...q,type:q.type as MarkedQuestion['type'],response,earned,selfPoints:null} as MarkedQuestion;
  });
  const autoPoints=marked.reduce((s,q)=>s+(q.earned??0),0);
  const maxPoints=questions.reduce((s,q)=>s+q.points,0);
  const pending=marked.filter(q=>q.earned===null).length;
  return {id,lessonId,version,createdAt:new Date().toISOString(),questions:marked,autoPoints,maxPoints,confirmedScore:pending?null:roundedScore(autoPoints,maxPoints),selfScore:null,pending};
}
export function selfAssess(attempt:Attempt,points:Record<string,number>):Attempt {
  const questions=attempt.questions.map(q=>({...q,selfPoints:q.earned===null&&Number.isInteger(points[q.id])&&points[q.id]>=0&&points[q.id]<=q.points?points[q.id]:q.selfPoints}));
  const complete=questions.every(q=>q.earned!==null||q.selfPoints!==null);
  return {...attempt,questions,selfScore:complete?roundedScore(questions.reduce((s,q)=>s+(q.earned??q.selfPoints??0),0),attempt.maxPoints):null};
}
