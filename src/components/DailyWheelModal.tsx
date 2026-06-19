import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, Clock } from 'lucide-react';
import './DailyWheelModal.css';

interface DailyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  updateBalance: (amount: number) => void;
  language?: string;
  triggerToast: (msg: string, type?: 'goal' | 'bet_won' | 'bet_lost' | 'deposit' | 'system') => void;
}

interface WheelSegment {
  label: string;
  value: number;
  color: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '€1.00', value: 1.0, color: '#1B232B' },
  { label: '€5.00', value: 5.0, color: '#F4B740' },
  { label: '€0.50', value: 0.5, color: '#13171C' },
  { label: '€10.00', value: 10.0, color: '#C2F95A' },
  { label: '€2.00', value: 2.0, color: '#1B232B' },
  { label: '€25.00', value: 25.0, color: '#34D399' },
  { label: '€0.20', value: 0.2, color: '#13171C' },
  { label: '€50.00', value: 50.0, color: '#FF5656' },
];

export const DailyWheelModal: React.FC<DailyWheelModalProps> = ({
  isOpen,
  onClose,
  balance,
  updateBalance,
  language = 'en',
  triggerToast
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<WheelSegment | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [canSpin, setCanSpin] = useState(true);

  const checkSpinAvailability = () => {
    const lastSpin = localStorage.getItem('betz_last_wheel_spin');
    if (lastSpin) {
      const lastSpinTime = parseInt(lastSpin);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (now - lastSpinTime < oneDayMs) {
        setCanSpin(false);
        const diff = oneDayMs - (now - lastSpinTime);
        const hours = Math.floor(diff / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        setTimeRemaining(`${hours}h ${minutes}m`);
        return;
      }
    }
    setCanSpin(true);
    setTimeRemaining('');
  };

  useEffect(() => {
    if (isOpen) {
      const initTimer = setTimeout(() => {
        checkSpinAvailability();
      }, 0);
      return () => clearTimeout(initTimer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!canSpin && isOpen) {
      const timer = setInterval(() => {
        checkSpinAvailability();
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [canSpin, isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;

    setIsSpinning(true);
    setPrize(null);

    // Select a random segment
    const segmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const winningSegment = SEGMENTS[segmentIndex];
    
    // Each segment takes 360 / 8 = 45 degrees.
    // To align the winning segment with the pointer (top center, 0 degrees):
    // Segment 0 center is at angle 0. Segment 1 is at 45, etc.
    // The rotation formula needs to offset this so the selected segment stops at the top.
    const segmentAngle = 360 / SEGMENTS.length;
    const targetAngle = 360 - (segmentIndex * segmentAngle);
    
    // Rotate 5 full turns + target angle
    const newRotation = rotation + (360 * 5) + targetAngle - (rotation % 360);
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setPrize(winningSegment);
      updateBalance(balance + winningSegment.value);
      localStorage.setItem('betz_last_wheel_spin', Date.now().toString());
      setCanSpin(false);
      checkSpinAvailability();
      
      const prizeText = language === 'ru' 
        ? `🎉 Вы выиграли €${winningSegment.value.toFixed(2)} на баланс!`
        : `🎉 You won €${winningSegment.value.toFixed(2)} added to your balance!`;
      triggerToast(prizeText, 'deposit');
    }, 4000);
  };

  // Helper for rendering segment paths
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="wheel-modal-overlay">
      <div className="wheel-modal-card animation-slide-up">
        <header className="wheel-modal-header">
          <div className="wheel-header-title">
            <Sparkles size={20} className="wheel-sparkle-icon" />
            <h3>{language === 'ru' ? 'Ежедневный Спин' : 'Daily Reward Wheel'}</h3>
          </div>
          <button className="wheel-close-btn" onClick={onClose} disabled={isSpinning}>
            <X size={20} />
          </button>
        </header>

        <div className="wheel-modal-body">
          <p className="wheel-subtitle">
            {language === 'ru' 
              ? 'Испытайте удачу раз в 24 часа и получите бесплатные средства на баланс!' 
              : 'Spin the wheel once every 24 hours to win free balance boosts!'}
          </p>

          <div className="wheel-visual-container">
            {/* The Pointer */}
            <div className="wheel-pointer"></div>

            {/* The Wheel */}
            <div 
              className="wheel-outer"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none'
              }}
            >
              <svg viewBox="-1 -1 2 2" className="wheel-svg">
                {SEGMENTS.map((seg, idx) => {
                  const percent = 1 / SEGMENTS.length;
                  const startPercent = idx * percent;
                  const endPercent = startPercent + percent;
                  const [startX, startY] = getCoordinatesForPercent(startPercent);
                  const [endX, endY] = getCoordinatesForPercent(endPercent);
                  const largeArcFlag = percent > 0.5 ? 1 : 0;
                  
                  // Label rotation: centered in the middle of the segment
                  const middlePercent = startPercent + (percent / 2);
                  const angleDeg = middlePercent * 360 - 90; // offset SVG starting position

                  return (
                    <g key={idx}>
                      <path 
                        d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                        fill={seg.color}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="0.015"
                      />
                      <text
                        x="0.65"
                        y="0.05"
                        transform={`rotate(${angleDeg})`}
                        fill={seg.color === '#C2F95A' ? '#000' : '#EAEEF3'}
                        fontSize="0.12"
                        fontWeight="800"
                        textAnchor="middle"
                        className="segment-text"
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center cap */}
                <circle cx="0" cy="0" r="0.18" fill="var(--betz-bg)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.02" />
              </svg>
            </div>
          </div>

          <div className="wheel-controls">
            {prize && (
              <div className="wheel-prize-announcement animation-pulse">
                <Trophy className="prize-icon" size={24} />
                <span>
                  {language === 'ru' ? 'Выигрыш:' : 'Prize:'} <strong>€{prize.value.toFixed(2)}</strong>
                </span>
              </div>
            )}

            {canSpin ? (
              <button 
                className="btn-spin-wheel" 
                onClick={handleSpin}
                disabled={isSpinning}
              >
                {isSpinning ? (language === 'ru' ? 'Крутим...' : 'Spinning...') : (language === 'ru' ? 'Крутить!' : 'Spin Now')}
              </button>
            ) : (
              <div className="wheel-cooldown-indicator">
                <Clock size={16} />
                <span>
                  {language === 'ru' ? 'Следующий спин через:' : 'Next spin in:'} <strong>{timeRemaining}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
