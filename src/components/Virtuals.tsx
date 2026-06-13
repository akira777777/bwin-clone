import React, { useState, useEffect } from 'react';
import { PlayCircle } from 'lucide-react';
import './Casino.css'; // Reuse casino styles for grid

interface VirtualEvent {
  id: string;
  title: string;
  gradient: string;
  countdown: number; // seconds
}

const INITIAL_EVENTS: VirtualEvent[] = [
  { id: 'v1', title: 'Virtual Football', gradient: 'linear-gradient(135deg, #11998e, #38ef7d)', countdown: 84 },
  { id: 'v2', title: 'Virtual Greyhounds', gradient: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', countdown: 45 },
  { id: 'v3', title: 'Virtual Tennis', gradient: 'linear-gradient(135deg, #f12711, #f5af19)', countdown: 130 },
  { id: 'v4', title: 'Virtual Basketball', gradient: 'linear-gradient(135deg, #0575E6, #021B79)', countdown: 200 },
  { id: 'v5', title: 'Virtual Horse Racing', gradient: 'linear-gradient(135deg, #654ea3, #eaafc8)', countdown: 65 },
  { id: 'v6', title: 'Virtual Cycling', gradient: 'linear-gradient(135deg, #00b4db, #0083B0)', countdown: 150 },
];

const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const Virtuals: React.FC = () => {
  const [events, setEvents] = useState<VirtualEvent[]>(INITIAL_EVENTS);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEvents(prev => prev.map(ev => ({
        ...ev,
        countdown: ev.countdown > 0 ? ev.countdown - 1 : 180 // Reset to 3 minutes
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBetNow = (event: VirtualEvent) => {
    setLoadingEvent(event.id);
    showToast(`Opening ${event.title}...`);
    setTimeout(() => {
      setLoadingEvent(null);
      showToast(`${event.title} — Bets are open! Place your bet.`);
    }, 1000);
  };

  return (
    <main className="main-content casino-container">
      {/* Toast */}
      {toast && (
        <div className="casino-toast" role="alert">
          {toast}
        </div>
      )}

      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #2b5876, #4e4376)' }}>
        <div className="promo-content">
          <h2>Virtual Sports</h2>
          <p>Non-stop betting action. Events start every 3 minutes!</p>
          <button className="btn-promo" onClick={() => showToast('Virtual Sports — выбери событие ниже!')}>
            Start Betting
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>Next Events</h2>
      </div>

      <div className="games-grid">
        {events.map(event => (
          <div key={event.id} className={`game-card ${loadingEvent === event.id ? 'loading' : ''}`} onClick={() => handleBetNow(event)}>
            <div className="game-bg" style={{ background: event.gradient }}>
              <PlayCircle size={48} />
            </div>
            <div className="game-overlay">
              <button className="play-btn" onClick={(e) => { e.stopPropagation(); handleBetNow(event); }}>
                {loadingEvent === event.id ? 'Loading...' : 'Bet Now'}
              </button>
            </div>
            <div className="game-info">
              <h3 className="game-title">{event.title}</h3>
              <p className="game-provider">Starts in {formatCountdown(event.countdown)}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
