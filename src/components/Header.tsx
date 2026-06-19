import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, ShoppingCart, LogOut, Bell, ChevronDown, Award, DollarSign } from 'lucide-react';
import type { Category, AppNotification, Sport } from '../App';
import type { OddsFormat } from '../utils/betting';
import { t } from '../utils/i18n';
import CryptoDeposit from './CryptoDeposit';
import './Header.css';

interface HeaderProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  openAuthModal: (type: 'login' | 'register') => void;
  toggleMobileMenu: () => void;
  toggleMobileSlip: () => void;
  betSlipCount: number;
  isLoggedIn?: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
  balance?: number;
  onDeposit?: (amount: number) => void;
  oddsFormat: OddsFormat;
  setOddsFormat: (format: OddsFormat) => void;
  language: string;
  setLanguage: (lang: string) => void;
  notifications: AppNotification[];
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  onLogoClick: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  activeSport?: Sport;
  setActiveSport?: (sport: Sport) => void;
  vipLevel?: string;
  vipProgress?: number;
  vipProgressSubtext?: string;
  onOpenDailyWheel?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeCategory, 
  setActiveCategory, 
  openAuthModal,
  toggleMobileMenu,
  toggleMobileSlip,
  betSlipCount,
  isLoggedIn = false,
  userEmail,
  onLogout,
  balance = 1000,
  onDeposit = () => {},
  oddsFormat,
  setOddsFormat,
  language,
  setLanguage,
  notifications,
  markNotificationsAsRead,
  clearNotifications,
  onLogoClick,
  searchQuery = '',
  setSearchQuery = () => {},
  activeSport = 'Football',
  setActiveSport,
  vipLevel = 'Bronze',
  vipProgress = 0,
  vipProgressSubtext = '',
  onOpenDailyWheel = () => {}
}) => {
  // Deposit modal state
  const [isCryptoDepositOpen, setIsCryptoDepositOpen] = useState(false);

  // Dropdown open states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isOddsFormatOpen, setIsOddsFormatOpen] = useState(false);

  // Refs for clicking outside to close
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const oddsFormatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
      if (oddsFormatRef.current && !oddsFormatRef.current.contains(target)) {
        setIsOddsFormatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      markNotificationsAsRead();
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const emailPrefix = userEmail ? userEmail.split('@')[0] : 'Account';
  const avatarChar = emailPrefix.charAt(0).toUpperCase();
  const unreadCount = notifications.filter(n => !n.read).length;
  const isSportsCategory = activeCategory === 'Sports' || activeCategory === 'Live Betting';

  // Handles clicking a sport or category in the second row Category Bar
  const handleCategoryItemClick = (type: 'live' | 'sport' | 'category' | 'boosted', value?: string) => {
    if (type === 'live') {
      setActiveCategory('Live Betting');
    } else if (type === 'sport' && value && setActiveSport) {
      setActiveCategory('Sports');
      setActiveSport(value as Sport);
    } else if (type === 'category' && value) {
      setActiveCategory(value as Category);
    } else if (type === 'boosted') {
      setActiveCategory('Sports');
      if (setActiveSport) {
        setActiveSport('Football'); // Or highlight special boosted odds
      }
    }
  };

  return (
    <>
    <header className="header">
      {/* Row 1: Logo, Nav Links, Search, Balance, Dropdowns, Auth */}
      <div className="header-top">
        <div className="header-top-inner">
          <div className="header-left">
            {isSportsCategory && (
              <button className="mobile-toggle-btn" onClick={toggleMobileMenu}>
                <Menu size={20} />
              </button>
            )}
            
            <div className="logo" onClick={onLogoClick}>
              <div className="logo-icon-box">B</div>
              <span className="logo-text">BETZ<span className="logo-dot">.</span></span>
            </div>

            <nav className="top-nav">
              <div 
                className={`top-nav-link ${activeCategory === 'Sports' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Sports')}
              >
                {t('Sports', language)}
              </div>
              <div 
                className={`top-nav-link ${activeCategory === 'Live Betting' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Live Betting')}
              >
                <span className="pulse-dot"></span>
                {t('Live', language)}
              </div>
              <div 
                className={`top-nav-link ${activeCategory === 'Casino' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Casino')}
              >
                {t('Casino', language)}
              </div>
              <div 
                className={`top-nav-link ${activeCategory === 'Live Casino' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Live Casino')}
              >
                {t('Live Casino', language)}
              </div>
              <div 
                className={`top-nav-link ${activeCategory === 'Poker' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Poker')}
              >
                {t('Poker', language)}
              </div>
              <div 
                className={`top-nav-link ${activeCategory === 'Virtuals' ? 'active' : ''}`}
                onClick={() => setActiveCategory('Virtuals')}
              >
                {t('Virtuals', language)}
              </div>
            </nav>
          </div>

        {/* Search Input */}
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input 
            type="text" 
            placeholder={t('Search events...', language)} 
            className="header-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="header-right">
          {/* Language Dropdown */}
          <div className="header-dropdown-container" ref={languageRef}>
            <button className="header-dropdown-trigger lang-trigger" onClick={() => setIsLanguageOpen(!isLanguageOpen)}>
              <span className="lang-flag">{languages.find(l => l.code === language)?.flag || '🇬🇧'}</span>
              <span className="lang-code-text">{language.toUpperCase()}</span>
              <ChevronDown size={12} className="chevron-icon" />
            </button>
            {isLanguageOpen && (
              <div className="header-dropdown-menu lang-menu">
                {languages.map(l => (
                  <div 
                    key={l.code}
                    className={`menu-item ${language === l.code ? 'active' : ''}`}
                    onClick={() => { setLanguage(l.code); setIsLanguageOpen(false); }}
                  >
                    <span className="lang-flag">{l.flag}</span>
                    <span style={{ marginLeft: '8px' }}>{l.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Odds Format Dropdown */}
          <div className="header-dropdown-container" ref={oddsFormatRef}>
            <button className="header-dropdown-trigger odds-trigger" onClick={() => setIsOddsFormatOpen(!isOddsFormatOpen)}>
              <span className="odds-code-text">{oddsFormat.toUpperCase()}</span>
              <ChevronDown size={12} className="chevron-icon" />
            </button>
            {isOddsFormatOpen && (
              <div className="header-dropdown-menu odds-menu">
                {(['decimal', 'fractional', 'american'] as OddsFormat[]).map(format => (
                  <div 
                    key={format}
                    className={`menu-item ${oddsFormat === format ? 'active' : ''}`}
                    onClick={() => { setOddsFormat(format); setIsOddsFormatOpen(false); }}
                  >
                    <span>{format.charAt(0).toUpperCase() + format.slice(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell Dropdown */}
          <div className="header-dropdown-container" ref={notificationsRef}>
            <button className="header-action-btn bell-btn" onClick={handleNotificationClick}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isNotificationsOpen && (
              <div className="header-dropdown-menu notifications-menu">
                <div className="notifications-header">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button className="clear-btn" onClick={() => { clearNotifications(); setIsNotificationsOpen(false); }}>
                      Clear All
                    </button>
                  )}
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notifications-empty">No notifications</div>
                  ) : (
                    notifications.map(n => {
                      let emoji = '📢';
                      if (n.type === 'goal') emoji = '⚽';
                      else if (n.type === 'bet_won') emoji = '🏆';
                      else if (n.type === 'bet_lost') emoji = '❌';
                      else if (n.type === 'deposit') emoji = '💰';
                      return (
                        <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                          <span className="notification-icon">{emoji}</span>
                          <div className="notification-content">
                            <p className="notification-msg">{n.message}</p>
                            <span className="notification-time">{n.time}</span>
                          </div>
                          {!n.read && <span className="unread-dot"></span>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Daily Spin Button */}
          {isLoggedIn && (
            <button 
              className="daily-wheel-trigger-btn"
              onClick={onOpenDailyWheel}
              style={{
                background: 'linear-gradient(135deg, var(--betz-gold) 0%, #d4951b 100%)',
                color: '#000',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginRight: '12px',
                boxShadow: '0 0 10px rgba(244, 183, 64, 0.2)',
                transition: 'all 0.25s'
              }}
            >
              🎡 {language === 'ru' ? 'Колесо' : 'Daily Spin'}
            </button>
          )}

          {/* User Balance Pill & Deposit Button */}
          <div className="balance-container">
            <div className="balance-widget" key={balance}>
              <div className="balance-info">
                <span className="balance-label">Balance</span>
                <span className="balance-val">{`€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              </div>
              <button className="header-deposit-btn" onClick={() => setIsCryptoDepositOpen(true)}>
                {language === 'ru' ? 'Депозит' : language === 'de' ? 'Einzahlung' : language === 'es' ? 'Depósito' : 'Deposit'}
              </button>
            </div>
          </div>

          {/* User Profile / Auth */}
          {isLoggedIn ? (
            <div className="header-dropdown-container profile-container" ref={profileRef}>
              <button className="profile-trigger-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="profile-avatar">{avatarChar}</div>
                <span className="profile-name">{emailPrefix}</span>
                <ChevronDown size={12} className="chevron-icon" />
              </button>
              
              {isProfileOpen && (
                <div className="header-dropdown-menu profile-menu">
                  <div className="profile-menu-header">
                    <div className="profile-large-avatar">{avatarChar}</div>
                    <div className="profile-header-info">
                      <p className="profile-email" title={userEmail || undefined}>{userEmail}</p>
                      <div className="vip-badge-container">
                        <Award size={12} style={{ color: 'var(--betz-accent)' }} />
                        <span className="vip-badge">{vipLevel} VIP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="vip-progress-section">
                    <div className="vip-progress-labels">
                      <span>Bronze</span>
                      <span>Silver</span>
                      <span>Gold</span>
                      <span>Plat</span>
                    </div>
                    <div className="vip-progress-bar-wrapper">
                      <div className="vip-progress-bar" style={{ width: `${vipProgress}%` }}></div>
                    </div>
                    <span className="vip-progress-subtext">{vipProgressSubtext}</span>
                  </div>

                  <div className="balance-breakdown">
                    <div className="balance-row">
                      <span>{t('Real Balance', language)}:</span>
                      <span className="amount">{`€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    </div>
                    <div className="balance-row">
                      <span>{t('Bonus Balance', language)}:</span>
                      <span className="amount bonus-amount">€50.00</span>
                    </div>
                    <div className="balance-row">
                      <span>{t('Pending Bets', language)}:</span>
                      <span className="amount pending-amount">€25.00</span>
                    </div>
                  </div>

                  <div className="profile-actions-list">
                    <button className="menu-action-btn deposit-btn" onClick={() => { setIsCryptoDepositOpen(true); setIsProfileOpen(false); }}>
                      <DollarSign size={14} /> {t('Crypto Deposit', language)}
                    </button>
                    <button className="menu-action-btn logout-btn" onClick={() => { if (onLogout) onLogout(); setIsProfileOpen(false); }}>
                      <LogOut size={14} /> {t('Log Out', language)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={() => openAuthModal('login')}>{t('Log In', language)}</button>
              <button className="btn-register" onClick={() => openAuthModal('register')}>{t('Register', language)}</button>
            </>
          )}
          
          {/* Mobile bet slip toggle */}
          {isSportsCategory && (
            <button className="mobile-slip-btn" onClick={toggleMobileSlip}>
              <ShoppingCart size={20} />
              {betSlipCount > 0 && <span className="slip-badge">{betSlipCount}</span>}
            </button>
          )}
        </div>
      </div>
      </div>
      
      {/* Row 2: Category bar */}
      {isSportsCategory && (
        <nav className="category-bar">
          <div className="category-bar-inner">
            <ul className="category-list">
            <li 
              className={`category-item live-category ${activeCategory === 'Live Betting' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('live')}
            >
              Live Betting <span className="category-live-badge">24</span>
            </li>
            <li 
              className={`category-item ${activeCategory === 'Sports' && activeSport === 'Football' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('sport', 'Football')}
            >
              {t('Football', language)}
            </li>
            <li 
              className={`category-item ${activeCategory === 'Sports' && activeSport === 'Tennis' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('sport', 'Tennis')}
            >
              {t('Tennis', language)}
            </li>
            <li 
              className={`category-item ${activeCategory === 'Sports' && activeSport === 'Basketball' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('sport', 'Basketball')}
            >
              {t('Basketball', language)}
            </li>
            <li 
              className={`category-item ${activeCategory === 'Sports' && activeSport === 'MMA' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('sport', 'MMA')}
            >
              Esports
            </li>
            <li 
              className={`category-item ${(activeCategory as string) === 'Casino' ? 'active' : ''}`}
              onClick={() => handleCategoryItemClick('category', 'Casino')}
            >
              {t('Casino', language)}
            </li>
            <li 
              className={`category-item`}
              onClick={() => handleCategoryItemClick('boosted')}
            >
              Boosted
            </li>
          </ul>
          </div>
        </nav>
      )}
    </header>
    {isCryptoDepositOpen && (
      <CryptoDeposit
        onDeposit={onDeposit}
        onClose={() => setIsCryptoDepositOpen(false)}
        language={language}
      />
    )}
    </>
  );
};

export default React.memo(Header);
