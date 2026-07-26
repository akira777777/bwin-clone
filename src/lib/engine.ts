import type { League, MarketOdds, SportEvent, SportId } from '@/types'
import { LEAGUES, LIVE_COMMENTARY } from '@/data/sports'
import { clamp, makeRng, pick } from './rng'
import { probsToOdds, roundOdds } from './odds'

const hasDraw = (s: SportId) => s === 'football' || s === 'hockey' || s === 'cricket'
const matchLen = (s: SportId) => (s === 'football' ? 90 : s === 'hockey' ? 60 : s === 'basketball' ? 48 : s === 'tennis' ? 120 : s === 'mma' ? 25 : 300)

function strength(rng: () => number): number {
  return 0.7 + rng() * 0.9 // 0.7..1.6
}

function baseProbabilities(rng: () => number, sport: SportId): { home: number; draw: number; away: number } {
  const hs = strength(rng)
  const as = strength(rng)
  const total = hs + as
  let hp = hs / total
  if (sport === 'football' || sport === 'hockey' || sport === 'cricket') {
    const draw = sport === 'football' ? 0.24 + rng() * 0.06 : sport === 'hockey' ? 0.16 + rng() * 0.04 : 0.1
    hp = hp * (1 - draw) * (1 + (rng() - 0.5) * 0.15) // slight home noise
    const ap = (as / total) * (1 - draw)
    const sum = hp + draw + ap
    return { home: hp / sum, draw: draw / sum, away: ap / sum }
  }
  return { home: hp, draw: 0, away: 1 - hp }
}

function fullMarkets(p: { home: number; draw: number; away: number }, sport: SportId, rng: () => number): MarketOdds {
  const twoWay = !hasDraw(sport)
  const mainProbs = twoWay ? [p.home, p.away] : [p.home, p.draw, p.away]
  const mo = probsToOdds(mainProbs)
  const m: MarketOdds = {
    main: twoWay ? { home: mo[0], away: mo[1] } : { home: mo[0], draw: mo[1], away: mo[2] },
    over: 1.9, under: 1.9, totalLine: 2.5,
  }
  // totals: base expected goals ~2.6
  const expGoals = 2.2 + rng() * 1.2
  const pOver = 1 / (1 + Math.exp(-(expGoals - 2.5) * 1.6))
  const [o, u] = probsToOdds([pOver, 1 - pOver])
  m.over = o
  m.under = u
  m.totalLine = sport === 'football' ? 2.5 : sport === 'hockey' ? 5.5 : sport === 'basketball' ? 218.5 : sport === 'tennis' ? 22.5 : 2.5
  if (sport === 'football') {
    const pBtts = 0.45 + rng() * 0.2
    const [y, n] = probsToOdds([pBtts, 1 - pBtts])
    m.bttsYes = y
    m.bttsNo = n
    const p1 = p.home, px = p.draw, p2 = p.away
    m.dc1X = roundOdds(1.06 / Math.max(p1 + px, 0.05))
    m.dc12 = roundOdds(1.06 / Math.max(p1 + p2, 0.05))
    m.dcX2 = roundOdds(1.06 / Math.max(px + p2, 0.05))
    m.hcapHome = roundOdds(mo[0] * (1.5 + rng() * 0.5))
    m.hcapAway = roundOdds(mo[2] * (1.5 + rng() * 0.5))
  }
  return m
}

/** Generate the day's fixtures deterministically */
export function generateEvents(daySeed: string): SportEvent[] {
  const events: SportEvent[] = []
  for (const league of LEAGUES) {
    const rng = makeRng(`${daySeed}:${league.id}`)
    const teams = [...league.teams]
    // shuffle deterministically
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[teams[i], teams[j]] = [teams[j], teams[i]]
    }
    const nFixtures = Math.floor(teams.length / 2)
    for (let f = 0; f < nFixtures; f++) {
      const home = teams[f * 2]
      const away = teams[f * 2 + 1]
      const id = `${league.id}-${daySeed}-${f}`
      const evRng = makeRng(id)
      const baseProb = baseProbabilities(evRng, league.sport)
      const odds = fullMarkets(baseProb, league.sport, evRng)
      const roll = evRng()
      let status: SportEvent['status']
      let minute = 0
      if (roll < 0.35) {
        status = 'live'
        minute = Math.floor(5 + evRng() * (matchLen(league.sport) * 0.8))
      } else {
        status = 'upcoming'
        // upcoming over next 24h
      }
      const startOffset = status === 'live' ? -(minute * 60_000) : Math.floor(evRng() * 22 * 3600_000) + 600_000
      let scoreHome = 0
      let scoreAway = 0
      if (status === 'live') {
        const goals = league.sport === 'basketball' ? [Math.floor(minute * 1.8 * (0.8 + evRng() * 0.4)), Math.floor(minute * 1.8 * (0.8 + evRng() * 0.4))]
          : league.sport === 'tennis' ? [Math.floor(evRng() * 6), Math.floor(evRng() * 6)]
          : [Math.floor((minute / matchLen(league.sport)) * 3 * evRng() * 2), Math.floor((minute / matchLen(league.sport)) * 3 * evRng() * 2)]
        scoreHome = goals[0]
        scoreAway = goals[1]
      }
      const poss = 35 + evRng() * 30
      events.push({
        id,
        sport: league.sport,
        leagueId: league.id,
        leagueName: league.name,
        home, away,
        startAt: 0, // set by caller relative to now
        status, minute, scoreHome, scoreAway,
        odds,
        baseProb,
        stats: {
          possessionHome: Math.round(poss),
          shotsHome: Math.floor(evRng() * 12), shotsAway: Math.floor(evRng() * 12),
          cornersHome: Math.floor(evRng() * 8), cornersAway: Math.floor(evRng() * 8),
          yellowHome: Math.floor(evRng() * 3), yellowAway: Math.floor(evRng() * 3),
        },
        oddsHistory: [],
        lastEvent: '',
      })
      ;(events[events.length - 1] as unknown as { startOffset: number }).startOffset = startOffset
    }
  }
  return events
}

