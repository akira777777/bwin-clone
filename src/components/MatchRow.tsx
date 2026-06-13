import React from 'react';
import { PlayCircle, Clock } from 'lucide-react';
import type { MatchData } from '../data/matches';
import type { Bet } from '../App';

interface MatchRowProps {
  match: MatchData;
  betSlip: Bet[];
  addBet: (bet: Bet) => void;
  onSelectMatch: (id: string) => void;
}

const MatchRow: React.FC<MatchRowProps> = ({ match, betSlip, addBet, onSelectMatch }) => {
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

  const renderOddsButton = (selection: 'home' | 'draw' | 'away', label: string, val: number) => {
    if (val === 0) {
      return <div className="odds-btn" style={{ opacity: 0.2, cursor: 'default' }}>-</div>;
    }

    const isSelected = isBetSelected(selection);
    const trendClass = match.trend ? match.trend[selection] : null;
    
    let btnClass = 'odds-btn';
    if (isSelected) btnClass += ' selected';
    if (trendClass === 'up') btnClass += ' trend-up';
    if (trendClass === 'down') btnClass += ' trend-down';

    return (
      <button 
        className={btnClass}
        onClick={(e) => handleOddsClick(e, selection, val)}
      >
        <span className="odds-label">{label}</span>
        <span className="odds-value">{val.toFixed(2)}</span>
      </button>
    );
  };

  return (
    <div className="match-row" onClick={() => onSelectMatch(match.id)} style={{ cursor: 'pointer' }}>
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
            <span className="live-time"><PlayCircle size={12} className="live-icon" /> {match.time}</span>
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
    </div>
  );
};

// Ensure it only re-renders if match data changes or betSlip changes specifically for this match
// Since checking betSlip length is easy, we might just pass `isSelected` individually or compare carefully
export default React.memo(MatchRow, (prev, next) => {
  // Simple check: if match is identical and betSlip length is same (assuming no edits without adding/removing)
  return prev.match === next.match && prev.betSlip === next.betSlip;
});
