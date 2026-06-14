import React, { useMemo } from 'react';
import type { MatchData } from '../data/matches';
import './LiveTicker.css';

const SPORT_ICONS: Record<string, string> = {
  Football: '⚽',
  Tennis: '🎾',
  Basketball: '🏀',
  'Ice Hockey': '🏒',
  Boxing: '🥊',
  Cricket: '🏏',
  Darts: '🎯',
  'Formula 1': '🏎️',
  MMA: '🥋'
};

interface LiveTickerProps {
  matches: MatchData[];
  onSelectMatch: (id: string) => void;
}

const LiveTicker: React.FC<LiveTickerProps> = ({ matches, onSelectMatch }) => {
  const liveMatches = useMemo(
    () => matches.filter(m => m.isLive && m.time !== 'Finished'),
    [matches]
  );

  if (liveMatches.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const tickerItems = [...liveMatches, ...liveMatches];
  const duration = Math.max(20, liveMatches.length * 6);

  return (
    <div className="live-ticker-bar" style={{ '--ticker-duration': `${duration}s` } as React.CSSProperties}>
      <div className="live-ticker-label">
        <span className="live-dot-pulse" />
        LIVE
      </div>
      <div className="live-ticker-track-wrapper">
        <div className="live-ticker-track">
          {tickerItems.map((match, i) => (
            <div
              key={`${match.id}-${i}`}
              className="ticker-item"
              onClick={() => onSelectMatch(match.id)}
            >
              <span className="ticker-sport-icon">{SPORT_ICONS[match.sport] || '🏆'}</span>
              <div className="ticker-teams">
                <span>{match.team1}</span>
                <span>{match.team2}</span>
              </div>
              {match.score && (
                <span className="ticker-score">{match.score}</span>
              )}
              <span className="ticker-time">{match.time}</span>
              <div className="ticker-odds-mini">
                {match.odds.home > 0 && <span>{match.odds.home.toFixed(2)}</span>}
                {match.odds.draw > 0 && <span>{match.odds.draw.toFixed(2)}</span>}
                {match.odds.away > 0 && <span>{match.odds.away.toFixed(2)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveTicker);
