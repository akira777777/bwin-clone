export interface StandingRow {
  position: number;
  team: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  points?: number;
  // For Tennis
  rankingPoints?: number;
  country?: string;
  // For NBA (Conference view)
  conference?: 'East' | 'West';
  winLossRatio?: string;
  gamesBehind?: string;
}

export interface OutrightOption {
  id: string;
  selection: string;
  odds: number;
}

export interface Outright {
  id: string;
  title: string;
  options: OutrightOption[];
}

export interface PlayerStatRow {
  position: number;
  player: string;
  teamOrCountry: string;
  statName: string;
  statValue: string;
}

export const leagueStandings: Record<string, StandingRow[]> = {
  'Premier League': [
    { position: 1, team: 'Manchester City', played: 34, won: 26, drawn: 5, lost: 3, goalsFor: 88, goalsAgainst: 31, points: 83 },
    { position: 2, team: 'Arsenal', played: 34, won: 25, drawn: 6, lost: 3, goalsFor: 85, goalsAgainst: 28, points: 81 },
    { position: 3, team: 'Liverpool', played: 34, won: 22, drawn: 8, lost: 4, goalsFor: 79, goalsAgainst: 36, points: 74 },
    { position: 4, team: 'Aston Villa', played: 34, won: 20, drawn: 7, lost: 7, goalsFor: 73, goalsAgainst: 49, points: 67 },
    { position: 5, team: 'Tottenham', played: 34, won: 18, drawn: 6, lost: 10, goalsFor: 68, goalsAgainst: 52, points: 60 },
    { position: 6, team: 'Newcastle United', played: 34, won: 17, drawn: 5, lost: 12, goalsFor: 75, goalsAgainst: 55, points: 56 },
    { position: 7, team: 'Manchester United', played: 34, won: 16, drawn: 6, lost: 12, goalsFor: 52, goalsAgainst: 50, points: 54 },
    { position: 8, team: 'Chelsea', played: 34, won: 14, drawn: 9, lost: 11, goalsFor: 65, goalsAgainst: 59, points: 51 },
  ],
  'La Liga': [
    { position: 1, team: 'Real Madrid', played: 34, won: 27, drawn: 6, lost: 1, goalsFor: 74, goalsAgainst: 22, points: 87 },
    { position: 2, team: 'Barcelona', played: 34, won: 22, drawn: 7, lost: 5, goalsFor: 70, goalsAgainst: 39, points: 73 },
    { position: 3, team: 'Girona', played: 34, won: 22, drawn: 5, lost: 7, goalsFor: 73, goalsAgainst: 42, points: 71 },
    { position: 4, team: 'Atletico Madrid', played: 34, won: 21, drawn: 4, lost: 9, goalsFor: 63, goalsAgainst: 39, points: 67 },
    { position: 5, team: 'Athletic Bilbao', played: 34, won: 17, drawn: 10, lost: 7, goalsFor: 53, goalsAgainst: 33, points: 61 },
    { position: 6, team: 'Real Sociedad', played: 34, won: 14, drawn: 12, lost: 8, goalsFor: 46, goalsAgainst: 35, points: 54 },
  ],
  'Champions League': [
    { position: 1, team: 'Bayern Munich', played: 8, won: 7, drawn: 1, lost: 0, goalsFor: 22, goalsAgainst: 6, points: 22 },
    { position: 2, team: 'Real Madrid', played: 8, won: 6, drawn: 2, lost: 0, goalsFor: 18, goalsAgainst: 8, points: 20 },
    { position: 3, team: 'Manchester City', played: 8, won: 6, drawn: 1, lost: 1, goalsFor: 24, goalsAgainst: 10, points: 19 },
    { position: 4, team: 'PSG', played: 8, won: 5, drawn: 2, lost: 1, goalsFor: 16, goalsAgainst: 9, points: 17 },
    { position: 5, team: 'Arsenal', played: 8, won: 5, drawn: 1, lost: 2, goalsFor: 15, goalsAgainst: 7, points: 16 },
    { position: 6, team: 'Inter Milan', played: 8, won: 4, drawn: 3, lost: 1, goalsFor: 12, goalsAgainst: 8, points: 15 },
    { position: 7, team: 'Borussia Dortmund', played: 8, won: 4, drawn: 2, lost: 2, goalsFor: 11, goalsAgainst: 9, points: 14 },
    { position: 8, team: 'Barcelona', played: 8, won: 4, drawn: 1, lost: 3, goalsFor: 13, goalsAgainst: 11, points: 13 },
  ],
  'Bundesliga': [
    { position: 1, team: 'Bayer Leverkusen', played: 32, won: 26, drawn: 6, lost: 0, goalsFor: 82, goalsAgainst: 23, points: 84 },
    { position: 2, team: 'Bayern Munich', played: 32, won: 22, drawn: 3, lost: 7, goalsFor: 90, goalsAgainst: 41, points: 69 },
    { position: 3, team: 'VfB Stuttgart', played: 32, won: 21, drawn: 4, lost: 7, goalsFor: 73, goalsAgainst: 39, points: 67 },
    { position: 4, team: 'RB Leipzig', played: 32, won: 19, drawn: 6, lost: 7, goalsFor: 74, goalsAgainst: 36, points: 63 },
    { position: 5, team: 'Borussia Dortmund', played: 32, won: 17, drawn: 9, lost: 6, goalsFor: 64, goalsAgainst: 40, points: 60 },
  ],
  'Serie A': [
    { position: 1, team: 'Inter Milan', played: 34, won: 28, drawn: 5, lost: 1, goalsFor: 81, goalsAgainst: 18, points: 89 },
    { position: 2, team: 'AC Milan', played: 34, won: 21, drawn: 7, lost: 6, goalsFor: 64, goalsAgainst: 39, points: 70 },
    { position: 3, team: 'Juventus', played: 34, won: 18, drawn: 11, lost: 5, goalsFor: 48, goalsAgainst: 26, points: 65 },
    { position: 4, team: 'Bologna', played: 34, won: 17, drawn: 13, lost: 4, goalsFor: 49, goalsAgainst: 27, points: 64 },
    { position: 5, team: 'AS Roma', played: 34, won: 17, drawn: 8, lost: 9, goalsFor: 59, goalsAgainst: 41, points: 59 },
  ],
  'Ligue 1': [
    { position: 1, team: 'PSG', played: 32, won: 20, drawn: 10, lost: 2, goalsFor: 76, goalsAgainst: 32, points: 70 },
    { position: 2, team: 'Monaco', played: 32, won: 18, drawn: 7, lost: 7, goalsFor: 62, goalsAgainst: 42, points: 61 },
    { position: 3, team: 'Lille', played: 32, won: 15, drawn: 10, lost: 7, goalsFor: 48, goalsAgainst: 31, points: 55 },
    { position: 4, team: 'Brest', played: 32, won: 16, drawn: 9, lost: 7, goalsFor: 49, goalsAgainst: 33, points: 57 },
    { position: 5, team: 'Nice', played: 32, won: 15, drawn: 9, lost: 8, goalsFor: 37, goalsAgainst: 25, points: 54 },
  ],
  // Tennis Ratings
  'Wimbledon': [
    { position: 1, team: 'Jannik Sinner', country: '🇮🇹 Italy', rankingPoints: 9525 },
    { position: 2, team: 'Carlos Alcaraz', country: '🇪🇸 Spain', rankingPoints: 8580 },
    { position: 3, team: 'Novak Djokovic', country: '🇷🇸 Serbia', rankingPoints: 8360 },
    { position: 4, team: 'Alexander Zverev', country: '🇩🇪 Germany', rankingPoints: 6885 },
    { position: 5, team: 'Daniil Medvedev', country: '🇷🇺 Russia', rankingPoints: 6485 },
    { position: 6, team: 'Andrey Rublev', country: '🇷🇺 Russia', rankingPoints: 4710 },
  ],
  'Roland Garros': [
    { position: 1, team: 'Jannik Sinner', country: '🇮🇹 Italy', rankingPoints: 9525 },
    { position: 2, team: 'Carlos Alcaraz', country: '🇪🇸 Spain', rankingPoints: 8580 },
    { position: 3, team: 'Novak Djokovic', country: '🇷🇸 Serbia', rankingPoints: 8360 },
    { position: 4, team: 'Alexander Zverev', country: '🇩🇪 Germany', rankingPoints: 6885 },
  ],
  'US Open': [
    { position: 1, team: 'Jannik Sinner', country: '🇮🇹 Italy', rankingPoints: 9525 },
    { position: 2, team: 'Carlos Alcaraz', country: '🇪🇸 Spain', rankingPoints: 8580 },
    { position: 3, team: 'Novak Djokovic', country: '🇷🇸 Serbia', rankingPoints: 8360 },
    { position: 4, team: 'Alexander Zverev', country: '🇩🇪 Germany', rankingPoints: 6885 },
  ],
  'ATP Finals': [
    { position: 1, team: 'Jannik Sinner', country: '🇮🇹 Italy', rankingPoints: 9525 },
    { position: 2, team: 'Carlos Alcaraz', country: '🇪🇸 Spain', rankingPoints: 8580 },
    { position: 3, team: 'Novak Djokovic', country: '🇷🇸 Serbia', rankingPoints: 8360 },
  ],
  'WTA Finals': [
    { position: 1, team: 'Iga Swiatek', country: '🇵🇱 Poland', rankingPoints: 11695 },
    { position: 2, team: 'Aryna Sabalenka', country: '🇧🇾 Belarus', rankingPoints: 8130 },
    { position: 3, team: 'Coco Gauff', country: '🇺🇸 USA', rankingPoints: 7638 },
    { position: 4, team: 'Elena Rybakina', country: '🇰🇿 Kazakhstan', rankingPoints: 5673 },
  ],
  // Basketball NBA Eastern & Western Standings
  'NBA': [
    { position: 1, team: 'Boston Celtics', conference: 'East', winLossRatio: '64-18', gamesBehind: '-' },
    { position: 2, team: 'New York Knicks', conference: 'East', winLossRatio: '50-32', gamesBehind: '14.0' },
    { position: 3, team: 'Milwaukee Bucks', conference: 'East', winLossRatio: '49-33', gamesBehind: '15.0' },
    { position: 4, team: 'Cleveland Cavaliers', conference: 'East', winLossRatio: '48-34', gamesBehind: '16.0' },
    { position: 1, team: 'Oklahoma City Thunder', conference: 'West', winLossRatio: '57-25', gamesBehind: '-' },
    { position: 2, team: 'Denver Nuggets', conference: 'West', winLossRatio: '57-25', gamesBehind: '-' },
    { position: 3, team: 'Minnesota Timberwolves', conference: 'West', winLossRatio: '56-26', gamesBehind: '1.0' },
    { position: 4, team: 'LA Lakers', conference: 'West', winLossRatio: '47-35', gamesBehind: '10.0' },
  ],
  'EuroLeague': [
    { position: 1, team: 'Real Madrid', played: 34, won: 27, lost: 7, points: 54 },
    { position: 2, team: 'Panathinaikos', played: 34, won: 23, lost: 11, points: 46 },
    { position: 3, team: 'AS Monaco', played: 34, won: 23, lost: 11, points: 46 },
    { position: 4, team: 'FC Barcelona', played: 34, won: 22, lost: 12, points: 44 },
    { position: 5, team: 'Olympiacos', played: 34, won: 22, lost: 12, points: 44 },
    { position: 6, team: 'Fenerbahce', played: 34, won: 20, lost: 14, points: 40 },
  ],
  // Ice Hockey Standings
  'NHL': [
    { position: 1, team: 'New York Rangers', played: 82, won: 55, lost: 23, points: 114 },
    { position: 2, team: 'Dallas Stars', played: 82, won: 52, lost: 21, points: 113 },
    { position: 3, team: 'Carolina Hurricanes', played: 82, won: 52, lost: 23, points: 111 },
    { position: 4, team: 'Florida Panthers', played: 82, won: 52, lost: 24, points: 110 },
    { position: 5, team: 'Boston Bruins', played: 82, won: 47, lost: 20, points: 109 },
    { position: 6, team: 'Edmonton Oilers', played: 82, won: 49, lost: 27, points: 104 },
  ],
  'KHL': [
    { position: 1, team: 'SKA St. Petersburg', played: 68, won: 46, lost: 18, points: 98 },
    { position: 2, team: 'CSKA Moscow', played: 68, won: 44, lost: 20, points: 94 },
    { position: 3, team: 'Metallurg Magnitogorsk', played: 68, won: 42, lost: 21, points: 92 },
    { position: 4, team: 'Avangard Omsk', played: 68, won: 41, lost: 22, points: 90 },
  ],
};

