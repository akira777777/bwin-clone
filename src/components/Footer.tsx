import React from 'react';
import type { Category } from '../App';
import { t } from '../utils/i18n';
import './Footer.css';

interface FooterProps {
  setActiveCategory: (cat: Category) => void;
  setActiveFooterTab: (tab: string | null) => void;
  language?: string;
}

const Footer: React.FC<FooterProps> = ({ setActiveCategory, setActiveFooterTab, language = 'en' }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFooterLinkClick = (e: React.MouseEvent, tab: string) => {
    e.preventDefault();
    setActiveFooterTab(tab);
    scrollToTop();
  };

  const handleCategoryLinkClick = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    setActiveCategory(cat);
    scrollToTop();
  };

  // Local translations for Footer specific text
  const getFooterText = (key: string): string => {
    const dicts: Record<string, Record<string, string>> = {
      ru: {
        'About bwin': 'О bwin',
        'About Us': 'О нас',
        'Terms and Conditions': 'Правила и условия',
        'Privacy Policy': 'Политика конфиденциальности',
        'Cookie Policy': 'Политика файлов cookie',
        'Responsible Gaming': 'Ответственная игра',
        'Help & Support': 'Помощь и поддержка',
        'Help Center': 'Справочный центр',
        'Contact Us': 'Связаться с нами',
        'Deposits & Withdrawals': 'Депозиты и выводы',
        'Betting Rules': 'Правила ставок',
        'Sports & Betting': 'Спорт и ставки',
        'Secure Payment': 'Безопасная оплата',
        'disclaimer': '© 2026 bwin Interactive Entertainment AG. Все права защищены. Этот сайт является демонстрационной копией и не предназначен для игры на реальные деньги.'
      },
      de: {
        'About bwin': 'Über bwin',
        'About Us': 'Über uns',
        'Terms and Conditions': 'Allgemeine Geschäftsbedingungen',
        'Privacy Policy': 'Datenschutzrichtlinie',
        'Cookie Policy': 'Cookie-Richtlinie',
        'Responsible Gaming': 'Verantwortungsbewusstes Spielen',
        'Help & Support': 'Hilfe & Support',
        'Help Center': 'Hilfebereich',
        'Contact Us': 'Kontaktieren Sie uns',
        'Deposits & Withdrawals': 'Ein- & Auszahlungen',
        'Betting Rules': 'Wettregeln',
        'Sports & Betting': 'Sport & Wetten',
        'Secure Payment': 'Sichere Zahlung',
        'disclaimer': '© 2026 bwin Interactive Entertainment AG. Alle Rechte vorbehalten. Diese Website ist ein Demo-Klon. Keine echte Glücksspiel-Website.'
      },
      es: {
        'About bwin': 'Sobre bwin',
        'About Us': 'Sobre Nosotros',
        'Terms and Conditions': 'Términos y Condiciones',
        'Privacy Policy': 'Política de Privacidad',
        'Cookie Policy': 'Política de Cookies',
        'Responsible Gaming': 'Juego Responsable',
        'Help & Support': 'Ayuda y Soporte',
        'Help Center': 'Centro de Ayuda',
        'Contact Us': 'Contacto',
        'Deposits & Withdrawals': 'Depósitos y Retiros',
        'Betting Rules': 'Reglas de Apuestas',
        'Sports & Betting': 'Deportes y Apuestas',
        'Secure Payment': 'Pago Seguro',
        'disclaimer': '© 2026 bwin Interactive Entertainment AG. Todos los derechos reservados. Este sitio es un clon de demostración. No es un sitio de juego real.'
      }
    };
    return dicts[language]?.[key] || key;
  };

  return (
    <footer className="bwin-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>{getFooterText('About bwin')}</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'About Us')}>{getFooterText('About Us')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Terms and Conditions')}>{getFooterText('Terms and Conditions')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Privacy Policy')}>{getFooterText('Privacy Policy')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Cookie Policy')}>{getFooterText('Cookie Policy')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Responsible Gaming')}>{getFooterText('Responsible Gaming')}</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{getFooterText('Help & Support')}</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Help Center')}>{getFooterText('Help Center')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Contact Us')}>{getFooterText('Contact Us')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Deposits & Withdrawals')}>{getFooterText('Deposits & Withdrawals')}</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Betting Rules')}>{getFooterText('Betting Rules')}</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>{getFooterText('Sports & Betting')}</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Live Betting')}>{t('Live Betting', language)}</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Live Casino')}>{t('Live Casino', language)}</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Poker')}>{t('Poker', language)}</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Virtuals')}>{t('Virtuals', language)}</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="trust-badges">
          <span className="badge age-badge">18+</span>
          <span className="badge safe-badge">{getFooterText('Secure Payment')}</span>
        </div>
        <p className="copyright">
          {language === 'en' 
            ? '© 2026 bwin Interactive Entertainment AG. All rights reserved. This site is a demo clone. Not a real gambling site.' 
            : getFooterText('disclaimer')}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
