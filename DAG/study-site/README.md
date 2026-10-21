# CS2413 Study Studio

A Next.js / TypeScript study site built from the 19 course PDFs in `public/sources`.

## Run locally

```sh
cd DAG/study-site
npm ci
npm run dev
```

Open http://localhost:3000. The app contains eight distinct sections with 30 concepts and 74 question cards. Each question has its own Your attempt / Answer tabs. Includes all 25 numbered homework questions, all 26 practice-sheet questions, and all 9 old-exam questions (exam subparts are split into 18 cards), plus 5 supplemental questions. Search, source PDF links, a source-by-source index, and device-local progress are included.

## Verify and build

```sh
npm run check:content
npm run typecheck
npm run build
```

The build exports a static site to `out/`. Serve that folder with any static HTTP server; no database or API credentials are needed. `npm start` is not used for static export hosting.

## Course content

- `content/topics.json`: lecture excerpts, PDF page references, explanations, examples, and pitfalls.
- `content/coverage.json`: expected numbered questions for all nine problem sources; validated by the content check.
- `content/problems.json`: full question prompts, question numbers, source pages, worked answers, and explicit notes for related homework or supplemental material.
- PDF links use physical file page numbers, which may differ from printed exam numbering.
- Explanations and worked solutions are prepared study material; source wording and supplemental material are distinguished.
- The course's polynomial-toll Master Theorem, empty-allowed maximum subarray, and priority-queue mapping cost conventions are preserved.

Original PDFs remain in the parent DAG folder. Extraction intermediates, dependencies, builds, and environment files are ignored by Git.
