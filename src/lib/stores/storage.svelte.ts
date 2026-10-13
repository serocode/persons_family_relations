import type { UserEssayDraft, UserMcqAttempt } from '$lib/types';

const KEYS = {
	mcq: 'law_mcq_attempts',
	essay: 'law_essay_drafts',
	bookmarks: 'law_bookmarks'
} as const;

const PERSIST_DELAY_MS = 300;

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Parses a stored JSON blob, returning `fallback` if it is missing or the wrong shape. */
function readJson<T>(key: string, valid: (v: unknown) => v is T, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		const parsed: unknown = JSON.parse(raw);
		return valid(parsed) ? parsed : fallback;
	} catch (e) {
		console.error(`Failed to read ${key} from localStorage`, e);
		return fallback;
	}
}

export interface ProgressStats {
	attempted: number;
	correct: number;
	accuracy: number;
	essaysStarted: number;
	mastered: number;
	needsReview: number;
}

class StorageStore {
	mcqAttempts = $state<Record<string, UserMcqAttempt>>({});
	essayDrafts = $state<Record<string, UserEssayDraft>>({});
	bookmarks = $state<string[]>([]);
	isLoaded = $state(false);
	/** Set when the browser refuses a write (private mode, quota). Progress then lives only in memory. */
	persistError = $state(false);

	private timer: ReturnType<typeof setTimeout> | undefined;
	private pending: Record<string, string> = {};
	/** Set while applying data that came *from* storage, so we don't echo it straight back (cross-tab ping-pong). */
	private skipPersist = false;

	constructor() {
		if (typeof window === 'undefined') return;
		this.loadFromStorage();

		$effect.root(() => {
			$effect(() => {
				if (!this.isLoaded) return;
				// Reading everything here is what subscribes the effect to deep changes.
				this.pending[KEYS.mcq] = JSON.stringify(this.mcqAttempts);
				this.pending[KEYS.essay] = JSON.stringify(this.essayDrafts);
				this.pending[KEYS.bookmarks] = JSON.stringify(this.bookmarks);
				if (this.skipPersist) {
					this.skipPersist = false;
					this.pending = {};
					return;
				}
				clearTimeout(this.timer);
				this.timer = setTimeout(() => this.flush(), PERSIST_DELAY_MS);
			});
		});

		// Don't lose the last keystrokes when the tab closes or is backgrounded on mobile.
		window.addEventListener('pagehide', () => this.flush());
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'hidden') this.flush();
		});
		// Keep several open tabs consistent.
		window.addEventListener('storage', (e) => {
			if (e.key === null || Object.values(KEYS).includes(e.key as (typeof KEYS)[keyof typeof KEYS])) {
				clearTimeout(this.timer);
				this.pending = {};
				this.skipPersist = true;
				this.loadFromStorage();
			}
		});
	}

	private loadFromStorage() {
		this.mcqAttempts = readJson(KEYS.mcq, isRecord as (v: unknown) => v is Record<string, UserMcqAttempt>, {});
		this.essayDrafts = readJson(KEYS.essay, isRecord as (v: unknown) => v is Record<string, UserEssayDraft>, {});
		this.bookmarks = readJson(KEYS.bookmarks, (v): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string'), []);
		this.isLoaded = true;
	}

	private flush() {
		clearTimeout(this.timer);
		const entries = Object.entries(this.pending);
		if (!entries.length) return;
		this.pending = {};
		try {
			for (const [k, v] of entries) localStorage.setItem(k, v);
			this.persistError = false;
		} catch (e) {
			console.error('Failed to save to localStorage', e);
			this.persistError = true;
		}
	}

	recordMcqAttempt(questionId: string, selectedIndex: number, isCorrect: boolean) {
		this.mcqAttempts[questionId] = { questionId, selectedIndex, isCorrect, timestamp: Date.now() };
	}

	clearMcqAttempt(questionId: string) {
		delete this.mcqAttempts[questionId];
	}

	saveEssayDraft(essayId: string, draft: Partial<UserEssayDraft>) {
		const existing = this.essayDrafts[essayId] ?? {
			essayId,
			answer: '',
			legalBasis: '',
			application: '',
			conclusion: '',
			isMastered: false,
			updatedAt: Date.now()
		};
		this.essayDrafts[essayId] = { ...existing, ...draft, essayId, updatedAt: Date.now() };
	}

	clearEssayDraft(essayId: string) {
		delete this.essayDrafts[essayId];
	}

	isBookmarked(id: string) {
		return this.bookmarks.includes(id);
	}

	toggleBookmark(id: string) {
		this.bookmarks = this.bookmarks.includes(id) ? this.bookmarks.filter((b) => b !== id) : [...this.bookmarks, id];
	}

	/** Totals for one module, or for everything when `moduleId` is omitted. IDs are `<moduleId>:…`. */
	stats(moduleId?: string): ProgressStats {
		const prefix = moduleId ? `${moduleId}:` : '';
		let attempted = 0;
		let correct = 0;
		for (const [id, a] of Object.entries(this.mcqAttempts)) {
			if (!id.startsWith(prefix)) continue;
			attempted++;
			if (a.isCorrect) correct++;
		}
		let essaysStarted = 0;
		let mastered = 0;
		let needsReview = 0;
		for (const [id, d] of Object.entries(this.essayDrafts)) {
			if (!id.startsWith(prefix)) continue;
			if (d.isMastered) mastered++;
			else if (d.needsReview) needsReview++;
			if (d.answer || d.legalBasis || d.application || d.conclusion || d.isMastered) essaysStarted++;
		}
		return { attempted, correct, accuracy: attempted ? Math.round((correct / attempted) * 100) : 0, essaysStarted, mastered, needsReview };
	}

	exportJson() {
		return JSON.stringify(
			{
				app: 'subpoena-colada',
				version: 1,
				exportedAt: new Date().toISOString(),
				mcqAttempts: this.mcqAttempts,
				essayDrafts: this.essayDrafts,
				bookmarks: this.bookmarks
			},
			null,
			2
		);
	}

	/** Replaces current progress with an exported file. Throws if the file is not a valid export. */
	importJson(text: string) {
		const data: unknown = JSON.parse(text);
		if (!isRecord(data) || (data.app !== 'subpoena-colada' && data.app !== 'law-reviewer') || !isRecord(data.mcqAttempts) || !isRecord(data.essayDrafts) || !Array.isArray(data.bookmarks)) {
			throw new Error('This file is not a Subpoena Colada progress export.');
		}
		this.mcqAttempts = data.mcqAttempts as Record<string, UserMcqAttempt>;
		this.essayDrafts = data.essayDrafts as Record<string, UserEssayDraft>;
		this.bookmarks = data.bookmarks.filter((b): b is string => typeof b === 'string');
	}

	resetAllProgress() {
		this.mcqAttempts = {};
		this.essayDrafts = {};
		this.bookmarks = [];
		if (typeof window !== 'undefined') {
			// Only our own keys — localStorage.clear() would also wipe the theme and any other app on this origin.
			clearTimeout(this.timer);
			this.pending = {};
			try {
				Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
			} catch (e) {
				console.error('Failed to clear localStorage', e);
			}
		}
	}
}

export const userStorage = new StorageStore();
