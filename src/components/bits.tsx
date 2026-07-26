import { memo } from 'react'
import type { Team } from '@/types'
import { formatOdds } from '@/lib/odds'
import { useApp } from '@/state/AppContext'

export function TeamBadge({ team, size = 28 }: { team: Team; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white"
      style={{ width: size, height: size, backgroundColor: team.color, fontSize: size * 0.32 }}
    >
      {team.short.slice(0, 3)}
    </span>
  )
}

export function useFmtOdds() {
  const { state } = useApp()
  return (v: number) => formatOdds(v, state.settings.oddsFormat)
}

export const Sparkline = memo(function Sparkline({
  data, width = 260, height = 56, color = 'hsl(72 95% 55%)',
}: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return <div style={{ width, height }} className="flex items-center justify-center text-[11px] text-muted-foreground">…</div>
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - 4) + 2
    const y = height - 4 - ((v - min) / span) * (height - 8)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={width} height={height} className="block">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].split(',')[0]} cy={pts[pts.length - 1].split(',')[1]} r="3" fill={color} />
    </svg>
  )
})

export function MinuteBadge({ minute, sport }: { minute: number; sport: string }) {
  const m = Math.floor(minute)
  const label = sport === 'basketball' ? `Q${Math.min(4, Math.floor(m / 12) + 1)}` : sport === 'tennis' ? 'Live' : `${m}′`
  return <span className="text-[11px] font-bold text-primary">{label}</span>
}

export function LivePill() {
  return (
    <span className="chip bg-red-500/15 text-red-400">
      <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
      LIVE
    </span>
  )
}
