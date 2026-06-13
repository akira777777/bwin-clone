import React, { useState } from 'react';
import { Play, Sparkles, Diamond, Coins } from 'lucide-react';
import './Casino.css';

interface Game {
  id: string;
  title: string;
  provider: string;
  color: string;
  icon: React.ReactNode;
  category: 'Slots' | 'Table Games' | 'Live Dealer';
}

const CASINO_GAMES: Game[] = [
  { id: '1', title: 'Book of Dead', provider: 'Play\'n GO', color: 'linear-gradient(135deg, #b92b27, #1565C0)', icon: <Sparkles size={40} />, category: 'Slots' },
  { id: '2', title: 'Lightning Roulette', provider: 'Evolution', color: 'linear-gradient(135deg, #1f4037, #99f2c8)', icon: <Coins size={40} />, category: 'Live Dealer' },
  { id: '3', title: 'Crazy Time', provider: 'Evolution', color: 'linear-gradient(135deg, #f12711, #f5af19)', icon: <Play size={40} />, category: 'Live Dealer' },
  { id: '4', title: 'Starburst', provider: 'NetEnt', color: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', icon: <Diamond size={40} />, category: 'Slots' },
  { id: '5', title: 'Sweet Bonanza', provider: 'Pragmatic Play', color: 'linear-gradient(135deg, #ff00cc, #333399)', icon: <Sparkles size={40} />, category: 'Slots' },
  { id: '6', title: 'Bwin Blackjack', provider: 'Bwin Exclusive', color: 'linear-gradient(135deg, #000000, #434343)', icon: <Coins size={40} />, category: 'Table Games' },
  { id: '7', title: 'Mega Moolah', provider: 'Microgaming', color: 'linear-gradient(135deg, #11998e, #38ef7d)', icon: <Diamond size={40} />, category: 'Slots' },
  { id: '8', title: 'European Roulette', provider: 'Playtech', color: 'linear-gradient(135deg, #2c3e50, #3498db)', icon: <Play size={40} />, category: 'Table Games' },
];

export const Casino: React.FC = () => {
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
    showToast(`Loading ${game.title}...`);
    setTimeout(() => {
      setLoadingGame(null);
      showToast(`${game.title} is ready! Demo mode.`);
    }, 1500);
  };

  const handleClaimBonus = () => {
    showToast('🎁 Bonus activated! 100% on first deposit + 50 Free Spins.');
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
          <div className="promo-badge" style={{ background: '#000', color: '#ebd100' }}>Exclusive Offer</div>
          <h2>100% Casino Welcome Bonus up to $200</h2>
          <p>Double your first deposit and get 50 Free Spins on Starburst.</p>
          <button className="btn-promo" style={{ background: '#000', color: '#ebd100', borderColor: '#000' }} onClick={handleClaimBonus}>
            Claim Bonus
          </button>
        </div>
      </div>

      <div className="casino-header">
        <h2>Casino Lobby</h2>
        <div className="casino-nav">
          <button className={filter === 'All' ? 'active' : ''} onClick={() => setFilter('All')}>All Games</button>
          <button className={filter === 'Slots' ? 'active' : ''} onClick={() => setFilter('Slots')}>Slots</button>
          <button className={filter === 'Live Dealer' ? 'active' : ''} onClick={() => setFilter('Live Dealer')}>Live Dealer</button>
          <button className={filter === 'Table Games' ? 'active' : ''} onClick={() => setFilter('Table Games')}>Table Games</button>
        </div>
      </div>

      <div className="games-grid">
        {filteredGames.map(game => (
          <div key={game.id} className={`game-card ${loadingGame === game.id ? 'loading' : ''}`} onClick={() => handlePlayGame(game)}>
            <div className="game-bg" style={{ background: game.color }}>
              {game.icon}
            </div>
            <div className="game-overlay">
              <button className="play-btn" onClick={(e) => { e.stopPropagation(); handlePlayGame(game); }}>
                {loadingGame === game.id ? 'Loading...' : 'Play Now'}
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
