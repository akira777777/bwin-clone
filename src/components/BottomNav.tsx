import { Dices, Home, Radio, Star, Ticket } from 'lucide-react'
import { useApp } from '@/state/AppContext'
import { t } from '@/i18n'

export function BottomNav({ onOpenSlip }: { onOpenSlip: () => void }) {
  const { state, dispatch } = useApp()
  const lang = state.settings.lang
  const item = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${active ? 'text-primary' : 'text-muted-foreground'}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
      <button className={item(state.view.name === 'sports' && !state.view.liveOnly)} onClick={() => dispatch({ type: 'NAV', view: { name: 'sports' } })}>
        <Home className="h-5 w-5" />{t('sports', lang)}
      </button>
      <button className={item(state.view.name === 'sports' && !!state.view.liveOnly)} onClick={() => dispatch({ type: 'NAV', view: { name: 'sports', liveOnly: true } })}>
        <Radio className="h-5 w-5" />{t('live', lang)}
      </button>
      <button className={item(state.view.name === 'casino')} onClick={() => dispatch({ type: 'NAV', view: { name: 'casino' } })}>
        <Dices className="h-5 w-5" />{t('casino', lang)}
      </button>
      <button className={item(state.view.name === 'favorites')} onClick={() => dispatch({ type: 'NAV', view: { name: 'favorites' } })}>
        <Star className="h-5 w-5" />{t('favorites', lang)}
      </button>
      <button className={`${item(false)} relative`} onClick={onOpenSlip}>
        <Ticket className="h-5 w-5" />{t('betSlip', lang)}
        {state.betslip.length > 0 && (
          <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
            {state.betslip.length}
          </span>
        )}
      </button>
    </nav>
  )
}
