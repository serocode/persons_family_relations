import type { HighlightColor, UserHighlight } from '$lib/types';

export const HIGHLIGHT_COLORS: readonly HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple'];

export const COLOR_NAMES: Record<HighlightColor, string> = { yellow: 'Yellow', green: 'Green', blue: 'Blue', pink: 'Pink', purple: 'Purple' };

/**
 * Starting labels, matching the color legend the study guides already use (pink stands in for the legend's red, which
 * reads as an error when laid over text). Readers rename them in the highlights panel.
 */
export const DEFAULT_HIGHLIGHT_LABELS: Record<HighlightColor, string> = {
	yellow: 'Memorize',
	green: 'Requisites',
	blue: 'Exceptions',
	pink: 'Jurisprudence',
	purple: 'Compare & contrast'
};

/** Marks an element a highlight can live in; the value is the highlight's `scope`. */
export const SCOPE_ATTR = 'data-hl-scope';

const CONTEXT = 32;

/** Painting needs the CSS Custom Highlight API (Chrome 105, Safari 17.2, Firefox 140). Anchoring works without it. */
export const canPaintHighlights = typeof CSS !== 'undefined' && 'highlights' in CSS && typeof Highlight !== 'undefined';

export const newHighlightId = (moduleId: string) =>
	`${moduleId}:${crypto.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`}`;

/** What painting depends on. Notes count only as present or absent, so typing one doesn't repaint the guide. */
export const paintKey = (hs: UserHighlight[]) =>
	hs.map((h) => `${h.id}:${h.color}:${h.note?.trim() ? 1 : 0}:${h.scope}:${h.start}:${h.quote}`).join('\n');

type Anchor = Pick<UserHighlight, 'quote' | 'prefix' | 'suffix' | 'start'>;

/** A scope's text with each whitespace run collapsed to one space, and the DOM position every character came from. */
interface TextMap {
	text: string;
	nodes: Text[];
	node: Uint32Array;
	offset: Uint32Array;
}

function buildTextMap(root: Element): TextMap {
	const nodes: Text[] = [];
	const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
	for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
	const total = nodes.reduce((sum, t) => sum + t.data.length, 0);
	const node = new Uint32Array(total);
	const offset = new Uint32Array(total);
	let text = '';
	let n = 0;
	let space = true; // drops leading whitespace
	nodes.forEach((t, i) => {
		const s = t.data;
		for (let j = 0; j < s.length; j++) {
			const c = s.charCodeAt(j);
			if (c <= 32 || c === 160) {
				if (space) continue;
				space = true;
				text += ' ';
			} else {
				space = false;
				text += s[j];
			}
			node[n] = i;
			offset[n] = j;
			n++;
		}
	});
	return { text, nodes, node: node.subarray(0, n), offset: offset.subarray(0, n) };
}

/** The part of `range` that falls inside `scope`, as a text anchor. Null if it holds no visible text. */
export function anchorFromRange(scope: Element, range: Range): Anchor | null {
	const map = buildTextMap(scope);
	const from = new Int32Array(map.nodes.length).fill(-1);
	const to = new Int32Array(map.nodes.length);
	map.nodes.forEach((t, i) => {
		if (!range.intersectsNode(t)) return;
		from[i] = t === range.startContainer ? range.startOffset : 0;
		to[i] = t === range.endContainer ? range.endOffset : t.data.length;
	});
	let start = -1;
	let end = -1;
	for (let k = 0; k < map.text.length; k++) {
		const i = map.node[k];
		if (from[i] !== -1 && map.offset[k] >= from[i] && map.offset[k] < to[i]) {
			if (start === -1) start = k;
			end = k + 1;
		}
	}
	if (start === -1) return null;
	const { text } = map;
	while (start < end && text[start] === ' ') start++;
	while (end > start && text[end - 1] === ' ') end--;
	if (start === end) return null;
	return { quote: text.slice(start, end), prefix: text.slice(Math.max(0, start - CONTEXT), start), suffix: text.slice(end, end + CONTEXT), start };
}

function sharedPrefix(a: string, b: string) {
	let i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;
	return i;
}

function sharedSuffix(a: string, b: string) {
	let i = 0;
	while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
	return i;
}

/** Where the quote sits now: the occurrence whose surroundings match best, then the one nearest where it was. */
function locate(text: string, a: Anchor) {
	if (!a.quote) return -1;
	let best = -1;
	let bestScore = -Infinity;
	for (let i = text.indexOf(a.quote); i !== -1; i = text.indexOf(a.quote, i + 1)) {
		const before = text.slice(Math.max(0, i - a.prefix.length), i);
		const after = text.slice(i + a.quote.length, i + a.quote.length + a.suffix.length);
		// Context is worth whole characters; distance only breaks ties (it is always below 1).
		const score = sharedSuffix(before, a.prefix) + sharedPrefix(after, a.suffix) - Math.abs(i - a.start) / (text.length + 1);
		if (score > bestScore) {
			best = i;
			bestScore = score;
		}
	}
	return best;
}

function rangeFromAnchor(map: TextMap, a: Anchor): Range | null {
	const i = locate(map.text, a);
	if (i === -1) return null;
	const j = i + a.quote.length - 1;
	const range = document.createRange();
	range.setStart(map.nodes[map.node[i]], map.offset[i]);
	range.setEnd(map.nodes[map.node[j]], map.offset[j] + 1);
	return range;
}

const PAINTED = [...HIGHLIGHT_COLORS.map((c) => `hl-${c}`), 'hl-note', 'hl-flash'];

/**
 * Paints one module's highlights over a rendered guide with the CSS Custom Highlight API, which colors text without
 * touching the DOM — so it can't fight the search marks or Svelte over the same nodes. Ranges go stale whenever the
 * DOM changes (search re-marks text, sections are filtered), so every mutation schedules a repaint.
 */
export class GuideHighlighter {
	/** Highlights whose text can no longer be found — the guide was edited, or the section or case is gone. */
	missing = $state<ReadonlySet<string>>(new Set());

	#source: () => UserHighlight[];
	#scopes: () => ReadonlySet<string>;
	#container: HTMLElement | null = null;
	#ranges = new Map<string, Range>();
	#found = new Map<string, boolean>();
	#raf = 0;
	#flashTimer: ReturnType<typeof setTimeout> | undefined;

	/** `scopes` is every scope the module has, rendered or not, so a section hidden by search isn't reported missing. */
	constructor(source: () => UserHighlight[], scopes: () => ReadonlySet<string>) {
		this.#source = source;
		this.#scopes = scopes;
	}

	/** Paints into `container` and keeps it painted. Returns the cleanup, for an $effect. */
	attach(container: HTMLElement) {
		this.#container = container;
		const observer = new MutationObserver(() => this.schedule());
		observer.observe(container, { childList: true, subtree: true, characterData: true });
		this.schedule();
		return () => {
			observer.disconnect();
			cancelAnimationFrame(this.#raf);
			this.#raf = 0;
			clearTimeout(this.#flashTimer);
			this.#container = null;
			this.#ranges.clear();
			if (canPaintHighlights) for (const name of PAINTED) CSS.highlights.delete(name);
		};
	}

	schedule() {
		if (this.#container && !this.#raf) this.#raf = requestAnimationFrame(() => this.#paint());
	}

	#paint() {
		this.#raf = 0;
		const container = this.#container;
		if (!container) return;
		const scopeEls = new Map<string, Element>();
		for (const el of container.querySelectorAll(`[${SCOPE_ATTR}]`)) scopeEls.set(el.getAttribute(SCOPE_ATTR)!, el);
		const known = this.#scopes();
		const maps = new Map<string, TextMap>();
		const byColor = Object.fromEntries(HIGHLIGHT_COLORS.map((c) => [c, [] as Range[]])) as Record<HighlightColor, Range[]>;
		const noted: Range[] = [];
		const ranges = new Map<string, Range>();
		const live = new Set<string>();
		let changed = false;

		for (const h of this.#source()) {
			live.add(h.id);
			const el = scopeEls.get(h.scope);
			let found: boolean | undefined; // undefined: not rendered right now, so we can't tell
			if (el) {
				let map = maps.get(h.scope);
				if (!map) maps.set(h.scope, (map = buildTextMap(el)));
				const range = rangeFromAnchor(map, h);
				found = !!range;
				if (range) {
					ranges.set(h.id, range);
					byColor[h.color]?.push(range);
					if (h.note?.trim()) noted.push(range);
				}
			} else if (!known.has(h.scope)) found = false;
			if (found !== undefined && this.#found.get(h.id) !== found) {
				this.#found.set(h.id, found);
				changed = true;
			}
		}
		for (const id of this.#found.keys()) {
			if (!live.has(id)) {
				this.#found.delete(id);
				changed = true;
			}
		}

		this.#ranges = ranges;
		if (canPaintHighlights) {
			for (const c of HIGHLIGHT_COLORS) CSS.highlights.set(`hl-${c}`, new Highlight(...byColor[c]));
			CSS.highlights.set('hl-note', new Highlight(...noted));
		}
		if (changed) this.missing = new Set([...this.#found].filter(([, f]) => !f).map(([id]) => id));
	}

	/** The highlight under a viewport point (the newest, where several overlap) and which of its line boxes was hit. */
	hitTest(x: number, y: number): { id: string; box: number } | null {
		const createdAt = new Map(this.#source().map((h) => [h.id, h.createdAt]));
		let best: { id: string; box: number; at: number } | null = null;
		for (const [id, range] of this.#ranges) {
			const rects = range.getClientRects();
			for (let box = 0; box < rects.length; box++) {
				const r = rects[box];
				if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
				const at = createdAt.get(id) ?? 0;
				if (!best || at > best.at) best = { id, box, at };
				break;
			}
		}
		return best && { id: best.id, box: best.box };
	}

	/** The painted range for a highlight, as of the last repaint. */
	painted(id: string): Range | undefined {
		return this.#ranges.get(id);
	}

	/** A range read from the DOM right now — null if the highlight's scope isn't rendered or its text is gone. */
	locate(h: UserHighlight): Range | null {
		const el = this.#container?.querySelector(`[${SCOPE_ATTR}="${CSS.escape(h.scope)}"]`);
		return el ? rangeFromAnchor(buildTextMap(el), h) : null;
	}

	/** Briefly calls attention to a range, after jumping to it. */
	flash(range: Range) {
		if (!canPaintHighlights) return;
		const hl = new Highlight(range);
		hl.priority = 1;
		CSS.highlights.set('hl-flash', hl);
		clearTimeout(this.#flashTimer);
		this.#flashTimer = setTimeout(() => CSS.highlights.delete('hl-flash'), 1600);
	}
}
