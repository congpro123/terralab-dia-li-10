import assert from 'node:assert/strict';
import {daylightHours,dotCount,annualClimate,catchmentIndices} from '../lib/models.ts';
import {grade,selfAssess,roundedScore} from '../lib/grading.ts';
import {readFile} from 'node:fs/promises';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const lat of [-60,-30,0,30,60])near(daylightHours(80,lat),12);
for(const day of [1,80,172,266,355])for(const lat of [-60,0,60])near(daylightHours(day,lat,0),12);
near(daylightHours(172,40)+daylightHours(172,-40),24);assert.ok(daylightHours(172,40)>12);assert.ok(daylightHours(355,40)<12);
near(dotCount(6000,100)*100,dotCount(6000,200)*200);assert.equal(dotCount(6000,100),60);assert.equal(dotCount(6000,200),30);
const rain=[20,25,40,80,150,200,250,220,180,100,50,25],temp=[20,21,23,25,27,28,28,27,26,24,22,20];assert.deepEqual(annualClimate(temp,rain),{range:8,totalRain:1340});assert.equal(annualClimate(temp,[null,...rain.slice(1)]),null);
for(const r of [0,20,100])for(const i of [0,50,100]){const m=catchmentIndices(r,i);near(m.runoff+m.infiltration,r);assert.ok(m.runoff>=0&&m.infiltration>=0);}
assert.ok(catchmentIndices(100,100).runoff<catchmentIndices(100,0).runoff);
const content=JSON.parse(await readFile(new URL('../data/curriculum.server.json',import.meta.url),'utf8'));for(const l of content){const correct=Object.fromEntries(l.questions.map(q=>[q.id,q.type==='short'?'':q.answer]));const a=grade(l.questions,correct,l.id,'test-id');assert.equal(a.autoPoints,8);assert.equal(a.maxPoints,12);assert.equal(a.confirmedScore,6.7);}
const lesson=content[0];const open=grade(lesson.questions,{'Q-02-009':'Ý đúng nhưng diễn đạt khác.'},lesson.id,'test-id');assert.equal(open.pending,1);const assessed=selfAssess(open,{'Q-02-009':2});assert.equal(assessed.confirmedScore,null);assert.equal(assessed.pending,1);near(roundedScore(10,12),8.3);
console.log('PASS scientific model invariants, climate completeness, dot conservation, all 17 grading sets and self-assessment separation.');
