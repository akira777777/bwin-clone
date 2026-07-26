import type { League, SportId } from '@/types'

const PALETTE = ['#e84393', '#6c5ce7', '#00b894', '#e17055', '#0984e3', '#d63031', '#fdcb6e', '#00cec9', '#a29bfe', '#55efc4']

function team(name: string, short: string, i: number) {
  return { name, short, color: PALETTE[i % PALETTE.length] }
}

function mkTeams(names: [string, string][]): ReturnType<typeof team>[] {
  return names.map(([n, s], i) => team(n, s, i))
}

export const LEAGUES: League[] = [
  {
    id: 'rpl',
    name: 'Russian Premier League',
    country: 'Russia',
    sport: 'football',
    teams: mkTeams([
      ['Zenit', 'ZEN'], ['Spartak Moscow', 'SPA'], ['CSKA Moscow', 'CSK'], ['Dynamo Moscow', 'DYN'],
      ['Rubin Kazan', 'RUB'], ['FC Krasnodar', 'KRA'], ['Lokomotiv Moscow', 'LOK'], ['Rostov', 'ROS'],
      ['Akhmat Grozny', 'AKH'], ['Orenburg', 'ORE'],
    ]),
  },
  {
    id: 'epl',
    name: 'Premier League',
    country: 'England',
    sport: 'football',
    teams: mkTeams([
      ['Arsenal', 'ARS'], ['Manchester City', 'MCI'], ['Liverpool', 'LIV'], ['Chelsea', 'CHE'],
      ['Tottenham', 'TOT'], ['Newcastle', 'NEW'], ['Aston Villa', 'AVL'], ['Brighton', 'BHA'],
    ]),
  },
  {
    id: 'laliga',
    name: 'La Liga',
    country: 'Spain',
    sport: 'football',
    teams: mkTeams([
      ['Real Madrid', 'RMA'], ['Barcelona', 'BAR'], ['Atlético Madrid', 'ATM'], ['Sevilla', 'SEV'],
      ['Real Sociedad', 'RSO'], ['Villarreal', 'VIL'], ['Valencia', 'VAL'], ['Athletic Club', 'ATH'],
    ]),
  },
  {
    id: 'seriea',
    name: 'Serie A',
    country: 'Italy',
    sport: 'football',
    teams: mkTeams([
      ['Inter', 'INT'], ['AC Milan', 'MIL'], ['Juventus', 'JUV'], ['Napoli', 'NAP'],
      ['Roma', 'ROM'], ['Lazio', 'LAZ'], ['Atalanta', 'ATA'], ['Fiorentina', 'FIO'],
    ]),
  },
  {
    id: 'bra',
    name: 'Brasileirão Série A',
    country: 'Brazil',
    sport: 'football',
    teams: mkTeams([
      ['Flamengo', 'FLA'], ['Palmeiras', 'PAL'], ['Corinthians', 'COR'], ['Bahia', 'BAH'],
      ['Cruzeiro', 'CRU'], ['Botafogo', 'BOT'], ['São Paulo', 'SAO'], ['Grêmio', 'GRE'],
    ]),
  },
  {
    id: 'atp',
    name: 'ATP Tour',
    country: 'International',
    sport: 'tennis',
    teams: mkTeams([
      ['C. Alcaraz', 'ALC'], ['J. Sinner', 'SIN'], ['N. Djokovic', 'DJO'], ['D. Medvedev', 'MED'],
      ['A. Zverev', 'ZVE'], ['A. Rublev', 'RUB'], ['S. Tsitsipas', 'TSI'], ['H. Rune', 'RUN'],
    ]),
  },
  {
    id: 'wta',
    name: 'WTA Tour',
    country: 'International',
    sport: 'tennis',
    teams: mkTeams([
      ['A. Sabalenka', 'SAB'], ['I. Świątek', 'SWI'], ['C. Gauff', 'GAU'], ['E. Rybakina', 'RYB'],
      ['J. Pegula', 'PEG'], ['M. Andreeva', 'AND'], ['Q. Zheng', 'ZHE'], ['P. Kvitová', 'KVI'],
    ]),
  },
  {
    id: 'nba',
    name: 'NBA',
    country: 'USA',
    sport: 'basketball',
    teams: mkTeams([
      ['Boston Celtics', 'BOS'], ['Denver Nuggets', 'DEN'], ['LA Lakers', 'LAL'], ['Golden State', 'GSW'],
      ['Oklahoma City', 'OKC'], ['Milwaukee Bucks', 'MIL'], ['Phoenix Suns', 'PHX'], ['Dallas Mavericks', 'DAL'],
    ]),
  },
  {
    id: 'euro',
    name: 'EuroLeague',
    country: 'Europe',
    sport: 'basketball',
    teams: mkTeams([
      ['Real Madrid BC', 'RMB'], ['Fenerbahçe', 'FEN'], ['Olympiacos', 'OLY'], ['CSKA Basket', 'CSB'],
      ['Barcelona BC', 'BCB'], ['Panathinaikos', 'PAN'],
    ]),
  },
  {
    id: 'khl',
    name: 'KHL',
    country: 'Russia',
    sport: 'hockey',
    teams: mkTeams([
      ['CSKA Moscow', 'CSK'], ['SKA St. Petersburg', 'SKA'], ['Ak Bars', 'AKB'], ['Metallurg Mg', 'MMG'],
      ['Avangard', 'AVA'], ['Dynamo Moscow', 'DYN'], ['Traktor', 'TRA'], ['Salavat Yulaev', 'SYU'],
    ]),
  },
  {
    id: 'nhl',
    name: 'NHL',
    country: 'USA/Canada',
    sport: 'hockey',
    teams: mkTeams([
      ['Toronto Maple Leafs', 'TOR'], ['Edmonton Oilers', 'EDM'], ['Florida Panthers', 'FLA'], ['Boston Bruins', 'BOS'],
      ['Colorado Avalanche', 'COL'], ['New York Rangers', 'NYR'],
    ]),
  },
  {
    id: 'ipl',
    name: 'IPL',
    country: 'India',
    sport: 'cricket',
    teams: mkTeams([
      ['Mumbai Indians', 'MI'], ['Chennai Super Kings', 'CSK'], ['RC Bangalore', 'RCB'], ['Kolkata KR', 'KKR'],
      ['Delhi Capitals', 'DC'], ['Rajasthan Royals', 'RR'],
    ]),
  },
  {
    id: 'ufc',
    name: 'UFC Fight Night',
    country: 'International',
    sport: 'mma',
    teams: mkTeams([
      ['I. Topuria', 'TOP'], ['A. Volkanovski', 'VOL'], ['I. Makhachev', 'MAK'], ['C. Oliveira', 'OLI'],
      ['S. O’Malley', 'OMA'], ['M. Dvalishvili', 'DVA'],
    ]),
  },
]

