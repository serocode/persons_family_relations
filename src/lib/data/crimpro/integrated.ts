/*
 * Part XI — integrated mock examination. Questions mix Rules; the Rules involved are shown only in the answer key
 * (the `rules` field). True-or-false items feed the MCQ engine and situational items feed the essay editor.
 */
import { box, p, renderAnswerKey, renderPracticeSets, ul, type Cat, type Practice } from './model';

const LABELS: Partial<Record<Cat, string>> = {
	A: 'Enumeration with brief discussion',
	B: 'Compare and contrast',
	C: 'True or false with justification',
	D: 'Short problems and deadline / prescription computation',
	E: 'Complex situational problems',
	F: 'Case-based questions',
	G: 'Multi-rule problems'
};

export const mockItems: Practice[] = [
	// A — Enumeration
	{ cat: 'A', level: 2, topic: 'Motion to quash', rules: 'Rule 117', q: 'Enumerate the grounds for a motion to quash. Which of them are not waived by failure to raise them before plea?', a: 'Rule 117, Sec. 3: (a) facts do not constitute an offense; (b) no jurisdiction over the offense; (c) no jurisdiction over the person; (d) no authority of the filing officer; (e) non-conformity with the prescribed form; (f) duplicity; (g) extinction of the action or liability; (h) averments constituting a legal excuse; (i) double jeopardy. Not waived (Sec. 9): (a), (b), (g), (i). Note Villa Gomez (2020): (d) is waivable.', keys: 'Sec. 3; Sec. 9; Villa Gomez' },
	{ cat: 'A', level: 2, topic: 'Warrantless arrest', rules: 'Rule 113; Rule 114, Sec. 23', q: 'Enumerate the instances of lawful warrantless arrest and give the requisites of an in flagrante delicto arrest and of a hot pursuit arrest.', a: 'In flagrante; hot pursuit; escaped prisoner (Rule 113, Sec. 5); accused on bail attempting to leave the country (Rule 114, Sec. 23); retaking after escape or rescue (Rule 113, Sec. 13). In flagrante: overt act; in the presence or view of the arresting person. Hot pursuit: offense just committed; probable cause from personal knowledge of facts or circumstances.', keys: 'Sec. 5; overt act; personal knowledge' },
	{ cat: 'A', level: 3, topic: 'Bail', rules: 'Rule 114', q: 'When is bail (a) a matter of right, (b) a matter of discretion, (c) not allowed? Enumerate the bail-negating circumstances.', a: '(a) Before or after conviction by first-level courts; before RTC conviction of an offense not punishable by death, RP or life. (b) Before conviction of an RP/life offense (depends on whether evidence of guilt is strong); after RTC conviction of a non-RP offense pending appeal. (c) RP/life offense with strong evidence of guilt; after final judgment or start of service (except probation); after RTC conviction imposing more than six years when a bail-negating circumstance exists. Bail-negating: repeat offender; prior escape, evasion or bail violation; offense on probation, parole or conditional pardon; flight risk; risk of another crime.', keys: 'Secs. 4, 5, 7, 24' },
	{ cat: 'A', level: 3, topic: 'State witness', rules: 'Rule 119', q: 'Enumerate the requisites for the discharge of an accused to be a state witness, and state its effect.', a: 'Rule 119, Sec. 17: absolute necessity; no other direct evidence; substantial corroboration; not the most guilty; no conviction involving moral turpitude — plus joint charge, prosecution\'s motion before resting, consent, and a hearing. Effect (Sec. 18): acquittal, unless he fails or refuses to testify per his sworn statement.', keys: 'Sec. 17; Sec. 18' },
	// B — Compare
	{ cat: 'B', level: 3, topic: 'Dismissals', rules: 'Rules 117, 119', q: 'Distinguish (a) a provisional dismissal from a dismissal on the merits, and (b) a motion to quash from a demurrer to evidence.', a: '(a) Provisional dismissal: express consent of the accused, notice to the offended party, revivable within 1 or 2 years from issuance of the order (Rule 117, Sec. 8; Lacson). Dismissal on the merits (e.g., demurrer granted, speedy trial): an acquittal; bars reprosecution. (b) Motion to quash: before plea, attacks the face of the information, hypothetical admission; quashal usually allows refiling. Demurrer: after the prosecution rests, attacks the sufficiency of the evidence; grant = acquittal; without leave, denial waives defense evidence.', keys: 'Sec. 8; Sec. 23; Lacson' },
	{ cat: 'B', level: 3, topic: 'Civil actions', rules: 'Rule 111', q: 'Distinguish the civil action deemed instituted with the criminal action from an independent civil action.', a: 'Ex delicto: deemed instituted unless waived, reserved before the prosecution presents evidence, or filed first; suspended when the criminal action is filed; extinguished by a finding that the act did not exist or by death before final judgment. Independent (Arts. 32, 33, 34, 2176): no reservation; not suspended; preponderance of evidence; survives acquittal and death; no double recovery.', keys: 'Rule 111, Secs. 1–4' },
	{ cat: 'B', level: 3, topic: 'Probable cause', rules: 'Rule 112', q: 'Distinguish (a) preliminary investigation from inquest, and (b) prosecutorial from judicial determination of probable cause.', a: '(a) PI: full inquiry with subpoena and counter-affidavits for offenses with penalty ≥4y 2m 1d. Inquest: summary review of a person lawfully arrested without warrant, within Art. 125 hours; the arrested person may opt for PI with an Art. 125 waiver and counsel, or within 5 days after learning of the filing. (b) Prosecutor: whether to file; judge: whether to issue a warrant, by personal evaluation; the judge is not bound by the prosecutor; a motion for judicial determination of probable cause is prohibited (2017 Guidelines).', keys: 'Secs. 1, 3, 5, 6' },
	{ cat: 'B', level: 4, topic: 'Information', rules: 'Rules 110, 117', q: 'Distinguish (a) amendment from substitution, and (b) a formal from a substantive defect of the information.', a: '(a) Amendment: same or included offense; before plea freely (leave for downgrade/exclusion), after plea formal only with leave; no new PI or plea if formal. Substitution: different offense; before judgment; leave; new PI and plea; no double jeopardy (Pacoy; Teehankee). (b) Formal: affects how the charge is stated; waivable; curable by amendment. Substantive: no offense charged or no jurisdiction; not waived (Rule 117, Sec. 9).', keys: 'Rule 110, Sec. 14; Rule 117, Sec. 9' },
	// C — True or false
	{ cat: 'C', level: 2, topic: 'Authority to file', rules: 'Rules 110, 112, 117', q: 'An information filed by an assistant prosecutor without the city prosecutor\'s prior written approval is void and confers no jurisdiction.', tf: false, short: 'False. Not jurisdictional; waived if not raised in a motion to quash before plea (Villa Gomez v. People, 2020, En Banc).', keys: 'Villa Gomez' },
	{ cat: 'C', level: 2, topic: 'Appeal of acquittal', rules: 'Rules 110, 111, 120', q: 'A private complainant may appeal a judgment of acquittal in its entirety.', tf: false, short: 'False. Only the civil aspect; the criminal aspect may be appealed only by the State through the OSG, and an acquittal is generally unappealable (Villareal v. Aliga).', keys: 'civil aspect only' },
	{ cat: 'C', level: 2, topic: 'BP 22', rules: 'Rule 111', q: 'In BP 22 cases, the offended party may reserve the civil action.', tf: false, short: 'False (Rule 111, Sec. 1[b]).', keys: 'Sec. 1(b)' },
	{ cat: 'C', level: 2, topic: 'Preliminary investigation', rules: 'Rule 112', q: 'Municipal trial court judges may still conduct preliminary investigations.', tf: false, short: 'False. Removed by A.M. No. 05-8-26-SC (effective October 3, 2005).', keys: 'A.M. No. 05-8-26-SC' },
	{ cat: 'C', level: 2, topic: 'Warrant', rules: 'Rule 113', q: 'A warrant of arrest that is not served within ten days from its receipt by the police is void.', tf: false, short: 'False. It remains valid until served or recalled; the 10 days govern execution and reporting (Rule 113, Sec. 4).', keys: 'Sec. 4' },
	{ cat: 'C', level: 3, topic: 'Bail and arrest', rules: 'Rules 113, 114', q: 'By posting bail, the accused waives his right to question the legality of his warrantless arrest.', tf: false, short: 'False, if he raises it before plea (Rule 114, Sec. 26).', keys: 'Sec. 26' },
	{ cat: 'C', level: 3, topic: 'Trial in absentia', rules: 'Rule 115', q: 'An accused who jumps bail before arraignment may be tried in absentia if he was duly notified.', tf: false, short: 'False. Trial in absentia requires prior arraignment (Const., Art. III, Sec. 14[2]).', keys: 'arraignment' },
	{ cat: 'C', level: 3, topic: 'Plea bargaining', rules: 'Rule 116', q: 'Plea bargaining is prohibited in prosecutions under the Comprehensive Dangerous Drugs Act.', tf: false, short: 'False. RA 9165, Sec. 23 was struck down (Estipona, 2017); a Supreme Court framework governs; courts may overrule objections based solely on inconsistent DOJ circulars (Montierro, 2022).', keys: 'Estipona; Montierro' },
	{ cat: 'C', level: 3, topic: 'Quashal', rules: 'Rule 117', q: 'An order quashing an information on the ground of prescription bars another prosecution for the same offense.', tf: true, short: 'True (Rule 117, Sec. 6 — grounds [g] and [i]).', keys: 'Sec. 6' },
	{ cat: 'C', level: 3, topic: 'Pre-trial', rules: 'Rule 118', q: 'A stipulation made by defense counsel at pre-trial binds the accused even if the accused did not sign it.', tf: false, short: 'False. It must be in writing and signed by the accused and counsel (Rule 118, Sec. 2).', keys: 'Sec. 2' },
	{ cat: 'C', level: 3, topic: 'Demurrer', rules: 'Rule 119', q: 'The prosecution may appeal an order granting a demurrer to evidence.', tf: false, short: 'False. A granted demurrer is an acquittal; only certiorari for grave abuse lies (Dayap v. Sendiong).', keys: 'acquittal' },
	{ cat: 'C', level: 4, topic: 'Variance', rules: 'Rules 110, 120', q: 'An accused charged with homicide may be convicted of murder if treachery is proved at trial.', tf: false, short: 'False. Convict of homicide; treachery was not alleged (Rule 120, Secs. 4–5; Rule 110, Sec. 8).', keys: 'variance; qualifying circumstance must be alleged' },
	{ cat: 'C', level: 5, topic: 'Prescription', rules: 'Rule 110, Sec. 1; Act 3326; prescription module', q: 'After People v. Consebido (2025), it is settled that filing a complaint for an ordinance violation with the city prosecutor interrupts the two-month prescriptive period.', tf: false, short: 'False — unsettled. Consebido\'s words reach offenses covered by the 2022 Expedited Rules (which include ordinances) and it abandoned Desierto and Corpus, but it did not expressly abandon Zaldivia or Jadewell.', keys: 'Consebido; Zaldivia; Jadewell' },
	// D — Short and computation
	{
		cat: 'D', level: 4, topic: 'Computation — inquest', rules: 'Rules 112, 113; RPC Art. 125', title: 'Mock — Art. 125 and the five-day rule',
		facts: 'X is arrested in flagrante for homicide at 8:00 p.m. on Tuesday. At 7:00 p.m. on Thursday, he is still detained without a case filed and without having signed any waiver. On Friday, an information is filed after inquest; X learns of it on Saturday.',
		q: '(a) Was X\'s detention lawful on Thursday evening? (b) Until when may X ask for a preliminary investigation?',
		issue: 'Art. 125 detention period and the period to ask for PI after an inquest filing.',
		alac: {
			answer: '(a) No — the 36-hour limit had lapsed. (b) Within 5 days from Saturday.',
			legalBasis: 'RPC Art. 125 (36 hours for offenses punishable by afflictive or capital penalties); Rule 112, Sec. 6 (PI within 5 days from learning of the filing).',
			application: '(a) From Tuesday 8:00 p.m., 36 hours ended Thursday 8:00 a.m.; continued detention at 7:00 p.m. without filing or waiver violated Art. 125 (the officers may be liable; X should have been released). (b) X learned of the filing on Saturday; five days run to Thursday of the following week.',
			conclusion: '(a) Detention beyond Thursday 8:00 a.m. was unlawful. (b) X must move for PI within five days from Saturday; later, the motion is prohibited.'
		},
		trap: 'The unlawful prolonged detention does not void the information; the remedy is release and liability of the officers.',
		keys: 'Art. 125; 36 hours; Sec. 6; 5 days'
	},
	{
		cat: 'D', level: 4, topic: 'Computation — provisional dismissal', rules: 'Rule 117', title: 'Mock — revival after provisional dismissal',
		facts: 'A robbery case (prision mayor) is provisionally dismissed on February 3, 2025 on the prosecution\'s motion, which bears the accused\'s handwritten "No objection," with notice to the complainant and service on the prosecutor. The prosecution refiles on March 1, 2027.',
		q: 'Is the refiling timely?',
		issue: 'Time-bar for reviving a provisionally dismissed case involving an offense punishable by more than six years.',
		alac: {
			answer: 'No.',
			legalBasis: 'Rule 117, Sec. 8: for offenses punishable by imprisonment of more than six years, provisional dismissal becomes permanent two years after issuance of the order without revival; reckoned from issuance (A.M. No. 12-11-2-SC, Sec. 14).',
			application: 'Prision mayor exceeds six years. Two years from February 3, 2025 ended on February 3, 2027. The March 1, 2027 refiling is late; the Lacson requisites were present.',
			conclusion: 'The dismissal became permanent; the refiled case must be dismissed.'
		},
		keys: 'Sec. 8; 2 years; issuance'
	},
	{
		cat: 'D', level: 4, topic: 'Computation — prescription', rules: 'Rule 110, Sec. 1; Act 3326; prescription module', title: 'Mock — BP 22 across three rulings',
		facts: 'A check bounces and notice of dishonor is received on May 1, 2025. The payee files a complaint with the city prosecutor on April 1, 2026. The information is filed in court on June 1, 2029.',
		q: 'Has the offense prescribed?',
		issue: 'Interruption of prescription of BP 22 (an Expedited-Rules offense) after Consebido.',
		alac: {
			answer: 'No.',
			legalBasis: 'Act 3326, Sec. 1: four years for BP 22 (Panaguiton). People v. Consebido (April 2, 2025): henceforth, filing the complaint before the DOJ tolls prescription even for offenses under the 2022 Expedited Rules (abandoning Desierto and Corpus on that point).',
			application: 'The complaint (April 1, 2026) was filed after Consebido and within four years of the offense; it tolled prescription. The 2029 court filing is therefore timely despite being more than four years after the offense.',
			conclusion: 'The case may proceed.'
		},
		missing: 'Exactly when the offense was committed (BP 22 is complete upon failure to pay within five banking days after notice of dishonor) — the start date may shift slightly.',
		keys: 'Act 3326; Consebido; Panaguiton'
	},
	{
		cat: 'D', level: 4, topic: 'Bail — where filed', rules: 'Rule 114', title: 'Mock — bail in another province',
		facts: 'Y is charged with frustrated homicide before the RTC of Baguio. He is arrested in Iloilo.',
		q: 'Where may Y post bail?',
		issue: 'Where bail as a matter of right may be filed when the accused is arrested outside the place where the case is pending.',
		alac: {
			answer: 'In the Baguio RTC, or in any RTC of Iloilo (or, if no RTC judge is available, any first-level judge there).',
			legalBasis: 'Rule 114, Sec. 4(b) (bail as a right before conviction for an offense not punishable by RP); Sec. 17(a) (place of arrest); Sec. 19 (papers forwarded to the court of the case).',
			application: 'Frustrated homicide is not punishable by RP; bail is a matter of right; Y was arrested in Iloilo.',
			conclusion: 'Y may post bail in Iloilo; the Iloilo judge forwards the bail and release order to Baguio.'
		},
		keys: 'Sec. 17(a); right'
	},
	{
		cat: 'D', level: 4, topic: 'Computation — promulgation', rules: 'Rule 120', title: 'Mock — absent at promulgation',
		facts: 'Z, on bail, is notified that promulgation is set on September 1. He does not appear, without explanation. The conviction is recorded in the docket and served on his counsel on September 1. On September 20, Z\'s counsel files a notice of appeal; Z remains at large.',
		q: 'Is the appeal valid?',
		issue: 'Effect of unjustified absence at promulgation on the right to appeal.',
		alac: {
			answer: 'No.',
			legalBasis: 'Rule 120, Sec. 6: if the judgment is for conviction and the absence was without justifiable cause, the accused loses his remedies unless, within 15 days from promulgation, he surrenders and files a motion for leave; Jaylo v. Sandiganbayan (2015).',
			application: 'Z did not surrender or move for leave within 15 days (by September 16); the notice of appeal filed on September 20 while he is at large cannot be given due course.',
			conclusion: 'The notice of appeal should be denied; Z should be arrested.'
		},
		keys: 'Sec. 6; 15 days; Jaylo'
	},
	// E — Complex
	{
		cat: 'E', level: 5, topic: 'Forestry Code complaint', rules: 'Rule 110, Sec. 1; Rules 112, 117; PD 705; Act 3326', title: 'Mock — DENR complaint, then the prosecutor',
		facts: 'On March 1, 2015, R is caught by a barangay tanod transporting narra lumber without documents in a province. The tanod reports to the CENRO; on March 20, 2015, a DENR forest officer files a sworn report with the provincial environment office\'s legal division, which conducts an investigation and, in 2019, endorses a complaint to the provincial prosecutor. The prosecutor files an information for violation of PD 705, Sec. 77 in 2024. R moves to quash on prescription, arguing that only the prosecutor\'s receipt in 2019 interrupted the period and that it is a special law with an 8-year period.',
		q: 'Rule on the motion. What facts would you still need?',
		issue: 'Whether the filing with the DENR interrupted prescription, and the applicable period.',
		alac: {
			answer: 'Deny the motion on these facts — the DENR proceeding likely interrupted prescription in 2015; even on R\'s theory, the 2019 endorsement was within 8 years.',
			legalBasis: 'PD 705, Sec. 80 (forest officer investigates and files the complaint with the official authorized to conduct preliminary investigation); Act 3326, Sec. 2 as read in Panaguiton, SEC v. Interport, Pangilinan, Lee and Consebido (executive investigative proceedings that may lead to prosecution toll prescription); Rule 117, Secs. 3(g), 9 (prescription is a ground never waived).',
			application: 'The forest officer\'s sworn report started the Sec. 80 investigation — an executive proceeding against R that may lead to prosecution (Interport analogy). That interrupted prescription on March 20, 2015, and the period stayed interrupted through the endorsement and filing. Even if only the 2019 endorsement counted, it came about four years after the offense — within 8 years (or 12, depending on the penalty fixed by the value of the lumber under Arts. 309–310).',
			conclusion: 'Deny the motion; the offense has not prescribed. Flag that no SC case squarely holds a DENR filing interrupts prescription.'
		},
		missing: 'The value of the lumber (fixes the penalty and thus the period: 8 or 12 years under Act 3326; Art. 90 view possible); whether the DENR legal division was the office charged with the Sec. 80 investigation; whether the DENR proceeding was criminal or only administrative (confiscation); whether any dismissal occurred in between (the period would run again).',
		trap: 'Assuming the long delay (2015–2024) means prescription. Delay in a pending proceeding raises speedy disposition (Cagang), not prescription.',
		keys: 'PD 705 Sec. 80; Act 3326; Interport; Panaguiton; Consebido; Cagang'
	},
	{
		cat: 'E', level: 5, topic: 'Arrest to arraignment', rules: 'Rules 112, 113, 114, 116', title: 'Mock — arrest days later, inquest, bail, arraignment',
		facts: 'Three days after a fatal shooting, police arrest S without a warrant on the basis of a witness\'s statement. S is inquested for murder; an information is filed. S applies for bail and, the next week, is arraigned and pleads not guilty. A month later, he moves to quash the information for lack of jurisdiction over his person and to suppress the gun found in his waistband at the arrest.',
		q: 'Rule on both motions.',
		issue: 'Validity of the warrantless arrest; waiver by plea; admissibility of evidence seized.',
		alac: {
			answer: 'Deny the motion to quash; grant the motion to suppress (if timely objected to when offered).',
			legalBasis: 'Rule 113, Sec. 5(b) and Go v. CA (arrest days later on witnesses\' statements is not hot pursuit); Rule 114, Sec. 26 and Rule 117, Sec. 9 (objection to the arrest waived if not raised before plea; bail is no waiver if raised before plea); De la Cruz v. People and Villanueva v. People (waiver of the arrest does not waive inadmissibility of evidence seized); Const., Art. III, Sec. 3(2).',
			application: 'The arrest was illegal (no immediacy, no personal knowledge), and the inquest was improper — S was entitled to a regular PI. But S pleaded without objecting, waiving the arrest and the PI. The gun was seized incident to an illegal arrest and remains inadmissible.',
			conclusion: 'The case proceeds; the gun is excluded.'
		},
		trap: 'Treating bail as the waiver — it is the plea that waived the objection here.',
		keys: 'Go v. CA; Sec. 26; waiver; exclusionary rule'
	},
	{
		cat: 'E', level: 5, topic: 'Civil aspect and compromise', rules: 'Rules 111, 117, 118', title: 'Mock — estafa, earlier civil case, compromise',
		facts: 'T sues U for collection of ₱2 million based on a loan. Later, an estafa information is filed against U for issuing a fake title as collateral for the same loan. U petitions the court to suspend the estafa case because of the collection case. At pre-trial, U pays ₱2 million; the complainant executes an affidavit of desistance; the court dismisses the estafa case "in view of the full payment."',
		q: 'Rule on the petition to suspend and on the dismissal.',
		issue: 'Prejudicial question; compromise and desistance.',
		alac: {
			answer: 'Deny the petition; the dismissal was erroneous.',
			legalBasis: 'Rule 111, Secs. 6–7 (prejudicial question: a previously instituted civil action whose resolution determines whether the criminal action may proceed); Rule 111, Sec. 3 / Civil Code Arts. 31, 33 (independent actions); Civil Code Art. 2034 (compromise does not extinguish the public action); Metrobank v. Reynaldo; People v. Lamsen (desistance viewed with disfavor).',
			application: 'The collection case is on the loan (another source of obligation); its outcome does not determine whether U deceived T with a fake title, so it is not prejudicial. Payment settles civil liability only; the court cannot dismiss "in view of payment." If the prosecution can no longer prove the case without T, it should move to dismiss on the evidence — and the court must assess it independently (Crespo).',
			conclusion: 'The estafa case should proceed; the dismissal should be set aside on the State\'s certiorari if it was a grave abuse (no double jeopardy if dismissed on the accused\'s motion — check who moved).'
		},
		missing: 'Who moved for dismissal and whether U consented — that determines whether jeopardy attached.',
		keys: 'Secs. 6–7; Art. 2034; Metrobank; Crespo'
	},
	{
		cat: 'E', level: 5, topic: 'Trial and judgment', rules: 'Rules 119, 120', title: 'Mock — state witness, demurrer and variance',
		facts: 'V, W and X are charged with robbery with homicide. Before resting, the prosecution moves to discharge X, a lookout with no prior convictions and the only participant willing to describe the killing, whose account is corroborated by CCTV footage of the getaway car and phone records; the court grants it after a hearing. After the prosecution rests, V files a demurrer without leave; it is denied. W\'s demurrer with leave is denied; W presents evidence. The court finds that the killing was not proved to be connected with the robbery.',
		q: 'Rule on X\'s discharge and on both demurrers, and state the offense of which V and W may be convicted.',
		issue: 'Discharge as state witness; demurrer with and without leave; variance.',
		alac: {
			answer: 'X\'s discharge was valid. V may not present evidence; W may. If the killing was not by reason or on the occasion of the robbery, the special complex crime fails: V and W may be convicted of robbery, and of homicide only if the information\'s allegations support a separate conviction.',
			legalBasis: 'Rule 119, Secs. 17–18 (requisites; acquittal); Sec. 23 (demurrer without leave — waiver of evidence; with leave — evidence allowed); Rule 120, Secs. 4–5 (variance — conviction for the offense proved included in the offense charged).',
			application: 'X met the requisites and was discharged before the prosecution rested. V filed without leave, so denial waived his evidence; W, with leave, presented evidence. Robbery is included in the special complex crime charged; if the homicide was not by reason or on the occasion of the robbery, the special complex crime fails, and the accused may be convicted of robbery and, separately, homicide only if the information\'s allegations support it and the duplicity point was waived.',
			conclusion: 'Convict V and W of robbery (and homicide only if alleged and proved as a separate offense); X is acquitted by the discharge if he testified as promised.'
		},
		verify: 'Whether a separate homicide conviction is possible under an information for robbery with homicide depends on the allegations; check current jurisprudence on special complex crimes.',
		keys: 'Secs. 17, 23; Rule 120, Secs. 4–5'
	},
	// F — Case-based
	{ cat: 'F', level: 4, topic: 'Consebido', rules: 'Rule 110, Sec. 1; prescription module', q: 'What did People v. Consebido (2025) pronounce about the interruption of prescription, and how does it apply prospectively? Which earlier rulings did it abandon, and which did it not mention?', a: 'Henceforth, the filing of the criminal complaint before the DOJ tolls prescription even for offenses covered by the 2022 Rules on Expedited Procedures; applied prospectively in line with the rule favoring the accused on prescription. It deemed abandoned Republic v. Desierto (2023) and Corpus v. People (2023) insofar as tolling for those crimes is concerned. It did not expressly abandon Zaldivia (1992) or Jadewell (2013), leaving the ordinance question open. (The decision itself turned on the NIRC discovery rule: the BIR could readily have discovered the non-filing, so prescription ran from the due date.)', keys: 'Consebido; prospective; Desierto; Corpus; Zaldivia' },
	{ cat: 'F', level: 4, topic: 'Villa Gomez and Solar', rules: 'Rules 110, 116, 117', q: 'Explain how Villa Gomez v. People (2020) and People v. Solar (2019) each convert what was once treated as a fatal defect of the information into a waivable one.', a: 'Villa Gomez: the lack of prior written authority of the filing officer is not jurisdictional; it is a ground to quash under Rule 117, Sec. 3(d) waived if not raised before plea; earlier contrary doctrines abandoned; no motu proprio dismissal. Solar: a qualifying circumstance must be alleged with its ultimate facts; a bare label is insufficient, but if the accused does not move to quash (Sec. 3[e]) or for a bill of particulars before arraignment, the defect is waived and the circumstance may be appreciated if proven.', keys: 'Villa Gomez; Solar; waiver' },
	{ cat: 'F', level: 4, topic: 'Crespo and Lanier', rules: 'Rule 112', q: 'Under Crespo v. Mogul and Lanier v. People, what must a court do when, after the information is filed, the Secretary of Justice directs its withdrawal?', a: 'The court is not bound; once the information is filed, its disposition rests in the court\'s sound discretion (Crespo). It must make its own independent assessment of the motion to withdraw; granting it merely in deference to the DOJ is grave abuse (Lanier). If denied, the prosecutor must continue to appear for the People.', keys: 'Crespo; Lanier' },
	// G — Multi-rule
	{
		cat: 'G', level: 5, topic: 'Lifecycle — spot the errors', rules: 'Rules 110, 112, 114, 116, 118, 119, 120', title: 'Mock — from complaint to judgment',
		facts: 'A complaint for qualified theft (penalty above 4y 2m 1d) is filed with the city prosecutor of Makati. Without subpoenaing the respondent, the prosecutor files an information. The judge issues a warrant the same day, reading only the information. The accused is arrested, posts bail, and moves to quash for lack of preliminary investigation; denied. At arraignment, he says, "Guilty, but I only borrowed the money." The court records a plea of guilty. Pre-trial is skipped. After the prosecution rests, the accused files a demurrer without leave; it is denied. The judgment, promulgated by mailing a copy to the accused, convicts him of qualified theft.',
		q: 'Identify every error and its effect.',
		issue: 'Errors across preliminary investigation, warrant, motion to quash, arraignment, pre-trial, demurrer and promulgation.',
		alac: {
			answer: 'Seven errors; the plea and the promulgation must be redone, and the case should have been remanded for PI.',
			legalBasis: 'Rule 112, Secs. 1, 3, 5 (PI required; personal evaluation for warrants); Rule 117, Sec. 3 and Larrañaga (absence of PI not a ground to quash — remand instead); Rule 116, Sec. 1(d) (guilty plea with exculpatory claim → not guilty); Rule 118, Sec. 1 (pre-trial mandatory); Rule 119, Sec. 23 (demurrer without leave); Rule 120, Sec. 6 (promulgation by reading in the presence of the accused).',
			application: '(1) No PI despite the penalty. (2) Warrant without personal evaluation of supporting evidence. (3) The motion to quash was correctly denied as a quash, but the court should have treated it as a request for PI and remanded. (4) "I only borrowed the money" is exculpatory — a plea of not guilty should have been entered. (5) Pre-trial cannot be skipped. (6) The denial of the demurrer without leave waived defense evidence — but this is moot if the plea is invalid. (7) Mailing is not promulgation.',
			conclusion: 'Set aside the proceedings from arraignment; remand for preliminary investigation; re-arraign; hold pre-trial; try the case; promulgate properly.'
		},
		keys: 'Larrañaga; Sec. 1(d); Rule 118, Sec. 1; Sec. 23; Rule 120, Sec. 6'
	},
	{
		cat: 'G', level: 5, topic: 'Prescription and variance', rules: 'Rules 110, 120; prescription module', title: 'Mock — lesser offense after an early complaint',
		facts: 'On July 1, 2026, A punches B. On August 15, 2026, B files a complaint with the city prosecutor for the punch. On October 30, 2026, the prosecutor files an information for less serious physical injuries. A pleads not guilty. At trial, the medical certificate shows the injury healed in five days. The court convicts A of slight physical injuries.',
		q: 'Was the conviction proper? Would your answer change if B had gone to the prosecutor only on September 10, 2026?',
		issue: 'Whether a lesser included light offense had prescribed when the information was filed, given an earlier complaint before the prosecutor.',
		alac: {
			answer: 'Yes on the given facts. On the September 10 variation, no.',
			legalBasis: 'RPC Art. 90 (light offenses: two months); Art. 91 (interruption by the filing of the complaint or information); People v. Consebido (2025): henceforth, filing the complaint before the DOJ tolls prescription even for offenses covered by the 2022 Expedited Rules; Corpus v. People (2023): no conviction for a lesser offense that had prescribed when the information was filed; Rule 120, Secs. 4–5 (variance).',
			application: 'Slight physical injuries is a light offense: two months from July 1, 2026. B\'s complaint before the prosecutor (August 15) came within two months and after Consebido, so it tolled the period. When the information was filed on October 30, the lesser offense had not prescribed; conviction for it as an offense included in the one charged is proper. On the variation, the two months ended on September 1, 2026 — before any complaint — so the lesser offense had prescribed, and under Corpus A cannot be convicted of it even though the charge for less serious physical injuries (5 years) was timely.',
			conclusion: 'Affirm the conviction. On the variation, acquit A of slight physical injuries.'
		},
		missing: 'Whether the injuries were immediately known (the period runs from discovery); whether the prosecutor dismissed the complaint at any point (the period would run again).',
		trap: 'Applying Corpus\'s statement that only a court filing tolls for summary-procedure offenses — Consebido abandoned it prospectively. Corpus\'s lesser-offense holding still stands.',
		keys: 'Art. 90; Consebido; Corpus; variance'
	},
	{
		cat: 'G', level: 5, topic: 'Bail, absentia and promulgation', rules: 'Rules 114, 115, 116, 120', title: 'Mock — the disappearing accused',
		facts: 'B, charged with homicide, posts bail. Before arraignment, he disappears. The court issues a warrant and forfeits the bail; the surety produces nothing within 30 days. Six months later, B is arrested, arraigned and posts a new bond. During trial he again disappears; the court proceeds. On promulgation day, B is absent; the judgment of conviction is recorded in the docket. Twelve days later, B surrenders and moves for leave, claiming he was in hiding because of threats.',
		q: 'Resolve: (a) the surety\'s liability; (b) the validity of trial in absentia; (c) B\'s motion for leave.',
		issue: 'Forfeiture of bail; trial in absentia; regaining remedies after promulgation in absentia.',
		alac: {
			answer: '(a) Judgment against the surety; mitigation only if B is surrendered (by the surety) or acquitted. (b) Valid as to the second disappearance. (c) Grant only if he proves a justifiable cause.',
			legalBasis: 'Rule 114, Sec. 21 (30 days to produce and explain; no mitigation unless surrendered or acquitted); Const., Art. III, Sec. 14(2) and Rule 115, Sec. 1(c) (trial in absentia after arraignment, notice, unjustified absence); Rule 120, Sec. 6 (surrender and motion within 15 days; justifiable cause).',
			application: '(a) The surety failed within 30 days; B\'s later arrest by the authorities is not a surrender by the surety. (b) The first disappearance (before arraignment) stalled the case; after arraignment, notice and unjustified absence allowed trial in absentia. (c) B surrendered and moved within 15 days; whether "threats" are justifiable depends on proof.',
			conclusion: 'Enforce the first bond; uphold the trial; rule on the motion according to the evidence of threats.'
		},
		keys: 'Rule 114, Sec. 21; trial in absentia; Rule 120, Sec. 6'
	}
];

