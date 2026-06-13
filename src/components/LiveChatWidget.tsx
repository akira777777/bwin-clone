import React, { useState, useRef, useEffect } from 'react';
import './LiveChatWidget.css';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  placedBetsCount: number;
  selfExclusionEndTime: number;
}

const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  onClose,
  balance,
  placedBetsCount,
  selfExclusionEndTime,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hello! Welcome to bwin Live Support. I'm your automated assistant. How can I help you today? (Try typing: 'balance', 'bets', 'exclusion', or 'withdraw')",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const query = inputText.toLowerCase().trim();
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      let botResponseText = '';

      if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
        botResponseText = "Hello! I am your bwin automated agent. Ask me about your 'balance', your 'bets', or 'exclusions', and I'll look them up for you.";
      } else if (query.includes('balance') || query.includes('money') || query.includes('funds')) {
        botResponseText = `💰 Your current simulated account balance is €${balance.toFixed(2)}. You can add €500.00 instantly using the Quick Deposit (+) button in the header!`;
      } else if (query.includes('bet') || query.includes('ticket') || query.includes('slip')) {
        botResponseText = `🎫 You have placed ${placedBetsCount} bet ticket(s) in this session. You can review them anytime in the "My Bets" tab on the right sidebar.`;
      } else if (query.includes('exclude') || query.includes('lock') || query.includes('exclusion') || query.includes('limit')) {
        const excluded = selfExclusionEndTime > Date.now();
        if (excluded) {
          const secs = Math.ceil((selfExclusionEndTime - Date.now()) / 1000);
          botResponseText = `🔒 Your account is currently under active self-exclusion. Betting is locked for the next ${secs} seconds.`;
        } else {
          botResponseText = "🛡️ You can set daily deposit limits or lock your account (self-exclusion) in the 'Responsible Gaming' settings of the footer menu.";
        }
      } else if (query.includes('withdraw') || query.includes('deposit') || query.includes('payout') || query.includes('pay')) {
        botResponseText = "💳 Simulated deposits are instant. Withdrawals are processed within 24 hours back to your preferred payment method (PayPal, Skrill, Visa).";
      } else if (query.includes('help') || query.includes('rule') || query.includes('faq')) {
        botResponseText = "📚 For complete gaming guidelines and glossary, check the 'Betting Rules' or 'Help Center' FAQ search inside the footer menu.";
      } else {
        botResponseText = "I understand. For account privacy or technical troubleshooting, please submit a ticket in the 'Contact Us' section or read our Help Center docs.";
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMsg]);
    }, 900);
  };

  return (
    <div className="live-chat-widget fade-in-chat">
      <header className="lc-header">
        <div className="lc-agent-info">
          <span className="lc-avatar-dot"></span>
          <div>
            <h4>bwin Assistant</h4>
            <span className="lc-status">Always Online</span>
          </div>
        </div>
        <button className="lc-close-btn" onClick={onClose}>&times;</button>
      </header>

      <div className="lc-messages-container">
        {messages.map(msg => (
          <div key={msg.id} className={`lc-bubble-row ${msg.sender === 'user' ? 'lc-user-row' : 'lc-bot-row'}`}>
            <div className={`lc-bubble ${msg.sender === 'user' ? 'user-style' : 'bot-style'}`}>
              <p>{msg.text}</p>
              <span className="lc-time">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="lc-bubble-row lc-bot-row">
            <div className="lc-bubble bot-style lc-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form className="lc-input-form" onSubmit={handleSendMessage}>
        <input 
          type="text" 
          placeholder="Type message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping}
          className="lc-input"
        />
        <button type="submit" disabled={isTyping || !inputText.trim()} className="lc-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default LiveChatWidget;
