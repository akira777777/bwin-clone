

export interface OddsApiMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
}

interface Market {
  key: string;
  outcomes: Outcome[];
}

interface Outcome {
  name: string;
  price: number;
}

interface ScoreApiMatch {
  id: string;
  completed: boolean;
  scores: { name: string; score: string }[] | null;
}

// Simple in-memory cache to avoid burning API limits on scores
const scoreCache: Record<string, { scores: any, timestamp: number }> = {};

const fetchScoresForSport = async (sportKey: string, apiKey: string): Promise<ScoreApiMatch[]> => {
  const now = Date.now();
  if (scoreCache[sportKey] && now - scoreCache[sportKey].timestamp < 60000) {
    return scoreCache[sportKey].scores;
  }

  try {
    const res = await fetch(`https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      scoreCache[sportKey] = { scores: data, timestamp: now };
      return data;
    }
  } catch (e) {
    console.error(`Failed to fetch scores for ${sportKey}`, e);
  }
  return [];
};

export const fetchLiveMatches = async (apiKey: string): Promise<any[]> => {
  if (!apiKey) throw new Error('API Key is required');

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=eu&markets=h2h&apiKey=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 401) throw new Error('Invalid API Key');
      if (response.status === 429) throw new Error('API Rate limit exceeded');
      throw new Error('Failed to fetch match data');
    }

    const data: OddsApiMatch[] = await response.json();
    
    // Determine which sport_keys have live matches
    const now = new Date();
    const liveSportKeys = new Set<string>();
    data.forEach(m => {
      if (new Date(m.commence_time) <= now) {
        liveSportKeys.add(m.sport_key);
      }
    });

    // Fetch scores for up to 3 live sports to conserve API quota
    const topSportKeys = Array.from(liveSportKeys).slice(0, 3);
    const scoresMap = new Map<string, ScoreApiMatch>();

    await Promise.all(topSportKeys.map(async (key) => {
      const scores = await fetchScoresForSport(key, apiKey);
      scores.forEach(s => scoresMap.set(s.id, s));
    }));

    const transformed = transformToMatchData(data, scoresMap);
    return transformed;
  } catch (error) {
    console.error('Error fetching live matches:', error);
    throw error;
  }
};

export const transformToMatchData = (apiData: OddsApiMatch[], scoresMap: Map<string, ScoreApiMatch>): any[] => {
  const result: any[] = [];
  
  apiData.forEach(item => {
    // Prefer Unibet, then Betfair exchange, otherwise first available bookmaker
    const bookmaker =
      item.bookmakers.find(b => b.key === 'unibet') ||
      item.bookmakers.find(b => b.key === 'betfair_ex_eu') ||
      item.bookmakers[0];
    const h2hMarket = bookmaker?.markets.find(m => m.key === 'h2h');
    
    let homeOdds = 0;
    let awayOdds = 0;
    let drawOdds = 0;

    if (h2hMarket) {
      h2hMarket.outcomes.forEach(outcome => {
        const name = outcome.name;
        if (name === item.home_team) {
          homeOdds = outcome.price;
        } else if (name === item.away_team) {
          awayOdds = outcome.price;
        } else if (name.toLowerCase() === 'draw') {
          drawOdds = outcome.price;
        }
        // Unknown outcome names (e.g. for tennis or malformed data) are ignored → stay 0
      });
    }

    let sport = '';
    // Map API keys to our internal Sport strings
    if (item.sport_key.includes('soccer') || item.sport_key.includes('football')) sport = 'Football';
    else if (item.sport_key.includes('basketball')) sport = 'Basketball';
    else if (item.sport_key.includes('tennis')) sport = 'Tennis';
    else if (item.sport_key.includes('icehockey')) sport = 'Ice Hockey';
    else if (item.sport_key.includes('boxing')) sport = 'Boxing';
    else if (item.sport_key.includes('cricket')) sport = 'Cricket';
    else if (item.sport_key.includes('darts')) sport = 'Darts';
    else if (item.sport_key.includes('mma')) sport = 'MMA';
    else if (item.sport_key.includes('formula1')) sport = 'Formula 1';

    // If the sport is not supported by our platform, filter it out
    if (!sport) return;

    const matchDate = new Date(item.commence_time);
    const isLive = matchDate < new Date();
    
    const today = new Date();
    const isToday = matchDate.getDate() === today.getDate() && matchDate.getMonth() === today.getMonth();
    const timeStr = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let formattedTime = isLive ? 'Live' : (isToday ? `Today, ${timeStr}` : `${matchDate.toLocaleDateString()} ${timeStr}`);
    if (isLive) {
       const diffMinutes = Math.floor((today.getTime() - matchDate.getTime()) / 60000);
       if (diffMinutes > 0 && diffMinutes <= 90 && sport === 'Football') {
           formattedTime = `${diffMinutes}'`;
       }
    }

    let score = '';
    if (isLive) {
      const scoreData = scoresMap.get(item.id);
      if (scoreData && scoreData.scores) {
        const homeScoreObj = scoreData.scores.find(s => s.name === item.home_team);
        const awayScoreObj = scoreData.scores.find(s => s.name === item.away_team);
        if (homeScoreObj && awayScoreObj) {
          score = `${homeScoreObj.score} - ${awayScoreObj.score}`;
        }
      }
    }

    result.push({
      id: item.id,
      sport: sport,
      league: item.sport_title,
      team1: item.home_team,
      team2: item.away_team,
      score: score,
      time: formattedTime,
      isLive: isLive,
      odds: {
        home: homeOdds || 0,
        draw: drawOdds || 0,
        away: awayOdds || 0
      }
    });
  });

  return result;
};
