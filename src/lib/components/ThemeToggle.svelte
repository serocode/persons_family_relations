<script lang="ts">
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { theme, type ThemeMode } from '$lib/stores/theme.svelte';
	import { cn } from '$lib/utils';

	const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
		{ mode: 'light', label: 'Light theme', icon: Sun },
		{ mode: 'system', label: 'System theme', icon: Monitor },
		{ mode: 'dark', label: 'Dark theme', icon: Moon }
	];
</script>

<div role="radiogroup" aria-label="Color theme" class="inline-flex items-center rounded-full border bg-card p-0.5">
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
