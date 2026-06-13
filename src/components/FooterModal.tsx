import React, { useState, useEffect } from 'react';
import './FooterModal.css';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const FAQs: FAQ[] = [
  { q: 'How do I withdraw my winnings?', a: 'Go to your account menu, select "Withdrawal", choose your preferred payment method, enter the amount, and confirm. Processing times range from instant (e-wallets) to 3-5 business days (bank transfer).', category: 'payments' },
  { q: 'How long does a deposit take?', a: 'Most deposit methods (credit cards, PayPal, Skrill, Neteller) are processed instantly. Bank transfers may take 1-3 business days.', category: 'payments' },
  { q: 'What is a Multi bet?', a: 'A Multi (Accumulator) bet combines multiple selections into one ticket. All selections must win for the ticket to win. The odds are multiplied, yielding much higher potential payouts.', category: 'betting' },
  { q: 'How does Cash Out work?', a: 'Cash Out allows you to settle a pending bet before the event finishes. The value fluctuates based on the current live odds of your selections. Click "Cash Out" under the My Bets tab to settle early.', category: 'betting' },
  { q: 'How do I set a deposit limit?', a: 'Go to the "Responsible Gaming" tab inside this modal. You can set a daily deposit limit. Deposits exceeding this limit will be blocked to ensure healthy gaming habits.', category: 'responsible' },
  { q: 'Can I temporarily lock my account?', a: 'Yes. Use the "Self-Exclusion" tool in the "Responsible Gaming" section. You can self-exclude for 1 minute (for testing), 24 hours, or 7 days, during which all betting will be locked.', category: 'responsible' },
  { q: 'Is my personal data secure?', a: 'Yes. We protect all user data using modern SSL encryption and adhere strictly to GDPR privacy requirements. You can download a full JSON copy of your profile data in the "Privacy Policy" tab.', category: 'privacy' },
];

interface FooterModalProps {
  tab: string | null;
  onClose: () => void;
  balance: number;
  placedBetsCount: number;
  depositLimit: number;
  setDepositLimit: (limit: number) => void;
  selfExclusionEndTime: number;
  setSelfExclusionEndTime: (time: number) => void;
  onStartLiveChat: () => void;
  triggerToast: (msg: string) => void;
}

