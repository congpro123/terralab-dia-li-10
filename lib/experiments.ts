import {catchmentIndices,daylightHours} from './models';
import {tideState} from './exploration';
export type ExperimentState={a:number;b:number;c:number;hour:number;choice:string;month:number;layers:string[];dimension:string};
type Scenario={label:string;en:string;state:Partial<ExperimentState>};
export const scenarios:Record<number,Scenario[]>={
 2:[{label:'Kí hiệu',en:'Symbols',state:{choice:'0'}},{label:'Dòng chuyển động',en:'Flow lines',state:{choice:'1'}},{label:'Chấm điểm',en:'Dots',state:{choice:'2'}}],
 3:[{label:'Đường ngắn',en:'Shortest route',state:{choice:'short'}},{label:'Đi nhanh',en:'Fastest route',state:{choice:'fast'}}],
 4:[{label:'Đá magma',en:'Igneous',state:{choice:'0'}},{label:'Đá trầm tích',en:'Sedimentary',state:{choice:'1'}},{label:'Đá biến chất',en:'Metamorphic',state:{choice:'2'}}],
 5:[{label:'Mùa hạ · 40°B',en:'Summer · 40°N',state:{a:172,b:50+40/1.2,c:50,hour:12}},{label:'Mùa đông · 40°B',en:'Winter · 40°N',state:{a:355,b:50+40/1.2,c:50,hour:12}},{label:'Không nghiêng trục',en:'No axial tilt',state:{c:0}}],
 6:[{label:'Tách mảng',en:'Divergence',state:{choice:'divergent'}},{label:'Hút chìm',en:'Subduction',state:{choice:'convergent',b:0}},{label:'Va chạm lục địa',en:'Continental collision',state:{choice:'convergent',b:100}}],
 7:[{label:'Sườn trống · mưa lớn',en:'Bare slope · heavy rain',state:{a:85,b:15,c:65}},{label:'Cùng mưa · thêm rừng',en:'Same rain · more forest',state:{a:85,b:90,c:65}}],
 8:[{label:'Động đất & ranh giới',en:'Quakes & boundaries',state:{layers:['first','third']}},{label:'Cả ba lớp',en:'All three layers',state:{layers:['first','second','third']}}],
 9:[{label:'A cao · B thấp',en:'High A · low B',state:{a:90,b:10}},{label:'Đảo chênh lệch',en:'Reverse gradient',state:{a:10,b:90}},{label:'Cân bằng',en:'Equal pressure',state:{a:50,b:50}}],
 10:[{label:'Trạm A',en:'Station A',state:{choice:'A',month:6}},{label:'Trạm B',en:'Station B',state:{choice:'B',month:6}}],
 11:[{label:'Mưa lớn · thấm ít',en:'Heavy rain · low infiltration',state:{a:85,b:15}},{label:'Cùng mưa · thấm nhiều',en:'Same rain · high infiltration',state:{a:85,b:90}}],
 12:[{label:'Gió nhẹ',en:'Light wind',state:{choice:'wave',a:10}},{label:'Gió mạnh',en:'Strong wind',state:{choice:'wave',a:90}},{label:'Triều cường',en:'Spring tide',state:{choice:'tide',b:1,hour:0}},{label:'Triều kém',en:'Neap tide',state:{choice:'tide',b:26,hour:0}}],
 13:[{label:'Tháng ít nước',en:'Low-flow month',state:{month:2}},{label:'Tháng nhiều nước',en:'High-flow month',state:{month:7}}],
 14:[{label:'Hữu cơ bề mặt',en:'Surface organics',state:{choice:'0'}},{label:'Tầng tích tụ',en:'Subsoil',state:{choice:'2'}},{label:'Đá gốc',en:'Bedrock',state:{choice:'4'}}],
 15:[{label:'Ấm và ẩm',en:'Warm and moist',state:{a:50,b:90}},{label:'Cùng nhiệt · khô hơn',en:'Same heat · drier',state:{a:50,b:15}},{label:'Ẩm nhưng lạnh',en:'Moist but cold',state:{a:10,b:90}}],
 16:[{label:'Đất & thực vật',en:'Soils & plants',state:{layers:['first','second']}},{label:'Thêm khí hậu',en:'Add climate',state:{layers:['first','second','third']}}],
 17:[{label:'Rừng được giữ lại',en:'Forest retained',state:{a:85,b:90,c:50}},{label:'Lớp phủ suy giảm',en:'Reduced cover',state:{a:85,b:15,c:50}}],
 18:[{label:'Lên vùng cao',en:'Gain elevation',state:{choice:'altitude',a:75}},{label:'Từ biển vào đất liền',en:'From coast inland',state:{choice:'continental',a:75}},{label:'Đổi vĩ độ',en:'Change latitude',state:{choice:'latitude',a:75}}]
};
export const experimentTitles:Record<number,[string,string]>={2:['Đọc thế giới trên bản đồ','Read the world on a map'],3:['Chọn đường đi của bạn','Choose your route'],4:['Mở một lát cắt Trái Đất','Open a slice of Earth'],5:['Đi theo ánh sáng Mặt Trời','Follow the sunlight'],6:['Bên dưới những ngọn núi','Beneath the mountains'],7:['Nước tạo hình mặt đất','Water shapes the land'],8:['Đọc các lớp dấu hiệu','Read the layers of evidence'],9:['Theo dấu chuyển động của không khí','Trace moving air'],10:['Một năm qua những con số','A year through the data'],11:['Mỗi giọt nước đi đâu?','Where does each drop go?'],12:['Đứng trước một đại dương chuyển động','At the edge of a moving ocean'],13:['Dòng sông qua các mùa','A river through the seasons'],14:['Câu chuyện dưới chân mình','The story beneath your feet'],15:['Điều gì nuôi một khu rừng?','What sustains a forest?'],16:['Tìm liên hệ trong cùng một vùng','Find connections within a region'],17:['Khi một thành phần thay đổi','When one component changes'],18:['Tự nhiên thay đổi theo hành trình','Nature changes along the journey']};
export function experimentReading(n:number,s:ExperimentState,english=false){
 const t=(vi:string,en:string)=>english?en:vi;
 if([7,11,17].includes(n)){const budget=catchmentIndices(s.a,s.b);return `${t('Mưa','Rain')} ${s.a} · ${n===11?t('thấm','infiltration'):t('che phủ','cover')} ${s.b} · ${t('chảy tràn','runoff')} ${budget.runoff.toFixed(1)}`;}
 if(n===15)return `${t('Nhiệt','Heat')} ${s.a} · ${t('ẩm','moisture')} ${s.b} · ${t('sinh trưởng','growth')} ${Math.round(s.b*(s.a>=25&&s.a<=80?1:.4))}/100`;
 if(n===5)return `${t('Ngày','Day')} ${s.a} · ${Math.round((s.b-50)*1.2)}° · ${daylightHours(s.a,(s.b-50)*1.2,s.c<25?0:23.5).toFixed(1)} ${t('giờ sáng','daylight hours')}`;
 if(n===12&&s.choice==='tide'){const phase=s.b<25?0:s.b<50?90:s.b<75?180:270;return `${phase}° · ${s.hour.toFixed(1)} h · ${t('biên độ toàn phần','range')} ${tideState(s.hour,phase).range.toFixed(2)}`;}
 if(n===12)return s.choice==='current'?t('Dòng nóng & dòng lạnh','Warm & cold currents'):`${t('Gió','Wind')} ${s.a}/100`;
 if(n===9)return `A ${1000+s.a/5} hPa · B ${1000+s.b/5} hPa · Δ ${Math.abs(s.a-s.b)/5} hPa`;
 if(n===10||n===13)return `${t('Tháng','Month')} ${s.month+1}${n===10?' · '+(s.choice==='B'?'B':'A'):''}`;
 if(n===14)return `${t('Tầng','Horizon')} ${['O','A','B','C','R'][Number(s.choice)||0]}`;
 if(n===6)return (s.choice==='divergent'?t('Phân kì','Divergent'):s.choice==='transform'?t('Trượt bằng','Transform'):s.b>50?t('Va chạm lục địa','Continental collision'):t('Hút chìm','Subduction'));
 return (scenarios[n]?.find(p=>Object.entries(p.state).every(([key,value])=>JSON.stringify(s[key as keyof ExperimentState])===JSON.stringify(value)))?.[english?'en':'label'])??t('Thiết lập tùy chỉnh','Custom settings');
}
