<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { theme, type ThemeMode } from '$lib/stores/theme.svelte';
	import { cn } from '$lib/utils';

	const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
		{ mode: 'light', label: 'Light theme', icon: Sun },
		{ mode: 'system', label: 'System theme', icon: Monitor },
		{ mode: 'dark', label: 'Dark theme', icon: Moon }
	];
	const current = $derived(options.find((o) => o.mode === theme.mode) ?? options[1]);
	const CurrentIcon = $derived(current.icon);
	const next = $derived(options.find((o) => o.mode === (theme.mode === 'light' ? 'dark' : theme.mode === 'dark' ? 'system' : 'light'))!);
</script>

<!-- Lives in the header (the `header` size container): the full picker when there is room, one cycling button when there is not. -->
<div role="radiogroup" aria-label="Color theme" class="hidden items-center rounded-full border bg-card p-0.5 @min-[18rem]/header:inline-flex">
	{#each options as { mode, label, icon: Icon } (mode)}
		<button
			type="button"
			role="radio"
			aria-checked={theme.mode === mode}
			aria-label={label}
			title={label}
			onclick={() => theme.set(mode)}
			class={cn(
				'grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
				theme.mode === mode && 'bg-primary text-primary-foreground hover:text-primary-foreground'
			)}
		>
			<Icon class="size-3.5" />
		</button>
	{/each}
</div>
<button
	type="button"
	aria-label={`${current.label}. Switch to ${next.label.toLowerCase()}`}
	title={`${current.label} — switch to ${next.label.toLowerCase()}`}
	onclick={() => theme.cycle()}
	class="grid size-8 place-items-center rounded-full border bg-card text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none @min-[18rem]/header:hidden"
>
	<CurrentIcon class="size-3.5" />
</button>