export const leagueOutrights: Record<string, Outright[]> = {
  'Premier League': [
    {
      id: 'o_epl_winner',
      title: 'Winner of English Premier League 2026/27',
      options: [
        { id: 'o_epl_mci', selection: 'Manchester City', odds: 2.05 },
        { id: 'o_epl_ars', selection: 'Arsenal', odds: 2.20 },
        { id: 'o_epl_liv', selection: 'Liverpool', odds: 5.50 },
        { id: 'o_epl_avl', selection: 'Aston Villa', odds: 34.00 },
        { id: 'o_epl_tot', selection: 'Tottenham', odds: 41.00 },
        { id: 'o_epl_che', selection: 'Chelsea', odds: 51.00 },
        { id: 'o_epl_mun', selection: 'Manchester United', odds: 67.00 },
      ]
    }
  ],
  'La Liga': [
    {
      id: 'o_lal_winner',
      title: 'Winner of La Liga 2026/27',
      options: [
        { id: 'o_lal_rma', selection: 'Real Madrid', odds: 1.55 },
        { id: 'o_lal_bar', selection: 'Barcelona', odds: 2.75 },
        { id: 'o_lal_atm', selection: 'Atletico Madrid', odds: 11.00 },
        { id: 'o_lal_gir', selection: 'Girona', odds: 41.00 },
        { id: 'o_lal_rso', selection: 'Real Sociedad', odds: 67.00 },
      ]
    }
  ],
  'Champions League': [
    {
      id: 'o_ucl_winner',
      title: 'Winner of UEFA Champions League 2026/27',
      options: [
        { id: 'o_ucl_rma', selection: 'Real Madrid', odds: 4.50 },
        { id: 'o_ucl_mci', selection: 'Manchester City', odds: 4.80 },
        { id: 'o_ucl_bay', selection: 'Bayern Munich', odds: 6.50 },
        { id: 'o_ucl_ars', selection: 'Arsenal', odds: 8.50 },
        { id: 'o_ucl_psg', selection: 'PSG', odds: 12.00 },
        { id: 'o_ucl_int', selection: 'Inter Milan', odds: 15.00 },
        { id: 'o_ucl_bar', selection: 'Barcelona', odds: 17.00 },
      ]
    }
  ],
  'Wimbledon': [
    {
      id: 'o_wim_winner',
      title: 'Men\'s Singles Winner - Wimbledon 2026',
      options: [
        { id: 'o_wim_alc', selection: 'Carlos Alcaraz', odds: 2.10 },
        { id: 'o_wim_sin', selection: 'Jannik Sinner', odds: 2.35 },
        { id: 'o_wim_djo', selection: 'Novak Djokovic', odds: 4.50 },
        { id: 'o_wim_zve', selection: 'Alexander Zverev', odds: 12.00 },
        { id: 'o_wim_med', selection: 'Daniil Medvedev', odds: 15.00 },
      ]
    }
  ],
  'NBA': [
    {
      id: 'o_nba_winner',
      title: 'Winner of NBA Championship 2026/27',
      options: [
        { id: 'o_nba_cel', selection: 'Boston Celtics', odds: 3.80 },
        { id: 'o_nba_nug', selection: 'Denver Nuggets', odds: 6.00 },
        { id: 'o_nba_okc', selection: 'Oklahoma City Thunder', odds: 7.50 },
        { id: 'o_nba_min', selection: 'Minnesota Timberwolves', odds: 9.00 },
        { id: 'o_nba_lak', selection: 'LA Lakers', odds: 21.00 },
        { id: 'o_nba_war', selection: 'Golden State Warriors', odds: 26.00 },
      ]
    }
  ],
  'NHL': [
    {
      id: 'o_nhl_winner',
      title: 'Winner of Stanley Cup 2026/27',
      options: [
        { id: 'o_nhl_pan', selection: 'Florida Panthers', odds: 8.50 },
        { id: 'o_nhl_sta', selection: 'Dallas Stars', odds: 9.00 },
        { id: 'o_nhl_ran', selection: 'New York Rangers', odds: 9.50 },
        { id: 'o_nhl_hur', selection: 'Carolina Hurricanes', odds: 10.00 },
        { id: 'o_nhl_oil', selection: 'Edmonton Oilers', odds: 11.00 },
      ]
    }
  ]
};

