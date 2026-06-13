import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import Footer from './components/Footer';
import { initialMatches } from './data/matches';
import type { MatchData, Trend } from './data/matches';

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

  const [matches, setMatches] = useState<MatchData[]>(initialMatches);

  // Simulate real-time odds fluctuations
  useEffect(() => {
    const oddsInterval = setInterval(() => {
      setMatches(prevMatches => prevMatches.map(match => {
        if (!match.isLive) return match;
        
        // 40% chance to change odds for a live match per tick
        if (Math.random() < 0.4) {
          const changeOdds = (oldOdds: number): { val: number, trend: Trend } => {
            if (oldOdds === 0) return { val: 0, trend: null };
            const fluctuation = (Math.random() - 0.5) * 0.2;
            const newOdds = Math.max(1.01, oldOdds + fluctuation);
            return {
              val: newOdds,
              trend: newOdds > oldOdds ? 'up' : 'down'
            };
          };

          const homeChange = changeOdds(match.odds.home);
          const drawChange = changeOdds(match.odds.draw);
          const awayChange = changeOdds(match.odds.away);

          return {
            ...match,
            odds: { home: homeChange.val, draw: drawChange.val, away: awayChange.val },
            trend: { home: homeChange.trend, draw: drawChange.trend, away: awayChange.trend }
          };
        }
        
        if (match.trend) {
           return { ...match, trend: { home: null, draw: null, away: null } };
        }
        
        return match;
      }));
    }, 3000);

    return () => clearInterval(oddsInterval);
  }, []);

  // Simulate live match timer incrementing
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setMatches(prevMatches => prevMatches.map(match => {
        if (!match.isLive) return match;
        if (match.time.includes("'")) {
          const minutes = parseInt(match.time.replace("'", ""));
          if (!isNaN(minutes)) {
            return { ...match, time: `${minutes + 1}'` };
          }
        }
        return match;
      }));
    }, 60000); // increment every minute

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWelcomePopupOpen(true);
    }, 1500); // Show popup 1.5s after load
    return () => clearTimeout(timer);
  }, []);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSlipOpen, setIsMobileSlipOpen] = useState(false);

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

  const handlePlaceBet = useCallback((stake: number, potentialReturn: number, type: 'Single' | 'Multi' | 'System' = 'Multi') => {
    if (betSlip.length === 0 || stake <= 0) return;
    
    const newPlacedBet: PlacedBet = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleString(),
      stake,
      bets: [...betSlip],
      status: 'Pending',
      potentialReturn,
      type
    };
    
    setPlacedBets(prev => [newPlacedBet, ...prev]);
    clearBetSlip();
  }, [betSlip, clearBetSlip]);

  const openAuthModal = useCallback((type: 'login' | 'register') => {
    setAuthType(type);
    setIsAuthModalOpen(true);
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
      <Header 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryChange}
        openAuthModal={openAuthModal}
        toggleMobileMenu={toggleMobileMenu}
        toggleMobileSlip={toggleMobileSlip}
        betSlipCount={betSlip.length}
      />
      
      <div className="main-layout">
        <div className={`sidebar-container left ${isMobileMenuOpen ? 'open' : ''}`}>
          <LeftSidebar 
            activeSport={activeSport} 
            setActiveSport={handleSportChange}
            activeLeague={activeLeague}
            setActiveLeague={handleLeagueChange}
            matches={matches}
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
          />
        </div>
      </div>

      <Suspense fallback={null}>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            type={authType} 
          />
        )}

        {isWelcomePopupOpen && (
          <WelcomePopup 
            isOpen={isWelcomePopupOpen} 
            onClose={() => setIsWelcomePopupOpen(false)}
            openRegister={() => openAuthModal('register')}
          />
        )}
      </Suspense>

      <Footer />
      
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
