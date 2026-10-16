/*
 * Front matter ("Start Here") and the Final Master Review Sheets. The master lists are generated from the
 * chapter and case data so they can never disagree with the detailed chapters.
 */
import { badge, box, CASE_NAMES, flashcards, h3, h4, ol, plain, table, ul, type Chapter } from './model';
import type { CaseStudy } from './cases';
import { examItems } from './integrated';

const chapterLink = (c: Chapter, part?: string, label?: string) => `<a href="#${part ? `${c.id}-${part}` : c.id}">${label ?? `Chapter ${c.roman} — ${c.title}`}</a>`;

/* ------------------------------------------------------------------ Start Here */

export function renderStart(chapters: Chapter[], cases: CaseStudy[]) {
	const out: string[] = [];
	out.push(`<h2 class="sg-h2" id="start-here">Start Here</h2>`);
	out.push(`<p class="sg-intro">How this reviewer is organized, what it was built from, and what was checked.</p>`);

	out.push(h3('start-how', 'How to use this reviewer'));
	out.push(
		ol([
			'<b>One chapter at a time.</b> Each chapter has the same 13 parts. Read parts 1–9, answer part 10 on paper, then check part 11.',
			'<b>Lock it in.</b> Use part 12 (must-memorize lists, memory aids, flashcards, active recall). Do not move on until you can tick every box in part 13.',
			'<b>Then the five cases.</b> Each case has a timeline, a full digest, the ratio, a plain-English version, your index card, recitation questions and exam questions.',
			'<b>Then the integrated examination</b>, which mixes chapters. Its answer key is a separate section.',
			'<b>Last: the Final Master Review Sheets</b>, a compressed version of everything for the night before.',
			'<b>Practice inside the app.</b> Every true-or-false item and the case recall drill are in the <b>MCQ Practice Engine</b> tab (filter by chapter). Every ALAC hypothetical is in the <b>ALAC Essay Exercises</b> tab, where you can write your answer and compare it with the model.'
		])
	);
	out.push(
		box(
			'neutral',
			'Reading the colors',
			ul([
				`${badge('Yellow', 'yellow')} rules to memorize and memory aids`,
				`${badge('Green', 'green')} requisites, tests, short exam answers and model answers`,
				`${badge('Blue', 'blue')} exceptions, limits, provisions and "why the other view is weaker"`,
				`${badge('Orange', 'orange')} exam traps and items to verify before reciting`,
				`${badge('Red', 'red')} case doctrine`,
				`${badge('Purple', 'purple')} application-level (Level 4–5) questions`
			])
		)
	);
	out.push(
		box(
			'orange',
			'Honest limits',
			`<p>I did not have your copy of Agpalo. Chapter content and section numbers follow your earlier study guide, which was built from Agpalo\'s table of contents. Where a rule, citation or case detail could not be confirmed, it carries a <b>Verify</b> note: check those before reciting them as Agpalo\'s exact words. Nothing in the five-case section goes beyond your case-digest PDF. A handful of points were checked against primary sources (see the verification log).</p>`
		)
	);

	out.push(h3('start-toc', 'Table of contents'));
	out.push(
		ol([
			'<a href="#start-here">Start Here</a> — how to use, contents, materials, topic map, cases at a glance, verification log',
			...chapters.map(
				(c) =>
					`${chapterLink(c)}<br><span class="rv-cite">${[
						['overview', 'Overview'],
						['enumerations', 'Enumerations'],
						['compare', 'Comparisons'],
						['cases', 'Five cases'],
						['practice', 'Practice'],
						['answers', 'Answer key'],
						['memorize', 'Memorize'],
						['summary', 'Checklist']
					]
						.map(([k, l]) => chapterLink(c, k, l))
						.join(' · ')}</span>`
			),
			`<a href="#five-cases">Five-Case Mastery</a><br><span class="rv-cite">${cases.map((c) => `<a href="#case-${c.id}">${c.short}</a>`).join(' · ')} · <a href="#five-case-matrix">Matrix</a> · <a href="#five-case-drill">Recall drill</a></span>`,
			'<a href="#integrated-exam">Integrated Comprehensive Examination — Chapters VI–XI</a> · <a href="#integrated-answers">Answer key</a>',
			'<a href="#master-review">Final Master Review Sheets</a> — master enumerations, master comparisons, five-case sheet, rapid-fire drill, last-minute reviewer'
		])
	);

	// out.push(h3('start-inventory', 'Inventory of the materials used'));
	// out.push(
	// 	table(
	// 		['Material', 'What it contains', 'How it was used'],
	// 		[
	// 			['<b>StatCon_Ch6-11_Study_Guide.pdf</b> (your earlier guide, 26 pp.)', 'Agpalo Chapters VI–XI with section references, color-coded rules, Agpalo\'s illustrative cases, cheat sheets and trick questions; items marked ◇ as unconfirmed.', 'Primary outline and source of section numbers. Reorganized into the 13-part structure; expanded; errors corrected (see the log); ◇ items checked where possible or kept with a Verify note.'],
	// 			['<b>StatCon_Case_Digests_october.pdf</b> (31 pp.)', 'The five assigned cases, digested from the full decisions: facts, issues, rulings, construction rationale, canons table and index-card versions.', 'Sole source for the Five-Case Mastery section and the chapter case connections. No facts were added beyond it.'],
	// 			['<b>Existing "Statutory Construction" module</b> (Agpalo Chs. 1–5, in this app)', 'Statutes; construction and interpretation; aids; literal language; words and phrases.', 'Not changed. Referred to where a case uses a Chapter IV–V canon (verba legis, noscitur a sociis, expressio unius).'],
	// 			['<b>Primary sources checked this session</b>', 'Revised Penal Code, Art. 22 (LawPhil); <i>CIR v. CA</i>, G.R. No. 107135 (Cenvoco); <i>Yapdiangco v. Buencamino</i>, G.R. No. L-28841; <i>Director of Lands v. CA</i>, G.R. No. 102858; <i>Co v. CA</i>, G.R. No. 100776; <i>Querubin v. CA</i>, G.R. No. L-2581.', 'Used to correct or confirm specific statements. The rule on reviving a repealed law was checked only against a secondary source.']
	// 		]
	// 	)
	// );

	out.push(h3('start-map', 'Chapters VI–XI topic map'));
	out.push(
		table(
			['Chapter', 'Agpalo sections', 'Key concepts', 'Five cases used', 'In this reviewer'],
			chapters.map((c) => [
				chapterLink(c),
				c.sections.replace(/ \(.*\)$/, ''),
				c.concepts.map((k) => plain(k.term)).join(' · '),
				c.caseLinks.length ? c.caseLinks.map((l) => `<a href="#case-${l.caseId}">${cases.find((x) => x.id === l.caseId)?.short}</a>${l.strength.startsWith('Direct') ? '' : '*'}`).join(', ') : '—',
				`${c.enums.length} lists · ${c.comparisons.length} comparisons · ${c.practice.length} practice items · ${c.flashcards.length} flashcards`
			])
		)
	);
	out.push(`<p class="sg-intro">* supporting or exam-point connection only (the Court did not rest on that chapter\'s rule).</p>`);

	out.push(h3('start-cases', 'The five cases at a glance'));
	out.push(
		table(
			['Case', 'Citation', 'Core doctrine', 'Chapters'],
			cases.map((c) => [`<a href="#case-${c.id}"><b>${CASE_NAMES[c.id]}</b></a>`, `${c.gr}<br>${c.date}`, c.doctrine, c.chapters])
		)
	);

	out.push(h3('start-verify', 'Verification log'));
	out.push(`<p class="sg-intro">Corrections made to your earlier materials, chapter by chapter, then the items still marked "Verify."</p>`);
	for (const c of chapters) {
		if (!c.corrections?.length) continue;
		out.push(h4(`Chapter ${c.roman}`));
		out.push(table(['Earlier guide said', 'Corrected or clarified'], c.corrections.map((x) => [x.old, x.fix])));
	}
	const flagged = chapters.flatMap((c) => [
		...c.enums.filter((e) => e.verify).map((e) => `Ch. ${c.roman}, <a href="#${e.id.toLowerCase().replace(/\./g, '-')}">${e.id}</a> ${e.name}`),
		...c.authorities.filter((a) => a.verify).map((a) => `Ch. ${c.roman}, ${chapterLink(c, 'authorities', a.name)}`)
	]);
	out.push(h4(`Items still marked "Verify" (${flagged.length})`));
	out.push(ul(flagged));
	return out.join('\n');
}