/** Adjust live odds given time/score */
function liveAdjust(ev: SportEvent): void {
  const len = matchLen(ev.sport)
  const timeLeft = clamp(1 - ev.minute / len, 0.02, 1)
  const diff = ev.scoreHome - ev.scoreAway
  const swing = clamp(diff * 0.28 * (1.15 - timeLeft), -0.45, 0.45)
  let { home, draw, away } = ev.baseProb
  if (hasDraw(ev.sport)) {
    draw = clamp(ev.baseProb.draw * (0.35 + 0.65 * timeLeft) * (diff === 0 ? 1 : 0.85), 0.02, 0.5)
    home = clamp(ev.baseProb.home * timeLeft + (swing > 0 ? swing : 0), 0.01, 0.96)
    away = clamp(ev.baseProb.away * timeLeft + (swing < 0 ? -swing : 0), 0.01, 0.96)
    // leader locks in as time runs out
    if (diff > 0) home = clamp(home + (1 - timeLeft) * 0.45, 0.01, 0.97)
    if (diff < 0) away = clamp(away + (1 - timeLeft) * 0.45, 0.01, 0.97)
  } else {
    home = clamp(ev.baseProb.home + swing, 0.02, 0.98)
    away = 1 - home
    draw = 0
  }
  const sum = home + draw + away
  const p = { home: home / sum, draw: draw / sum, away: away / sum }
  const rng = makeRng(ev.id + ':' + ev.minute + ':' + ev.scoreHome + ':' + ev.scoreAway)
  ev.odds = fullMarkets(p, ev.sport, rng)
}

export interface TickResult {
  changed: SportEvent[]
  finished: SportEvent[]
  newLive: SportEvent[]
}

/** Advance simulation. Returns events whose odds/score changed. */
export function tick(events: SportEvent[], now: number, lang: 'en' | 'ru'): TickResult {
  const changed: SportEvent[] = []
  const finished: SportEvent[] = []
  const newLive: SportEvent[] = []
  for (const ev of events) {
    if (ev.status === 'upcoming' && now >= ev.startAt) {
      ev.status = 'live'
      ev.minute = 1
      newLive.push(ev)
      changed.push(ev)
      continue
    }
    if (ev.status !== 'live') continue
    const len = matchLen(ev.sport)
    // SIM_SPEED: 1 real second ≈ 0.5 match minute (fast demo)
    ev.minute += 0.5
    const rng = makeRng(ev.id + ':' + Math.floor(ev.minute * 2) + ':' + ev.scoreHome + ':' + ev.scoreAway + ':' + now.toString().slice(0, -4))
    // goals
    const goalChance = ev.sport === 'basketball' ? 0.55 : ev.sport === 'hockey' ? 0.03 : ev.sport === 'tennis' ? 0.18 : ev.sport === 'cricket' ? 0.1 : ev.sport === 'mma' ? 0.02 : 0.035
    if (rng() < goalChance) {
      const homeScores = rng() < ev.baseProb.home / (ev.baseProb.home + ev.baseProb.away || 1)
      const inc = ev.sport === 'basketball' ? Math.floor(1 + rng() * 3) : 1
      if (homeScores) ev.scoreHome += inc
      else ev.scoreAway += inc
      ev.lastEvent = (lang === 'ru' ? 'ГОЛ! ' : 'GOAL! ') + (homeScores ? ev.home.name : ev.away.name)
    } else if (rng() < 0.25) {
      ev.lastEvent = pick(rng, LIVE_COMMENTARY[lang])
    }
    // stats drift
    if (rng() < 0.3) { ev.stats.shotsHome += rng() < 0.5 ? 1 : 0; ev.stats.shotsAway += rng() < 0.5 ? 1 : 0 }
    if (rng() < 0.12) { ev.stats.cornersHome += rng() < 0.5 ? 1 : 0; ev.stats.cornersAway += rng() < 0.5 ? 1 : 0 }
    if (rng() < 0.03) { ev.stats.yellowHome += rng() < 0.5 ? 1 : 0; ev.stats.yellowAway += rng() < 0.5 ? 1 : 0 }
    if (rng() < 0.2) ev.stats.possessionHome = Math.round(clamp(ev.stats.possessionHome + (rng() - 0.5) * 6, 25, 75))

    if (ev.minute >= len) {
      ev.status = 'finished'
      ev.minute = len
      finished.push(ev)
      changed.push(ev)
      continue
    }
    liveAdjust(ev)
    ev.oddsHistory.push({ t: now, home: ev.odds.main.home, away: ev.odds.main.away })
    if (ev.oddsHistory.length > 60) ev.oddsHistory.shift()
    changed.push(ev)
  }
  return { changed, finished, newLive }
}

export function initStartTimes(events: SportEvent[], now: number): void {
  for (const ev of events) {
    const off = (ev as unknown as { startOffset?: number }).startOffset
    if (typeof off === 'number') ev.startAt = now + off
    if (ev.status === 'live') liveAdjust(ev)
    delete (ev as unknown as { startOffset?: number }).startOffset
  }
}

export function leagueById(id: string): League | undefined {
  return LEAGUES.find((l) => l.id === id)
}
