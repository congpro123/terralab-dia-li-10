import type {Mode} from './types';
export function validMode(value:unknown):Mode{return ['vi','en','parallel','ondemand'].includes(String(value))?value as Mode:'vi';}
export function translate(mode:Mode,vi:string,en:string){return mode==='en'?en:mode==='parallel'&&vi!==en?vi+' · '+en:vi;}
