import React, { useState, useMemo } from 'react';
import { Trash2, X, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, ShoppingCart, Award } from 'lucide-react';
import type { Bet, PlacedBet } from '../App';
import type { MatchData } from '../data/matches';
import { leagueOutrights } from '../data/leaguesData';
import { getCombinations, checkIsSelectionWon, formatOdds } from '../utils/betting';
import type { OddsFormat } from '../utils/betting';
import { t } from '../utils/i18n';
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
  balance?: number;
  onCashOut?: (id: string, amount: number) => void;
  onShareBet?: (bet: PlacedBet) => void;
  isSelfExcluded?: boolean;
  oddsFormat?: OddsFormat;
  language?: string;
}

const translateSelection = (selection: string, lang: string): string => {
  if (selection === 'Draw') return t('Draw', lang);
  if (selection === 'Yes') return t('Yes', lang);
  if (selection === 'No') return t('No', lang);
  
  if (selection.includes(':')) {
    const parts = selection.split(':');
    const marketName = parts[0].trim();
    const outcome = parts[1].trim();
    
    const translatedMarket = t(marketName, lang);
    let translatedOutcome = outcome;
    if (outcome === 'Draw') translatedOutcome = t('Draw', lang);
    else if (outcome === 'Yes') translatedOutcome = t('Yes', lang);
    else if (outcome === 'No') translatedOutcome = t('No', lang);
    else if (outcome === 'Over 2.5') translatedOutcome = t('Over 2.5', lang);
    else if (outcome === 'Under 2.5') translatedOutcome = t('Under 2.5', lang);
    
    return `${translatedMarket}: ${translatedOutcome}`;
  }
  
  return selection;
};

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
  betSlip, 
  setBetSlip, 
  removeBet, 
  clearBetSlip, 
  placedBets, 
  onPlaceBet, 
  closeMobileSlip, 
  matches, 
  balance = 10000, 
  onCashOut = () => {},
  onShareBet = () => {},
  isSelfExcluded = false,
  oddsFormat = 'decimal',
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<'betslip' | 'mybets'>('betslip');
  const [betMode, setBetMode] = useState<'single' | 'multi' | 'system'>('multi');
  
  // Stake states
  const [multiStake, setMultiStake] = useState<string>('');
  const [singleStakes, setSingleStakes] = useState<Record<string, string>>({});
  const [systemStake, setSystemStake] = useState<string>(''); // Stake per combination
  const [systemSize, setSystemSize] = useState<number>(2); // e.g. 2 for 2/3
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [cashingOutId, setCashingOutId] = useState<string | null>(null);
  const [shouldShake, setShouldShake] = useState(false);

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
  }, [oddsStatus]);

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

  // Total current stake based on bet mode
  const currentTotalStake = useMemo(() => {
    if (betMode === 'multi') {
      return parseFloat(multiStake) || 0;
    } else if (betMode === 'single') {
      return singleTotalStake;
    } else if (betMode === 'system') {
      return parseFloat(systemTotalStake) || 0;
    }
    return 0;
  }, [betMode, multiStake, singleTotalStake, systemTotalStake]);

  const isBalanceInsufficient = balance < currentTotalStake;

  // Dynamic Cash Out offer calculation
  const getCashOutOffer = (pb: PlacedBet) => {
    if (pb.status !== 'Pending') return 0;
    
    let currentTotalOdds = 1;
    let placedTotalOdds = 1;
    let anyUnavailable = false;
    let isDead = false;

    for (const b of pb.bets) {
      placedTotalOdds *= b.odds;

      // Extract matchId and selection
      let selection = '';
      let matchId = '';
      if (b.id.startsWith('outright-')) {
        selection = 'outright';
        matchId = b.id.replace('outright-', '');
      } else {
        const lastDashIndex = b.id.lastIndexOf('-');
        if (lastDashIndex !== -1) {
          matchId = b.id.substring(0, lastDashIndex);
          selection = b.id.substring(lastDashIndex + 1);
        }
      }

      const match = matches.find(m => m.id === matchId);
      if (!match) {
        currentTotalOdds *= b.odds;
        continue;
      }

      // If match is finished, check if selection won
      if (match.time === 'Finished' || (!match.isLive && match.score && match.time !== 'Live' && !match.time.includes("'") && !match.time.includes('Set') && !match.time.includes('Q'))) {
        const won = checkIsSelectionWon(selection, match.score);
        if (!won) {
          isDead = true;
          break;
        } else {
          currentTotalOdds *= 1.0; // settled outcome acts as 1.0
        }
      } else {
        const currentOdds = getCurrentOdds(b, matches);
        if (currentOdds <= 0) {
          anyUnavailable = true;
          break;
        }
        currentTotalOdds *= currentOdds;
      }
    }

    if (isDead) return 0;
    if (anyUnavailable || currentTotalOdds <= 0) return 0;

    // Cashout = Stake * (Placed Odds / Current Odds) * 0.95
    const offer = pb.stake * (placedTotalOdds / currentTotalOdds) * 0.95;
    return Math.max(pb.stake * 0.10, Math.min(pb.potentialReturn * 0.98, offer));
  };

  const handleCashOutClick = async (betId: string, val: number) => {
    setCashingOutId(betId);
    await new Promise(resolve => setTimeout(resolve, 800)); // mock delay
    onCashOut(betId, val);
    setCashingOutId(null);
  };

  const handlePlaceBetClick = async () => {
    if (betSlip.length === 0 || hasOddsChanged || isBalanceInsufficient) return;

    let finalStake = 0;
    let finalReturn = 0;

    if (betMode === 'multi') {
      finalStake = parseFloat(multiStake) || 0;
      finalReturn = parseFloat(multiPotentialReturn) || 0;
    } else if (betMode === 'single') {
      finalStake = singleTotalStake;
      finalReturn = parseFloat(singlePotentialReturn) || 0;
    } else if (betMode === 'system') {
      finalStake = parseFloat(systemTotalStake) || 0;
      finalReturn = parseFloat(systemMaxReturn) || 0;
    }

    if (finalStake <= 0) return;

    setShowSuccess(true);

    // Call onPlaceBet (may be async if saving to Supabase).
    // We keep the 1500ms "processing" feel for UX, then await the actual save.
    await new Promise(resolve => setTimeout(resolve, 1500));

    await onPlaceBet(finalStake, finalReturn, betMode === 'single' ? 'Single' : betMode === 'system' ? 'System' : 'Multi');

    setMultiStake('');
    setSingleStakes({});
    setSystemStake('');
    setShowSuccess(false);
    setActiveTab('mybets');
  };

  return (
    <aside className="right-sidebar">
      {showSuccess && (
        <div className="bet-success-overlay">
          <div className="success-content">
            <CheckCircle2 size={48} color="var(--bwin-green)" className="success-icon" />
            <h3>{t('Bet Placed!', language)}</h3>
            <p>{t('Ticket registered. Good luck!', language)}</p>
          </div>
          <div className="success-progress-bar">
            <div className="success-progress-fill" />
          </div>
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
          {t('Bet Slip', language)} {betSlip.length > 0 && <span className="tab-badge">{betSlip.length}</span>}
        </button>
        <button 
          className={`sidebar-tab ${activeTab === 'mybets' ? 'active' : ''}`}
          onClick={() => setActiveTab('mybets')}
        >
          {t('My Bets', language)} {placedBets.length > 0 && <span className="tab-badge">{placedBets.length}</span>}
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
                {t('Single', language)}
              </button>
              <button 
                className={`mode-btn ${betMode === 'multi' ? 'active' : ''}`}
                onClick={() => setBetMode('multi')}
              >
                {t('Multi', language)}
              </button>
              {isSystemAvailable && (
                <button 
                  className={`mode-btn ${betMode === 'system' ? 'active' : ''}`}
                  onClick={() => setBetMode('system')}
                >
                  {t('System', language)}
                </button>
              )}
            </div>
          )}

          <div className="bet-slip-header">
            <h2>{betMode === 'single' ? t('Single Bets', language) : betMode === 'system' ? t('System Accumulators', language) : t('Multi Accumulator', language)}</h2>
            {betSlip.length > 0 && (
              <button onClick={clearBetSlip} className="clear-all-btn">{t('Clear All', language)}</button>
            )}
          </div>
          
          <div className="bet-slip-content">
            {betSlip.length === 0 ? (
              <div className="empty-slip">
                <div className="empty-icon-container">
                  <ShoppingCart size={22} />
                </div>
                <h4 className="empty-title">{t('Your bet slip is empty', language)}</h4>
                <p className="empty-desc">{t('Add selections from sportsbook to place a bet.', language)}</p>
                <div className="bet-builder-promo">
                  <span className="promo-tag">{t('Featured', language)}</span>
                  <h5 className="promo-title">{t('Try Bet Builder', language)}</h5>
                  <p className="promo-desc">{t('Combine multiple markets from the same match into one custom accumulator bet.', language)}</p>
                </div>
              </div>
            ) : (
              <div className="bet-items-container">
                {/* Odds Changed Warning */}
                {hasOddsChanged && (
                  <div className="odds-changed-warning">
                    <div className="warning-text">
                      <AlertTriangle size={16} />
                      <span>{t('Odds have changed!', language)}</span>
                    </div>
                    <button className="accept-odds-btn" onClick={acceptOddsChanges}>
                      {t('Accept Changes', language)}
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
                        <span className="bet-selection">{translateSelection(bet.selection, language)}</span>
                        <div className="odds-display-box">
                          {hasBetChanged && (
                            <span className="old-odds">{formatOdds(bet.odds, oddsFormat)}</span>
                          )}
                          <span className={`bet-odds ${hasBetChanged ? (status.direction === 'up' ? 'up' : 'down') : ''}`}>
                            {hasBetChanged && (status.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
                            {formatOdds(status?.current ?? bet.odds, oddsFormat)}
                          </span>
                        </div>
                      </div>
                      <div className="bet-match">{bet.match}</div>
                      
                      {/* Individual stake input for Singles */}
                      {betMode === 'single' && (
                        <div className="single-stake-container">
                          <input 
                            type="number"
                            placeholder={t('Stake', language)}
                            value={singleStakes[bet.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSingleStakes(prev => ({ ...prev, [bet.id]: val }));
                            }}
                            min="0"
                          />
                          <div className="single-return-preview">
                            {t('Return', language)}: <span>€{((parseFloat(singleStakes[bet.id]) || 0) * (status?.current ?? bet.odds)).toFixed(2)}</span>
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
                      <label>{t('Total Stake', language)} (€):</label>
                      <input 
                        type="number" 
                        value={multiStake} 
                        onChange={(e) => setMultiStake(e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div className="quick-stake-chips">
                      {[5, 10, 25, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          className="quick-stake-chip"
                          onClick={() => setMultiStake(val.toString())}
                        >
                          €{val}
                        </button>
                      ))}
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Total Odds', language)}:</span>
                      <span className="summary-value">{formatOdds(totalMultiOdds, oddsFormat)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Possible Win', language)}:</span>
                      <span className="summary-value highlight">€{multiPotentialReturn}</span>
                    </div>
                  </div>
                )}

                {/* Single Bets Footer */}
                {betMode === 'single' && (
                  <div className="footer-calculations">
                    <div className="global-single-stake-chips">
                      <span className="chips-label">{language === 'ru' ? 'Для всех:' : 'All stakes:'}</span>
                      <div className="quick-stake-chips">
                        {[5, 10, 25, 50, 100].map(val => (
                          <button
                            key={val}
                            type="button"
                            className="quick-stake-chip"
                            onClick={() => {
                              const newStakes: Record<string, string> = {};
                              betSlip.forEach(bet => {
                                newStakes[bet.id] = val.toString();
                              });
                              setSingleStakes(newStakes);
                            }}
                          >
                            €{val}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Total Stake', language)}:</span>
                      <span className="summary-value">€{singleTotalStake.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Possible Win', language)}:</span>
                      <span className="summary-value highlight">€{singlePotentialReturn}</span>
                    </div>
                  </div>
                )}

                {/* System Bet Footer */}
                {betMode === 'system' && (
                  <div className="footer-calculations">
                    <div className="system-config-row">
                      <label>{language === 'ru' ? 'Размер системы' : language === 'de' ? 'Systemgröße' : language === 'es' ? 'Tamaño del sistema' : 'System size'}:</label>
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
                      <label>{t('Stake', language)} ({language === 'ru' ? 'на комбинацию' : 'per bet'}) (€):</label>
                      <input 
                        type="number" 
                        value={systemStake} 
                        onChange={(e) => setSystemStake(e.target.value)}
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                    <div className="quick-stake-chips">
                      {[5, 10, 25, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          className="quick-stake-chip"
                          onClick={() => setSystemStake(val.toString())}
                        >
                          €{val}
                        </button>
                      ))}
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{language === 'ru' ? 'Всего ставок' : language === 'de' ? 'Wetten Gesamt' : language === 'es' ? 'Apuestas Totales' : 'Total Bets'}:</span>
                      <span className="summary-value">{systemCombinations.length}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Total Stake', language)}:</span>
                      <span className="summary-value">€{systemTotalStake}</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">{t('Max. Win', language)}:</span>
                      <span className="summary-value highlight">€{systemMaxReturn}</span>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {betSlip.length > 0 && (
              <div className="balance-indicator-row">
                <span className="balance-label">{t('Your Balance', language)}:</span>
                <span className={`balance-value ${isBalanceInsufficient ? 'insufficient' : ''}`}>
                  €{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {betSlip.length > 0 && isBalanceInsufficient && (
              <div className="insufficient-balance-warning">
                <AlertTriangle size={14} />
                <span>{t('Insufficient Balance', language)}!</span>
              </div>
            )}

            {betSlip.length > 0 && isSelfExcluded && (
              <div className="insufficient-balance-warning self-exclusion-warning" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', borderColor: 'rgba(220, 53, 69, 0.2)', color: '#dc3545' }}>
                <AlertTriangle size={14} />
                <span>{language === 'ru' ? 'Аккаунт временно заблокирован! Ставки недоступны.' : 'Account Self-Excluded! Betting is locked.'}</span>
              </div>
            )}
            
            <div 
              className={`place-bet-btn-wrapper ${shouldShake ? 'shake-animation' : ''}`}
              onClick={() => {
                const hasNoStake = (betMode === 'multi' && (parseFloat(multiStake) || 0) <= 0) ||
                                   (betMode === 'single' && singleTotalStake <= 0) ||
                                   (betMode === 'system' && (parseFloat(systemStake) || 0) <= 0);
                if (hasNoStake && betSlip.length > 0 && !hasOddsChanged && !isBalanceInsufficient && !isSelfExcluded) {
                  setShouldShake(true);
                  setTimeout(() => setShouldShake(false), 500);
                }
              }}
              style={{ width: '100%' }}
            >
              <button 
                className="btn-place-bet" 
                disabled={
                  betSlip.length === 0 || 
                  hasOddsChanged ||
                  isBalanceInsufficient ||
                  isSelfExcluded ||
                  (betMode === 'multi' && (parseFloat(multiStake) || 0) <= 0) ||
                  (betMode === 'single' && singleTotalStake <= 0) ||
                  (betMode === 'system' && (parseFloat(systemStake) || 0) <= 0)
                }
                onClick={handlePlaceBetClick}
              >
                {hasOddsChanged ? t('Accept Odds to Bet', language) : isSelfExcluded ? t('Self-Excluded', language) : isBalanceInsufficient ? t('Insufficient Balance', language) : t('Place Bet', language)}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="my-bets-content">
          {placedBets.length === 0 ? (
            <div className="empty-slip">
              <div className="empty-icon-container">
                <Award size={22} />
              </div>
              <h4 className="empty-title">{t('You have no recent bets.', language)}</h4>
              <p className="empty-desc">Your active and settled bets will appear here.</p>
            </div>
          ) : (
            <div className="placed-bets-list">
              {placedBets.map(pb => {
                const cashoutVal = getCashOutOffer(pb);
                return (
                  <div key={pb.id} className={`placed-bet-card pb-card-${pb.status.toLowerCase()}`}>
                    <div className="pb-header">
                      <div className="pb-type-date">
                        <span className="pb-type-tag">{pb.type === 'Single' ? t('Single', language) : pb.type === 'Multi' ? t('Multi', language) : t('System', language)}</span>
                        <span className="pb-date">{pb.date}</span>
                      </div>
                      <span className={`pb-status status-${pb.status.toLowerCase()}`}>{pb.status === 'Pending' ? (language === 'ru' ? 'В игре' : pb.status) : pb.status === 'Won' ? (language === 'ru' ? 'Выигрыш' : pb.status) : (language === 'ru' ? 'Проигрыш' : pb.status)}</span>
                    </div>
                    <div className="pb-selections">
                      {pb.bets.map(b => (
                        <div key={b.id} className="pb-selection-row">
                          <div className="pb-selection-info">
                            <span className="pb-selection">{translateSelection(b.selection, language)}</span>
                            <span className="pb-match-title">{b.match}</span>
                          </div>
                          <span className="pb-odds">{formatOdds(b.odds, oddsFormat)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pb-footer-wrapper">
                      <div className="pb-footer">
                        <div className="pb-stake">{t('Stake', language)}: <span>€{pb.stake.toFixed(2)}</span></div>
                        <div className="pb-return">
                          {pb.status === 'Won' && pb.metadata?.cashed_out ? `${t('Cashed Out', language)}:` : `${t('To Return', language)}:`} 
                          <span>€{pb.potentialReturn.toFixed(2)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {pb.status === 'Pending' && cashoutVal > 0 && (
                          <button 
                            className="btn-cashout" 
                            disabled={cashingOutId !== null}
                            style={{ flex: 1, margin: 0 }}
                            onClick={() => handleCashOutClick(pb.id, cashoutVal)}
                          >
                            {cashingOutId === pb.id ? t('Cashing out...', language) : `${t('Cash Out', language)} €${cashoutVal.toFixed(2)}`}
                          </button>
                        )}
                        <button 
                          className="btn-share-bet" 
                          style={{ 
                            flex: 1, 
                            backgroundColor: 'rgba(194, 249, 90, 0.1)', 
                            border: '1px solid rgba(194, 249, 90, 0.2)', 
                            color: 'var(--betz-accent)', 
                            padding: '8px 10px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold', 
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            borderStyle: 'solid'
                          }}
                          onClick={() => onShareBet(pb)}
                        >
                          <span>🔗</span> {language === 'ru' ? 'Чат' : 'Share'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default React.memo(RightSidebar);
