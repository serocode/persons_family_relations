<script lang="ts">
	import { Scale, Settings, Download, Upload, Trash2, TriangleAlert, Target, PenLine } from '@lucide/svelte';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import ThemeToggle from './ThemeToggle.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { totals } from '$lib/data/modules';

	const stats = $derived(userStorage.stats());

	let settingsOpen = $state(false);
	let confirmReset = $state(false);
	let importError = $state('');
	let importOk = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();

	function exportProgress() {
		const blob = new Blob([userStorage.exportJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `subpoena-colada-progress-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function onImport(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		importError = '';
		importOk = false;
		if (!file) return;
		try {
			userStorage.importJson(await file.text());
			importOk = true;
		} catch (err) {
			importError = err instanceof Error ? err.message : 'Could not read that file.';
		}
		input.value = '';
	}

	function doReset() {
		userStorage.resetAllProgress();
		confirmReset = false;
		settingsOpen = false;
	}

	$effect(() => {
		if (!settingsOpen) {
			confirmReset = false;
			importError = '';
			importOk = false;
		}
	});
</script>

<header class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 no-print">
	<div class="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
		<a href="/" class="group flex items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-current={page.url.pathname === '/' ? 'page' : undefined}>
			<span class="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
				<Scale class="size-4" />
			</span>
			<span class="font-heading text-[0.95rem] leading-none font-semibold tracking-wide sm:text-base">Subpoena Colada</span>
		</a>

		<div class="ml-auto hidden items-center gap-2 md:flex" aria-label="Your progress">
			<span class="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground" title="Questions answered / accuracy">
				<Target class="size-3.5 text-blue" />
				<span class="font-medium text-foreground tabular-nums">{stats.attempted}</span>/{totals.mcqs}
				{#if stats.attempted}
					<span aria-hidden="true">·</span>
					<span class="font-medium text-foreground tabular-nums">{stats.accuracy}%</span>
				{/if}
			</span>
			<span class="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground" title="ALAC essays mastered">
				<PenLine class="size-3.5 text-green" />
				<span class="font-medium text-foreground tabular-nums">{stats.mastered}</span>/{totals.essays} mastered
			</span>
		</div>

		<div class="ml-auto flex items-center gap-2 md:ml-0">
			<ThemeToggle />
			<Dialog.Root bind:open={settingsOpen}>
				<Dialog.Trigger>
					{#snippet child({ props })}
						<Button {...props} variant="ghost" size="icon" aria-label="Progress and data settings">
							<Settings />
						</Button>
					{/snippet}
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-md">
					<Dialog.Header>
						<Dialog.Title>Your progress</Dialog.Title>
						<Dialog.Description>
							Everything is stored only in this browser — there is no account or server. Export a backup before clearing site data or switching devices.
						</Dialog.Description>
					</Dialog.Header>

					<dl class="grid grid-cols-2 gap-2 text-sm">
						<div class="rounded-lg border bg-muted/50 p-3">
							<dt class="text-xs text-muted-foreground">MCQs answered</dt>
							<dd class="text-lg font-semibold tabular-nums">{stats.attempted}<span class="text-sm font-normal text-muted-foreground"> / {totals.mcqs}</span></dd>
						</div>
						<div class="rounded-lg border bg-muted/50 p-3">
							<dt class="text-xs text-muted-foreground">Accuracy</dt>
							<dd class="text-lg font-semibold tabular-nums">{stats.attempted ? `${stats.accuracy}%` : '—'}</dd>
						</div>
						<div class="rounded-lg border bg-muted/50 p-3">
							<dt class="text-xs text-muted-foreground">Essays drafted</dt>
							<dd class="text-lg font-semibold tabular-nums">{stats.essaysStarted}<span class="text-sm font-normal text-muted-foreground"> / {totals.essays}</span></dd>
						</div>
						<div class="rounded-lg border bg-muted/50 p-3">
							<dt class="text-xs text-muted-foreground">Bookmarks</dt>
							<dd class="text-lg font-semibold tabular-nums">{userStorage.bookmarks.length}</dd>
						</div>
					</dl>

					{#if userStorage.persistError}
						<p class="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive" role="alert">
							<TriangleAlert class="mt-0.5 size-4 shrink-0" />
							This browser is blocking saves (private mode or full storage). Progress will be lost when you close the tab — export a backup.
						</p>
					{/if}

					<div class="flex flex-wrap gap-2">
						<Button variant="outline" onclick={exportProgress}><Download /> Export backup</Button>
						<Button variant="outline" onclick={() => fileInput?.click()}><Upload /> Import backup</Button>
						<input bind:this={fileInput} type="file" accept="application/json,.json" class="hidden" onchange={onImport} />
					</div>
					{#if importError}
						<p class="text-sm text-destructive" role="alert">{importError}</p>
					{:else if importOk}
						<p class="text-sm text-green" role="status">Progress imported.</p>
					{/if}

					<Dialog.Footer class="sm:justify-between">
						{#if confirmReset}
							<span class="self-center text-sm text-destructive">Erase all answers, drafts and bookmarks?</span>
							<div class="flex gap-2">
								<Button variant="ghost" onclick={() => (confirmReset = false)}>Cancel</Button>
								<Button variant="destructive" onclick={doReset}>Yes, erase</Button>
							</div>
						{:else}
							<Button variant="destructive" onclick={() => (confirmReset = true)}><Trash2 /> Reset all progress</Button>
							<Dialog.Close>
								{#snippet child({ props })}
									<Button {...props} variant="outline">Done</Button>
								{/snippet}
							</Dialog.Close>
						{/if}
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>
</header>
