import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Coins, Shield, Flame, Activity } from 'lucide-react';
import './CrashGame.css';

interface CrashGameProps {
  balance: number;
  updateBalance: (newBalance: number) => void;
  language?: string;
  onBack: () => void;
  onWager?: (amount: number) => void;
}

interface HistoryItem {
  id: string;
  multiplier: number;
}

interface FakePlayer {
  username: string;
  bet: number;
  cashout?: number;
  winAmount?: number;
  cashedOut: boolean;
}

const FAKE_USERNAMES = [
  'cyber_gambler', 'neon_rider', 'bet_master_99', 'lucky_spin', 'crypto_whale',
  'zenith_bets', 'space_pirate', 'luna_rocket', 'phoenix_win', 'alpha_gamer',
  'risk_taker', 'pixel_poker', 'gold_miner', 'apex_speculator', 'orbital_betz'
];

export const CrashGame: React.FC<CrashGameProps> = ({
  balance,
  updateBalance,
  language = 'en',
  onBack,
  onWager
}) => {
  // Config state
  const [betInput, setBetInput] = useState<string>('10.00');
  const [autoCashoutInput, setAutoCashoutInput] = useState<string>('2.00');
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);

  // Game phases: 'idle' | 'countdown' | 'live' | 'crashed'
  const [gamePhase, setGamePhase] = useState<'idle' | 'countdown' | 'live' | 'crashed'>('idle');
  const [countdown, setCountdown] = useState<number>(5);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.00);
  const [crashPoint, setCrashPoint] = useState<number>(1.00);
  
  // User bet state
  const [hasPlacedBet, setHasPlacedBet] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // History & Social stats
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `hist-${i}`,
      multiplier: Math.max(1.01, Math.round((1.01 + Math.random() * 5) * 100) / 100)
    }));
  });
  const [fakePlayers, setFakePlayers] = useState<FakePlayer[]>([]);

  // Refs for animations
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const multiplierRef = useRef<number>(1.00);
  const soundOscillatorRef = useRef<OscillatorNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);

  // Helper translations
  const tLabel = (enVal: string, ruVal: string) => (language === 'ru' ? ruVal : enVal);

  // Synth audio setup
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
  }, []);

  const playCrashSound = useCallback(() => {
    if (!isSoundOn) return;
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      // Noise burst for explosion
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(300, ctx.currentTime);
      noiseFilter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.4);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseNode.start();

      // Low frequency rumble oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(10, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio play block', e);
    }
  }, [isSoundOn, initAudio]);

  const stopMultiplierSound = useCallback(() => {
    if (soundOscillatorRef.current) {
      try {
        soundOscillatorRef.current.stop();
      } catch {
        // Already stopped
      }
      soundOscillatorRef.current = null;
    }
  }, []);

  const playMultiplierSound = useCallback((mult: number) => {
    if (!isSoundOn) {
      stopMultiplierSound();
      return;
    }
    initAudio();
    const ctx = audioContextRef.current;
    if (!ctx) return;

    try {
      if (!soundOscillatorRef.current) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        // Base frequency starts at 110Hz (A2)
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.02, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        soundOscillatorRef.current = osc;
        soundGainRef.current = gain;
      }

      if (soundOscillatorRef.current) {
        // Frequency increases exponentially with multiplier
        const targetFreq = 110 + (mult - 1.0) * 80;
        soundOscillatorRef.current.frequency.setTargetAtTime(Math.min(1200, targetFreq), ctx.currentTime, 0.05);
      }
    } catch (e) {
      console.warn('Audio play block', e);
    }
  }, [isSoundOn, initAudio, stopMultiplierSound]);

  // Canvas drawing loop
  const drawCanvas = useCallback((mult: number, phase: 'countdown' | 'live' | 'crashed') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with dark blue-black transparent background
    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      // Horizontal
      ctx.beginPath();
      ctx.moveTo(0, (height / 5) * i);
      ctx.lineTo(width, (height / 5) * i);
      ctx.stroke();
      // Vertical
      ctx.beginPath();
      ctx.moveTo((width / 5) * i, 0);
      ctx.lineTo((width / 5) * i, height);
      ctx.stroke();
    }

    if (phase === 'countdown') {
      return; // Draw only grid
    }

    // Draw exponential curve
    // X goes from 50 to width - 50, Y goes from height - 50 to 50
    const startX = 60;
    const startY = height - 60;
    const endX = width - 60;
    const endY = 60;

    // Calculate progression percentage based on multiplier
    // At multiplier 1.0 -> percent = 0. At 5.0 -> percent = 1
    const maxDisplayedMult = Math.max(3.0, mult);
    const progressX = Math.min(1.0, (mult - 1.0) / (maxDisplayedMult - 1.0));
    
    const currentX = startX + progressX * (endX - startX);
    // Y drops exponentially
    const currentY = startY - Math.pow(progressX, 1.8) * (startY - endY);

    // Gradient stroke for the curve
    const gradient = ctx.createLinearGradient(startX, startY, currentX, currentY);
    if (phase === 'crashed') {
      gradient.addColorStop(0, '#ff4444');
      gradient.addColorStop(1, '#ff8888');
    } else {
      gradient.addColorStop(0, 'var(--betz-accent)');
      gradient.addColorStop(1, '#34D399');
    }

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    // Draw bezier or quadratic curve approximating exponential growth
    ctx.quadraticCurveTo(
      startX + (currentX - startX) * 0.7,
      startY,
      currentX,
      currentY
    );

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = phase === 'crashed' ? 'rgba(255, 86, 86, 0.5)' : 'rgba(194, 249, 90, 0.5)';
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow

    // Glow circle at current position
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = phase === 'crashed' ? '#FF5656' : '#C2F95A';
    ctx.fill();

    // Rocket Icon/Sparkle on top of active tip
    if (phase === 'live') {
      ctx.beginPath();
      ctx.arc(currentX, currentY, 18, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(194, 249, 90, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simple yellow flame particles
      ctx.beginPath();
      ctx.moveTo(currentX - 10, currentY + 5);
      ctx.lineTo(currentX - 25 - Math.random() * 10, currentY + 10 + Math.random() * 5);
      ctx.lineTo(currentX - 10, currentY + 12);
      ctx.fillStyle = '#ff8c00';
      ctx.fill();
    } else if (phase === 'crashed') {
      // Explosion star
      ctx.beginPath();
      ctx.arc(currentX, currentY, 25, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 86, 86, 0.2)';
      ctx.fill();

      // Crash 'Boom' markers
      ctx.font = '800 12px Sora';
      ctx.fillStyle = '#FF5656';
      ctx.fillText('CRASHED', currentX - 30, currentY - 20);
    }
  }, []);

  // Quick Bet chips helper
  const handleQuickBet = (action: 'min' | 'div2' | 'mul2' | 'max') => {
    if (hasPlacedBet && gamePhase !== 'idle' && gamePhase !== 'crashed') return;
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

  // Cash Out handler
  const handleCashout = useCallback(() => {
    if (!hasPlacedBet || cashedOut || gamePhase !== 'live') return;

    const mult = multiplierRef.current;
    const win = betAmount * mult;

    setCashedOut(true);
    setWinAmount(win);
    updateBalance(balance + win);
    stopMultiplierSound();

    const payoutText = tLabel(
      `🏆 Cashed out at ${mult.toFixed(2)}x (+€${win.toFixed(2)})`,
      `🏆 Вывели на ${mult.toFixed(2)}x (+€${win.toFixed(2)})`
    );
    setError(payoutText); // Displays positive win feedback in same placeholder
  }, [hasPlacedBet, cashedOut, gamePhase, betAmount, balance, updateBalance, stopMultiplierSound]);

  // Main Loop logic for Crash Growth
  const startMultiplierRun = useCallback((targetCrash: number) => {
    startTimeRef.current = Date.now();
    multiplierRef.current = 1.00;
    setGamePhase('live');
    setWinAmount(0);

    // Reset fake players bets
    const freshPlayers: FakePlayer[] = Array.from({ length: 6 }, () => {
      const betVal = Math.floor(5 + Math.random() * 95);
      return {
        username: FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)] + '_' + Math.floor(Math.random() * 100),
        bet: betVal,
        cashedOut: false
      };
    });
    setFakePlayers(freshPlayers);

    const updateLoop = () => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      
      // Exponential curve: multiplier increases faster as time goes on
      // e.g. mult = 1.00 + e^(0.065 * t) - 1.00
      const current = 1.00 + (Math.pow(1.075, elapsedSeconds * 10) - 1.00);
      
      if (current >= targetCrash) {
        // Boom! Crash
        multiplierRef.current = targetCrash;
        setCurrentMultiplier(targetCrash);
        setGamePhase('crashed');
        playCrashSound();
        stopMultiplierSound();

        // Save history item
        setHistory(prev => [
          { id: `hist-${Date.now()}`, multiplier: targetCrash },
          ...prev.slice(0, 7)
        ]);

        // If user didn't cash out and had bet, they lost
        // reset states after a 3 second delay and start countdown again
        setTimeout(() => {
          setHasPlacedBet(false);
          setCashedOut(false);
          setBetAmount(0);
          setError(null);
          triggerNextRound();
        }, 3500);

        // Draw final frame
        drawCanvas(targetCrash, 'crashed');
      } else {
        multiplierRef.current = current;
        setCurrentMultiplier(current);
        playMultiplierSound(current);

        // Draw current curve point
        drawCanvas(current, 'live');

        // Auto Cashout check
        const autoVal = parseFloat(autoCashoutInput);
        if (hasPlacedBet && !cashedOut && !isNaN(autoVal) && autoVal > 1.00 && current >= autoVal) {
          handleCashout();
        }

        // Simulate live fake players cashing out
        setFakePlayers(prev => prev.map(player => {
          if (!player.cashedOut && Math.random() < 0.015 * current) {
            const playerCashout = Math.round(current * 100) / 100;
            return {
              ...player,
              cashedOut: true,
              cashout: playerCashout,
              winAmount: player.bet * playerCashout
            };
          }
          return player;
        }));

        animationFrameRef.current = requestAnimationFrame(updateLoop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [autoCashoutInput, hasPlacedBet, cashedOut, handleCashout, playCrashSound, playMultiplierSound, stopMultiplierSound, drawCanvas]);

  // Trigger round countdown
  const triggerNextRound = useCallback(() => {
    setGamePhase('countdown');
    setCountdown(5);
    setCurrentMultiplier(1.00);
    drawCanvas(1.00, 'countdown');

    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          
          // Generate crash point using fair casino math
          // House Edge 3% -> RTP 97%
          const E = 100;
          const H = Math.floor(Math.random() * 100);
          let target = 1.00;
          if (H >= 3) {
            // formula: target = 0.97 / (1 - P) where P is random [0,1)
            target = 0.97 / (1.00 - Math.random());
            target = Math.max(1.01, Math.round(target * 100) / 100);
          }
          setCrashPoint(target);
          
          // Start the run
          startMultiplierRun(target);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [drawCanvas, startMultiplierRun]);

  // Initial trigger on mount
  useEffect(() => {
    triggerNextRound();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      stopMultiplierSound();
    };
  }, [triggerNextRound, stopMultiplierSound]);

  // User places bet for next round
  const handlePlaceBet = () => {
    const betVal = parseFloat(betInput);
    if (isNaN(betVal) || betVal <= 0) {
      setError(tLabel('Enter a valid bet amount', 'Введите корректную сумму ставки'));
      return;
    }
    if (betVal > balance) {
      setError(tLabel('Insufficient balance', 'Недостаточно средств'));
      return;
    }

    setError(null);
    updateBalance(balance - betVal);
    if (onWager) onWager(betVal);

    setBetAmount(betVal);
    setHasPlacedBet(true);
    setCashedOut(false);
  };

  return (
    <div className="crash-container animation-slide-up">
      <div className="crash-header">
        <button className="btn-back-casino" onClick={onBack}>
          <ArrowLeft size={16} /> {tLabel('Back to Lobby', 'В лобби')}
        </button>
        <div className="crash-header-title">
          <Activity size={24} className="accent-color glow-icon" />
          <h2>BETZ Crash</h2>
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

      {/* History multipliers */}
      <div className="crash-history-bar">
        {history.map(item => {
          const isHigh = item.multiplier >= 2.0;
          const isEpic = item.multiplier >= 10.0;
          let badgeClass = 'history-multiplier';
          if (isEpic) badgeClass += ' epic';
          else if (isHigh) badgeClass += ' high';
          return (
            <span key={item.id} className={badgeClass}>
              {item.multiplier.toFixed(2)}x
            </span>
          );
        })}
      </div>

      <div className="crash-layout">
        {/* Controls Card */}
        <div className="crash-controls">
          {error && (
            <div className={`crash-message ${error.includes('🏆') ? 'success' : 'error'}`}>
              {error}
            </div>
          )}

          <div className="control-group">
            <label>{tLabel('Bet Amount', 'Размер ставки')}</label>
            <div className="bet-input-wrapper">
              <span className="currency-prefix">€</span>
              <input
                type="number"
                value={betInput}
                onChange={(e) => setBetInput(e.target.value)}
                disabled={hasPlacedBet && gamePhase !== 'crashed' && gamePhase !== 'idle'}
                min="1.00"
                step="1.00"
              />
            </div>
            <div className="quick-bet-buttons">
              <button disabled={hasPlacedBet && gamePhase !== 'crashed'} onClick={() => handleQuickBet('min')}>Min</button>
              <button disabled={hasPlacedBet && gamePhase !== 'crashed'} onClick={() => handleQuickBet('div2')}>½</button>
              <button disabled={hasPlacedBet && gamePhase !== 'crashed'} onClick={() => handleQuickBet('mul2')}>2x</button>
              <button disabled={hasPlacedBet && gamePhase !== 'crashed'} onClick={() => handleQuickBet('max')}>Max</button>
            </div>
          </div>

          <div className="control-group">
            <label>{tLabel('Auto Cash Out', 'Автовывод')}</label>
            <div className="bet-input-wrapper">
              <input
                type="number"
                value={autoCashoutInput}
                onChange={(e) => setAutoCashoutInput(e.target.value)}
                disabled={hasPlacedBet && gamePhase !== 'crashed' && gamePhase !== 'idle'}
                min="1.01"
                step="0.05"
              />
              <span className="currency-suffix">x</span>
            </div>
          </div>

          {/* Place / Cashout button */}
          {(!hasPlacedBet || gamePhase === 'crashed') ? (
            <button 
              className="btn-action start-btn" 
              onClick={handlePlaceBet}
              disabled={gamePhase === 'live' || (hasPlacedBet && gamePhase !== 'crashed')}
            >
              <Play size={18} /> {tLabel('Bet & Start', 'Сделать ставку')}
            </button>
          ) : cashedOut ? (
            <button className="btn-action cashed-out-btn" disabled>
              {tLabel('Cashed Out', 'Выигрыш забран')}
            </button>
          ) : (
            <button 
              className="btn-action cashout-btn" 
              onClick={handleCashout}
              disabled={gamePhase !== 'live'}
            >
              <Coins size={18} />
              {tLabel('Cash Out', 'Забрать')} €{(betAmount * currentMultiplier).toFixed(2)}
            </button>
          )}

          {/* Round Stats details */}
          <div className="crash-live-stats">
            <div className="stat-row">
              <span>{tLabel('Your Stake', 'Ваша ставка')}:</span>
              <span className="val">{hasPlacedBet ? `€${betAmount.toFixed(2)}` : '€0.00'}</span>
            </div>
            {hasPlacedBet && !cashedOut && gamePhase === 'live' && (
              <div className="stat-row">
                <span>{tLabel('Current Value', 'Текущая сумма')}:</span>
                <span className="val multiplier-glow">€{(betAmount * currentMultiplier).toFixed(2)}</span>
              </div>
            )}
            {cashedOut && (
              <div className="stat-row">
                <span>{tLabel('Win Payout', 'Выплата')}:</span>
                <span className="val accent-color font-display" style={{ fontWeight: '800' }}>+€{winAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Canvas & Live Plotting Screen */}
        <div className="crash-screen">
          <canvas ref={canvasRef} width={640} height={360} className="crash-canvas" />

          {/* Central Multiplier Indicator */}
          {gamePhase === 'countdown' && (
            <div className="crash-indicator countdown-box">
              <div className="countdown-label">{tLabel('NEXT ROUND STARTS IN', 'СЛЕДУЮЩИЙ РАУНД ЧЕРЕЗ')}</div>
              <div className="countdown-value">{countdown}s</div>
            </div>
          )}

          {gamePhase === 'live' && (
            <div className="crash-indicator live-box">
              <div className="multiplier-value font-display scale-animation">
                {currentMultiplier.toFixed(2)}x
              </div>
              <div className="live-status-label flex-align-gap">
                <Flame size={14} className="accent-color" />
                {tLabel('Rocket is climbing...', 'Ракета взлетает...')}
              </div>
            </div>
          )}

          {gamePhase === 'crashed' && (
            <div className="crash-indicator crash-box">
              <div className="crashed-label">{tLabel('FLEET CRASHED', 'РАКЕТА ВЗОРВАЛАСЬ')}</div>
              <div className="crashed-value font-display">
                @ {currentMultiplier.toFixed(2)}x
              </div>
            </div>
          )}
        </div>

        {/* Multiplayer live social feed */}
        <div className="crash-players-list">
          <h3 className="social-feed-title">
            <span className="pulse-dot"></span>
            {tLabel('Live Players', 'В игре')}
          </h3>
          <div className="players-scroll">
            {fakePlayers.map((player, idx) => (
              <div key={idx} className={`player-row ${player.cashedOut ? 'cashed-out' : ''}`}>
                <span className="player-name">{player.username}</span>
                <div className="player-bet-info">
                  <span className="player-bet">€{player.bet}</span>
                  {player.cashedOut && (
                    <span className="player-win accent-color font-display">
                      {player.cashout}x (+€{player.winAmount?.toFixed(1)})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
