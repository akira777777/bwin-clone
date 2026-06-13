import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, ShoppingCart, LogOut, Bell, ChevronDown, Award, DollarSign } from 'lucide-react';
import type { Category, AppNotification } from '../App';
import type { OddsFormat } from '../utils/betting';
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
  clearNotifications
}) => {
  const categories: Category[] = ['Sports', 'Live Betting', 'Virtuals', 'Casino', 'Live Casino', 'Poker'];

  // Dropdown open states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isOddsOpen, setIsOddsOpen] = useState(false);

  // Refs for clicking outside to close
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const oddsRef = useRef<HTMLDivElement>(null);

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
      if (oddsRef.current && !oddsRef.current.contains(target)) {
        setIsOddsOpen(false);
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

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left">
          <button className="mobile-toggle-btn" onClick={toggleMobileMenu}>
            <Menu size={24} />
          </button>
          <div className="logo" onClick={() => setActiveCategory('Sports')}>
            <span style={{ color: 'var(--bwin-white)', fontWeight: 'bold', fontSize: '24px' }}>
              bwin<span style={{ color: 'var(--bwin-yellow)' }}>.</span>
            </span>
          </div>
        </div>
        
        <div className="header-right">
          {/* Odds Format Dropdown */}
          <div className="header-dropdown-container" ref={oddsRef}>
            <button className="header-dropdown-trigger" onClick={() => setIsOddsOpen(!isOddsOpen)}>
              Odds: <span className="highlight-text">{oddsFormat === 'decimal' ? 'Dec' : oddsFormat === 'fractional' ? 'Frac' : 'Amer'}</span>
              <ChevronDown size={12} className="chevron-icon" />
            </button>
            {isOddsOpen && (
              <div className="header-dropdown-menu odds-menu animate-fade-in">
                <div 
                  className={`menu-item ${oddsFormat === 'decimal' ? 'active' : ''}`}
                  onClick={() => { setOddsFormat('decimal'); setIsOddsOpen(false); }}
                >
                  Decimal (e.g. 2.00)
                </div>
                <div 
                  className={`menu-item ${oddsFormat === 'fractional' ? 'active' : ''}`}
                  onClick={() => { setOddsFormat('fractional'); setIsOddsOpen(false); }}
                >
                  Fractional (e.g. 1/1)
                </div>
                <div 
                  className={`menu-item ${oddsFormat === 'american' ? 'active' : ''}`}
                  onClick={() => { setOddsFormat('american'); setIsOddsOpen(false); }}
                >
                  American (e.g. +100)
                </div>
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div className="header-dropdown-container" ref={languageRef}>
            <button className="header-dropdown-trigger lang-trigger" onClick={() => setIsLanguageOpen(!isLanguageOpen)}>
              <span className="lang-flag">{languages.find(l => l.code === language)?.flag || '🇬🇧'}</span>
              <span className="lang-code-text">{language.toUpperCase()}</span>
              <ChevronDown size={12} className="chevron-icon" />
            </button>
            {isLanguageOpen && (
              <div className="header-dropdown-menu lang-menu animate-fade-in">
                {languages.map(l => (
                  <div 
                    key={l.code}
                    className={`menu-item ${language === l.code ? 'active' : ''}`}
                    onClick={() => { setLanguage(l.code); setIsLanguageOpen(false); }}
                  >
                    <span className="lang-flag" style={{ marginRight: '8px' }}>{l.flag}</span>
                    <span>{l.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell Dropdown */}
          <div className="header-dropdown-container" ref={notificationsRef}>
            <button className="header-dropdown-trigger icon-btn bell-btn" onClick={handleNotificationClick}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {isNotificationsOpen && (
              <div className="header-dropdown-menu notifications-menu animate-fade-in">
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

          {/* User Balance Pill */}
          <div className="balance-pill" key={balance}>
            <span className="balance-amount">{`€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
            <button className="balance-deposit-btn" onClick={() => onDeposit(500)} title="Quick Deposit €500">+</button>
          </div>

          {/* Auth Section / Profile Dropdown */}
          {isLoggedIn ? (
            <div className="header-dropdown-container" ref={profileRef}>
              <button className="profile-trigger-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <div className="profile-avatar">{avatarChar}</div>
                <span className="profile-name">{emailPrefix}</span>
                <ChevronDown size={12} className="chevron-icon" />
              </button>
              
              {isProfileOpen && (
                <div className="header-dropdown-menu profile-menu animate-fade-in">
                  <div className="profile-menu-header">
                    <div className="profile-large-avatar">{avatarChar}</div>
                    <div className="profile-header-info">
                      <p className="profile-email" title={userEmail || undefined}>{userEmail}</p>
                      <div className="vip-badge-container">
                        <Award size={12} style={{ color: 'var(--bwin-yellow)' }} />
                        <span className="vip-badge">Silver VIP</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="vip-progress-section">
                    <div className="vip-progress-labels">
                      <span>Bronze</span>
                      <span>Silver</span>
                      <span>Gold</span>
                    </div>
                    <div className="vip-progress-bar-wrapper">
                      <div className="vip-progress-bar" style={{ width: '65%' }}></div>
                    </div>
                    <span className="vip-progress-subtext">350 points to Gold VIP status</span>
                  </div>

                  <div className="balance-breakdown">
                    <div className="balance-row">
                      <span>Real Balance:</span>
                      <span className="amount">{`€${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    </div>
                    <div className="balance-row">
                      <span>Bonus Balance:</span>
                      <span className="amount bonus-amount">€50.00</span>
                    </div>
                    <div className="balance-row">
                      <span>Pending Bets:</span>
                      <span className="amount pending-amount">€25.00</span>
                    </div>
                  </div>

                  <div className="profile-actions-list">
                    <button className="menu-action-btn deposit-btn" onClick={() => { onDeposit(500); setIsProfileOpen(false); }}>
                      <DollarSign size={14} /> Quick Deposit €500
                    </button>
                    <button className="menu-action-btn logout-btn" onClick={() => { if (onLogout) onLogout(); setIsProfileOpen(false); }}>
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={() => openAuthModal('login')}>Log In</button>
              <button className="btn-register" onClick={() => openAuthModal('register')}>Register</button>
            </>
          )}
          
          {/* Mobile bet slip toggle */}
          <button className="mobile-slip-btn" onClick={toggleMobileSlip}>
            <ShoppingCart size={20} />
            {betSlipCount > 0 && <span className="slip-badge">{betSlipCount}</span>}
          </button>
        </div>
      </div>
      
      <nav className="header-nav">
        <ul>
          {categories.map(category => (
            <li 
              key={category} 
              className={activeCategory === category ? 'active' : ''}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </li>
          ))}
        </ul>
        <div className="nav-search">
          <Search size={18} color="var(--bwin-gray-text)" />
        </div>
      </nav>
    </header>
  );
};

export default React.memo(Header);
