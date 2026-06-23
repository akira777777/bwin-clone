import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Play, Gem, Bomb, ArrowLeft, RefreshCw, Trophy, Coins } from 'lucide-react';
import './MinesGame.css';

interface MinesGameProps {
  balance: number;
  updateBalance: (newBalance: number) => void;
  language?: string;
  onBack: () => void;
  onWager?: (amount: number) => void;
}

interface Cell {
  id: number;
  opened: boolean;
  hasMine: boolean;
}

// Combinations (n choose r) helper
const nCr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  const rAdj = Math.min(r, n - r);
  let val = 1;
  for (let i = 1; i <= rAdj; i++) {
    val = val * (n - i + 1) / i;
  }
  return val;
};

// Calculate multiplier based on cells, mines, and found gems
// House edge is 1% (RTP 99%)
const calculateMinesMultiplier = (mines: number, gemsFound: number): number => {
  if (gemsFound === 0) return 1;
  const totalCells = 25;
  const totalGems = totalCells - mines;
  
  if (gemsFound > totalGems) return 0;
  
  const prob = nCr(totalGems, gemsFound) / nCr(totalCells, gemsFound);
  if (prob === 0) return 0;
  
  const mult = 0.99 / prob;
  return Math.round(mult * 100) / 100;
};

export const MinesGame: React.FC<MinesGameProps> = ({
  balance,
  updateBalance,
  language = 'en',
  onBack,
  onWager
}) => {
  // Game settings
  const [betInput, setBetInput] = useState<string>('10.00');
  const [minesCount, setMinesCount] = useState<number>(3);
  
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [board, setBoard] = useState<Cell[]>([]);
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [cashoutAmount, setCashoutAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [revealingAll, setRevealingAll] = useState<boolean>(false);
  const [clickedCellId, setClickedCellId] = useState<number | null>(null);

  // Audio state
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const revealTimeoutRef = useRef<number | null>(null);

  // Cleanup reveal timeout on unmount
  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  // Play a simple retro synth sound
  const playSound = useCallback((type: 'gem' | 'bomb' | 'win' | 'start') => {
    if (!isSoundOn || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'gem') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, now); // E4
        osc.frequency.setValueAtTime(440.00, now + 0.08); // A4
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked by browser policy', e);
    }
  }, [isSoundOn]);

  const resetBoard = useCallback(() => {
    const newBoard = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      opened: false,
      hasMine: false
    }));
    setBoard(newBoard);
    setGemsFound(0);
    setIsGameOver(false);
    setHasWon(false);
    setCashoutAmount(0);
    setClickedCellId(null);
    setRevealingAll(false);
  }, []);

  // Initializing board on mount
  useEffect(() => {
    const initTimer = setTimeout(() => {
      resetBoard();
    }, 0);
    return () => clearTimeout(initTimer);
  }, [resetBoard]);

  const handleStartGame = () => {
    const betVal = parseFloat(betInput);
    if (isNaN(betVal) || betVal <= 0) {
      setError(language === 'ru' ? 'Введите корректную сумму ставки' : 'Enter a valid bet amount');
      return;
    }
    if (betVal > balance) {
      setError(language === 'ru' ? 'Недостаточно средств на балансе' : 'Insufficient balance');
      return;
    }
    if (minesCount < 1 || minesCount > 24) {
      setError(language === 'ru' ? 'Количество мин должно быть от 1 до 24' : 'Mines count must be 1-24');
      return;
    }

    setError(null);
    updateBalance(balance - betVal);
    if (onWager) onWager(betVal);
    playSound('start');

    // Place mines randomly
    const newBoard = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      opened: false,
      hasMine: false
    }));

    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const randIndex = Math.floor(Math.random() * 25);
      const cell = newBoard[randIndex];
      if (cell && !cell.hasMine) {
        cell.hasMine = true;
        minesPlaced++;
      }
    }

    setBoard(newBoard);
    setGemsFound(0);
    setIsGameOver(false);
    setHasWon(false);
    setCashoutAmount(0);
    setRevealingAll(false);
    setIsPlaying(true);
  };

  const handleCellClick = (id: number) => {
    if (!isPlaying || isGameOver) return;
    const cell = board[id];
    if (!cell || cell.opened) return;

    setClickedCellId(id);
    const newBoard = [...board];
    const targetCell = newBoard[id];
    if (!targetCell) return;
    targetCell.opened = true;

    if (targetCell.hasMine) {
      // Boom! Lost.
      playSound('bomb');
      setIsGameOver(true);
      setHasWon(false);
      setIsPlaying(false);
      // Reveal all mines
      setRevealingAll(true);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = setTimeout(() => {
        setBoard(newBoard.map(c => c.hasMine ? { ...c, opened: true } : c));
      }, 300);
    } else {
      // Gem found!
      playSound('gem');
      const newGemsCount = gemsFound + 1;
      setGemsFound(newGemsCount);
      setBoard(newBoard);

      const multiplier = calculateMinesMultiplier(minesCount, newGemsCount);
      const currentWin = parseFloat(betInput) * multiplier;
      setCashoutAmount(currentWin);

      // Check if all gems are found
      const maxPossibleGems = 25 - minesCount;
      if (newGemsCount === maxPossibleGems) {
        handleCashout(currentWin);
      }
    }
  };

  const handleCashoutClick = () => {
    if (!isPlaying || isGameOver || cashoutAmount <= 0) return;
    handleCashout(cashoutAmount);
  };

  const handleCashout = (winAmount: number) => {
    playSound('win');
    updateBalance(balance + winAmount);
    setHasWon(true);
    setIsGameOver(true);
    setIsPlaying(false);
    setRevealingAll(true);
    setBoard(board.map(c => ({ ...c, opened: true })));
  };

  const handleQuickBet = (action: 'min' | 'div2' | 'mul2' | 'max') => {
    if (isPlaying) return;
    const current = parseFloat(betInput) || 0;
    if (action === 'min') {
      setBetInput('1.00');
    } else if (action === 'div2') {
      setBetInput(Math.max(1, current / 2).toFixed(2));
    } else if (action === 'mul2') {
      setBetInput(Math.min(balance, current * 2).toFixed(2));
    } else if (action === 'max') {
      setBetInput(balance.toFixed(2));
    }
  };

  const nextMultiplier = calculateMinesMultiplier(minesCount, gemsFound + 1);
  const currentMultiplier = calculateMinesMultiplier(minesCount, gemsFound);

  return (
    <div className="mines-container animation-slide-up">
      <div className="mines-header">
        <button className="btn-back-casino" onClick={onBack}>
          <ArrowLeft size={16} /> {language === 'ru' ? 'В лобби' : 'Back to Lobby'}
        </button>
        <div className="mines-header-title">
          <Shield size={24} className="accent-color" />
          <h2>BETZ Mines</h2>
          <span className="badge-original">ORIGINAL</span>
        </div>
        <button 
          className="btn-sound" 
          onClick={() => setIsSoundOn(!isSoundOn)}
          title="Toggle Sound Effects"
        >
          {isSoundOn ? '🔊' : '🔇'}
        </button>
      </div>

      <div className="mines-layout">
        <div className="mines-controls">
          {error && <div className="mines-error">{error}</div>}

          <div className="control-group">
            <label>{language === 'ru' ? 'Размер ставки' : 'Bet Amount'}</label>
            <div className="bet-input-wrapper">
              <span className="currency-prefix">€</span>
              <input
                type="number"
                value={betInput}
                onChange={(e) => !isPlaying && setBetInput(e.target.value)}
                disabled={isPlaying}
                min="1.00"
                step="1.00"
              />
            </div>
            <div className="quick-bet-buttons">
              <button disabled={isPlaying} onClick={() => handleQuickBet('min')}>Min</button>
              <button disabled={isPlaying} onClick={() => handleQuickBet('div2')}>½</button>
              <button disabled={isPlaying} onClick={() => handleQuickBet('mul2')}>2x</button>
              <button disabled={isPlaying} onClick={() => handleQuickBet('max')}>Max</button>
            </div>
          </div>

          <div className="control-group">
            <label>{language === 'ru' ? 'Количество бомб' : 'Mines'}</label>
            <select
              value={minesCount}
              onChange={(e) => !isPlaying && setMinesCount(parseInt(e.target.value))}
              disabled={isPlaying}
              className="mines-select"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? (language === 'ru' ? 'Мина' : 'Mine') : (language === 'ru' ? 'Мин(ы)' : 'Mines')}
                </option>
              ))}
            </select>
          </div>

          {!isPlaying ? (
            <button className="btn-action start-btn" onClick={handleStartGame}>
              <Play size={18} /> {language === 'ru' ? 'Начать игру' : 'Bet & Start'}
            </button>
          ) : (
            <button 
              className="btn-action cashout-btn" 
              onClick={handleCashoutClick}
              disabled={cashoutAmount === 0}
            >
              <Coins size={18} />
              {language === 'ru' ? 'Забрать' : 'Cash Out'} €{cashoutAmount.toFixed(2)}
            </button>
          )}

          {isPlaying && (
            <div className="mines-live-stats">
              <div className="stat-row">
                <span>{language === 'ru' ? 'Кристаллов найдено' : 'Gems Found'}:</span>
                <span className="val">{gemsFound} / {25 - minesCount}</span>
              </div>
              <div className="stat-row">
                <span>{language === 'ru' ? 'Текущий множитель' : 'Current Multiplier'}:</span>
                <span className="val multiplier-glow">{currentMultiplier.toFixed(2)}x</span>
              </div>
              <div className="stat-row">
                <span>{language === 'ru' ? 'Следующий коэффициент' : 'Next Tile'}:</span>
                <span className="val accent-color">{nextMultiplier.toFixed(2)}x</span>
              </div>
            </div>
          )}
        </div>

        <div className="mines-grid-container">
          {isGameOver && (
            <div className={`mines-game-status ${hasWon ? 'status-won' : 'status-lost'}`}>
              {hasWon ? (
                <>
                  <Trophy size={48} className="glow-icon" />
                  <h3>{language === 'ru' ? 'Вы выиграли!' : 'YOU WON!'}</h3>
                  <p className="payout-desc">
                    + €{cashoutAmount.toFixed(2)} ({currentMultiplier.toFixed(2)}x)
                  </p>
                </>
              ) : (
                <>
                  <Bomb size={48} className="shake-icon" />
                  <h3>{language === 'ru' ? 'Взрыв!' : 'BOMB HIT!'}</h3>
                  <p>{language === 'ru' ? 'Вы подорвались на мине.' : 'Better luck next time.'}</p>
                </>
              )}
              <button className="btn-replay" onClick={resetBoard}>
                <RefreshCw size={16} /> {language === 'ru' ? 'Сыграть еще' : 'Play Again'}
              </button>
            </div>
          )}

          <div className={`mines-board ${revealingAll ? 'revealing' : ''}`}>
            {board.map((cell) => {
              let cellClass = 'mines-cell';
              if (cell.opened) {
                cellClass += cell.hasMine ? ' opened-mine' : ' opened-gem';
              }
              if (clickedCellId === cell.id && cell.hasMine) {
                cellClass += ' clicked-mine';
              }

              return (
                <button
                  key={cell.id}
                  className={cellClass}
                  onClick={() => handleCellClick(cell.id)}
                  disabled={!isPlaying || isGameOver || cell.opened}
                >
                  <div className="cell-front"></div>
                  <div className="cell-back">
                    {cell.hasMine ? (
                      <Bomb size={24} className="bomb-icon" />
                    ) : (
                      <Gem size={24} className="gem-icon" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="multipliers-bar">
            {Array.from({ length: Math.min(8, 25 - minesCount) }, (_, i) => i + 1).map(step => {
              const stepMult = calculateMinesMultiplier(minesCount, step);
              const isCurrent = gemsFound === step;
              const isNext = gemsFound + 1 === step;
              
              return (
                <div 
                  key={step} 
                  className={`multiplier-step ${isCurrent ? 'active' : ''} ${isNext ? 'next' : ''}`}
                >
                  <span className="step-label">{step}</span>
                  <span className="step-val">{stepMult.toFixed(2)}x</span>
                </div>
              );
            })}
            {(25 - minesCount) > 8 && <div className="multiplier-step-more">...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
