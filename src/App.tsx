import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import FooterModal from './components/FooterModal';
import LiveChatWidget from './components/LiveChatWidget';
import { initialMatches } from './data/matches';
import type { MatchData, Trend } from './data/matches';
import { generateBetId, getCombinations, checkIsSelectionWon, formatOdds } from './utils/betting';
import type { OddsFormat } from './utils/betting';
import { supabase, hasRealSupabaseConfig } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import './App.css';

// Lazy loading modals to reduce initial bundle size
const AuthModal = React.lazy(() => import('./components/AuthModal'));
const WelcomePopup = React.lazy(() => import('./components/WelcomePopup'));

export interface Bet {
  id: string;
  match: string;
  selection: string;
  odds: number;
}

export interface PlacedBet {
  id: string;
  date: string;
  stake: number;
  bets: Bet[];
  status: 'Pending' | 'Won' | 'Lost';
  potentialReturn: number;
  type: 'Single' | 'Multi' | 'System';
  metadata?: {
    system_size?: number;
    cashed_out?: boolean;
    cashout_amount?: number;
  };
}

export interface AppNotification {
  id: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'goal' | 'bet_won' | 'bet_lost' | 'deposit' | 'system';
}

export type Category = 'Sports' | 'Live Betting' | 'Virtuals' | 'Casino' | 'Live Casino' | 'Poker';
export type Sport = 'Football' | 'Tennis' | 'Basketball' | 'Ice Hockey' | 'Boxing' | 'Cricket' | 'Darts' | 'Formula 1' | 'MMA';

