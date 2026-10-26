import { actionsByCommitment, commitments, sourcesFor } from '../data.ts';
import {
  CATEGORIES,
  CATEGORY_KEYS,
  IMPACT_LABELS,
  IMPACTS,
  STATUS_LABELS,
  STATUSES,
  type Category,
  type Commitment,
  type Impact,
  type Status,
} from '../model.ts';
import { formatDate, plural } from '../format.ts';
import { ImpactBadge, MajorTag, SourceList, StatusBadge } from './Badges.tsx';

export interface Filters {
  query: string;
  category: Category | 'all';
  impact: Impact | 'all';
  status: Status | 'all';
  majorOnly: boolean;
}

export const NO_FILTERS: Filters = { query: '', category: 'all', impact: 'all', status: 'all', majorOnly: false };

const IMPACT_ORDER = Object.fromEntries(IMPACTS.map((i, n) => [i, n])) as Record<Impact, number>;

function matches(c: Commitment, f: Filters): boolean {
  if (f.category !== 'all' && c.category !== f.category) return false;
  if (f.impact !== 'all' && c.impact !== f.impact) return false;
  if (f.status !== 'all' && c.status !== f.status) return false;
  if (f.majorOnly && c.weight < 3) return false;
  const q = f.query.trim().toLowerCase();
  if (q && !`${c.text} ${c.note ?? ''} ${CATEGORIES[c.category]}`.toLowerCase().includes(q)) return false;
  return true;
}

interface Props {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  openIds: Set<string>;
  onToggle: (id: string, open: boolean) => void;
  onOpenAction: (id: string) => void;
}

function CommitmentItem({
  c,
  open,
  onToggle,
  onOpenAction,
}: {
  c: Commitment;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  onOpenAction: (id: string) => void;
}) {
  const linked = actionsByCommitment.get(c.id) ?? [];
  const updates = (c.updates ?? []).toSorted((a, b) => b.date.localeCompare(a.date));
  return (
    <details
      id={`c-${c.id}`}
      className="promise"
      open={open}
      onToggle={(e) => {
        if (e.currentTarget.open !== open) onToggle(c.id, e.currentTarget.open);
      }}
    >
      <summary>
        <span className="promise-text">{c.text}</span>
        <span className="promise-meta">
          <ImpactBadge impact={c.impact} />
          <StatusBadge status={c.status} />
          {c.weight === 3 && <MajorTag />}
          {updates.length > 0 && <span className="muted">{plural(updates.length, 'update')}</span>}
          {linked.length > 0 && <span className="muted">{plural(linked.length, 'action')}</span>}
        </span>
      </summary>
      <div className="promise-body">
        {c.note && (
          <p className="why">
            <strong>Why it matters:</strong> {c.note}
          </p>
        )}
        {updates.length > 0 && (
          <div>
            <h4>Updates</h4>
            <ol className="timeline">
              {updates.map((u) => (
                <li key={u.date + u.text}>
                  <time dateTime={u.date}>{formatDate(u.date)}</time>
                  {u.status && <StatusBadge status={u.status} />}
                  <p>{u.text}</p>
                  {u.sources && <SourceList sources={u.sources} />}
                </li>
              ))}
            </ol>
          </div>
        )}
        {linked.length > 0 && (
          <div>
            <h4>Related actions</h4>
            <ul className="plain-list">
              {linked.map((a) => (
                <li key={a.id}>
                  <button type="button" className="link-button" onClick={() => onOpenAction(a.id)}>
                    {formatDate(a.date)}: {a.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h4>Sources</h4>
          <SourceList sources={sourcesFor(c)} />
        </div>
      </div>
    </details>
  );
}

export function PromiseTracker({ filters, onFiltersChange, openIds, onToggle, onOpenAction }: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => onFiltersChange({ ...filters, [key]: value });
  const shown = commitments.filter((c) => matches(c, filters));
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  const groups = CATEGORY_KEYS.map((category) => ({
    category,
    items: shown
      .filter((c) => c.category === category)
      .toSorted((a, b) => b.weight - a.weight || IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="card" aria-labelledby="promises-title">
      <div className="card-head">
        <div>
          <h2 id="promises-title">Every promise</h2>
          <p className="muted">
            The platform's commitments, grouped by policy area. Open one for why it matters, updates and sources.
          </p>
        </div>
      </div>

      <div className="filter-row">
        <label className="field field-grow">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="e.g. DRIPA, LNG, child care"
            onChange={(e) => set('query', e.target.value)}
          />
        </label>
        <label className="field">
          <span>Area</span>
          <select value={filters.category} onChange={(e) => set('category', e.target.value as Filters['category'])}>
            <option value="all">All areas</option>
            {CATEGORY_KEYS.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Impact</span>
          <select value={filters.impact} onChange={(e) => set('impact', e.target.value as Filters['impact'])}>
            <option value="all">All impacts</option>
            {IMPACTS.map((i) => (
              <option key={i} value={i}>
                {IMPACT_LABELS[i]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select value={filters.status} onChange={(e) => set('status', e.target.value as Filters['status'])}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.majorOnly} onChange={(e) => set('majorOnly', e.target.checked)} />
          Major only
        </label>
        {isFiltered && (
          <button type="button" className="ghost-button" onClick={() => onFiltersChange(NO_FILTERS)}>
            Reset
          </button>
        )}
        <span className="muted filter-count">
          {shown.length} of {commitments.length}
        </span>
      </div>

      {groups.length === 0 ? (
        <p className="empty">No promises match these filters.</p>
      ) : (
        groups.map((g) => (
          <div className="promise-group" key={g.category}>
            <h3>
              {CATEGORIES[g.category]} <span className="muted">{g.items.length}</span>
            </h3>
            {g.items.map((c) => (
              <CommitmentItem key={c.id} c={c} open={openIds.has(c.id)} onToggle={onToggle} onOpenAction={onOpenAction} />
            ))}
          </div>
        ))
      )}
    </section>
  );
}
