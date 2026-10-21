"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, ArrowLeft, ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronRight, Circle, Clock3, ExternalLink, FileText, GitBranch, GraduationCap, Layers3, LayoutGrid, ListOrdered, Menu, Search, Shuffle, Sigma, Sparkles, Target, X } from "lucide-react";
import sectionData from "../content/topics.json";
import problemData from "../content/problems.json";

type Topic = { id:string; title:string; summary:string; points:string[]; formula?:string; pseudocode?:string; example?:string; excerpt:{text:string;source:string;page:number}; pitfall:string };
type Section = {id:string;title:string;description:string;eyebrow:string;topics:Topic[]};
type Problem = {id:string;section:string;topics:string[];title:string;kind:string;source:string;page:number;number:string;prompt:string;answer:string[];note?:string};
const sections = sectionData as Section[];
const problems = problemData as Problem[];
const icons = [ArrowDownUp, GitBranch, Sigma, Shuffle, Braces, Sparkles, Layers3, ListOrdered];
const colors = ["purple","blue","orange","pink","green","yellow","blue","purple"];
const shortTitles = ["Sorting algorithms", "Decision tree lower bounds", "Math foundations", "Probability", "Recurrence relations", "Other algorithms", "Heaps", "Priority queues"];
const totalTopics = sections.reduce((n,s)=>n+s.topics.length,0);
const sourceUrl=(name:string,page=1)=>`/sources/${encodeURIComponent(name)}#page=${page}`;
const sourceLabel=(name:string)=>name.replace(/\.pdf$/i,"").replace(/_/g," ").replace(/\s*\(\d+\)/g,"");

function SourceLink({name,page}:{name:string;page:number}) { return <a className="source-link" href={sourceUrl(name,page)} target="_blank" rel="noreferrer"><FileText size={13}/><span>{sourceLabel(name)} · p. {page}</span><ExternalLink size={12}/></a>; }
function SortingDemo() {
  const frames = [[7,3,9,2,6,4],[3,7,9,2,6,4],[3,7,2,9,6,4],[3,7,2,6,9,4],[3,7,2,6,4,9],[3,2,6,4,7,9],[2,3,4,6,7,9]];
  const [step,setStep]=useState(0);
  return <div className="sort-demo"><div className="demo-top"><span><span className="live-dot"/> ALGORITHM IN MOTION</span><span>Bubble sort</span></div><div className="bars">{frames[step].map((v,i)=><div key={i} className={`bar ${(i===5 && step>=4) || step===6?'sorted':''}`} style={{height:`${v*9+17}px`}}><span>{v}</span></div>)}</div><div className="demo-bottom"><span>{step===6?"Sorted. One swap at a time.":"Compare. Swap. Repeat."}</span><button onClick={()=>setStep((step+1)%frames.length)} aria-label={step===6?"Restart sorting animation":"Next sorting step"}>{step===6?"Restart":"Next step"}<ArrowRight size={14}/></button></div></div>;
}

