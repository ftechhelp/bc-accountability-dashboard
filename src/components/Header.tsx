import { useEffect, useState } from 'react';
import { meta } from '../data.ts';
import { daysSince, formatDate } from '../format.ts';

type Theme = 'system' | 'light' | 'dark';
const THEME_KEY = 'bc-tracker-theme';
const NEXT_THEME: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' };
const THEME_LABEL: Record<Theme, string> = { system: 'Auto', light: 'Light', dark: 'Dark' };

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
      if (theme === 'system') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="ghost-button"
      onClick={() => setTheme(NEXT_THEME[theme])}
      aria-label={`Theme: ${THEME_LABEL[theme]}. Switch to ${THEME_LABEL[NEXT_THEME[theme]]}.`}
    >
      Theme: {THEME_LABEL[theme]}
    </button>
  );
}

export function Header() {
  const gov = meta.government;
  const status = gov.swornIn
    ? `In government · day ${daysSince(gov.swornIn)}`
    : 'Premier-designate · not yet sworn in';

  return (
    <header className="site-header">
      <div className="wrap">
        <div className="header-top">
          <p className="eyebrow">British Columbia · {gov.party}</p>
          <ThemeToggle />
        </div>
        <h1>BC Accountability Tracker</h1>
        <p className="lede">
          What the {gov.premier} government promised, what it's actually doing, and who it helps or hurts, rated through a
          progressive lens.
        </p>
        <div className="status-row">
          <span className={`status-pill${gov.swornIn ? ' is-live' : ''}`}>
            <span className="status-dot" aria-hidden="true" />
            {status}
          </span>
          <span className="muted">
            Elected {formatDate(gov.electionDate)} · {gov.seats}
          </span>
          <span className="muted">Data updated {formatDate(meta.lastUpdated)}</span>
        </div>
        {!gov.swornIn && <p className="status-note">{gov.statusNote}</p>}
        <nav className="section-nav" aria-label="Sections">
          <a href="#overview">Overview</a>
          <a href="#watch">Red flags &amp; wins</a>
          <a href="#activity">Activity</a>
          <a href="#gaps">What's missing</a>
          <a href="#promises">All promises</a>
        </nav>
      </div>
    </header>
  );
}
