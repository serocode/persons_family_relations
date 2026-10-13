export type ThemeMode = 'light' | 'dark' | 'system';

const KEY = 'law_theme';

class ThemeStore {
	mode = $state<ThemeMode>('system');
	systemDark = $state(false);
	resolved = $derived<'light' | 'dark'>(this.mode === 'system' ? (this.systemDark ? 'dark' : 'light') : this.mode);

	constructor() {
		if (typeof window === 'undefined') return;
		try {
			const saved = localStorage.getItem(KEY);
			if (saved === 'light' || saved === 'dark' || saved === 'system') this.mode = saved;
		} catch {
			/* storage unavailable: stay on system */
		}
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		this.systemDark = mq.matches;
		mq.addEventListener('change', (e) => (this.systemDark = e.matches));

		$effect.root(() => {
			$effect(() => {
				const dark = this.resolved === 'dark';
				document.documentElement.classList.toggle('dark', dark);
				document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
			});
		});
	}

	set(mode: ThemeMode) {
		this.mode = mode;
		try {
			localStorage.setItem(KEY, mode);
		} catch {
			/* ignore */
		}
	}

	cycle() {
		this.set(this.mode === 'light' ? 'dark' : this.mode === 'dark' ? 'system' : 'light');
	}
}

export const theme = new ThemeStore();
