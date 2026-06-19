import { Trophy, Radio, Sparkles, Receipt, Menu } from 'lucide-react';
import type { Category } from '../App';
import { t } from '../utils/i18n';
import './MobileBottomNav.css';

interface MobileBottomNavProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  betSlipCount: number;
  toggleMobileSlip: () => void;
  toggleMobileMenu: () => void;
  language?: string;
}

export default function MobileBottomNav({
  activeCategory,
  setActiveCategory,
  betSlipCount,
  toggleMobileSlip,
  toggleMobileMenu,
  language = 'en'
}: MobileBottomNavProps) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <button 
        className={`bottom-nav-item ${(activeCategory === 'Sports') ? 'active' : ''}`}
        onClick={() => setActiveCategory('Sports')}
      >
        <Trophy size={20} className="nav-icon" />
        <span className="nav-label">{t('Sports', language)}</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeCategory === 'Live Betting' ? 'active' : ''}`}
        onClick={() => setActiveCategory('Live Betting')}
      >
        <div className="live-icon-wrapper">
          <Radio size={20} className="nav-icon" />
          <span className="live-pulse-dot"></span>
        </div>
        <span className="nav-label">{language === 'ru' ? 'Лайв' : language === 'de' ? 'Live' : language === 'es' ? 'En Vivo' : 'Live'}</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeCategory === 'Casino' ? 'active' : ''}`}
        onClick={() => setActiveCategory('Casino')}
      >
        <Sparkles size={20} className="nav-icon" />
        <span className="nav-label">{t('Casino', language)}</span>
      </button>

      <button 
        className="bottom-nav-item slip-toggle-item"
        onClick={toggleMobileSlip}
      >
        <div className="slip-icon-wrapper">
          <Receipt size={20} className="nav-icon" />
          {betSlipCount > 0 && <span className="bottom-slip-badge">{betSlipCount}</span>}
        </div>
        <span className="nav-label">{language === 'ru' ? 'Купон' : language === 'de' ? 'Wettschein' : language === 'es' ? 'Boleto' : 'Slip'}</span>
      </button>

      <button 
        className="bottom-nav-item"
        onClick={toggleMobileMenu}
      >
        <Menu size={20} className="nav-icon" />
        <span className="nav-label">{language === 'ru' ? 'Спорт А-З' : language === 'de' ? 'Sport A-Z' : language === 'es' ? 'Deportes' : 'Sports A-Z'}</span>
      </button>
    </nav>
  );
}
