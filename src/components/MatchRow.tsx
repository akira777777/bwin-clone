import React from 'react';
import { PlayCircle, Clock, Star, ChevronRight } from 'lucide-react';
import type { MatchData } from '../data/matches';
import type { Bet } from '../App';
import { formatOdds } from '../utils/betting';
import type { OddsFormat } from '../utils/betting';

interface MatchRowProps {
  match: MatchData;
  betSlip: Bet[];
  addBet: (bet: Bet) => void;
  onSelectMatch: (id: string) => void;
  oddsFormat: OddsFormat;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, betSlip, addBet, onSelectMatch, oddsFormat, isFavorite = false, onToggleFavorite }) => {
  const isBetSelected = (selection: string) => {
    return betSlip.some(b => b.id === `${match.id}-${selection}`);
  };

  const handleOddsClick = (e: React.MouseEvent, selection: string, oddsValue: number) => {
    e.stopPropagation(); // Prevent row click
    if (oddsValue === 0) return;
    const bet: Bet = {
      id: `${match.id}-${selection}`,
      match: `${match.team1} vs ${match.team2}`,
      selection: selection === 'home' ? match.team1 : selection === 'away' ? match.team2 : 'Draw',
      odds: oddsValue
    };
    addBet(bet);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(match.id);
  };

  // Count additional markets
  const extraMarkets = match.markets 
    ? Object.keys(match.markets).length 
    : 0;

  const renderOddsButton = (selection: 'home' | 'draw' | 'away', label: string, val: number) => {
    if (val === 0) {
      return <div className="odds-btn disabled-odds" style={{ opacity: 0.2, cursor: 'default' }}>-</div>;
    }

    const isSelected = isBetSelected(selection);
    const trendClass = match.trend ? match.trend[selection] : null;
    
    let btnClass = 'odds-btn';
    if (isSelected) btnClass += ' selected';
    if (trendClass === 'up') btnClass += ' trend-up odds-flash-up';
    if (trendClass === 'down') btnClass += ' trend-down odds-flash-down';

    return (
      <button 
        className={btnClass}
        onClick={(e) => handleOddsClick(e, selection, val)}
      >
        <span className="odds-label">{label}</span>
        <span className="odds-value">{formatOdds(val, oddsFormat)}</span>
      </button>
    );
  };

  return (
    <div className={`match-row ${match.isLive ? 'match-row-live' : ''}`} onClick={() => onSelectMatch(match.id)} style={{ cursor: 'pointer' }}>
      {/* Favorite Star */}
      <button 
        className={`match-favorite-btn ${isFavorite ? 'favorited' : ''}`} 
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Star size={14} fill={isFavorite ? 'var(--bwin-yellow)' : 'none'} />
      </button>

      <div className="match-info">
        <div className="match-league">{match.league}</div>
        <div className="match-teams">
          <div className="team">
            <span className="team-name" title={match.team1}>{match.team1}</span>
            {match.isLive && match.score && <span className="score">{match.score.split(' - ')[0]}</span>}
          </div>
          <div className="team">
            <span className="team-name" title={match.team2}>{match.team2}</span>
            {match.isLive && match.score && <span className="score">{match.score.split(' - ')[1]}</span>}
          </div>
        </div>
        <div className="match-status">
          {match.isLive ? (
            <span className="live-time">
              <span className="live-pulse-dot" />
              <PlayCircle size={12} className="live-icon" /> {match.time}
            </span>
          ) : (
            <span className="upcoming-time"><Clock size={12} className="time-icon" /> {match.time}</span>
          )}
        </div>
      </div>
      <div className="match-odds">
        {renderOddsButton('home', '1', match.odds.home)}
        {renderOddsButton('draw', 'X', match.odds.draw)}
        {renderOddsButton('away', '2', match.odds.away)}
      </div>
      {/* Extra markets count + arrow */}
      <div className="match-more-markets" onClick={(e) => { e.stopPropagation(); onSelectMatch(match.id); }}>
        {extraMarkets > 0 && <span className="market-count-badge">+{extraMarkets}</span>}
        <ChevronRight size={16} className="match-chevron" />
      </div>
    </div>
  );
};

// Ensure it only re-renders if match data changes or betSlip changes specifically for this match
export default React.memo(MatchRow, (prev, next) => {
  return prev.match === next.match && prev.betSlip === next.betSlip && prev.oddsFormat === next.oddsFormat && prev.isFavorite === next.isFavorite;
});
