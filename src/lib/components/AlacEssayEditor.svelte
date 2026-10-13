<script lang="ts">
	import { BookCheck, ChevronLeft, ChevronRight, CircleCheck, Eraser, EyeOff, Eye, Flag, Save, ScrollText } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { ALAC_FIELDS, draftHasContent, draftWordCount, type AlacKey } from '$lib/alac';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { cn } from '$lib/utils';
	import type { AlacEssay, LawModule } from '$lib/types';

	let { lawModule }: { lawModule: LawModule } = $props();

	type Status = 'mastered' | 'review' | 'drafted' | 'new';
	type StatusFilter = 'all' | Status;

	const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'new', label: 'Not started' },
		{ id: 'drafted', label: 'In progress' },
		{ id: 'review', label: 'Needs review' },
		{ id: 'mastered', label: 'Mastered' }
	];

	function statusOf(id: string): Status {
		const d = userStorage.essayDrafts[id];
		if (d?.isMastered) return 'mastered';
		if (d?.needsReview) return 'review';
		if (draftHasContent(d)) return 'drafted';
		return 'new';
	}

	let filter = $state<StatusFilter>('all');
	// svelte-ignore state_referenced_locally — the page re-mounts this component per module via {#key}
	let selectedId = $state(lawModule.essays[0]?.id ?? '');
	let showModel = $state(false);
	let confirmClear = $state(false);

	const counts = $derived.by(() => {
		const c: Record<StatusFilter, number> = { all: lawModule.essays.length, new: 0, drafted: 0, review: 0, mastered: 0 };
		for (const e of lawModule.essays) c[statusOf(e.id)]++;
		return c;
	});

	/** The list keeps the selected essay visible even if its status no longer matches the filter. */
	const visible = $derived(lawModule.essays.filter((e) => filter === 'all' || statusOf(e.id) === filter || e.id === selectedId));
	const groups = $derived.by(() => {
		const map = new Map<string, AlacEssay[]>();
		for (const e of visible) map.set(e.topic, [...(map.get(e.topic) ?? []), e]);
		return [...map.entries()];
	});

	const essay = $derived(lawModule.essays.find((e) => e.id === selectedId) ?? lawModule.essays[0]);
	const position = $derived(visible.findIndex((e) => e.id === essay?.id));
	const draft = $derived(essay ? userStorage.essayDrafts[essay.id] : undefined);
	const words = $derived(draftWordCount(draft));
	const savedAt = $derived(draft ? new Date(draft.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }) : '');

	function select(id: string) {
		selectedId = id;
		showModel = false;
		scrollTo({ top: 0, behavior: 'smooth' });
	}
	function step(delta: number) {
		const next = visible[position + delta];
		if (next) select(next.id);
	}

	function onInput(key: AlacKey, e: Event) {
		if (!essay) return;
		userStorage.saveEssayDraft(essay.id, { [key]: (e.currentTarget as HTMLTextAreaElement).value });
	}

	function setMastery(kind: 'mastered' | 'review') {
		if (!essay) return;
		const s = statusOf(essay.id);
		if (kind === 'mastered') userStorage.saveEssayDraft(essay.id, { isMastered: s !== 'mastered', needsReview: false });
		else userStorage.saveEssayDraft(essay.id, { needsReview: s !== 'review', isMastered: false });
	}

	function clearDraft() {
		if (essay) userStorage.clearEssayDraft(essay.id);
		confirmClear = false;
	}

	const STATUS_UI: Record<Status, { label: string; dot: string }> = {
		mastered: { label: 'Mastered', dot: 'bg-green' },
		review: { label: 'Needs review', dot: 'bg-orange' },
		drafted: { label: 'In progress', dot: 'bg-blue' },
		new: { label: 'Not started', dot: 'bg-border' }
	};
</script>

