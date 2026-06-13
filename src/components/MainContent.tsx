import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Key, TrendingUp, Trophy, Calendar, User } from 'lucide-react';
import type { Bet, Category, Sport } from '../App';
import { fetchLiveMatches } from '../services/api';

import MatchDetails from './MatchDetails';
import MatchRow from './MatchRow';
import { Casino } from './Casino';
import { Virtuals } from './Virtuals';
import { initialMatches } from '../data/matches';
import type { MatchData } from '../data/matches';
import { leagueStandings, leagueOutrights, leagueStatsData } from '../data/leaguesData';
import './MainContent.css';

interface MainContentProps {
  betSlip: Bet[];
  addBet: (bet: Bet) => void;
  activeCategory: Category;
  activeSport: Sport;
  setActiveSport: (sport: Sport) => void;
  activeLeague: string | null;
  setActiveLeague: (league: string | null) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  matches: MatchData[];
  setMatches: React.Dispatch<React.SetStateAction<MatchData[]>>;
}

const LEAGUE_FLAGS: Record<string, string> = {
  'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'La Liga': '🇪🇸',
  'Champions League': '🏆',
  'Bundesliga': '🇩🇪',
  'Serie A': '🇮🇹',
  'Ligue 1': '🇫🇷',
  'Wimbledon': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Roland Garros': '🇫🇷',
  'US Open': '🇺🇸',
  'ATP Finals': '🎾',
  'WTA Finals': '🎾',
  'NBA': '🇺🇸',
  'EuroLeague': '🇪🇺',
  'NHL': '🇺🇸',
  'KHL': '🇷🇺',
};

