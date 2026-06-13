import React, { useState, useMemo } from 'react';
import { Trash2, X, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import type { Bet, PlacedBet } from '../App';
import type { MatchData } from '../data/matches';
import { leagueOutrights } from '../data/leaguesData';
import { getCombinations } from '../utils/betting';
import './RightSidebar.css';

interface RightSidebarProps {
  betSlip: Bet[];
  setBetSlip: React.Dispatch<React.SetStateAction<Bet[]>>;
  removeBet: (id: string) => void;
  clearBetSlip: () => void;
  placedBets: PlacedBet[];
  onPlaceBet: (stake: number, potentialReturn: number, type: 'Single' | 'Multi' | 'System') => void;
  closeMobileSlip?: () => void;
  matches: MatchData[];
}

// Lookup current live odds
const getCurrentOdds = (bet: Bet, matches: MatchData[]): number => {
  if (bet.id.startsWith('outright-')) {
    const optionId = bet.id.replace('outright-', '');
    for (const league in leagueOutrights) {
      for (const outright of leagueOutrights[league]) {
        const option = outright.options.find(o => o.id === optionId);
        if (option) return option.odds;
      }
    }
    return bet.odds;
  }

  const lastDashIndex = bet.id.lastIndexOf('-');
  if (lastDashIndex === -1) return bet.odds;
  const matchId = bet.id.substring(0, lastDashIndex);
  const selection = bet.id.substring(lastDashIndex + 1);

  const match = matches.find(m => m.id === matchId);
  if (!match) return bet.odds;

  if (selection === 'home') return match.odds.home;
  if (selection === 'draw') return match.odds.draw;
  if (selection === 'away') return match.odds.away;
  if (selection === 'over25') return match.markets?.totalGoals?.over25 ?? bet.odds;
  if (selection === 'under25') return match.markets?.totalGoals?.under25 ?? bet.odds;
  if (selection === 'btts_yes') return match.markets?.btts?.yes ?? bet.odds;
  if (selection === 'btts_no') return match.markets?.btts?.no ?? bet.odds;
  if (selection === 'dc_1x') return match.markets?.doubleChance?.homeDraw ?? bet.odds;
  if (selection === 'dc_x2') return match.markets?.doubleChance?.drawAway ?? bet.odds;
  if (selection === 'dc_12') return match.markets?.doubleChance?.homeAway ?? bet.odds;

  return bet.odds;
};

const RightSidebar: React.FC<RightSidebarProps> = ({ 
  betSlip, setBetSlip, removeBet, clearBetSlip, placedBets, onPlaceBet, closeMobileSlip, matches 
}) => {
  const [activeTab, setActiveTab] = useState<'betslip' | 'mybets'>('betslip');
  const [betMode, setBetMode] = useState<'single' | 'multi' | 'system'>('multi');
  
  // Stake states
  const [multiStake, setMultiStake] = useState<string>('');
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [systemStake, setSystemStake] = useState<string>(''); // Stake per combination
  const [systemSize, setSystemSize] = useState<number>(2); // e.g. 2 for 2/3
  
  const [showSuccess, setShowSuccess] = useState(false);

  // 1. Detect odds fluctuations in real time
  const oddsStatus = useMemo(() => {
    const status: Record<string, { current: number; changed: boolean; direction: 'up' | 'down' | 'same' }> = {};
    betSlip.forEach(bet => {
      const current = getCurrentOdds(bet, matches);
      const diff = current - bet.odds;
      let direction: 'up' | 'down' | 'same' = 'same';
      if (diff > 0.009) direction = 'up';
      else if (diff < -0.009) direction = 'down';
      
      status[bet.id] = {
        current,
        changed: direction !== 'same',
        direction
      };
    });
    return status;
  }, [betSlip, matches]);

  const hasOddsChanged = useMemo(() => {
    const changed = Object.values(oddsStatus).some(status => status.changed);
    return changed;
  }, [oddsStatus, betSlip]);

  const acceptOddsChanges = () => {
    setBetSlip(prev => prev.map(bet => ({
      ...bet,
      odds: oddsStatus[bet.id]?.current ?? bet.odds
    })));
  };

  // 2. Calculations for Multi Bet
  const totalMultiOdds = useMemo(() => {
    return betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  }, [betSlip]);

  const multiPotentialReturn = useMemo(() => {
    const numStake = parseFloat(multiStake) || 0;
    return (totalMultiOdds * numStake).toFixed(2);
  }, [totalMultiOdds, multiStake]);

  // 3. Calculations for Single Bets
  const singleTotalStake = useMemo(() => {
    return betSlip.reduce((acc, bet) => {
      const betStake = parseFloat(singleStakes[bet.id]) || 0;
      return acc + betStake;
    }, 0);
  }, [betSlip, singleStakes]);

  const singlePotentialReturn = useMemo(() => {
    const total = betSlip.reduce((acc, bet) => {
      const betStake = parseFloat(singleStakes[bet.id]) || 0;
      return acc + (betStake * bet.odds);
    }, 0);
    return total.toFixed(2);
  }, [betSlip, singleStakes]);

  // 4. Calculations for System Bet
  // System is only available if there are at least 3 bets
  const isSystemAvailable = betSlip.length >= 3;
  const systemCombinations = useMemo(() => {
    if (betSlip.length < 3) return [];
    // If size is out of bounds, adjust
    const size = Math.min(Math.max(2, systemSize), betSlip.length - 1);
    return getCombinations(betSlip, size);
  }, [betSlip, systemSize]);

  const systemTotalStake = useMemo(() => {
    const stakePerCombo = parseFloat(systemStake) || 0;
    return (systemCombinations.length * stakePerCombo).toFixed(2);
  }, [systemCombinations, systemStake]);

  const systemMaxReturn = useMemo(() => {
    const stakePerCombo = parseFloat(systemStake) || 0;
    const maxReturn = systemCombinations.reduce((acc, combo) => {
      const comboOdds = combo.reduce((oddsAcc, bet) => oddsAcc * bet.odds, 1);
      return acc + (comboOdds * stakePerCombo);
    }, 0);
    return maxReturn.toFixed(2);
  }, [systemCombinations, systemStake]);

  const handlePlaceBetClick = () => {
    if (betSlip.length === 0 || hasOddsChanged) return;

    let finalStake = 0;
    let finalReturn = 0;

    if (betMode === 'multi') {
      finalStake = parseFloat(multiStake) || 0;
      finalReturn = parseFloat(multiPotentialReturn) || 0;
      if (finalStake <= 0) return;
    } else if (betMode === 'single') {
      finalStake = singleTotalStake;
      finalReturn = parseFloat(singlePotentialReturn) || 0;
      if (finalStake <= 0) return;
    } else if (betMode === 'system') {
      finalStake = parseFloat(systemTotalStake) || 0;
      finalReturn = parseFloat(systemMaxReturn) || 0;
      if (finalStake <= 0) return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      onPlaceBet(finalStake, finalReturn, betMode === 'single' ? 'Single' : betMode === 'system' ? 'System' : 'Multi');
      setMultiStake('');
      setSingleStakes({});
      setSystemStake('');
      setShowSuccess(false);
      setActiveTab('mybets');
    }, 1500);
  };

  return (
    <aside className="right-sidebar">
      {showSuccess && (
        <div className="bet-success-overlay">
          <CheckCircle2 size={48} color="var(--bwin-green)" className="success-icon" />
          <h3>Bet Placed!</h3>
          <p>Ticket registered. Good luck!</p>
        </div>
      )}

      {/* Mobile Close Button */}
      {closeMobileSlip && (
        <button className="mobile-close-slip-btn" onClick={closeMobileSlip}>
          <X size={24} />
        </button>
      )}

      {/* Primary Tabs: Bet Slip / My Bets */}
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'betslip' ? 'active' : ''}`}
          onClick={() => setActiveTab('betslip')}
        >
          Bet Slip {betSlip.length > 0 && <span className="tab-badge">{betSlip.length}</span>}
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'mybets' ? 'active' : ''}`}
          onClick={() => setActiveTab('mybets')}
        >
          My Bets {placedBets.length > 0 && <span className="tab-badge">{placedBets.length}</span>}
        </button>
      </div>

      {activeTab === 'betslip' ? (
        <>
          {/* Bet Slip Options (Only visible if there are bets) */}
          {betSlip.length > 0 && (
            <div className="betslip-modes-bar">
              <button 
                className={`mode-btn ${betMode === 'single' ? 'active' : ''}`}
                onClick={() => setBetMode('single')}
              >
                Single
              </button>
              <button 
                className={`mode-btn ${betMode === 'multi' ? 'active' : ''}`}
                onClick={() => setBetMode('multi')}
              >
                Multi
              </button>
              {isSystemAvailable && (
                <button 
                  className={`mode-btn ${betMode === 'system' ? 'active' : ''}`}
                  onClick={() => setBetMode('system')}
                >
                  System
                </button>
              )}
            </div>
          )}

          <div className="bet-slip-header">
            <h2>{betMode === 'single' ? 'Single Bets' : betMode === 'system' ? 'System Accumulators' : 'Multi Accumulator'}</h2>
            {betSlip.length > 0 && (
              <button onClick={clearBetSlip} className="clear-all-btn">Clear All</button>
            )}
          </div>
          
          <div className="bet-slip-content">
            {betSlip.length === 0 ? (
              <div className="empty-slip">
                <p>Your bet slip is empty.</p>
                <p style={{ fontSize: '12px', marginTop: '10px', color: 'var(--bwin-gray-text)' }}>Click on odds to add selections to your bet slip.</p>
              </div>
            ) : (
              <div className="bet-items-container">
                {/* Odds Changed Warning */}
                {hasOddsChanged && (
                  <div className="odds-changed-warning">
                    <div className="warning-text">
                      <AlertTriangle size={16} />
                      <span>Odds have changed!</span>
                    </div>
                    <button className="accept-odds-btn" onClick={acceptOddsChanges}>
                      Accept Changes
                    </button>
                  </div>
                )}

                {betSlip.map(bet => {
                  const status = oddsStatus[bet.id];
                  const hasBetChanged = status?.changed;
                  return (
                    <div key={bet.id} className={`bet-item ${hasBetChanged ? 'changed' : ''}`}>
                      <button className="btn-remove-bet" onClick={() => removeBet(bet.id)} aria-label="Remove Bet">
                        <Trash2 size={15} />
                      </button>
                      <div className="bet-item-header">
                        <span className="bet-selection">{bet.selection}</span>
                        <div className="odds-display-box">
                          {hasBetChanged && (
                            <span className="old-odds">{bet.odds.toFixed(2)}</span>
                          )}
                          <span className={`bet-odds ${hasBetChanged ? (status.direction === 'up' ? 'up' : 'down') : ''}`}>
                            {hasBetChanged && (status.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                            {(status?.current ?? bet.odds).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="bet-match">{bet.match}</div>
                      
                      {/* Individual stake input for Singles */}
                      {betMode === 'single' && (
                        <div className="single-stake-container">
                          <input 
                            type="number"
                            placeholder="Stake"
                            value={singleStakes[bet.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSingleStakes(prev => ({ ...prev, [bet.id]: val }));
                            }}
                            min="0"
                          />
                          <div className="single-return-preview">
                            Return: <span>€{((parseFloat(singleStakes[bet.id]) || 0) * (status?.current ?? bet.odds)).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bet-slip-footer">
            {betSlip.length > 0 && (
              <>
                {/* Multi Bet Footer */}
                {betMode === 'multi' && (
                  <div className="footer-calculations">
                    <div className="bet-stake">
                      <label>Total Stake (€):</label>
                      <input 
                        type="number" 
                        value={multiStake} 
                        onChange={(e) => setMultiStake(e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Total Odds:</span>
                      <span className="summary-value">{totalMultiOdds.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Possible Win:</span>
                      <span className="summary-value highlight">€{multiPotentialReturn}</span>
                    </div>
                  </div>
                )}

                {/* Single Bets Footer */}
                {betMode === 'single' && (
                  <div className="footer-calculations">
                    <div className="summary-row">
                      <span className="summary-label">Total Stake:</span>
                      <span className="summary-value">€{singleTotalStake.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Possible Win:</span>
                      <span className="summary-value highlight">€{singlePotentialReturn}</span>
                    </div>
                  </div>
                )}

                {/* System Bet Footer */}
                {betMode === 'system' && (
                  <div className="footer-calculations">
                    <div className="system-config-row">
                      <label>System size:</label>
                      <select 
                        value={systemSize}
                        onChange={(e) => setSystemSize(parseInt(e.target.value))}
                      >
                        {Array.from({ length: betSlip.length - 1 }, (_, i) => i + 2).map(size => (
                          <option key={size} value={size}>
                            {size}/{betSlip.length} ({getCombinations(betSlip, size).length} bets)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bet-stake">
                      <label>Stake per bet (€):</label>
                      <input 
                        type="number" 
                        value={systemStake} 
                        onChange={(e) => setSystemStake(e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Total Bets:</span>
                      <span className="summary-value">{systemCombinations.length}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Total Stake:</span>
                      <span className="summary-value">€{systemTotalStake}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Max. Win:</span>
                      <span className="summary-value highlight">€{systemMaxReturn}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            
            <button 
              className="btn-place-bet" 
              disabled={
                betSlip.length === 0 || 
                hasOddsChanged ||
                (betMode === 'multi' && (parseFloat(multiStake) || 0) <= 0) ||
                (betMode === 'single' && singleTotalStake <= 0) ||
                (betMode === 'system' && (parseFloat(systemStake) || 0) <= 0)
              }
              onClick={handlePlaceBetClick}
            >
              {hasOddsChanged ? 'Accept Odds to Bet' : 'Place Bet'}
            </button>
          </div>
        </>
      ) : (
        <div className="my-bets-content">
          {placedBets.length === 0 ? (
            <div className="empty-slip">
              <p>You have no recent bets.</p>
            </div>
          ) : (
            <div className="placed-bets-list">
              {placedBets.map(pb => (
                <div key={pb.id} className="placed-bet-card">
                  <div className="pb-header">
                    <div className="pb-type-date">
                      <span className="pb-type-tag">{pb.type}</span>
                      <span className="pb-date">{pb.date}</span>
                    </div>
                    <span className={`pb-status status-${pb.status.toLowerCase()}`}>{pb.status}</span>
                  </div>
                  <div className="pb-selections">
                    {pb.bets.map(b => (
                      <div key={b.id} className="pb-selection-row">
                        <div className="pb-selection-info">
                          <span className="pb-selection">{b.selection}</span>
                          <span className="pb-match-title">{b.match}</span>
                        </div>
                        <span className="pb-odds">{b.odds.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pb-footer">
                    <div className="pb-stake">Stake: <span>€{pb.stake.toFixed(2)}</span></div>
                    <div className="pb-return">To Return: <span>€{pb.potentialReturn.toFixed(2)}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default React.memo(RightSidebar);