export const leagueStatsData: Record<string, PlayerStatRow[]> = {
  'Premier League': [
    { position: 1, player: 'Erling Haaland', teamOrCountry: 'Manchester City', statName: 'Goals', statValue: '27' },
    { position: 2, player: 'Cole Palmer', teamOrCountry: 'Chelsea', statName: 'Goals', statValue: '22' },
    { position: 3, player: 'Alexander Isak', teamOrCountry: 'Newcastle United', statName: 'Goals', statValue: '21' },
    { position: 4, player: 'Ollie Watkins', teamOrCountry: 'Aston Villa', statName: 'Goals', statValue: '19' },
    { position: 5, player: 'Mohamed Salah', teamOrCountry: 'Liverpool', statName: 'Goals', statValue: '18' },
  ],
  'La Liga': [
    { position: 1, player: 'Artem Dovbyk', teamOrCountry: 'Girona', statName: 'Goals', statValue: '24' },
    { position: 2, player: 'Alexander Sørloth', teamOrCountry: 'Villarreal', statName: 'Goals', statValue: '23' },
    { position: 3, player: 'Jude Bellingham', teamOrCountry: 'Real Madrid', statName: 'Goals', statValue: '19' },
    { position: 4, player: 'Robert Lewandowski', teamOrCountry: 'Barcelona', statName: 'Goals', statValue: '19' },
  ],
  'Champions League': [
    { position: 1, player: 'Harry Kane', teamOrCountry: 'Bayern Munich', statName: 'Goals', statValue: '8' },
    { position: 2, player: 'Kylian Mbappé', teamOrCountry: 'PSG', statName: 'Goals', statValue: '8' },
    { position: 3, player: 'Erling Haaland', teamOrCountry: 'Manchester City', statName: 'Goals', statValue: '6' },
    { position: 4, player: 'Antoine Griezmann', teamOrCountry: 'Atletico Madrid', statName: 'Goals', statValue: '6' },
  ],
  'Wimbledon': [
    { position: 1, player: 'Jannik Sinner', teamOrCountry: '🇮🇹 ITA', statName: 'Aces', statValue: '185' },
    { position: 2, player: 'Alexander Zverev', teamOrCountry: '🇩🇪 GER', statName: 'Aces', statValue: '172' },
    { position: 3, player: 'Carlos Alcaraz', teamOrCountry: '🇪🇸 ESP', statName: 'Aces', statValue: '141' },
    { position: 4, player: 'Daniil Medvedev', teamOrCountry: '🇷🇺 RUS', statName: 'Aces', statValue: '138' },
  ],
  'NBA': [
    { position: 1, player: 'Luka Doncic', teamOrCountry: 'Dallas Mavericks', statName: 'PPG', statValue: '33.9' },
    { position: 2, player: 'Giannis Antetokounmpo', teamOrCountry: 'Milwaukee Bucks', statName: 'PPG', statValue: '30.4' },
    { position: 3, player: 'Shai Gilgeous-Alexander', teamOrCountry: 'Oklahoma City Thunder', statName: 'PPG', statValue: '30.1' },
    { position: 4, player: 'Jayson Tatum', teamOrCountry: 'Boston Celtics', statName: 'PPG', statValue: '26.9' },
  ],
};