const FooterModal: React.FC<FooterModalProps> = ({
  tab,
  onClose,
  balance,
  placedBetsCount,
  depositLimit,
  setDepositLimit,
  selfExclusionEndTime,
  setSelfExclusionEndTime,
  onStartLiveChat,
  triggerToast,
}) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  
  // Contact Form State
  const [contactSubject, setContactSubject] = useState('general');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  
  // Cookie Preferences
  const [cookies, setCookies] = useState({
    essential: true, // locked
    analytical: true,
    marketing: false,
  });

  // Responsible Gaming Slider & Timeout States
  const [localLimit, setLocalLimit] = useState<number>(depositLimit);
  const [exclusionDuration, setExclusionDuration] = useState<string>('60'); // default 60s (1 min)

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  if (!tab || !activeTab) return null;

  // GDPR Data Export
  const handleDataExport = () => {
    const data = {
      brand: 'bwin-clone-demo',
      exportDate: new Date().toISOString(),
      profile: {
        accountStatus: selfExclusionEndTime > Date.now() ? 'Self-Excluded' : 'Active',
        currency: 'EUR',
        simulatedBalance: balance,
        placedTickets: placedBetsCount,
        dailyDepositLimit: depositLimit,
      },
      cookiesAccepted: cookies,
      note: 'This is a simulated data export generated locally.'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bwin_profile_data_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('📥 GDPR profile data export downloaded successfully!');
  };

  // Cookie Save
  const handleSaveCookies = () => {
    localStorage.setItem('bwin_cookie_prefs', JSON.stringify(cookies));
    triggerToast('🍪 Cookie preferences saved successfully!');
  };

  // Limit Save
  const handleSaveLimit = () => {
    setDepositLimit(localLimit);
    triggerToast(`🛡️ Daily deposit limit set to €${localLimit.toFixed(2)}.`);
  };

  // Self-Exclusion Confirm
  const handleConfirmExclusion = () => {
    const durationMs = parseInt(exclusionDuration) * 1000;
    const endTime = Date.now() + durationMs;
    setSelfExclusionEndTime(endTime);
    triggerToast(`⚠️ Account self-excluded. Betting locked for the next ${exclusionDuration === '60' ? '1 minute' : exclusionDuration === '86400' ? '24 hours' : '7 days'}.`);
  };

  // Contact Form Submit
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) {
      triggerToast('❌ Please fill in all fields before submitting.');
      return;
    }
    triggerToast('📨 Support ticket submitted successfully! We will get back to you shortly.');
    setContactEmail('');
    setContactMessage('');
  };

  // Filter FAQs
  const filteredFAQs = FAQs.filter(faq => 
    faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  const formatExclusionTimeLeft = () => {
    const left = selfExclusionEndTime - Date.now();
    if (left <= 0) return '';
    const secs = Math.ceil(left / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.ceil(secs / 60);
    return `${mins}m`;
  };

  return (
    <div className="footer-modal-overlay" onClick={onClose}>
      <div className="footer-modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="fm-header">
          <h3>{activeTab}</h3>
          <button className="fm-close-btn" onClick={onClose}>&times;</button>
        </header>

        <div className="fm-body">
          {/* ════ ABOUT US ════ */}
          {activeTab === 'About Us' && (
            <div className="fm-content-pane fade-in">
              <p className="fm-highlight-text">
                bwin is a premier global sports betting brand, renowned for live betting innovation, premium dark aesthetic, and safe gaming environments.
              </p>
              
              <div className="fm-stats-grid">
                <div className="fm-stat-card">
                  <span className="stat-num">1997</span>
                  <span className="stat-label">Founded</span>
                </div>
                <div className="fm-stat-card">
                  <span className="stat-num">20M+</span>
                  <span className="stat-label">Active Users</span>
                </div>
                <div className="fm-stat-card">
                  <span className="stat-num">100+</span>
                  <span className="stat-label">Sports Covered</span>
                </div>
                <div className="fm-stat-card">
                  <span className="stat-num">Entain</span>
                  <span className="stat-label">Parent Group</span>
                </div>
              </div>

              <h4>Our Mission</h4>
              <p>
                To provide the ultimate sports-book and online casino gaming excitement while securing absolute trust through fair odds, quick payouts, and leading compliance practices under Entain plc licensing (Gibraltar & UKGC).
              </p>
            </div>
          )}

          {/* ════ TERMS AND CONDITIONS ════ */}
          {activeTab === 'Terms and Conditions' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <h4>1. Account Registration</h4>
              <p>Users must be over 18 years of age to register and place bets. Verification checks are automatically processed upon creating accounts.</p>
              
              <h4>2. Betting Rules & Odds</h4>
              <p>Placed bets are final. Winnings are settled automatically against fast simulated score results. Malfunctions voids all pays and plays.</p>
              
              <h4>3. Cash Out Offerings</h4>
              <p>Cash out values are subject to real-time adjustments depending on live scoring fluctuations. Settle requests carry a 2-second processing buffer.</p>

              <h4>4. System Abuse & Fraud</h4>
              <p>Any exploitation of odds feed inconsistencies or simulated timer delays may lead to ticket voiding and account suspension.</p>
            </div>
          )}

          {/* ════ PRIVACY POLICY ════ */}
          {activeTab === 'Privacy Policy' && (
            <div className="fm-content-pane fade-in">
              <h4>GDPR Data Protection & User Rights</h4>
              <p>We respect your privacy. Under the General Data Protection Regulation (GDPR), you possess the right to access, rectify, or download your complete profile data history at any time.</p>
              
              <div className="privacy-actions-block">
                <div className="privacy-card">
                  <h5>Data Rights Summary:</h5>
                  <ul>
                    <li>Right to access personal records</li>
                    <li>Right to be forgotten (Erasure requests)</li>
                    <li>Right to data portability</li>
                  </ul>
                </div>
                <button className="btn-gdpr-export" onClick={handleDataExport}>
                  📥 Request Profile Data Export (JSON)
                </button>
              </div>
            </div>
          )}

          {/* ════ COOKIE POLICY ════ */}
          {activeTab === 'Cookie Policy' && (
            <div className="fm-content-pane fade-in">
              <p>Manage your cookie settings below. Essential cookies are required to preserve account sessions, bet slips, and balance status.</p>
              
              <div className="cookie-settings-form">
                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>Essential Cookies (Required)</h5>
                    <p>Enables core site operations like bet slips and local storage balance persistence.</p>
                  </div>
                  <input type="checkbox" checked disabled className="toggle-switch-input" />
                </div>

                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>Analytical & Performance Cookies</h5>
                    <p>Used to monitor page response times and track mock betting speeds.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookies.analytical} 
                    onChange={(e) => setCookies(prev => ({ ...prev, analytical: e.target.checked }))}
                    className="toggle-switch-input" 
                  />
                </div>

                <div className="cookie-setting-row">
                  <div className="cs-info">
                    <h5>Marketing Cookies</h5>
                    <p>Allows personalized display banners and promotional bonus offerings.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={cookies.marketing} 
                    onChange={(e) => setCookies(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="toggle-switch-input" 
                  />
                </div>

                <button className="btn-save-cookies" onClick={handleSaveCookies}>
                  Save Cookie Preferences
                </button>
              </div>
            </div>
          )}

          {/* ════ RESPONSIBLE GAMING ════ */}
          {activeTab === 'Responsible Gaming' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <p className="responsible-intro">
                bwin is committed to providing a secure and responsible gaming environment. Set deposit limits or self-exclude to lock account activity.
              </p>

              <div className="responsible-section">
                <h4>🛡️ Set Daily Deposit Limit</h4>
                <p className="rg-sub-desc">Limit the maximum funds you can deposit within any 24-hour window.</p>
                <div className="limit-slider-container">
                  <input 
                    type="range" 
                    min="50" 
                    max="5000" 
                    step="50" 
                    value={localLimit} 
                    onChange={(e) => setLocalLimit(parseInt(e.target.value))}
                    className="rg-slider"
                  />
                  <div className="slider-value-badge">€{localLimit.toFixed(2)}</div>
                </div>
                <button className="btn-save-limit" onClick={handleSaveLimit}>
                  Confirm Deposit Limit
                </button>
              </div>

              <div className="responsible-section self-exclusion-block">
                <h4>⚠️ Temporary Account Self-Exclusion</h4>
                <p className="rg-sub-desc">Lock your account immediately. Placing bets will be entirely disabled during this time.</p>
                
                {selfExclusionEndTime > Date.now() ? (
                  <div className="exclusion-active-indicator">
                    🔒 Account Locked. Exclusion expires in: <span>{formatExclusionTimeLeft()}</span>
                  </div>
                ) : (
                  <div className="exclusion-inputs">
                    <select 
                      value={exclusionDuration} 
                      onChange={(e) => setExclusionDuration(e.target.value)}
                      className="rg-select"
                    >
                      <option value="60">1 Minute (For testing/demo)</option>
                      <option value="86400">24 Hours</option>
                      <option value="604800">7 Days</option>
                    </select>
                    <button className="btn-exclude-action" onClick={handleConfirmExclusion}>
                      Confirm Self-Exclusion
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ HELP CENTER ════ */}
          {activeTab === 'Help Center' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <div className="faq-search-wrapper">
                <input 
                  type="text" 
                  placeholder="🔍 Search FAQs (e.g. payout, withdraw, multi)..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="faq-search-input"
                />
              </div>

              <div className="faqs-list">
                {filteredFAQs.map((faq, idx) => (
                  <div key={idx} className={`faq-item ${expandedFaqIndex === idx ? 'expanded' : ''}`}>
                    <div className="faq-question" onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}>
                      <span>{faq.q}</span>
                      <span className="faq-arrow">{expandedFaqIndex === idx ? '▲' : '▼'}</span>
                    </div>
                    {expandedFaqIndex === idx && (
                      <div className="faq-answer fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <div className="faq-empty-state">No FAQs found matching your query.</div>
                )}
              </div>
            </div>
          )}

          {/* ════ CONTACT US ════ */}
          {activeTab === 'Contact Us' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <p>Need support? Submit a ticket below, or open a live chat session to talk to our automated bwin support bot immediately.</p>
              
              <div className="contact-methods-wrapper">
                <form className="contact-ticket-form" onSubmit={handleContactSubmit}>
                  <h4>Submit an Email Ticket</h4>
                  <div className="input-group">
                    <label>Subject</label>
                    <select value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} className="rg-select">
                      <option value="general">General Inquiry</option>
                      <option value="payments">Deposits & Withdrawals</option>
                      <option value="responsible">Responsible Gaming Limits</option>
                      <option value="technical">Technical Support</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Your Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={contactEmail} 
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="rg-input"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Detailed Message</label>
                    <textarea 
                      placeholder="Describe your issue..." 
                      value={contactMessage} 
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="rg-textarea"
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-save-limit">Submit Ticket</button>
                </form>

                <div className="contact-live-chat-card">
                  <h4>💬 Interactive Live Chat</h4>
                  <p>Get answers to account balance questions, settlement guidelines, and general rules instantly.</p>
                  <button className="btn-start-chat" onClick={() => { onStartLiveChat(); onClose(); }}>
                    Start Live Support Chat
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ DEPOSITS & WITHDRAWALS ════ */}
          {activeTab === 'Deposits & Withdrawals' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <h4>Supported Payment Methods</h4>
              <table className="fm-payment-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Type</th>
                    <th>Processing Time</th>
                    <th>Limits (Min/Max)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Visa / MasterCard</td>
                    <td>Deposit / Withdrawal</td>
                    <td>Instant (Dep) / 1-3 Days (With)</td>
                    <td>€10.00 / €5,000.00</td>
                  </tr>
                  <tr>
                    <td>PayPal</td>
                    <td>Deposit / Withdrawal</td>
                    <td>Instant (Dep) / Instant (With)</td>
                    <td>€10.00 / €10,000.00</td>
                  </tr>
                  <tr>
                    <td>Skrill / Neteller</td>
                    <td>Deposit / Withdrawal</td>
                    <td>Instant (Dep) / Instant (With)</td>
                    <td>€10.00 / €10,000.00</td>
                  </tr>
                  <tr>
                    <td>Bank Transfer</td>
                    <td>Withdrawal Only</td>
                    <td>3-5 Business Days</td>
                    <td>€20.00 / €50,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* ════ BETTING RULES ════ */}
          {activeTab === 'Betting Rules' && (
            <div className="fm-content-pane fade-in scrollable-y">
              <h4>Glossary & Betting Guidelines</h4>
              
              <div className="glossary-list">
                <div className="glossary-item">
                  <h5>Single Bet</h5>
                  <p>A wager placed on a single selection. If your team wins, you receive Stake &times; Selection Odds.</p>
                </div>

                <div className="glossary-item">
                  <h5>Multi Bet (Accumulator)</h5>
                  <p>Combines 2 or more selections on one slip. All selections must win for the payout to trigger. Returns: Stake &times; Combined Odds.</p>
                </div>

                <div className="glossary-item">
                  <h5>System Bet</h5>
                  <p>Allows placing combinations of selections (e.g. 2/3 system). You can still win returns even if one or more selections lose.</p>
                </div>

                <div className="glossary-item">
                  <h5>Cash Out Option</h5>
                  <p>Settles a ticket early before the game ends. The payout is determined dynamically by the current live odds of the pending matches.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FooterModal;
