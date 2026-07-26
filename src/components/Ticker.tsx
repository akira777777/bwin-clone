import { useApp } from '@/state/AppContext'
import { SPORTS_META } from '@/data/sports'
import { MinuteBadge, useFmtOdds } from './bits'

/** Horizontal strip of live events — deduplicated by event id */
export function Ticker() {
  const { state, dispatch } = useApp()
  const fmt = useFmtOdds()
  const live = state.events.filter((e) => e.status === 'live')
  // dedupe guard
  const seen = new Set<string>()
  const items = live.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)))

  if (items.length === 0) return null
  return (
    <div className="border-b border-border bg-card/60">
      <div className="mx-auto flex max-w-[1600px] items-stretch gap-2 overflow-x-auto px-3 py-2 no-scrollbar sm:px-4">
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 text-[11px] font-black text-red-400">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-red-500" />LIVE
        </span>
        {items.map((e) => (
          <button
            key={e.id}
            onClick={() => dispatch({ type: 'NAV', view: { name: 'match', eventId: e.id } })}
            className="flex shrink-0 items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 transition hover:border-primary/50"
          >
            <span className="text-base">{SPORTS_META[e.sport].icon}</span>
            <span className="flex flex-col items-start leading-tight">
              <span className="max-w-[130px] truncate text-xs font-semibold">{e.home.name}</span>
              <span className="max-w-[130px] truncate text-xs text-muted-foreground">{e.away.name}</span>
            </span>
            <span className="flex flex-col items-center leading-tight">
              <span className="text-sm font-black text-primary">{e.scoreHome} – {e.scoreAway}</span>
              <MinuteBadge minute={e.minute} sport={e.sport} />
            </span>
            <span className="flex gap-1">
              <span className="rounded bg-background/70 px-1.5 py-0.5 text-[11px] font-bold">{fmt(e.odds.main.home)}</span>
              {e.odds.main.draw != null && <span className="rounded bg-background/70 px-1.5 py-0.5 text-[11px] font-bold">{fmt(e.odds.main.draw)}</span>}
              <span className="rounded bg-background/70 px-1.5 py-0.5 text-[11px] font-bold">{fmt(e.odds.main.away)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
