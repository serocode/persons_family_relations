<script lang="ts">
	let { text, query = '' }: { text: string; query?: string } = $props();

	const parts = $derived.by(() => {
		const q = query.trim();
		if (q.length < 2) return [{ t: text, hit: false }];
		const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
		return text
			.split(re)
			.filter(Boolean)
			.map((t) => ({ t, hit: t.toLowerCase() === q.toLowerCase() }));
	});
</script>

{#each parts as p, i (i)}{#if p.hit}<mark class="search-hit">{p.t}</mark>{:else}{p.t}{/if}{/each}
