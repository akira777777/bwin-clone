import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import type { Bet, BetSlipItem, Lang, OddsFormat, Selection, Settings, SportEvent, UserState } from '@/types'
import { generateEvents, initStartTimes, tick } from '@/lib/engine'

export type View =
  | { name: 'sports'; sport?: string; liveOnly?: boolean; query?: string }
  | { name: 'match'; eventId: string }
  | { name: 'casino' }
  | { name: 'favorites' }
  | { name: 'bets' }

interface State {
  events: SportEvent[]
  betslip: BetSlipItem[]
  slipMode: 'single' | 'multi'
  bets: Bet[]
  favorites: string[]
  user: UserState
  settings: Settings
  view: View
  authOpen: 'login' | 'register' | null
  welcomeOpen: boolean
  rgOpen: boolean
  toast: string | null
  depositedToday: number
}

const LS_KEY = 'betz-state-v1'

function loadPersisted() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as {
      bets: Bet[]; favorites: string[]; user: UserState; settings: Settings
      welcomeDismissed: boolean; depositedToday: { date: string; amount: number }
    }
  } catch { return null }
}

function todayStr() { return new Date().toISOString().slice(0, 10) }

function initialState(): State {
  const daySeed = todayStr()
  const events = generateEvents(daySeed)
  initStartTimes(events, Date.now())
  const p = loadPersisted()
  const depositedToday = p && p.depositedToday.date === todayStr() ? p.depositedToday.amount : 0
  return {
    events,
    betslip: [],
    slipMode: 'multi',
    bets: p?.bets ?? [],
    favorites: p?.favorites ?? [],
    user: p?.user ?? { loggedIn: false, username: null, balance: 10000 },
    settings: p?.settings ?? { oddsFormat: 'decimal', lang: 'en', acceptAnyOdds: false, depositLimit: null, sessionLimitMin: null },
    view: { name: 'sports', liveOnly: false },
    authOpen: null,
    welcomeOpen: !(p?.welcomeDismissed ?? false),
    rgOpen: false,
    toast: null,
    depositedToday,
  }
}

type Action =
  | { type: 'TICK'; now: number }
  | { type: 'NAV'; view: View }
  | { type: 'ADD_SELECTION'; sel: Selection }
  | { type: 'REMOVE_SELECTION'; eventId: string; marketKey: string }
  | { type: 'CLEAR_SLIP' }
  | { type: 'SET_SLIP_MODE'; mode: 'single' | 'multi' }
  | { type: 'SET_STAKE'; eventId: string; marketKey: string; stake: number }
  | { type: 'SET_MULTI_STAKE'; stake: number }
  | { type: 'ACCEPT_ODDS' }
  | { type: 'PLACE_BET'; stakeSingles: number }
  | { type: 'CASH_OUT'; betId: string }
  | { type: 'TOGGLE_FAV'; eventId: string }
  | { type: 'SET_ODDS_FORMAT'; f: OddsFormat }
  | { type: 'SET_LANG'; l: Lang }
  | { type: 'SET_ACCEPT_ANY'; v: boolean }
  | { type: 'AUTH'; mode: 'login' | 'register' | null }
  | { type: 'LOGIN'; username: string }
  | { type: 'LOGOUT' }
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'ADJUST_BALANCE'; delta: number }
  | { type: 'DISMISS_WELCOME'; permanent: boolean }
  | { type: 'OPEN_WELCOME' }
  | { type: 'RG'; open: boolean }
  | { type: 'SET_LIMITS'; depositLimit: number | null; sessionLimitMin: number | null }
  | { type: 'TOAST'; msg: string | null }

function selectionWinProb(sel: Selection, ev: SportEvent): number {
  const o = currentOddsFor(sel, ev)
  return o ? 1 / o : 0
}

