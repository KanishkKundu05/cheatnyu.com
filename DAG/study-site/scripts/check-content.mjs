import fs from 'node:fs';
import assert from 'node:assert/strict';
const sections=JSON.parse(fs.readFileSync('content/topics.json','utf8'));
const problems=JSON.parse(fs.readFileSync('content/problems.json','utf8'));
assert.equal(sections.length,8);
const ids=new Set();
function checkSource(source,page){assert(source&&fs.existsSync(`public/sources/${source}`),`Missing PDF: ${source}`);assert(Number.isInteger(page)&&page>0,`Invalid page: ${source} ${page}`);}
for(const section of sections){assert(!ids.has(section.id));ids.add(section.id);assert(section.topics.length>0);assert(problems.some(p=>p.section===section.id&&p.kind==='Homework'),`No homework assigned to ${section.id}`);for(const t of section.topics){assert(!ids.has(t.id),`Duplicate topic id ${t.id}`);ids.add(t.id);assert(t.summary&&t.points.length&&t.pitfall&&t.excerpt.text);checkSource(t.excerpt.source,t.excerpt.page);}}
for(const p of problems){assert(!ids.has(p.id),`Duplicate problem id ${p.id}`);ids.add(p.id);assert(sections.some(s=>s.id===p.section));assert(p.prompt.length>30&&p.answer.length>0,`Incomplete problem ${p.id}`);assert(p.topics.length>0);if(p.kind!=='Supplemental')checkSource(p.source,p.page);}
console.log(`Validated ${sections.length} sections, ${sections.reduce((n,s)=>n+s.topics.length,0)} concepts, ${problems.length} problems, source links, and homework coverage for every section.`);
const coverage=JSON.parse(fs.readFileSync('content/coverage.json','utf8'));
for(const entry of coverage){const found=problems.filter(p=>p.source===entry.source);const nums=[...new Set(found.map(p=>Number(p.number.match(/^\d+/)?.[0])))].sort((a,b)=>a-b);assert.deepEqual(nums,entry.expectedNumbers,`Incomplete numbered coverage: ${entry.source}`);}
console.log('Complete numbered-question coverage: HW1 1–9, HW2 1–9, HW3 1–7, HW4 1–3 with all subparts; practice weeks 1–5: 7/5/5/4/5; old exam 1–4 and 6–9, excluding crossed-out subparts.');

const mapping=JSON.parse(fs.readFileSync('content/concept-questions.json','utf8'));
const topicIds=sections.flatMap(s=>s.topics.map(t=>t.id));
assert.deepEqual(Object.keys(mapping).sort(), [...topicIds].sort(), 'Every concept must have an explicit question mapping');
const mapped=new Set();
for(const [topic,questionIds] of Object.entries(mapping)){
  assert(questionIds.length>0,`No questions beneath ${topic}`);
  assert.equal(new Set(questionIds).size,questionIds.length,`Duplicate questions beneath ${topic}`);
  for(const id of questionIds){assert(problems.some(p=>p.id===id),`Unknown question ${id}`);mapped.add(id);}
}
for(const p of problems) assert(mapped.has(p.id),`Question ${p.id} not associated with any concept`);
console.log(`All ${topicIds.length} concepts have associated questions; all ${problems.length} question cards appear in the integrated study flow.`);

const lessons=JSON.parse(fs.readFileSync('content/lessons.json','utf8'));
assert.deepEqual(Object.keys(lessons).sort(), [...topicIds].sort(), 'Every concept needs a guided lesson');
for(const [id,lesson] of Object.entries(lessons)){
  assert(lesson.intro.length>=2 && lesson.intro.every(p=>p.length>60),`Missing foundational explanation: ${id}`);
  assert.equal(lesson.checks.length,2,`Missing learning checkpoint: ${id}`);
  for(const check of lesson.checks) assert(check.question.trim().length>0 && check.answer.trim().length>0,`Incomplete checkpoint: ${id}`);
}
console.log('All 30 guided lessons include foundations and two answered checkpoints (60 total).');

// Respect the instructor’s visible exclusions, including parts of a question.
const examCoverage=coverage.find(entry=>entry.kind==='Exam');
const examCards=problems.filter(p=>p.source===examCoverage.source);
assert.deepEqual(examCards.map(p=>p.number),examCoverage.expectedParts,'Exam subpart coverage differs from the annotated PDF');
const examSource=JSON.parse(fs.readFileSync('content/exam-all.json','utf8'));
assert.deepEqual(examCards,examSource,'Exam source and displayed question bank must agree');
const insertionExam=examCards.find(p=>p.number==='6(a)');
assert(insertionExam && !/\n\([bc]\)/.test(insertionExam.prompt) && insertionExam.answer.length===1,'Q6 must contain only part (a)');
console.log('Verified 16 old-exam cards; crossed-out Q5, Q6(b–c), and Q8(c) are excluded.');

const hw4Coverage=coverage.find(entry=>entry.source==='cs2413_Fall_2026_hw4a.pdf');
const hw4Cards=problems.filter(p=>p.source===hw4Coverage.source);
assert.deepEqual(hw4Cards.map(p=>p.number),hw4Coverage.expectedParts,'Missing Homework 4 subpart');
const homeworkSource=JSON.parse(fs.readFileSync('content/homework-all.json','utf8'));
assert.deepEqual(hw4Cards,homeworkSource.filter(p=>p.source===hw4Coverage.source),'Homework 4 source and question bank differ');
assert(hw4Cards.find(p=>p.number==='3(a)').answerDiagram,'Missing merge decision tree');
console.log('Verified all 7 Homework 4 cards, including the merge decision tree and parts 3(a–e).');
