'use client';
import {useState} from 'react';
import {Languages} from 'lucide-react';
import type {Mode,Pair} from '@/lib/types';
export default function LangText({text,mode,className=''}:{text:Pair;mode:Mode;className?:string}){
 const [show,setShow]=useState(false);
 if(mode==='en')return <p className={className} lang="en">{text.en}</p>;
 if(mode==='parallel')return <div className={`parallel-text ${className}`}><p lang="vi">{text.vi}</p><p lang="en">{text.en}</p></div>;
 return <div className={className}><p lang="vi">{text.vi}</p>{mode==='ondemand'&&<><button className="translate-link" onClick={()=>setShow(!show)} aria-expanded={show}><Languages size={13}/>{show?'Ẩn bản dịch':'Xem bản dịch'}</button>{show&&<p className="translation" lang="en">{text.en}</p>}</>}</div>;
}
