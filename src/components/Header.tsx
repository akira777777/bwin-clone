import React from 'react';
import { Search, Menu, ShoppingCart, User, LogOut } from 'lucide-react';
import type { Category } from '../App';
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
  balance: number;
  onDeposit: (amount: number) => void;
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
  balance,
  onDeposit
}) => {
  const categories: Category[] = ['Sports', 'Live Betting', 'Virtuals', 'Casino', 'Live Casino', 'Poker'];

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-left">
          <button className="mobile-toggle-btn" onClick={toggleMobileMenu}>
            <Menu size={24} />
          </button>
          <div className="logo">
            <span style={{ color: 'var(--bwin-white)', fontWeight: 'bold', fontSize: '24px' }}>
              bwin<span style={{ color: 'var(--bwin-yellow)' }}>.</span>
            </span>
          </div>
        </div>
        
        <div className="header-right">
          {/* User Balance Pill */}
          <div className="balance-pill" key={balance}>
            <span className="balance-amount">€{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <button className="balance-deposit-btn" onClick={() => onDeposit(500)} title="Quick Deposit €500">+</button>
          </div>

          {isLoggedIn ? (
            <>
              <span 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  color: 'var(--bwin-gray-text)', 
                  fontSize: 13, 
                  marginRight: 6 
                }} 
                title={userEmail || undefined}
              >
                <User size={14} /> {userEmail ? userEmail.split('@')[0] : 'Account'}
              </span>
              <button 
                className="btn-login" 
                onClick={onLogout}
                style={{ padding: '6px 10px', fontSize: 12 }}
                aria-label="Log out"
              >
                <LogOut size={14} style={{ marginRight: 4 }} /> Log Out
              </button>
            </>
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
