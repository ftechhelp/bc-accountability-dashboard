import { IMPACT_ICONS, IMPACT_LABELS, STATUS_LABELS, type Impact, type Status } from '../model.ts';
import type { Source } from '../model.ts';
import { formatDate } from '../format.ts';

export function ImpactBadge({ impact }: { impact: Impact }) {
  return (
    <span className={`badge impact-${impact}`}>
      <span className="badge-icon" aria-hidden="true">
        {IMPACT_ICONS[impact]}
      </span>
      {IMPACT_LABELS[impact]}
    </span>
  );
}

const STATUS_ICONS: Record<Status, string> = {
  not_started: '○',
  in_progress: '◐',
  partial: '◑',
  kept: '●',
  broken: '✕',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="badge-icon" aria-hidden="true">
        {STATUS_ICONS[status]}
      </span>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function MajorTag() {
  return <span className="tag tag-major">Major</span>;
}

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="sources">
      {sources.map((s) => (
        <li key={s.url + s.title}>
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.title}
          </a>
          {(s.publisher || s.date) && (
            <span className="muted">
              {' '}
              · {[s.publisher, s.date && formatDate(s.date)].filter(Boolean).join(', ')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
