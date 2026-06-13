import React from 'react';
import { X, Gift } from 'lucide-react';
import { t } from '../utils/i18n';
import './WelcomePopup.css';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  openRegister: () => void;
  language?: string;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose, openRegister, language = 'en' }) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    onClose();
    openRegister();
  };

  const getBodyText = () => {
    switch (language) {
      case 'ru':
        return {
          badge: 'Эксклюзивное предложение',
          title: 'Страховка первой ставки до $50',
          desc: 'Добро пожаловать в новый bwin! Зарегистрируйтесь сейчас и получите 100% страховку на вашу первую ставку. Если она проиграет, мы вернем ставку в виде фрибета.',
          btn: 'Получить бонус и начать',
          terms: '*Применяются правила и условия. Только для новых игроков.',
        };
      case 'de':
        return {
          badge: 'Exklusives Angebot',
          title: 'Erste Wette versichert bis $50',
          desc: 'Willkommen beim neuen bwin! Registrieren Sie sich jetzt und sichern Sie sich eine 100%ige Absicherung auf Ihre erste Wette. Wenn sie verliert, erstatten wir Ihnen Ihren Einsatz als Freiwette.',
          btn: 'Bonus sichern & starten',
          terms: '*Es gelten die AGB. Nur für neue Spieler.',
        };
      case 'es':
        return {
          badge: 'Oferta Exclusiva',
          title: 'Seguro de primera apuesta hasta $50',
          desc: '¡Bienvenido al nuevo bwin! Regístrese ahora y obtenga un seguro del 100% en su primera apuesta. Si pierde, le reembolsaremos su importe como una apuesta gratuita.',
          btn: 'Reclamar bono y comenzar',
          terms: '*Se aplican términos y condiciones. Solo nuevos jugadores.',
        };
      default:
        return {
          badge: 'Exclusive Offer',
          title: 'First Bet Insurance up to $50',
          desc: 'Welcome to the new bwin! Register now and get 100% insurance on your first bet. If it loses, we will refund your stake as a Free Bet.',
          btn: 'Claim Bonus & Start',
          terms: '*Terms and conditions apply. New players only.',
        };
    }
  };

  const text = getBodyText();

  return (
    <div className="welcome-popup-overlay" onClick={onClose}>
      <div className="welcome-popup-content" onClick={e => e.stopPropagation()}>
        <button className="welcome-popup-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="welcome-popup-image">
          <div className="welcome-popup-icon-wrapper">
            <Gift size={48} className="gift-icon" />
          </div>
        </div>
        
        <div className="welcome-popup-body">
          <div className="welcome-badge">{text.badge}</div>
          <h2>{text.title}</h2>
          <p>{text.desc}</p>
          <button className="welcome-popup-btn" onClick={handleClaim}>
            {text.btn}
          </button>
          <div className="welcome-popup-terms">
            {text.terms}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
