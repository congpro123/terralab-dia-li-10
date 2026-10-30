export type Mode = 'vi' | 'en' | 'parallel' | 'ondemand';
export type User = {id:string; username:string; name:string; role:'student'|'teacher'|'editor'|'reviewer'|'admin'};
export type Pair = {vi:string;en:string};
export type Unit = {id:string; title:Pair; body:Pair; example:Pair; misconception:Pair; term:Pair; definition:Pair; check:{prompt:Pair;options:Pair[];answer:number;explanation:Pair}};
export type Question = {id:string;theory:string;type:'mcq'|'tf'|'short';bloom:string;stem:string;options:string[];points:number;stemEn?:string;optionsEn?:string[]};
export type MarkedQuestion = Question & {answer:string;explanation:string;rubric:string;earned:number|null;response:string;selfPoints:number|null;answerEn?:string;explanationEn?:string;rubricEn?:string};
export type Attempt = {id:string;lessonId:string;version:string;createdAt:string;questions:MarkedQuestion[];autoPoints:number;maxPoints:number;confirmedScore:number|null;selfScore:number|null;pending:number};
export type Progress = {lessonId:string;module:number;units:string[];simDone:boolean;pre:string;post:string;observation:string;simState:Record<string,unknown>;summary:boolean;revision:number;updatedAt?:string};
export const initialProgress = (lessonId:string):Progress => ({lessonId,module:1,units:[],simDone:false,pre:'',post:'',observation:'',simState:{},summary:false,revision:0});
