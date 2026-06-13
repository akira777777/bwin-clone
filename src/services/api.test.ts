import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { transformToMatchData, fetchLiveMatches, type OddsApiMatch } from './api';
import type { MatchData } from '../data/matches';

describe('transformToMatchData (data transformation)', () => {
  const FIXED_NOW = new Date('2026-06-13T19:30:00.000Z'); // Friday evening UTC for predictability

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const makeMatch = (overrides: Partial<OddsApiMatch> = {}): OddsApiMatch => ({
    id: 'match-123',
    sport_key: 'soccer_epl',
    sport_title: 'Premier League',
    commence_time: '2026-06-13T20:00:00Z',
    home_team: 'Arsenal',
    away_team: 'Chelsea',
    bookmakers: [
      {
        key: 'unibet',
        title: 'Unibet',
        markets: [
          {
            key: 'h2h',
            outcomes: [
              { name: 'Arsenal', price: 1.65 },
              { name: 'Chelsea', price: 5.20 },
              { name: 'Draw', price: 3.80 },
            ],
          },
        ],
      },
    ],
    ...overrides,
  });

  const makeScore = (id: string, homeScore: string, awayScore: string): any => ({
    id,
    completed: false,
    scores: [
      { name: 'Arsenal', score: homeScore },
      { name: 'Chelsea', score: awayScore },
    ],
  });

  it('maps soccer/football to Football sport and keeps league as sport_title', () => {
    const input = [makeMatch({ sport_key: 'soccer_epl', sport_title: 'Premier League' })];
    const result = transformToMatchData(input, new Map()) as MatchData[];

    expect(result[0].sport).toBe('Football');
    expect(result[0].league).toBe('Premier League');
    expect(result[0].team1).toBe('Arsenal');
    expect(result[0].team2).toBe('Chelsea');
  });

  it('prefers unibet bookmaker for h2h odds, falls back to betfair_ex_eu then first', () => {
    const input = [makeMatch({
      bookmakers: [
        {
          key: 'betfair_ex_eu',
          title: 'Betfair',
          markets: [{ key: 'h2h', outcomes: [
            { name: 'Arsenal', price: 1.80 },
            { name: 'Chelsea', price: 4.50 },
            { name: 'Draw', price: 3.50 },
          ] }],
        },
        {
          key: 'unibet',
          title: 'Unibet',
          markets: [{ key: 'h2h', outcomes: [
            { name: 'Arsenal', price: 1.55 },
            { name: 'Chelsea', price: 5.80 },
            { name: 'Draw', price: 4.10 },
          ] }],
        },
      ],
    })];

    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result[0].odds).toEqual({ home: 1.55, draw: 4.10, away: 5.80 });
  });

  it('defaults missing odds to 0', () => {
    const input = [makeMatch({
      bookmakers: [{ key: 'other', title: 'Other', markets: [{ key: 'h2h', outcomes: [] }] }],
    })];
    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result[0].odds).toEqual({ home: 0, draw: 0, away: 0 });
  });

  it('filters out unsupported sports', () => {
    const input = [
      makeMatch({ sport_key: 'soccer_epl' }),
      makeMatch({ id: 'bad-1', sport_key: 'baseball_mlb', home_team: 'Yankees', away_team: 'Red Sox' }),
      makeMatch({ id: 'good-2', sport_key: 'basketball_nba', sport_title: 'NBA' }),
    ];
    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result).toHaveLength(2);
    expect(result.map(r => r.sport)).toEqual(['Football', 'Basketball']);
  });

  it('detects live matches and sets isLive + basic "Live" time when not football or outside 90min window', () => {
    // Match that started 10 min ago (commence 19:20, now 19:30)
    const input = [makeMatch({
      commence_time: '2026-06-13T19:20:00Z',
      sport_key: 'tennis_atp',
      sport_title: 'Wimbledon',
    })];
    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result[0].isLive).toBe(true);
    expect(result[0].time).toBe('Live'); // tennis path does not set minutes
  });

  it('formats live football time as minutes when within first 90 min', () => {
    const input = [makeMatch({
      commence_time: '2026-06-13T19:10:00Z', // 20 min ago
      sport_key: 'soccer_epl',
    })];
    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result[0].isLive).toBe(true);
    expect(result[0].time).toBe("20'"); // note the apostrophe
  });

  it('does not set football live minutes if > 90 min', () => {
    const input = [makeMatch({
      commence_time: '2026-06-13T17:00:00Z', // 2.5 hours ago
      sport_key: 'soccer_epl',
    })];
    const result = transformToMatchData(input, new Map()) as MatchData[];
    expect(result[0].time).toBe('Live');
  });

  it('formats upcoming matches as Today or full date depending on calendar day', () => {
    const todayMatch = makeMatch({ commence_time: '2026-06-13T22:00:00Z' });
    const futureMatch = makeMatch({ id: 'f1', commence_time: '2026-06-14T15:00:00Z' });

    const result = transformToMatchData([todayMatch, futureMatch], new Map()) as MatchData[];

    // Note: exact "Today, HH:MM" string is locale/timezone dependent.
    // We assert on structural properties instead.
    expect(result[0].isLive).toBe(false);
    expect(result[0].time).toBeTruthy();
    expect(result[0].time.length).toBeGreaterThan(3);

    expect(result[1].isLive).toBe(false);
    expect(result[1].time).toBeTruthy();
  });

  it('attaches live score only when scores are present in the map and match is live', () => {
    const liveMatch = makeMatch({ commence_time: '2026-06-13T19:00:00Z', id: 'live-1' });
    const scores = new Map([
      ['live-1', { id: 'live-1', completed: false, scores: [
        { name: 'Arsenal', score: '2' },
        { name: 'Chelsea', score: '1' },
      ] }],
    ]);

    const result = transformToMatchData([liveMatch], scores) as MatchData[];
    expect(result[0].score).toBe('2 - 1');
    expect(result[0].isLive).toBe(true);
  });

  it('does not attach score for upcoming matches even if scores map has data', () => {
    const upcoming = makeMatch({ commence_time: '2026-06-13T22:00:00Z' });
    const scores = new Map([['match-123', { id: 'match-123', completed: false, scores: [{ name: 'Arsenal', score: '1' }, { name: 'Chelsea', score: '0' }] }]]);

    const result = transformToMatchData([upcoming], scores) as MatchData[];
    expect(result[0].score).toBe('');
    expect(result[0].isLive).toBe(false);
  });

  it('handles tennis (no draw) and other sports correctly', () => {
    const tennis = makeMatch({
      sport_key: 'tennis_atp',
      sport_title: 'Wimbledon',
      home_team: 'Carlos Alcaraz',
      away_team: 'Novak Djokovic',
      commence_time: '2026-06-13T18:00:00Z',
      bookmakers: [{
        key: 'unibet',
        markets: [{ key: 'h2h', outcomes: [
          { name: 'Carlos Alcaraz', price: 1.45 },
          { name: 'Novak Djokovic', price: 2.70 },
          // no draw outcome present for tennis
        ] }],
      }],
    });

    const result = transformToMatchData([tennis], new Map()) as MatchData[];
    expect(result[0].sport).toBe('Tennis');
    expect(result[0].odds.draw).toBe(0);   // no third outcome → draw stays 0
    expect(result[0].odds.home).toBe(1.45);
    expect(result[0].odds.away).toBe(2.70);
  });

  it('returns empty array when all matches are unsupported', () => {
    const input = [makeMatch({ sport_key: 'esports_lol' })];
    const result = transformToMatchData(input, new Map());
    expect(result).toHaveLength(0);
  });

  it('correctly maps additional sports: icehockey, boxing, formula1, cricket, darts, mma', () => {
    const base = (sportKey: string, title: string) => makeMatch({
      id: `id-${sportKey}`,
      sport_key: sportKey,
      sport_title: title,
      home_team: 'Team A',
      away_team: 'Team B',
    });

    const input = [
      base('icehockey_nhl', 'NHL'),
      base('boxing_heavyweight', 'Boxing'),
      base('formula1_races', 'Formula 1'),
      base('cricket_t20', 'Cricket'),
      base('darts_pdc', 'Darts'),
      base('mma_ufc', 'MMA'),
    ];

    const result = transformToMatchData(input, new Map()) as MatchData[];

    expect(result.map(r => r.sport)).toEqual([
      'Ice Hockey',
      'Boxing',
      'Formula 1',
      'Cricket',
      'Darts',
      'MMA',
    ]);
  });

  it('handles empty bookmakers array (all odds default to 0)', () => {
    const input = [makeMatch({ bookmakers: [] })];
    const result = transformToMatchData(input, new Map()) as MatchData[];

    expect(result).toHaveLength(1);
    expect(result[0].odds).toEqual({ home: 0, draw: 0, away: 0 });
  });

  it('sets all odds to 0 when h2h market exists but no outcome names match home/away or "Draw"', () => {
    const input = [makeMatch({
      home_team: 'Real Madrid',
      away_team: 'Barcelona',
      bookmakers: [{
        key: 'unibet',
        markets: [{
          key: 'h2h',
          outcomes: [
            { name: 'Totally Different Team', price: 1.23 },
          ],
        }],
      }],
    })];
    const result = transformToMatchData(input, new Map()) as MatchData[];

    // Only explicit "Draw" (case-insensitive) goes to drawOdds. Unknown names are ignored.
    expect(result[0].odds).toEqual({ home: 0, draw: 0, away: 0 });
  });

  it('does not attach score even for live match if score team names do not exactly match', () => {
    const liveMatch = makeMatch({
      id: 'live-score-mismatch',
      commence_time: '2026-06-13T19:00:00Z',
      home_team: 'Arsenal',
      away_team: 'Chelsea',
    });
    const scores = new Map([
      ['live-score-mismatch', {
        id: 'live-score-mismatch',
        completed: false,
        scores: [
          { name: 'Arsenal FC', score: '3' }, // name mismatch
          { name: 'Chelsea', score: '1' },
        ],
      }],
    ]);

    const result = transformToMatchData([liveMatch], scores) as MatchData[];
    expect(result[0].isLive).toBe(true);
    expect(result[0].score).toBe(''); // no exact match → no score
  });

  it('formats non-today future date using toLocaleDateString', () => {
    // A date clearly in the future relative to our fixed now (June 13)
    const future = makeMatch({
      commence_time: '2026-07-20T18:45:00Z',
      sport_key: 'soccer_epl',
    });
    const result = transformToMatchData([future], new Map()) as MatchData[];

    expect(result[0].isLive).toBe(false);
    // Should contain a date string (format is locale-dependent, so just assert it's not "Live" or "Today")
    expect(result[0].time).not.toBe('Live');
    expect(result[0].time).not.toContain('Today');
    expect(result[0].time.length).toBeGreaterThan(5);
  });
});

