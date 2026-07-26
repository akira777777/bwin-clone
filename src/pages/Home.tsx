import { useState } from 'react'
import { Info, Shield } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'
import { Header } from '@/components/Header'
import { Ticker } from '@/components/Ticker'
import { Sidebar } from '@/components/Sidebar'
import { EventList } from '@/components/EventList'
import { MatchView } from '@/components/MatchView'
import { BetSlip } from '@/components/BetSlip'
import { MyBets } from '@/components/MyBets'
import { Casino } from '@/components/Casino'
import { Favorites } from '@/components/Favorites'
import { BottomNav } from '@/components/BottomNav'
import { AuthModal, ResponsibleGamingModal, Toast, WelcomeModal } from '@/components/Modals'

function DemoBar() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  return (
    <div className="border-b border-yellow-500/20 bg-yellow-500/10">
      <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-1.5 text-[11px] text-yellow-300/90 sm:px-4">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">{t('demoMode', lang)}</span>
        <span className="hidden sm:inline">— {t('demoHint', lang)}</span>
        <button
          className="ml-auto font-bold underline decoration-dotted underline-offset-2 hover:text-yellow-200"
          onClick={() => dispatch({ type: 'ADJUST_BALANCE', delta: 10000 - state.user.balance })}
        >
          {t('resetBalance', lang)}
        </button>
      </div>
    </div>
  )
}

function MobileSlip({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="modal-anim fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <div className="max-h-[85vh] w-full overflow-auto rounded-t-2xl border-t border-border bg-background pb-20" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto my-2 h-1 w-10 rounded-full bg-muted" />
        <BetSlipMobileWrapper />
      </div>
    </div>
  )
}

function BetSlipMobileWrapper() {
  // reuse BetSlip but un-sticky, full width
  return (
    <div className="[&>div]:!static [&>div]:!max-h-none [&>div]:!w-full [&>div]:!border-0">
      <BetSlip />
    </div>
  )
}

function Footer() {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  return (
    <footer className="mt-10 border-t border-border pb-24 lg:pb-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-3 py-6 text-xs text-muted-foreground sm:px-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="chip bg-secondary">SSL</span>
          <span className="chip bg-secondary">MGA B2C/394/2017</span>
          <span className="chip bg-destructive/15 font-black text-destructive">18+</span>
          <button className="flex items-center gap-1 font-semibold hover:text-foreground" onClick={() => dispatch({ type: 'RG', open: true })}>
            <Shield className="h-3.5 w-3.5 text-primary" /> {t('responsibleGaming', lang)}
          </button>
        </div>
        <p className="max-w-xl leading-relaxed">
          © 2026 BETZ (demo). {lang === 'ru'
            ? 'Учебный проект: ставки виртуальные, реальные деньги не используются. Азартные игры связаны с риском — играйте ответственно. BeGambleAware.org'
            : 'Demo project: virtual bets only, no real money. Gambling involves risk — please gamble responsibly. BeGambleAware.org'}
        </p>
      </div>
    </footer>
  )
}

export default function Home() {
  const { state } = useApp()
  const [slipOpen, setSlipOpen] = useState(false)
  const v = state.view

  return (
    <div className="min-h-screen">
      <Header />
      <DemoBar />
      <Ticker />
      <main className="mx-auto flex max-w-[1600px] gap-5 px-3 py-4 pb-24 sm:px-4 lg:pb-8">
        <Sidebar />
        <div className="min-w-0 flex-1">
          {v.name === 'sports' && <EventList liveOnly={v.liveOnly} sport={v.sport} query={v.query} />}
          {v.name === 'match' && <MatchView eventId={v.eventId} />}
          {v.name === 'casino' && <Casino />}
          {v.name === 'favorites' && <Favorites />}
          {v.name === 'bets' && <MyBets />}
        </div>
        <BetSlip />
      </main>
      <Footer />
      <BottomNav onOpenSlip={() => setSlipOpen(true)} />
      <MobileSlip open={slipOpen} onClose={() => setSlipOpen(false)} />
      <AuthModal />
      <WelcomeModal />
      <ResponsibleGamingModal />
      <Toast />
    </div>
  )
}
