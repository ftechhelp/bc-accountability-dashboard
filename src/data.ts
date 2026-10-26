import metaJson from '../data/meta.json';
import promisesJson from '../data/promises.json';
import actionsJson from '../data/actions.json';
import {
  CATEGORY_KEYS,
  IMPACTS,
  type Action,
  type Category,
  type Commitment,
  type Impact,
  type Meta,
  type Source,
} from './model.ts';

export const meta = metaJson as Meta;
export const commitments = promisesJson as Commitment[];
/** Newest first. */
export const actions = (actionsJson as Action[]).toSorted((a, b) => b.date.localeCompare(a.date));

export const commitmentById = new Map(commitments.map((c) => [c.id, c]));

export const actionsByCommitment = new Map<string, Action[]>();
for (const a of actions) {
  for (const id of a.promiseIds ?? []) {
    actionsByCommitment.set(id, [...(actionsByCommitment.get(id) ?? []), a]);
  }
}

export function sourcesFor(c: Commitment): Source[] {
  return c.sources?.length ? c.sources : meta.platformSources;
}

export function isOffPlatform(a: Action): boolean {
  return !a.promiseIds?.length;
}

const ACTED_ON = new Set(['in_progress', 'partial', 'kept']);
export function isActedOn(c: Commitment): boolean {
  return ACTED_ON.has(c.status);
}

export type ImpactCounts = Record<Impact, number>;

function emptyCounts(): ImpactCounts {
  return Object.fromEntries(IMPACTS.map((i) => [i, 0])) as ImpactCounts;
}

export interface CategoryLean {
  category: Category;
  counts: ImpactCounts;
  total: number;
}

/** Impact counts per policy area, most regressive-leaning first. */
export const categoryLean: CategoryLean[] = CATEGORY_KEYS.map((category) => {
  const counts = emptyCounts();
  let total = 0;
  for (const c of commitments) {
    if (c.category !== category) continue;
    counts[c.impact]++;
    total++;
  }
  return { category, counts, total };
})
  .filter((row) => row.total > 0)
  .sort(
    (a, b) =>
      b.counts.regressive - b.counts.progressive - (a.counts.regressive - a.counts.progressive) ||
      b.counts.regressive - a.counts.regressive,
  );

/** Spotlight lists: actions first (newest), then commitments by weight. */
export function spotlight(impact: 'regressive' | 'progressive') {
  const acts = actions.filter((a) => a.impact === impact && a.weight >= 2);
  const promises = commitments
    .filter((c) => c.impact === impact && c.weight >= 2)
    .toSorted((a, b) => b.weight - a.weight || CATEGORY_KEYS.indexOf(a.category) - CATEGORY_KEYS.indexOf(b.category));
  return { actions: acts, commitments: promises };
}
