import { useEffect, useRef, useState } from 'react'
import { Rocket } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { formatMoney } from '@/lib/odds'

type Phase = 'idle' | 'running' | 'crashed'

function CrashGame() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const [stake, setStake] = useState(10)
  const [phase, setPhase] = useState<Phase>('idle')
  const [multiplier, setMultiplier] = useState(1)
  const [cashedAt, setCashedAt] = useState<number | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const crashPoint = useRef(1)
  const raf = useRef<number>(0)
  const startTs = useRef(0)
  const trail = useRef<number[]>([1])

  const tickLoop = () => {
    const elapsed = (performance.now() - startTs.current) / 1000
    const m = Math.pow(Math.E, 0.16 * elapsed) // growth curve
    setMultiplier(m)
    trail.current.push(m)
    if (trail.current.length > 120) trail.current.shift()
    if (m >= crashPoint.current) {
      setPhase('crashed')
      setMultiplier(crashPoint.current)
      setHistory((h) => [crashPoint.current, ...h].slice(0, 10))
      return
    }
    raf.current = requestAnimationFrame(tickLoop)
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const start = () => {
    if (!state.user.loggedIn) { dispatch({ type: 'AUTH', mode: 'login' }); return }
    if (stake <= 0 || stake > state.user.balance) return
    dispatch({ type: 'ADJUST_BALANCE', delta: -stake })
    const r = Math.random()
    crashPoint.current = Math.max(1, Math.floor((0.97 / (1 - r)) * 100) / 100)
    setCashedAt(null)
    setMultiplier(1)
    trail.current = [1]
    setPhase('running')
    startTs.current = performance.now()
    raf.current = requestAnimationFrame(tickLoop)
  }

  const cashOut = () => {
    if (phase !== 'running' || cashedAt) return
    cancelAnimationFrame(raf.current)
    const win = Math.round(stake * multiplier * 100) / 100
    setCashedAt(multiplier)
    setHistory((h) => [multiplier, ...h].slice(0, 10))
    dispatch({ type: 'ADJUST_BALANCE', delta: win })
    setPhase('idle')
  }

  // draw curve
  const W = 560, H = 260
  const pts = trail.current.map((m, i) => {
    const x = (i / 119) * (W - 40) + 10
    const y = H - 20 - Math.min(1, (m - 1) / Math.max(crashPoint.current - 1, 4)) * (H - 60)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-border px-4 py-3 text-sm font-black uppercase tracking-wider">{t('crashTitle', lang)}</div>
      <div className="relative bg-[radial-gradient(ellipse_at_bottom,hsl(220_30%_12%),transparent)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="hsl(220 15% 16%)" strokeDasharray="4 6" />
          ))}
          <polyline points={pts} fill="none" stroke={phase === 'crashed' ? 'hsl(0 72% 55%)' : 'hsl(72 95% 55%)'} strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-5xl font-black tabular-nums sm:text-6xl ${phase === 'crashed' ? 'text-destructive' : cashedAt ? 'text-emerald-400' : 'text-foreground'}`}>
            {(phase === 'running' ? multiplier : phase === 'crashed' ? crashPoint.current : multiplier).toFixed(2)}×
          </div>
          {phase === 'crashed' && <div className="mt-1 text-sm font-bold text-destructive">{t('crashBusted', lang)}</div>}
          {cashedAt && phase === 'idle' && <div className="mt-1 text-sm font-bold text-emerald-400">+{formatMoney(Math.round(stake * cashedAt * 100) / 100)}</div>}
          {phase === 'idle' && !cashedAt && <div className="mt-1 text-sm text-muted-foreground">{t('crashWaiting', lang)}</div>}
        </div>
        <Rocket className={`absolute bottom-6 right-8 h-8 w-8 -rotate-45 ${phase === 'running' ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center">
        <input
          type="number" min={1} value={stake || ''} disabled={phase === 'running'}
          onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-bold outline-none focus:border-primary/60 sm:w-36"
          placeholder={`${t('stake', lang)} (€)`}
        />
        {phase === 'running' ? (
          <button className="btn-lime h-10 flex-1 text-sm" onClick={cashOut} disabled={!!cashedAt}>
            {t('crashCash', lang)} · {formatMoney(Math.round(stake * multiplier * 100) / 100)}
          </button>
        ) : (
          <button className="btn-lime h-10 flex-1 text-sm" onClick={start} disabled={stake <= 0 || stake > state.user.balance}>
            {state.user.loggedIn ? `${t('crashPlace', lang)} · ${formatMoney(stake)}` : t('loginRequired', lang)}
          </button>
        )}
      </div>
      {history.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto border-t border-border px-4 py-2 no-scrollbar">
          {history.map((h, i) => (
            <span key={i} className={`chip shrink-0 ${h >= 2 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-destructive/15 text-destructive'}`}>{h.toFixed(2)}×</span>
          ))}
        </div>
      )}
    </div>
  )
}

const COMING_SOON = [
  { name: 'Mines', icon: '💣' }, { name: 'Roulette', icon: '🎡' }, { name: 'Blackjack', icon: '🃏' },
  { name: 'Slots', icon: '🎰' }, { name: 'Baccarat', icon: '🀄' }, { name: 'Plinko', icon: '⚪' },
]

export function Casino(_props?: any) {
  const { state } = useApp()
  const lang = state.settings.lang
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <CrashGame />
      <div>
        <h3 className="mb-1 text-sm font-black uppercase tracking-wider">{t('casinoLobby', lang)}</h3>
        <p className="mb-3 text-xs text-muted-foreground">{t('otherGamesSoon', lang)}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {COMING_SOON.map((g) => (
            <div key={g.name} className="panel relative flex h-28 flex-col items-center justify-center gap-2 overflow-hidden">
              <span className="text-3xl grayscale opacity-60">{g.icon}</span>
              <span className="text-sm font-bold text-muted-foreground">{g.name}</span>
              <span className="chip absolute right-2 top-2 bg-secondary text-muted-foreground">{t('comingSoon', lang)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