export function currentOddsFor(sel: Selection, ev: SportEvent): number | null {
  const o = ev.odds
  switch (sel.marketKey) {
    case 'main.home': return o.main.home
    case 'main.draw': return o.main.draw ?? null
    case 'main.away': return o.main.away
    case 'over': return o.over
    case 'under': return o.under
    case 'bttsYes': return o.bttsYes ?? null
    case 'bttsNo': return o.bttsNo ?? null
    case 'dc1X': return o.dc1X ?? null
    case 'dc12': return o.dc12 ?? null
    case 'dcX2': return o.dcX2 ?? null
    case 'hcapHome': return o.hcapHome ?? null
    case 'hcapAway': return o.hcapAway ?? null
    default: return null
  }
}

function selectionWon(sel: Selection, ev: SportEvent): boolean | null {
  // null = void
  const h = ev.scoreHome, a = ev.scoreAway
  switch (sel.marketKey) {
    case 'main.home': return h > a
    case 'main.draw': return h === a
    case 'main.away': return a > h
    case 'over': return h + a > ev.odds.totalLine
    case 'under': return h + a < ev.odds.totalLine
    case 'bttsYes': return h > 0 && a > 0
    case 'bttsNo': return h === 0 || a === 0
    case 'dc1X': return h >= a
    case 'dc12': return h !== a
    case 'dcX2': return a >= h
    case 'hcapHome': return h - 1 > a
    case 'hcapAway': return a - 1 > h
    default: return null
  }
}

function settleBets(state: State, finishedIds: Set<string>): State {
  if (finishedIds.size === 0) return state
  let balance = state.user.balance
  const bets = state.bets.map((bet) => {
    if (bet.status !== 'active') return bet
    const involved = bet.selections.filter((s) => finishedIds.has(s.eventId))
    if (involved.length === 0) return bet
    const allFinished = bet.selections.every((s) => {
      const ev = state.events.find((e) => e.id === s.eventId)
      return ev && ev.status === 'finished'
    })
    if (!allFinished) return bet
    const results = bet.selections.map((s) => {
      const ev = state.events.find((e) => e.id === s.eventId)!
      return selectionWon(s, ev)
    })
    if (results.some((r) => r === false)) return { ...bet, status: 'lost' as const, payout: 0, cashOutValue: 0 }
    const payout = bet.stake * bet.totalOdds
    balance += payout
    return { ...bet, status: 'won' as const, payout, cashOutValue: 0 }
  })
  return { ...state, bets, user: { ...state.user, balance } }
}

function refreshCashOuts(state: State): State {
  const bets = state.bets.map((bet) => {
    if (bet.status !== 'active') return bet
    let prob = 1
    let allLiveOrPending = true
    for (const s of bet.selections) {
      const ev = state.events.find((e) => e.id === s.eventId)
      if (!ev) continue
      if (ev.status === 'finished') {
        const w = selectionWon(s, ev)
        if (w === false) return { ...bet, cashOutValue: 0 }
        prob *= 1
      } else {
        prob *= selectionWinProb(s, ev)
      }
    }
    if (!allLiveOrPending) return bet
    const value = Math.max(0, Math.round(bet.stake * bet.totalOdds * prob * 0.92 * 100) / 100)
    return { ...bet, cashOutValue: value }
  })
  return { ...state, bets }
}

