import React, { useMemo } from 'react';
import { Search, Star, ChevronRight, Zap, TrendingUp, Award, Shield } from 'lucide-react';
import type { Sport } from '../App';
import type { MatchData } from '../data/matches';
import { t } from '../utils/i18n';
import './LeftSidebar.css';

interface LeftSidebarProps {
  activeSport: Sport;
  setActiveSport: (sport: Sport) => void;
  activeLeague: string | null;
  setActiveLeague: (league: string | null) => void;
  matches: MatchData[];
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  language?: string;
  favorites?: string[];
  onSelectMatch?: (id: string | null) => void;
}

interface LeagueInfo {
  name: string;
  flag: string;
  sport: Sport;
}

const LEAGUES: LeagueInfo[] = [
  // Football
  { name: 'Premier League', flag: '🏴\u200D󠁢󠁥󠁮󠁧󠁿', sport: 'Football' },
  { name: 'La Liga', flag: '🇪🇸', sport: 'Football' },
  { name: 'Champions League', flag: '🏆', sport: 'Football' },
  { name: 'Bundesliga', flag: '🇩🇪', sport: 'Football' },
  { name: 'Serie A', flag: '🇮🇹', sport: 'Football' },
  { name: 'Ligue 1', flag: '🇫🇷', sport: 'Football' },
  // Tennis
  { name: 'Wimbledon', flag: '🏴\u200D󠁢󠁥󠁮󠁧󠁿', sport: 'Tennis' },
  { name: 'Roland Garros', flag: '🇫🇷', sport: 'Tennis' },
  { name: 'US Open', flag: '🇺🇸', sport: 'Tennis' },
  { name: 'ATP Finals', flag: '🎾', sport: 'Tennis' },
  { name: 'WTA Finals', flag: '🎾', sport: 'Tennis' },
  // Basketball
  { name: 'NBA', flag: '🇺🇸', sport: 'Basketball' },
  { name: 'EuroLeague', flag: '🇪🇺', sport: 'Basketball' },
  // Ice Hockey
  { name: 'NHL', flag: '🇺🇸', sport: 'Ice Hockey' },
  { name: 'KHL', flag: '🇷🇺', sport: 'Ice Hockey' },
];

const SPORT_ICONS: Record<string, string> = {
  'Football': '⚽',
  'Tennis': '🎾',
  'Basketball': '🏀',
  'Ice Hockey': '🏒',
  'Boxing': '🥊',
  'Cricket': '🏏',
  'Darts': '🎯',
  'Formula 1': '🏎️',
  'MMA': '🥋',
};

