<script lang="ts">
	import { ChevronDown, ChevronUp, Highlighter, ListTree, Search, X, TriangleAlert } from '@lucide/svelte';
	import { tick, untrack } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Highlight from './Highlight.svelte';
	import HighlightMenu from './HighlightMenu.svelte';
	import HighlightsPanel from './HighlightsPanel.svelte';
	import { GuideHighlighter, paintKey } from '$lib/highlights.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { cn } from '$lib/utils';
	import type { CaseDigest, LawModule } from '$lib/types';

	let { lawModule }: { lawModule: LawModule } = $props();

	interface Heading {
		id: string;
		title: string;
	}
	interface GuideSection {
		id: string;
		title: string;
		html: string;
		text: string;
		subs: Heading[];
	}
	interface CaseGroup {
		id: string;
		title: string;
		cases: CaseDigest[];
	}
	interface CaseSection {
		id: string;
		title: string;
		groups: CaseGroup[];
	}

	const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
	const textOf = (html: string) =>
		html
			.replace(/<[^>]+>/g, ' ')
			.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m])
			.replace(/\s+/g, ' ')
			.trim();

	// ---- parse the guide HTML into h2-level sections ----
	const guide = $derived.by(() => {
		const intro: GuideSection[] = [];
		const sections: GuideSection[] = [];
		for (const chunk of lawModule.studyGuideHtml.split(/(?=<h2\b)/)) {
			if (!chunk.trim()) continue;
			const h2 = chunk.match(/^<h2[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/);
			const subs = [...chunk.matchAll(/<h3[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => ({ id: m[1], title: textOf(m[2]) }));
			const section: GuideSection = {
				id: h2?.[1] ?? 'overview',
				title: h2 ? textOf(h2[2]) : '',
				html: chunk,
				text: textOf(chunk).toLowerCase(),
				subs
			};
			(h2 ? sections : intro).push(section);
		}
		return { intro, sections };
	});

	// ---- parse cases into Part → Topic groups ----
	const caseSections = $derived.by<CaseSection[]>(() => {
		const out: CaseSection[] = [];
		for (const c of lawModule.cases ?? []) {
			const partTitle = c.part ?? 'Cases';
			let part = out.find((p) => p.title === partTitle);
			if (!part) out.push((part = { id: `part-${out.length + 1}`, title: partTitle, groups: [] }));
			let group = part.groups.find((g) => g.title === c.topic);
			if (!group) part.groups.push((group = { id: `${part.id}-topic-${part.groups.length + 1}`, title: c.topic, cases: [] }));
			group.cases.push(c);
		}
		return out;
	});

	// ---- search ----
	let rawQuery = $state('');
	let query = $state('');
	let searchInput: HTMLInputElement | null = $state(null);
	let root: HTMLElement | undefined = $state();
	let guideEl: HTMLElement | undefined = $state();
	/** Only the first-party {@html} area is marked up via the DOM; Svelte-rendered cases use <Highlight>. */
	let proseEl: HTMLElement | undefined = $state();
	let hitCount = $state(0);
	let activeHit = $state(0);

	$effect(() => {
		const v = rawQuery.trim();
		const t = setTimeout(() => (query = v.length >= 2 ? v : ''), 120);
		return () => clearTimeout(t);
	});
	const q = $derived(query.toLowerCase());

	const shownIntro = $derived(q ? [] : guide.intro);
	const shownSections = $derived(q ? guide.sections.filter((s) => s.text.includes(q)) : guide.sections);
	const shownCases = $derived.by<CaseSection[]>(() => {
		if (!q) return caseSections;
		const match = (c: CaseDigest) => [c.title, c.citation, c.summary, c.topic].some((f) => f.toLowerCase().includes(q));
		return caseSections
			.map((p) => ({ ...p, groups: p.groups.map((g) => ({ ...g, cases: g.cases.filter(match) })).filter((g) => g.cases.length) }))
			.filter((p) => p.groups.length);
	});
	const caseHits = $derived(shownCases.reduce((n, p) => n + p.groups.reduce((m, g) => m + g.cases.length, 0), 0));
	const nothingFound = $derived(!!q && shownSections.length === 0 && caseHits === 0);

	function clearMarks(el: HTMLElement) {
		el.querySelectorAll('mark.sg-hit').forEach((m) => m.replaceWith(document.createTextNode(m.textContent ?? '')));
		el.normalize();
	}

	function applyMarks(el: HTMLElement, needle: string) {
		const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const re = new RegExp(`(${escaped})`, 'gi');
		const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
		const nodes: Text[] = [];
		for (let n = walker.nextNode(); n; n = walker.nextNode()) {
			if (n.nodeValue && n.nodeValue.toLowerCase().includes(needle.toLowerCase())) nodes.push(n as Text);
		}
		for (const node of nodes) {
			const frag = document.createDocumentFragment();
			node.nodeValue!.split(re).forEach((piece, i) => {
				if (!piece) return;
				if (i % 2 === 1) {
					const mark = document.createElement('mark');
					mark.className = 'sg-hit';
					mark.textContent = piece;
					frag.append(mark);
				} else frag.append(piece);
			});
			node.replaceWith(frag);
		}
	}

	function allHits() {
		return root ? [...root.querySelectorAll<HTMLElement>('mark.sg-hit, mark.search-hit')] : [];
	}

	function paintActive(scroll: boolean) {
		const hits = allHits();
		hits.forEach((h, i) => h.setAttribute('data-active', String(i === activeHit)));
		if (scroll) hits[activeHit]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	// Re-mark whenever the query or the rendered sections change (effects run after the DOM update).
	$effect(() => {
		const needle = query;
		void shownSections;
		void shownCases;
		const el = proseEl;
		if (!el) return;
		untrack(() => {
			clearMarks(el);
			if (needle) applyMarks(el, needle);
			// A hit inside a collapsed flashcard/answer would be invisible — open it.
			el.querySelectorAll('mark.sg-hit').forEach((m) => m.closest('details')?.setAttribute('open', ''));
			hitCount = allHits().length;
			activeHit = 0;
			paintActive(false);
		});
	});

	function stepHit(delta: number) {
		const n = allHits().length;
		if (!n) return;
		activeHit = (activeHit + delta + n) % n;
		paintActive(true);
	}

	function onSearchKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			stepHit(e.shiftKey ? -1 : 1);
		} else if (e.key === 'Escape') rawQuery = '';
	}

	function onWindowKey(e: KeyboardEvent) {
		const t = e.target as HTMLElement | null;
		if (e.key !== '/' || e.metaKey || e.ctrlKey || !root || root.closest('[hidden]')) return;
		if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
		e.preventDefault();
		searchInput?.focus();
	}

	// ---- outline + scroll spy ----
	let activeId = $state('');
	const outline = $derived.by(() => {
		type Item = { id: string; title: string; subs: Heading[] };
		const items: Item[] = shownSections.map((s) => ({ id: s.id, title: s.title, subs: s.subs }));
		for (const p of shownCases) items.push({ id: p.id, title: p.title, subs: p.groups.map((g) => ({ id: g.id, title: g.title })) });
		return items;
	});
	const activeTopId = $derived(outline.find((o) => o.id === activeId || o.subs.some((s) => s.id === activeId))?.id ?? '');

	$effect(() => {
		void outline;
		const el = guideEl;
		if (!el) return;
		let raf = 0;
		const update = () => {
			raf = 0;
			const heads = [...el.querySelectorAll<HTMLElement>('h2[id], h3[id]')];
			let current = heads[0]?.id ?? '';
			for (const h of heads) {
				if (h.getBoundingClientRect().top <= 140) current = h.id;
				else break;
			}
			activeId = current;
		};
		const onScroll = () => (raf ||= requestAnimationFrame(update));
		update();
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			if (raf) cancelAnimationFrame(raf);
		};
	});

	function jump(id: string, e: Event) {
		e.preventDefault();
		document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		history.replaceState(null, '', `#${id}`);
		mobilePanel = null;
	}

	// ---- reader highlights ----
	/** Every element a highlight can live in (`data-hl-scope`), in reading order. */
	const scopes = $derived([
		...guide.intro.map((s) => ({ id: `guide:${s.id}`, title: 'Overview' })),
		...guide.sections.map((s) => ({ id: `guide:${s.id}`, title: s.title })),
		...caseSections.flatMap((p) => p.groups.flatMap((g) => g.cases.map((c) => ({ id: `case:${c.id}`, title: c.title }))))
	]);
	const scopeIds = $derived(new Set(scopes.map((s) => s.id)));
	const moduleHighlights = $derived(userStorage.highlightsFor(lawModule.id));
	const highlighter = new GuideHighlighter(
		() => moduleHighlights,
		() => scopeIds
	);
	const highlightsKey = $derived(paintKey(moduleHighlights));
	let highlightMenu: ReturnType<typeof HighlightMenu> | undefined = $state();

	$effect(() => {
		const el = guideEl;
		if (el) return highlighter.attach(el);
	});
	$effect(() => {
		void highlightsKey;
		highlighter.schedule();
	});

	async function jumpToHighlight(id: string, flash = true) {
		const h = userStorage.highlights[id];
		if (!h) return;
		if (mobilePanel) {
			// Closing it shortens the sticky bar above the guide, which moves the text up: measure after that.
			mobilePanel = null;
			await tick();
		}
		let range = highlighter.locate(h);
		if (!range && query) {
			// The search may be hiding its section.
			rawQuery = '';
			query = '';
			await tick();
			range = highlighter.locate(h);
		}
		if (!range) return;
		for (let d = range.startContainer.parentElement?.closest('details'); d; d = d.parentElement?.closest('details')) d.open = true;
		const r = range.getBoundingClientRect();
		scrollTo({ top: scrollY + r.top - innerHeight * 0.4, behavior: 'smooth' });
		if (flash) highlighter.flash(range);
	}

	/** From the panel: brings the highlight's text into view, if it's still there, and lets the reader re-select it. */
	async function adjustHighlight(id: string) {
		if (highlighter.missing.has(id)) mobilePanel = null;
		else await jumpToHighlight(id, false);
		highlightMenu?.adjust(id);
	}

	let sidebar = $state<'outline' | 'highlights'>('outline');
	let mobilePanel = $state<'outline' | 'highlights' | null>(null);
	const rest = (c: CaseDigest) => (c.summary.startsWith(c.keyRule) ? c.summary.slice(c.keyRule.length).trim() : c.summary);
</script>

<svelte:window onkeydown={onWindowKey} onbeforeprint={() => proseEl?.querySelectorAll('details').forEach((d) => (d.open = true))} />

<!-- Breakpoints use the `main` size container (in rem), so the sidebar gives way to the toggle when the text size is raised. At 100% this matches the old lg breakpoint. -->
<div bind:this={root} class="grid gap-8 @min-[61rem]/main:grid-cols-[16rem_minmax(0,1fr)]">
	<!-- Sticky outline (desktop) -->
	<aside class="no-print hidden @min-[61rem]/main:block">
		<div class="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-2 text-sm">
			<div class="mb-2 flex items-center gap-3" role="group" aria-label="Sidebar">
				{#each [{ id: 'outline', label: 'Outline', Icon: ListTree }, { id: 'highlights', label: 'Highlights', Icon: Highlighter }] as const as view (view.id)}
					<button
						type="button"
						aria-pressed={sidebar === view.id}
						onclick={() => (sidebar = view.id)}
						class={cn(
							'flex items-center gap-1.5 rounded text-[0.7rem] font-semibold tracking-wider uppercase transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
							sidebar === view.id ? 'text-foreground' : 'text-muted-foreground'
						)}
					>
						<view.Icon class="size-3.5" />
						{view.label}
						{#if view.id === 'highlights' && moduleHighlights.length}
							<span class="rounded-full bg-secondary px-1.5 text-[0.65rem] tracking-normal tabular-nums">{moduleHighlights.length}</span>
						{/if}
					</button>
				{/each}
			</div>
			{#if sidebar === 'highlights'}
				<HighlightsPanel moduleId={lawModule.id} {scopes} missing={highlighter.missing} onjump={jumpToHighlight} onadjust={adjustHighlight} />
			{:else}
				<nav aria-label="Study guide outline">
					{#if outline.length === 0}
						<p class="text-muted-foreground">Nothing to show.</p>
					{/if}
					<ul class="space-y-0.5">
						{#each outline as item (item.id)}
							{@const open = item.id === activeTopId}
							<li>
								<a
									href="#{item.id}"
									onclick={(e) => jump(item.id, e)}
									aria-current={open ? 'true' : undefined}
									class={cn('block rounded-md px-2 py-1.5 leading-snug transition-colors hover:bg-accent', open ? 'bg-accent font-semibold' : 'text-muted-foreground hover:text-foreground')}
								>
									{item.title}
								</a>
								{#if open && item.subs.length}
									<ul class="my-1 ml-2.5 space-y-0.5 border-l pl-2.5">
										{#each item.subs as s (s.id)}
											<li>
												<a
													href="#{s.id}"
													onclick={(e) => jump(s.id, e)}
													aria-current={s.id === activeId ? 'true' : undefined}
													class={cn('block rounded px-1.5 py-1 text-[0.8rem] leading-snug hover:text-foreground', s.id === activeId ? 'font-medium text-foreground' : 'text-muted-foreground')}
												>
													{s.title}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		</div>
	</aside>

	<div class="min-w-0">
		<!-- Search -->
		<div class="no-print sticky top-14 z-20 -mx-2 mb-4 bg-background/90 px-2 py-2.5 backdrop-blur">
			<div class="flex items-center gap-2">
				<div class="relative flex-1">
					<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:ref={searchInput}
						type="text" role="searchbox" autocomplete="off"
						bind:value={rawQuery}
						onkeydown={onSearchKey}
						placeholder="Search the guide…  ( / )"
						aria-label="Search this study guide"
						class="h-10 bg-card pr-9 pl-9"
					/>
					{#if rawQuery}
						<button type="button" onclick={() => (rawQuery = '')} aria-label="Clear search" class="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:text-foreground">
							<X class="size-4" />
						</button>
					{/if}
				</div>
				<Button
					variant="outline"
					size="icon"
					class="relative @min-[61rem]/main:hidden"
					aria-expanded={mobilePanel === 'highlights'}
					aria-label="Toggle highlights"
					onclick={() => (mobilePanel = mobilePanel === 'highlights' ? null : 'highlights')}
				>
					<Highlighter />
					{#if moduleHighlights.length}
						<span class="absolute -top-1.5 -right-1.5 min-w-4 rounded-full bg-primary px-1 text-[0.6rem] leading-4 text-primary-foreground tabular-nums">{moduleHighlights.length}</span>
					{/if}
				</Button>
				<Button variant="outline" size="icon" class="@min-[61rem]/main:hidden" aria-expanded={mobilePanel === 'outline'} aria-label="Toggle outline" onclick={() => (mobilePanel = mobilePanel === 'outline' ? null : 'outline')}>
					<ListTree />
				</Button>
			</div>
			{#if query}
				<div class="mt-2 flex items-center gap-2 text-xs text-muted-foreground" role="status">
					{#if nothingFound}
						<span>No matches for “{query}”.</span>
					{:else}
						<span class="tabular-nums">{hitCount ? `${activeHit + 1} of ${hitCount}` : '0'} match{hitCount === 1 ? '' : 'es'} · {shownSections.length + shownCases.length} section{shownSections.length + shownCases.length === 1 ? '' : 's'}</span>
						<Button variant="ghost" size="icon-xs" onclick={() => stepHit(-1)} aria-label="Previous match"><ChevronUp /></Button>
						<Button variant="ghost" size="icon-xs" onclick={() => stepHit(1)} aria-label="Next match"><ChevronDown /></Button>
					{/if}
				</div>
			{/if}

			{#if mobilePanel === 'highlights'}
				<div class="mt-2 max-h-[60dvh] overflow-y-auto rounded-lg border bg-card p-2.5 @min-[61rem]/main:hidden">
					<HighlightsPanel moduleId={lawModule.id} {scopes} missing={highlighter.missing} onjump={jumpToHighlight} onadjust={adjustHighlight} />
				</div>
			{:else if mobilePanel === 'outline'}
				<nav aria-label="Study guide outline" class="mt-2 max-h-72 overflow-y-auto rounded-lg border bg-card p-2 text-sm @min-[61rem]/main:hidden">
					<ul class="space-y-0.5">
						{#each outline as item (item.id)}
							<li>
								<a href="#{item.id}" onclick={(e) => jump(item.id, e)} class="block rounded px-2 py-1.5 font-medium hover:bg-accent">{item.title}</a>
							</li>
						{/each}
					</ul>
				</nav>
			{/if}
		</div>

		<div bind:this={guideEl}>
			{#if !q && (lawModule.studyGuideIntro || lawModule.legend?.length)}
				<div class="mb-6 space-y-3">
					{#if lawModule.studyGuideIntro}
						<p class="max-w-prose text-[0.95rem] text-muted-foreground">{lawModule.studyGuideIntro}</p>
					{/if}
					{#if lawModule.legend?.length}
						<ul class="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg border bg-card px-3.5 py-2.5 text-xs" aria-label="Color legend">
							{#each lawModule.legend as item (item.label)}
								<li class="flex items-center gap-1.5">
									<span class="size-2.5 rounded-full" style="background:var(--{item.color})" aria-hidden="true"></span>{item.label}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			<div bind:this={proseEl} class="study-guide prose prose-slate max-w-none dark:prose-invert">
				{#each shownIntro as s (s.id + 'intro')}
					<div data-hl-scope="guide:{s.id}">{@html s.html}</div>
				{/each}
				{#each shownSections as s (s.id)}
					<section aria-label={s.title} data-hl-scope="guide:{s.id}">{@html s.html}</section>
				{/each}
			</div>

			{#if shownCases.length}
				<div class="mt-2 space-y-2">
					{#each shownCases as part (part.id)}
						<section aria-labelledby={part.id}>
							<h2 id={part.id} class="mt-10 mb-3 scroll-mt-28 border-b-2 pb-1.5 font-heading text-xl font-semibold sm:text-2xl">{part.title}</h2>
							{#each part.groups as group (group.id)}
								<h3 id={group.id} class="mt-6 mb-2.5 scroll-mt-28 text-base font-semibold">{group.title}</h3>
								<ul class="space-y-3">
									{#each group.cases as c (c.id)}
										<li data-hl-scope="case:{c.id}" class={cn('rounded-xl border bg-card p-4', c.unverified && 'border-orange/50')}>
											<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
												<h4 class="font-semibold"><Highlight text={c.title} query={query} /></h4>
												<div class="flex items-center gap-1.5">
													{#if c.unverified}
														<Badge variant="outline" class="gap-1 border-orange/50 text-orange"><TriangleAlert /> Unverified</Badge>
													{/if}
													<Badge variant="secondary" class="font-mono text-[0.7rem]"><Highlight text={c.citation} query={query} /></Badge>
												</div>
											</div>
											<p class="mt-2 border-l-2 border-red pl-3 text-[0.95rem] leading-relaxed font-medium">
												<Highlight text={c.keyRule} query={query} />
											</p>
											{#if rest(c)}
												<p class="mt-2 text-sm leading-relaxed text-muted-foreground"><Highlight text={rest(c)} query={query} /></p>
											{/if}
										</li>
									{/each}
								</ul>
							{/each}
						</section>
					{/each}
				</div>
			{/if}

			{#if nothingFound}
				<div class="rounded-xl border bg-card p-10 text-center text-muted-foreground">
					<p class="font-medium text-foreground">No results for “{query}”</p>
					<p class="mt-1 text-sm">Try a shorter phrase, an article number, or a case name.</p>
				</div>
			{/if}
		</div>
	</div>
</div>

<HighlightMenu bind:this={highlightMenu} container={guideEl} {highlighter} moduleId={lawModule.id} />
