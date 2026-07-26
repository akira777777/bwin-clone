import { useMemo, useState } from 'react'
import { Bell, Search, Shield, Wallet, ChevronDown } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { formatMoney } from '@/lib/odds'

export function Header() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return state.events
      .filter((e) => e.status !== 'finished' && (
        e.home.name.toLowerCase().includes(q) || e.away.name.toLowerCase().includes(q) || e.leagueName.toLowerCase().includes(q)
      ))
      .slice(0, 8)
  }, [query, state.events])

  const notifCount = state.bets.filter((b) => b.status === 'active').length

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <button
          className="flex items-center gap-1.5 text-xl font-black tracking-tight"
          onClick={() => dispatch({ type: 'NAV', view: { name: 'sports' } })}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm font-black text-primary-foreground">B</span>
          BETZ<span className="text-primary">.</span>
        </button>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          <button className={`tab-btn ${state.view.name === 'sports' && !state.view.liveOnly ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'sports' } })}>{t('sports', lang)}</button>
          <button className={`tab-btn flex items-center gap-1.5 ${state.view.name === 'sports' && state.view.liveOnly ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'sports', liveOnly: true } })}>
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-current" />{t('live', lang)}
          </button>
          <button className={`tab-btn ${state.view.name === 'casino' ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'casino' } })}>{t('casino', lang)}</button>
          <button className={`tab-btn ${state.view.name === 'favorites' ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'favorites' } })}>{t('favorites', lang)}</button>
        </nav>

        {/* search */}
        <div className="relative ml-auto hidden w-56 lg:block xl:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search', lang)}
            className="h-9 w-full rounded-lg border border-border bg-secondary/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
          {results.length > 0 && (
            <div className="panel absolute left-0 right-0 top-11 z-50 max-h-80 overflow-auto p-1 shadow-2xl">
              {results.map((e) => (
                <button
                  key={e.id}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => { setQuery(''); dispatch({ type: 'NAV', view: { name: 'match', eventId: e.id } }) }}
                >
                  <span className="truncate">{e.home.name} vs {e.away.name}</span>
                  <span className="ml-2 shrink-0 text-[11px] text-muted-foreground">{e.status === 'live' ? 'LIVE' : e.leagueName}</span>
                </button>
              ))}
            </div>
          )}
          {query.trim().length >= 2 && results.length === 0 && (
            <div className="panel absolute left-0 right-0 top-11 z-50 p-3 text-sm text-muted-foreground shadow-2xl">{t('searchNoResults', lang)}</div>
          )}
        </div>

        {/* language */}
        <button
          className="btn-ghost hidden h-9 items-center gap-1 px-2.5 text-xs font-bold sm:flex"
          onClick={() => dispatch({ type: 'SET_LANG', l: lang === 'en' ? 'ru' : 'en' })}
        >
          {lang === 'en' ? '🇬🇧 EN' : '🇷🇺 RU'}
        </button>

        {/* odds format */}
        <div className="relative hidden sm:block">
          <button className="btn-ghost flex h-9 items-center gap-1 px-2.5 text-xs font-bold" onClick={() => setMenuOpen((v) => !v)}>
            {state.settings.oddsFormat.toUpperCase().slice(0, 3)} <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {menuOpen && (
            <div className="panel absolute right-0 top-11 z-50 w-36 p-1 shadow-2xl" onMouseLeave={() => setMenuOpen(false)}>
              {(['decimal', 'fractional', 'american'] as const).map((f) => (
                <button
                  key={f}
                  className={`w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-accent ${state.settings.oddsFormat === f ? 'text-primary font-bold' : ''}`}
                  onClick={() => { dispatch({ type: 'SET_ODDS_FORMAT', f }); setMenuOpen(false) }}
                >
                  {f === 'decimal' ? 'Decimal (1.90)' : f === 'fractional' ? 'Fractional (9/10)' : 'American (−110)'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* notifications → my bets */}
        <button className="btn-ghost relative hidden h-9 w-9 items-center justify-center sm:flex" onClick={() => dispatch({ type: 'NAV', view: { name: 'bets' } })} aria-label={t('myBets', lang)}>
          <Bell className="h-4 w-4" />
          {notifCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">{notifCount}</span>}
        </button>

        {/* balance / auth */}
        {state.user.loggedIn ? (
          <>
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 sm:flex">
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{t('balance', lang)}</span>
              <span className="text-sm font-bold text-primary">{formatMoney(state.user.balance)}</span>
            </div>
            <button className="btn-lime hidden h-9 items-center gap-1.5 px-3 text-sm sm:flex" onClick={() => dispatch({ type: 'DEPOSIT', amount: 1000 })}>
              <Wallet className="h-4 w-4" /> {t('deposit', lang)}
            </button>
            <button className="btn-ghost hidden h-9 px-3 text-sm md:block" onClick={() => dispatch({ type: 'LOGOUT' })}>{t('logOut', lang)}</button>
          </>
        ) : (
          <>
            <button className="btn-ghost hidden h-9 px-3 text-sm sm:block" onClick={() => dispatch({ type: 'AUTH', mode: 'login' })}>{t('logIn', lang)}</button>
            <button className="btn-lime h-9 px-3 text-sm" onClick={() => dispatch({ type: 'AUTH', mode: 'register' })}>{t('register', lang)}</button>
          </>
        )}

        {/* responsible gaming */}
        <button className="btn-ghost hidden h-9 w-9 items-center justify-center lg:flex" onClick={() => dispatch({ type: 'RG', open: true })} aria-label={t('responsibleGaming', lang)} title={t('responsibleGaming', lang)}>
          <Shield className="h-4 w-4 text-primary" />
        </button>
      </div>
    </header>
  )
}
