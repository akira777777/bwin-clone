import React from 'react';
import type { Bet } from '../App';
import type { MatchData } from '../data/matches';
import { formatOdds } from '../utils/betting';
import type { OddsFormat } from '../utils/betting';
import { t } from '../utils/i18n';
import './MatchDetails.css';

interface MatchDetailsProps {
  match: MatchData;
  onBack: () => void;
  betSlip: Bet[];
  addBet: (bet: Bet) => void;
  oddsFormat: OddsFormat;
  language?: string;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ match, onBack, betSlip, addBet, oddsFormat, language = 'en' }) => {
  const isBetSelected = (selection: string) => {
    return betSlip.some(b => b.id === `${match.id}-${selection}`);
  };

  const handleOddsClick = (selection: string, oddsValue: number, marketName: string) => {
    if (oddsValue === 0) return;
    
    // Determine a readable selection name
    let readableSelection = selection;
    if (selection === 'home') readableSelection = match.team1;
    else if (selection === 'away') readableSelection = match.team2;
    else if (selection === 'draw') readableSelection = 'Draw';
    else if (selection === 'over25') readableSelection = 'Over 2.5';
    else if (selection === 'under25') readableSelection = 'Under 2.5';
    else if (selection === 'btts_yes') readableSelection = 'Yes';
    else if (selection === 'btts_no') readableSelection = 'No';
    else if (selection === 'dc_1x') readableSelection = '1X';
    else if (selection === 'dc_x2') readableSelection = 'X2';
    else if (selection === 'dc_12') readableSelection = '12';

    const bet: Bet = {
      id: `${match.id}-${selection}`,
      match: `${match.team1} vs ${match.team2}`,
      selection: `${marketName}: ${readableSelection}`,
      odds: oddsValue
    };
    addBet(bet);
  };

  const renderOddsButton = (selection: string, label: string, val: number, marketName: string) => {
    if (val === 0 || val === undefined) {
      return <div className="odds-btn" style={{ opacity: 0.2, cursor: 'default' }}>-</div>;
    }

    const isSelected = isBetSelected(selection);
    
    let btnClass = 'odds-btn';
    if (isSelected) btnClass += ' selected';

    return (
      <button 
        className={btnClass}
        onClick={() => handleOddsClick(selection, val, marketName)}
      >
        <span className="odds-label">{label}</span>
        <span className="odds-value">{formatOdds(val, oddsFormat)}</span>
      </button>
    );
  };

  return (
    <div className="match-details-container">
      <button className="btn-back" onClick={onBack}>
        &larr; {t('Back to Events', language)}
      </button>

      <div className="match-header">
        <div className="match-league">{match.league}</div>
        <div className="match-title-row">
          <h2>{match.team1} <span className="vs">vs</span> {match.team2}</h2>
        </div>
        <div className="match-meta">
          {match.isLive ? (
            <span className="live-badge">{t('LIVE', language)} {match.time}</span>
          ) : (
            <span className="upcoming-time">{match.time}</span>
          )}
          {match.score && <span className="score-display">{match.score}</span>}
        </div>
      </div>

      <div className="markets-container">
        {/* Match Result Market */}
        <div className="market-group animation-slide-up" style={{ animationDelay: '0.0s' }}>
          <div className="market-header">{t('Match Result (1X2)', language)}</div>
          <div className="market-odds grid-3">
            {renderOddsButton('home', '1', match.odds.home, 'Match Result')}
            {renderOddsButton('draw', 'X', match.odds.draw, 'Match Result')}
            {renderOddsButton('away', '2', match.odds.away, 'Match Result')}
          </div>
        </div>

        {/* Total Goals Market */}
        {match.markets?.totalGoals && (
          <div className="market-group animation-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="market-header">{t('Total Goals - Over/Under 2.5', language)}</div>
            <div className="market-odds grid-2">
              {renderOddsButton('over25', t('Over 2.5', language), match.markets.totalGoals.over25, 'Total Goals')}
              {renderOddsButton('under25', t('Under 2.5', language), match.markets.totalGoals.under25, 'Total Goals')}
            </div>
          </div>
        )}

        {/* Both Teams to Score Market */}
        {match.markets?.btts && (
          <div className="market-group animation-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="market-header">{t('Both Teams to Score', language)}</div>
            <div className="market-odds grid-2">
              {renderOddsButton('btts_yes', t('Yes', language), match.markets.btts.yes, 'BTTS')}
              {renderOddsButton('btts_no', t('No', language), match.markets.btts.no, 'BTTS')}
            </div>
          </div>
        )}

        {/* Double Chance Market */}
        {match.markets?.doubleChance && (
          <div className="market-group animation-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="market-header">{t('Double Chance', language)}</div>
            <div className="market-odds grid-3">
              {renderOddsButton('dc_1x', '1X', match.markets.doubleChance.homeDraw, 'Double Chance')}
              {renderOddsButton('dc_12', '12', match.markets.doubleChance.homeAway, 'Double Chance')}
              {renderOddsButton('dc_x2', 'X2', match.markets.doubleChance.drawAway, 'Double Chance')}
            </div>
          </div>
        )}
        
        {(!match.markets) && (
          <div className="no-markets">
            {t('No additional markets', language)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchDetails;
