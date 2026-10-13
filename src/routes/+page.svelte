<script lang="ts">
	import { ArrowRight, BookOpen, FileText, Gavel, Layers, PenLine, Target } from '@lucide/svelte';
	import AlacBanner from '$lib/components/AlacBanner.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { CATEGORY_ACCENT, CATEGORY_FILTERS, matchesCategory, modules, totals, type CategoryFilter } from '$lib/data/modules';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { cn, pct } from '$lib/utils';

	let category = $state<CategoryFilter>('All');

	const stats = $derived(userStorage.stats());
	const shown = $derived(modules.filter((m) => matchesCategory(m.subjectCategory, category)));

	const ACCENT = {
		blue: { bar: 'bg-blue', text: 'text-blue', fill: '[&>div]:bg-blue' },
		purple: { bar: 'bg-purple', text: 'text-purple', fill: '[&>div]:bg-purple' },
		red: { bar: 'bg-red', text: 'text-red', fill: '[&>div]:bg-red' },
		green: { bar: 'bg-green', text: 'text-green', fill: '[&>div]:bg-green' }
	} as const;

	function completion(id: string, mcqs: number, essays: number) {
		const s = userStorage.stats(id);
		return { ...s, percent: pct(s.attempted + s.mastered, mcqs + essays) };
	}
</script>

<div class="space-y-8">
	<section class="space-y-2">
		<p class="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">Situational MCQ &amp; ALAC essay practice</p>
		<h1 class="font-heading text-3xl font-semibold sm:text-4xl">Subpoena Colada</h1>
		<p class="max-w-2xl text-muted-foreground">
			Practice bar-style questions, write ALAC essays against model answers, and review color-coded codal guides — offline, with your progress saved in this browser.
		</p>
	</section>

	<!-- Stats -->
	<section aria-label="Overview" class="grid gap-3 sm:grid-cols-3">
		<Card.Root class="gap-2 py-4">
			<Card.Content class="flex items-start gap-3 px-4">
				<span class="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><Layers class="size-5" /></span>
				<div>
					<p class="text-xs text-muted-foreground">Modules available</p>
					<p class="text-2xl font-semibold tabular-nums">{totals.modules}</p>
					<p class="text-xs text-muted-foreground tabular-nums">{totals.cases} case digests</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="gap-2 py-4">
			<Card.Content class="flex items-start gap-3 px-4">
				<span class="grid size-10 shrink-0 place-items-center rounded-lg bg-blue/15 text-blue"><Target class="size-5" /></span>
				<div class="min-w-0 flex-1">
					<p class="text-xs text-muted-foreground">Total MCQs</p>
					<p class="text-2xl font-semibold tabular-nums">{totals.mcqs}</p>
					<p class="text-xs text-muted-foreground tabular-nums">
						{stats.attempted} attempted{#if stats.attempted}&nbsp;·&nbsp;<span class="font-medium text-foreground">{stats.accuracy}%</span> accuracy{/if}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root class="gap-2 py-4">
			<Card.Content class="flex items-start gap-3 px-4">
				<span class="grid size-10 shrink-0 place-items-center rounded-lg bg-green/15 text-green"><PenLine class="size-5" /></span>
				<div>
					<p class="text-xs text-muted-foreground">ALAC essays</p>
					<p class="text-2xl font-semibold tabular-nums">{totals.essays}</p>
					<p class="text-xs text-muted-foreground tabular-nums">{stats.mastered} mastered{#if stats.needsReview}&nbsp;·&nbsp;{stats.needsReview} to review{/if}</p>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<AlacBanner />

	<!-- Modules -->
	<section aria-labelledby="modules-h" class="space-y-4">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<h2 id="modules-h" class="font-heading text-2xl font-semibold">Subjects</h2>
			<div role="group" aria-label="Filter by subject category" class="flex flex-wrap gap-1.5">
				{#each CATEGORY_FILTERS as c (c)}
					<Button variant={category === c ? 'default' : 'outline'} size="sm" aria-pressed={category === c} onclick={() => (category = c)}>{c}</Button>
				{/each}
			</div>
		</div>

		<ul class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each shown as m (m.id)}
				{@const accent = ACCENT[CATEGORY_ACCENT[m.subjectCategory]]}
				{@const prog = completion(m.id, m.mcqs.length, m.essays.length)}
				{@const hasPractice = m.mcqs.length + m.essays.length > 0}
				<li class="flex">
					<Card.Root class="w-full overflow-hidden transition-shadow hover:shadow-md">
						<div class={cn('h-1.5', accent.bar)}></div>
						<Card.Header class="gap-1.5">
							<p class={cn('text-[0.7rem] font-semibold tracking-wider uppercase', accent.text)}>{m.subjectCategory}</p>
							<Card.Title class="font-heading text-xl leading-snug">{m.title}</Card.Title>
							<p class="text-xs font-medium text-muted-foreground">{m.legalScope}</p>
						</Card.Header>
						<Card.Content class="flex-1 space-y-4">
							<p class="text-sm leading-relaxed text-muted-foreground">{m.description}</p>
							<div class="flex flex-wrap gap-1.5">
								{#if m.mcqs.length}<Badge variant="secondary" class="gap-1"><Target /> {m.mcqs.length} MCQs</Badge>{/if}
								{#if m.essays.length}<Badge variant="secondary" class="gap-1"><PenLine /> {m.essays.length} essays</Badge>{/if}
								{#if m.cases?.length}<Badge variant="secondary" class="gap-1"><Gavel /> {m.cases.length} case digests</Badge>{/if}
								{#if !m.mcqs.length && !m.essays.length}<Badge variant="secondary" class="gap-1"><BookOpen /> Reference</Badge>{/if}
								<Badge variant="outline" class="gap-1"><FileText /> Study guide</Badge>
							</div>
							{#if hasPractice}
								<div class="space-y-1.5">
									<div class="flex justify-between text-xs">
										<span class="text-muted-foreground">Completion</span>
										<span class="font-medium tabular-nums">{prog.percent}%</span>
									</div>
									<Progress value={prog.percent} class={cn('h-2', accent.fill)} aria-label="{m.title} completion" />
									<p class="text-xs text-muted-foreground tabular-nums">
										{prog.attempted}/{m.mcqs.length} answered{#if prog.attempted}&nbsp;({prog.accuracy}% correct){/if} · {prog.mastered}/{m.essays.length} essays mastered
									</p>
								</div>
							{/if}
						</Card.Content>
						<Card.Footer>
							<Button href="/module/{m.id}" class="w-full" size="lg">
								{prog.attempted || prog.essaysStarted ? 'Continue' : 'Open module'} <ArrowRight />
							</Button>
						</Card.Footer>
					</Card.Root>
				</li>
			{/each}
		</ul>
	</section>
</div>
