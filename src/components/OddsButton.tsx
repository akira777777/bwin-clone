import { memo } from 'react'
import type { SportEvent } from '@/types'
import { useApp } from '@/state/AppContext'
import { useFmtOdds } from './bits'

interface Props {
  ev: SportEvent
  marketKey: string
  odds: number | undefined
  label?: string
  marketLabel: string
  pickLabel: string
  compact?: boolean
}

export const OddsButton = memo(function OddsButton({ ev, marketKey, odds, label, marketLabel, pickLabel, compact }: Props) {
  const { state, dispatch } = useApp()
  const fmt = useFmtOdds()
  if (odds == null) return null
  const suspended = ev.status === 'suspended' || ev.status === 'finished'
  const selected = state.betslip.some((i) => i.eventId === ev.id && i.marketKey === marketKey)
  return (
    <button
      className={`odds-btn ${selected ? 'selected' : ''} ${suspended ? 'suspended' : ''} ${compact ? '!min-w-[56px] !px-2 !py-1.5 !text-[13px]' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        if (selected) {
          dispatch({ type: 'REMOVE_SELECTION', eventId: ev.id, marketKey })
        } else {
          dispatch({
            type: 'ADD_SELECTION',
            sel: {
              eventId: ev.id,
              marketKey,
              marketLabel,
              pickLabel,
              odds,
              eventLabel: `${ev.home.name} vs ${ev.away.name}`,
              leagueName: ev.leagueName,
            },
          })
        }
      }}
      aria-pressed={selected}
    >
      {label && <span className={`text-[10px] font-semibold uppercase ${selected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{label}</span>}
      <span>{fmt(odds)}</span>
    </button>
  )
})