const MainContent: React.FC<MainContentProps> = ({ 
  betSlip, addBet, activeCategory, activeSport, setActiveSport, 
  activeLeague, selectedMatchId, setSelectedMatchId,
  matches, setMatches
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'outrights' | 'stats'>('matches');
  
  const envKey = import.meta.env?.VITE_ODDS_API_KEY || '';
  const initialKey = localStorage.getItem('odds_api_key') || envKey;
  
  const [apiKey, setApiKey] = useState<string>(initialKey);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(!initialKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(!initialKey);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/55fa2d79-84a7-4a3e-959a-92ef52a657d8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bbad23'},body:JSON.stringify({sessionId:'bbad23',runId:'pre-fix',hypothesisId:'B',location:'MainContent.tsx:mount',message:'initial API key state',data:{envKeyPresent:!!envKey,localStorageKeyPresent:!!localStorage.getItem('odds_api_key'),initialKeyPresent:!!initialKey,isKeyModalOpen:!initialKey,isUsingMock:!initialKey},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  }, []);

  // Reset league active tab to 'matches' when the league changes
  useEffect(() => {
    setActiveTab('matches');
  }, [activeLeague]);

  const loadRealMatches = async (key: string) => {
    setIsLoading(true);
    setError(null);
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/55fa2d79-84a7-4a3e-959a-92ef52a657d8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bbad23'},body:JSON.stringify({sessionId:'bbad23',runId:'pre-fix',hypothesisId:'A-B',location:'MainContent.tsx:loadRealMatches:entry',message:'loadRealMatches called',data:{hasKey:!!key,keyLength:key?.length||0,isKeyModalOpen,isUsingMock,activeSport,activeLeague},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    try {
      const realMatches = await fetchLiveMatches(key);
      // #region agent log
      fetch('http://127.0.0.1:7255/ingest/55fa2d79-84a7-4a3e-959a-92ef52a657d8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bbad23'},body:JSON.stringify({sessionId:'bbad23',runId:'pre-fix',hypothesisId:'A-D',location:'MainContent.tsx:loadRealMatches:success',message:'fetchLiveMatches returned',data:{matchCount:realMatches.length,sports:[...new Set(realMatches.map((m: MatchData)=>m.sport))],leagues:[...new Set(realMatches.map((m: MatchData)=>m.league))].slice(0,8),liveCount:realMatches.filter((m: MatchData)=>m.isLive).length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      if (realMatches.length > 0) {
        setMatches(realMatches);
        setIsUsingMock(false);
      } else {
        setError('No matches found for today. Using mock data.');
        setMatches(initialMatches);
        setIsUsingMock(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load live matches. Using mock data.';
      // #region agent log
      fetch('http://127.0.0.1:7255/ingest/55fa2d79-84a7-4a3e-959a-92ef52a657d8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bbad23'},body:JSON.stringify({sessionId:'bbad23',runId:'pre-fix',hypothesisId:'A-B',location:'MainContent.tsx:loadRealMatches:error',message:'fetchLiveMatches failed',data:{errorMessage},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setError(errorMessage);
      setMatches(initialMatches);
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    const key = apiKeyInputRef.current?.value || '';
    if (key.trim() !== '') {
      setApiKey(key);
      localStorage.setItem('odds_api_key', key);
      setIsKeyModalOpen(false);
      loadRealMatches(key);
    }
  };

  const handleSkipApiKey = () => {
    setIsKeyModalOpen(false);
    setIsUsingMock(true);
    setMatches(initialMatches);
  };

  useEffect(() => {
    if (apiKey && !isKeyModalOpen && !isUsingMock) {
      loadRealMatches(apiKey);
      const refreshInterval = setInterval(() => {
        loadRealMatches(apiKey);
      }, 120000);
      return () => clearInterval(refreshInterval);
    }
  }, [apiKey, isKeyModalOpen, isUsingMock]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedMatch = useMemo(() => {
    return selectedMatchId ? matches.find(m => m.id === selectedMatchId) : null;
  }, [matches, selectedMatchId]);

  const filteredMatches = useMemo(() => {
    let list = matches.filter(m => m.sport === activeSport);
    if (activeLeague) {
      list = list.filter(m => m.league === activeLeague);
    }
    // #region agent log
    fetch('http://127.0.0.1:7255/ingest/55fa2d79-84a7-4a3e-959a-92ef52a657d8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bbad23'},body:JSON.stringify({sessionId:'bbad23',runId:'pre-fix',hypothesisId:'D',location:'MainContent.tsx:filteredMatches',message:'matches filtered',data:{totalMatches:matches.length,filteredCount:list.length,activeSport,activeLeague,availableLeagues:[...new Set(matches.filter(m=>m.sport===activeSport).map(m=>m.league))].slice(0,10)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return list;
  }, [matches, activeSport, activeLeague]);

  const liveMatches = useMemo(() => {
    return filteredMatches.filter(m => m.isLive);
  }, [filteredMatches]);

  const upcomingMatches = useMemo(() => {
    return filteredMatches.filter(m => !m.isLive);
  }, [filteredMatches]);

  const standings = useMemo(() => {
    return activeLeague ? leagueStandings[activeLeague] || [] : [];
  }, [activeLeague]);

  const outrights = useMemo(() => {
    return activeLeague ? leagueOutrights[activeLeague] || [] : [];
  }, [activeLeague]);

  const stats = useMemo(() => {
    return activeLeague ? leagueStatsData[activeLeague] || [] : [];
  }, [activeLeague]);

  const handleOutrightBetClick = (outrightTitle: string, optionName: string, odds: number, optionId: string) => {
    const betId = `outright-${optionId}`;
    addBet({
      id: betId,
      match: outrightTitle,
      selection: optionName,
      odds: odds
    });
    const exists = betSlip.some(b => b.id === betId);
    if (exists) {
      showToast(`Removed from Bet Slip: ${optionName}`);
    } else {
      showToast(`Added to Bet Slip: ${optionName} (${odds})`);
    }
  };

  if (isKeyModalOpen) {
    return (
      <main className="main-content">
        <h1 className="visually-hidden">Bwin Clone Live Betting Setup</h1>
        <div className="promo-banner" style={{ justifyContent: 'center' }}>
          <div className="promo-content" style={{ textAlign: 'center', maxWidth: '600px', backgroundColor: 'var(--bwin-surface)', padding: '30px', borderRadius: '8px' }}>
            <Key size={48} style={{ color: 'var(--bwin-yellow)', marginBottom: '15px' }} />
            <h2>Live Match Data Setup</h2>
            <p style={{ margin: '15px 0' }}>To view real, live matches instead of mock data, you need a free API key from <strong>The Odds API</strong>.</p>
            <ol style={{ textAlign: 'left', margin: '0 auto 20px', maxWidth: '400px', color: 'var(--bwin-gray-text)' }}>
              <li>Go to <a href="https://the-odds-api.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--bwin-yellow)' }}>the-odds-api.com</a></li>
              <li>Click "Get a free API key"</li>
              <li>Paste the key below</li>
            </ol>
            <input 
              ref={apiKeyInputRef}
              type="text" 
              placeholder="Paste your API key here..." 
              style={{ width: '100%', padding: '12px', marginBottom: '20px', backgroundColor: 'var(--bwin-bg)', border: '1px solid var(--bwin-border)', color: '#fff', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button className="btn-promo" style={{ backgroundColor: 'transparent', border: '1px solid var(--bwin-gray-text)' }} onClick={handleSkipApiKey}>
                Skip (Use Mock Data)
              </button>
              <button className="btn-promo risk-free-btn" onClick={handleSaveApiKey}>
                Connect Live Data
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (activeCategory === 'Casino' || activeCategory === 'Live Casino' || activeCategory === 'Poker') {
    return <Casino />;
  }

  if (activeCategory === 'Virtuals') {
    return <Virtuals />;
  }

  if (selectedMatch) {
    return (
      <main className="main-content">
        <h1 className="visually-hidden">Match Details - {selectedMatch.team1} vs {selectedMatch.team2}</h1>
        {toast && <div className="toast-notification">{toast}</div>}
        <MatchDetails 
          match={selectedMatch} 
          onBack={() => setSelectedMatchId(null)} 
          betSlip={betSlip}
          addBet={addBet}
        />
      </main>
    );
  }

  const sportsNav: Sport[] = ['Football', 'Tennis', 'Basketball', 'Ice Hockey'];

  return (
    <main className="main-content" style={{ position: 'relative' }}>
      <h1 className="visually-hidden">Bwin Clone Sports Betting - Live Odds</h1>
      
      {toast && (
        <div className="toast-notification" role="alert">
          {toast}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 15px', borderRadius: '4px', margin: '0 20px 20px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }} aria-label="Close Error">×</button>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--bwin-yellow)' }} aria-live="polite">
          Loading live matches...
        </div>
      )}

      {/* Conditional Header: League Center vs Sport Promo */}
      {activeLeague ? (
        <section className="league-center-header">
          <div className="league-info-block">
            <span className="league-flag-large">{LEAGUE_FLAGS[activeLeague] || '🏆'}</span>
            <div className="league-title-meta">
              <span className="league-sport-label">{activeSport}</span>
              <h2>{activeLeague}</h2>
              <span className="league-season-label">Season 2026/2027 • Live Hub</span>
            </div>
          </div>
          
          {/* Sub Navigation Tabs */}
          <div className="league-tabs">
            <button 
              className={`league-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              <Calendar size={14} /> Matches
            </button>
            <button 
              className={`league-tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
              onClick={() => setActiveTab('standings')}
            >
              <Trophy size={14} /> Standings
            </button>
            <button 
              className={`league-tab-btn ${activeTab === 'outrights' ? 'active' : ''}`}
              onClick={() => setActiveTab('outrights')}
            >
              <TrendingUp size={14} /> Outrights
            </button>
            {stats.length > 0 && (
              <button 
                className={`league-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <User size={14} /> Stats
              </button>
            )}
          </div>
        </section>
      ) : (
        /* Promotional Banner — different for Live Betting vs Sports */
        activeCategory === 'Live Betting' ? (
          <section className="promo-banner live-betting-banner">
            <div className="promo-content">
              <div className="promo-badge">Live</div>
              <h2>Live Betting — Real-time Action</h2>
              <p>Follow the matches and place your bets as the game unfolds. Odds update every 3 seconds!</p>
              <button className="btn-promo live-btn" onClick={() => showToast('Live Betting activated!')}>
                Start Live Betting
              </button>
            </div>
          </section>
        ) : (
          <section className="promo-banner risk-free-banner">
            <div className="promo-content">
              <div className="promo-badge">New Players Only</div>
              <h2>Your First Bet is Insured up to $50</h2>
              <p>Place a bet. If it doesn't win, we will refund 100% of your stake as a Free Bet!</p>
              <button className="btn-promo risk-free-btn" onClick={() => showToast('Bonus activated! Please register an account.')}>
                Claim Risk-Free Bet
              </button>
            </div>
          </section>
        )
      )}

      {/* Highlights Navigation */}
      {!activeLeague && (
        <nav className="sports-nav" aria-label="Sports Categories">
          {sportsNav.map(sport => (
            <button 
              key={sport}
              className={`sport-nav-btn ${activeSport === sport ? 'active' : ''}`}
              onClick={() => setActiveSport(sport)}
              aria-pressed={activeSport === sport}
            >
              {sport}
            </button>
          ))}
        </nav>
      )}

      {/* TAB CONTENT: Matches */}
      {activeTab === 'matches' && (
        <>
          {/* Live Matches Section */}
          {liveMatches.length > 0 && (
            <section className="matches-section">
              <header className="section-header">
                <h3>Live Now</h3>
              </header>
              <div className="matches-list">
                {liveMatches.map(match => (
                  <MatchRow 
                    key={match.id} 
                    match={match} 
                    betSlip={betSlip} 
                    addBet={addBet} 
                    onSelectMatch={setSelectedMatchId} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Matches Section */}
          {activeCategory !== 'Live Betting' && upcomingMatches.length > 0 && (
            <section className="matches-section">
              <header className="section-header">
                <h3>Upcoming Matches</h3>
              </header>
              <div className="matches-list">
                {upcomingMatches.map(match => (
                  <MatchRow 
                    key={match.id} 
                    match={match} 
                    betSlip={betSlip} 
                    addBet={addBet} 
                    onSelectMatch={setSelectedMatchId} 
                  />
                ))}
              </div>
            </section>
          )}

          {(activeCategory === 'Live Betting' ? liveMatches.length === 0 : filteredMatches.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              {activeCategory === 'Live Betting' 
                ? `No live matches currently available for ${activeLeague || activeSport}.`
                : `No matches currently available for ${activeLeague || activeSport}.`}
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT: Standings */}
      {activeTab === 'standings' && (
        <section className="league-standings-section">
          {standings.length > 0 ? (
            <div className="table-responsive">
              <table className="standings-table">
                <thead>
                  {activeSport === 'Tennis' ? (
                    <tr>
                      <th style={{ width: '50px' }}>Rank</th>
                      <th>Player</th>
                      <th>Country</th>
                      <th style={{ textAlign: 'right' }}>Ranking Points</th>
                    </tr>
                  ) : activeSport === 'Basketball' && activeLeague === 'NBA' ? (
                    <tr>
                      <th style={{ width: '50px' }}>Pos</th>
                      <th>Team</th>
                      <th style={{ width: '100px' }}>Conf</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Record (W-L)</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>GB</th>
                    </tr>
                  ) : activeSport === 'Basketball' && activeLeague !== 'NBA' ? (
                    <tr>
                      <th style={{ width: '50px' }}>Pos</th>
                      <th>Team</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>P</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>W</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>L</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>PTS</th>
                    </tr>
                  ) : activeSport === 'Ice Hockey' ? (
                    <tr>
                      <th style={{ width: '50px' }}>Pos</th>
                      <th>Team</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>P</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>W</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>L</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>PTS</th>
                    </tr>
                  ) : (
                    /* Football */
                    <tr>
                      <th style={{ width: '50px' }}>Pos</th>
                      <th>Team</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>P</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>W</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>D</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>L</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>Goals</th>
                      <th style={{ width: '60px', textAlign: 'right' }}>PTS</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {standings.map((row) => (
                    <tr key={`${row.team}-${row.position}`}>
                      <td className="pos-cell">{row.position}</td>
                      <td className="team-name-cell">{row.team}</td>
                      
                      {activeSport === 'Tennis' ? (
                        <>
                          <td>{row.country}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.rankingPoints}</td>
                        </>
                      ) : activeSport === 'Basketball' && activeLeague === 'NBA' ? (
                        <>
                          <td>{row.conference}</td>
                          <td style={{ textAlign: 'center' }}>{row.winLossRatio}</td>
                          <td style={{ textAlign: 'right' }}>{row.gamesBehind}</td>
                        </>
                      ) : activeSport === 'Basketball' && activeLeague !== 'NBA' ? (
                        <>
                          <td style={{ textAlign: 'center' }}>{row.played}</td>
                          <td style={{ textAlign: 'center' }}>{row.won}</td>
                          <td style={{ textAlign: 'center' }}>{row.lost}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.points}</td>
                        </>
                      ) : activeSport === 'Ice Hockey' ? (
                        <>
                          <td style={{ textAlign: 'center' }}>{row.played}</td>
                          <td style={{ textAlign: 'center' }}>{row.won}</td>
                          <td style={{ textAlign: 'center' }}>{row.lost}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{row.points}</td>
                        </>
                      ) : (
                        /* Football */
                        <>
                          <td style={{ textAlign: 'center' }}>{row.played}</td>
                          <td style={{ textAlign: 'center' }}>{row.won}</td>
                          <td style={{ textAlign: 'center' }}>{row.drawn}</td>
                          <td style={{ textAlign: 'center' }}>{row.lost}</td>
                          <td style={{ textAlign: 'center' }}>{row.goalsFor}:{row.goalsAgainst}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: row.position <= 4 ? 'var(--bwin-yellow)' : '#fff' }}>{row.points}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              No standing data currently available for {activeLeague}.
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: Outrights */}
      {activeTab === 'outrights' && (
        <section className="league-outrights-section">
          {outrights.length > 0 ? (
            <div className="outrights-list">
              {outrights.map((outright) => (
                <div key={outright.id} className="outright-card">
                  <div className="outright-header">
                    <Trophy size={16} className="outright-icon" />
                    <h4>{outright.title}</h4>
                  </div>
                  <div className="outright-options-grid">
                    {outright.options.map((option) => {
                      const betId = `outright-${option.id}`;
                      const isAdded = betSlip.some(b => b.id === betId);
                      return (
                        <button
                          key={option.id}
                          className={`outright-option-btn ${isAdded ? 'active' : ''}`}
                          onClick={() => handleOutrightBetClick(outright.title, option.selection, option.odds, option.id)}
                        >
                          <span className="option-name">{option.selection}</span>
                          <span className="option-odds">{option.odds.toFixed(2)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              No outright winner odds currently available for {activeLeague}.
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT: Stats */}
      {activeTab === 'stats' && (
        <section className="league-stats-section">
          {stats.length > 0 ? (
            <div className="table-responsive">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>Pos</th>
                    <th>Player</th>
                    <th>Team / Country</th>
                    <th style={{ textAlign: 'right' }}>{stats[0].statName}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row) => (
                    <tr key={`${row.player}-${row.position}`}>
                      <td>{row.position}</td>
                      <td style={{ fontWeight: 'bold' }}>{row.player}</td>
                      <td>{row.teamOrCountry}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--bwin-yellow)' }}>{row.statValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              No player statistics currently available for {activeLeague}.
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default React.memo(MainContent);
