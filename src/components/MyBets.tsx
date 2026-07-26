import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { formatMoney } from '@/lib/odds'
import type { Bet } from '@/types'
import { useFmtOdds } from './bits'

function BetCard({ bet }: { bet: Bet }) {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const fmt = useFmtOdds()
  const statusChip = {
    active: 'bg-primary/15 text-primary',
    won: 'bg-emerald-500/15 text-emerald-400',
    lost: 'bg-destructive/15 text-destructive',
    cashedOut: 'bg-sky-500/15 text-sky-400',
  }[bet.status]
  const statusLabel = { active: t('active', lang), won: t('won', lang), lost: t('lost', lang), cashedOut: t('cashedOut', lang) }[bet.status]

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {bet.kind === 'multi' ? t('multi', lang) : t('single', lang)} · {new Date(bet.placedAt).toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className={`chip ${statusChip}`}>{statusLabel}</span>
      </div>
      <div className="mt-2 space-y-1.5">
        {bet.selections.map((s) => {
          const ev = state.events.find((e) => e.id === s.eventId)
          return (
            <div key={s.eventId + s.marketKey} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <span className="font-bold">{s.pickLabel}</span>
                <span className="text-muted-foreground"> · {s.marketLabel} · {s.eventLabel}</span>
              </div>
              <span className="shrink-0 font-bold text-primary">{fmt(s.odds)}</span>
              {ev?.status === 'finished' && <span className="shrink-0 text-[11px] text-muted-foreground">({ev.scoreHome}:{ev.scoreAway})</span>}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">{t('stake', lang)}: <b className="text-foreground">{formatMoney(bet.stake)}</b> @ {fmt(bet.totalOdds)}</span>
        <span className="font-black">{t('potentialPayout', lang)}: <span className="text-primary">{formatMoney(bet.status === 'won' || bet.status === 'cashedOut' ? bet.payout : Math.round(bet.stake * bet.totalOdds * 100) / 100)}</span></span>
      </div>
      {bet.status === 'active' && bet.cashOutValue != null && bet.cashOutValue > 0 && (
        <button className="btn-lime mt-3 w-full py-2 text-sm" onClick={() => dispatch({ type: 'CASH_OUT', betId: bet.id })}>
          {t('cashOut', lang)} · {formatMoney(bet.cashOutValue)}
        </button>
      )}
    </div>
  )
}

export function MyBets() {
  const { state } = useApp()
  const lang = state.settings.lang
  const [tab, setTab] = useState<'active' | 'settled'>('active')
  const active = state.bets.filter((b) => b.status === 'active')
  const settled = state.bets.filter((b) => b.status !== 'active')
  const list = tab === 'active' ? active : settled

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex gap-1 rounded-lg bg-secondary p-1">
        <button className={`tab-btn flex-1 ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>{t('active', lang)} ({active.length})</button>
        <button className={`tab-btn flex-1 ${tab === 'settled' ? 'active' : ''}`} onClick={() => setTab('settled')}>{t('settled', lang)} ({settled.length})</button>
      </div>
      {list.length === 0 ? (
        <div className="panel flex flex-col items-center gap-2 p-10 text-center">
          <Ticket className="h-8 w-8 text-muted-foreground" />
          <div className="font-bold">{t('noBets', lang)}</div>
          <div className="text-sm text-muted-foreground">{t('noBetsHint', lang)}</div>
        </div>
      ) : (
        <div className="space-y-3">{list.map((b) => <BetCard key={b.id} bet={b} />)}</div>
      )}
    </div>
  )
}
