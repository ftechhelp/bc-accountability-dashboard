import { meta } from '../data.ts';
import { SourceList } from './Badges.tsx';

export function Gaps() {
  return (
    <section className="card" aria-labelledby="gaps-title">
      <h2 id="gaps-title">What's missing from the platform</h2>
      <p className="muted">Things a progressive voter would look for that the platform leaves out or leaves vague.</p>
      <div className="gap-grid">
        {meta.gaps.map((g) => (
          <article className="gap" key={g.title}>
            <h3>{g.title}</h3>
            <p>{g.text}</p>
            <SourceList sources={g.sources} />
          </article>
        ))}
      </div>
    </section>
  );
}