function QuestionCard({problem:p,startWithAnswer,completed,onComplete}:{problem:Problem;startWithAnswer:boolean;completed:boolean;onComplete:()=>void}) {
  const [answerOpen,setAnswerOpen]=useState(startWithAnswer);
  const [attempt,setAttempt]=useState("");
  return <article className="problem-card" id={p.id}>
    <div className="problem-meta"><span className={`source-badge ${p.kind.toLowerCase()}`}>{p.kind}</span><span>Question {p.number}</span>{completed&&<span className="completed-label"><Check size={13}/> Completed</span>}</div>
    <h3>{p.title}</h3><div className="topic-tags">{p.topics.map(t=><span key={t}>{t.replace(/-/g," ")}</span>)}</div>
    {p.kind!=="Supplemental"&&p.source&&<SourceLink name={p.source} page={p.page}/>}
    <div className="question-text">{p.prompt}</div>{p.note&&<div className="question-note">{p.note}</div>}
    <div className="question-tabs" role="tablist" aria-label={`Question ${p.number}: ${p.title}`}>
      <button id={`${p.id}-attempt-tab`} role="tab" aria-selected={!answerOpen} aria-controls={`${p.id}-attempt-panel`} onClick={()=>setAnswerOpen(false)} className={!answerOpen?"active":""}><FileText size={14}/> Your attempt</button>
      <button id={`${p.id}-answer-tab`} role="tab" aria-selected={answerOpen} aria-controls={`${p.id}-answer-panel`} onClick={()=>setAnswerOpen(true)} className={answerOpen?"active":""}><CheckCircle2 size={14}/> Answer</button>
    </div>
    {answerOpen?<div role="tabpanel" id={`${p.id}-answer-panel`} aria-labelledby={`${p.id}-answer-tab`} className="answer-block"><h4><CheckCircle2 size={17}/> Worked solution</h4><ol>{p.answer.map((a,j)=><li key={j}><span>{a}</span></li>)}</ol><button className={`mastery-button ${completed?'is-done':''}`} aria-pressed={completed} onClick={onComplete}>{completed?<CheckCircle2 size={16}/>:<Circle size={16}/>} {completed?"Completed":"Mark problem complete"}</button></div>:<div role="tabpanel" id={`${p.id}-attempt-panel`} aria-labelledby={`${p.id}-attempt-tab`} className="attempt-panel"><label htmlFor={`${p.id}-notes`}>Work it out on paper, or jot your reasoning here.</label><textarea id={`${p.id}-notes`} aria-label={`Your attempt: ${p.title}`} placeholder="What do you know? Which idea applies?" value={attempt} onChange={e=>setAttempt(e.target.value)}/><span><Clock3 size={12}/> Scratch space · not saved. Switch to Answer when you’re ready.</span></div>}
  </article>;
}

