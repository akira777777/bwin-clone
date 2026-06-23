import React, { useState, useRef, useEffect } from 'react';
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
  youtubeId: string;
  startAt: number;
}

const LIVE_TABLES: LiveTable[] = [
  { id: 'lt1', name: 'Lightning Roulette', category: 'Roulette', dealer: 'Sofia', players: 847, limits: '€1 – €500', color: 'linear-gradient(135deg, #f7971e, #ffd200)', videoUrl: '/videos/roulette.mp4', youtubeId: '83PKonTnHoA', startAt: 45 },
  { id: 'lt2', name: 'Immersive Roulette', category: 'Roulette', dealer: 'Maria', players: 312, limits: '€1 – €1,000', color: 'linear-gradient(135deg, #1f4037, #99f2c8)', videoUrl: '/videos/roulette.mp4', youtubeId: 'ZZMaLSrsgf4', startAt: 90 },
  { id: 'lt3', name: 'BETZ Blackjack VIP', category: 'Blackjack', dealer: 'James', players: 7, limits: '€50 – €5,000', color: 'linear-gradient(135deg, #232526, #414345)', videoUrl: '/videos/blackjack.mp4', youtubeId: 'dfE-7NV4Vh8', startAt: 60 },
  { id: 'lt4', name: 'Infinite Blackjack', category: 'Blackjack', dealer: 'Anna', players: 999, limits: '€1 – €200', color: 'linear-gradient(135deg, #1c1c1c, #303030)', videoUrl: '/videos/blackjack.mp4', youtubeId: 'AZ2sb5B_JmA', startAt: 120 },
  { id: 'lt5', name: 'Speed Baccarat A', category: 'Baccarat', dealer: 'Chen', players: 128, limits: '€5 – €2,000', color: 'linear-gradient(135deg, #3a1c71, #d76d77)', videoUrl: '', youtubeId: '', startAt: 0 },
  { id: 'lt6', name: 'Mega Ball', category: 'Game Shows', dealer: 'Host', players: 12400, limits: '€0.10 – €250', color: 'linear-gradient(135deg, #4facfe, #00f2fe)', videoUrl: '', youtubeId: '', startAt: 0 },
  { id: 'lt7', name: 'Crazy Time', category: 'Game Shows', dealer: 'Host', players: 6730, limits: '€0.10 – €100', color: 'linear-gradient(135deg, #f12711, #f5af19)', videoUrl: '', youtubeId: '', startAt: 0 },
  { id: 'lt8', name: 'Dragon Tiger', category: 'Baccarat', dealer: 'Mei', players: 67, limits: '€5 – €500', color: 'linear-gradient(135deg, #e44d26, #f16529)', videoUrl: '/videos/baccarat.mp4', youtubeId: 'TBe7eeOYjE8', startAt: 75 },
];

type Filter = 'All' | 'Roulette' | 'Blackjack' | 'Baccarat' | 'Game Shows';

interface LiveCasinoProps { language?: string; }

export const LiveCasino: React.FC<LiveCasinoProps> = ({ language = 'en' }) => {
  const [filter, setFilter] = useState<Filter>('All');
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const tables = LIVE_TABLES.filter(t => filter === 'All' || t.category === filter);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 3000);
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
              {table.youtubeId ? (
                <iframe
                  className="lc-video-bg lc-iframe-bg"
                  src={`https://www.youtube.com/embed/${table.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${table.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1&start=${table.startAt}`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  title={table.name}
                />
              ) : table.videoUrl ? (
                <video 
                  className="lc-video-bg" 
                  src={table.videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                />
              ) : null}
              <div className="lc-card-bg-overlay" />
              {table.youtubeId && <div className="lc-iframe-cover" />}
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
