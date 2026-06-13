import React from 'react';
import { X, Gift } from 'lucide-react';
import './WelcomePopup.css';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
  openRegister: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose, openRegister }) => {
  if (!isOpen) return null;

  const handleClaim = () => {
    onClose();
    openRegister();
  };

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
          <div className="welcome-badge">Exclusive Offer</div>
          <h2>First Bet Insurance up to $50</h2>
          <p>
            Welcome to the new bwin! Register now and get 100% insurance on your first bet. If it loses, we will refund your stake as a Free Bet.
          </p>
          <button className="welcome-popup-btn" onClick={handleClaim}>
            Claim Bonus & Start
          </button>
          <div className="welcome-popup-terms">
            *Terms and conditions apply. New players only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;