export default function StudyStudio() {
  const [active,setActive]=useState("overview");
  const [tab,setTab]=useState("learn");
  const [query,setQuery]=useState("");
  const [mastered,setMastered]=useState<string[]>([]);
  const [solved,setSolved]=useState<string[]>([]);
  const [ready,setReady]=useState(false);
  const [mobile,setMobile]=useState(false);
  const [filter,setFilter]=useState("All sources");
  const [topicFilter,setTopicFilter]=useState("all");
  const [focusedProblem,setFocusedProblem]=useState<string|null>(null);
  const [resume,setResume]=useState("sorting");
  const search=useRef<HTMLInputElement>(null);
  useEffect(()=>{try {const saved=JSON.parse(localStorage.getItem("cs2413-progress")||"{}");setMastered(Array.isArray(saved.mastered)?saved.mastered:[]);setSolved(Array.isArray(saved.solved)?saved.solved:[]);setResume(saved.resume||"sorting");} catch {}setReady(true);const hash=location.hash.slice(1);if(sections.some(s=>s.id===hash))setActive(hash);const onHash=()=>{const h=location.hash.slice(1);if(h==="overview"||sections.some(s=>s.id===h)){setActive(h);setTab("learn");setFilter("All sources");setTopicFilter("all");setFocusedProblem(null);}};const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();search.current?.focus();}};window.addEventListener("hashchange",onHash);window.addEventListener("keydown",onKey);return()=>{window.removeEventListener("hashchange",onHash);window.removeEventListener("keydown",onKey);};},[]);
  useEffect(()=>{if(ready)try{localStorage.setItem("cs2413-progress",JSON.stringify({mastered,solved,resume}));}catch{}},[mastered,solved,resume,ready]);
  function navigate(id:string,nextTab="learn") {setActive(id);setTab(nextTab);setFilter("All sources");setTopicFilter("all");setFocusedProblem(null);setQuery("");setMobile(false);if(id!=="overview")setResume(id);history.pushState(null,"",`#${id}`);window.scrollTo({top:0,behavior:"instant"});}
  function toggle(id:string,type:"topic"|"problem") {const setter=type==="topic"?setMastered:setSolved;setter(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);}
  const section=sections.find(s=>s.id===active);
  const index=sections.findIndex(s=>s.id===active);
  const q=query.trim().toLowerCase();
  const sectionProblems=problems.filter(p=>p.section===active);
  const visibleProblems=sectionProblems.filter(p=>(filter==="All sources"||p.kind===filter)&&(!focusedProblem||p.id===focusedProblem));
  type SearchResult = {section:string;title:string;type:string;topic?:string;problem?:string};
  const searchResults:SearchResult[]=q?sections.flatMap(s=>[...(s.title.toLowerCase().includes(q)?[{section:s.id,title:s.title,type:"Section"}]:[]),...s.topics.filter(t=>`${t.title} ${t.summary} ${t.formula||""}`.toLowerCase().includes(q)).map(t=>({section:s.id,title:t.title,type:"Concept",topic:t.id}))]).concat(problems.filter(p=>`${p.title} ${p.prompt}`.toLowerCase().includes(q)).map(p=>({section:p.section,title:p.title,type:"Problem",problem:p.id}))).slice(0,12):[];
  const progress=Math.round(mastered.length/totalTopics*100);

  return <div className="app-shell">
    {mobile&&<button className="sidebar-scrim" aria-label="Close navigation" onClick={()=>setMobile(false)}/>}
    <aside className={`sidebar ${mobile?'open':''}`}>
      <a className="brand" href="#overview" onClick={e=>{e.preventDefault();navigate("overview");}}><span className="brand-mark"><GitBranch size={22}/></span><span>study<span className="brand-light">studio</span><small>CS2413 · ALGORITHMS</small></span></a>
      <div className="semester"><span className="semester-dot"/> Fall 2026 <span>Section A</span></div>
      <button className={`nav-overview ${active==='overview'?'selected':''}`} onClick={()=>navigate("overview")}><LayoutGrid size={18}/> Course overview</button>
      <p className="nav-label">YOUR STUDY GUIDE <span>08</span></p>
      <nav aria-label="Study sections">{sections.map((s,i)=>{const Icon=icons[i];const done=s.topics.every(t=>mastered.includes(t.id));return <button key={s.id} className={`nav-item ${active===s.id?'selected':''}`} onClick={()=>navigate(s.id)}><Icon size={17}/><span>{shortTitles[i]}</span>{done?<CheckCircle2 size={14} className="nav-check"/>:<span className="nav-number">{String(i+1).padStart(2,"0")}</span>}</button>;})}</nav>
      <div className="sidebar-bottom"><div className="progress-title"><span>Your progress</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{width:`${progress}%`}}/></div><p>{mastered.length} of {totalTopics} concepts mastered</p><div className="local-note"><GraduationCap size={18}/><span>A little practice, every day.<small>Progress saved on this device</small></span></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb"><button className="menu-toggle" onClick={()=>setMobile(true)} aria-label="Open navigation"><Menu size={20}/></button><span>My workspace</span><ChevronRight size={14}/><strong>{section?shortTitles[index]:"Course overview"}</strong></div><div className="search-wrap"><Search size={16}/><input ref={search} aria-label="Search concepts and problems" placeholder="Search anything…" value={query} onChange={e=>setQuery(e.target.value)}/>{query?<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>:<kbd>⌘ K</kbd>}{q&&<div className="search-results"><div className="search-caption">{searchResults.length?"JUMP TO A CONCEPT OR PROBLEM":"No matching concepts or problems"}</div>{searchResults.map((r,i)=><button key={i} onClick={()=>{navigate(r.section,r.type==="Problem"?"questions":"learn");if(r.topic)setTopicFilter(r.topic);if(r.problem)setFocusedProblem(r.problem);}}><span>{r.title}</span><small>{r.type}</small><ArrowRight size={14}/></button>)}</div>}</div><span className="avatar">K</span></header>
      <main id="main-content">
        {!section?<>
          <div className="page-kicker"><span className="tiny-dot"/> YOUR EXAM PREP, ALL IN ONE PLACE</div>
          <div className="page-title-row"><div><h1>Big ideas. Clear understanding.</h1><p className="page-description">From the first comparison to the final proof. Let’s make it click.</p></div><span className="course-pill"><BookOpen size={14}/> CS2413 · Fall 2026</span></div>
          <section className="hero"><div className="hero-copy"><span className="hero-eyebrow">LESS SCROLLING. MORE UNDERSTANDING.</span><h2>Your lectures.<br/>Your practice.<br/><em>One connected guide.</em></h2><p>Explore the concepts, try the original problems, and unpack the answers—at your own pace.</p><button className="primary-button" onClick={()=>navigate(resume)}> {mastered.length?"Continue studying":"Start with sorting"}<ArrowRight size={16}/></button><span className="hero-footnote"><CheckCircle2 size={13}/> Built from your course materials</span></div><SortingDemo/></section>
          <div className="stats-strip"><div><span className="stat-icon purple"><Layers3 size={20}/></span><strong>08<small>Study sections</small></strong></div><div><span className="stat-icon orange"><BookOpen size={20}/></span><strong>{totalTopics}<small>Core concepts</small></strong></div><div><span className="stat-icon green"><FileText size={20}/></span><strong>{problems.length}<small>Worked problems</small></strong></div><div><span className="stat-icon blue"><Target size={20}/></span><strong>{solved.length}<small>Problems completed</small></strong></div></div>
          <section className="curriculum"><div className="section-heading"><div><h2>Find your next “aha.”</h2><p>Eight sections. Everything connects.</p></div><span>THE STUDY COLLECTION <span className="count-badge">8</span></span></div><div className="section-grid">{sections.map((s,i)=>{const Icon=icons[i];const done=s.topics.filter(t=>mastered.includes(t.id)).length;const ps=problems.filter(p=>p.section===s.id);return <button className="section-card" key={s.id} onClick={()=>navigate(s.id)}><div className="card-top"><span className={`topic-icon ${colors[i]}`}><Icon size={23}/></span><span className="card-number">{String(i+1).padStart(2,"0")}</span></div><h3>{shortTitles[i]}</h3><p>{s.description}</p><div className="card-bottom"><span>{s.topics.length} concepts <span>·</span> {ps.length} problems</span><ArrowRight size={17}/></div>{done>0&&<div className="card-progress" style={{width:`${done/s.topics.length*100}%`}}/>}</button>;})}</div></section>
          <section className="source-library"><div className="section-heading"><div><h2>Every source, accounted for.</h2><p>Browse the question index by homework, practice sheet, or exam.</p></div><FileText size={20}/></div>{[...new Set(problems.filter(p=>p.kind!=="Supplemental").map(p=>p.source))].map(source=>{const ps=problems.filter(p=>p.source===source);return <details key={source}><summary><span><FileText size={14}/>{sourceLabel(source)}</span><small>{ps.length} question cards</small></summary><div className="source-question-list">{ps.map(p=><button key={p.id} onClick={()=>{navigate(p.section,"questions");setFocusedProblem(p.id);}}>Q{p.number} <span>{p.title}</span><ArrowRight size={13}/></button>)}</div></details>;})}</section>
          <section className="study-tip"><span className="tip-icon"><Sparkles size={22}/></span><div><h3>Understanding comes before the answer.</h3><p>Read a concept. Work a problem on paper. Then open the Answer tab directly under that question to check your reasoning.</p></div><span className="tip-tag">A BETTER STUDY LOOP</span></section>
          <div className="source-note"><FileText size={15}/><p>Grounded in 10 lectures, 3 homework sets, 5 practice sets, and the Fall 2025 exam. Each excerpt and original question links to its PDF page. Study explanations and worked answers are prepared for this guide.</p></div>
        </>:<>
          <button className="back-link" onClick={()=>navigate("overview")}><ArrowLeft size={14}/> All sections</button>
          <div className="detail-heading"><span className={`topic-icon ${colors[index]}`}>{(()=>{const Icon=icons[index];return <Icon size={26}/>;})()}</span><div><div className="page-kicker">SECTION {String(index+1).padStart(2,"0")} / 08</div><h1>{section.title}</h1></div></div><p className="detail-description">{section.description}</p>
          <div className="detail-meta"><span><BookOpen size={14}/>{section.topics.length} concepts</span><span><FileText size={14}/>{sectionProblems.length} practice problems</span><span><CheckCircle2 size={14}/>{section.topics.filter(t=>mastered.includes(t.id)).length} mastered</span></div>
          <div className="tabs" role="tablist" aria-label="Section content">{[{id:"learn",title:"Learn the concepts",icon:BookOpen},{id:"questions",title:"Questions",icon:FileText},{id:"answers",title:"Answers & walkthroughs",icon:CheckCircle2}].map(t=><button key={t.id} id={`tab-${t.id}`} role="tab" aria-selected={tab===t.id} aria-controls={`panel-${t.id}`} onClick={()=>{setTab(t.id);setFocusedProblem(null);}} className={tab===t.id?"active":""}><t.icon size={16}/>{t.title}{t.id==="questions"&&<span>{sectionProblems.length}</span>}</button>)}</div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
          {tab==="learn"?<><div className="concept-filters"><button className={topicFilter==="all"?"active":""} onClick={()=>setTopicFilter("all")}>All concepts</button>{section.topics.map(t=><button key={t.id} className={topicFilter===t.id?"active":""} onClick={()=>setTopicFilter(t.id)}>{t.title}</button>)}</div>{section.topics.filter(t=>topicFilter==="all"||t.id===topicFilter).map((t,i)=><article className="concept-card" key={t.id}><div className="concept-title"><div><span className="concept-index">CONCEPT {String(section.topics.indexOf(t)+1).padStart(2,"0")}</span><h2>{t.title}</h2></div><button className={`mastery-button ${mastered.includes(t.id)?'is-done':''}`} aria-pressed={mastered.includes(t.id)} onClick={()=>toggle(t.id,"topic")}>{mastered.includes(t.id)?<CheckCircle2 size={16}/>:<Circle size={16}/>}<span>{mastered.includes(t.id)?"Mastered":"Mark mastered"}</span></button></div><p className="concept-summary">{t.summary}</p>{t.formula&&<div className="formula">{t.formula}</div>}<ul className="key-points">{t.points.map((point,j)=><li key={j}>{point}</li>)}</ul>{t.pseudocode&&<div className="code-block"><span>THE ALGORITHM</span><pre>{t.pseudocode}</pre></div>}{t.example&&<div className="worked-example"><span><Braces size={15}/> A QUICK EXAMPLE</span><p>{t.example}</p></div>}<blockquote className="lecture-excerpt"><div className="excerpt-label"><BookOpen size={14}/> FROM YOUR LECTURE</div><p>“{t.excerpt.text}”</p><SourceLink name={t.excerpt.source} page={t.excerpt.page}/></blockquote><div className="pitfall"><Target size={16}/><p><strong>Watch for this.</strong> {t.pitfall}</p></div></article>)}<div className="practice-callout"><div><h3>Ready to put it to work?</h3><p>Try the actual course questions before checking the solutions.</p></div><button className="primary-button" onClick={()=>{setTab("questions");window.scrollTo({top:200,behavior:"smooth"});}}>Try {sectionProblems.length} problems<ArrowRight size={16}/></button></div></>:<>
          <div className="problem-toolbar"><div><h2>{tab==="questions"?"A little practice goes a long way.":"Connect the steps. See the reasoning."}</h2><p>{tab==="questions"?"Every question has its own Answer tab directly below it. Source wording uses normalized notation.":"Prepared worked solutions. Compare your approach, not just your final answer."}</p></div><select aria-label="Filter question source" value={filter} onChange={e=>{setFilter(e.target.value);setFocusedProblem(null);}}>{["All sources",...new Set(sectionProblems.map(p=>p.kind))].map(f=><option key={f}>{f}</option>)}</select></div>
          {focusedProblem&&<button className="back-link" onClick={()=>setFocusedProblem(null)}><ArrowLeft size={14}/> Show all questions</button>}
          {!visibleProblems.length&&<div className="empty-state">No questions match this filter. <button onClick={()=>{setFilter("All sources");setFocusedProblem(null);}}>Show all questions</button></div>}
          {visibleProblems.map(p=><QuestionCard key={`${tab}-${p.id}`} problem={p} startWithAnswer={tab==="answers"} completed={solved.includes(p.id)} onComplete={()=>toggle(p.id,"problem")}/>)}
          </>}
          </div><div className="section-pagination"><button onClick={()=>navigate(index>0?sections[index-1].id:"overview")}><ArrowLeft size={16}/>{index>0?shortTitles[index-1]:"Course overview"}</button>{index<7&&<button onClick={()=>navigate(sections[index+1].id)}>Next: {shortTitles[index+1]}<ArrowRight size={16}/></button>}</div>
        </>}
        <footer><span className="footer-brand">study<span>studio</span></span><span>Built for the process of figuring it out.</span><span>CS2413 / FALL 2026</span></footer>
      </main>
    </div>
  </div>;
}
