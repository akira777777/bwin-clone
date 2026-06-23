import React, { useState, useRef, useEffect } from 'react';
import './Casino.css';
import './Poker.css';

interface CashGame {
  id: string;
  name: string;
  variant: string;
  stakes: string;
  players: number;
  seats: number;
  avgPot: string;
}

interface Tournament {
  id: string;
  name: string;
  buyIn: string;
  prize: string;
  registered: number;
  startTime: string;
  status: 'Registering' | 'Late Reg' | 'Running' | 'Starting Soon';
}

const CASH_GAMES: CashGame[] = [
  { id: 'cg1', name: "NL Hold'em", variant: "Texas Hold'em", stakes: '$0.01/$0.02', players: 6, seats: 9, avgPot: '$0.35' },
  { id: 'cg2', name: "NL Hold'em", variant: "Texas Hold'em", stakes: '$0.05/$0.10', players: 8, seats: 9, avgPot: '$1.80' },
  { id: 'cg3', name: "NL Hold'em", variant: "Texas Hold'em", stakes: '$0.25/$0.50', players: 5, seats: 6, avgPot: '$9.40' },
  { id: 'cg4', name: 'PLO Hi', variant: 'PLO', stakes: '$0.10/$0.25', players: 4, seats: 6, avgPot: '$4.20' },
  { id: 'cg5', name: 'PLO Hi', variant: 'PLO', stakes: '$0.50/$1.00', players: 6, seats: 9, avgPot: '$18.50' },
  { id: 'cg6', name: 'Omaha Hi-Lo', variant: 'Omaha', stakes: '$0.05/$0.10', players: 3, seats: 6, avgPot: '$2.10' },
];

const TOURNAMENTS: Tournament[] = [
  { id: 't1', name: 'Daily $5K GTD', buyIn: '$11', prize: '$5,000', registered: 312, startTime: '20:00', status: 'Registering' },
  { id: 't2', name: 'Sunday Special', buyIn: '$55', prize: '$50,000', registered: 890, startTime: '18:00', status: 'Registering' },
  { id: 't3', name: 'Turbo Knockout', buyIn: '$22', prize: '$10,000', registered: 156, startTime: 'NOW', status: 'Starting Soon' },
  { id: 't4', name: 'Micro Series #7', buyIn: '$3.30', prize: '$1,500', registered: 487, startTime: '21:00', status: 'Late Reg' },
  { id: 't5', name: 'High Roller 200', buyIn: '$215', prize: '$20,000', registered: 88, startTime: '19:30', status: 'Running' },
  { id: 't6', name: 'Freeroll Opener', buyIn: 'FREE', prize: '$250', registered: 2140, startTime: '22:00', status: 'Registering' },
];

const STATUS_COLOR: Record<Tournament['status'], string> = {
  Registering: '#4caf50',
  'Late Reg': '#ff9800',
  Running: '#2196f3',
  'Starting Soon': '#f44336',
};

type PokerTab = 'Cash Games' | 'Tournaments';

interface PokerProps { language?: string; }

export const Poker: React.FC<PokerProps> = ({ language = 'en' }) => {
  const [tab, setTab] = useState<PokerTab>('Cash Games');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="main-content casino-container">
      {toast && <div className="casino-toast" role="alert">{toast}</div>}

      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #1a0533, #2d0b5f, #1a0533)' }}>
        <div className="promo-content">
          <div className="promo-badge pk-badge">♠ POKER</div>
          <h2>{language === 'ru' ? 'Покер' : 'Poker'}</h2>
          <p>{language === 'ru' ? "Кэш-игры и турниры — Texas Hold'em, Omaha и PLO" : "Cash games and tournaments — Texas Hold'em, Omaha & PLO"}</p>
          <button className="btn-promo pk-promo-btn" onClick={() => showToast('Download our Poker client to play!')}>
            {language === 'ru' ? 'Скачать клиент' : 'Download Client'}
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>{language === 'ru' ? 'Покерный лобби' : 'Poker Lobby'}</h2>
        <div className="casino-nav">
          {(['Cash Games', 'Tournaments'] as PokerTab[]).map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {language === 'ru' ? (t === 'Cash Games' ? 'Кэш-игры' : 'Турниры') : t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Cash Games' && (
        <div className="pk-table">
          <div className="pk-table-head">
            <span>{language === 'ru' ? 'Игра' : 'Game'}</span>
            <span>{language === 'ru' ? 'Вариант' : 'Variant'}</span>
            <span>{language === 'ru' ? 'Ставки' : 'Stakes'}</span>
            <span>{language === 'ru' ? 'Игроков' : 'Players'}</span>
            <span>{language === 'ru' ? 'Средний пот' : 'Avg Pot'}</span>
            <span></span>
          </div>
          {CASH_GAMES.map(g => (
            <div key={g.id} className="pk-table-row" onClick={() => showToast(`Joining ${g.name} ${g.stakes}...`)}>
              <span className="pk-game-name">{g.name}</span>
              <span className="pk-variant-chip">{g.variant}</span>
              <span className="pk-stakes">{g.stakes}</span>
              <span className="pk-seats">{g.players}/{g.seats}</span>
              <span className="pk-pot">{g.avgPot}</span>
              <button type="button" className="pk-join-btn" onClick={e => { e.stopPropagation(); showToast(`Joining ${g.name} ${g.stakes}...`); }}>
                {language === 'ru' ? 'Сесть' : 'Sit Down'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'Tournaments' && (
        <div className="pk-tournaments">
          {TOURNAMENTS.map(t => (
            <div key={t.id} className="pk-tournament-card">
              <div className="pk-tourney-header">
                <span className="pk-tourney-name">{t.name}</span>
                <span className="pk-tourney-status" style={{ color: STATUS_COLOR[t.status] }}>{t.status}</span>
              </div>
              <div className="pk-tourney-info">
                <div className="pk-info-block">
                  <span className="pk-info-label">{language === 'ru' ? 'Взнос' : 'Buy-In'}</span>
                  <span className="pk-info-value pk-buyin">{t.buyIn}</span>
                </div>
                <div className="pk-info-block">
                  <span className="pk-info-label">{language === 'ru' ? 'Призовой' : 'Prize Pool'}</span>
                  <span className="pk-info-value pk-prize">{t.prize}</span>
                </div>
                <div className="pk-info-block">
                  <span className="pk-info-label">{language === 'ru' ? 'Зарег.' : 'Registered'}</span>
                  <span className="pk-info-value">{t.registered}</span>
                </div>
                <div className="pk-info-block">
                  <span className="pk-info-label">{language === 'ru' ? 'Старт' : 'Start'}</span>
                  <span className="pk-info-value">{t.startTime}</span>
                </div>
              </div>
              <button
                type="button"
                className="pk-register-btn"
                disabled={t.status === 'Running'}
                onClick={() => showToast(t.status === 'Running' ? 'Tournament already in progress.' : `Registered for ${t.name}!`)}
              >
                {t.status === 'Running'
                  ? (language === 'ru' ? 'Идёт игра' : 'In Progress')
                  : (language === 'ru' ? 'Зарегистрироваться' : 'Register')}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
