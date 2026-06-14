import React, { useState } from 'react';
import './Casino.css';
import './LiveCasino.css';

interface LiveTable {
  id: string;
  name: string;
  category: 'Roulette' | 'Blackjack' | 'Baccarat' | 'Game Shows';
  dealer: string;
  players: number;
  limits: string;
  color: string;
  videoUrl: string;
}

const LIVE_TABLES: LiveTable[] = [
  { id: 'lt1', name: 'Lightning Roulette', category: 'Roulette', dealer: 'Sofia', players: 847, limits: '€1 – €500', color: 'linear-gradient(135deg, #f7971e, #ffd200)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-roulette-wheel-in-a-casino-39967-large.mp4' },
  { id: 'lt2', name: 'Immersive Roulette', category: 'Roulette', dealer: 'Maria', players: 312, limits: '€1 – €1,000', color: 'linear-gradient(135deg, #1f4037, #99f2c8)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-roulette-wheel-in-a-casino-39967-large.mp4' },
  { id: 'lt3', name: 'Bwin Blackjack VIP', category: 'Blackjack', dealer: 'James', players: 7, limits: '€50 – €5,000', color: 'linear-gradient(135deg, #232526, #414345)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dealer-dealing-cards-at-a-blackjack-table-39958-large.mp4' },
  { id: 'lt4', name: 'Infinite Blackjack', category: 'Blackjack', dealer: 'Anna', players: 999, limits: '€1 – €200', color: 'linear-gradient(135deg, #1c1c1c, #303030)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dealer-dealing-cards-at-a-blackjack-table-39958-large.mp4' },
  { id: 'lt5', name: 'Speed Baccarat A', category: 'Baccarat', dealer: 'Chen', players: 128, limits: '€5 – €2,000', color: 'linear-gradient(135deg, #3a1c71, #d76d77)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-card-dealer-dealing-cards-39959-large.mp4' },
  { id: 'lt6', name: 'Mega Ball', category: 'Game Shows', dealer: 'Host', players: 12400, limits: '€0.10 – €250', color: 'linear-gradient(135deg, #4facfe, #00f2fe)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shaking-the-dice-before-throwing-them-39962-large.mp4' },
  { id: 'lt7', name: 'Crazy Time', category: 'Game Shows', dealer: 'Host', players: 6730, limits: '€0.10 – €100', color: 'linear-gradient(135deg, #f12711, #f5af19)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shaking-the-dice-before-throwing-them-39962-large.mp4' },
  { id: 'lt8', name: 'Dragon Tiger', category: 'Baccarat', dealer: 'Mei', players: 67, limits: '€5 – €500', color: 'linear-gradient(135deg, #e44d26, #f16529)', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-card-dealer-dealing-cards-39959-large.mp4' },
];

type Filter = 'All' | 'Roulette' | 'Blackjack' | 'Baccarat' | 'Game Shows';

interface LiveCasinoProps { language?: string; }

export const LiveCasino: React.FC<LiveCasinoProps> = ({ language = 'en' }) => {
  const [filter, setFilter] = useState<Filter>('All');
  const [toast, setToast] = useState<string | null>(null);

  const tables = LIVE_TABLES.filter(t => filter === 'All' || t.category === filter);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <main className="main-content casino-container">
      {toast && <div className="casino-toast" role="alert">{toast}</div>}

      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
        <div className="promo-content">
          <div className="promo-badge lc-badge">LIVE</div>
          <h2>{language === 'ru' ? 'Лайв казино' : 'Live Casino'}</h2>
          <p>{language === 'ru' ? 'Живые крупье — настоящая атмосфера казино онлайн' : 'Real dealers — authentic casino experience online'}</p>
          <button className="btn-promo" onClick={() => showToast('Welcome to Live Casino! Choose your table below.')}>
            {language === 'ru' ? 'Перейти к столам' : 'Browse Tables'}
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>{language === 'ru' ? 'Столы в прямом эфире' : 'Live Tables'}</h2>
        <div className="casino-nav">
          {(['All', 'Roulette', 'Blackjack', 'Baccarat', 'Game Shows'] as Filter[]).map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'All' ? (language === 'ru' ? 'Все' : 'All') : f}
            </button>
          ))}
        </div>
      </div>

      <div className="lc-tables-grid">
        {tables.map(table => (
          <div key={table.id} className="lc-table-card" onClick={() => showToast(`Joining ${table.name}...`)}>
            <div className="lc-card-bg" style={{ background: table.color }}>
              <video 
                className="lc-video-bg" 
                src={table.videoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline 
              />
              <div className="lc-card-bg-overlay" />
              <span className="lc-live-dot">● LIVE</span>
              <span className="lc-players">{table.players.toLocaleString()} {language === 'ru' ? 'игроков' : 'players'}</span>
            </div>
            <div className="lc-card-body">
              <div className="lc-card-title">{table.name}</div>
              <div className="lc-card-dealer">{language === 'ru' ? 'Крупье:' : 'Dealer:'} {table.dealer}</div>
              <div className="lc-card-limits">{language === 'ru' ? 'Лимиты' : 'Limits'}: {table.limits}</div>
              <button type="button" className="lc-join-btn" onClick={e => { e.stopPropagation(); showToast(`Joining ${table.name}...`); }}>
                {language === 'ru' ? 'Играть' : 'Join Table'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
