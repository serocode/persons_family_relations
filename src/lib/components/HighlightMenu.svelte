<script lang="ts" module>
	import type { HighlightColor } from '$lib/types';

	/** The color "Note" uses on a fresh selection: whatever the reader picked last this session. */
	let lastColor: HighlightColor = 'yellow';
</script>

<script lang="ts">
	import { MessageSquarePlus, Trash2, X } from '@lucide/svelte';
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { HIGHLIGHT_COLORS, SCOPE_ATTR, anchorFromRange, newHighlightId, type GuideHighlighter } from '$lib/highlights.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { cn } from '$lib/utils';
	import type { UserHighlight } from '$lib/types';

	let { container, highlighter, moduleId }: { container: HTMLElement | undefined; highlighter: GuideHighlighter; moduleId: string } = $props();

	type Draft = Pick<UserHighlight, 'scope' | 'quote' | 'prefix' | 'suffix' | 'start'>;

	let mode = $state<'idle' | 'create' | 'edit'>('idle');
	/** Create mode: the selection, captured when it settled — a tap on the menu can clear the live one on touch screens. */
	let draft: Draft | null = null;
	let selection: Range | null = null;
	/** Edit mode: the highlight, and which of its line boxes was tapped (the menu sits under that line). */
	let editId = $state<string | null>(null);
	let editBox = 0;

	let anchor = $state<DOMRect | null>(null);
	let menuW = $state(0);
	let menuH = $state(0);
	let vw = $state(0);
	let vh = $state(0);
	let menuEl: HTMLElement | undefined = $state();
	let noteEl: HTMLTextAreaElement | null = $state(null);

	let mouseDown = false;
	let pressingMenu = false;
	let selTimer: ReturnType<typeof setTimeout> | undefined;
	let raf = 0;

	const editing = $derived(editId ? userStorage.highlights[editId] : undefined);

	const GAP = 8;
	const EDGE = 8;
	/** Below the line, or above it when there's no room below. */
	const pos = $derived.by(() => {
		if (!anchor) return null;
		let top = anchor.bottom + GAP;
		if (top + menuH > vh - EDGE && anchor.top - GAP - menuH >= EDGE) top = anchor.top - GAP - menuH;
		const left = Math.min(Math.max(anchor.left + anchor.width / 2 - menuW / 2, EDGE), Math.max(EDGE, vw - menuW - EDGE));
		return { top, left };
	});

	function close() {
		mode = 'idle';
		draft = null;
		selection = null;
		editId = null;
		anchor = null;
	}

	function currentAnchor(): DOMRect | null {
		const rects = mode === 'create' ? selection?.getClientRects() : editId ? highlighter.painted(editId)?.getClientRects() : undefined;
		if (!rects?.length) return null;
		return mode === 'create' ? rects[rects.length - 1] : rects[Math.min(editBox, rects.length - 1)];
	}

	function reposition() {
		raf = 0;
		if (mode === 'idle') return;
		const rect = currentAnchor();
		if (rect) anchor = rect;
		else if (mode === 'create') close();
	}

	function scopeOf(node: Node | null) {
		const el = node && (node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement);
		const scope = el?.closest(`[${SCOPE_ATTR}]`);
		return scope && container?.contains(scope) ? scope : null;
	}

	function readSelection() {
		if (pressingMenu) return;
		const sel = getSelection();
		const range = sel && !sel.isCollapsed && sel.rangeCount ? sel.getRangeAt(0) : null;
		const scope = range && (scopeOf(range.startContainer) ?? scopeOf(range.endContainer));
		const a = scope && anchorFromRange(scope, range);
		if (!range || !scope || !a) {
			// Typing in the note box moves the selection too; only a create menu belongs to the selection.
			if (mode === 'create') close();
			return;
		}
		draft = { scope: scope.getAttribute(SCOPE_ATTR)!, ...a };
		selection = range.cloneRange();
		editId = null;
		mode = 'create';
		reposition();
	}

	function onSelectionChange() {
		clearTimeout(selTimer);
		// With a mouse, wait for the button to come up; touch handles and the keyboard just need to settle.
		if (!mouseDown) selTimer = setTimeout(readSelection, 180);
	}

	function onPointerDown(e: PointerEvent) {
		if (menuEl?.contains(e.target as Node)) {
			pressingMenu = true;
			return;
		}
		if (e.pointerType === 'mouse' && e.button === 0) mouseDown = true;
		if (mode !== 'idle') close();
	}

	function onPointerUp() {
		setTimeout(() => (pressingMenu = false), 0);
		if (!mouseDown) return;
		mouseDown = false;
		clearTimeout(selTimer);
		selTimer = setTimeout(readSelection, 10);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && mode !== 'idle') close();
	}

	function onScroll() {
		if (mode !== 'idle') raf ||= requestAnimationFrame(reposition);
	}

	function create(color: (typeof HIGHLIGHT_COLORS)[number], withNote = false) {
		if (!draft) return;
		const id = newHighlightId(moduleId);
		userStorage.addHighlight({ id, moduleId, ...draft, color });
		lastColor = color;
		const boxes = selection?.getClientRects().length ?? 1;
		getSelection()?.removeAllRanges();
		if (!withNote) return close();
		// It paints on the next frame; until then the menu stays where the selection was.
		mode = 'edit';
		editId = id;
		editBox = Math.max(0, boxes - 1);
		draft = null;
		selection = null;
		tick().then(() => noteEl?.focus());
	}

	function recolor(color: (typeof HIGHLIGHT_COLORS)[number]) {
		if (!editId) return;
		userStorage.updateHighlight(editId, { color });
		lastColor = color;
	}

	function remove() {
		if (editId) userStorage.removeHighlight(editId);
		close();
	}

	function onContainerClick(e: MouseEvent) {
		if (!getSelection()?.isCollapsed) return;
		const target = e.target as Element;
		if (target.closest('a[href], button, input, textarea, select, label')) return;
		const hit = highlighter.hitTest(e.clientX, e.clientY);
		if (!hit) return;
		// Tapping highlighted text on a flashcard edits the highlight rather than flipping the card.
		if (target.closest('summary')) e.preventDefault();
		mode = 'edit';
		editId = hit.id;
		editBox = hit.box;
		draft = null;
		selection = null;
		reposition();
	}

	$effect(() => {
		const el = container;
		if (!el) return;
		el.addEventListener('click', onContainerClick);
		return () => el.removeEventListener('click', onContainerClick);
	});

	// Deleted elsewhere (another tab, an import, a reset).
	$effect(() => {
		if (mode === 'edit' && !editing) close();
	});

	$effect(() => () => {
		clearTimeout(selTimer);
		cancelAnimationFrame(raf);
	});
