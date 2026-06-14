import React, { useState } from 'react';
import './Casino.css';
import './LiveCasino.css';

interface LiveTable {
  id: string;
  name: string;
  category: 'Roulette' | 'Blackjack' | 'Baccarat' | 'Game Shows';
  provider: string;
  dealer: string;
  studio: string;
  languageLabel: string;
  players: number;
  occupancy: string;
  limits: string;
  thumbnail: string;
  videoUrl?: string;
  scene: 'roulette' | 'blackjack' | 'baccarat' | 'show';
}

const LIVE_TABLES: LiveTable[] = [
  { id: 'lt1', name: 'Lightning Roulette', category: 'Roulette', provider: 'Evolution', dealer: 'Sofia', studio: 'Riga Studio', languageLabel: 'EN', players: 243, occupancy: 'Open table', limits: '€1 – €500', thumbnail: 'linear-gradient(140deg, #211915 0%, #6b2414 45%, #f2b32b 100%)', scene: 'roulette' },
  { id: 'lt2', name: 'Immersive Roulette', category: 'Roulette', provider: 'Evolution', dealer: 'Maria', studio: 'Malta Studio', languageLabel: 'EN', players: 187, occupancy: 'Camera view', limits: '€1 – €1,000', thumbnail: 'linear-gradient(140deg, #071d18 0%, #136149 50%, #88e8bd 100%)', scene: 'roulette' },
  { id: 'lt3', name: 'Bwin Blackjack VIP', category: 'Blackjack', provider: 'Playtech', dealer: 'James', studio: 'VIP Salon', languageLabel: 'EN', players: 118, occupancy: '5/7 seats', limits: '€50 – €5,000', thumbnail: 'linear-gradient(140deg, #090909 0%, #252628 48%, #777b80 100%)', scene: 'blackjack' },
  { id: 'lt4', name: 'Infinite Blackjack', category: 'Blackjack', provider: 'Evolution', dealer: 'Anna', studio: 'Blackjack Hall', languageLabel: 'EN', players: 276, occupancy: 'Unlimited', limits: '€1 – €200', thumbnail: 'linear-gradient(140deg, #101010 0%, #20272a 52%, #4e5f66 100%)', scene: 'blackjack' },
  { id: 'lt5', name: 'Speed Baccarat A', category: 'Baccarat', provider: 'Pragmatic Live', dealer: 'Chen', studio: 'Macau Room', languageLabel: 'ZH', players: 164, occupancy: 'Fast table', limits: '€5 – €2,000', thumbnail: 'linear-gradient(140deg, #1d1036 0%, #67337c 52%, #d56b7c 100%)', scene: 'baccarat' },
  { id: 'lt6', name: 'Mega Ball', category: 'Game Shows', provider: 'Evolution', dealer: 'Emma', studio: 'Show Stage', languageLabel: 'EN', players: 291, occupancy: 'Next round', limits: '€0.10 – €250', thumbnail: 'linear-gradient(140deg, #062a5b 0%, #0f92c8 48%, #4fe5ff 100%)', scene: 'show' },
  { id: 'lt7', name: 'Crazy Time', category: 'Game Shows', provider: 'Evolution', dealer: 'Nick', studio: 'Dream Factory', languageLabel: 'EN', players: 258, occupancy: 'Bonus live', limits: '€0.10 – €100', thumbnail: 'linear-gradient(140deg, #541109 0%, #f25a17 50%, #ffbd2f 100%)', scene: 'show' },
  { id: 'lt8', name: 'Dragon Tiger', category: 'Baccarat', provider: 'Pragmatic Live', dealer: 'Mei', studio: 'Asian Lounge', languageLabel: 'ZH', players: 132, occupancy: 'Open table', limits: '€5 – €500', thumbnail: 'linear-gradient(140deg, #351108 0%, #b83f1d 48%, #ff7a2d 100%)', scene: 'baccarat' },
];

type Filter = 'All' | 'Roulette' | 'Blackjack' | 'Baccarat' | 'Game Shows';
const FILTERS: Filter[] = ['All', 'Roulette', 'Blackjack', 'Baccarat', 'Game Shows'];

