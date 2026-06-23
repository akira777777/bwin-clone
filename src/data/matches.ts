import type { Sport } from '../App';

export type Trend = 'up' | 'down' | null;

export interface MatchData {
  id: string;
  sport: Sport;
  league: string;
  team1: string;
  team2: string;
  score?: string;
  time: string;
  isLive: boolean;
  odds: { home: number; draw: number; away: number };
  trend?: { home: Trend; draw: Trend; away: Trend };
  // Extended markets
  markets?: {
    totalGoals?: { over25: number; under25: number };
    btts?: { yes: number; no: number };
    doubleChance?: { homeDraw: number; drawAway: number; homeAway: number };
  };
}

export const initialMatches: MatchData[] = [
  // ═══════════════ FOOTBALL ═══════════════
  // Premier League
  { 
    id: 'm1', sport: 'Football', league: 'Premier League', team1: 'Arsenal', team2: 'Manchester United', 
    score: '1 - 0', time: "65'", isLive: true, 
    odds: { home: 1.45, draw: 4.20, away: 7.50 },
    markets: {
      totalGoals: { over25: 1.85, under25: 1.95 },
      btts: { yes: 1.70, no: 2.10 },
      doubleChance: { homeDraw: 1.10, drawAway: 2.50, homeAway: 1.25 }
    }
  },
  { 
    id: 'm10', sport: 'Football', league: 'Premier League', team1: 'Liverpool', team2: 'Chelsea', 
    score: '2 - 1', time: "38'", isLive: true, 
    odds: { home: 1.65, draw: 3.80, away: 5.50 },
    markets: {
      totalGoals: { over25: 1.50, under25: 2.50 },
      btts: { yes: 1.40, no: 2.90 },
      doubleChance: { homeDraw: 1.15, drawAway: 2.20, homeAway: 1.30 }
    }
  },
  { 
    id: 'm11', sport: 'Football', league: 'Premier League', team1: 'Manchester City', team2: 'Tottenham', 
    time: 'Today, 21:00', isLive: false, 
    odds: { home: 1.35, draw: 5.00, away: 8.50 },
    markets: {
      totalGoals: { over25: 1.55, under25: 2.40 },
      btts: { yes: 1.60, no: 2.25 },
      doubleChance: { homeDraw: 1.08, drawAway: 2.80, homeAway: 1.20 }
    }
  },
  { 
    id: 'm12', sport: 'Football', league: 'Premier League', team1: 'Newcastle', team2: 'Aston Villa', 
    time: 'Tomorrow, 15:00', isLive: false, 
    odds: { home: 2.10, draw: 3.40, away: 3.50 },
    markets: {
      totalGoals: { over25: 1.75, under25: 2.05 },
      btts: { yes: 1.65, no: 2.15 },
      doubleChance: { homeDraw: 1.30, drawAway: 1.75, homeAway: 1.35 }
    }
  },
  // La Liga
  { 
    id: 'm2', sport: 'Football', league: 'La Liga', team1: 'Real Madrid', team2: 'Barcelona', 
    score: '2 - 2', time: "88'", isLive: true, 
    odds: { home: 3.10, draw: 1.80, away: 4.50 },
    markets: {
      totalGoals: { over25: 1.40, under25: 2.90 },
      btts: { yes: 1.10, no: 6.50 },
      doubleChance: { homeDraw: 1.20, drawAway: 1.35, homeAway: 1.28 }
    }
  },
  { 
    id: 'm13', sport: 'Football', league: 'La Liga', team1: 'Atletico Madrid', team2: 'Sevilla', 
    time: 'Today, 22:00', isLive: false, 
    odds: { home: 1.70, draw: 3.60, away: 5.00 },
    markets: {
      totalGoals: { over25: 1.80, under25: 2.00 },
      btts: { yes: 1.75, no: 2.05 },
      doubleChance: { homeDraw: 1.18, drawAway: 2.10, homeAway: 1.28 }
    }
  },
  // Champions League
  { 
    id: 'm3', sport: 'Football', league: 'Champions League', team1: 'Bayern Munich', team2: 'PSG', 
    time: 'Tomorrow, 21:00', isLive: false, 
    odds: { home: 2.10, draw: 3.50, away: 3.20 },
    markets: {
      totalGoals: { over25: 1.65, under25: 2.20 },
      btts: { yes: 1.55, no: 2.40 },
      doubleChance: { homeDraw: 1.35, drawAway: 1.70, homeAway: 1.30 }
    }
  },
  { 
    id: 'm14', sport: 'Football', league: 'Champions League', team1: 'Inter Milan', team2: 'Borussia Dortmund', 
    time: 'Tomorrow, 21:00', isLive: false, 
    odds: { home: 1.90, draw: 3.60, away: 3.80 },
    markets: {
      totalGoals: { over25: 1.70, under25: 2.10 },
      btts: { yes: 1.60, no: 2.30 },
      doubleChance: { homeDraw: 1.25, drawAway: 1.85, homeAway: 1.32 }
    }
  },
  // Bundesliga
  { 
    id: 'm15', sport: 'Football', league: 'Bundesliga', team1: 'Bayern Munich', team2: 'RB Leipzig', 
    score: '3 - 1', time: "72'", isLive: true, 
    odds: { home: 1.20, draw: 7.00, away: 12.00 },
    markets: {
      totalGoals: { over25: 1.15, under25: 5.50 },
      btts: { yes: 1.30, no: 3.50 },
      doubleChance: { homeDraw: 1.05, drawAway: 3.80, homeAway: 1.12 }
    }
  },
  { 
    id: 'm16', sport: 'Football', league: 'Bundesliga', team1: 'Borussia Dortmund', team2: 'Bayer Leverkusen', 
    time: 'Saturday, 15:30', isLive: false, 
    odds: { home: 2.40, draw: 3.50, away: 2.80 },
    markets: {
      totalGoals: { over25: 1.60, under25: 2.30 },
      btts: { yes: 1.50, no: 2.50 },
      doubleChance: { homeDraw: 1.40, drawAway: 1.55, homeAway: 1.32 }
    }
  },
  // Serie A
  { 
    id: 'm17', sport: 'Football', league: 'Serie A', team1: 'AC Milan', team2: 'Juventus', 
    time: 'Sunday, 20:45', isLive: false, 
    odds: { home: 2.30, draw: 3.20, away: 3.10 },
    markets: {
      totalGoals: { over25: 1.90, under25: 1.90 },
      btts: { yes: 1.70, no: 2.10 },
      doubleChance: { homeDraw: 1.32, drawAway: 1.58, homeAway: 1.35 }
    }
  },
  { 
    id: 'm18', sport: 'Football', league: 'Serie A', team1: 'Inter Milan', team2: 'Napoli', 
    score: '0 - 0', time: "15'", isLive: true, 
    odds: { home: 2.00, draw: 3.40, away: 3.60 },
    markets: {
      totalGoals: { over25: 1.85, under25: 1.95 },
      btts: { yes: 1.65, no: 2.20 },
      doubleChance: { homeDraw: 1.28, drawAway: 1.72, homeAway: 1.30 }
    }
  },
  // Ligue 1
  { 
    id: 'm19', sport: 'Football', league: 'Ligue 1', team1: 'PSG', team2: 'Olympique Marseille', 
    time: 'Sunday, 21:00', isLive: false, 
    odds: { home: 1.40, draw: 4.80, away: 7.00 },
    markets: {
      totalGoals: { over25: 1.70, under25: 2.10 },
      btts: { yes: 1.80, no: 2.00 },
      doubleChance: { homeDraw: 1.10, drawAway: 2.60, homeAway: 1.22 }
    }
  },

  // ═══════════════ TENNIS ═══════════════
  { 
    id: 't1', sport: 'Tennis', league: 'Wimbledon', team1: 'C. Alcaraz', team2: 'N. Djokovic', 
    score: '2 - 1', time: 'Set 4', isLive: true, 
    odds: { home: 1.85, draw: 0, away: 1.95 }
  },
  { 
    id: 't2', sport: 'Tennis', league: 'US Open', team1: 'J. Sinner', team2: 'D. Medvedev', 
    time: 'Tonight, 19:00', isLive: false, 
    odds: { home: 1.60, draw: 0, away: 2.30 }
  },
  { 
    id: 't3', sport: 'Tennis', league: 'Roland Garros', team1: 'R. Nadal', team2: 'S. Tsitsipas', 
    score: '1 - 1', time: 'Set 3', isLive: true, 
    odds: { home: 2.10, draw: 0, away: 1.75 }
  },
  { 
    id: 't4', sport: 'Tennis', league: 'ATP Finals', team1: 'A. Zverev', team2: 'H. Rune', 
    time: 'Tomorrow, 14:00', isLive: false, 
    odds: { home: 1.50, draw: 0, away: 2.60 }
  },
  { 
    id: 't5', sport: 'Tennis', league: 'WTA Finals', team1: 'I. Świątek', team2: 'A. Sabalenka', 
    time: 'Friday, 18:00', isLive: false, 
    odds: { home: 1.70, draw: 0, away: 2.15 }
  },

  // ═══════════════ BASKETBALL ═══════════════
  { 
    id: 'b1', sport: 'Basketball', league: 'NBA', team1: 'LA Lakers', team2: 'Golden State Warriors', 
    score: '105 - 102', time: 'Q4 2:10', isLive: true, 
    odds: { home: 1.30, draw: 15.0, away: 3.40 }
  },
  { 
    id: 'b2', sport: 'Basketball', league: 'EuroLeague', team1: 'Real Madrid', team2: 'Olympiacos', 
    time: 'Friday, 20:45', isLive: false, 
    odds: { home: 1.55, draw: 12.0, away: 2.65 }
  },
  { 
    id: 'b3', sport: 'Basketball', league: 'NBA', team1: 'Boston Celtics', team2: 'Milwaukee Bucks', 
    score: '88 - 91', time: 'Q3 5:30', isLive: true, 
    odds: { home: 2.10, draw: 18.0, away: 1.70 }
  },
  { 
    id: 'b4', sport: 'Basketball', league: 'NBA', team1: 'Denver Nuggets', team2: 'Phoenix Suns', 
    time: 'Tonight, 03:30', isLive: false, 
    odds: { home: 1.75, draw: 14.0, away: 2.10 }
  },
  { 
    id: 'b5', sport: 'Basketball', league: 'EuroLeague', team1: 'FC Barcelona', team2: 'Fenerbahce', 
    time: 'Saturday, 19:00', isLive: false, 
    odds: { home: 1.45, draw: 16.0, away: 2.80 }
  },

  // ═══════════════ ICE HOCKEY ═══════════════
  { 
    id: 'h1', sport: 'Ice Hockey', league: 'NHL', team1: 'Boston Bruins', team2: 'Toronto Maple Leafs', 
    score: '3 - 3', time: 'P3 10:00', isLive: true, 
    odds: { home: 2.40, draw: 4.00, away: 2.50 }
  },
  { 
    id: 'h2', sport: 'Ice Hockey', league: 'NHL', team1: 'Edmonton Oilers', team2: 'Florida Panthers', 
    time: 'Tonight, 01:00', isLive: false, 
    odds: { home: 1.90, draw: 4.20, away: 3.50 }
  },
  { 
    id: 'h3', sport: 'Ice Hockey', league: 'KHL', team1: 'CSKA Moscow', team2: 'SKA St. Petersburg', 
    score: '2 - 1', time: 'P2 8:45', isLive: true, 
    odds: { home: 1.70, draw: 4.50, away: 4.20 }
  },
  { 
    id: 'h4', sport: 'Ice Hockey', league: 'NHL', team1: 'Colorado Avalanche', team2: 'Tampa Bay Lightning', 
    time: 'Saturday, 02:00', isLive: false, 
    odds: { home: 1.80, draw: 4.10, away: 3.80 }
  },
];

