import { Shield, Star, Ticket } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { SPORTS_META, LEAGUES } from '@/data/sports'
import { t } from '@/i18n'
import type { SportId } from '@/types'

export function Sidebar() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const activeSport = state.view.name === 'sports' ? state.view.sport : undefined

  const counts = (sport: SportId) => state.events.filter((e) => e.sport === sport && e.status !== 'finished').length
  const liveCounts = (sport: SportId) => state.events.filter((e) => e.sport === sport && e.status === 'live').length

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 lg:flex">
      <div className="panel p-2">
        <button className={`nav-item w-full ${state.view.name === 'favorites' ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'favorites' } })}>
          <Star className="h-4 w-4 text-primary" /> {t('favorites', lang)}
          <span className="ml-auto text-xs text-muted-foreground">{state.favorites.length || ''}</span>
        </button>
        <button className={`nav-item w-full ${state.view.name === 'bets' ? 'active' : ''}`} onClick={() => dispatch({ type: 'NAV', view: { name: 'bets' } })}>
          <Ticket className="h-4 w-4 text-primary" /> {t('myBets', lang)}
          <span className="ml-auto text-xs text-muted-foreground">{state.bets.filter((b) => b.status === 'active').length || ''}</span>
        </button>
      </div>

      <div className="panel p-2">
        <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sports A–Z</div>
        {(Object.keys(SPORTS_META) as SportId[]).map((s) => (
          <button
            key={s}
            className={`nav-item w-full ${activeSport === s ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'NAV', view: { name: 'sports', sport: activeSport === s ? undefined : s } })}
          >
            <span className="text-base">{SPORTS_META[s].icon}</span>
            {SPORTS_META[s].label[lang]}
            {liveCounts(s) > 0 && <span className="chip ml-auto bg-red-500/15 text-red-400">{liveCounts(s)} live</span>}
            {liveCounts(s) === 0 && <span className="ml-auto text-xs text-muted-foreground">{counts(s)}</span>}
          </button>
        ))}
      </div>

      <div className="panel p-2">
        <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Top Leagues</div>
        {LEAGUES.slice(0, 8).map((l) => {
          const n = state.events.filter((e) => e.leagueId === l.id && e.status !== 'finished').length
          return (
            <button
              key={l.id}
              className="nav-item w-full"
              onClick={() => dispatch({ type: 'NAV', view: { name: 'sports', sport: l.sport, query: l.name } })}
            >
              <span className="text-base">{SPORTS_META[l.sport].icon}</span>
              <span className="truncate">{l.name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{n}</span>
            </button>
          )
        })}
      </div>

      <button className="panel flex w-full items-start gap-3 p-4 text-left transition hover:border-primary/40" onClick={() => dispatch({ type: 'RG', open: true })}>
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <span>
          <span className="block text-sm font-bold">{t('playItSafe', lang)}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{t('rgText', lang)}</span>
        </span>
      </button>
    </aside>
  )
}
