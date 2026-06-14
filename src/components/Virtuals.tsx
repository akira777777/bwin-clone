import React, { useState, useEffect, useMemo } from 'react';
import './Virtuals.css';

interface OddsMarket { label: string; value: string; }

interface VirtualEvent {
  id: string;
  sport: string;
  emoji: string;
  gradientClass: string;
  countdown: number;
  isLive: boolean;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  minute?: number;
  markets: OddsMarket[];
}

const INITIAL_EVENTS: VirtualEvent[] = [
  {
    id: 'v1', sport: 'Virtual Football', emoji: '⚽', isLive: true,
    gradientClass: 'vec-grad-football',
    countdown: 0, team1: 'FC Alpha', team2: 'FC Beta', score1: 1, score2: 0, minute: 67,
    markets: [{ label: '1', value: '2.10' }, { label: 'X', value: '3.20' }, { label: '2', value: '3.50' }],
  },
  {
    id: 'v2', sport: 'Virtual Greyhounds', emoji: '🐕', isLive: false,
    gradientClass: 'vec-grad-greyhounds',
    countdown: 52, team1: 'Trap 1', team2: 'Trap 6', score1: 0, score2: 0,
    markets: [{ label: 'Win', value: '4.50' }, { label: 'Place', value: '1.85' }, { label: 'E/W', value: '2.40' }],
  },
  {
    id: 'v3', sport: 'Virtual Tennis', emoji: '🎾', isLive: false,
    gradientClass: 'vec-grad-tennis',
    countdown: 134, team1: 'Player A', team2: 'Player B', score1: 0, score2: 0,
    markets: [{ label: '1', value: '1.72' }, { label: '2', value: '2.10' }, { label: 'O 2.5', value: '1.95' }],
  },
  {
    id: 'v4', sport: 'Virtual Basketball', emoji: '🏀', isLive: false,
    gradientClass: 'vec-grad-basketball',
    countdown: 203, team1: 'Eagles', team2: 'Wolves', score1: 0, score2: 0,
    markets: [{ label: '1', value: '1.85' }, { label: '2', value: '1.95' }, { label: '+5.5', value: '1.90' }],
  },
  {
    id: 'v5', sport: 'Virtual Horse Racing', emoji: '🐎', isLive: false,
    gradientClass: 'vec-grad-horses',
    countdown: 71, team1: 'Desert Storm', team2: 'Night Rider', score1: 0, score2: 0,
    markets: [{ label: 'Win', value: '3.20' }, { label: 'Place', value: '1.60' }, { label: 'SP', value: '5.00' }],
  },
  {
    id: 'v6', sport: 'Virtual Cycling', emoji: '🚴', isLive: false,
    gradientClass: 'vec-grad-cycling',
    countdown: 155, team1: 'Rider 1', team2: 'Rider 2', score1: 0, score2: 0,
    markets: [{ label: '1st', value: '2.80' }, { label: '2nd', value: '2.20' }, { label: 'Top3', value: '1.45' }],
  },
];