/* ------------------------------------------------------------------ Final master review */

const crossDrill: [string, string][] = [
	['A later general law conflicts with an earlier special law on the same subject. Which prevails?', 'The special law, unless the legislature clearly intended the general law to repeal it (§§6.20–6.22; <i>Magtajas</i>). [Chs. VI, X]'],
	['Is "all laws inconsistent herewith are repealed" an express repeal?', 'No; it names no law (<i>Mecano</i>; <i>Magtajas</i>). [Ch. X]'],
	['How are tax exemptions construed? Tax impositions?', 'Exemptions: <i>strictissimi juris</i> against the claimant. Impositions: strictly against the government. [Ch. VII]'],
	['A tax law is repealed. Are taxes already assessed under it collectible?', 'Yes, unless the repealing law provides otherwise (§10.36). [Ch. X]'],
	['A penal law is totally repealed while a case is pending. Effect?', 'Dismissal, unless the offense is reenacted or there is a saving clause (§10.38). [Ch. X]'],
	['A penal law reduces the penalty after final judgment. Can a convict benefit?', 'Yes, unless a habitual criminal (Art. 22, RPC); remedy: habeas corpus. [Ch. IX]'],
	['Deadline for a litigant to appeal vs. deadline for a judge to decide?', 'Litigant: mandatory. Judge: directory as to time; decision valid; judge may be sanctioned. [Ch. VIII]'],
	['Constitutional provisions are presumed what?', 'Mandatory and self-executing. [Ch. XI]'],
	['Are Article II State policies self-executing?', 'Generally not (<i>Tañada</i>; <i>Kilosbayan</i>), with exceptions (<i>Oposa</i>). [Ch. XI]'],
	['Tests for statutes in pari materia?', 'Same person or thing; same purpose or object; same specific subject. Any one. [Ch. VI]'],
	['Do procedural laws apply to pending cases?', 'Yes, unless the law says otherwise, it would be unfeasible or unjust, it raises due-process or judicial-independence problems, or it impairs vested rights. [Ch. IX]'],
	['Grants of property to LGUs vs. grants of powers?', 'Property: strictly against the LGU (<i>Manila Lodge</i>). Powers: liberally for the LGU (Sec. 5(a) LGC). [Ch. VII]'],
	['A local tax ordinance is doubtful. How is it construed?', 'Strictly against the LGU, liberally for the taxpayer (Sec. 5(b) LGC). [Ch. VII]'],
	['Is "shall" conclusive of mandatory character?', 'No; intent, context and consequences control (§8.08). [Ch. VIII]'],
	['Does the ex post facto clause apply to civil laws?', 'No; criminal or penal matters only. [Ch. IX]'],
	['Are provisions omitted from a revised code repealed?', 'Only if the code covers the whole subject as a substitute (<i>Mecano</i>). [Ch. X]'],
	['The Court overrules a doctrine. Does the new one apply to acts done in reliance on the old?', 'No; prospective (<i>Jabinal</i>; <i>Co v. CA</i>). [Ch. IX]'],
	['Limit of the saving-construction rule?', 'The text must be fairly susceptible of the valid reading; no rewriting. [Ch. VI]'],
	['Weight of Constitutional Commission debates?', 'Persuasive, not controlling (<i>Civil Liberties Union</i>). [Ch. XI]'],
	['The three maxims of constitutional construction, in order?', 'Verba legis; ratio legis est anima; ut magis valeat quam pereat (<i>Francisco</i>). [Ch. XI]'],
	['Election-conduct rules after the election?', 'Generally directory, unless they obstruct free voting or the result, affect an essential element, or the law declares the omission fatal. [Ch. VIII]'],
	['An amendatory act is declared unconstitutional. What law governs?', 'The original law, as if never amended (§10.10). [Ch. X]'],
	['A law that expressly repealed an earlier law is itself repealed. Is the earlier law revived?', 'No, unless expressly provided (verify the implied-repeal counterpart). [Ch. X]'],
	['Limit of strict construction of penal laws?', 'It cannot defeat the law\'s evident purpose or produce absurd results (<i>Purisima</i>). [Ch. VII]'],
	['Which case: "any person" read with "five or more persons"?', '<i>Catiis</i>. [Ch. VI]'],
	['Which case: later special law, two-stage harmony, nemo potest esse simul actor et judex?', '<i>Corona</i>. [Chs. VI, X]'],
	['Which case: "hereby authorized ... to sell" would be surplusage?', '<i>Manila Lodge</i>. [Chs. VI, VII]'],
	['Which case: notice "sent, not received"?', '<i>Aquino</i>. [Chs. VI, VIII]'],
	['Which case: "gambling" keeps bad company?', '<i>Magtajas</i>. [Chs. VI, X]']
];

