import { useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { SPORTS_META } from '@/data/sports'
import { t } from '@/i18n'
import type { SportEvent } from '@/types'
import { LivePill, MinuteBadge, TeamBadge } from './bits'
import { OddsButton } from './OddsButton'

export function EventRow({ ev }: { ev: SportEvent }) {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const fav = state.favorites.includes(ev.id)
  const start = new Date(ev.startAt)
  const timeLabel = ev.status === 'upcoming'
    ? `${t('today', lang)} ${start.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : ''
  const mainLabel = ev.odds.main.draw != null ? t('matchResult', lang) : t('matchWinner', lang)

  return (
    <div
      className="group flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 transition hover:bg-accent/50 sm:gap-3 sm:px-4"
      onClick={() => dispatch({ type: 'NAV', view: { name: 'match', eventId: ev.id } })}
    >
      <button
        className="shrink-0 p-1"
        onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FAV', eventId: ev.id }) }}
        aria-label={t('favorites', lang)}
      >
        <Star className={`h-4 w-4 ${fav ? 'fill-primary text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <TeamBadge team={ev.home} size={22} />
          <span className="truncate text-sm font-semibold">{ev.home.name}</span>
          <span className="ml-auto text-sm font-black tabular-nums">{ev.status !== 'upcoming' ? ev.scoreHome : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <TeamBadge team={ev.away} size={22} />
          <span className="truncate text-sm font-semibold">{ev.away.name}</span>
          <span className="ml-auto text-sm font-black tabular-nums">{ev.status !== 'upcoming' ? ev.scoreAway : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {ev.status === 'live' ? (
            <>
              <LivePill />
              <MinuteBadge minute={ev.minute} sport={ev.sport} />
            </>
          ) : (
            <span>{timeLabel}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
        {ev.status === 'suspended' ? (
          <span className="chip bg-secondary text-muted-foreground">{t('suspended', lang)}</span>
        ) : (
          <>
            <OddsButton ev={ev} marketKey="main.home" odds={ev.odds.main.home} label="1" marketLabel={mainLabel} pickLabel={ev.home.name} compact />
            {ev.odds.main.draw != null && (
              <OddsButton ev={ev} marketKey="main.draw" odds={ev.odds.main.draw} label="X" marketLabel={mainLabel} pickLabel={lang === 'ru' ? 'Ничья' : 'Draw'} compact />
            )}
            <OddsButton ev={ev} marketKey="main.away" odds={ev.odds.main.away} label="2" marketLabel={mainLabel} pickLabel={ev.away.name} compact />
          </>
        )}
      </div>
    </div>
  )
}

export function EventList({ liveOnly, sport, query }: { liveOnly?: boolean; sport?: string; query?: string }) {
  const { state } = useApp()
  const lang = state.settings.lang
  const [showStartingSoon, setShowStartingSoon] = useState(false)

  const events = useMemo(() => {
    let list = state.events.filter((e) => e.status !== 'finished')
    if (sport) list = list.filter((e) => e.sport === sport)
    if (query) list = list.filter((e) => e.leagueName === query)
    if (showStartingSoon) list = list.filter((e) => e.status === 'upcoming' && e.startAt - Date.now() < 2 * 3600_000)
    return list
  }, [state.events, sport, query, showStartingSoon])

  const live = events.filter((e) => e.status === 'live').sort((a, b) => b.minute - a.minute)
  const upcoming = events.filter((e) => e.status === 'upcoming').sort((a, b) => a.startAt - b.startAt)

  const groupByLeague = (list: SportEvent[]) => {
    const m = new Map<string, SportEvent[]>()
    for (const e of list) {
      const key = e.leagueName
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(e)
    }
    return [...m.entries()]
  }

  const renderGroup = (title: string, list: SportEvent[]) => (
    <div key={title}>
      {groupByLeague(list).map(([league, evs]) => (
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

  if (events.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-2 p-10 text-center">
        <span className="text-3xl">📭</span>
        <div className="font-bold">{t('noEvents', lang)}</div>
        <div className="text-sm text-muted-foreground">{t('noEventsHint', lang)}</div>
      </div>
    )
  }

  return (
    <div>
      {!liveOnly && (
        <div className="mb-3 flex items-center gap-2">
          <button className={`tab-btn border border-border ${!showStartingSoon ? 'active' : ''}`} onClick={() => setShowStartingSoon(false)}>{t('upcoming', lang)}</button>
          <button className={`tab-btn border border-border ${showStartingSoon ? 'active' : ''}`} onClick={() => setShowStartingSoon(true)}>⏱ {t('startingSoon', lang)}</button>
        </div>
      )}
      {live.length > 0 && (
        <>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <span className="live-dot h-2 w-2 rounded-full bg-red-500" /> {t('liveNow', lang)}
            <span className="chip bg-red-500/15 text-red-400">{live.length}</span>
          </h2>
          {renderGroup('live', live)}
        </>
      )}
      {!liveOnly && upcoming.length > 0 && (
        <>
          <h2 className="mb-2 mt-5 text-sm font-black uppercase tracking-wider text-muted-foreground">{t('upcoming', lang)}</h2>
          {renderGroup('upcoming', upcoming)}
        </>
      )}
    </div>
  )
}
