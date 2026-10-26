import { useState } from 'react';
import { categoryLean, commitments, type CategoryLean } from '../data.ts';
import { CATEGORIES, IMPACT_ICONS, IMPACT_LABELS, IMPACTS, type Category } from '../model.ts';
import { plural } from '../format.ts';

const maxArm = Math.max(1, ...categoryLean.flatMap((r) => [r.counts.regressive, r.counts.progressive]));

function armWidth(n: number): string {
  // Leave room beside the bar for its tip label.
  return `calc((100% - 2rem) * ${n / maxArm})`;
}

function topItem(category: Category, impact: 'regressive' | 'progressive') {
  return commitments
    .filter((c) => c.category === category && c.impact === impact)
    .toSorted((a, b) => b.weight - a.weight)[0];
}

function Tooltip({ row, top }: { row: CategoryLean; top: number }) {
  const worst = topItem(row.category, 'regressive');
  const best = topItem(row.category, 'progressive');
  return (
    <div className="chart-tooltip" style={{ top }} role="status">
      <strong>{CATEGORIES[row.category]}</strong>
      <ul className="tooltip-counts">
        {IMPACTS.map((i) => (
          <li key={i}>
            <span className={`badge-icon impact-${i}`} aria-hidden="true">
              {IMPACT_ICONS[i]}
            </span>
            {IMPACT_LABELS[i]} <span className="num">{row.counts[i]}</span>
          </li>
        ))}
      </ul>
      {worst && (
        <p>
          <span className="muted">Biggest concern:</span> {worst.text}
        </p>
      )}
      {best && (
        <p>
          <span className="muted">Best item:</span> {best.text}
        </p>
      )}
      <p className="muted">Click to see all {plural(row.total, 'promise')}.</p>
    </div>
  );
}

function LeanTable() {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Policy area</th>
            {IMPACTS.map((i) => (
              <th scope="col" key={i} className="num">
                {IMPACT_LABELS[i]}
              </th>
            ))}
            <th scope="col" className="num">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {categoryLean.map((row) => (
            <tr key={row.category}>
              <th scope="row">{CATEGORIES[row.category]}</th>
              {IMPACTS.map((i) => (
                <td key={i} className="num">
                  {row.counts[i]}
                </td>
              ))}
              <td className="num">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeanChart({ onSelectCategory }: { onSelectCategory: (c: Category) => void }) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [hover, setHover] = useState<{ row: CategoryLean; top: number } | null>(null);

  function show(row: CategoryLean, el: HTMLElement) {
    setHover({ row, top: el.offsetTop + el.offsetHeight + 4 });
  }

  return (
    <section className="card" aria-labelledby="lean-title">
      <div className="card-head">
        <div>
          <h2 id="lean-title">Where the platform leans, by policy area</h2>
          <p className="muted">
            Count of platform promises rated regressive vs. progressive. Mixed and neutral promises are counted at
            right.
          </p>
        </div>
        <div className="segmented" role="group" aria-label="View as">
          <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>
            Chart
          </button>
          <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
            Table
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <LeanTable />
      ) : (
        <div className="lean-chart" onMouseLeave={() => setHover(null)}>
          <div className="lean-legend" aria-hidden="true">
            <span className="lean-legend-left">
              <span className="swatch impact-regressive" /> {IMPACT_ICONS.regressive} Regressive
            </span>
            <span className="lean-legend-right">
              {IMPACT_ICONS.progressive} Progressive <span className="swatch impact-progressive" />
            </span>
          </div>
          {categoryLean.map((row) => {
            const { regressive, progressive, mixed, neutral } = row.counts;
            return (
              <button
                type="button"
                key={row.category}
                className="lean-row"
                onMouseEnter={(e) => show(row, e.currentTarget)}
                onFocus={(e) => show(row, e.currentTarget)}
                onBlur={() => setHover(null)}
                onClick={() => onSelectCategory(row.category)}
                aria-label={`${CATEGORIES[row.category]}: ${regressive} regressive, ${progressive} progressive, ${mixed} mixed, ${neutral} neutral. Show these promises.`}
              >
                <span className="lean-label">{CATEGORIES[row.category]}</span>
                <span className="lean-arm lean-arm-left">
                  {regressive > 0 && (
                    <>
                      <span className="lean-value">{regressive}</span>
                      <span className="lean-bar impact-regressive" style={{ width: armWidth(regressive) }} />
                    </>
                  )}
                </span>
                <span className="lean-arm lean-arm-right">
                  {progressive > 0 && (
                    <>
                      <span className="lean-bar impact-progressive" style={{ width: armWidth(progressive) }} />
                      <span className="lean-value">{progressive}</span>
                    </>
                  )}
                </span>
                <span className="lean-other muted">
                  {mixed > 0 && `${mixed} mixed`}
                  {mixed > 0 && neutral > 0 && ' · '}
                  {neutral > 0 && `${neutral} neutral`}
                </span>
              </button>
            );
          })}
          {hover && <Tooltip row={hover.row} top={hover.top} />}
        </div>
      )}
    </section>
  );
}
