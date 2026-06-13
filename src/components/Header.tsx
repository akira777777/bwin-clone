import React from 'react';
import { Search, Menu, ShoppingCart } from 'lucide-react';
import type { Category } from '../App';
import './Header.css';

interface HeaderProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
  openAuthModal: (type: 'login' | 'register') => void;
  toggleMobileMenu: () => void;
  toggleMobileSlip: () => void;
  betSlipCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
  activeCategory, 
  setActiveCategory, 
  openAuthModal,
  toggleMobileMenu,
  toggleMobileSlip,
  betSlipCount
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
          <button className="btn-login" onClick={() => openAuthModal('login')}>Log In</button>
          <button className="btn-register" onClick={() => openAuthModal('register')}>Register</button>
          
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
