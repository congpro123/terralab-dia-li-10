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

const {exploredTopics,explorationIndex,finishTopicExploration,topicScene}=await import('../lib/learning.ts');
for(const lesson of catalog){
 let p=initialProgress(lesson.id);
 for(let i=0;i<lesson.topics.length;i++){
  const u=lesson.topics[i];p={...p,units:[...p.units,u.id]};
  assert.equal(explorationIndex(lesson.topics,p,u.id),i,'Reading opens the same topic');
  const r=finishTopicExploration(lesson.topics,p,i);
  assert.equal(r.simDone,i===lesson.topics.length-1,'One topic must not complete the whole experiment');
  assert.equal(r.next,i===lesson.topics.length-1?-1:i+1,'Explore then read the next topic');
  p={...p,simDone:r.simDone,simState:{topicStates:{[u.id]:{a:77}},exploredTopics:r.explored,activeTopicId:u.id}};
  assert.equal(explorationIndex(lesson.topics,p),i,'Resume exact exploration');
  assert.equal(finishTopicExploration(lesson.topics,p,i).explored.length,i+1,'Revisiting does not duplicate completion');
 }
 assert.equal(exploredTopics(lesson.topics,p).length,lesson.topics.length);
 assert.equal(exploredTopics(lesson.topics,{...initialProgress(lesson.id),simDone:true}).length,lesson.topics.length,'Preserve legacy completed explorations');
 assert.deepEqual(exploredTopics(lesson.topics,{...p,simState:{exploredTopics:['unknown',5,lesson.topics[0].id]}}),[lesson.topics[0].id]);
}
assert.equal(topicScene(7,0),6);assert.equal(topicScene(7,1),7);assert.equal(topicScene(12,2),12);
const {translate,validMode}=await import('../lib/language.ts');
assert.equal(translate('parallel','Nội lực','Endogenic forces'),'Nội lực · Endogenic forces');
assert.equal(translate('en','Nội lực','Endogenic forces'),'Endogenic forces');
assert.equal(translate('vi','Nội lực','Endogenic forces'),'Nội lực');
assert.equal(translate('parallel','GPS','GPS'),'GPS');assert.equal(validMode('parallel'),'parallel');assert.equal(validMode('invalid'),'vi');
console.log('PASS 17 interleaved read/explore paths, exact topic resume, no premature completion, legacy progress, and bilingual selection.');
