import type { LawModule, SubjectCategory } from '$lib/types';
import { pfr } from './pfr';
import { pfrCases } from './pfr_cases';
import { consti1 } from './consti1';
import { crim1 } from './crim1';
import { statcon } from './statcon';

/** Master index, in the order shown on the dashboard. A module's `id` is also its URL slug. */
export const modules: LawModule[] = [pfr, pfrCases, consti1, crim1, statcon];

export function getModule(slug: string): LawModule | undefined {
	return modules.find((m) => m.id === slug);
}

export type CategoryFilter = 'All' | 'Civil Law' | 'Political Law' | 'Criminal Law' | 'Legal Method';
export const CATEGORY_FILTERS: CategoryFilter[] = ['All', 'Civil Law', 'Political Law', 'Criminal Law', 'Legal Method'];

/** The supplement belongs under Civil Law for filtering. */
export function matchesCategory(category: SubjectCategory, filter: CategoryFilter) {
	return filter === 'All' || category === filter || (filter === 'Civil Law' && category === 'Civil Law — Supplement');
}

export const totals = {
	modules: modules.length,
	mcqs: modules.reduce((n, m) => n + m.mcqs.length, 0),
	essays: modules.reduce((n, m) => n + m.essays.length, 0),
	cases: modules.reduce((n, m) => n + (m.cases?.length ?? 0), 0)
};

/** Accent color token per category, resolved to CSS variables in app.css. */
export const CATEGORY_ACCENT: Record<SubjectCategory, 'blue' | 'purple' | 'red' | 'green'> = {
	'Civil Law': 'blue',
	'Civil Law — Supplement': 'blue',
	'Political Law': 'purple',
	'Criminal Law': 'red',
	'Legal Method': 'green'
};
