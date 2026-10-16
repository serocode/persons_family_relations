# Subpoena Colada

Offline-first study app for Philippine law subjects: MCQ practice (practice and timed-exam modes), ALAC essay exercises with model answers, and color-coded study guides with case digests. SvelteKit 3 (Svelte 5 runes) · Tailwind v4 · shadcn-svelte. There is no backend — answers, essay drafts and bookmarks live in `localStorage`.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm run check    # svelte-check
npm run build    # static SPA -> build/ (fallback: 200.html)
```

## Layout

- `src/lib/data/` — one file per subject (`pfr`, `pfr_cases`, `consti1`, `crim1`, `statcon`) plus `modules.ts`, the master index. These files are the source of truth for questions, essays and guides.
- `src/lib/data/statcon2/` — Statutory Construction II (Agpalo Chs. VI–XI and five cases), kept as structured data instead of a hand-written HTML string: one file per chapter (`ch6`–`ch11`), `cases`, `integrated` (comprehensive exam) and `review` (front matter and master sheets), rendered by `model.ts`. True/false items and the case recall drill become MCQs and every ALAC problem becomes an essay, with IDs taken from each item's position in its bank, so add new items at the end of a bank.
- `src/lib/stores/storage.svelte.ts` — reactive `localStorage` store (debounced writes, cross-tab sync, export/import).
- `src/lib/components/` — `McqQuizEngine`, `AlacEssayEditor`, `StudyGuideViewer`, `AlacBanner`, `HeaderNav`.
- `static/legacy/` — the previous single-file HTML version, still served under `/legacy/`.

Question and essay IDs are `<module>:<topic>:<n>` / `<module>:alac:<n>`. Saved progress is keyed by those IDs, so reordering a bank is safe but renaming or renumbering an item detaches its saved answer.

## Deploy

`vercel.json` builds with `npm run build`, serves `build/`, and rewrites unknown paths to `200.html` so `/module/<slug>` deep links work.
