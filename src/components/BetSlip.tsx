import { ShoppingCart, Trash2, TriangleAlert } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { formatMoney } from '@/lib/odds'
import { useFmtOdds } from './bits'

const QUICK_STAKES = [5, 10, 25, 50, 100]

export function BetSlip() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const fmt = useFmtOdds()
  const slip = state.betslip
  const isMulti = state.slipMode === 'multi' && slip.length > 1

  const hasChanges = slip.some((i) => i.oddsChanged)
  const validCount = slip.filter((i) => !i.suspended && !i.oddsChanged).length
  const totalOdds = isMulti
    ? slip.reduce((a, i) => a * (i.oddsChanged ? i.oddsChanged.to : i.odds), 1)
    : 0
  const stakeTotal = isMulti ? (slip[0]?.stake ?? 0) : slip.reduce((a, i) => a + i.stake, 0)
  const possibleWin = isMulti
    ? stakeTotal * totalOdds
    : slip.reduce((a, i) => a + i.stake * i.odds, 0)

  const canPlace = state.user.loggedIn && validCount === slip.length && slip.length > 0 && stakeTotal > 0 && stakeTotal <= state.user.balance

  return (
    <div className="panel sticky top-16 flex max-h-[calc(100vh-5rem)] w-80 shrink-0 flex-col max-lg:hidden">
      <div className="flex border-b border-border">
        <button className="flex-1 border-b-2 border-primary py-2.5 text-sm font-bold">
          {t('betSlip', lang)} {slip.length > 0 && <span className="chip ml-1 bg-primary text-primary-foreground">{slip.length}</span>}
        </button>
        <button className="flex-1 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground" onClick={() => dispatch({ type: 'NAV', view: { name: 'bets' } })}>
          {t('myBets', lang)}
        </button>
      </div>

      {slip.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm font-bold">{t('emptySlip', lang)}</div>
          <div className="text-xs text-muted-foreground">{t('emptySlipHint', lang)}</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 pt-3">
            <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
              <button className={`tab-btn !px-3 !py-1 !text-xs ${!isMulti ? 'active' : ''}`} onClick={() => dispatch({ type: 'SET_SLIP_MODE', mode: 'single' })}>{t('single', lang)}</button>
              <button className={`tab-btn !px-3 !py-1 !text-xs ${isMulti ? 'active' : ''}`} disabled={slip.length < 2} onClick={() => dispatch({ type: 'SET_SLIP_MODE', mode: 'multi' })}>{t('multi', lang)}</button>
            </div>
            <button className="text-xs font-semibold text-muted-foreground hover:text-destructive" onClick={() => dispatch({ type: 'CLEAR_SLIP' })}>{t('clearAll', lang)}</button>
          </div>

          {hasChanges && (
            <div className="mx-3 mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400">
                <TriangleAlert className="h-3.5 w-3.5" /> {t('oddsChanged', lang)}
              </div>
              <button className="btn-lime mt-2 w-full py-1.5 text-xs" onClick={() => dispatch({ type: 'ACCEPT_ODDS' })}>{t('acceptChanges', lang)}</button>
            </div>
          )}

          <div className="mt-2 flex-1 overflow-auto px-3">
            {slip.map((i) => (
              <div key={i.eventId} className="mb-2 rounded-lg border border-border bg-secondary/40 p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold">{i.pickLabel}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{i.marketLabel} · {i.eventLabel}</div>
                  </div>
                  <button onClick={() => dispatch({ type: 'REMOVE_SELECTION', eventId: i.eventId, marketKey: i.marketKey })} aria-label="remove">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm font-black text-primary">
                    {i.oddsChanged ? (
                      <>
                        <s className="mr-1 text-muted-foreground">{fmt(i.oddsChanged.from)}</s>
                        {fmt(i.oddsChanged.to)}
                      </>
                    ) : fmt(i.odds)}
                  </span>
                  {i.suspended && <span className="chip bg-destructive/15 text-destructive">{t('suspended', lang)}</span>}
                </div>
                {!isMulti && (
                  <input
                    type="number" min={1} value={i.stake || ''}
                    onChange={(e) => dispatch({ type: 'SET_STAKE', eventId: i.eventId, marketKey: i.marketKey, stake: Math.max(0, Number(e.target.value)) })}
                    className="mt-2 h-8 w-full rounded-lg border border-border bg-background px-2 text-sm font-bold outline-none focus:border-primary/60"
                    placeholder={t('stake', lang)}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border p-3">
            {isMulti && (
              <div className="mb-2">
                <input
                  type="number" min={1} value={slip[0]?.stake || ''}
                  onChange={(e) => dispatch({ type: 'SET_MULTI_STAKE', stake: Math.max(0, Number(e.target.value)) })}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm font-bold outline-none focus:border-primary/60"
                  placeholder={`${t('totalStake', lang)} (€)`}
                />
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK_STAKES.map((v) => (
                <button
                  key={v}
                  className="btn-ghost px-2.5 py-1 text-xs font-bold"
                  onClick={() => {
                    if (isMulti) dispatch({ type: 'SET_MULTI_STAKE', stake: (slip[0]?.stake ?? 0) + v })
                    else slip.forEach((i) => dispatch({ type: 'SET_STAKE', eventId: i.eventId, marketKey: i.marketKey, stake: i.stake + v }))
                  }}
                >
                  +€{v}
                </button>
              ))}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t('totalStake', lang)}</span><span className="font-bold">{formatMoney(stakeTotal)}</span></div>
              {isMulti && <div className="flex justify-between"><span className="text-muted-foreground">{t('totalOdds', lang)}</span><span className="font-bold">{fmt(Math.round(totalOdds * 100) / 100)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">{t('possibleWin', lang)}</span><span className="font-black text-primary">{formatMoney(Math.round(possibleWin * 100) / 100)}</span></div>
            </div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
              <input type="checkbox" checked={state.settings.acceptAnyOdds} onChange={(e) => dispatch({ type: 'SET_ACCEPT_ANY', v: e.target.checked })} className="accent-[hsl(72_95%_55%)]" />
              {t('acceptAnyOdds', lang)}
            </label>
            {!state.user.loggedIn ? (
              <button className="btn-lime mt-2 w-full py-2.5 text-sm" onClick={() => dispatch({ type: 'AUTH', mode: 'login' })}>{t('loginRequired', lang)}</button>
            ) : stakeTotal > state.user.balance ? (
              <button className="btn-lime mt-2 w-full py-2.5 text-sm" disabled>{t('insufficient', lang)}</button>
            ) : (
              <button className="btn-lime mt-2 w-full py-2.5 text-sm" disabled={!canPlace} onClick={() => dispatch({ type: 'PLACE_BET', stakeSingles: 0 })}>
                {t('placeBet', lang)} · {formatMoney(stakeTotal)}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