export const getDynamicizedMatches = (matches: MatchData[]): MatchData[] => {
  const now = new Date();
  
  return matches.map(match => {
    if (match.isLive) {
      return match;
    }
    
    // If it is an upcoming match with a static Today/Tonight time, make it relative to current time
    if (match.time.includes('Today') || match.time.includes('Tonight') || match.time.includes('Tomorrow')) {
      if (match.time.includes('Today') || match.time.includes('Tonight')) {
        if (match.id === 'm11') {
          // Man City vs Tottenham
          const target = new Date(now.getTime() + 45 * 60 * 1000); // 45 mins from now
          return { ...match, time: `Today, ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
        if (match.id === 'm13') {
          // Atletico Madrid vs Sevilla
          const target = new Date(now.getTime() + 120 * 60 * 1000); // 2 hours from now
          return { ...match, time: `Today, ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
        if (match.id === 't2') {
          // J. Sinner vs D. Medvedev
          const target = new Date(now.getTime() + 90 * 60 * 1000); // 1.5 hours from now
          return { ...match, time: `Today, ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
        if (match.id === 'b4') {
          // Denver Nuggets vs Phoenix Suns
          const target = new Date(now.getTime() + 180 * 60 * 1000); // 3 hours from now
          return { ...match, time: `Today, ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
        if (match.id === 'h2') {
          // Edmonton Oilers vs Florida Panthers
          const target = new Date(now.getTime() + 240 * 60 * 1000); // 4 hours from now
          return { ...match, time: `Today, ${target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` };
        }
      } else if (match.time.includes('Tomorrow')) {
        const parts = match.time.split(',');
        const timePart = parts.length > 1 ? parts[1]?.trim() : '18:00';
        return { ...match, time: `Tomorrow, ${timePart ?? '18:00'}` };
      }
    }
    
    return match;
  });
};

