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
- `src/lib/stores/storage.svelte.ts` — reactive `localStorage` store (debounced writes, cross-tab sync, export/import).
- `src/lib/components/` — `McqQuizEngine`, `AlacEssayEditor`, `StudyGuideViewer`, `AlacBanner`, `HeaderNav`.
- `static/legacy/` — the previous single-file HTML version, still served under `/legacy/`.

Question and essay IDs are `<module>:<topic>:<n>` / `<module>:alac:<n>`. Saved progress is keyed by those IDs, so reordering a bank is safe but renaming or renumbering an item detaches its saved answer.

## Deploy

`vercel.json` builds with `npm run build`, serves `build/`, and rewrites unknown paths to `200.html` so `/module/<slug>` deep links work.
