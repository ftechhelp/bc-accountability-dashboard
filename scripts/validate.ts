// Checks data/*.json against the model before the app is built.
// Run with `npm run validate` (Node strips the TypeScript types natively).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  ACTION_KINDS,
  CATEGORIES,
  IMPACTS,
  STATUSES,
  type Action,
  type Commitment,
  type Meta,
  type Source,
  type Update,
} from '../src/model.ts';

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
const errors: string[] = [];
const warnings: string[] = [];

function load<T>(file: string): T {
  try {
    return JSON.parse(readFileSync(dataDir + file, 'utf8')) as T;
  } catch (err) {
    console.error(`✗ data/${file}: ${(err as Error).message}`);
    process.exit(1);
  }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isDate(value: unknown): value is string {
  return typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(value));
}

function oneOf<T extends string>(list: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && (list as readonly string[]).includes(value);
}

function checkSources(where: string, sources: Source[] | undefined, required: boolean) {
  if (!sources || sources.length === 0) {
    if (required) errors.push(`${where}: needs at least one source`);
    return;
  }
  sources.forEach((s, i) => {
    if (!s.title?.trim()) errors.push(`${where}: source ${i + 1} has no title`);
    if (!/^https:\/\/\S+$/.test(s.url ?? '')) errors.push(`${where}: source ${i + 1} needs an https url`);
    if (s.date !== undefined && !isDate(s.date)) errors.push(`${where}: source ${i + 1} date must be YYYY-MM-DD`);
  });
}

// Major items, and anything rated regressive or mixed at weight 2+, must explain why.
function checkNote(where: string, item: { weight: number; impact: string; note?: string }) {
  const needsNote = item.weight === 3 || (item.weight >= 2 && (item.impact === 'regressive' || item.impact === 'mixed'));
  if (needsNote && !item.note?.trim()) errors.push(`${where}: weight ${item.weight} ${item.impact} items need a note`);
}

function checkCommon(where: string, item: Commitment | Action) {
  if (!oneOf(Object.keys(CATEGORIES), item.category)) errors.push(`${where}: unknown category "${item.category}"`);
  if (!oneOf(IMPACTS, item.impact)) errors.push(`${where}: unknown impact "${item.impact}"`);
  if (![1, 2, 3].includes(item.weight)) errors.push(`${where}: weight must be 1, 2 or 3`);
  checkNote(where, item);
}

const meta = load<Meta>('meta.json');
const commitments = load<Commitment[]>('promises.json');
const actions = load<Action[]>('actions.json');

// meta.json
if (!isDate(meta.lastUpdated)) errors.push('meta: lastUpdated must be YYYY-MM-DD');
if (meta.government?.swornIn !== null && !isDate(meta.government?.swornIn)) {
  errors.push('meta: government.swornIn must be null or YYYY-MM-DD');
}
checkSources('meta.government', meta.government?.sources, true);
checkSources('meta.platformSources', meta.platformSources, true);
meta.gaps?.forEach((g, i) => checkSources(`meta.gaps[${i}]`, g.sources, true));

// promises.json
const commitmentIds = new Set<string>();
for (const c of commitments) {
  const where = `promise "${c.id}"`;
  if (!ID_RE.test(c.id ?? '')) errors.push(`${where}: id must be kebab-case`);
  if (commitmentIds.has(c.id)) errors.push(`${where}: duplicate id`);
  commitmentIds.add(c.id);
  if (!c.text?.trim()) errors.push(`${where}: text is empty`);
  if (!oneOf(STATUSES, c.status)) errors.push(`${where}: unknown status "${c.status}"`);
  checkCommon(where, c);
  checkSources(where, c.sources, false);

  let lastStatusUpdate: Update | undefined;
  (c.updates ?? []).forEach((u, i) => {
    const uWhere = `${where} update ${i + 1}`;
    if (!isDate(u.date)) errors.push(`${uWhere}: date must be YYYY-MM-DD`);
    if (!u.text?.trim()) errors.push(`${uWhere}: text is empty`);
    if (u.status !== undefined && !oneOf(STATUSES, u.status)) errors.push(`${uWhere}: unknown status "${u.status}"`);
    checkSources(uWhere, u.sources, true);
    if (u.date > meta.lastUpdated) warnings.push(`${uWhere}: dated after meta.lastUpdated`);
    if (u.status && (!lastStatusUpdate || u.date >= lastStatusUpdate.date)) lastStatusUpdate = u;
  });
  if (lastStatusUpdate?.status && lastStatusUpdate.status !== c.status) {
    warnings.push(`${where}: status is "${c.status}" but latest status update says "${lastStatusUpdate.status}"`);
  }
  if (c.status !== 'not_started' && !(c.updates ?? []).some((u) => u.status)) {
    warnings.push(`${where}: status "${c.status}" has no update explaining it`);
  }
}

// actions.json
const actionIds = new Set<string>();
for (const a of actions) {
  const where = `action "${a.id}"`;
  if (!ID_RE.test(a.id ?? '')) errors.push(`${where}: id must be kebab-case`);
  if (actionIds.has(a.id)) errors.push(`${where}: duplicate id`);
  actionIds.add(a.id);
  if (!isDate(a.date)) errors.push(`${where}: date must be YYYY-MM-DD`);
  if (a.date > meta.lastUpdated) warnings.push(`${where}: dated after meta.lastUpdated`);
  if (!a.title?.trim()) errors.push(`${where}: title is empty`);
  if (!a.summary?.trim()) errors.push(`${where}: summary is empty`);
  if (!oneOf(ACTION_KINDS, a.kind)) errors.push(`${where}: unknown kind "${a.kind}"`);
  checkCommon(where, a);
  checkSources(where, a.sources, true);
  for (const pid of a.promiseIds ?? []) {
    if (!commitmentIds.has(pid)) errors.push(`${where}: promiseIds references unknown promise "${pid}"`);
  }
}

for (const w of warnings) console.warn(`! ${w}`);
for (const e of errors) console.error(`✗ ${e}`);

const offPlatform = actions.filter((a) => !a.promiseIds?.length).length;
console.log(
  `${errors.length ? '✗' : '✓'} ${commitments.length} promises, ${actions.length} actions (${offPlatform} off-platform), ` +
    `${meta.gaps?.length ?? 0} gaps — ${errors.length} errors, ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