const COMPETITION_BADGES: Record<string, { code: string; color: string; bg: string }> = {
  'Champions League': { code: 'UCL', color: '#FFFFFF', bg: '#0A2540' },
  'Premier League': { code: 'EPL', color: '#FFFFFF', bg: '#3D195A' },
  'La Liga': { code: 'LIG', color: '#FFFFFF', bg: '#00529F' },
  'NBA': { code: 'NBA', color: '#FFFFFF', bg: '#1D428A' },
  'Bundesliga': { code: 'DFB', color: '#FFFFFF', bg: '#D3010C' },
  'Serie A': { code: 'ISA', color: '#FFFFFF', bg: '#002F6C' },
  'Ligue 1': { code: 'L1', color: '#FFFFFF', bg: '#DAE025' },
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  activeSport, 
  setActiveSport, 
  activeLeague, 
  setActiveLeague, 
  matches,
  searchQuery = '',
  setSearchQuery = () => {},
  language = 'en',
  favorites = [],
  onSelectMatch
}) => {
  const sportsList: Sport[] = ['Football', 'Tennis', 'Basketball', 'Ice Hockey'];
  const extraSports: Sport[] = ['Boxing', 'Cricket', 'Darts', 'Formula 1', 'MMA'];

  const favoriteMatches = useMemo(() => {
    return matches.filter(m => favorites.includes(m.id));
  }, [matches, favorites]);

  // Count matches per league and live status
  const leagueStats = useMemo(() => {
    const stats: Record<string, { total: number; live: number }> = {};
    matches.forEach(m => {
      if (!stats[m.league]) stats[m.league] = { total: 0, live: 0 };
      stats[m.league].total++;
      if (m.isLive) stats[m.league].live++;
    });
    return stats;
  }, [matches]);

  // Count matches per sport
  const sportStats = useMemo(() => {
    const stats: Record<string, { total: number; live: number }> = {};
    matches.forEach(m => {
      if (!stats[m.sport]) stats[m.sport] = { total: 0, live: 0 };
      stats[m.sport].total++;
      if (m.isLive) stats[m.sport].live++;
    });
    return stats;
  }, [matches]);

  const currentLeagues = useMemo(() => {
    const hardcodedForSport = LEAGUES.filter(l => l.sport === activeSport);
    const hardcodedByName = new Map(hardcodedForSport.map(l => [l.name, l]));
    const fromMatches = new Map<string, LeagueInfo>();

    matches
      .filter(m => m.sport === activeSport)
      .forEach(m => {
        if (!fromMatches.has(m.league)) {
          const hardcoded = hardcodedByName.get(m.league);
          fromMatches.set(m.league, {
            name: m.league,
            flag: hardcoded?.flag ?? '🏆',
            sport: activeSport,
          });
        }
      });

    if (fromMatches.size > 0) {
      return Array.from(fromMatches.values()).sort(
        (a, b) => (leagueStats[b.name]?.total ?? 0) - (leagueStats[a.name]?.total ?? 0)
      );
    }

    return hardcodedForSport;
  }, [matches, activeSport, leagueStats]);

  const popularLeagues = useMemo(() => {
    const withMatches = currentLeagues.filter(l => (leagueStats[l.name]?.total ?? 0) > 0);
    return (withMatches.length > 0 ? withMatches : currentLeagues).slice(0, 4);
  }, [currentLeagues, leagueStats]);

  const handleLeagueClick = (league: LeagueInfo) => {
    if (league.sport !== activeSport) {
      setActiveSport(league.sport);
    }
    setActiveLeague(activeLeague === league.name ? null : league.name);
    setSearchQuery('');
  };

  const handleSportClick = (sport: Sport) => {
    setActiveSport(sport);
    setActiveLeague(null);
    setSearchQuery('');
  };

  const getLeagueBadge = (name: string) => {
    if (COMPETITION_BADGES[name]) return COMPETITION_BADGES[name];
    // Generate a 3-letter code from name
    const words = name.split(' ');
    let code: string;
    if (words.length >= 3) {
      code = (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
      code = (words[0][0] + words[1][0] + words[1][1]).toUpperCase();
    } else {
      code = name.substring(0, 3).toUpperCase();
    }
    return { code, color: '#FFFFFF', bg: '#1B232B' };
  };

  const handleQuickLinkClick = (linkName: string) => {
    // Show a simple console message or trigger filter
    console.log(`Quick Link clicked: ${linkName}`);
  };

  return (
    <aside className="left-sidebar">
      {/* Search Bar */}
      <div className="sidebar-search-card">
        <div className="sidebar-search">
          <Search size={16} className="sidebar-search-icon" />
          <input 
            type="text" 
            placeholder={t('Search events...', language)} 
            className="sidebar-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Favorites */}
      {favoriteMatches.length > 0 && (
        <div className="sidebar-card">
          <h3 className="sidebar-card-title">
            <Star size={12} fill="var(--betz-accent)" style={{ color: 'var(--betz-accent)' }} />
            {language === 'ru' ? 'Избранное' : language === 'de' ? 'Favoriten' : language === 'es' ? 'Favoritos' : 'Favorites'}
          </h3>
          <ul className="sidebar-list">
            {favoriteMatches.map(match => (
              <li 
                key={match.id}
                className="sidebar-item"
                onClick={() => onSelectMatch?.(match.id)}
              >
                <span className="sport-badge-emoji">{SPORT_ICONS[match.sport] || '🏆'}</span>
                <div className="favorite-match-details">
                  <span className="favorite-team">{match.team1}</span>
                  <span className="favorite-team">{match.team2}</span>
                </div>
                <div className="item-meta">
                  {match.isLive && match.score && (
                    <span className="favorite-score">{match.score}</span>
                  )}
                  <ChevronRight size={14} className="chevron" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TOP COMPETITIONS CARD */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">
          <Star size={12} style={{ color: 'var(--betz-accent)' }} />
          {language === 'ru' ? 'Популярные турниры' : language === 'de' ? 'Top-Wettbewerbe' : 'Top Competitions'}
        </h3>
        <ul className="sidebar-list">
          {popularLeagues.map(league => {
            const stats = leagueStats[league.name];
            const badge = getLeagueBadge(league.name);
            return (
              <li 
                key={league.name}
                className={`sidebar-item ${activeLeague === league.name ? 'active' : ''}`}
                onClick={() => handleLeagueClick(league)}
              >
                <div className="comp-badge-square" style={{ backgroundColor: badge.bg, color: badge.color }}>
                  {badge.code}
                </div>
                <span className="comp-name">{league.name}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-indicator">
                      <span className="live-dot-mini"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="comp-count">{stats.total}</span>}
                  <ChevronRight size={14} className="chevron" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* QUICK LINKS CARD */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">
          {language === 'ru' ? 'Быстрые ссылки' : language === 'de' ? 'Quick Links' : 'Quick Links'}
        </h3>
        <ul className="sidebar-list">
          <li className="sidebar-item" onClick={() => handleQuickLinkClick('Bet Builder')}>
            <div className="quick-icon-container">
              <Zap size={16} stroke="#C2F95A" fill="rgba(194, 249, 90, 0.1)" />
            </div>
            <span className="quick-link-text">Bet Builder</span>
            <ChevronRight size={14} className="chevron" />
          </li>
          <li className="sidebar-item" onClick={() => handleQuickLinkClick('Boosted Odds')}>
            <div className="quick-icon-container">
              <TrendingUp size={16} stroke="#F4B740" />
            </div>
            <span className="quick-link-text">Boosted Odds</span>
            <ChevronRight size={14} className="chevron" />
          </li>
          <li className="sidebar-item" onClick={() => handleQuickLinkClick('Acca of the Day')}>
            <div className="quick-icon-container">
              <Award size={16} stroke="#7FA0FF" />
            </div>
            <span className="quick-link-text">Acca of the Day</span>
            <ChevronRight size={14} className="chevron" />
          </li>
        </ul>
      </div>

      {/* SPORTS A-Z CARD */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">{t('Sports A-Z', language)}</h3>
        <ul className="sidebar-list">
          {sportsList.map(sport => {
            const stats = sportStats[sport];
            return (
              <li 
                key={sport}
                className={`sidebar-item ${activeSport === sport ? 'active' : ''}`}
                onClick={() => handleSportClick(sport)}
              >
                <span className="sport-badge-emoji">{SPORT_ICONS[sport]}</span>
                <span className="comp-name">{t(sport, language)}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-indicator">
                      <span className="live-dot-mini"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="comp-count">{stats.total}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ACTIVE SPORT LEAGUES CARD */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">
          {SPORT_ICONS[activeSport]} {t(activeSport, language)} - {t('Leagues', language)}
        </h3>
        <ul className="sidebar-list">
          {currentLeagues.map(league => {
            const stats = leagueStats[league.name];
            return (
              <li 
                key={league.name}
                className={`sidebar-item ${activeLeague === league.name ? 'active' : ''}`}
                onClick={() => handleLeagueClick(league)}
              >
                <span className="league-flag">{league.flag}</span>
                <span className="comp-name">{league.name}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-indicator">
                      <span className="live-dot-mini"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="comp-count">{stats.total}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* MORE SPORTS CARD */}
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">{t('More Sports', language)}</h3>
        <ul className="sidebar-list">
          {extraSports.map(sport => (
            <li 
              key={sport}
              className={`sidebar-item ${activeSport === sport ? 'active' : ''}`}
              onClick={() => handleSportClick(sport)}
            >
              <span className="sport-badge-emoji">{SPORT_ICONS[sport]}</span>
              <span className="comp-name">{t(sport, language)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* PLAY IT SAFE CARD */}
      <div className="play-safe-card" onClick={() => handleQuickLinkClick('Responsible Gaming')}>
        <div className="play-safe-header">
          <Shield size={16} />
          <span>Play it safe</span>
        </div>
        <p className="play-safe-desc">
          Set deposit limits, session limits, or take a break at any time. Your safety is our priority.
        </p>
      </div>
    </aside>
  );
};

export default React.memo(LeftSidebar);