interface LiveCasinoProps { language?: string; }

export const LiveCasino: React.FC<LiveCasinoProps> = ({ language = 'en' }) => {
  const [filter, setFilter] = useState<Filter>('All');
  const [toast, setToast] = useState<string | null>(null);

  const tables = LIVE_TABLES.filter(t => filter === 'All' || t.category === filter);

  const showToast = (tableName: string) => {
    setToast(language === 'ru' ? `Подключение к ${tableName}...` : `Joining ${tableName}...`);
    setTimeout(() => setToast(null), 3000);
  };

  const getFilterLabel = (value: Filter) => {
    if (value === 'All') return language === 'ru' ? 'Все' : 'All';
    if (value === 'Game Shows') return language === 'ru' ? 'Шоу' : 'Game Shows';
    return value;
  };

  return (
    <main className="main-content casino-container">
      {toast && <div className="casino-toast" role="alert">{toast}</div>}

      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' }}>
        <div className="promo-content">
          <div className="promo-badge lc-badge">LIVE</div>
          <h2>{language === 'ru' ? 'Лайв казино' : 'Live Casino'}</h2>
          <p>{language === 'ru' ? 'Живые крупье — настоящая атмосфера казино онлайн' : 'Real dealers — authentic casino experience online'}</p>
          <button className="btn-promo" onClick={() => document.querySelector('.lc-tables-grid')?.scrollIntoView({ behavior: 'smooth' })}>
            {language === 'ru' ? 'Перейти к столам' : 'Browse Tables'}
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>{language === 'ru' ? 'Столы в прямом эфире' : 'Live Tables'}</h2>
        <div className="casino-nav">
          {FILTERS.map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              <span>{getFilterLabel(f)}</span>
              <span className="lc-nav-count">{f === 'All' ? LIVE_TABLES.length : LIVE_TABLES.filter(table => table.category === f).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lc-tables-grid">
        {tables.map(table => (
          <div key={table.id} className="lc-table-card" onClick={() => showToast(table.name)}>
            <div className="lc-card-bg" style={{ background: table.thumbnail }}>
              {table.videoUrl ? (
                <video className="lc-card-video" autoPlay muted loop playsInline poster="">
                  <source src={table.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className={`lc-live-preview lc-live-preview-${table.scene}`} aria-hidden="true">
                  <span className="lc-studio-wall" />
                  <span className="lc-dealer-silhouette" />
                  <span className="lc-table-felt" />
                  <span className="lc-game-prop lc-game-prop-a" />
                  <span className="lc-game-prop lc-game-prop-b" />
                </div>
              )}
              <div className="lc-media-shade" />
              <div className="lc-card-topbar">
                <span className="lc-live-dot">LIVE</span>
                <span className="lc-stream-badge">HD</span>
              </div>
              <div className="lc-logo-overlay">
                <span>{table.name}</span>
                <small>{table.provider}</small>
              </div>
              <div className="lc-table-status">
                <span className="lc-players">
                  <span className="lc-player-pulse" />
                  {table.players} {language === 'ru' ? 'игроков' : 'players'}
                </span>
                <span>{table.occupancy}</span>
              </div>
            </div>
            <div className="lc-card-body">
              <div className="lc-dealer-row">
                <span className="lc-dealer-avatar">{table.dealer.charAt(0)}</span>
                <div>
                  <span>{language === 'ru' ? 'Крупье' : 'Dealer'}</span>
                  <strong>{table.dealer}</strong>
                </div>
                <em>{table.languageLabel}</em>
              </div>
              <div className="lc-card-meta">
                <div>
                  <span>{language === 'ru' ? 'Лимиты' : 'Limits'}</span>
                  <strong>{table.limits}</strong>
                </div>
                <div>
                  <span>{language === 'ru' ? 'Студия' : 'Studio'}</span>
                  <strong>{table.studio}</strong>
                </div>
              </div>
              <button type="button" className="lc-join-btn" onClick={e => { e.stopPropagation(); showToast(table.name); }}>
                {language === 'ru' ? 'Играть' : 'Join Table'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
