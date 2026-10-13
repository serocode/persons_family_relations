<script lang="ts">
	import { ArrowLeft, BookOpen, ChevronRight, PenLine, Target } from '@lucide/svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import AlacBanner from '$lib/components/AlacBanner.svelte';
	import AlacEssayEditor from '$lib/components/AlacEssayEditor.svelte';
	import McqQuizEngine from '$lib/components/McqQuizEngine.svelte';
	import StudyGuideViewer from '$lib/components/StudyGuideViewer.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Tabs from '$lib/components/ui/tabs';
	import { getModule } from '$lib/data/modules';
	import { userStorage } from '$lib/stores/storage.svelte';

	type TabId = 'guide' | 'mcq' | 'alac';

	const mod = $derived(getModule(page.params.slug ?? ''));
	const stats = $derived(mod ? userStorage.stats(mod.id) : null);

	const requested = $derived(page.url.searchParams.get('tab'));
	const tab = $derived<TabId>(
		requested === 'mcq' && mod?.mcqs.length ? 'mcq' : requested === 'alac' && mod?.essays.length ? 'alac' : 'guide'
	);

	function setTab(value: string) {
		const url = new URL(page.url.href);
		if (value === 'guide') url.searchParams.delete('tab');
		else url.searchParams.set('tab', value);
		goto(url, { replace: true, reset: false });
	}
</script>

<svelte:head>
	<title>{mod ? `${mod.title} — Subpoena Colada` : 'Module not found — Subpoena Colada'}</title>
</svelte:head>

{#if !mod}
	<div class="mx-auto max-w-md space-y-4 py-16 text-center">
		<h1 class="font-heading text-2xl font-semibold">Module not found</h1>
		<p class="text-muted-foreground">There's no subject called “{page.params.slug}”.</p>
		<Button href="/"><ArrowLeft /> Back to dashboard</Button>
	</div>
{:else}
	<div class="space-y-6">
		<div class="space-y-3">
			<nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
				<Button href="/" variant="ghost" size="sm" class="-ml-2.5"><ArrowLeft /> Dashboard</Button>
				<ChevronRight class="size-3.5" aria-hidden="true" />
				<span>{mod.subjectCategory}</span>
				<ChevronRight class="size-3.5" aria-hidden="true" />
				<span aria-current="page" class="font-medium text-foreground">{mod.title}</span>
			</nav>
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div class="space-y-1">
					{#if mod.eyebrow}<p class="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">{mod.eyebrow}</p>{/if}
					<h1 class="font-heading text-2xl font-semibold sm:text-3xl">{mod.title}</h1>
					<p class="text-sm text-muted-foreground">{mod.legalScope}</p>
				</div>
				{#if stats && (mod.mcqs.length || mod.essays.length)}
					<div class="flex flex-wrap gap-1.5">
						<Badge variant="secondary" class="tabular-nums">{stats.attempted}/{mod.mcqs.length} answered{stats.attempted ? ` · ${stats.accuracy}%` : ''}</Badge>
						<Badge variant="secondary" class="tabular-nums">{stats.mastered}/{mod.essays.length} mastered</Badge>
					</div>
				{/if}
			</div>
		</div>

		<Tabs.Root value={tab} onValueChange={setTab} class="gap-5">
			<Tabs.List class="h-auto w-full flex-wrap justify-start sm:w-fit">
				<Tabs.Trigger value="guide" class="gap-1.5 px-3 py-1.5"><BookOpen /> <span><span class="hidden sm:inline">Study Guide &amp; Case Digests</span><span class="sm:hidden">Guide</span></span></Tabs.Trigger>
				<Tabs.Trigger value="mcq" disabled={!mod.mcqs.length} class="gap-1.5 px-3 py-1.5"><Target /> <span><span class="hidden sm:inline">MCQ Practice Engine</span><span class="sm:hidden">MCQs</span></span></Tabs.Trigger>
				<Tabs.Trigger value="alac" disabled={!mod.essays.length} class="gap-1.5 px-3 py-1.5"><PenLine /> <span><span class="hidden sm:inline">ALAC Essay Exercises</span><span class="sm:hidden">Essays</span></span></Tabs.Trigger>
			</Tabs.List>

			{#key mod.id}
				<Tabs.Content value="guide"><StudyGuideViewer lawModule={mod} /></Tabs.Content>
				<Tabs.Content value="mcq"><McqQuizEngine lawModule={mod} /></Tabs.Content>
				<Tabs.Content value="alac">
					<div class="space-y-6">
						<AlacBanner compact />
						<AlacEssayEditor lawModule={mod} />
					</div>
				</Tabs.Content>
			{/key}
		</Tabs.Root>

		{#if !mod.mcqs.length && !mod.essays.length}
			<p class="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
				This is a reference module — it has case digests and no practice questions. Pair it with the Persons &amp; Family Relations MCQs and essays.
			</p>
		{/if}
	</div>
{/if}
