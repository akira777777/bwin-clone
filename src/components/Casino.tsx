import React, { useState } from 'react';
import { Play, Sparkles, Diamond, Coins } from 'lucide-react';
import { t } from '../utils/i18n';
import './Casino.css';

interface Game {
  id: string;
  title: string;
  provider: string;
  color: string;
  icon: React.ReactNode;
  category: 'Slots' | 'Table Games' | 'Live Dealer';
  image?: string;
}

const CASINO_GAMES: Game[] = [
  { id: '1', title: 'Book of Dead', provider: 'Play\'n GO', color: 'linear-gradient(135deg, #b92b27, #1565C0)', icon: <Sparkles size={40} />, category: 'Slots', image: '/casino/book_of_dead.png' },
  { id: '2', title: 'Lightning Roulette', provider: 'Evolution', color: 'linear-gradient(135deg, #1f4037, #99f2c8)', icon: <Coins size={40} />, category: 'Live Dealer', image: '/casino/lightning_roulette.png' },
  { id: '3', title: 'Crazy Time', provider: 'Evolution', color: 'linear-gradient(135deg, #f12711, #f5af19)', icon: <Play size={40} />, category: 'Live Dealer', image: '/casino/crazy_time.png' },
  { id: '4', title: 'Starburst', provider: 'NetEnt', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', icon: <Diamond size={40} />, category: 'Slots', image: '/casino/starburst.png' },
  { id: '5', title: 'Sweet Bonanza', provider: 'Pragmatic Play', color: 'linear-gradient(135deg, #ff00cc, #333399)', icon: <Sparkles size={40} />, category: 'Slots', image: '/casino/sweet_bonanza.png' },
  { id: '6', title: 'Bwin Blackjack', provider: 'Bwin Exclusive', color: 'linear-gradient(135deg, #000000, #434343)', icon: <Coins size={40} />, category: 'Table Games', image: '/casino/blackjack.png' },
  { id: '7', title: 'Mega Moolah', provider: 'Microgaming', color: 'linear-gradient(135deg, #11998e, #38ef7d)', icon: <Diamond size={40} />, category: 'Slots', image: '/casino/mega_moolah.png' },
  { id: '8', title: 'European Roulette', provider: 'Playtech', color: 'linear-gradient(135deg, #2c3e50, #3498db)', icon: <Play size={40} />, category: 'Table Games', image: '/casino/european_roulette.png' },
];

interface CasinoProps {
  language?: string;
}

export const Casino: React.FC<CasinoProps> = ({ language = 'en' }) => {
  const [filter, setFilter] = useState<'All' | 'Slots' | 'Table Games' | 'Live Dealer'>('All');
  const [toast, setToast] = useState<string | null>(null);
  const [loadingGame, setLoadingGame] = useState<string | null>(null);

  const filteredGames = CASINO_GAMES.filter(g => filter === 'All' || g.category === filter);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePlayGame = (game: Game) => {
    setLoadingGame(game.id);
    showToast(`${t('Loading', language)} ${game.title}...`);
    setTimeout(() => {
      setLoadingGame(null);
      showToast(`${game.title} ${t('is ready! Demo mode.', language)}`);
    }, 1500);
  };

  const handleClaimBonus = () => {
    const bonusText = language === 'ru' 
      ? '🎁 Бонус активирован! 100% на первый депозит + 50 бесплатных вращений.'
      : language === 'de'
      ? '🎁 Bonus aktiviert! 100% auf die erste Einzahlung + 50 Freispiele.'
      : language === 'es'
      ? '🎁 ¡Bono activado! 100% en el primer depósito + 50 giros gratis.'
      : '🎁 Bonus activated! 100% on first deposit + 50 Free Spins.';
    showToast(bonusText);
  };

  return (
    <main className="main-content casino-container">
      {/* Toast */}
      {toast && (
        <div className="casino-toast" role="alert">
          {toast}
        </div>
      )}

      <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #1a1a1a, #ebd100)', color: '#000' }}>
        <div className="promo-content">
          <div className="promo-badge" style={{ background: '#000', color: '#ebd100' }}>{t('Exclusive Offer', language)}</div>
          <h2>{t('Casino Welcome Bonus', language)}</h2>
          <p>{t('Casino Welcome Bonus Desc', language)}</p>
          <button className="btn-promo" style={{ background: '#000', color: '#ebd100', borderColor: '#000' }} onClick={handleClaimBonus}>
            {t('Claim Bonus', language)}
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>{t('Casino Lobby', language)}</h2>
        <div className="casino-nav">
          <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>{t('All Games', language)}</button>
          <button className={filter === 'Slots' ? 'active' : ''} onClick={() => setFilter('Slots')}>{t('Slots', language)}</button>
          <button className={filter === 'Live Dealer' ? 'active' : ''} onClick={() => setFilter('Live Dealer')}>{t('Live Dealer', language)}</button>
          <button className={filter === 'Table Games' ? 'active' : ''} onClick={() => setFilter('Table Games')}>{t('Table Games', language)}</button>
        </div>
      </div>

      <div className="games-grid">
        {filteredGames.map(game => (
          <div key={game.id} className={`game-card ${loadingGame === game.id ? 'loading' : ''}`} onClick={() => handlePlayGame(game)}>
            <div 
              className="game-bg" 
              style={{ 
                background: game.color,
                backgroundImage: game.image ? `url(${game.image})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {!game.image && game.icon}
            </div>
            <div className="game-overlay">
              <button className="play-btn" onClick={(e) => { e.stopPropagation(); handlePlayGame(game); }}>
                {loadingGame === game.id ? t('Loading...', language) : t('Play Now', language)}
              </button>
            </div>
            <div className="game-info">
              <h3 className="game-title">{game.title}</h3>
              <p className="game-provider">{game.provider}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