{#if !essay}
	<p class="rounded-xl border bg-card p-8 text-center text-muted-foreground">No ALAC essay exercises for this subject.</p>
{:else}
	<div class="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
		<!-- Essay picker -->
		<aside class="space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:pr-1" aria-label="Essay problems">
			<div role="group" aria-label="Filter problems by status" class="flex flex-wrap gap-1.5">
				{#each STATUS_FILTERS as f (f.id)}
					<button
						type="button"
						aria-pressed={filter === f.id}
						onclick={() => (filter = f.id)}
						class={cn(
							'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
							filter === f.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
						)}
					>
						{f.label} <span class="tabular-nums opacity-70">{counts[f.id]}</span>
					</button>
				{/each}
			</div>

			<!-- Phones & tablets: compact native picker -->
			<label class="block lg:hidden">
				<span class="sr-only">Choose a problem</span>
				<select
					class="h-10 w-full rounded-lg border bg-card px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					value={essay.id}
					onchange={(e) => select(e.currentTarget.value)}
				>
					{#each groups as [topic, items] (topic)}
						<optgroup label={topic}>
							{#each items as e (e.id)}
								<option value={e.id}>{e.title} — {STATUS_UI[statusOf(e.id)].label}</option>
							{/each}
						</optgroup>
					{/each}
				</select>
			</label>

			<!-- Desktop: full outline -->
			<nav class="hidden space-y-4 lg:block">
				{#each groups as [topic, items] (topic)}
					<div>
						<p class="mb-1 px-2 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">{topic}</p>
						<ul class="space-y-0.5">
							{#each items as e (e.id)}
								{@const st = statusOf(e.id)}
								<li>
									<button
										type="button"
										onclick={() => select(e.id)}
										aria-current={e.id === essay.id ? 'true' : undefined}
										class={cn(
											'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
											e.id === essay.id && 'bg-accent font-medium'
										)}
									>
										<span class={cn('size-2 shrink-0 rounded-full', STATUS_UI[st].dot)} aria-hidden="true"></span>
										<span class="min-w-0 flex-1 truncate">{e.title.replace(/^.*— /, '')}</span>
										<span class="sr-only">{STATUS_UI[st].label}</span>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</nav>
		</aside>

		<!-- Workspace -->
		<div class="min-w-0 space-y-5">
			{#key essay.id}
				<header class="flex flex-wrap items-center justify-between gap-2">
					<div>
						<p class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{essay.topic}</p>
						<h2 class="font-heading text-xl font-semibold">{essay.title}</h2>
					</div>
					<Badge variant="outline" class="gap-1.5"><span class={cn('size-2 rounded-full', STATUS_UI[statusOf(essay.id)].dot)}></span>{STATUS_UI[statusOf(essay.id)].label}</Badge>
				</header>

				<!-- Fact pattern -->
				<Card.Root class="border-l-4 border-l-yellow bg-yellow/6">
					<Card.Header class="pb-0">
						<Card.Title class="flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase"><ScrollText class="size-4 text-yellow" /> Fact pattern</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-3 pt-3">
						<p class="font-serif text-[1.05rem] leading-relaxed sm:text-lg">{essay.factPattern}</p>
						{#if essay.question}
							<p class="border-t pt-3 text-sm font-semibold">{essay.question}</p>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Toolbar -->
				<div class="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border bg-card px-4 py-3">
					<p class="flex items-center gap-1.5 text-sm text-muted-foreground" aria-live="off">
						{#if draft && draftHasContent(draft)}
							<Save class="size-4 text-green" /> Draft saved · {savedAt}
						{:else}
							<Save class="size-4" /> Your answer saves automatically as you type
						{/if}
					</p>
					<p class="text-sm text-muted-foreground tabular-nums">{words} word{words === 1 ? '' : 's'}</p>

					<div class="ml-auto flex flex-wrap items-center gap-2">
						<Button variant={statusOf(essay.id) === 'review' ? 'default' : 'outline'} size="sm" aria-pressed={statusOf(essay.id) === 'review'} onclick={() => setMastery('review')}>
							<Flag /> Needs review
						</Button>
						<Button variant={statusOf(essay.id) === 'mastered' ? 'default' : 'outline'} size="sm" aria-pressed={statusOf(essay.id) === 'mastered'} onclick={() => setMastery('mastered')}>
							<BookCheck /> Mastered
						</Button>
						{#if draftHasContent(draft)}
							<Button variant="ghost" size="sm" onclick={() => (confirmClear = true)}><Eraser /> Clear</Button>
						{/if}
					</div>
				</div>

				<div class="flex items-center gap-3">
					<Switch id="reveal-{essay.id}" checked={showModel} onCheckedChange={(v) => (showModel = v)} />
					<label for="reveal-{essay.id}" class="flex cursor-pointer items-center gap-1.5 text-sm font-medium">
						{#if showModel}<EyeOff class="size-4" />{:else}<Eye class="size-4" />{/if}
						Reveal model ALAC answer
					</label>
					<span class="text-xs text-muted-foreground">Try it yourself first.</span>
				</div>

				<div class={cn('grid items-start gap-5', showModel && 'xl:grid-cols-2')}>
					<!-- Your answer -->
					<section aria-label="Your answer" class="space-y-4">
						{#each ALAC_FIELDS as f (f.key)}
							<div class="space-y-1.5">
								<label for="{essay.id}-{f.key}" class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
									<span class={cn('grid size-6 place-items-center rounded-md border font-heading text-sm font-bold', f.badge)} aria-hidden="true">{f.letter}</span>
									<span class="text-sm font-semibold">{f.name}</span>
									<span class="text-xs text-muted-foreground">{f.prompt}</span>
								</label>
								<Textarea
									id="{essay.id}-{f.key}"
									value={draft?.[f.key] ?? ''}
									oninput={(e) => onInput(f.key, e)}
									placeholder={f.placeholder}
									rows={f.key === 'answer' || f.key === 'conclusion' ? 2 : 4}
									spellcheck="true"
									class={cn('min-h-20 bg-card font-serif text-base leading-relaxed md:text-base', f.ring)}
								/>
							</div>
						{/each}
					</section>

					<!-- Model answer -->
					{#if showModel}
						<section aria-label="Model ALAC answer" class="space-y-3 rounded-xl border border-dashed bg-muted/40 p-4 xl:sticky xl:top-20">
							<h3 class="font-heading text-base font-semibold">Model answer</h3>
							{#each ALAC_FIELDS as f (f.key)}
								<div class="rounded-lg border bg-card p-3">
									<p class="mb-1.5 flex items-center gap-2 text-sm font-semibold">
										<span class={cn('grid size-5 place-items-center rounded border font-heading text-xs font-bold', f.badge)} aria-hidden="true">{f.letter}</span>{f.name}
									</p>
									<div class="rich font-serif text-[0.95rem] leading-relaxed">{@html essay.modelAnswer[f.key]}</div>
								</div>
							{/each}
							<p class="flex items-center gap-1.5 text-xs text-muted-foreground"><CircleCheck class="size-3.5" /> Compare your Legal Basis and Application line by line.</p>
						</section>
					{/if}
				</div>

				<div class="flex justify-between gap-2 border-t pt-4">
					<Button variant="outline" onclick={() => step(-1)} disabled={position <= 0}><ChevronLeft /> Previous</Button>
					<span class="self-center text-sm text-muted-foreground tabular-nums">{position + 1} / {visible.length}</span>
					<Button variant="outline" onclick={() => step(1)} disabled={position < 0 || position >= visible.length - 1}>Next <ChevronRight /></Button>
				</div>
			{/key}
		</div>
	</div>

	<Dialog.Root bind:open={confirmClear}>
		<Dialog.Content class="sm:max-w-sm">
			<Dialog.Header>
				<Dialog.Title>Clear this draft?</Dialog.Title>
				<Dialog.Description>Your four answer boxes and the mastery mark for this problem will be erased. This can't be undone.</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (confirmClear = false)}>Keep it</Button>
				<Button variant="destructive" onclick={clearDraft}>Clear draft</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
