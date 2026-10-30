'use client';
import {createContext,useContext} from 'react';
import type {Mode,Pair} from '@/lib/types';
import {translate} from '@/lib/language';
export const LanguageContext=createContext<Mode>('vi');
export function useT(english=false){const mode=useContext(LanguageContext);return (vi:string,en:string)=>translate(mode==='vi'&&english?'en':mode,vi,en);}
export function InlinePair({text,mode}:{text:Pair;mode:Mode}){return mode==='parallel'?<span className="inline-pair"><span lang="vi">{text.vi}</span><span lang="en">{text.en}</span></span>:<span className="inline-pair single-language" lang={mode==='en'?'en':'vi'}>{mode==='en'?text.en:text.vi}</span>;}

export function Bilingual({vi,en}:{vi:string;en:string}){return <InlinePair text={{vi,en}} mode={useContext(LanguageContext)}/>;}
