import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bwin-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About bwin</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>About Us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Terms and Conditions</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Privacy Policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Cookie Policy</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Responsible Gaming</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Help & Support</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Help Center</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Contact Us</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Deposits & Withdrawals</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Betting Rules</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Sports & Betting</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Live Betting</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Live Casino</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Poker</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Virtuals</a></li>
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
