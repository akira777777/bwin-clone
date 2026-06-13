import React, { useMemo } from 'react';
import { Search, Star, ChevronRight } from 'lucide-react';
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
}

interface LeagueInfo {
  name: string;
  flag: string;
  sport: Sport;
}

const LEAGUES: LeagueInfo[] = [
  // Football
  { name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport: 'Football' },
  { name: 'La Liga', flag: '🇪🇸', sport: 'Football' },
  { name: 'Champions League', flag: '🏆', sport: 'Football' },
  { name: 'Bundesliga', flag: '🇩🇪', sport: 'Football' },
  { name: 'Serie A', flag: '🇮🇹', sport: 'Football' },
  { name: 'Ligue 1', flag: '🇫🇷', sport: 'Football' },
  // Tennis
  { name: 'Wimbledon', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', sport: 'Tennis' },
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  activeSport, 
  setActiveSport, 
  activeLeague, 
  setActiveLeague, 
  matches,
  searchQuery = '',
  setSearchQuery = () => {},
  language = 'en'
}) => {
  const sportsList: Sport[] = ['Football', 'Tennis', 'Basketball', 'Ice Hockey'];
  const extraSports: Sport[] = ['Boxing', 'Cricket', 'Darts', 'Formula 1', 'MMA'];

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

  return (
    <aside className="left-sidebar">
      {/* Search */}
      <div className="sidebar-section">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('Search events...', language)} 
            className="search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Highlights */}
      <div className="sidebar-section">
        <h3 className="section-title">
          <Star size={12} className="title-icon" />
          {t('Popular', language)}
        </h3>
        <ul className="sidebar-list">
          {popularLeagues.map(league => {
            const stats = leagueStats[league.name];
            return (
              <li 
                key={league.name}
                className={`sidebar-item highlight-item ${activeLeague === league.name ? 'active' : ''}`}
                onClick={() => handleLeagueClick(league)}
              >
                <span className="league-flag">{league.flag}</span>
                <span className="league-name">{league.name}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-dot-badge">
                      <span className="live-dot"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="match-count">{stats.total}</span>}
                  <ChevronRight size={14} className="chevron" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sports A-Z */}
      <div className="sidebar-section">
        <h3 className="section-title">{t('Sports A-Z', language)}</h3>
        <ul className="sidebar-list">
          {sportsList.map(sport => {
            const stats = sportStats[sport];
            return (
              <li 
                key={sport}
                className={`sidebar-item sport-item ${activeSport === sport ? 'active' : ''}`}
                onClick={() => handleSportClick(sport)}
              >
                <span className="sport-emoji">{SPORT_ICONS[sport]}</span>
                <span className="sport-name">{t(sport, language)}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-dot-badge">
                      <span className="live-dot"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="match-count">{stats.total}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Leagues for current sport */}
      <div className="sidebar-section">
        <h3 className="section-title">{SPORT_ICONS[activeSport]} {t(activeSport, language)} - {t('Leagues', language)}</h3>
        <ul className="sidebar-list leagues-list">
          {currentLeagues.map(league => {
            const stats = leagueStats[league.name];
            return (
              <li 
                key={league.name}
                className={`sidebar-item league-item ${activeLeague === league.name ? 'active' : ''}`}
                onClick={() => handleLeagueClick(league)}
              >
                <span className="league-flag">{league.flag}</span>
                <span className="league-name">{league.name}</span>
                <div className="item-meta">
                  {stats?.live > 0 && (
                    <span className="live-dot-badge">
                      <span className="live-dot"></span>
                      {stats.live}
                    </span>
                  )}
                  {stats && <span className="match-count">{stats.total}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Extra Sports */}
      <div className="sidebar-section">
        <h3 className="section-title">{t('More Sports', language)}</h3>
        <ul className="sidebar-list">
          {extraSports.map(sport => (
            <li 
              key={sport}
              className={`sidebar-item sport-item ${activeSport === sport ? 'active' : ''}`}
              onClick={() => handleSportClick(sport)}
            >
              <span className="sport-emoji">{SPORT_ICONS[sport]}</span>
              <span className="sport-name">{t(sport, language)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default React.memo(LeftSidebar);
