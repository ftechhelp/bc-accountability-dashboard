import { actions, commitments, isActedOn, isOffPlatform } from '../data.ts';

interface Tile {
  label: string;
  value: number;
  detail: string;
  mark?: 'regressive' | 'progressive';
}

function count<T>(items: T[], pred: (item: T) => boolean): number {
  return items.reduce((n, item) => n + (pred(item) ? 1 : 0), 0);
}

export function KpiRow() {
  const regressive = commitments.filter((c) => c.impact === 'regressive');
  const progressive = commitments.filter((c) => c.impact === 'progressive');

  const tiles: Tile[] = [
    {
      label: 'Promises tracked',
      value: commitments.length,
      detail: `${count(commitments, (c) => c.weight === 3)} rated major`,
    },
    {
      label: 'Acted on',
      value: count(commitments, isActedOn),
      detail: `${count(commitments, (c) => c.status === 'kept')} kept · ${count(commitments, (c) => c.status === 'in_progress')} in progress`,
    },
    {
      label: 'Broken',
      value: count(commitments, (c) => c.status === 'broken'),
      detail: 'abandoned or reversed',
    },
    {
      label: 'Regressive promises',
      value: regressive.length,
      detail: `${count(regressive, isActedOn)} acted on so far`,
      mark: 'regressive',
    },
    {
      label: 'Progressive promises',
      value: progressive.length,
      detail: `${count(progressive, isActedOn)} delivered or underway`,
      mark: 'progressive',
    },
    {
      label: 'Actions logged',
      value: actions.length,
      detail: `${count(actions, isOffPlatform)} not in the platform`,
    },
  ];

  return (
    <div className="kpi-row">
      {tiles.map((t) => (
        <div className="kpi" key={t.label}>
          <div className="kpi-label">
            {t.mark && <span className={`kpi-mark impact-${t.mark}`} aria-hidden="true" />}
            {t.label}
          </div>
          <div className="kpi-value">{t.value.toLocaleString('en-CA')}</div>
          <div className="kpi-detail">{t.detail}</div>
        </div>
      ))}
    </div>
  );
}
