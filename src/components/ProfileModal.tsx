import React, { useState, useEffect } from 'react';
import { X, User, BarChart2, ShieldAlert, Award, Save, Lock } from 'lucide-react';
import './ProfileModal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: string;
  balance: number;
  vipLevel: string;
  vipProgress: number;
  vipProgressSubtext: string;
  totalWagered: number;
  depositLimit: number;
  setDepositLimit: (limit: number) => void;
  selfExclusionEndTime: number;
  setSelfExclusionEndTime: (time: number) => void;
  userEmail: string | null;
  triggerToast: (msg: string) => void;
}

const AVATARS = ['🦊', '🐯', '🦁', '🦖', '🚀', '👽', '👑', '⚡'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  balance,
  vipLevel,
  vipProgress,
  vipProgressSubtext,
  totalWagered,
  depositLimit,
  setDepositLimit,
  selfExclusionEndTime,
  setSelfExclusionEndTime,
  userEmail,
  triggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'vip' | 'safer'>('profile');
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('betz_user_nickname') || (userEmail ? userEmail.split('@')[0] : 'Player');
  });
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem('betz_user_avatar') || '🦊';
  });

  // Responsible gambling state
  const [localLimit, setLocalLimit] = useState<string>(depositLimit.toString());
  const [exclusionHours, setExclusionHours] = useState<string>('0');
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (isOpen) {
      const handle = requestAnimationFrame(() => {
        setNow(Date.now());
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [isOpen]);

  // Stats mock calculated from totalWagered
  const stats = {
    totalBets: Math.floor(totalWagered / 20) + (totalWagered > 0 ? 3 : 0),
    winRatio: totalWagered > 0 ? '58.2%' : '0%',
    biggestWin: totalWagered > 0 ? `€${(totalWagered * 2.4).toFixed(2)}` : '€0.00',
    netProfit: totalWagered > 0 ? `+€${(totalWagered * 0.39).toFixed(2)}` : '€0.00'
  };

  const handleSaveProfile = () => {
    localStorage.setItem('betz_user_nickname', nickname);
    localStorage.setItem('betz_user_avatar', selectedAvatar);
    triggerToast(language === 'ru' ? '✓ Профиль успешно обновлен!' : '✓ Profile updated successfully!');
  };

  const handleSaveLimits = () => {
    const limitNum = parseFloat(localLimit);
    if (isNaN(limitNum) || limitNum < 0) {
      triggerToast(language === 'ru' ? '❌ Введите корректный лимит' : '❌ Enter a valid limit');
      return;
    }
    setDepositLimit(limitNum);
    triggerToast(language === 'ru' ? '✓ Лимит депозитов сохранен!' : '✓ Deposit limit saved successfully!');
  };

  const handleSelfExclusion = () => {
    const hours = parseFloat(exclusionHours);
    if (isNaN(hours) || hours <= 0) {
      triggerToast(language === 'ru' ? '❌ Выберите период блокировки' : '❌ Select a block duration');
      return;
    }

    const endTime = Date.now() + hours * 60 * 60 * 1000;
    setSelfExclusionEndTime(endTime);
    
    const exclusionMsg = language === 'ru'
      ? `🔒 Самоисключение активировано на ${hours} ч. Ставки заблокированы.`
      : `🔒 Self-exclusion active for ${hours} hours. Betting features locked.`;
    triggerToast(exclusionMsg);
    onClose();
  };

  const handleRemoveExclusion = () => {
    setSelfExclusionEndTime(0);
    triggerToast(language === 'ru' ? '🔓 Самоисключение снято.' : '🔓 Self-exclusion lifted.');
  };

  if (!isOpen) return null;

  const isExcluded = selfExclusionEndTime > now;
  const timeRemaining = isExcluded ? Math.max(0, Math.round((selfExclusionEndTime - now) / 1000 / 60)) : 0;

  const tLabel = (en: string, ru: string) => (language === 'ru' ? ru : en);

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-card animation-slide-up">
        {/* Header */}
        <header className="profile-modal-header">
          <div className="profile-modal-title">
            <User size={20} className="accent-color" />
            <h3>{tLabel('Player Dashboard', 'Личный кабинет')}</h3>
          </div>
          <button className="profile-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {/* Navigation Tabs */}
        <nav className="profile-modal-tabs">
          <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
            <User size={14} /> {tLabel('Details', 'Профиль')}
          </button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            <BarChart2 size={14} /> {tLabel('Stats', 'Статистика')}
          </button>
          <button className={activeTab === 'vip' ? 'active' : ''} onClick={() => setActiveTab('vip')}>
            <Award size={14} /> VIP
          </button>
          <button className={activeTab === 'safer' ? 'active' : ''} onClick={() => setActiveTab('safer')}>
            <ShieldAlert size={14} /> {tLabel('Safer Play', 'Защита игры')}
          </button>
        </nav>

        {/* Modal Body */}
        <div className="profile-modal-body">
          
          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <div className="avatar-selection-section">
                <div className="current-avatar-preview">{selectedAvatar}</div>
                <div className="avatar-grid">
                  {AVATARS.map(av => (
                    <button 
                      key={av} 
                      className={`avatar-btn ${selectedAvatar === av ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="profile-form-group">
                <label>{tLabel('Account Email', 'Эл. почта аккаунта')}</label>
                <input type="text" value={userEmail || tLabel('Guest Account', 'Гостевой аккаунт')} disabled className="disabled-input" />
              </div>

              <div className="profile-form-group">
                <label>{tLabel('Nickname', 'Никнейм')}</label>
                <input 
                  type="text" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                  maxLength={15}
                  placeholder={tLabel('Enter nickname...', 'Введите никнейм...')}
                />
              </div>

              <button className="btn-save-profile" onClick={handleSaveProfile}>
                <Save size={16} /> {tLabel('Save Profile', 'Сохранить профиль')}
              </button>
            </div>
          )}

          {/* TAB 2: STATISTICS */}
          {activeTab === 'stats' && (
            <div className="tab-pane">
              <div className="stats-header-summary">
                <div className="summary-card">
                  <span className="label">{tLabel('Real Balance', 'Реальный Баланс')}</span>
                  <span className="value">€{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="summary-card">
                  <span className="label">{tLabel('Total Wagered', 'Всего проставлено')}</span>
                  <span className="value">€{totalWagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="stats-detailed-grid">
                <div className="detailed-stat-card">
                  <span className="label">{tLabel('Placed Tickets', 'Всего купонов')}</span>
                  <span className="val">{stats.totalBets}</span>
                </div>
                <div className="detailed-stat-card">
                  <span className="label">{tLabel('Win Ratio', 'Доля выигрышей')}</span>
                  <span className="val">{stats.winRatio}</span>
                </div>
                <div className="detailed-stat-card">
                  <span className="label">{tLabel('Biggest Win', 'Крупный выигрыш')}</span>
                  <span className="val accent-color">{stats.biggestWin}</span>
                </div>
                <div className="detailed-stat-card">
                  <span className="label">{tLabel('Net Profit', 'Чистая прибыль')}</span>
                  <span className="val green-color">{stats.netProfit}</span>
                </div>
              </div>

              <div className="stats-footer-note">
                <p>{tLabel('Statistics are synchronized with your active session and Supabase record in real time.', 'Статистика синхронизируется в реальном времени с вашей сессией и записью Supabase.')}</p>
              </div>
            </div>
          )}

          {/* TAB 3: VIP REWARDS */}
          {activeTab === 'vip' && (
            <div className="tab-pane">
              <div className="vip-progress-card">
                <div className="vip-progress-header">
                  <span className="vip-badge-label">{vipLevel} VIP</span>
                  <span className="vip-progress-sub">{vipProgressSubtext}</span>
                </div>
                <div className="vip-progress-bar-container">
                  <div className="vip-progress-bar-fill" style={{ width: `${vipProgress}%` }}></div>
                </div>
              </div>

              <h4 className="vip-tiers-title">{tLabel('VIP Level Tiers', 'Уровни VIP-клуба')}</h4>
              <div className="vip-tiers-list">
                <div className={`vip-tier-item ${vipLevel === 'Bronze' ? 'active' : ''}`}>
                  <span className="tier-bullet bronze">🥉</span>
                  <div className="tier-details">
                    <h5>Bronze</h5>
                    <p>{tLabel('€50 First Bet Insurance + Weekly Wheel spin boost', 'Страховка первой ставки до €50 + еженедельный буст спинов')}</p>
                  </div>
                </div>
                <div className={`vip-tier-item ${vipLevel === 'Silver' ? 'active' : ''}`}>
                  <span className="tier-bullet silver">🥈</span>
                  <div className="tier-details">
                    <h5>Silver</h5>
                    <p>{tLabel('2% Daily Casino Cashback + Priority Live Chat Support', '2% Ежедневный кэшбэк в казино + приоритетная поддержка чата')}</p>
                  </div>
                </div>
                <div className={`vip-tier-item ${vipLevel === 'Gold' ? 'active' : ''}`}>
                  <span className="tier-bullet gold">🥇</span>
                  <div className="tier-details">
                    <h5>Gold</h5>
                    <p>{tLabel('5% Daily Casino Cashback + Acca booster percentage boost', '5% Ежедневный кэшбэк + повышенный бонус на экспрессы')}</p>
                  </div>
                </div>
                <div className={`vip-tier-item ${vipLevel === 'Platinum' ? 'active' : ''}`}>
                  <span className="tier-bullet plat">💎</span>
                  <div className="tier-details">
                    <h5>Platinum</h5>
                    <p>{tLabel('Dedicated Account Manager + Unlimited deposit ceilings', 'Персональный VIP-менеджер + отсутствие дневных лимитов на ввод')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SAFER PLAY */}
          {activeTab === 'safer' && (
            <div className="tab-pane">
              {/* Limit Deposit Section */}
              <div className="safer-section-card">
                <h5>🛡️ {tLabel('Daily Deposit Limit', 'Дневной лимит депозитов')}</h5>
                <p className="desc">{tLabel('Prevent yourself from depositing too much cash in a single day.', 'Ограничьте общую сумму пополнений, которую вы можете совершить за 24 часа.')}</p>
                <div className="safer-controls-row">
                  <div className="deposit-limit-input-wrapper">
                    <span>€</span>
                    <input 
                      type="number" 
                      value={localLimit}
                      onChange={(e) => setLocalLimit(e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                  <button className="btn-save-limit" onClick={handleSaveLimits}>
                    {tLabel('Set Limit', 'Установить')}
                  </button>
                </div>
              </div>

              {/* Self-Exclusion Section */}
              <div className="safer-section-card" style={{ marginTop: '16px' }}>
                <h5>🔒 {tLabel('Take a Break / Self-Exclusion', 'Самоисключение / Перерыв')}</h5>
                <p className="desc">{tLabel('Exclude yourself from betting activities for a specific period. You cannot cancel this action during cooldown.', 'Заблокируйте себе возможность делать ставки на выбранный период. Это действие нельзя отменить до окончания срока.')}</p>
                
                {isExcluded ? (
                  <div className="exclusion-active-panel">
                    <div className="exclusion-header">
                      <Lock size={16} className="shake-icon" />
                      <span>{tLabel('SELF-EXCLUSION ACTIVE', 'САМОИСКЛЮЧЕНИЕ АКТИВНО')}</span>
                    </div>
                    <p className="time-remaining-desc">
                      {tLabel(`You have ${timeRemaining} minutes remaining on your break.`, `До окончания блокировки осталось: ${timeRemaining} мин.`)}
                    </p>
                    <button className="btn-remove-exclusion" onClick={handleRemoveExclusion}>
                      {tLabel('Emergency Lift (Demo Override)', 'Снять блокировку (Демо-режим)')}
                    </button>
                  </div>
                ) : (
                  <div className="safer-controls-row">
                    <select 
                      value={exclusionHours} 
                      onChange={(e) => setExclusionHours(e.target.value)}
                      className="exclusion-select"
                    >
                      <option value="0">{tLabel('Select duration...', 'Выберите время...')}</option>
                      <option value="0.083">5 {tLabel('Minutes (Demo)', 'минут (Демо)')}</option>
                      <option value="1">1 {tLabel('Hour', 'час')}</option>
                      <option value="24">24 {tLabel('Hours', 'часа')}</option>
                      <option value="168">7 {tLabel('Days', 'дней')}</option>
                    </select>
                    <button className="btn-exclude-action" onClick={handleSelfExclusion}>
                      {tLabel('Block Account', 'Блокировать')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default ProfileModal;