function App() {
  const [betSlip, setBetSlip] = useState<Bet[]>([]);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  
  const [activeCategory, setActiveCategory] = useState<Category>('Sports');
  const [activeSport, setActiveSport] = useState<Sport>('Football');
  const [activeLeague, setActiveLeague] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  
  const [isWelcomePopupOpen, setIsWelcomePopupOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSlipOpen, setIsMobileSlipOpen] = useState(false);

  const [activeFooterTab, setActiveFooterTab] = useState<string | null>(null);
  const [depositLimit, setDepositLimit] = useState<number>(1000);
  const [selfExclusionEndTime, setSelfExclusionEndTime] = useState<number>(0);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  const addBet = useCallback((bet: Bet) => {
    setBetSlip(prev => {
      const exists = prev.find(b => b.id === bet.id);
      if (exists) return prev.filter(b => b.id !== bet.id); // Toggle off if already added
      return [...prev, bet];
    });
  }, []);

  const removeBet = useCallback((id: string) => {
    setBetSlip(prev => prev.filter(b => b.id !== id));
  }, []);

  const clearBetSlip = useCallback(() => {
    setBetSlip([]);
  }, []);

  // Real Supabase auth state (replaces previous fake isLoggedIn + userEmail)
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = !!user;
  const userEmail = user?.email ?? null;

  // New features state
  const [oddsFormat, setOddsFormat] = useState<OddsFormat>(() => {
    return (localStorage.getItem('bwin_odds_format') as OddsFormat) || 'decimal';
  });
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('bwin_language') || 'en';
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const stored = localStorage.getItem('bwin_notifications');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: 'welcome',
        message: '👋 Welcome to bwin! Get your first bet insured up to $50.',
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: 'system'
      }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bwin_odds_format', oddsFormat);
  }, [oddsFormat]);

  useEffect(() => {
    localStorage.setItem('bwin_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('bwin_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => n.read ? n : { ...n, read: true }));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const [matches, setMatches] = useState<MatchData[]>(initialMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [balance, setBalance] = useState<number>(1000);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const triggerGlobalToast = useCallback((message: string, type?: AppNotification['type']) => {
    setGlobalToast(message);
    
    // Determine type from message if not provided
    let notifType: AppNotification['type'] = type || 'system';
    if (message.includes('GOAL') || message.includes('scores') || message.includes('score')) {
      notifType = 'goal';
    } else if (message.includes('WON') || message.includes('won') || message.includes('cashed out') || message.includes('Cashed out')) {
      notifType = 'bet_won';
    } else if (message.includes('Lost') || message.includes('lost')) {
      notifType = 'bet_lost';
    } else if (message.includes('Deposit successful') || message.includes('added to your balance')) {
      notifType = 'deposit';
    }

    setNotifications(prev => [
      {
        id: Math.random().toString(36).substring(2, 11),
        message,
        time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: notifType
      },
      ...prev.slice(0, 49)
    ]);

    const timer = setTimeout(() => {
      setGlobalToast(prev => prev === message ? null : prev);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  // Load balance from localStorage based on guest or user
  useEffect(() => {
    const key = user ? `bwin_balance_${user.id}` : 'bwin_balance_guest';
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      const val = parseFloat(stored);
      if (!isNaN(val)) {
        setBalance(val);
        return;
      }
    }
    setBalance(1000.00);
  }, [user]);

  const updateBalance = useCallback((newBalance: number) => {
    setBalance(newBalance);
    const key = user ? `bwin_balance_${user.id}` : 'bwin_balance_guest';
    localStorage.setItem(key, newBalance.toFixed(2));
  }, [user]);

  // Deposit function passed to Header
  const handleDeposit = useCallback((amount: number) => {
    if (amount > depositLimit) {
      triggerGlobalToast(`❌ Deposit blocked. This deposit of €${amount.toFixed(2)} exceeds your daily limit of €${depositLimit.toFixed(2)}.`);
      return;
    }
    updateBalance(balance + amount);
    triggerGlobalToast(`💰 Deposit successful! €${amount.toFixed(2)} added to your balance.`);
  }, [balance, updateBalance, triggerGlobalToast, depositLimit]);

  // Simulate live match minute increments, score updates, and odds fluctuations
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setMatches(prevMatches => prevMatches.map(match => {
        if (!match.isLive || match.time === 'Finished') return match;

        let newTime = match.time;
        let isFinished = false;
        let newScore = match.score || '0 - 0';
        let homeScore = 0;
        let awayScore = 0;

        if (match.score) {
          const parts = match.score.split('-');
          if (parts.length === 2) {
            homeScore = parseInt(parts[0].trim()) || 0;
            awayScore = parseInt(parts[1].trim()) || 0;
          }
        }

        // Increment time based on sport (faster Clock)
        if (match.sport === 'Football') {
          if (match.time.includes("'")) {
            const minutes = parseInt(match.time.replace("'", ""));
            if (!isNaN(minutes)) {
              if (minutes >= 90) {
                newTime = 'Finished';
                isFinished = true;
              } else {
                newTime = `${minutes + 1}'`;
              }
            }
          }
        } else if (match.sport === 'Basketball') {
          if (match.time.includes('Q')) {
            const matchQ = match.time.match(/Q(\d)\s+(\d+):(\d+)/);
            if (matchQ) {
              const quarter = parseInt(matchQ[1]);
              let minutes = parseInt(matchQ[2]);
              let seconds = parseInt(matchQ[3]);

              seconds -= 15;
              if (seconds < 0) {
                seconds = 45;
                minutes -= 1;
              }

              if (minutes < 0) {
                if (quarter >= 4) {
                  newTime = 'Finished';
                  isFinished = true;
                } else {
                  newTime = `Q${quarter + 1} 12:00`;
                }
              } else {
                newTime = `Q${quarter} ${minutes}:${String(seconds).padStart(2, '0')}`;
              }
            }
          }
        } else if (match.sport === 'Tennis') {
          if (match.time.includes('Set')) {
            const currentSet = parseInt(match.time.replace('Set ', ''));
            if (!isNaN(currentSet)) {
              if (currentSet >= 3 && Math.random() < 0.1) {
                newTime = 'Finished';
                isFinished = true;
              } else {
                if (Math.random() < 0.15) {
                  newTime = `Set ${currentSet + 1}`;
                }
              }
            }
          }
        } else if (match.sport === 'Ice Hockey') {
          if (match.time.includes('P')) {
            const matchP = match.time.match(/P(\d)\s+(\d+):(\d+)/);
            if (matchP) {
              const period = parseInt(matchP[1]);
              let minutes = parseInt(matchP[2]);
              let seconds = parseInt(matchP[3]);

              minutes += 1;
              if (minutes >= 20) {
                if (period >= 3) {
                  newTime = 'Finished';
                  isFinished = true;
                } else {
                  newTime = `P${period + 1} 00:00`;
                }
              } else {
                newTime = `P${period} ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
              }
            }
          }
        }

        // Score updates
        let alertMessage: string | null = null;
        if (!isFinished) {
          if (match.sport === 'Football') {
            if (Math.random() < 0.05) {
              const scoringHome = Math.random() < 0.5;
              if (scoringHome) {
                homeScore += 1;
                alertMessage = `⚽ GOAL! ${match.team1} scores! (${newTime}) ${match.team1} ${homeScore} - ${awayScore} ${match.team2}`;
              } else {
                awayScore += 1;
                alertMessage = `⚽ GOAL! ${match.team2} scores! (${newTime}) ${match.team1} ${homeScore} - ${awayScore} ${match.team2}`;
              }
              newScore = `${homeScore} - ${awayScore}`;
            }
          } else if (match.sport === 'Basketball') {
            if (Math.random() < 0.75) {
              const scoringHome = Math.random() < 0.5;
              const points = Math.random() < 0.35 ? 3 : 2;
              if (scoringHome) {
                homeScore += points;
              } else {
                awayScore += points;
              }
              newScore = `${homeScore} - ${awayScore}`;
            }
          } else if (match.sport === 'Ice Hockey') {
            if (Math.random() < 0.10) {
              const scoringHome = Math.random() < 0.5;
              if (scoringHome) {
                homeScore += 1;
                alertMessage = `🚨 GOAL! ${match.team1} scores! (${newTime}) ${match.team1} ${homeScore} - ${awayScore} ${match.team2}`;
              } else {
                awayScore += 1;
                alertMessage = `🚨 GOAL! ${match.team2} scores! (${newTime}) ${match.team1} ${homeScore} - ${awayScore} ${match.team2}`;
              }
              newScore = `${homeScore} - ${awayScore}`;
            }
          } else if (match.sport === 'Tennis') {
            if (Math.random() < 0.25) {
              const scoringHome = Math.random() < 0.5;
              if (scoringHome) {
                homeScore += 1;
              } else {
                awayScore += 1;
              }
              newScore = `${homeScore} - ${awayScore}`;
            }
          }
        } else {
          alertMessage = `🏁 MATCH FINISHED: ${match.team1} ${homeScore} - ${awayScore} ${match.team2}`;
        }

        if (alertMessage) {
          triggerGlobalToast(alertMessage);
        }

        // Odds fluctuations
        let newOdds = { ...match.odds };
        let newTrend = match.trend ? { ...match.trend } : { home: null, draw: null, away: null } as { home: Trend; draw: Trend; away: Trend };

        if (!isFinished && Math.random() < 0.4) {
          const changeOdds = (oldOdds: number, isWinnerTeam: boolean): { val: number, trend: Trend } => {
            if (oldOdds === 0) return { val: 0, trend: null };
            let fluctuation = (Math.random() - 0.5) * 0.2;
            if (isWinnerTeam) {
              fluctuation -= 0.1;
            } else {
              fluctuation += 0.1;
            }
            const val = Math.max(1.01, parseFloat((oldOdds + fluctuation).toFixed(2)));
            return {
              val,
              trend: val > oldOdds ? 'up' : 'down'
            };
          };

          const isHomeWinning = homeScore > awayScore;
          const isAwayWinning = awayScore > homeScore;

          const homeChange = changeOdds(match.odds.home, isHomeWinning);
          const drawChange = changeOdds(match.odds.draw, homeScore === awayScore);
          const awayChange = changeOdds(match.odds.away, isAwayWinning);

          newOdds = { home: homeChange.val, draw: drawChange.val, away: awayChange.val };
          newTrend = { home: homeChange.trend, draw: drawChange.trend, away: awayChange.trend };
        } else if (isFinished) {
          newOdds = { home: 0, draw: 0, away: 0 };
          newTrend = { home: null, draw: null, away: null };
        }

        return {
          ...match,
          time: newTime,
          score: newScore,
          isLive: !isFinished,
          odds: newOdds,
          trend: newTrend
        };
      }));
    }, 10000); // 10s simulation ticks

    return () => clearInterval(simulationInterval);
  }, [triggerGlobalToast]);

  // Settle placed bets upon match completion
  useEffect(() => {
    const pendingBets = placedBets.filter(pb => pb.status === 'Pending');
    if (pendingBets.length === 0) return;

    let balanceAwarded = 0;
    let updatedBetsCount = 0;
    let showNotification = '';

    const newPlacedBets = placedBets.map(pb => {
      if (pb.status !== 'Pending') return pb;

      let allFinished = true;
      const selectionsSettled: { won: boolean; odds: number; selection: string }[] = [];

      for (const b of pb.bets) {
        if (b.id.startsWith('outright-')) {
          allFinished = false;
          break;
        }

        const lastDashIdx = b.id.lastIndexOf('-');
        const matchId = lastDashIdx !== -1 ? b.id.substring(0, lastDashIdx) : '';
        const selectionCode = lastDashIdx !== -1 ? b.id.substring(lastDashIdx + 1) : '';

        const match = matches.find(m => m.id === matchId);
        if (!match) {
          selectionsSettled.push({ won: true, odds: b.odds, selection: b.selection });
          continue;
        }

        const finished = match.time === 'Finished' || (!match.isLive && match.score && match.time !== 'Live' && !match.time.includes("'") && !match.time.includes('Set') && !match.time.includes('Q'));
        if (!finished) {
          allFinished = false;
          break;
        }

        const won = checkIsSelectionWon(selectionCode, match.score);
        selectionsSettled.push({ won, odds: b.odds, selection: b.selection });
      }

      if (!allFinished) return pb;

      let ticketStatus: 'Won' | 'Lost' = 'Won';
      let finalReturn = 0;

      if (pb.type === 'Multi') {
        const anyLost = selectionsSettled.some(s => !s.won);
        if (anyLost) {
          ticketStatus = 'Lost';
          finalReturn = 0;
        } else {
          ticketStatus = 'Won';
          finalReturn = pb.potentialReturn;
        }
      } else if (pb.type === 'Single') {
        const stakePerBet = pb.stake / pb.bets.length;
        let totalReturn = 0;
        let anyWon = false;

        selectionsSettled.forEach(s => {
          if (s.won) {
            totalReturn += stakePerBet * s.odds;
            anyWon = true;
          }
        });

        ticketStatus = anyWon ? 'Won' : 'Lost';
        finalReturn = parseFloat(totalReturn.toFixed(2));
      } else if (pb.type === 'System') {
        const size = pb.metadata?.system_size || 2;
        const combCount = getCombinations(pb.bets, size).length;
        const stakePerCombo = pb.stake / (combCount || 1);
        let totalReturn = 0;

        const combos = getCombinations(selectionsSettled, size);
        combos.forEach(combo => {
          const allWon = combo.every(s => s.won);
          if (allWon) {
            const comboOdds = combo.reduce((acc, s) => acc * s.odds, 1);
            totalReturn += stakePerCombo * comboOdds;
          }
        });

        ticketStatus = totalReturn > 0 ? 'Won' : 'Lost';
        finalReturn = parseFloat(totalReturn.toFixed(2));
      }

      updatedBetsCount++;
      if (ticketStatus === 'Won') {
        balanceAwarded += finalReturn;
        showNotification = `🏆 Bet Ticket WON! €${finalReturn.toFixed(2)} added to your balance.`;
      } else {
        showNotification = `❌ Bet Ticket Lost. Better luck next time!`;
      }

      // Sync status to database if logged in
      const syncStatusToSupabase = async () => {
        if (user && hasRealSupabaseConfig) {
          try {
            await supabase
              .from('placed_bets')
              .update({ status: ticketStatus, potential_return: finalReturn })
              .eq('id', pb.id);
          } catch (e) {
            console.error('Failed to sync settled bet status to Supabase', e);
          }
        }
      };
      syncStatusToSupabase();

      return {
        ...pb,
        status: ticketStatus,
        potentialReturn: finalReturn
      };
    });

    if (updatedBetsCount > 0) {
      setPlacedBets(newPlacedBets);
      if (balanceAwarded > 0) {
        updateBalance(balance + balanceAwarded);
      }
      if (showNotification) {
        triggerGlobalToast(showNotification);
      }
    }
  }, [matches, placedBets, balance, updateBalance, user, triggerGlobalToast]);

  // Load placed bets from Supabase for the current user (called on login and after place)
  // Defined before handlePlaceBet to avoid TDZ and allow inclusion in its deps.
  const loadPlacedBets = useCallback(async () => {
    const hasRealClient = hasRealSupabaseConfig;

    if (!user || !hasRealClient) return;

    try {
      const { data, error } = await supabase
        .from('placed_bets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load placed bets:', error);
        return;
      }

      if (data) {
        const mapped: PlacedBet[] = data.map((row) => ({
          id: row.id,
          date: new Date(row.created_at).toLocaleString(),
          stake: Number(row.stake),
          potentialReturn: Number(row.potential_return),
          type: row.type,
          status: row.status,
          bets: row.bets as Bet[],
        }));
        setPlacedBets(mapped);
      }
    } catch (e) {
      console.error('Failed to load placed bets from Supabase:', e);
    }
  }, [user]);

  const handlePlaceBet = useCallback(async (stake: number, potentialReturn: number, type: 'Single' | 'Multi' | 'System' = 'Multi') => {
    if (selfExclusionEndTime > Date.now()) {
      triggerGlobalToast(`🔒 Betting blocked. Your account is self-excluded until ${new Date(selfExclusionEndTime).toLocaleTimeString()}.`);
      return;
    }
    if (betSlip.length === 0 || stake <= 0 || balance < stake) return;

    updateBalance(balance - stake);

    const newPlacedBet: PlacedBet = {
      id: generateBetId('ticket', Date.now().toString(36)),
      date: new Date().toLocaleString(),
      stake,
      bets: [...betSlip],
      status: 'Pending',
      potentialReturn,
      type
    };

    const hasRealClient = hasRealSupabaseConfig;

    if (user && hasRealClient) {
      try {
        const { error } = await supabase
          .from('placed_bets')
          .insert({
            user_id: user.id,
            stake,
            potential_return: potentialReturn,
            type,
            bets: newPlacedBet.bets,
          });

        if (error) {
          console.error('Failed to save bet to Supabase:', error);
          setPlacedBets(prev => [newPlacedBet, ...prev]);
        } else {
          await loadPlacedBets();
        }
      } catch (e) {
        console.error('Supabase insert error', e);
        setPlacedBets(prev => [newPlacedBet, ...prev]);
      }
    } else {
      setPlacedBets(prev => [newPlacedBet, ...prev]);
    }

    clearBetSlip();
  }, [betSlip, clearBetSlip, user, loadPlacedBets, balance, updateBalance]);

  const handleCashOut = useCallback(async (betId: string, amount: number) => {
    updateBalance(balance + amount);

    setPlacedBets(prev => prev.map(pb => {
      if (pb.id === betId) {
        return { 
          ...pb, 
          status: 'Won', 
          potentialReturn: amount,
          metadata: { ...pb.metadata, cashed_out: true, cashout_amount: amount }
        };
      }
      return pb;
    }));

    triggerGlobalToast(`💰 Bet cashed out successfully for €${amount.toFixed(2)}!`);

    const hasRealClient = hasRealSupabaseConfig;
    if (user && hasRealClient) {
      try {
        await supabase
          .from('placed_bets')
          .update({ 
            status: 'Won', 
            potential_return: amount,
            metadata: { cashed_out: true, cashout_amount: amount }
          })
          .eq('id', betId);
      } catch (e) {
        console.error('Supabase update error during cashout', e);
      }
    }
  }, [balance, updateBalance, user, triggerGlobalToast]);

  const openAuthModal = useCallback((type: 'login' | 'register') => {
    setAuthType(type);
    setIsAuthModalOpen(true);
  }, []);

  // Real Supabase auth listener + initial session
  useEffect(() => {
    // Get initial session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadPlacedBets(); // load user's bets on initial load if already logged in
      }
    });

    // Subscribe to auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadPlacedBets(); // load bets when user logs in
      } else {
        setPlacedBets([]); // clear on logout
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadPlacedBets]);

  const handleAuthSuccess = useCallback((/* email: string */) => {
    // This is now mostly a no-op because onAuthStateChange will fire and set the real user.
    // Kept for the simulation fallback path when no Supabase keys are configured.
    // The param is required by the AuthModal onSuccess prop but unused here.
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    // user will be cleared by the onAuthStateChange listener above
  }, []);

  const handleCategoryChange = useCallback((cat: Category) => {
    setActiveCategory(cat);
    setSelectedMatchId(null);
    setActiveLeague(null);
    setIsMobileMenuOpen(false);
  }, []);

  const handleSportChange = useCallback((sport: Sport) => {
    setActiveSport(sport);
    setSelectedMatchId(null);
    setActiveLeague(null);
    setIsMobileMenuOpen(false);
  }, []);

  const handleLeagueChange = useCallback((league: string | null) => {
    setActiveLeague(league);
    setSelectedMatchId(null);
  }, []);

  const toggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const toggleMobileSlip = useCallback(() => setIsMobileSlipOpen(prev => !prev), []);
  const closeMobileSlip = useCallback(() => setIsMobileSlipOpen(false), []);

  return (
    <div className={`app-container ${isMobileSlipOpen ? 'slip-open' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      {globalToast && (
        <div className="global-toast-notification" role="alert">
          {globalToast}
        </div>
      )}

      <Header 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryChange}
        openAuthModal={openAuthModal}
        toggleMobileMenu={toggleMobileMenu}
        toggleMobileSlip={toggleMobileSlip}
        betSlipCount={betSlip.length}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
        onLogout={handleLogout}
        balance={balance}
        onDeposit={handleDeposit}
        oddsFormat={oddsFormat}
        setOddsFormat={setOddsFormat}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        markNotificationsAsRead={markNotificationsAsRead}
        clearNotifications={clearNotifications}
      />

      {selfExclusionEndTime > Date.now() && (
        <div className="self-exclusion-alert-banner" role="alert" style={{
          backgroundColor: '#dc3545',
          color: '#fff',
          textAlign: 'center',
          padding: '10px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}>
          🔒 Account self-excluded. Betting is locked.
        </div>
      )}
      
      <div className="main-layout">
        <div className={`sidebar-container left ${isMobileMenuOpen ? 'open' : ''}`}>
          <LeftSidebar 
            activeSport={activeSport} 
            setActiveSport={handleSportChange}
            activeLeague={activeLeague}
            setActiveLeague={handleLeagueChange}
            matches={matches}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
        
        <div className="content-container">
          <MainContent 
            betSlip={betSlip} 
            addBet={addBet}
            activeCategory={activeCategory}
            activeSport={activeSport}
            setActiveSport={handleSportChange}
            activeLeague={activeLeague}
            setActiveLeague={handleLeagueChange}
            selectedMatchId={selectedMatchId}
            setSelectedMatchId={setSelectedMatchId}
            matches={matches}
            setMatches={setMatches}
            searchQuery={searchQuery}
            oddsFormat={oddsFormat}
          />
        </div>

        <div className={`sidebar-container right ${isMobileSlipOpen ? 'open' : ''}`}>
          <RightSidebar 
            betSlip={betSlip} 
            setBetSlip={setBetSlip}
            removeBet={removeBet} 
            clearBetSlip={clearBetSlip}
            placedBets={placedBets}
            onPlaceBet={handlePlaceBet}
            closeMobileSlip={closeMobileSlip}
            matches={matches}
            balance={balance}
            onCashOut={handleCashOut}
            isSelfExcluded={selfExclusionEndTime > Date.now()}
            oddsFormat={oddsFormat}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            type={authType} 
            onSuccess={handleAuthSuccess}
          />
        )}

        {!isLoggedIn && isWelcomePopupOpen && (
          <WelcomePopup 
            isOpen={isWelcomePopupOpen} 
            onClose={() => setIsWelcomePopupOpen(false)}
            openRegister={() => openAuthModal('register')}
          />
        )}
      </Suspense>

      <Footer 
        setActiveCategory={handleCategoryChange}
        setActiveFooterTab={setActiveFooterTab}
      />

      <FooterModal 
        tab={activeFooterTab} 
        onClose={() => setActiveFooterTab(null)}
        balance={balance}
        placedBetsCount={placedBets.length}
        depositLimit={depositLimit}
        setDepositLimit={setDepositLimit}
        selfExclusionEndTime={selfExclusionEndTime}
        setSelfExclusionEndTime={setSelfExclusionEndTime}
        onStartLiveChat={() => setIsLiveChatOpen(true)}
        triggerToast={triggerGlobalToast}
      />

      <LiveChatWidget 
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        balance={balance}
        placedBetsCount={placedBets.length}
        selfExclusionEndTime={selfExclusionEndTime}
      />
      
      {/* Mobile Overlay */}
      {(isMobileMenuOpen || isMobileSlipOpen) && (
        <div className="mobile-overlay" onClick={() => {
          setIsMobileMenuOpen(false);
          setIsMobileSlipOpen(false);
        }}></div>
      )}
    </div>
  );
}

export default App;