export function renderMockExam() {
	const out: string[] = [];
	out.push(`<h2 class="sg-h2" id="mock-exam">Integrated Mock Examination — Rules 110–120</h2>`);
	out.push(
		box(
			'neutral',
			'Instructions',
			ul([
				'Time: 3 hours. Answer on paper before opening the answer key in the next section.',
				'Enumerations: give the complete list, then one to three sentences per item.',
				'Comparisons: define both, then give parallel differences and the decisive distinction.',
				'True or false: answer TRUE or FALSE, then justify in one or two sentences with the rule or case.',
				'Problems: use the ten-step method and write in ALAC. Identify missing facts where the answer depends on them.',
				'The Rules involved in each question are shown only in the answer key.'
			])
		)
	);
	out.push(renderPracticeSets('M', mockItems, LABELS));
	out.push(p(`<a href="#mock-answers">Go to the answer key →</a>`));
	return out.join('\n');
}

export function renderMockAnswers() {
	const out: string[] = [];
	out.push(`<h2 class="sg-h2" id="mock-answers">Mock Examination — Answer Key (with ALAC)</h2>`);
	out.push(
		`<p class="sg-intro">Numbers match the mock examination. The blue tag shows the Rules involved. Situational answers use Issue → Answer → Applicable rule → Explanation → Application → Conclusion (IRAC and ALAC in one block), followed by missing facts, traps and later developments.</p>`
	);
	out.push(renderAnswerKey('M', mockItems, true, LABELS));
	return out.join('\n');
}
