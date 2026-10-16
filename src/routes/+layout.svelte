<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import HeaderNav from '$lib/components/HeaderNav.svelte';
	import { userStorage } from '$lib/stores/storage.svelte';
	import { textSize } from '$lib/stores/textSize.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Touch the stores once so persistence, theme and text-size listeners are live app-wide.
	$effect(() => {
		void userStorage.isLoaded;
		void theme.resolved;
		void textSize.size;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Subpoena Colada — Philippine Law Study Guide</title>
</svelte:head>

<a href="#main" class="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2">Skip to content</a>
<HeaderNav />
<main id="main" class="@container/main mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
	{@render children()}
</main>
<footer class="mx-auto max-w-7xl px-4 pb-10 text-center text-xs text-muted-foreground sm:px-6 no-print">
	Study aid only — not a substitute for the full codal text. Your answers, drafts and bookmarks stay in this browser.
	<a href="/legacy/index.html" class="underline underline-offset-2 hover:text-foreground">Previous version</a>
</footer>