function syncSlipOdds(state: State): State {
  const betslip = state.betslip.map((item) => {
    const ev = state.events.find((e) => e.id === item.eventId)
    if (!ev) return { ...item, suspended: true }
    if (ev.status === 'finished') return { ...item, suspended: true }
    const cur = currentOddsFor(item, ev)
    if (cur == null) return { ...item, suspended: true }
    if (Math.abs(cur - item.odds) > 0.001) {
      if (state.settings.acceptAnyOdds) return { ...item, odds: cur, oddsChanged: undefined, suspended: false }
      return { ...item, oddsChanged: { from: item.odds, to: cur }, suspended: false }
    }
    return { ...item, suspended: false }
  })
  return { ...state, betslip }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK': {
      const res = tick(state.events, action.now, state.settings.lang)
      if (res.changed.length === 0 && state.bets.every((b) => b.status !== 'active')) {
        return state
      }
      let next = { ...state, events: [...state.events] }
      next = settleBets(next, new Set(res.finished.map((e) => e.id)))
      next = refreshCashOuts(next)
      next = syncSlipOdds(next)
      return next
    }
    case 'NAV': return { ...state, view: action.view }
    case 'ADD_SELECTION': {
      const exists = state.betslip.find((i) => i.eventId === action.sel.eventId)
      // one selection per event (avoid same-game conflicts in multi)
      const without = state.betslip.filter((i) => i.eventId !== action.sel.eventId)
      const item: BetSlipItem = { ...action.sel, stake: exists?.stake ?? 10 }
      const betslip = [...without, item]
      return { ...state, betslip, slipMode: betslip.length > 1 ? 'multi' : 'single' }
    }
    case 'REMOVE_SELECTION': {
      const betslip = state.betslip.filter((i) => !(i.eventId === action.eventId && i.marketKey === action.marketKey))
      return { ...state, betslip, slipMode: betslip.length > 1 ? state.slipMode : 'single' }
    }
    case 'CLEAR_SLIP': return { ...state, betslip: [] }
    case 'SET_SLIP_MODE': return { ...state, slipMode: action.mode }
    case 'SET_STAKE': return {
      ...state,
      betslip: state.betslip.map((i) => (i.eventId === action.eventId && i.marketKey === action.marketKey ? { ...i, stake: action.stake } : i)),
    }
    case 'SET_MULTI_STAKE': return { ...state, betslip: state.betslip.map((i) => ({ ...i, stake: action.stake })) }
    case 'ACCEPT_ODDS': return {
      ...state,
      betslip: state.betslip.map((i) => (i.oddsChanged ? { ...i, odds: i.oddsChanged.to, oddsChanged: undefined } : i)),
    }
    case 'PLACE_BET': {
      const valid = state.betslip.filter((i) => !i.suspended && !i.oddsChanged)
      if (valid.length === 0 || !state.user.loggedIn) return state
      const now = Date.now()
      const newBets: Bet[] = []
      let cost = 0
      if (state.slipMode === 'multi' && valid.length > 1) {
        const stake = valid[0].stake
        const totalOdds = valid.reduce((a, i) => a * i.odds, 1)
        cost = stake
        newBets.push({
          id: `bet-${now}`, placedAt: now, kind: 'multi', selections: valid.map(({ eventId, marketKey, marketLabel, pickLabel, odds, eventLabel, leagueName }) => ({ eventId, marketKey, marketLabel, pickLabel, odds, eventLabel, leagueName })),
          stake, totalOdds: Math.round(totalOdds * 100) / 100, status: 'active', payout: 0,
        })
      } else {
        for (const i of valid) {
          cost += i.stake
          newBets.push({
            id: `bet-${now}-${i.eventId}`, placedAt: now, kind: 'single',
            selections: [{ eventId: i.eventId, marketKey: i.marketKey, marketLabel: i.marketLabel, pickLabel: i.pickLabel, odds: i.odds, eventLabel: i.eventLabel, leagueName: i.leagueName }],
            stake: i.stake, totalOdds: i.odds, status: 'active', payout: 0,
          })
        }
      }
      if (cost > state.user.balance || cost <= 0) return state
      const user = { ...state.user, balance: Math.round((state.user.balance - cost) * 100) / 100 }
      return { ...state, bets: [...newBets, ...state.bets], betslip: [], user, toast: 'betPlaced' }
    }
    case 'CASH_OUT': {
      const bet = state.bets.find((b) => b.id === action.betId)
      if (!bet || bet.status !== 'active' || !bet.cashOutValue) return state
      const bets = state.bets.map((b) => (b.id === action.betId ? { ...b, status: 'cashedOut' as const, payout: bet.cashOutValue! } : b))
      const user = { ...state.user, balance: Math.round((state.user.balance + bet.cashOutValue) * 100) / 100 }
      return { ...state, bets, user }
    }
    case 'TOGGLE_FAV': {
      const favorites = state.favorites.includes(action.eventId)
        ? state.favorites.filter((f) => f !== action.eventId)
        : [...state.favorites, action.eventId]
      return { ...state, favorites }
    }
    case 'SET_ODDS_FORMAT': return { ...state, settings: { ...state.settings, oddsFormat: action.f } }
    case 'SET_LANG': return { ...state, settings: { ...state.settings, lang: action.l } }
    case 'SET_ACCEPT_ANY': return { ...state, settings: { ...state.settings, acceptAnyOdds: action.v } }
    case 'AUTH': return { ...state, authOpen: action.mode }
    case 'LOGIN': return { ...state, user: { ...state.user, loggedIn: true, username: action.username }, authOpen: null }
    case 'LOGOUT': return { ...state, user: { ...state.user, loggedIn: false, username: null } }
    case 'DEPOSIT': {
      const limit = state.settings.depositLimit
      const already = state.depositedToday
      if (limit != null && already + action.amount > limit) return { ...state, toast: 'depositLimitHit' }
      return {
        ...state,
        user: { ...state.user, balance: Math.round((state.user.balance + action.amount) * 100) / 100 },
        depositedToday: already + action.amount,
        toast: 'depositAdded',
      }
    }
    case 'ADJUST_BALANCE': return { ...state, user: { ...state.user, balance: Math.max(0, Math.round((state.user.balance + action.delta) * 100) / 100) } }
    case 'DISMISS_WELCOME': {
      if (action.permanent) {
        try {
          const p = loadPersisted()
          localStorage.setItem(LS_KEY, JSON.stringify({ ...persistShape(state), welcomeDismissed: true, ...(p ? {} : {}) }))
        } catch { /* ignore */ }
      }
      return { ...state, welcomeOpen: false }
    }
    case 'OPEN_WELCOME': return { ...state, welcomeOpen: true }
    case 'RG': return { ...state, rgOpen: action.open }
    case 'SET_LIMITS': return { ...state, settings: { ...state.settings, depositLimit: action.depositLimit, sessionLimitMin: action.sessionLimitMin }, rgOpen: false, toast: 'saved' }
    case 'TOAST': return { ...state, toast: action.msg }
    default: return state
  }
}

