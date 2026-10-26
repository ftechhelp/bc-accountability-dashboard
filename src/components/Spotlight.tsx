import { useState } from 'react';
import { spotlight } from '../data.ts';
import { ACTION_KIND_LABELS, CATEGORIES, IMPACT_ICONS, STATUS_LABELS } from '../model.ts';
import { formatShortDate } from '../format.ts';

const INITIAL = 6;

interface Props {
  impact: 'regressive' | 'progressive';
  title: string;
  intro: string;
  onOpenCommitment: (id: string) => void;
  onOpenAction: (id: string) => void;
}

export function Spotlight({ impact, title, intro, onOpenCommitment, onOpenAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { actions, commitments } = spotlight(impact);

  const items = [
    ...actions.map((a) => ({
      key: `a-${a.id}`,
      kicker: `Action · ${formatShortDate(a.date)} · ${ACTION_KIND_LABELS[a.kind]}`,
      title: a.title,
      note: a.note ?? a.summary,
      onOpen: () => onOpenAction(a.id),
    })),
    ...commitments.map((c) => ({
      key: `c-${c.id}`,
      kicker: `Promise · ${CATEGORIES[c.category]} · ${STATUS_LABELS[c.status]}${c.weight === 3 ? ' · Major' : ''}`,
      title: c.text,
      note: c.note,
      onOpen: () => onOpenCommitment(c.id),
    })),
  ];
  const visible = expanded ? items : items.slice(0, INITIAL);

  return (
    <section className={`card spotlight spotlight-${impact}`} aria-labelledby={`spot-${impact}`}>
      <h2 id={`spot-${impact}`}>
        <span className={`badge-icon impact-${impact}`} aria-hidden="true">
          {IMPACT_ICONS[impact]}
        </span>{' '}
        {title}
      </h2>
      <p className="muted">{intro}</p>
      <ul className="spot-list">
        {visible.map((item) => (
          <li key={item.key}>
            <button type="button" className={`spot-item impact-edge-${impact}`} onClick={item.onOpen}>
              <span className="spot-kicker">{item.kicker}</span>
              <span className="spot-title">{item.title}</span>
              {item.note && <span className="spot-note">{item.note}</span>}
            </button>
          </li>
        ))}
      </ul>
      {items.length > INITIAL && (
        <button type="button" className="ghost-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer' : `Show all ${items.length}`}
        </button>
      )}
    </section>
  );
}
