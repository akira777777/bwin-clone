import { useEffect, useState } from 'react'
import { Gift, Shield, X } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-anim fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="panel relative w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <button className="absolute right-3 top-3 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" onClick={onClose} aria-label="close">
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function AuthModal() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const mode = state.authOpen
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [age, setAge] = useState(false)
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  if (!mode) return null

  const submit = () => {
    const errs: string[] = []
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.push(t('errEmail', lang))
    if (password.length < 8) errs.push(t('errPassword', lang))
    if (mode === 'register') {
      if (confirm !== password) errs.push(t('errConfirm', lang))
      if (!age) errs.push(t('errAge', lang))
      if (!terms) errs.push(t('errTerms', lang))
    }
    setErrors(errs)
    if (errs.length === 0) dispatch({ type: 'LOGIN', username: email.split('@')[0] })
  }

  return (
    <ModalShell onClose={() => dispatch({ type: 'AUTH', mode: null })}>
      <div className="mb-5 flex gap-1 rounded-lg bg-secondary p-1">
        <button className={`tab-btn flex-1 ${mode === 'login' ? 'active' : ''}`} onClick={() => dispatch({ type: 'AUTH', mode: 'login' })}>{t('logIn', lang)}</button>
        <button className={`tab-btn flex-1 ${mode === 'register' ? 'active' : ''}`} onClick={() => dispatch({ type: 'AUTH', mode: 'register' })}>{t('register', lang)}</button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">{t('email', lang)}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">{t('password', lang)}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60" />
        </div>
        {mode === 'register' && (
          <>
            <div>
              <label className="mb-1 block text-xs font-bold text-muted-foreground">{t('confirmPassword', lang)}</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60" />
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input type="checkbox" checked={age} onChange={(e) => setAge(e.target.checked)} className="mt-0.5 accent-[hsl(72_95%_55%)]" />
              <span><b>18+</b> · {t('iAm18', lang)}</span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 accent-[hsl(72_95%_55%)]" />
              <span>{t('agreeTerms', lang)}</span>
            </label>
          </>
        )}
        {errors.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
            {errors.map((e) => <div key={e}>• {e}</div>)}
          </div>
        )}
        <button className="btn-lime h-11 w-full text-sm" onClick={submit}>
          {mode === 'register' ? t('registerNow', lang) : t('logIn', lang)}
        </button>
      </div>
    </ModalShell>
  )
}

export function WelcomeModal() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const [dontShow, setDontShow] = useState(false)
  const [visible, setVisible] = useState(false)

  // show with a short delay, only once per visit
  useEffect(() => {
    if (!state.welcomeOpen) return
    const id = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(id)
  }, [state.welcomeOpen])

  if (!state.welcomeOpen || !visible) return null
  const close = () => dispatch({ type: 'DISMISS_WELCOME', permanent: dontShow })

  return (
    <ModalShell onClose={close}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_hsl(72_95%_55%/0.4)]">
          <Gift className="h-8 w-8 text-primary-foreground" />
        </div>
        <span className="chip mb-2 bg-primary/15 text-primary">{t('newPlayersOnly', lang)}</span>
        <h2 className="text-xl font-black">{t('welcomeTitle', lang)}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('welcomeText', lang)}</p>
        <button className="btn-lime mt-4 h-11 w-full text-sm" onClick={() => { close(); dispatch({ type: 'AUTH', mode: 'register' }) }}>
          {t('claimNow', lang)}
        </button>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
          <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} className="accent-[hsl(72_95%_55%)]" />
          {t('dontShow', lang)}
        </label>
      </div>
    </ModalShell>
  )
}

export function ResponsibleGamingModal() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const [dep, setDep] = useState(state.settings.depositLimit?.toString() ?? '')
  const [sess, setSess] = useState(state.settings.sessionLimitMin?.toString() ?? '')

  if (!state.rgOpen) return null

  return (
    <ModalShell onClose={() => dispatch({ type: 'RG', open: false })}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-black">{t('responsibleGaming', lang)}</h2>
          <p className="text-xs text-muted-foreground">{t('rgText', lang)}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">{t('depositLimit', lang)}</label>
          <input type="number" min={0} value={dep} onChange={(e) => setDep(e.target.value)} placeholder="—"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">{t('sessionLimit', lang)}</label>
          <input type="number" min={0} value={sess} onChange={(e) => setSess(e.target.value)} placeholder="—"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/60" />
        </div>
        <div className="rounded-lg border border-border bg-secondary/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
          18+ · BeGambleAware.org · {lang === 'ru' ? 'Азартные игры связаны с риском. Играйте ответственно.' : 'Gambling involves risk — please gamble responsibly.'}
        </div>
        <button
          className="btn-lime h-11 w-full text-sm"
          onClick={() => dispatch({
            type: 'SET_LIMITS',
            depositLimit: dep ? Number(dep) : null,
            sessionLimitMin: sess ? Number(sess) : null,
          })}
        >
          {t('save', lang)}
        </button>
      </div>
    </ModalShell>
  )
}

export function Toast() {
  const { state } = useApp()
  const lang = state.settings.lang
  if (!state.toast) return null
  const msg = t(state.toast as Parameters<typeof t>[0], lang)
  return (
    <div className="toast-anim fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-primary/40 bg-card px-5 py-3 text-sm font-bold shadow-2xl lg:bottom-6">
      {msg}
    </div>
  )
}
