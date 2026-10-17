<script lang="ts">
	import { SquareDashedText, Trash2 } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { HIGHLIGHT_COLORS } from '$lib/highlights.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { cn } from '$lib/utils';
	import type { HighlightColor, UserHighlight } from '$lib/types';

	/** A highlight's color, note and removal — shared by the menu over the guide and the highlights panel. */
	let {
		highlight,
		ondone,
		onremove,
		onadjust,
		onrecolor,
		noteEl = $bindable(null)
	}: {
		highlight: UserHighlight;
		ondone: () => void;
		onremove: () => void;
		/** Offers "Adjust": re-select the text the highlight covers. */
		onadjust?: () => void;
		onrecolor?: (color: HighlightColor) => void;
		noteEl?: HTMLTextAreaElement | null;
	} = $props();

	function recolor(color: HighlightColor) {
		userStorage.updateHighlight(highlight.id, { color });
		onrecolor?.(color);
	}
</script>

<div class="space-y-2.5">
	<div class="flex gap-1.5" role="radiogroup" aria-label="Color">
		{#each HIGHLIGHT_COLORS as color (color)}
			<button
				type="button"
				role="radio"
				aria-checked={highlight.color === color}
				aria-label={userStorage.highlightLabel(color)}
				title={userStorage.highlightLabel(color)}
				onclick={() => recolor(color)}
				class={cn(
					'size-7 rounded-full ring-1 ring-foreground/15 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
					highlight.color === color && 'ring-2 ring-foreground ring-offset-2 ring-offset-popover'
				)}
				style="background:var(--hl-{color})"
			></button>
		{/each}
	</div>
	<Textarea
		bind:ref={noteEl}
		value={highlight.note ?? ''}
		oninput={(e) => userStorage.updateHighlight(highlight.id, { note: e.currentTarget.value })}
		placeholder="Add a note…"
		aria-label="Note"
		rows={2}
		class="max-h-48 min-h-14 text-sm"
	/>
	<div class="flex items-center gap-1">
		<Button variant="ghost" size="sm" class="-ml-1.5 text-destructive hover:text-destructive" onclick={onremove}><Trash2 /> Remove</Button>
		{#if onadjust}
			<Button variant="ghost" size="sm" class="ml-auto" title="Change which text is highlighted" onclick={onadjust}><SquareDashedText /> Adjust</Button>
		{/if}
		<Button variant="outline" size="sm" class={cn(!onadjust && 'ml-auto')} onclick={ondone}>Done</Button>
	</div>
</div>