export const SPORTS_META: Record<SportId, { label: { en: string; ru: string }; icon: string }> = {
  football: { label: { en: 'Football', ru: 'Футбол' }, icon: '⚽' },
  tennis: { label: { en: 'Tennis', ru: 'Теннис' }, icon: '🎾' },
  basketball: { label: { en: 'Basketball', ru: 'Баскетбол' }, icon: '🏀' },
  hockey: { label: { en: 'Ice Hockey', ru: 'Хоккей' }, icon: '🏒' },
  cricket: { label: { en: 'Cricket', ru: 'Крикет' }, icon: '🏏' },
  mma: { label: { en: 'MMA', ru: 'ММА' }, icon: '🥊' },
}

export const LIVE_COMMENTARY = {
  en: [
    'Dangerous attack developing', 'Free kick in a good position', 'Corner kick', 'Possession in midfield',
    'Shot blocked by the defence', 'Goal kick', 'Offside called', 'Yellow card shown',
    'Substitution being prepared', 'Throw-in near the box', 'Counter-attack!', 'Foul in the centre circle',
  ],
  ru: [
    'Опасная атака развивается', 'Штрафной в хорошей позиции', 'Угловой удар', 'Владение в центре поля',
    'Удар заблокирован защитой', 'Удар от ворот', 'Офсайд', 'Показана жёлтая карта',
    'Готовится замена', 'Аут у штрафной', 'Контратака!', 'Фол в центре поля',
  ],
}
