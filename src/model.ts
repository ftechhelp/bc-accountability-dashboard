// Shared data model for the tracker. Both the app and scripts/validate.ts
// import from here, so keep it to erasable TypeScript (no enums/namespaces).

export const IMPACTS = ['regressive', 'mixed', 'neutral', 'progressive'] as const;
export type Impact = (typeof IMPACTS)[number];

export const IMPACT_LABELS: Record<Impact, string> = {
  regressive: 'Regressive',
  mixed: 'Mixed',
  neutral: 'Neutral',
  progressive: 'Progressive',
};

// Icons pair with color so impact is never encoded by color alone.
export const IMPACT_ICONS: Record<Impact, string> = {
  regressive: '▼',
  mixed: '◆',
  neutral: '●',
  progressive: '▲',
};

export const STATUSES = ['not_started', 'in_progress', 'partial', 'kept', 'broken'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  partial: 'Partly kept',
  kept: 'Kept',
  broken: 'Broken',
};

export const ACTION_KINDS = [
  'legislation',
  'budget',
  'cut',
  'regulation',
  'appointment',
  'announcement',
  'statement',
  'other',
] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const ACTION_KIND_LABELS: Record<ActionKind, string> = {
  legislation: 'Legislation',
  budget: 'Budget',
  cut: 'Cut',
  regulation: 'Regulation',
  appointment: 'Appointment',
  announcement: 'Announcement',
  statement: 'Statement',
  other: 'Other',
};

export const CATEGORIES = {
  indigenous: 'Indigenous rights',
  climate: 'Climate & energy',
  environment: 'Environment & wildlife',
  resources: 'Forestry, mining & farming',
  economy: 'Economy & red tape',
  taxes: 'Taxes',
  budget: 'Budget & public service',
  health: 'Health care',
  drugs: 'Drugs & addiction',
  housing: 'Housing',
  social: 'Disability & family supports',
  education: 'Education & child care',
  justice: 'Public safety & justice',
  transport: 'Transportation',
  wildfire: 'Wildfire & emergencies',
  democracy: 'Government & democracy',
} as const;
export type Category = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];

/** 1 = minor, 2 = notable, 3 = major. Drives the red-flag and good-news spotlights. */
export type Weight = 1 | 2 | 3;

export interface Source {
  title: string;
  url: string;
  publisher?: string;
  date?: string; // YYYY-MM-DD
}

export interface Update {
  date: string; // YYYY-MM-DD
  text: string;
  /** Present when this update changed the commitment's status. */
  status?: Status;
  sources?: Source[];
}

export interface Commitment {
  id: string;
  category: Category;
  /** The commitment, faithful to the platform's wording. */
  text: string;
  impact: Impact;
  weight: Weight;
  /** Why it matters, through a progressive lens. Required for weight 3, and for regressive/mixed at weight 2. */
  note?: string;
  status: Status;
  /** Falls back to meta.platformSources when omitted. */
  sources?: Source[];
  updates?: Update[];
}

export interface Action {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  kind: ActionKind;
  category: Category;
  impact: Impact;
  weight: Weight;
  note?: string;
  /** Commitments this action advances or breaks. Empty means off-platform. */
  promiseIds?: string[];
  sources: Source[];
}

export interface Gap {
  title: string;
  text: string;
  sources: Source[];
}

export interface Meta {
  lastUpdated: string;
  government: {
    premier: string;
    party: string;
    electionDate: string;
    seats: string;
    swornIn: string | null;
    statusNote: string;
    sources: Source[];
  };
  lens: string;
  platformSources: Source[];
  gaps: Gap[];
}
