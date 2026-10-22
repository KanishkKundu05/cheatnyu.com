import { BookOpen, ExternalLink } from "lucide-react";
import lessonData from "../content/lessons.json";

type Excerpt = { text: string; source: string; page: number };
type Topic = { id: string; title: string; points: string[]; formula?: string; pseudocode?: string; example?: string; excerpt: Excerpt; pitfall: string };
type Check = { question: string; answer: string };
const lessons: Record<string, { intro: string[]; checks: Check[] }> = lessonData;
const heapTopics = new Set(["max-heapify", "build-heap", "extract-max", "heap-max", "heap-sort", "pq-heap"]);

function ExcerptBlock({ excerpt }: { excerpt: Excerpt }) {
  return <blockquote className="lecture-excerpt">
    <div className="excerpt-label"><BookOpen size={14}/> FROM YOUR LECTURE</div>
    <p>“{excerpt.text}”</p>
    <a className="source-link" href={`/sources/${encodeURIComponent(excerpt.source)}#page=${excerpt.page}`} target="_blank" rel="noreferrer">{excerpt.source.replace(/\.pdf$/i, "")} · PDF p. {excerpt.page}<ExternalLink size={12}/></a>
  </blockquote>;
}
function Checkpoint({ question, answer }: Check) {
  return <div className="lesson-check"><span className="concept-index">PAUSE & TRY</span><p>{question}</p><details><summary>Check your reasoning</summary><p>{answer}</p></details></div>;
}
const heapSource = "Lecture 6 CS2413 Fall 2026 sec A.pdf";
function HeapFoundations() {
  return <div className="heap-foundations">
    <div className="lesson-heading"><span>START HERE</span><h3>What is a heap?</h3></div>
    <p>A heap is a way to organize values so that an extreme value is easy to find. This course uses a binary heap: a tree where each node has at most two children. The root is the top node; a parent is directly above its children; a leaf has no children.</p>
    <h4>1. The shape: fill every level from left to right</h4>
    <p>A complete binary tree has every level full except possibly the last, which fills from left to right without gaps. Shape is separate from the values: an array already describes this shape, but its values may still need rearranging to satisfy heap order.</p>
    <ExcerptBlock excerpt={{ text: "Corresponding tree is the one you’d get by adding the A.heap-size entries to a binary tree, level by level, from left to right", source: heapSource, page: 27 }}/>
    <h4>2. The storage: one array, two ways to see it</h4>
    <p>Read the tree level by level to get the array. The lecture numbers positions starting at 1. For index i, the parent is ⌊i/2⌋, the left child is 2i, and the right child is 2i+1. A child exists only if its index is at most the active heap size.</p>
    <figure className="heap-diagram"><pre aria-label="Heap tree: root 9, children 7 and 5; 7 has children 1 and 4; 5 has left child 2.">{`          9 [1]
        /       \\
     7 [2]     5 [3]
     /   \\     /
  1 [4] 4 [5] 2 [6]`}</pre><figcaption>Value [index] · Array: [9, 7, 5, 1, 4, 2] · Heap size: 6</figcaption></figure>
    <ExcerptBlock excerpt={{ text: "Parent(i): return ⌊i/2⌋", source: heapSource, page: 28 }}/>
    <Checkpoint question="In this six-element heap, what are the children of index 3?" answer="The left child is index 6 (value 2). The right-child formula gives index 7, but 7 is beyond the heap size, so there is no right child."/>
    <h4>3. The rule: each parent is at least its children</h4>
    <p>In a max-heap, each parent’s value is greater than or equal to each child’s value. Following a path downward can never increase the value, so the root is a maximum. A min-heap reverses the inequality and puts a minimum at the root.</p>
    <ExcerptBlock excerpt={{ text: "Max element is at root", source: heapSource, page: 29 }}/>
    <p>A heap is not a fully sorted array. Siblings need not be in any particular order: both [9, 7, 5] and [9, 5, 7] are valid max-heaps. Only parent–child relationships impose an order.</p>
    <Checkpoint question="Is [9, 4, 7, 6] a max-heap just because 9 is largest?" answer="No. The root is fine, but index 2 has value 4 and its child at index 4 has value 6. Every parent–child pair must satisfy the rule."/>
    <h4>4. The boundary: heap size versus array length</h4>
    <p>Only the first A.heap-size entries belong to the heap. The array can have additional entries outside that boundary. After extraction or during heapsort, use the heap size when checking children so that removed or sorted values stay outside the active heap.</p>
    <Checkpoint question="An array has 8 slots but heap size 5. Can index 3 have an active left child?" answer="No. Its left child would be index 6, which is outside the active heap even though the array has a slot there."/>
  </div>;
}
export function ConceptLesson({ topic: t }: { topic: Topic }) {
  const lesson = lessons[t.id];
  return <div className="concept-lesson">
    <nav className="lesson-roadmap" aria-label={`${t.title} reading order`}>
      {heapTopics.has(t.id) && <a href={`#${t.id}-foundation`}>Heap basics</a>}
      <a href={`#${t.id}-idea`}>1. Understand</a><a href={`#${t.id}-reason`}>2. Work through it</a><a href={`#${t.id}-practice`}>3. Practice</a>
    </nav>
    <p className="lesson-guidance">Read from top to bottom. Pause at each short question, then check your reasoning. Explanations and examples are study aids; quoted passages link to the original lecture PDF.</p>
    {heapTopics.has(t.id) && <div id={`${t.id}-foundation`}><HeapFoundations/></div>}
    <section className="lesson-part" id={`${t.id}-idea`}>
      <div className="lesson-heading"><span>01 / UNDERSTAND</span><h3>{heapTopics.has(t.id) ? `Now: ${t.title}` : "Start with the idea"}</h3></div>
      {lesson.intro.map((p, i) => <p key={i}>{p}</p>)}
      <ExcerptBlock excerpt={t.excerpt}/>
      <Checkpoint {...lesson.checks[0]}/>
    </section>
    <section className="lesson-part" id={`${t.id}-reason`}>
      <div className="lesson-heading"><span>02 / WORK THROUGH IT</span><h3>How it works, and why</h3></div>
      <ol className="lesson-reasoning">{t.points.map((p, i) => <li key={i}>{p}</li>)}</ol>
      {t.pseudocode && <div className="code-block"><span>FOLLOW THE STEPS</span><pre>{t.pseudocode}</pre></div>}
      {t.example && <div className="worked-example"><span>A WORKED EXAMPLE</span><p>{t.example}</p></div>}
      {t.formula && <><h4>The result to remember</h4><div className="formula">{t.formula}</div></>}
      <div className="pitfall"><p><strong>Watch for this.</strong> {t.pitfall}</p></div>
      <Checkpoint {...lesson.checks[1]}/>
    </section>
  </div>;
}
