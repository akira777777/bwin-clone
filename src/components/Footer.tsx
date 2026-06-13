import React from 'react';
import type { Category } from '../App';
import './Footer.css';

interface FooterProps {
  setActiveCategory: (cat: Category) => void;
  setActiveFooterTab: (tab: string | null) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveCategory, setActiveFooterTab }) => {
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

  return (
    <footer className="bwin-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About bwin</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'About Us')}>About Us</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Terms and Conditions')}>Terms and Conditions</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Privacy Policy')}>Privacy Policy</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Cookie Policy')}>Cookie Policy</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Responsible Gaming')}>Responsible Gaming</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Help & Support</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Help Center')}>Help Center</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Contact Us')}>Contact Us</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Deposits & Withdrawals')}>Deposits & Withdrawals</a></li>
            <li><a href="#" onClick={(e) => handleFooterLinkClick(e, 'Betting Rules')}>Betting Rules</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Sports & Betting</h4>
          <ul>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Live Betting')}>Live Betting</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Live Casino')}>Live Casino</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Poker')}>Poker</a></li>
            <li><a href="#" onClick={(e) => handleCategoryLinkClick(e, 'Virtuals')}>Virtuals</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="trust-badges">
          <span className="badge age-badge">18+</span>
          <span className="badge safe-badge">Secure Payment</span>
        </div>
        <p className="copyright">
          © 2026 bwin Interactive Entertainment AG. All rights reserved. 
          This site is a demo clone. Not a real gambling site.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
