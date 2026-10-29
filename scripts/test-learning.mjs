import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {lessonStepStatus,lessonIsComplete,readingIndex,resumeModule,studySteps} from '../lib/learning.ts';
import {initialProgress} from '../lib/types.ts';
const catalog=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
assert.equal(studySteps.length,6);
for(const lesson of catalog){
 const p=initialProgress(lesson.id);
 assert.deepEqual(lessonStepStatus(lesson,p,[]),[false,false,false,false,false,false]);
 assert.equal(readingIndex(lesson.topics,[]),0);
 assert.equal(readingIndex(lesson.topics,[lesson.topics[0].id]),1);
 assert.equal(readingIndex(lesson.topics,[],lesson.topics.at(-1).id),lesson.topics.length-1);
 assert.equal(readingIndex(lesson.topics,[],'unknown-unit'),0);
 assert.equal(readingIndex(lesson.topics,lesson.topics.map(t=>t.id)),0);
 const ready={...p,module:6,units:lesson.topics.map(t=>t.id),simDone:true,post:'Tôi đã quan sát và giải thích.',summary:true};
 const attempt={id:'test-attempt',lessonId:lesson.id,pending:2,confirmedScore:null};
 assert.equal(lessonIsComplete(lesson,ready,[attempt]),true,'Workflow completion is separate from mastery');
 assert.equal(lessonIsComplete(lesson,{...ready,post:'   '},[attempt]),false);
 assert.equal(lessonIsComplete(lesson,ready,[]),false);
 assert.equal(lessonIsComplete(lesson,{...ready,simDone:false},[attempt]),false);
 assert.equal(lessonStepStatus(lesson,ready,[attempt]).filter(Boolean).length,6);
}
assert.equal(resumeModule(undefined),1);assert.equal(resumeModule({module:2}),2);assert.equal(resumeModule({module:99}),6);assert.equal(resumeModule({module:NaN}),1);
console.log('PASS all 17 guided lesson paths: first-time start, exact unit navigation, resume, and completion separate from mastery.');
