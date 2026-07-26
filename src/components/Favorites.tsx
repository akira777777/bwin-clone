import { Star } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { SPORTS_META } from '@/data/sports'
import { EventRow } from './EventList'

export function Favorites() {
  const { state } = useApp()
  const lang = state.settings.lang
  const favs = state.events.filter((e) => state.favorites.includes(e.id) && e.status !== 'finished')

  if (favs.length === 0) {
    return (
      <div className="panel mx-auto flex max-w-md flex-col items-center gap-2 p-10 text-center">
        <Star className="h-8 w-8 text-muted-foreground" />
        <div className="font-bold">{t('favoritesEmpty', lang)}</div>
        <div className="text-sm text-muted-foreground">{t('favoritesHint', lang)}</div>
      </div>
    )
  }

  const byLeague = new Map<string, typeof favs>()
  for (const e of favs) {
    if (!byLeague.has(e.leagueName)) byLeague.set(e.leagueName, [])
    byLeague.get(e.leagueName)!.push(e)
  }

  return (
    <div>
      {[...byLeague.entries()].map(([league, evs]) => (
        <div key={league} className="panel mb-3 overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>{SPORTS_META[evs[0].sport].icon}</span>
            {league}
          </div>
          {evs.map((e) => <EventRow key={e.id} ev={e} />)}
        </div>
      ))}
    </div>
  )
}
