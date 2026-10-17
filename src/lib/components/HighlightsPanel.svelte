<script lang="ts">
	import { Tag, Trash2, TriangleAlert } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { COLOR_NAMES, HIGHLIGHT_COLORS, canPaintHighlights } from '$lib/highlights.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';

	let {
		moduleId,
		scopes,
		missing,
		onjump
	}: {
		moduleId: string;
		/** Every highlightable section and case, in reading order. */
		scopes: { id: string; title: string }[];
		missing: ReadonlySet<string>;
		onjump: (id: string) => void;
	} = $props();

	let editingLabels = $state(false);

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
			Select any text in the guide or a case digest to highlight it. Tap a highlight to change its color, add a note, or remove it.
		</p>
	{/if}

	{#if found.length}
		<ul class="space-y-1.5">
			{#each found as h (h.id)}
				<li>
					<button
						type="button"
						onclick={() => onjump(h.id)}
						class="block w-full rounded-lg border border-l-4 bg-card px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						style="border-left-color:var(--hl-{h.color})"
					>
						<span class="flex min-w-0 items-baseline gap-1 text-[0.7rem] text-muted-foreground">
							<span class="shrink-0 font-semibold text-foreground">{userStorage.highlightLabel(h.color)}</span>
							<span aria-hidden="true">·</span>
							<span class="truncate">{titles.get(h.scope)}</span>
						</span>
						<span class="mt-0.5 line-clamp-3 font-serif text-[0.85rem] leading-snug">{h.quote}</span>
						{#if h.note?.trim()}
							<span class="mt-1 line-clamp-3 text-xs whitespace-pre-line text-muted-foreground italic">{h.note}</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if lost.length}
		<div class="space-y-1.5 border-t pt-3">
			<p class="flex items-center gap-1.5 text-xs font-medium text-orange"><TriangleAlert class="size-3.5" /> No longer in the guide</p>
			<p class="text-xs text-muted-foreground">The text changed after you highlighted it. Your note is kept here until you remove it.</p>
			<ul class="space-y-1.5">
				{#each lost as h (h.id)}
					<li class="rounded-lg border border-l-4 bg-card px-2.5 py-2" style="border-left-color:var(--hl-{h.color})">
						<p class="line-clamp-3 font-serif text-[0.85rem] leading-snug text-muted-foreground">{h.quote}</p>
						{#if h.note?.trim()}
							<p class="mt-1 text-xs whitespace-pre-line text-muted-foreground italic">{h.note}</p>
						{/if}
						<Button variant="ghost" size="xs" class="mt-1 -ml-2 text-destructive hover:text-destructive" onclick={() => userStorage.removeHighlight(h.id)}><Trash2 /> Remove</Button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
