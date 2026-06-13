import React, { useMemo } from 'react';
import { Search, Star, ChevronRight } from 'lucide-react';
import type { Sport } from '../App';
import type { MatchData } from '../data/matches';
import './LeftSidebar.css';

interface LeftSidebarProps {
  activeSport: Sport;
  setActiveSport: (sport: Sport) => void;
  activeLeague: string | null;
  setActiveLeague: (league: string | null) => void;
  matches: MatchData[];
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeSport, setActiveSport, activeLeague, setActiveLeague, matches }) => {
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

  const currentLeagues = LEAGUES.filter(l => l.sport === activeSport);

  const handleLeagueClick = (league: LeagueInfo) => {
    if (league.sport !== activeSport) {
      setActiveSport(league.sport);
    }
    setActiveLeague(activeLeague === league.name ? null : league.name);
  };

  const handleSportClick = (sport: Sport) => {
    setActiveSport(sport);
    setActiveLeague(null);
  };

  return (
    <aside className="left-sidebar">
      {/* Search */}
      <div className="sidebar-section">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search events..." className="search-input" />
        </div>
      </div>

      {/* Highlights */}
      <div className="sidebar-section">
        <h3 className="section-title">
          <Star size={12} className="title-icon" />
          Popular
        </h3>
        <ul className="sidebar-list">
          {currentLeagues.slice(0, 4).map(league => {
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
        <h3 className="section-title">Sports A-Z</h3>
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
                <span className="sport-name">{sport}</span>
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
        <h3 className="section-title">{SPORT_ICONS[activeSport]} {activeSport} Leagues</h3>
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
        <h3 className="section-title">More Sports</h3>
        <ul className="sidebar-list">
          {extraSports.map(sport => (
            <li 
              key={sport}
              className={`sidebar-item sport-item ${activeSport === sport ? 'active' : ''}`}
              onClick={() => handleSportClick(sport)}
            >
              <span className="sport-emoji">{SPORT_ICONS[sport]}</span>
              <span className="sport-name">{sport}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default React.memo(LeftSidebar);
