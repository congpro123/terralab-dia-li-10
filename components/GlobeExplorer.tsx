'use client';
import {useState} from 'react';
import {ArrowRight,ExternalLink,MapPin,Minus,Plus,X} from 'lucide-react';
import {destinations,type Destination} from '@/lib/exploration';
import Globe from './Globe';
import {photos} from './Photos';

export default function GlobeExplorer({english=false,onOpen}:{english?:boolean;onOpen:(n:number,m?:number)=>void}){
 const [selected,setSelected]=useState<Destination|null>(null),[focus,setFocus]=useState<{place:Destination;sequence:number}|null>(null),[zoom,setZoom]=useState({direction:0,sequence:0});
 const t=(vi:string,en:string)=>english?en:vi;
 function visit(place:Destination){setSelected(place);setFocus(v=>({place,sequence:(v?.sequence??0)+1}));}
 const photo=selected?photos[selected.photo]:null;
 return <div className="planet-explorer">
  <div className="explorer-stage">
   <Globe places={destinations} focusPlace={focus} zoomCommand={zoom} onSelectPlace={visit} english={english}/>
   <span className="explorer-label"><MapPin size={13}/>{t('MỘT HÀNH TINH · NHIỀU ĐIỀU KỲ DIỆU','ONE PLANET · MANY WONDERS')}</span>
   <div className="explorer-zoom"><button aria-label={t('Phóng to địa cầu','Zoom in on globe')} onClick={()=>setZoom(v=>({direction:1,sequence:v.sequence+1}))}><Plus size={18}/></button><button aria-label={t('Thu nhỏ địa cầu','Zoom out from globe')} onClick={()=>setZoom(v=>({direction:-1,sequence:v.sequence+1}))}><Minus size={18}/></button></div>
   <span className="explorer-instruction">{t('Kéo để xoay · Phóng gần để mở ảnh','Drag to rotate · Zoom in to reveal photographs')}</span>
  </div>
  <div className="planet-destinations" aria-label={t('Bay đến một cảnh quan','Fly to a landscape')}>{destinations.map(p=><button key={p.id} className={selected?.id===p.id?'selected':''} aria-label={t('Khám phá ','Explore ')+(english?p.nameEn:p.name)} onClick={()=>visit(p)}><img src={photos[p.photo].src.replace('.webp','-480.webp')} alt="" width="44" height="44"/><span>{english?p.nameEn:p.name}</span></button>)}</div>
  {selected&&photo&&<section className="destination-card" aria-label={t('Điểm khám phá: ','Destination: ')+(english?selected.nameEn:selected.name)}>
   <div className="destination-photo"><img src={photo.src.replace('.webp','-960.webp')} alt={english?photo.caption.en:photo.caption.vi} width="960" height="540"/><button className="destination-close" aria-label={t('Đóng thông tin địa điểm','Close destination information')} onClick={()=>setSelected(null)}><X size={18}/></button><span>{english?selected.countryEn:selected.country}</span></div>
   <div className="destination-copy"><h2>{english?selected.nameEn:selected.name}</h2><p>{english?selected.descriptionEn:selected.description}</p><div className="destination-question">{english?selected.questionEn:selected.question}</div><button className="primary" onClick={()=>onOpen(selected.lesson,3)}>{t('Khám phá trong Bài','Explore in Lesson')} {selected.lesson}<ArrowRight size={17}/></button><div className="destination-sources"><a href={selected.source} target="_blank" rel="noreferrer">{t('Tìm hiểu thêm','Read more')} · {selected.sourceName}<ExternalLink size={11}/></a><span>{t('Ảnh','Photo')}: <a href={photo.source} target="_blank" rel="noreferrer">{photo.author}</a> · <a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a></span></div></div>
  </section>}
 </div>;
}
