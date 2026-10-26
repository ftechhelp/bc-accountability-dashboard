import { useEffect, useState } from 'react';
import { commitmentById, meta } from './data.ts';
import type { Category } from './model.ts';
import { formatDate } from './format.ts';
import { Header } from './components/Header.tsx';
import { KpiRow } from './components/KpiRow.tsx';
import { LeanChart } from './components/LeanChart.tsx';
import { Spotlight } from './components/Spotlight.tsx';
import { ActivityFeed } from './components/ActivityFeed.tsx';
import { Gaps } from './components/Gaps.tsx';
import { NO_FILTERS, PromiseTracker, type Filters } from './components/PromiseTracker.tsx';
import { SourceList } from './components/Badges.tsx';

export function App() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [highlightAction, setHighlightAction] = useState<string | null>(null);
  // Remounting the feed clears its filters so a linked action is always visible.
  const [feedKey, setFeedKey] = useState(0);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!scrollTarget) return;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(scrollTarget)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    setScrollTarget(null);
  }, [scrollTarget]);

  function openCommitment(id: string) {
    if (!commitmentById.has(id)) return;
    setFilters(NO_FILTERS);
    setOpenIds((prev) => new Set(prev).add(id));
    setScrollTarget(`c-${id}`);
    history.replaceState(null, '', `#c-${id}`);
  }

  function openAction(id: string) {
    setFeedKey((k) => k + 1);
    setHighlightAction(id);
    setScrollTarget(`a-${id}`);
  }

  function toggleCommitment(id: string, open: boolean) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function selectCategory(category: Category) {
    setFilters({ ...NO_FILTERS, category });
    setScrollTarget('promises');
  }

  // Deep links like #c-dripa-repeal open that promise on load.
  useEffect(() => {
    const match = /^#c-(.+)$/.exec(location.hash);
    if (match) openCommitment(decodeURIComponent(match[1]));
  }, []);

  return (
    <>
      <Header />
      <main className="wrap">
        <section id="overview" className="stack">
          <KpiRow />
          <LeanChart onSelectCategory={selectCategory} />
        </section>

        <section id="watch" className="two-col">
          <Spotlight
            impact="regressive"
            title="Red flags"
            intro="Cuts, rollbacks and regressive moves, with the most serious first."
            onOpenCommitment={openCommitment}
            onOpenAction={openAction}
          />
          <Spotlight
            impact="progressive"
            title="The good stuff"
            intro="Promises worth supporting, and holding them to."
            onOpenCommitment={openCommitment}
            onOpenAction={openAction}
          />
        </section>

        <section id="activity">
          <ActivityFeed key={feedKey} highlightId={highlightAction} onOpenCommitment={openCommitment} />
        </section>

        <section id="gaps">
          <Gaps />
        </section>

        <section id="promises">
          <PromiseTracker
            filters={filters}
            onFiltersChange={setFilters}
            openIds={openIds}
            onToggle={toggleCommitment}
            onOpenAction={openAction}
          />
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <p>
            <strong>About the ratings.</strong> {meta.lens}
          </p>
          <p>
            Promises come from the party's platform and campaign releases. Data last updated{' '}
            {formatDate(meta.lastUpdated)}.
          </p>
          <SourceList sources={[...meta.platformSources, ...meta.government.sources]} />
        </div>
      </footer>
    </>
  );
}
