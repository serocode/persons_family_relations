export interface McqOption {
	id: number;
	text: string;
}

export type McqTag = 'memorization' | 'requisites' | 'exceptions' | 'effects' | 'jurisprudence';

export interface McqQuestion {
	/** Globally unique and stable: `<moduleId>:<topicId>:<n>`. Used as the localStorage key. */
	id: string;
	topic: string;
	topicId?: string;
	tag?: McqTag;
	question: string;
	options: string[];
	correctIndex: number;
	explanation: string;
	/** Codal provision / jurisprudence cited for the item. */
	legalBasis?: string;
	hint?: string;
}

export interface AlacEssay {
	id: string;
	title: string;
	topic: string;
	factPattern: string;
	/** The question the examiner asks, e.g. "Is Juan liable? Discuss, using the ALAC method." */
	question?: string;
	modelAnswer: {
		answer: string; // Categorical affirmative/negative
		legalBasis: string; // Codal provision, statute, or doctrine
		application: string; // Intertwining facts with law elements
		conclusion: string; // Final disposition
	};
}

export interface CaseDigest {
	id: string;
	title: string;
	citation: string;
	topic: string;
	/** Syllabus part the digest sits under. */
	part?: string;
	keyRule: string;
	summary: string;
	/** Flagged in the source as not independently verified. */
	unverified?: boolean;
}

export type SubjectCategory =
	| 'Civil Law'
	| 'Civil Law — Supplement'
	| 'Political Law'
	| 'Criminal Law'
	| 'Remedial Law'
	| 'Legal Method';

export interface ModuleTopic {
	id: string;
	name: string;
	eyebrow: string;
	desc: string;
}

export interface LegendItem {
	/** Name of a CSS color variable: yellow | green | blue | orange | red | purple */
	color: string;
	label: string;
}

export interface LawModule {
	id: string; // 'pfr' | 'pfr_cases' | 'consti1' | 'crim1' | 'statcon' | 'statcon2' | 'crimpro'
	title: string;
	subjectCategory: SubjectCategory;
	eyebrow?: string;
	description: string;
	legalScope: string;
	topics?: ModuleTopic[];
	studyGuideIntro?: string;
	legend?: LegendItem[];
	/** Trusted, first-party HTML (headings carry ids for the outline). */
	studyGuideHtml: string;
	/** "Watch for" callouts (HTML) keyed by topic id. */
	watchFor?: Record<string, string>;
	mcqs: McqQuestion[];
	essays: AlacEssay[];
	cases?: CaseDigest[];
}

export interface UserMcqAttempt {
	questionId: string;
	selectedIndex: number;
	isCorrect: boolean;
	timestamp: number;
}

export interface UserEssayDraft {
	essayId: string;
	answer: string;
	legalBasis: string;
	application: string;
	conclusion: string;
	isMastered: boolean;
	needsReview?: boolean;
	updatedAt: number;
}

export interface UserModuleProgress {
	mcqAttempts: Record<string, UserMcqAttempt>; // questionId -> attempt
	essayDrafts: Record<string, UserEssayDraft>; // essayId -> draft
	bookmarkedMcqs: string[]; // questionIds
}
