import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Volume2 } from 'lucide-react';
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

interface MatchEvent {
  text: string;
  ballX: number;
  ballY: number;
  action?: 'possession' | 'attack' | 'dangerous' | 'shot' | 'goal' | 'foul' | 'setpiece';
}

export const MatchDetails: React.FC<MatchDetailsProps> = ({ 
  match, 
  onBack, 
  betSlip, 
  addBet, 
  oddsFormat, 
  language = 'en' 
}) => {
  // Live tracker state
  const [currentEvent, setCurrentEvent] = useState<string>('Match in progress');
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [tickerAction, setTickerAction] = useState<string>('possession');
  
  // Simulated stats
  const [possession, setPossession] = useState<number>(50);
  const [shotsHome, setShotsHome] = useState<number>(3);
  const [shotsAway, setShotsAway] = useState<number>(2);
  const [cornersHome, setCornersHome] = useState<number>(2);
  const [cornersAway, setCornersAway] = useState<number>(1);
  const [cardsHome, setCardsHome] = useState<number>(0);
  const [cardsAway, setCardsAway] = useState<number>(1);

  // Generate simulated events for Football (Soccer)
  const soccerEvents = useMemo<MatchEvent[]>(() => [
    { text: 'Possession in midfield', ballX: 50, ballY: 50, action: 'possession' },
    { text: `${match.team1} attacking down the left wing`, ballX: 70, ballY: 15, action: 'possession' },
    { text: `${match.team2} attacking down the right wing`, ballX: 30, ballY: 85, action: 'possession' },
    { text: `Dangerous attack by ${match.team1}!`, ballX: 82, ballY: 50, action: 'attack' },
    { text: `Dangerous attack by ${match.team2}!`, ballX: 18, ballY: 50, action: 'attack' },
    { text: `Corner kick for ${match.team1}`, ballX: 98, ballY: 98, action: 'setpiece' },
    { text: `Corner kick for ${match.team2}`, ballX: 2, ballY: 2, action: 'setpiece' },
    { text: `Free kick for ${match.team1}`, ballX: 75, ballY: 45, action: 'setpiece' },
    { text: `Free kick for ${match.team2}`, ballX: 40, ballY: 60, action: 'setpiece' },
    { text: `Goal kick for ${match.team2}`, ballX: 92, ballY: 50, action: 'possession' },
    { text: `Goal kick for ${match.team1}`, ballX: 8, ballY: 50, action: 'possession' },
    { text: `Yellow card shown to ${match.team1} player`, ballX: 45, ballY: 35, action: 'foul' },
    { text: `Yellow card shown to ${match.team2} player`, ballX: 55, ballY: 65, action: 'foul' },
    { text: `Shot on target by ${match.team1}! Saved by goalkeeper`, ballX: 96, ballY: 50, action: 'shot' },
    { text: `Shot on target by ${match.team2}! Saved by goalkeeper`, ballX: 4, ballY: 50, action: 'shot' },
    { text: `Shot off target by ${match.team1}`, ballX: 94, ballY: 20, action: 'shot' },
    { text: `Shot off target by ${match.team2}`, ballX: 6, ballY: 80, action: 'shot' },
  ], [match.team1, match.team2]);

  // Generate simulated events for Basketball
  const basketballEvents = useMemo<MatchEvent[]>(() => [
    { text: `${match.team1} sets up the offense`, ballX: 65, ballY: 50, action: 'possession' },
    { text: `${match.team2} transitional play`, ballX: 35, ballY: 50, action: 'possession' },
    { text: `${match.team1} moves the ball inside the key`, ballX: 85, ballY: 45, action: 'attack' },
    { text: `${match.team2} ball handler driving to the rim`, ballX: 15, ballY: 55, action: 'attack' },
    { text: `3-point shot attempt by ${match.team1}... missed`, ballX: 80, ballY: 20, action: 'shot' },
    { text: `3-point shot attempt by ${match.team2}... missed`, ballX: 20, ballY: 80, action: 'shot' },
    { text: `Shooting foul on ${match.team1}`, ballX: 75, ballY: 50, action: 'foul' },
    { text: `Shooting foul on ${match.team2}`, ballX: 25, ballY: 50, action: 'foul' },
    { text: `Free throw scored by ${match.team1}`, ballX: 82, ballY: 50, action: 'goal' },
    { text: `Free throw scored by ${match.team2}`, ballX: 18, ballY: 50, action: 'goal' },
    { text: `Defensive rebound by ${match.team1}`, ballX: 15, ballY: 50, action: 'possession' },
    { text: `Defensive rebound by ${match.team2}`, ballX: 85, ballY: 50, action: 'possession' },
  ], [match.team1, match.team2]);

  // Simulated events loop
  useEffect(() => {
    if (!match.isLive) return;

    // Pick events list based on sport
    const events = match.sport === 'Basketball' ? basketballEvents : soccerEvents;
    
    // Set initial event asynchronously to avoid synchronous setState inside effect
    const initialIdx = Math.floor(Math.random() * events.length);
    const initTimer = setTimeout(() => {
      setCurrentEvent(events[initialIdx].text);
      setBallPos({ x: events[initialIdx].ballX, y: events[initialIdx].ballY });
      setTickerAction(events[initialIdx].action || 'possession');
    }, 0);

    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * events.length);
      const ev = events[idx];
      
      setCurrentEvent(ev.text);
      setBallPos({ x: ev.ballX, y: ev.ballY });
      setTickerAction(ev.action || 'possession');

      // Mutate statistics slightly
      setPossession(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(Math.max(35, prev + delta), 65);
      });

      if (ev.action === 'shot') {
        const isHome = ev.ballX > 50;
        if (isHome) {
          setShotsHome(s => s + 1);
          if (Math.random() > 0.8) setCornersHome(c => c + 1);
        } else {
          setShotsAway(s => s + 1);
          if (Math.random() > 0.8) setCornersAway(c => c + 1);
        }
      }

      if (ev.action === 'foul') {
        const isHome = ev.ballX < 50; // Foul committed against them
        if (isHome) {
          setCardsAway(c => c + (Math.random() > 0.7 ? 1 : 0));
        } else {
          setCardsHome(c => c + (Math.random() > 0.7 ? 1 : 0));
        }
      }
    }, 7000);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
    };
  }, [match.isLive, match.sport, soccerEvents, basketballEvents]);

  // Synchronize score changes with event ticker
  const prevScore = React.useRef<string | undefined>(match.score);
  useEffect(() => {
    if (match.isLive && match.score && prevScore.current !== match.score) {
      prevScore.current = match.score;
      setCurrentEvent(language === 'ru' ? '⚽ ГООООЛ!!! Счет изменился!' : '⚽ GOOOAL!!! The score has changed!');
      setTickerAction('goal');
      setBallPos({ x: 50, y: 50 });
    }
  }, [match.score, match.isLive, language]);

  const isBetSelected = (selection: string) => {
    return betSlip.some(b => b.id === `${match.id}-${selection}`);
  };

  const handleOddsClick = (selection: string, oddsValue: number, marketName: string) => {
    if (oddsValue === 0) return;
    
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
        <ChevronLeft size={16} /> {t('Back to Events', language)}
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

      {/* 2D LIVE TRACKER & INFOGRAPHICS */}
      {match.isLive && (
        <div className="live-tracker-widget animation-slide-up">
          <div className="tracker-header">
            <span className="tracker-badge">
              <span className="red-dot"></span> MATCH LIVE TRACKER
            </span>
            <div className={`live-event-ticker ticker-${tickerAction}`}>
              <Volume2 size={14} className="ticker-icon" />
              <span>{currentEvent}</span>
            </div>
          </div>

          <div className="tracker-body">
            {/* Visual Pitch Column */}
            <div className="pitch-container">
              {match.sport === 'Basketball' ? (
                // Basketball Court
                <div className="basketball-court">
                  <div className="court-center-circle"></div>
                  <div className="court-midline"></div>
                  <div className="court-key home"></div>
                  <div className="court-key away"></div>
                  <div className="court-hoop home"></div>
                  <div className="court-hoop away"></div>
                  {/* Ball Dot */}
                  <div 
                    className={`court-ball ${tickerAction === 'goal' ? 'ball-score' : ''}`}
                    style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
                  ></div>
                </div>
              ) : (
                // Soccer Field (Default)
                <div className="soccer-pitch">
                  <div className="pitch-center-circle"></div>
                  <div className="pitch-midline"></div>
                  <div className="pitch-penalty home"></div>
                  <div className="pitch-penalty away"></div>
                  <div className="pitch-goal home"></div>
                  <div className="pitch-goal away"></div>
                  {/* Ball Dot */}
                  <div 
                    className={`pitch-ball ${tickerAction === 'goal' ? 'ball-goal' : ''}`}
                    style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
                  ></div>
                </div>
              )}
              {/* Pitch overlay showing team directions */}
              <div className="team-direction home">&larr; {match.team1}</div>
              <div className="team-direction away">{match.team2} &rarr;</div>
            </div>

            {/* Statistics Column */}
            <div className="tracker-stats-panel">
              <h4>{language === 'ru' ? 'Живая статистика' : 'Live Statistics'}</h4>
              
              {/* Possession Stat */}
              <div className="tracker-stat-row">
                <div className="stat-labels">
                  <span>{possession}%</span>
                  <span>{language === 'ru' ? 'Владение мячом' : 'Possession'}</span>
                  <span>{100 - possession}%</span>
                </div>
                <div className="stat-progress-bar">
                  <div className="progress-fill home" style={{ width: `${possession}%` }}></div>
                  <div className="progress-fill away" style={{ width: `${100 - possession}%` }}></div>
                </div>
              </div>

              {/* Shots Stat */}
              <div className="tracker-stat-row">
                <div className="stat-labels">
                  <span>{shotsHome}</span>
                  <span>{language === 'ru' ? 'Удары по воротам' : 'Shots'}</span>
                  <span>{shotsAway}</span>
                </div>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill home" 
                    style={{ width: `${(shotsHome / Math.max(1, shotsHome + shotsAway)) * 100}%` }}
                  ></div>
                  <div 
                    className="progress-fill away" 
                    style={{ width: `${(shotsAway / Math.max(1, shotsHome + shotsAway)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Corners Stat */}
              <div className="tracker-stat-row">
                <div className="stat-labels">
                  <span>{cornersHome}</span>
                  <span>{language === 'ru' ? 'Угловые' : 'Corners'}</span>
                  <span>{cornersAway}</span>
                </div>
                <div className="stat-progress-bar">
                  <div 
                    className="progress-fill home" 
                    style={{ width: `${(cornersHome / Math.max(1, cornersHome + cornersAway)) * 100}%` }}
                  ></div>
                  <div 
                    className="progress-fill away" 
                    style={{ width: `${(cornersAway / Math.max(1, cornersHome + cornersAway)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Cards Stat */}
              <div className="tracker-stat-row">
                <div className="stat-labels">
                  <span className="card-box yellow">{cardsHome}</span>
                  <span>{language === 'ru' ? 'Желтые карточки' : 'Yellow Cards'}</span>
                  <span className="card-box yellow">{cardsAway}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
