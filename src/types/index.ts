export type SportId = 'football' | 'tennis' | 'basketball' | 'hockey' | 'cricket' | 'mma'

export interface Team {
  name: string
  short: string
  color: string
}

export interface League {
  id: string
  name: string
  country: string
  sport: SportId
  teams: Team[]
}

export interface OddsSet {
  home: number
  draw?: number
  away: number
}

export interface MarketOdds {
  // main line
  main: OddsSet
  // totals over/under 2.5 (football/hockey) or games line (tennis)
  over: number
  under: number
  totalLine: number
  // both teams to score (football only)
  bttsYes?: number
  bttsNo?: number
  // double chance
  dc1X?: number
  dc12?: number
  dcX2?: number
  // handicap -1
  hcapHome?: number
  hcapAway?: number
}

export type EventStatus = 'live' | 'upcoming' | 'finished' | 'suspended'

export interface SportEvent {
  id: string
  sport: SportId
  leagueId: string
  leagueName: string
  home: Team
  away: Team
  startAt: number // epoch ms
  status: EventStatus
  minute: number // match minute for live
  scoreHome: number
  scoreAway: number
  odds: MarketOdds
  baseProb: { home: number; draw: number; away: number } // true-ish probs used by sim
  stats: {
    possessionHome: number
    shotsHome: number
    shotsAway: number
    cornersHome: number
    cornersAway: number
    yellowHome: number
    yellowAway: number
  }
  oddsHistory: { t: number; home: number; away: number }[]
  lastEvent: string
}

export interface Selection {
  eventId: string
  marketKey: string // 'main.home' | 'main.draw' | 'main.away' | 'over' | 'under' | 'bttsYes' ...
  marketLabel: string
  pickLabel: string
  odds: number
  eventLabel: string
  leagueName: string
}

export interface BetSlipItem extends Selection {
  stake: number
  oddsChanged?: { from: number; to: number }
  suspended?: boolean
}

export type BetStatus = 'active' | 'won' | 'lost' | 'cashedOut'

export interface Bet {
  id: string
  placedAt: number
  kind: 'single' | 'multi'
  selections: Selection[]
  stake: number
  totalOdds: number
  status: BetStatus
  payout: number
  cashOutValue?: number
}

export type OddsFormat = 'decimal' | 'fractional' | 'american'
export type Lang = 'en' | 'ru'

export interface Settings {
  oddsFormat: OddsFormat
  lang: Lang
  acceptAnyOdds: boolean
  depositLimit: number | null // daily, EUR
  sessionLimitMin: number | null
}

export interface UserState {
  loggedIn: boolean
  username: string | null
  balance: number
}
