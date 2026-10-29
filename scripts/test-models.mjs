import assert from 'node:assert/strict';
import {daylightHours,dotCount,annualClimate,catchmentIndices,earthSunDirection,solarDeclination} from '../lib/models.ts';
import {grade,selfAssess,roundedScore} from '../lib/grading.ts';
import {readFile} from 'node:fs/promises';
import {destinations,filterDestinations,geographicVector,LUNAR_DAY,tideState} from '../lib/exploration.ts';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
// Geographic anchors follow the same coordinate convention as the satellite texture.
assert.deepEqual(geographicVector(0,0),{x:1,y:0,z:-0});
near(geographicVector(0,90).z,-1);near(geographicVector(90,0).y,1);
for(const p of destinations){assert.ok(Math.abs(p.lat)<=90&&Math.abs(p.lon)<=180);if(p.lesson)assert.ok(p.lesson>=2&&p.lesson<=18);const v=geographicVector(p.lat,p.lon);near(v.x*v.x+v.y*v.y+v.z*v.z,1);}
assert.equal(new Set(destinations.map(p=>p.id)).size,destinations.length);
assert.ok(destinations.length>=50);assert.ok(destinations.some(p=>!p.lesson));
assert.equal(filterDestinations(destinations,'hoi an','all')[0].id,'hoian');assert.equal(filterDestinations(destinations,'Giza','africa')[0].id,'pyramids');assert.equal(filterDestinations(destinations,'Rome','all',true).length,0);assert.ok(filterDestinations(destinations,'','vietnam').every(p=>p.region==='vietnam'));
const atlasPhotos=JSON.parse(await readFile(new URL('../data/photos.json',import.meta.url),'utf8'));
for(const place of destinations){const photo=atlasPhotos[place.photo];assert.ok(photo?.source&&photo.author&&photo.licenseUrl,'Every place has a credited photograph');assert.match(photo.license,/^(CC BY|CC0|Public domain|NASA educational media use)/);for(const suffix of ['','-480','-960'])assert.ok((await readFile(new URL('../public'+photo.src.replace('.webp',suffix+'.webp'),import.meta.url))).length>0);}
assert.equal(destinations.find(p=>p.id==='hoian').lesson,undefined);assert.equal(destinations.find(p=>p.id==='halong').lesson,12);
// The idealised semidiurnal model repeats twice per lunar day, with reinforcing
// lunar/solar components at new/full moon and a smaller range at quarter moons.
for(const phase of [0,90,180,270])for(const hour of [0,3,8,14,22]){near(tideState(hour,phase).level,tideState(hour+LUNAR_DAY,phase).level);near(tideState(hour,phase).level,tideState(hour+LUNAR_DAY/2,phase).level);assert.ok(Math.abs(tideState(hour,phase).level)<=tideState(hour,phase).amplitude+1e-9);}
near(tideState(0,0).range,tideState(0,180).range);near(tideState(0,90).range,tideState(0,270).range);assert.ok(tideState(0,0).range>tideState(0,90).range*2);
for(const lat of [-60,-30,0,30,60])near(daylightHours(80,lat),12);
for(const day of [1,80,172,266,355])for(const lat of [-60,0,60])near(daylightHours(day,lat,0),12);
near(daylightHours(172,40)+daylightHours(172,-40),24);assert.ok(daylightHours(172,40)>12);assert.ok(daylightHours(355,40)<12);
for(const day of [1,80,125,172,220,266,355])for(const tilt of [0,23.5]){const sun=earthSunDirection(day,tilt);near(sun.x**2+sun.z**2,1);near(Math.sin(tilt*Math.PI/180)*sun.x,Math.sin(solarDeclination(day,tilt)*Math.PI/180));}
near(dotCount(6000,100)*100,dotCount(6000,200)*200);assert.equal(dotCount(6000,100),60);assert.equal(dotCount(6000,200),30);
const rain=[20,25,40,80,150,200,250,220,180,100,50,25],temp=[20,21,23,25,27,28,28,27,26,24,22,20];assert.deepEqual(annualClimate(temp,rain),{range:8,totalRain:1340});assert.equal(annualClimate(temp,[null,...rain.slice(1)]),null);
for(const r of [0,20,100])for(const i of [0,50,100]){const m=catchmentIndices(r,i);near(m.runoff+m.infiltration,r);assert.ok(m.runoff>=0&&m.infiltration>=0);}
assert.ok(catchmentIndices(100,100).runoff<catchmentIndices(100,0).runoff);
const content=JSON.parse(await readFile(new URL('../data/curriculum.server.json',import.meta.url),'utf8'));for(const l of content){const correct=Object.fromEntries(l.questions.map(q=>[q.id,q.type==='short'?'':q.answer]));const a=grade(l.questions,correct,l.id,'test-id');assert.equal(a.autoPoints,8);assert.equal(a.maxPoints,12);assert.equal(a.confirmedScore,6.7);}
const lesson=content[0];const open=grade(lesson.questions,{'Q-02-009':'Ý đúng nhưng diễn đạt khác.'},lesson.id,'test-id');assert.equal(open.pending,1);const assessed=selfAssess(open,{'Q-02-009':2});assert.equal(assessed.confirmedScore,null);assert.equal(assessed.pending,1);near(roundedScore(10,12),8.3);
console.log('PASS scientific model invariants, climate completeness, dot conservation, all 17 grading sets and self-assessment separation.');
