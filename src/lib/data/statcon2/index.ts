import type { LawModule } from '$lib/types';
import { alacEssays, renderChapter, trueFalseMcqs, type Chapter } from './model';
import { ch6 } from './ch6';
import { ch7 } from './ch7';
import { ch8 } from './ch8';
import { ch9 } from './ch9';
import { ch10 } from './ch10';
import { ch11 } from './ch11';
import { caseDigests, caseDrillMcqs, cases, renderCases } from './cases';
import { examItems, renderIntegratedExam } from './integrated';
import { renderReview, renderStart } from './review';

const ID = 'statcon2';

/** Chapters VI–XI in order. Each renders as its own h2 section with the same 13-part structure. */
export const chapters: Chapter[] = [ch6, ch7, ch8, ch9, ch10, ch11];

/**
 * Statutory Construction II — Agpalo Chapters VI–XI and the five assigned cases.
 * Content lives in the chapter, case and exam files; this file only assembles the module. Practice
 * items feed the app's engines: true/false items and the case recall drill become MCQs, and every
 * ALAC problem becomes an essay exercise. IDs are derived from position within each bank, so append
 * new items at the end of a bank to keep saved progress attached.
 */
export const statcon2: LawModule = {
	id: ID,
	title: 'Statutory Construction II',
	subjectCategory: 'Legal Method',
	eyebrow: 'Agpalo · Chapters VI–XI · Five Cases',
	description:
		'Statutes read as a whole and with other laws, strict and liberal construction, mandatory and directory statutes, prospective and retroactive laws, amendment and repeal, and constitutional construction, with the five assigned cases.',
	legalScope: 'Agpalo, Statutory Construction, Chapters VI–XI; Catiis, Aquino, Manila Lodge, Corona, Magtajas',
	topics: [
		...chapters.map((c) => ({ id: c.id, name: c.short, eyebrow: `AGPALO · CHAPTER ${c.roman}`, desc: c.title })),
		{ id: 'cases', name: 'Five Cases', eyebrow: 'CASE RECALL', desc: 'Catiis, Aquino, Manila Lodge, Corona, Magtajas' },
		{ id: 'integrated', name: 'Integrated (Chs. VI–XI)', eyebrow: 'COMPREHENSIVE', desc: 'Cross-chapter true-or-false items' }
	],
	studyGuideIntro:
		'Chapter-by-chapter exam reviewer. Each chapter has the same thirteen parts, from overview and enumerations to practice problems, answer key and a mastery checklist. Then the five cases, an integrated examination, and master review sheets.',
	legend: [
		{ color: 'yellow', label: 'Memorize — rules & memory aids' },
		{ color: 'green', label: 'Requisites, tests & model answers' },
		{ color: 'blue', label: 'Exceptions, limits & provisions' },
		{ color: 'orange', label: 'Exam traps & items to verify' },
		{ color: 'red', label: 'Case doctrine' },
		{ color: 'purple', label: 'Application-level questions' }
	],
	studyGuideHtml: [renderStart(chapters, cases), ...chapters.map(renderChapter), renderCases(), renderIntegratedExam(), renderReview(chapters, cases)].join('\n'),
	watchFor: {
		...Object.fromEntries(chapters.map((c) => [c.id, c.watchFor])),
		cases: `<strong>Watch for: the clue that names the case.</strong>
<ul>
<li><i>Catiis</i>: four is not five. <i>Aquino</i>: sent, not received. <i>Manila Lodge</i>: why ask permission to sell what you own?</li>
<li><i>Corona</i>: coach first, principal on appeal. <i>Magtajas</i>: "gambling" keeps bad company.</li>
</ul>`,
		integrated: `<strong>Watch for: two chapters in one statement.</strong>
<ul>
<li>Check each half of a compound statement separately; one false half makes the whole false.</li>
<li>Strict or liberal? Mandatory or directory? Prospective or retroactive? Repealed or harmonized? Name the chapter before answering.</li>
</ul>`
	},
	mcqs: [...chapters.flatMap((c) => trueFalseMcqs(ID, c.id, c.short, c.practice)), ...caseDrillMcqs(ID), ...trueFalseMcqs(ID, 'integrated', 'Integrated (Chs. VI–XI)', examItems())],
	essays: [
		...chapters.flatMap((c) => alacEssays(ID, c.id, `Chapter ${c.roman} — ${c.title}`, c.practice)),
		...cases.flatMap((c) => alacEssays(ID, c.id, 'Five Cases', c.exam)),
		...alacEssays(ID, 'integrated', 'Integrated Examination', examItems())
	],
	cases: caseDigests(ID)
};

export default statcon2;
