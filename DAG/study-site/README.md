# CS2413 Study Studio

A Next.js / TypeScript study site built from the 20 course PDFs in `public/sources`.

## Run locally

```sh
cd DAG/study-site
npm ci
npm run dev
```

Open http://localhost:3000. The app contains nine distinct sections with 42 concepts and 85 question cards. Each concept is followed immediately by its associated questions, each with its own Your attempt / Answer tabs. The separate question bank remains available for review. Includes all 28 numbered homework questions (Homework 4 is split into 7 cards), all 26 practice-sheet questions, and the 8 non-crossed-out old-exam questions (subparts are split into 16 cards; Q5, Q6(b–c), and Q8(c) are excluded), plus 11 supplemental questions. Search, source PDF links, a source-by-source index, and device-local progress are included.

## Verify and build

```sh
npm run check:content
npm run typecheck
npm run build
```

The build exports a static site to `out/`. Serve that folder with any static HTTP server; no database or API credentials are needed. `npm start` is not used for static export hosting.

## Course content

- `content/topics.json`: lecture excerpts, PDF page references, explanations, examples, and pitfalls.
- `content/concept-questions.json`: explicit concept-to-question assignments, including connections across sections.
- `content/coverage.json`: expected numbered questions for all ten problem sources; validated by the content check.
- `content/problems.json`: full question prompts, question numbers, source pages, worked answers, and explicit notes for related homework or supplemental material.
- PDF links use physical file page numbers, which may differ from printed exam numbering.
- Explanations and worked solutions are prepared study material; source wording and supplemental material are distinguished.
- The course's polynomial-toll Master Theorem, empty-allowed maximum subarray, and priority-queue mapping cost conventions are preserved.

Original PDFs remain in the parent DAG folder. Extraction intermediates, dependencies, builds, and environment files are ignored by Git.

## Foundations and proofs

The first section, `#foundations`, covers asymptotic definitions, tightness, work counting, correctness specifications, loop invariants, and induction. It includes the lecture arguments for bubble sort, mergesort, Build-Max-Heap, heapsort, and partitioning, plus a homework-based insertion-sort proof and an optional radix-sort invariant from Lecture 10. Worked proof expansions are distinguished from quoted excerpts. The radix extension does not restore crossed-out exam questions.

Section question banks include the unique questions linked to their concepts, so HW1 Q4–9 appears in foundations without duplicating problem records or completion progress.
