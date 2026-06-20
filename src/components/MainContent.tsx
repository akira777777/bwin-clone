import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Key, TrendingUp, Trophy, Calendar, User } from 'lucide-react';
import type { Bet, Category, Sport } from '../App';
import { fetchLiveMatches } from '../services/api';
import { formatOdds } from '../utils/betting';
import type { OddsFormat } from '../utils/betting';
import { t } from '../utils/i18n';

import MatchDetails from './MatchDetails';
import MatchRow from './MatchRow';
import { Casino } from './Casino';
import { LiveCasino } from './LiveCasino';
import { Poker } from './Poker';
import { Virtuals } from './Virtuals';
import { initialMatches, getDynamicizedMatches } from '../data/matches';
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
  searchQuery?: string;
  oddsFormat: OddsFormat;
  language?: string;
  favorites?: string[];
  toggleFavorite?: (id: string) => void;
  balance?: number;
  updateBalance?: (newBalance: number) => void;
  onWager?: (amount: number) => void;
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
  matches, setMatches, searchQuery = '', oddsFormat, language = 'en',
  favorites = [], toggleFavorite, balance = 10000, updateBalance = () => {}, onWager
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'standings' | 'outrights' | 'stats'>('matches');
  const [promoIndex, setPromoIndex] = useState(0);
  
  const [prevLeague, setPrevLeague] = useState<string | null>(activeLeague);
  if (activeLeague !== prevLeague) {
    setPrevLeague(activeLeague);
    setActiveTab('matches');
  }
  
  const envKey = import.meta.env?.VITE_ODDS_API_KEY || '';
  const initialKey = localStorage.getItem('odds_api_key') || envKey;
  
  const [apiKey, setApiKey] = useState<string>(initialKey);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(!initialKey);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMock, setIsUsingMock] = useState<boolean>(!initialKey);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // mount effect kept for potential future side effects (currently none)
  }, []);

  const loadRealMatches = useCallback(async (key: string) => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const realMatches = await fetchLiveMatches(key);
      if (realMatches.length > 0) {
        setMatches(realMatches);
        setIsUsingMock(false);
      } else {
        setError('No matches found for today. Using mock data.');
        setMatches(getDynamicizedMatches(initialMatches));
        setIsUsingMock(true);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load live matches. Using mock data.';
      setError(errorMessage);
      setMatches(getDynamicizedMatches(initialMatches));
      setIsUsingMock(true);
    } finally {
      setIsLoading(false);
    }
  }, [setMatches]);

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
    setMatches(getDynamicizedMatches(initialMatches));
  };

  useEffect(() => {
    if (apiKey && !isKeyModalOpen && !isUsingMock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadRealMatches(apiKey);
      const refreshInterval = setInterval(() => {
        loadRealMatches(apiKey);
      }, 120000);
      return () => clearInterval(refreshInterval);
    }
  }, [apiKey, isKeyModalOpen, isUsingMock, loadRealMatches]);

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m => 
        m.team1.toLowerCase().includes(q) || 
        m.team2.toLowerCase().includes(q) || 
        m.league.toLowerCase().includes(q)
      );
    }
    return list;
  }, [matches, activeSport, activeLeague, searchQuery]);

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
        <h1 className="visually-hidden">BETZ Live Betting Setup</h1>
        <div className="promo-banner" style={{ justifyContent: 'center' }}>
          <div className="promo-content" style={{ textAlign: 'center', maxWidth: '600px', backgroundColor: 'var(--betz-surface)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Key size={48} style={{ color: 'var(--betz-accent)', marginBottom: '15px' }} />
            <h2>Live Match Data Setup</h2>
            <p style={{ margin: '15px 0' }}>To view real, live matches instead of mock data, you need a free API key from <strong>The Odds API</strong>.</p>
            <ol style={{ textAlign: 'left', margin: '0 auto 20px', maxWidth: '400px', color: 'var(--betz-text-secondary)' }}>
              <li>Go to <a href="https://the-odds-api.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--betz-accent)' }}>the-odds-api.com</a></li>
            </ol>
            <input 
              ref={apiKeyInputRef}
              type="text" 
              placeholder="Paste your API key here..." 
              defaultValue={apiKey}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', backgroundColor: 'var(--betz-input)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#fff', borderRadius: '11px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {(apiKey || isUsingMock) && (
                <button className="btn-promo" style={{ backgroundColor: 'transparent', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--betz-text-muted)' }} onClick={() => setIsKeyModalOpen(false)}>
                  Cancel
                </button>
              )}
              <button className="btn-promo" style={{ backgroundColor: 'transparent', border: '1px solid var(--betz-text-muted)', color: 'var(--betz-text-secondary)' }} onClick={handleSkipApiKey}>
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

  if (activeCategory === 'Casino') {
    return <Casino language={language} balance={balance} updateBalance={updateBalance} onWager={onWager} />;
  }
  if (activeCategory === 'Live Casino') {
    return <LiveCasino language={language} />;
  }
  if (activeCategory === 'Poker') {
    return <Poker language={language} />;
  }

  if (activeCategory === 'Virtuals') {
    return <Virtuals betSlip={betSlip} addBet={addBet} />;
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
          oddsFormat={oddsFormat}
          language={language}
        />
      </main>
    );
  }

  const sportsNav: Sport[] = ['Football', 'Tennis', 'Basketball', 'Ice Hockey'];

  return (
    <main className="main-content" style={{ position: 'relative' }}>
      <h1 className="visually-hidden">BETZ Sportsbook - Live Odds</h1>
      
      {toast && (
        <div className="toast-notification" role="alert">
          {toast}
        </div>
      )}

      {error && error !== 'Invalid API Key' && (
        <div style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', padding: '10px 15px', borderRadius: '4px', margin: '0 20px 20px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }} aria-label="Close Error">×</button>
        </div>
      )}

      {(error === 'Invalid API Key' || isUsingMock) && (
        <div className="subtle-api-indicator" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'var(--betz-text-muted)', fontSize: '12.5px', margin: '0 20px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: error ? '#ff4444' : '#34D399' }}></span>
            <span>
              {error === 'Invalid API Key' ? (
                language === 'ru' 
                  ? 'Режим демо: API ключ недействителен. Используются симулированные данные.' 
                  : language === 'de' 
                    ? 'Demo-Modus: API-Schlüssel ist ungültig. Simulierte Daten werden verwendet.' 
                    : language === 'es'
                      ? 'Modo Demo: La clave API es inválida. Usando datos simulados.'
                      : 'Demo Mode: API key is invalid. Using simulated live data.'
              ) : (
                language === 'ru' 
                  ? 'Режим демо: Используются симулированные данные.' 
                  : language === 'de' 
                    ? 'Demo-Modus: Simulierte Daten werden verwendet.' 
                    : language === 'es'
                      ? 'Modo Demo: Usando datos simulados.'
                      : 'Demo Mode: Using simulated live data.'
              )}
            </span>
          </div>
          <button 
            onClick={() => setIsKeyModalOpen(true)} 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--betz-text-primary)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'all 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--betz-accent)'; e.currentTarget.style.color = '#0A0C0F'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--betz-text-primary)'; }}
          >
            {language === 'ru' ? 'Ввести API ключ' : language === 'de' ? 'API-Schlüssel eingeben' : language === 'es' ? 'Ingresar clave API' : 'Enter API Key'}
          </button>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--bwin-yellow)' }} aria-live="polite">
          {language === 'ru' ? 'Загрузка матчей...' : language === 'de' ? 'Spiele werden geladen...' : language === 'es' ? 'Cargando partidos...' : 'Loading live matches...'}
        </div>
      )}

      {/* Conditional Header: League Center vs Sport Promo */}
      {activeLeague ? (
        <section className="league-center-header">
          <div className="league-info-block">
            <span className="league-flag-large">{LEAGUE_FLAGS[activeLeague] || '🏆'}</span>
            <div className="league-title-meta">
              <span className="league-sport-label">{t(activeSport, language)}</span>
              <h2>{activeLeague}</h2>
              <span className="league-season-label">
                {language === 'ru' ? 'Сезон 2026/2027 • Лайв Центр' : language === 'de' ? 'Saison 2026/2027 • Live-Hub' : language === 'es' ? 'Temporada 2026/2027 • Centro en Vivo' : 'Season 2026/2027 • Live Hub'}
              </span>
            </div>
          </div>
          
          {/* Sub Navigation Tabs */}
          <div className="league-tabs">
            <button 
              className={`league-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              <Calendar size={14} /> {t('Matches', language)}
            </button>
            <button 
              className={`league-tab-btn ${activeTab === 'standings' ? 'active' : ''}`}
              onClick={() => setActiveTab('standings')}
            >
              <Trophy size={14} /> {t('Standings', language)}
            </button>
            <button 
              className={`league-tab-btn ${activeTab === 'outrights' ? 'active' : ''}`}
              onClick={() => setActiveTab('outrights')}
            >
              <TrendingUp size={14} /> {t('Outrights', language)}
            </button>
            {stats.length > 0 && (
              <button 
                className={`league-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <User size={14} /> {t('Stats', language)}
              </button>
            )}
          </div>
        </section>
      ) : (
        /* Promo Carousel */
        activeCategory === 'Live Betting' ? (
          <section className="promo-banner live-betting-banner">
            <div className="promo-content">
              <div className="promo-badge">{language === 'ru' ? 'Лайв' : language === 'de' ? 'Live' : language === 'es' ? 'En Vivo' : 'Live'}</div>
              <h2>{language === 'ru' ? 'Лайв ставки — Действие в реальном времени' : language === 'de' ? 'Live-Wetten — Action in Echtzeit' : language === 'es' ? 'Apuestas en Vivo — Acción en Tiempo Real' : 'Live Betting — Real-time Action'}</h2>
              <p>
                {language === 'ru' ? 'Следите за матчами и делайте ставки по ходу игры. Коэффициенты обновляются каждые 3 секунды!' : language === 'de' ? 'Verfolgen Sie die Spiele und platzieren Sie Ihre Wetten live. Die Quoten werden alle 3 Sekunden aktualisiert!' : language === 'es' ? 'Siga los partidos y realice sus apuestas en vivo. ¡Las cuotas se actualizan cada 3 segundos!' : 'Follow the matches and place your bets as the game unfolds. Odds update every 3 seconds!'}
              </p>
              <button className="btn-promo live-btn" onClick={() => showToast('Live Betting activated!')}>
                {language === 'ru' ? 'Начать лайв ставки' : language === 'de' ? 'Live-Wetten starten' : language === 'es' ? 'Comenzar apuestas en vivo' : 'Start Live Betting'}
              </button>
            </div>
          </section>
        ) : (
          <PromoCarousel language={language} promoIndex={promoIndex} setPromoIndex={setPromoIndex} onAction={showToast} />
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
              {t(sport, language)}
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
                <h3>{t('Live Now', language)}</h3>
              </header>
              <div className="matches-list">
                {liveMatches.map(match => (
                  <MatchRow 
                    key={match.id} 
                    match={match} 
                    betSlip={betSlip} 
                    addBet={addBet} 
                    onSelectMatch={setSelectedMatchId} 
                    oddsFormat={oddsFormat}
                    isFavorite={favorites.includes(match.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Matches Section */}
          {activeCategory !== 'Live Betting' && upcomingMatches.length > 0 && (
            <section className="matches-section">
              <header className="section-header">
                <h3>{t('Upcoming Matches', language)}</h3>
              </header>
              <div className="matches-list">
                {upcomingMatches.map(match => (
                  <MatchRow 
                    key={match.id} 
                    match={match} 
                    betSlip={betSlip} 
                    addBet={addBet} 
                    onSelectMatch={setSelectedMatchId} 
                    oddsFormat={oddsFormat}
                    isFavorite={favorites.includes(match.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          )}

          {(activeCategory === 'Live Betting' ? liveMatches.length === 0 : filteredMatches.length === 0) && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              {activeCategory === 'Live Betting' 
                ? (language === 'ru' ? `Нет доступных лайв матчей для ${activeLeague || t(activeSport, language)}.` : language === 'de' ? `Derzeit keine Live-Spiele für ${activeLeague || t(activeSport, language)}.` : language === 'es' ? `No hay partidos en vivo disponibles para ${activeLeague || t(activeSport, language)}.` : `No live matches currently available for ${activeLeague || t(activeSport, language)}.`)
                : (language === 'ru' ? `Нет доступных матчей для ${activeLeague || t(activeSport, language)}.` : language === 'de' ? `Derzeit keine Spiele für ${activeLeague || t(activeSport, language)}.` : language === 'es' ? `No hay partidos disponibles para ${activeLeague || t(activeSport, language)}.` : `No matches currently available for ${activeLeague || t(activeSport, language)}.`)}
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
                      <th style={{ width: '50px' }}>{language === 'ru' ? 'Ранг' : language === 'de' ? 'Rang' : language === 'es' ? 'Rango' : 'Rank'}</th>
                      <th>{language === 'ru' ? 'Игрок' : language === 'de' ? 'Spieler' : language === 'es' ? 'Jugador' : 'Player'}</th>
                      <th>{language === 'ru' ? 'Страна' : language === 'de' ? 'Land' : language === 'es' ? 'País' : 'Country'}</th>
                      <th style={{ textAlign: 'right' }}>{language === 'ru' ? 'Очки рейтинга' : language === 'de' ? 'Punkte' : language === 'es' ? 'Puntos' : 'Ranking Points'}</th>
                    </tr>
                  ) : activeSport === 'Basketball' && activeLeague === 'NBA' ? (
                    <tr>
                      <th style={{ width: '50px' }}>{language === 'ru' ? 'Поз' : language === 'de' ? 'Pos' : language === 'es' ? 'Pos' : 'Pos'}</th>
                      <th>{language === 'ru' ? 'Команда' : language === 'de' ? 'Team' : language === 'es' ? 'Equipo' : 'Team'}</th>
                      <th style={{ width: '100px' }}>{language === 'ru' ? 'Конф' : language === 'de' ? 'Konf' : language === 'es' ? 'Conf' : 'Conf'}</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>{language === 'ru' ? 'Рекорд (В-П)' : language === 'de' ? 'Bilanz (S-N)' : language === 'es' ? 'Récord (G-P)' : 'Record (W-L)'}</th>
                      <th style={{ width: '100px', textAlign: 'right' }}>GB</th>
                    </tr>
                  ) : activeSport === 'Basketball' && activeLeague !== 'NBA' ? (
                    <tr>
                      <th style={{ width: '50px' }}>{language === 'ru' ? 'Поз' : language === 'de' ? 'Pos' : language === 'es' ? 'Pos' : 'Pos'}</th>
                      <th>{language === 'ru' ? 'Команда' : language === 'de' ? 'Team' : language === 'es' ? 'Equipo' : 'Team'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'И' : language === 'de' ? 'S' : language === 'es' ? 'PJ' : 'P'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'В' : language === 'de' ? 'G' : language === 'es' ? 'G' : 'W'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'П' : language === 'de' ? 'V' : language === 'es' ? 'P' : 'L'}</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>{language === 'ru' ? 'ОЧК' : language === 'de' ? 'PKT' : language === 'es' ? 'PTS' : 'PTS'}</th>
                    </tr>
                  ) : activeSport === 'Ice Hockey' ? (
                    <tr>
                      <th style={{ width: '50px' }}>{language === 'ru' ? 'Поз' : language === 'de' ? 'Pos' : language === 'es' ? 'Pos' : 'Pos'}</th>
                      <th>{language === 'ru' ? 'Команда' : language === 'de' ? 'Team' : language === 'es' ? 'Equipo' : 'Team'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'И' : language === 'de' ? 'S' : language === 'es' ? 'PJ' : 'P'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'В' : language === 'de' ? 'G' : language === 'es' ? 'G' : 'W'}</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>{language === 'ru' ? 'П' : language === 'de' ? 'V' : language === 'es' ? 'P' : 'L'}</th>
                      <th style={{ width: '80px', textAlign: 'right' }}>{language === 'ru' ? 'ОЧК' : language === 'de' ? 'PKT' : language === 'es' ? 'PTS' : 'PTS'}</th>
                    </tr>
                  ) : (
                    /* Football */
                    <tr>
                      <th style={{ width: '50px' }}>{language === 'ru' ? 'Поз' : language === 'de' ? 'Pos' : language === 'es' ? 'Pos' : 'Pos'}</th>
                      <th>{language === 'ru' ? 'Команда' : language === 'de' ? 'Team' : language === 'es' ? 'Equipo' : 'Team'}</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>{language === 'ru' ? 'И' : language === 'de' ? 'S' : language === 'es' ? 'PJ' : 'P'}</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>{language === 'ru' ? 'В' : language === 'de' ? 'G' : language === 'es' ? 'G' : 'W'}</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>{language === 'ru' ? 'Н' : language === 'de' ? 'U' : language === 'es' ? 'E' : 'D'}</th>
                      <th style={{ width: '60px', textAlign: 'center' }}>{language === 'ru' ? 'П' : language === 'de' ? 'V' : language === 'es' ? 'P' : 'L'}</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>{language === 'ru' ? 'Голы' : language === 'de' ? 'Tore' : language === 'es' ? 'Goles' : 'Goals'}</th>
                      <th style={{ width: '60px', textAlign: 'right' }}>{language === 'ru' ? 'ОЧК' : language === 'de' ? 'PKT' : language === 'es' ? 'PTS' : 'PTS'}</th>
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
                          <td style={{ textAlign: 'right', fontWeight: 'bold', color: row.position <= 4 ? 'var(--betz-accent)' : '#fff' }}>{row.points}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--betz-text-secondary)' }}>
              {language === 'ru' ? `Таблица временно недоступна для ${activeLeague}.` : language === 'de' ? `Derzeit keine Tabellendaten für ${activeLeague}.` : language === 'es' ? `No hay datos de clasificación disponibles para ${activeLeague}.` : `No standing data currently available for ${activeLeague}.`}
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
                          <span className="option-odds">{formatOdds(option.odds, oddsFormat)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--bwin-gray-text)' }}>
              {language === 'ru' ? `Ставки на победителя временно недоступны для ${activeLeague}.` : language === 'de' ? `Derzeit keine Quoten für Gesamtsieger für ${activeLeague}.` : language === 'es' ? `No hay apuestas de ganador final disponibles para ${activeLeague}.` : `No outright winner odds currently available for ${activeLeague}.`}
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
                    <th style={{ width: '50px' }}>{language === 'ru' ? 'Поз' : language === 'de' ? 'Pos' : language === 'es' ? 'Pos' : 'Pos'}</th>
                    <th>{language === 'ru' ? 'Игрок' : language === 'de' ? 'Spieler' : language === 'es' ? 'Jugador' : 'Player'}</th>
                    <th>{language === 'ru' ? 'Команда / Страна' : language === 'de' ? 'Team / Land' : language === 'es' ? 'Equipo / País' : 'Team / Country'}</th>
                    <th style={{ textAlign: 'right' }}>{stats[0].statName}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((row) => (
                    <tr key={`${row.player}-${row.position}`}>
                      <td>{row.position}</td>
                      <td style={{ fontWeight: 'bold' }}>{row.player}</td>
                      <td>{row.teamOrCountry}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--betz-accent)' }}>{row.statValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--betz-text-secondary)' }}>
              {language === 'ru' ? `Статистика игроков временно недоступна для ${activeLeague}.` : language === 'de' ? `Derzeit keine Spielerstatistiken für ${activeLeague}.` : language === 'es' ? `No hay estadísticas de jugadores disponibles para ${activeLeague}.` : `No player statistics currently available for ${activeLeague}.`}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default React.memo(MainContent);

/* ============================================================
   Promo Carousel Sub-Component
   ============================================================ */
interface PromoSlide {
  badge: string;
  title: string;
  desc: string;
  cta: string;
  gradient: string;
  borderColor: string;
  badgeBg: string;
}

const promoSlides: Record<string, PromoSlide[]> = {
  en: [
    { badge: 'New Players Only', title: 'First Bet Insurance up to €50', desc: 'Place your first bet risk-free. If it loses, we refund your stake up to €50!', cta: 'Claim Now', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Combo Boost', title: 'Up to 40% Bonus on Accumulators', desc: 'Add 3+ selections and unlock boosted returns. More legs = bigger bonus!', cta: 'Build Your Combo', gradient: 'linear-gradient(135deg, #0d121a 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Weekend Special', title: 'Cashback on Live Bets', desc: 'Get 10% cashback on all live bets this weekend. No wagering requirements!', cta: 'Opt In', gradient: 'linear-gradient(135deg, #2A1010 0%, #13171C 100%)', borderColor: 'var(--betz-live-red)', badgeBg: 'var(--betz-live-red)' },
    { badge: 'Free Bet', title: 'Refer a Friend — Get €20 Free Bet', desc: 'Invite friends to BETZ and earn €20 free bet for each referral. No limit!', cta: 'Invite Now', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
  ],
  ru: [
    { badge: 'Новым игрокам', title: 'Страховка первой ставки до €50', desc: 'Сделайте первую ставку без риска. Если проиграете — вернём ставку до €50!', cta: 'Получить', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Комбо-бонус', title: 'До 40% бонуса на экспрессы', desc: 'Добавьте 3+ события и получите увеличенную выплату. Больше событий = больше бонус!', cta: 'Собрать экспресс', gradient: 'linear-gradient(135deg, #0d121a 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Акция выходных', title: 'Кэшбэк на лайв ставки', desc: 'Получите 10% кэшбэк на все лайв ставки в эти выходные. Без условий отыгрыша!', cta: 'Принять участие', gradient: 'linear-gradient(135deg, #2A1010 0%, #13171C 100%)', borderColor: 'var(--betz-live-red)', badgeBg: 'var(--betz-live-red)' },
    { badge: 'Фрибет', title: 'Приведи друга — получи €20', desc: 'Пригласите друзей на BETZ и получите фрибет €20 за каждого. Без ограничений!', cta: 'Пригласить', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
  ],
  de: [
    { badge: 'Nur Neukunden', title: 'Erste Wette versichert bis €50', desc: 'Platzieren Sie Ihre erste Wette risikofrei. Bei Verlust erstatten wir bis €50!', cta: 'Jetzt sichern', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Kombi-Boost', title: 'Bis zu 40% Bonus auf Kombis', desc: '3+ Auswahlen für erhöhte Gewinne. Mehr Tipps = mehr Bonus!', cta: 'Kombi erstellen', gradient: 'linear-gradient(135deg, #0d121a 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Wochenend-Special', title: 'Cashback auf Live-Wetten', desc: '10% Cashback auf alle Live-Wetten dieses Wochenende!', cta: 'Teilnehmen', gradient: 'linear-gradient(135deg, #2A1010 0%, #13171C 100%)', borderColor: 'var(--betz-live-red)', badgeBg: 'var(--betz-live-red)' },
    { badge: 'Gratiswette', title: 'Freund werben — €20 Gratiswette', desc: 'Laden Sie Freunde ein und erhalten €20 Gratiswette pro Empfehlung!', cta: 'Einladen', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
  ],
  es: [
    { badge: 'Solo nuevos', title: 'Seguro de primera apuesta hasta €50', desc: 'Haz tu primera apuesta sin riesgo. Si pierdes, devolvemos hasta €50!', cta: 'Reclamar', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Combo Boost', title: 'Hasta 40% bonus en combinadas', desc: 'Añade 3+ selecciones y desbloquea mayores ganancias!', cta: 'Crear combinada', gradient: 'linear-gradient(135deg, #0d121a 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
    { badge: 'Fin de semana', title: 'Cashback en apuestas en vivo', desc: '10% de cashback en todas las apuestas en vivo este fin de semana!', cta: 'Participar', gradient: 'linear-gradient(135deg, #2A1010 0%, #13171C 100%)', borderColor: 'var(--betz-live-red)', badgeBg: 'var(--betz-live-red)' },
    { badge: 'Apuesta gratis', title: 'Invita un amigo — €20 gratis', desc: 'Invita amigos a BETZ y gana €20 gratis por cada referido!', cta: 'Invitar', gradient: 'linear-gradient(135deg, #10231C 0%, #13171C 100%)', borderColor: 'var(--betz-accent)', badgeBg: 'var(--betz-accent)' },
  ],
};

function PromoCarousel({ language, promoIndex, setPromoIndex, onAction }: {
  language: string;
  promoIndex: number;
  setPromoIndex: (i: number | ((p: number) => number)) => void;
  onAction: (msg: string) => void;
}) {
  const slides = promoSlides[language] || promoSlides.en;

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIndex((prev: number) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, setPromoIndex]);

  const slide = slides[promoIndex % slides.length];

  return (
    <section 
      className="promo-carousel"
      style={{ background: slide.gradient, borderLeft: `4px solid ${slide.borderColor}` }}
    >
      <div className="promo-carousel-inner" key={promoIndex}>
        <div className="promo-content">
          <div className="promo-badge" style={{ backgroundColor: slide.badgeBg, color: '#000' }}>
            {slide.badge}
          </div>
          <h2>{slide.title}</h2>
          <p>{slide.desc}</p>
          <button className="btn-promo risk-free-btn" onClick={() => onAction(slide.cta + ' clicked!')}>
            {slide.cta}
          </button>
        </div>
      </div>
      <div className="promo-dots">
        {slides.map((_, i) => (
          <button 
            key={i}
            className={`promo-dot ${i === promoIndex % slides.length ? 'active' : ''}`}
            onClick={() => setPromoIndex(i)}
            aria-label={`Go to promo ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
