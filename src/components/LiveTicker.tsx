import React, { useMemo } from 'react';
import type { MatchData } from '../data/matches';
import type { Bet } from '../App';
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
  betSlip?: Bet[];
  addBet?: (bet: Bet) => void;
}

const LiveTicker: React.FC<LiveTickerProps> = ({ matches, onSelectMatch, betSlip = [], addBet }) => {
  const liveMatches = useMemo(
    () => matches.filter(m => m.isLive && m.time !== 'Finished'),
    [matches]
  );

  const isBetSelected = (matchId: string, selection: string) => {
    return betSlip.some(b => b.id === `${matchId}-${selection}`);
  };

  const handleOddsClick = (e: React.MouseEvent, match: MatchData, selection: string, oddsValue: number) => {
    e.stopPropagation(); // Prevent ticker item click
    if (!addBet || oddsValue === 0) return;
    const bet: Bet = {
      id: `${match.id}-${selection}`,
      match: `${match.team1} vs ${match.team2}`,
      selection: selection === 'home' ? match.team1 : selection === 'away' ? match.team2 : 'Draw',
      odds: oddsValue
    };
    addBet(bet);
  };

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
                {match.odds.home > 0 && (
                  <button 
                    className={`ticker-odds-btn ${isBetSelected(match.id, 'home') ? 'selected' : ''}`}
                    onClick={(e) => handleOddsClick(e, match, 'home', match.odds.home)}
                  >
                    {match.odds.home.toFixed(2)}
                  </button>
                )}
                {match.odds.draw > 0 && (
                  <button 
                    className={`ticker-odds-btn ${isBetSelected(match.id, 'draw') ? 'selected' : ''}`}
                    onClick={(e) => handleOddsClick(e, match, 'draw', match.odds.draw)}
                  >
                    {match.odds.draw.toFixed(2)}
                  </button>
                )}
                {match.odds.away > 0 && (
                  <button 
                    className={`ticker-odds-btn ${isBetSelected(match.id, 'away') ? 'selected' : ''}`}
                    onClick={(e) => handleOddsClick(e, match, 'away', match.odds.away)}
                  >
                    {match.odds.away.toFixed(2)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(LiveTicker);