</script>

<svelte:document onselectionchange={onSelectionChange} onpointerdown={onPointerDown} />
<svelte:window bind:innerWidth={vw} bind:innerHeight={vh} onpointerup={onPointerUp} onpointercancel={onPointerUp} onkeydown={onKey} onscroll={onScroll} onresize={onScroll} />

{#if mode !== 'idle' && pos}
	<div
		bind:this={menuEl}
		bind:offsetWidth={menuW}
		bind:offsetHeight={menuH}
		class={cn('no-print fixed z-50 rounded-xl border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95', !menuH && 'invisible')}
		style="top:{pos.top}px;left:{pos.left}px"
	>
		{#if mode === 'create'}
			<!-- Keep the text selected while a button is pressed. -->
			<div
				role="toolbar"
				tabindex="-1"
				aria-label="Highlight the selection"
				class="flex max-w-[min(30rem,calc(100vw-1rem))] flex-wrap items-center gap-0.5 p-1 select-none"
				onmousedown={(e) => e.preventDefault()}
			>
				{#each HIGHLIGHT_COLORS as color (color)}
					<button
						type="button"
						onclick={() => create(color)}
						class="inline-flex h-8 max-w-[9rem] items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<span class="size-3 shrink-0 rounded-full ring-1 ring-foreground/15" style="background:var(--hl-{color})" aria-hidden="true"></span>
						<span class="truncate">{userStorage.highlightLabel(color)}</span>
					</button>
				{/each}
				<span class="mx-0.5 h-5 w-px bg-border" aria-hidden="true"></span>
				<button
					type="button"
					onclick={() => create(lastColor, true)}
					class="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
				>
					<MessageSquarePlus class="size-3.5" /> Note
				</button>
			</div>
		{:else if editing}
			<div role="dialog" aria-label="Edit highlight" class="w-72 max-w-[calc(100vw-1rem)] space-y-2.5 p-3">
				<div class="flex items-center justify-between gap-2">
					<p class="truncate text-xs font-semibold">{userStorage.highlightLabel(editing.color)}</p>
					<Button variant="ghost" size="icon-xs" onclick={close} aria-label="Close"><X /></Button>
				</div>
				<div class="flex gap-1.5" role="radiogroup" aria-label="Color">
					{#each HIGHLIGHT_COLORS as color (color)}
						<button
							type="button"
							role="radio"
							aria-checked={editing.color === color}
							aria-label={userStorage.highlightLabel(color)}
							title={userStorage.highlightLabel(color)}
							onclick={() => recolor(color)}
							class={cn(
								'size-7 rounded-full ring-1 ring-foreground/15 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
								editing.color === color && 'ring-2 ring-foreground ring-offset-2 ring-offset-popover'
							)}
							style="background:var(--hl-{color})"
						></button>
					{/each}
				</div>
				<Textarea
					bind:ref={noteEl}
					value={editing.note ?? ''}
					oninput={(e) => editId && userStorage.updateHighlight(editId, { note: e.currentTarget.value })}
					placeholder="Add a note…"
					aria-label="Note"
					rows={2}
					class="max-h-48 min-h-14 text-sm"
				/>
				<div class="flex justify-between">
					<Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" onclick={remove}><Trash2 /> Remove</Button>
					<Button variant="outline" size="sm" onclick={close}>Done</Button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	/* The guide's highlights, painted with the CSS Custom Highlight API (see src/lib/highlights.svelte.ts). They live
	   here, not in app.css, because Tailwind's CSS optimizer doesn't know ::highlight() yet and warns on every build. */
	:global(::highlight(hl-yellow)) {
		background-color: color-mix(in srgb, var(--hl-yellow) var(--hl-alpha), transparent);
	}
	:global(::highlight(hl-green)) {
		background-color: color-mix(in srgb, var(--hl-green) var(--hl-alpha), transparent);
	}
	:global(::highlight(hl-blue)) {
		background-color: color-mix(in srgb, var(--hl-blue) var(--hl-alpha), transparent);
	}
	:global(::highlight(hl-pink)) {
		background-color: color-mix(in srgb, var(--hl-pink) var(--hl-alpha), transparent);
	}
	:global(::highlight(hl-purple)) {
		background-color: color-mix(in srgb, var(--hl-purple) var(--hl-alpha), transparent);
	}
	/* A highlight with a note gets a dotted underline. */
	:global(::highlight(hl-note)) {
		text-decoration: underline dotted color-mix(in srgb, var(--foreground) 55%, transparent);
	}
	:global(::highlight(hl-flash)) {
		background-color: color-mix(in srgb, var(--orange) 40%, transparent);
		text-decoration: underline solid var(--orange);
	}
</style>