export function renderReview(chapters: Chapter[], cases: CaseStudy[]) {
	const out: string[] = [];
	out.push(`<h2 class="sg-h2" id="master-review">Final Master Review Sheets</h2>`);
	out.push(`<p class="sg-intro">Generated from the chapters and cases above, so they always match. Use after you have studied each chapter; these sheets compress it, they do not replace it.</p>`);

	// A. Master enumeration list
	out.push(h3('master-enums', 'Master enumeration list'));
	out.push(`<p class="sg-intro">Every list from Chapters VI–XI with its one-line model-answer phrasing. ${badge('Must memorize', 'red')} marks the priority lists.</p>`);
	for (const c of chapters) {
		out.push(h4(`Chapter ${c.roman} — ${c.title}`));
		out.push(
			table(
				['List', 'Items (exam phrasing)', 'Keywords & memory aid'],
				c.enums.map((e) => [
					`<a href="#${e.id.toLowerCase().replace(/\./g, '-')}"><b>${e.id}</b></a> ${e.name}${e.memorize ? `<br>${badge('Must memorize', 'red')}` : ''}<br><span class="rv-cite">${e.source}</span>`,
					ol(e.items.map((i) => `<b>${i.t}</b> — ${i.s}`)),
					`${e.memory ? `<p>${e.memory}</p>` : ''}<p class="rv-cite">${e.tip}</p>`
				])
			)
		);
	}

	// B. Master comparisons
	out.push(h3('master-compare', 'Master compare-and-contrast table'));
	out.push(
		table(
			['Comparison', 'Decisive difference', 'When the first applies', 'When the second applies', 'Exam trap'],
			chapters.flatMap((c) =>
				c.comparisons.map((x) => [
					`<a href="#${x.id.toLowerCase().replace(/\./g, '-')}"><b>${x.id}</b></a> ${x.title}`,
					x.decisive,
					`<b>${x.a}:</b> ${x.when[0]}`,
					`<b>${x.b}:</b> ${x.when[1]}`,
					x.mistake
				])
			)
		)
	);

	// C. Five-case quick recall
	out.push(h3('master-cases', 'Five-case quick recall sheet'));
	out.push(
		table(
			['Case', 'Material facts', 'Principal issue', 'Ruling', 'Doctrine', 'Key reasoning', 'Memory cue'],
			cases.map((c) => [`<a href="#case-${c.id}"><b>${c.short}</b></a><br><span class="rv-cite">${c.gr}<br>${c.date}</span>`, c.quick.facts, c.quick.issue, c.quick.ruling, c.quick.doctrine, c.quick.reasoning, `<b>${c.quick.cue}</b>`])
		)
	);

	// D. Drills
	out.push(h3('master-drill', 'Rapid-fire drill across chapters'));
	out.push(
		`<p class="sg-intro">Cross-chapter flashcards: each answer names its chapter. For chapter-only flashcards and active-recall drills, use part 12 of each chapter (${chapters.map((c) => chapterLink(c, 'memorize', `Ch. ${c.roman}`)).join(' · ')}).</p>`
	);
	out.push(flashcards(crossDrill));

	// E. Last-minute reviewer
	out.push(h3('master-last', 'Last-minute examination reviewer'));
	out.push(
		box(
			'neutral',
			'How this is prioritized',
			'<p>Not a list of "sure" questions. These are the rules and lists your materials treat as central, ordered by how often they appear across chapters and cases, and matched to your exam formats: enumeration, compare and contrast, case digests and ALAC problems.</p>'
		)
	);
	out.push(h4('If you remember nothing else'));
	out.push(
		ol([
			'<b>Harmonize first.</b> Read the statute as a whole and laws on the same subject together; find a conflict or repeal only as a last resort (Chs. VI, X).',
			'<b>Special beats general, whichever is later</b>, unless clear intent to repeal, the special law states only a general rule, or roles are reversed (§6.22; <i>Corona</i>; <i>Magtajas</i>).',
			'<b>Implied repeal</b>: two kinds (conflict; whole-subject substitute) and four requisites (same subject; irreconcilable; cannot both operate; same object). A general repealing clause is not express (<i>Mecano</i>).',
			'<b>Strict against whom, liberal for whom.</b> Penal: for the accused. Tax impositions: for the taxpayer. Exemptions: against the claimant. Grants of property and privileges: against the grantee. Social legislation, LGU powers, amnesty, prescription of crimes: liberal (Ch. VII).',
			'<b>Mandatory vs. directory</b> turns on intent and consequences. Litigant deadlines are mandatory; official deadlines are directory as to time (Art. VIII, Sec. 15(4)) (Ch. VIII).',
			'<b>Laws are prospective</b> (Art. 4, Civil Code) except procedural, curative and favorable penal laws (Art. 22, RPC), always within the limits of contracts, due process, vested rights and ex post facto (Ch. IX).',
			'<b>Repeal is prospective.</b> Vested rights survive; assessed taxes remain collectible; repealed penal laws end pending cases unless reenacted or saved (Ch. X).',
			'<b>Constitution: words → reason → whole</b> (<i>Francisco</i>); presumed mandatory and self-executing (<i>Manila Prince</i>); debates only persuasive (<i>CLU</i>) (Ch. XI).'
		])
	);
	out.push(h4('Frequently confused pairs (one line each)'));
	out.push(
		table(
			['Pair', 'The difference'],
			[
				['Whole statute vs. in pari materia', 'One statute vs. several statutes on the same subject.'],
				['Generalia specialibus vs. leges posteriores', 'Specificity vs. time; special wins at any age.'],
				['Rule against surplusage vs. surplusagium non nocet', 'Give every word meaning vs. useless words don\'t void the law.'],
				['Strict vs. liberal construction', 'Keep the reach within the words vs. extend it to the purpose; both only when doubtful.'],
				['Tax imposition vs. tax exemption', 'Doubt for the taxpayer vs. doubt for the government.'],
				['Grant of property vs. grant of power to LGUs', 'Strict against the LGU vs. liberal for the LGU (but tax ordinances strict).'],
				['Mandatory vs. directory', 'Breach voids vs. breach is an irregularity.'],
				['Litigant vs. court deadline', 'Mandatory vs. directory as to time.'],
				['Substantive vs. procedural law', 'Prospective vs. reaches pending cases.'],
				['Ex post facto law vs. bill of attainder', 'Retroactive punishment vs. punishment without trial.'],
				['Interpretation vs. overruling', 'Part of the law from enactment vs. prospective only.'],
				['Express vs. implied repeal', 'Names the law vs. inferred from conflict or substitution.'],
				['Repeal of penal vs. tax law', 'Pending cases dismissed vs. assessed taxes still due.'],
				['Repeal vs. expiration', 'Ends pending prosecutions vs. does not.'],
				['Self-executing vs. non-self-executing', 'Enforceable now vs. needs a law.']
			]
		)
	);
	out.push(h4('Requisites and exceptions you must not miss'));
	out.push(
		ul([
			'<b>Implied repeal (conflict):</b> same subject · irreconcilable · cannot both be given effect · same object (all).',
			'<b>§6.22 exceptions:</b> clear intent to repeal · special law only a general rule · roles reversed.',
			'<b>Directory requirement:</b> no substantial rights · no injury · purpose met another way (all).',
			'<b>Official\'s time limit is mandatory if:</b> time of the essence · negative words · limit of power.',
			'<b>Election rule stays mandatory after election if:</b> obstructs voting or result · essential element · expressly fatal.',
			'<b>Art. 22, RPC does not apply to:</b> habitual criminals · cases the new law excludes.',
			'<b>Procedural law does not reach a pending case if:</b> law says so · unfeasible or unjust · due process or judicial independence · vested rights.',
			'<b>Pending penal case survives repeal if:</b> offense reenacted · saving clause.',
			'<b>Retroactivity limits:</b> contracts · due process · vested rights · ex post facto.',
			'<b>Tax exemption claim:</b> positive grant · clear language · burden on claimant · squarely within the grant.'
		])
	);
	out.push(h4('Case doctrines in one line'));
	out.push(ul(cases.map((c) => `<b>${c.short}</b> (${c.gr}, ${c.date}): ${c.doctrine} <i>Cue: ${c.quick.cue}</i>`)));
	out.push(h4('The ALAC answer, every time'));
	out.push(
		table(
			['Step', 'What to write', 'Common slip'],
			[
				['<b>A</b> — Answer', 'A direct yes or no, with the conclusion in one sentence.', 'Hedging ("it depends") without committing.'],
				['<b>L</b> — Legal basis', 'The rule, the provision or Agpalo section, and the case. State the general rule, then the exception that matters.', 'Citing the rule without its exception, or the exception without the rule.'],
				['<b>A</b> — Application', 'Walk through each element using the facts: "Here, ... because ..."; address the other side\'s best argument.', 'Repeating the rule instead of applying it to the facts.'],
				['<b>C</b> — Conclusion', 'The disposition: who wins, what happens to the act, the case or the right.', 'A conclusion that contradicts the Answer.']
			]
		)
	);
	out.push(h4('Common examination mistakes'));
	out.push(
		ul([
			'Giving an incomplete list when the question asks to "enumerate," or a list without the one-line discussion.',
			'Stating a general rule without its exceptions, or presenting a study grouping as Agpalo\'s official list.',
			'Saying "the later law prevails" without first trying to harmonize, or ignoring the special–general rule.',
			'Saying "strict" without saying <i>against whom</i>.',
			'Deciding mandatory vs. directory from the word "shall" alone.',
			'Confusing the parties\' arguments (e.g., the <i>Magtajas</i> petitioners\' "later law" theory) with the Court\'s holding.',
			'Citing a concurring opinion (Davide in <i>Magtajas</i>) as the ruling.',
			'Forcing one of the five cases into Chapter IX: none is a retroactivity case.',
			'Reaching a conclusion in an ALAC problem without applying the rule to the facts.'
		])
	);
	out.push(
		`<p class="sg-intro">Totals in this reviewer: ${chapters.reduce((n, c) => n + c.enums.length, 0)} enumerations · ${chapters.reduce((n, c) => n + c.comparisons.length, 0)} comparison tables · ${chapters.reduce((n, c) => n + c.practice.length, 0)} chapter practice items · ${examItems().length} integrated-exam items · ${cases.reduce((n, c) => n + c.exam.length + c.recitation.length, 0)} case questions · ${chapters.reduce((n, c) => n + c.flashcards.length, 0) + crossDrill.length} flashcards.</p>`
	);
	return out.join('\n');
}