describe('fetchLiveMatches (integration with mocked fetch)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
    vi.clearAllMocks();
  });

  it('throws if no apiKey provided', async () => {
    await expect(fetchLiveMatches('')).rejects.toThrow('API Key is required');
  });

  it('fetches odds, determines live sports, fetches scores for top ones, and returns transformed data', async () => {
    const mockOddsData = [
      {
        id: 'api-1',
        sport_key: 'soccer_epl',
        sport_title: 'Premier League',
        commence_time: '2026-06-13T20:00:00Z',
        home_team: 'Arsenal',
        away_team: 'Chelsea',
        bookmakers: [
          {
            key: 'unibet',
            title: 'Unibet',
            markets: [{ key: 'h2h', outcomes: [
              { name: 'Arsenal', price: 1.65 },
              { name: 'Chelsea', price: 5.2 },
              { name: 'Draw', price: 3.8 },
            ] }],
          },
        ],
      },
    ];

    const mockScores = [
      { id: 'api-1', completed: false, scores: [
        { name: 'Arsenal', score: '2' },
        { name: 'Chelsea', score: '1' },
      ] },
    ];

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => mockOddsData }) // odds call
      .mockResolvedValueOnce({ ok: true, json: async () => mockScores }); // scores call (for the live sport)

    const result = await fetchLiveMatches('fake-key');

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(1);
    expect(result[0].sport).toBe('Football');
    expect(result[0].score).toBe('2 - 1'); // attached from scores
    expect(result[0].isLive).toBe(true);
  });

  it('handles 401 as "Invalid API Key"', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 401 });

    await expect(fetchLiveMatches('bad-key')).rejects.toThrow('Invalid API Key');
  });

  it('handles 429 as "API Rate limit exceeded"', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false, status: 429 });

    await expect(fetchLiveMatches('key')).rejects.toThrow('API Rate limit exceeded');
  });

  it('falls back gracefully on network error (re-throws after logging)', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network down'));

    await expect(fetchLiveMatches('key')).rejects.toThrow('Network down');
  });
});
