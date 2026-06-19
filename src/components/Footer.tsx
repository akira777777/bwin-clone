import React from 'react';
import { Lock } from 'lucide-react';
import type { Category } from '../App';
import './Footer.css';

interface FooterProps {
  setActiveCategory: (cat: Category) => void;
  setActiveFooterTab: (tab: string | null) => void;
  language?: string;
}

const Footer: React.FC<FooterProps> = (props) => {
  const { setActiveFooterTab, language = 'en' } = props;
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFooterLinkClick = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    setActiveFooterTab(tab);
    scrollToTop();
  };

  // Local translations for Footer specific text
  const getFooterText = (key: string): string => {
    const dicts: Record<string, Record<string, string>> = {
      ru: {
        'About Us': 'О нас',
        'Terms and Conditions': 'Правила и условия',
        'Privacy Policy': 'Политика конфиденциальности',
        'Cookie Policy': 'Политика файлов cookie',
        'Responsible Gaming': 'Ответственная игра',
        'Help Center': 'Справочный центр',
        'Contact Us': 'Связаться с нами',
        'Deposits & Withdrawals': 'Депозиты и выводы',
        'Betting Rules': 'Правила ставок',
        'SSL Secured': 'SSL Защищено',
        'MGA Licensed': 'MGA Лицензировано',
        'disclaimer': '© 2026 BETZ Sportsbook. Все права защищены. Только 18+. Азартные игры несут в себе риски — играйте ответственно. Лицензировано Malta Gaming Authority (MGA/B2C/394/2017). BeGambleAware.org'
      },
      de: {
        'About Us': 'Über uns',
        'Terms and Conditions': 'Allgemeine Geschäftsbedingungen',
        'Privacy Policy': 'Datenschutzrichtlinie',
        'Cookie Policy': 'Cookie-Richtlinie',
        'Responsible Gaming': 'Verantwortungsbewusstes Spielen',
        'Help Center': 'Hilfebereich',
        'Contact Us': 'Kontaktieren Sie uns',
        'Deposits & Withdrawals': 'Ein- & Auszahlungen',
        'Betting Rules': 'Wettregeln',
        'SSL Secured': 'SSL Verschlüsselt',
        'MGA Licensed': 'MGA Lizenziert',
        'disclaimer': '© 2026 BETZ Sportsbook. Alle Rechte vorbehalten. Nur ab 18 Jahren. Glücksspiel birgt Risiken — spielen Sie verantwortungsbewusst. Lizenziert durch die Malta Gaming Authority (MGA/B2C/394/2017). BeGambleAware.org'
      },
      es: {
        'About Us': 'Sobre Nosotros',
        'Terms and Conditions': 'Términos y Condiciones',
        'Privacy Policy': 'Política de Privacidad',
        'Cookie Policy': 'Política de Cookies',
        'Responsible Gaming': 'Juego Responsable',
        'Help Center': 'Centro de Ayuda',
        'Contact Us': 'Contacto',
        'Deposits & Withdrawals': 'Depósitos y Retiros',
        'Betting Rules': 'Reglas de Apuestas',
        'SSL Secured': 'SSL Seguro',
        'MGA Licensed': 'MGA Licenciado',
        'disclaimer': '© 2026 BETZ Sportsbook. Todos los derechos reservados. Solo mayores de 18 años. El juego conlleva riesgos — juegue con responsabilidad. Licenciado por la Autoridad de Juegos de Malta (MGA/B2C/394/2017). BeGambleAware.org'
      }
    };
    return dicts[language]?.[key] || key;
  };

  const disclaimerText = language === 'en'
    ? '© 2026 BETZ Sportsbook. All rights reserved. 18+ only. Gambling involves risk — please gamble responsibly. Licensed by the Malta Gaming Authority (MGA/B2C/394/2017). BeGambleAware.org'
    : getFooterText('disclaimer');

  return (
    <footer className="betz-footer">
      {/* Top Row: Links */}
      <div className="footer-links-row">
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'About Us')}>{getFooterText('About Us')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Terms and Conditions')}>{getFooterText('Terms and Conditions')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Privacy Policy')}>{getFooterText('Privacy Policy')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Cookie Policy')}>{getFooterText('Cookie Policy')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Responsible Gaming')}>{getFooterText('Responsible Gaming')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Help Center')}>{getFooterText('Help Center')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Contact Us')}>{getFooterText('Contact Us')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Deposits & Withdrawals')}>{getFooterText('Deposits & Withdrawals')}</a>
        <a href="#" onClick={(e) => handleFooterLinkClick(e, 'Betting Rules')}>{getFooterText('Betting Rules')}</a>
      </div>

      {/* Bottom Row: Badges and Disclaimer */}
      <div className="footer-bottom-row">
        <div className="footer-left-side">
          <div className="ssl-secured-badge">
            <Lock size={13} />
            <span>{getFooterText('SSL Secured')}</span>
          </div>
          <span className="mga-badge">{getFooterText('MGA Licensed')}</span>
          <div className="age-badge-18">18+</div>
        </div>
        <div className="footer-disclaimer-box">
          {disclaimerText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
