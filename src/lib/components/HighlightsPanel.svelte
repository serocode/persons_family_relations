<script lang="ts">
	import { Pencil, SquareDashedText, Tag, Trash2, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import HighlightEditor from './HighlightEditor.svelte';
	import { COLOR_NAMES, HIGHLIGHT_COLORS, canPaintHighlights } from '$lib/highlights.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';

	let {
		moduleId,
		scopes,
		missing,
		onjump,
		onadjust
	}: {
		moduleId: string;
		/** Every highlightable section and case, in reading order. */
		scopes: { id: string; title: string }[];
		missing: ReadonlySet<string>;
		onjump: (id: string) => void;
		/** Re-select the text a highlight covers, in the guide. */
		onadjust: (id: string) => void;
	} = $props();

	let editingLabels = $state(false);
	/** The highlight open for editing in the list. */
	let editingId = $state<string | null>(null);
	let confirmingClear = $state(false);

	function remove(id: string) {
		userStorage.removeHighlight(id);
		if (editingId === id) editingId = null;
	}

	function removeAll() {
		userStorage.removeHighlightsFor(moduleId);
		editingId = null;
		confirmingClear = false;
	}

	const order = $derived(new Map(scopes.map((s, i) => [s.id, i])));
	const titles = $derived(new Map(scopes.map((s) => [s.id, s.title])));
	const items = $derived(
		userStorage.highlightsFor(moduleId).sort((a, b) => (order.get(a.scope) ?? Infinity) - (order.get(b.scope) ?? Infinity) || a.start - b.start)
	);
	const found = $derived(items.filter((h) => !missing.has(h.id)));
	const lost = $derived(items.filter((h) => missing.has(h.id)));
</script>

<div class="space-y-3 text-sm">
	<div class="flex items-center justify-between gap-2">
		<p class="text-xs text-muted-foreground tabular-nums">{items.length} highlight{items.length === 1 ? '' : 's'}</p>
		<Button variant="ghost" size="xs" aria-expanded={editingLabels} onclick={() => (editingLabels = !editingLabels)}><Tag /> Labels</Button>
	</div>

	{#if editingLabels}
		<div class="space-y-1.5 rounded-lg border bg-card p-2">
			<p class="text-xs text-muted-foreground">Name what each color means to you. Labels apply to every subject.</p>
			{#each HIGHLIGHT_COLORS as color (color)}
				<div class="flex items-center gap-2">
					<span class="size-3.5 shrink-0 rounded-full ring-1 ring-foreground/15" style="background:var(--hl-{color})" aria-hidden="true"></span>
					<Input
						value={userStorage.highlightLabels[color]}
						oninput={(e) => userStorage.setHighlightLabel(color, e.currentTarget.value)}
						placeholder={COLOR_NAMES[color]}
						maxlength={24}
						aria-label="Label for {COLOR_NAMES[color].toLowerCase()}"
						class="h-7 text-xs md:text-xs"
					/>
				</div>
			{/each}
		</div>
	{/if}

	{#if !canPaintHighlights}
		<p class="flex items-start gap-2 rounded-lg border border-orange/50 bg-orange/10 p-2.5 text-xs" role="note">
			<TriangleAlert class="mt-0.5 size-3.5 shrink-0 text-orange" />
			This browser can't color highlights in the text. They're still saved and listed here — update the browser to see them in the guide.
		</p>
	{/if}

	{#if !items.length}
		<p class="rounded-lg border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
			Select any text in the guide or a case digest to highlight it. Tap a highlight to change its color, add a note, adjust the text it
			covers, or remove it.
		</p>
	{/if}

	{#if found.length}
		<ul class="space-y-1.5">
			{#each found as h (h.id)}
				{@const open = editingId === h.id}
				<li class="rounded-lg border border-l-4 bg-card" style="border-left-color:var(--hl-{h.color})">
					<div class="relative">
						<button
							type="button"
							onclick={() => onjump(h.id)}
							class="block w-full rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							<span class="flex min-w-0 items-baseline gap-1 pr-6 text-[0.7rem] text-muted-foreground">
								<span class="shrink-0 font-semibold text-foreground">{userStorage.highlightLabel(h.color)}</span>
								<span aria-hidden="true">·</span>
								<span class="truncate">{titles.get(h.scope)}</span>
							</span>
							<span class="mt-0.5 line-clamp-3 font-serif text-[0.85rem] leading-snug">{h.quote}</span>
							{#if h.note?.trim() && !open}
								<span class="mt-1 line-clamp-3 text-xs whitespace-pre-line text-muted-foreground italic">{h.note}</span>
							{/if}
						</button>
						<Button
							variant="ghost"
							size="icon-xs"
							class="absolute top-1 right-1 text-muted-foreground"
							aria-label="Edit highlight"
							aria-expanded={open}
							onclick={() => (editingId = open ? null : h.id)}
						>
							<Pencil />
						</Button>
					</div>
					{#if open}
						<div class="border-t p-2.5">
							<HighlightEditor highlight={h} ondone={() => (editingId = null)} onremove={() => remove(h.id)} onadjust={() => onadjust(h.id)} />
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if lost.length}
		<div class="space-y-1.5 border-t pt-3">
			<p class="flex items-center gap-1.5 text-xs font-medium text-orange"><TriangleAlert class="size-3.5" /> No longer in the guide</p>
			<p class="text-xs text-muted-foreground">
				The text changed after you highlighted it. Re-attach it to the new wording to keep its note, or remove it.
			</p>
			<ul class="space-y-1.5">
				{#each lost as h (h.id)}
					<li class="rounded-lg border border-l-4 bg-card px-2.5 py-2" style="border-left-color:var(--hl-{h.color})">
						<p class="line-clamp-3 font-serif text-[0.85rem] leading-snug text-muted-foreground">{h.quote}</p>
						{#if h.note?.trim()}
							<p class="mt-1 text-xs whitespace-pre-line text-muted-foreground italic">{h.note}</p>
						{/if}
						<div class="mt-1 -ml-2 flex gap-1">
							<Button variant="ghost" size="xs" onclick={() => onadjust(h.id)}><SquareDashedText /> Re-attach</Button>
							<Button variant="ghost" size="xs" class="text-destructive hover:text-destructive" onclick={() => remove(h.id)}><Trash2 /> Remove</Button>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if items.length}
		<div class="border-t pt-2">
			{#if confirmingClear}
				<div class="space-y-1.5 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5 text-xs">
					<p>Remove all {items.length} highlight{items.length === 1 ? '' : 's'} in this subject, with their notes? This can't be undone.</p>
					<div class="flex justify-end gap-1">
						<Button variant="ghost" size="xs" onclick={() => (confirmingClear = false)}>Cancel</Button>
						<Button variant="destructive" size="xs" onclick={removeAll}>Remove all</Button>
					</div>
				</div>
			{:else}
				<Button variant="ghost" size="xs" class="-ml-2 text-muted-foreground hover:text-destructive" onclick={() => (confirmingClear = true)}>
					<Trash2 /> Remove all
				</Button>
			{/if}
		</div>
	{/if}
</div>