const formatTime = (sec: number): string => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const Virtuals: React.FC = () => {
  const [events, setEvents] = useState<VirtualEvent[]>(INITIAL_EVENTS);
  const [toast, setToast] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents(prev => prev.map(ev => {
        if (ev.isLive) return { ...ev, minute: Math.min((ev.minute ?? 0) + 1, 90) };
        if (ev.countdown <= 1) return { ...ev, countdown: 180 };
        return { ...ev, countdown: ev.countdown - 1 };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleOdd = (eventId: string, marketLabel: string, oddValue: string, sportName: string) => {
    const key = `${eventId}-${marketLabel}`;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        showToast(`Removed: ${sportName} — ${marketLabel}`);
      } else {
        next.add(key);
        showToast(`Added to slip: ${sportName} ${marketLabel} @ ${oddValue}`);
      }
      return next;
    });
  };

  const liveEvent = useMemo(() => events.find(e => e.isLive) ?? null, [events]);
  const upcomingEvents = useMemo(() => events.filter(e => !e.isLive), [events]);

  return (
    <main className="main-content virtuals-container">
      {toast && <div className="v-toast" role="alert">{toast}</div>}

      {/* Hero Banner */}
      <div className="virtuals-hero">
        <div className="virtuals-hero-content">
          <h2>Virtual Sports</h2>
          <p>Non-stop action — events every 3 minutes, 24/7</p>
          <div className="virtuals-hero-badges">
            <span className="v-live-badge">Live Now</span>
            <span className="v-events-count">{events.length} events active</span>
          </div>
          <button className="btn-v-start" onClick={() => showToast('Select an event and pick your odds!')}>
            Start Betting
          </button>
        </div>
        <div className="virtuals-hero-emoji">🏆</div>
      </div>

      {/* Featured Live Match */}
      {liveEvent && (
        <>
          <p className="v-section-title">Live Now</p>
          <div className="v-featured">
            <div className="v-featured-top">
              <span className="vf-badge">Live</span>
              <span className="vf-sport-label">{liveEvent.sport}</span>
              <span className="vf-time-info">{liveEvent.minute ?? 0}′</span>
            </div>
            <div className="vf-match-row">
              <div className="vf-team-block">
                <div className="vf-team-emoji">⚽</div>
                <div className="vf-team-name">{liveEvent.team1}</div>
              </div>
              <div className="vf-score-block">
                <div className="vf-score-text">{liveEvent.score1} – {liveEvent.score2}</div>
                <div className="vf-score-minute">LIVE · {liveEvent.minute ?? 0}′</div>
              </div>
              <div className="vf-team-block">
                <div className="vf-team-emoji">⚽</div>
                <div className="vf-team-name">{liveEvent.team2}</div>
              </div>
            </div>
            <div className="vf-odds-strip">
              {liveEvent.markets.map(m => {
                const key = `${liveEvent.id}-${m.label}`;
                return (
                  <button
                    type="button"
                    key={m.label}
                    className={`vf-odd-btn${selected.has(key) ? ' selected' : ''}`}
                    onClick={() => handleOdd(liveEvent.id, m.label, m.value, liveEvent.sport)}
                  >
                    <span className="vf-label">{m.label}</span>
                    <span className="vf-value">{m.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Upcoming Events */}
      <p className="v-section-title">Next Events</p>
      <div className="v-events-grid">
        {upcomingEvents.map(ev => (
          <div key={ev.id} className={`v-event-card${ev.isLive ? ' is-live' : ''}`}>
            <div className="vec-head">
              <div className={`vec-head-bg ${ev.gradientClass}`} />
              <div className="vec-sport-row">
                <span className="vec-emoji">{ev.emoji}</span>
                <span className="vec-sport-name">{ev.sport}</span>
              </div>
              <div className="vec-timer">
                <span className="vec-timer-label">{ev.isLive ? 'Live' : 'Starts in'}</span>
                <span className={`vec-timer-value${ev.isLive ? ' live-timer' : ''}`}>
                  {ev.isLive ? `${ev.minute ?? 0}′` : formatTime(ev.countdown)}
                </span>
              </div>
            </div>

            <div className="vec-teams">
              <div className="vec-team-row">
                <span className="vec-team-name">{ev.team1}</span>
                {ev.isLive && <span className="vec-score">{ev.score1}</span>}
              </div>
              <div className="vec-team-row">
                <span className="vec-team-name">{ev.team2}</span>
                {ev.isLive && <span className="vec-score">{ev.score2}</span>}
              </div>
            </div>

            <div className="vec-odds">
              {ev.markets.map(m => {
                const key = `${ev.id}-${m.label}`;
                return (
                  <button
                    type="button"
                    key={m.label}
                    className={`vec-odd-btn${selected.has(key) ? ' selected' : ''}`}
                    onClick={() => handleOdd(ev.id, m.label, m.value, ev.sport)}
                  >
                    <span className="vec-odd-label">{m.label}</span>
                    <span className="vec-odd-value">{m.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