function persistShape(s: State) {
  return {
    bets: s.bets, favorites: s.favorites, user: s.user, settings: s.settings,
    welcomeDismissed: true,
    depositedToday: { date: todayStr(), amount: s.depositedToday },
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  // simulation loop — one interval, pauses when tab hidden
  useEffect(() => {
    let id: number | null = null
    const start = () => { if (id == null) id = window.setInterval(() => dispatch({ type: 'TICK', now: Date.now() }), 2000) }
    const stop = () => { if (id != null) { clearInterval(id); id = null } }
    const onVis = () => (document.hidden ? stop() : start())
    start()
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  // persist
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const existing = loadPersisted()
        const shape = persistShape(stateRef.current)
        shape.welcomeDismissed = existing?.welcomeDismissed ?? stateRef.current.welcomeOpen === false
        localStorage.setItem(LS_KEY, JSON.stringify(shape))
      } catch { /* ignore */ }
    }, 400)
    return () => clearTimeout(t)
  }, [state.bets, state.favorites, state.user, state.settings, state.depositedToday])

  // toast auto-clear
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'TOAST', msg: null }), 2600)
    return () => clearTimeout(t)
  }, [state.toast])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}

export function useLang() {
  const { state } = useApp()
  return state.settings.lang
}

export function useEventById(id: string | undefined) {
  const { state } = useApp()
  return state.events.find((e) => e.id === id)
}
