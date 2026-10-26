import { useState } from 'react';
import { actions, commitmentById, isOffPlatform } from '../data.ts';
import { ACTION_KIND_LABELS, IMPACT_LABELS, IMPACTS, type Impact } from '../model.ts';
import { formatDate, plural } from '../format.ts';
import { ImpactBadge, SourceList } from './Badges.tsx';

type Scope = 'all' | 'platform' | 'off';

const SCOPE_LABELS: Record<Scope, string> = {
  all: 'All',
  platform: 'On the platform',
  off: 'Off-platform',
};

interface Props {
  highlightId: string | null;
  onOpenCommitment: (id: string) => void;
}

export function ActivityFeed({ highlightId, onOpenCommitment }: Props) {
  const [scope, setScope] = useState<Scope>('all');
  const [impact, setImpact] = useState<Impact | 'all'>('all');

  const shown = actions.filter(
    (a) =>
      (scope === 'all' || (scope === 'off') === isOffPlatform(a)) && (impact === 'all' || a.impact === impact),
  );

  return (
    <section className="card" aria-labelledby="activity-title">
      <div className="card-head">
        <div>
          <h2 id="activity-title">Activity log</h2>
          <p className="muted">
            Everything the government (and premier-designate) has done or announced, newest first. Off-platform items
            are things they never campaigned on.
          </p>
        </div>
      </div>

      <div className="filter-row">
        <div className="segmented" role="group" aria-label="Platform link">
          {(Object.keys(SCOPE_LABELS) as Scope[]).map((s) => (
            <button type="button" key={s} aria-pressed={scope === s} onClick={() => setScope(s)}>
              {SCOPE_LABELS[s]}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Impact</span>
          <select value={impact} onChange={(e) => setImpact(e.target.value as Impact | 'all')}>
            <option value="all">All impacts</option>
            {IMPACTS.map((i) => (
              <option key={i} value={i}>
                {IMPACT_LABELS[i]}
              </option>
            ))}
          </select>
        </label>
        <span className="muted filter-count">{plural(shown.length, 'item')}</span>
      </div>

      {shown.length === 0 ? (
        <p className="empty">Nothing matches these filters yet.</p>
      ) : (
        <ol className="feed">
          {shown.map((a) => (
            <li key={a.id} id={`a-${a.id}`} className={`feed-item${highlightId === a.id ? ' is-highlighted' : ''}`}>
              <div className="feed-meta">
                <time dateTime={a.date}>{formatDate(a.date)}</time>
                <span className="tag">{ACTION_KIND_LABELS[a.kind]}</span>
                <ImpactBadge impact={a.impact} />
                {isOffPlatform(a) && <span className="tag tag-off">Off-platform</span>}
                {a.weight === 3 && <span className="tag tag-major">Major</span>}
              </div>
              <h3>{a.title}</h3>
              <p>{a.summary}</p>
              {a.note && (
                <p className="why">
                  <strong>Why it matters:</strong> {a.note}
                </p>
              )}
              {!!a.promiseIds?.length && (
                <div className="linked">
                  <span className="muted">Linked promises:</span>
                  {a.promiseIds.map((id) => (
                    <button type="button" className="link-button" key={id} onClick={() => onOpenCommitment(id)}>
                      {commitmentById.get(id)?.text ?? id}
                    </button>
                  ))}
                </div>
              )}
              <SourceList sources={a.sources} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
