import { ArrowLeft, Radio, Star } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { LivePill, MinuteBadge, Sparkline, TeamBadge, useFmtOdds } from './bits'
import { OddsButton } from './OddsButton'

function StatBar({ label, home, away, suffix = '' }: { label: string; home: number; away: number; suffix?: string }) {
  const total = home + away || 1
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-bold">{home}{suffix}</span>
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold">{away}{suffix}</span>
      </div>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
        <div className="rounded-l-full bg-primary" style={{ width: `${(home / total) * 100}%` }} />
        <div className="rounded-r-full bg-muted" style={{ flex: 1 }} />
      </div>
    </div>
  )
}

export function MatchView({ eventId }: { eventId: string }) {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const fmt = useFmtOdds()
  const ev = state.events.find((e) => e.id === eventId)
  if (!ev) {
    return (
      <div className="panel p-8 text-center">
        <button className="btn-ghost px-4 py-2 text-sm" onClick={() => dispatch({ type: 'NAV', view: { name: 'sports' } })}>
          <ArrowLeft className="mr-1 inline h-4 w-4" /> {t('backToEvents', lang)}
        </button>
      </div>
    )
  }
  const fav = state.favorites.includes(ev.id)
  const hasDraw = ev.odds.main.draw != null
  const history = ev.oddsHistory.map((h) => h.home)

  return (
    <div className="flex flex-col gap-4">
      <button className="btn-ghost w-fit px-3 py-1.5 text-sm" onClick={() => dispatch({ type: 'NAV', view: { name: 'sports', liveOnly: ev.status === 'live' } })}>
        <ArrowLeft className="mr-1 inline h-4 w-4" /> {t('backToEvents', lang)}
      </button>

      {/* header */}
      <div className="panel relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{ev.leagueName}</div>
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge team={ev.home} size={48} />
            <span className="text-sm font-bold sm:text-base">{ev.home.name}</span>
          </div>
          <div className="flex flex-col items-center">
            {ev.status === 'live' && <LivePill />}
            {ev.status === 'finished' && <span className="chip bg-secondary text-muted-foreground">{t('ft', lang)}</span>}
            <div className="mt-1 text-3xl font-black tabular-nums sm:text-4xl">
              {ev.scoreHome}<span className="mx-1 text-muted-foreground">:</span>{ev.scoreAway}
            </div>
            {ev.status === 'live' && <MinuteBadge minute={ev.minute} sport={ev.sport} />}
            {ev.status === 'upcoming' && (
              <span className="mt-1 text-xs text-muted-foreground">
                {new Date(ev.startAt).toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamBadge team={ev.away} size={48} />
            <span className="text-sm font-bold sm:text-base">{ev.away.name}</span>
          </div>
        </div>
        <button className="absolute right-4 top-4" onClick={() => dispatch({ type: 'TOGGLE_FAV', eventId: ev.id })} aria-label={t('favorites', lang)}>
          <Star className={`h-5 w-5 ${fav ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      {ev.status === 'live' && (
        <div className="panel flex items-center gap-3 px-4 py-3">
          <Radio className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm">{ev.lastEvent || (lang === 'ru' ? 'Матч идёт…' : 'Match in progress…')}</span>
        </div>
      )}

      {/* markets */}
      {ev.status !== 'finished' && (
        <div className="panel p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wider">{hasDraw ? t('matchResult', lang) : t('matchWinner', lang)}</h3>
          <div className="grid grid-cols-3 gap-2">
            <OddsButton ev={ev} marketKey="main.home" odds={ev.odds.main.home} label="1" marketLabel={hasDraw ? t('matchResult', lang) : t('matchWinner', lang)} pickLabel={ev.home.name} />
            {hasDraw && <OddsButton ev={ev} marketKey="main.draw" odds={ev.odds.main.draw} label="X" marketLabel={t('matchResult', lang)} pickLabel={lang === 'ru' ? 'Ничья' : 'Draw'} />}
            <OddsButton ev={ev} marketKey="main.away" odds={ev.odds.main.away} label="2" marketLabel={hasDraw ? t('matchResult', lang) : t('matchWinner', lang)} pickLabel={ev.away.name} />
          </div>

          <h3 className="mb-3 mt-5 text-sm font-black uppercase tracking-wider">{t('totals', lang)} ({ev.odds.totalLine})</h3>
          <div className="grid grid-cols-2 gap-2">
            <OddsButton ev={ev} marketKey="over" odds={ev.odds.over} label={`${t('over', lang)} ${ev.odds.totalLine}`} marketLabel={`${t('totals', lang)} ${ev.odds.totalLine}`} pickLabel={t('over', lang)} />
            <OddsButton ev={ev} marketKey="under" odds={ev.odds.under} label={`${t('under', lang)} ${ev.odds.totalLine}`} marketLabel={`${t('totals', lang)} ${ev.odds.totalLine}`} pickLabel={t('under', lang)} />
          </div>

          {ev.sport === 'football' && (
            <>
              <h3 className="mb-3 mt-5 text-sm font-black uppercase tracking-wider">{t('btts', lang)}</h3>
              <div className="grid grid-cols-2 gap-2">
                <OddsButton ev={ev} marketKey="bttsYes" odds={ev.odds.bttsYes} label={t('yes', lang)} marketLabel={t('btts', lang)} pickLabel={t('yes', lang)} />
                <OddsButton ev={ev} marketKey="bttsNo" odds={ev.odds.bttsNo} label={t('no', lang)} marketLabel={t('btts', lang)} pickLabel={t('no', lang)} />
              </div>
              <h3 className="mb-3 mt-5 text-sm font-black uppercase tracking-wider">{t('doubleChance', lang)}</h3>
              <div className="grid grid-cols-3 gap-2">
                <OddsButton ev={ev} marketKey="dc1X" odds={ev.odds.dc1X} label="1X" marketLabel={t('doubleChance', lang)} pickLabel="1X" />
                <OddsButton ev={ev} marketKey="dc12" odds={ev.odds.dc12} label="12" marketLabel={t('doubleChance', lang)} pickLabel="12" />
                <OddsButton ev={ev} marketKey="dcX2" odds={ev.odds.dcX2} label="X2" marketLabel={t('doubleChance', lang)} pickLabel="X2" />
              </div>
              <h3 className="mb-3 mt-5 text-sm font-black uppercase tracking-wider">{t('handicap', lang)}</h3>
              <div className="grid grid-cols-2 gap-2">
                <OddsButton ev={ev} marketKey="hcapHome" odds={ev.odds.hcapHome} label={`${ev.home.short} −1`} marketLabel={t('handicap', lang)} pickLabel={`${ev.home.name} −1`} />
                <OddsButton ev={ev} marketKey="hcapAway" odds={ev.odds.hcapAway} label={`${ev.away.short} +1`} marketLabel={t('handicap', lang)} pickLabel={`${ev.away.name} +1`} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* stats */}
        <div className="panel p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wider">{t('liveStats', lang)}</h3>
          <div className="flex flex-col gap-3">
            <StatBar label={t('possession', lang)} home={ev.stats.possessionHome} away={100 - ev.stats.possessionHome} suffix="%" />
            <StatBar label={t('shots', lang)} home={ev.stats.shotsHome} away={ev.stats.shotsAway} />
            <StatBar label={t('corners', lang)} home={ev.stats.cornersHome} away={ev.stats.cornersAway} />
            <StatBar label={t('yellowCards', lang)} home={ev.stats.yellowHome} away={ev.stats.yellowAway} />
          </div>
        </div>

        {/* odds movement */}
        <div className="panel p-4">
          <h3 className="mb-3 text-sm font-black uppercase tracking-wider">{t('oddsMovement', lang)}</h3>
          {history.length > 1 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{ev.home.short}</span>
                <span className="font-bold text-primary">{fmt(ev.odds.main.home)}</span>
              </div>
              <Sparkline data={history} width={340} height={72} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{ev.away.short}</span>
                <span className="font-bold text-foreground">{fmt(ev.odds.main.away)}</span>
              </div>
              <Sparkline data={ev.oddsHistory.map((h) => h.away)} width={340} height={72} color="#7dd3fc" />
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {ev.status === 'live' ? '…' : (lang === 'ru' ? 'График появится с началом матча' : 'Chart appears once the match starts')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
