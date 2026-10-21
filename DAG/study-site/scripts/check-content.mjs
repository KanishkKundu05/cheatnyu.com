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
console.log('Complete numbered-question coverage: HW1 1–9, HW2 1–9, HW3 1–7; practice weeks 1–5: 7/5/5/4/5; old exam 1–9.');
