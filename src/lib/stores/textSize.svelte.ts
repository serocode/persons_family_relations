/**
 * Text size, applied as a percentage of the browser's own default on <html>. Every size in the app is in rem, so text,
 * spacing and controls all scale together and the reader's browser setting still counts.
 * Keep TEXT_SIZES in step with the pre-paint script in src/app.html.
 */
export const TEXT_SIZES = [87.5, 100, 112.5, 125, 137.5, 150] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

const KEY = 'law_text_size';
const DEFAULT: TextSize = 100;

const isTextSize = (v: number): v is TextSize => (TEXT_SIZES as readonly number[]).includes(v);

function read(): TextSize {
	try {
		const saved = Number(localStorage.getItem(KEY));
		return isTextSize(saved) ? saved : DEFAULT;
	} catch {
		return DEFAULT;
	}
}

function apply(size: TextSize) {
	document.documentElement.style.fontSize = size === DEFAULT ? '' : `${size}%`;
}

/** Sticky and fixed elements (the study guide's search bar, for one) stay put while the page reflows, so they cannot anchor it. */
function isPinned(el: Element) {
	for (let e: Element | null = el; e && e.id !== 'main'; e = e.parentElement) {
		const position = getComputedStyle(e).position;
		if (position === 'sticky' || position === 'fixed') return true;
	}
	return false;
}

/**
 * The line the reader is on: a point just below the sticky header, recorded as a fraction of the height of the
 * smallest content element under it, so the same line can be put back under the header after the page rescales.
 */
function readingAnchor() {
	const header = document.querySelector('header');
	const top = header?.getBoundingClientRect().bottom ?? 0;
	for (const dy of [8, 32, 64, 128]) {
		const el = document
			.elementsFromPoint(window.innerWidth / 2, top + dy)
			.find((e) => e.closest('#main') && e.getBoundingClientRect().height < window.innerHeight / 2 && !isPinned(e));
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		return { el, header, dy, fraction: (top + dy - rect.top) / rect.height };
	}
	return undefined;
}

class TextSizeStore {
	size = $state<TextSize>(DEFAULT);
	index = $derived(TEXT_SIZES.indexOf(this.size));
	canDecrease = $derived(this.index > 0);
	canIncrease = $derived(this.index < TEXT_SIZES.length - 1);
	isDefault = $derived(this.size === DEFAULT);

	constructor() {
		if (typeof window === 'undefined') return;
		this.size = read();
		apply(this.size);
		// Keep several open tabs at the same size.
		window.addEventListener('storage', (e) => {
			if (e.key !== KEY && e.key !== null) return;
			this.size = read();
			apply(this.size);
		});
	}

	set(size: TextSize) {
		if (size === this.size) return;
		// Rescaling reflows the page; hold the line being read at the same place under the header.
		const anchor = window.scrollY > 0 ? readingAnchor() : undefined;
		this.size = size;
		apply(size);
		if (anchor) {
			const top = anchor.header?.getBoundingClientRect().bottom ?? 0;
			const rect = anchor.el.getBoundingClientRect();
			const delta = rect.top + anchor.fraction * rect.height - (top + anchor.dy);
			window.scrollTo({ top: window.scrollY + delta, behavior: 'instant' });
		}
		try {
			if (size === DEFAULT) localStorage.removeItem(KEY);
			else localStorage.setItem(KEY, String(size));
		} catch {
			/* storage unavailable: the size still applies for this visit */
		}
	}

	increase() {
		if (this.canIncrease) this.set(TEXT_SIZES[this.index + 1]);
	}

	decrease() {
		if (this.canDecrease) this.set(TEXT_SIZES[this.index - 1]);
	}

	reset() {
		this.set(DEFAULT);
	}
}

export const textSize = new TextSizeStore();
