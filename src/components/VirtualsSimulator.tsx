import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import './VirtualsSimulator.css';

interface VirtualsSimulatorProps {
  event: {
    id: string;
    sport: string;
    team1: string;
    team2: string;
    score1: number;
    score2: number;
    minute?: number;
    emoji: string;
  };
  onClose: () => void;
  onScoreUpdate: (id: string, score1: number, score2: number) => void;
  language?: string;
}

interface RunnerState {
  id: number;
  name: string;
  progress: number; // 0 to 100
  color: string;
  emoji: string;
}

export const VirtualsSimulator: React.FC<VirtualsSimulatorProps> = ({
  event,
  onClose,
  onScoreUpdate,
  language = 'en'
}) => {
  const tLabel = (en: string, ru: string) => (language === 'ru' ? ru : en);
  const sportType = (() => {
    const s = event.sport.toLowerCase();
    if (s.includes('football')) return 'football';
    if (s.includes('basketball')) return 'basketball';
    if (s.includes('greyhounds') || s.includes('dog')) return 'greyhounds';
    if (s.includes('horse') || s.includes('racing')) return 'horses';
    if (s.includes('tennis')) return 'tennis';
    return 'generic';
  })();

  const [commentary, setCommentary] = useState<string[]>(() => {
    const isRacing = sportType === 'horses' || sportType === 'greyhounds';
    if (isRacing) {
      return [
        language === 'ru' ? '🏁 Участники выстраиваются на старте...' : '🏁 Runners are lining up at the starting gate...',
        language === 'ru' ? '⚡ И они стартовали!' : '⚡ And they are OFF!'
      ];
    }
    return [
      language === 'ru' 
        ? `🏁 Добро пожаловать на трансляцию матча ${event.team1} — ${event.team2}.` 
        : `🏁 Welcome to the Live Simulator for ${event.team1} vs ${event.team2}.`,
      language === 'ru' ? '⚡ Матч начался!' : '⚡ Match is underway!'
    ];
  });
  const [possession, setPossession] = useState<number>(50); // percentage for team1
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  
  // Specific sports states
  // Racing states
  const [runners, setRunners] = useState<RunnerState[]>(() => {
    if (sportType !== 'horses' && sportType !== 'greyhounds') return [];
    const isDog = sportType === 'greyhounds';
    const names = isDog 
      ? ['Bolt', 'Slasher', 'Rex', 'Mercury', 'Comet', 'Vixen']
      : ['Desert Gold', 'Night Shadow', 'Stormbringer', 'Majesty', 'Gallop King', 'Wind Rider'];
    const colors = ['#FF5656', '#F4B740', '#34D399', '#7FA0FF', '#C2F95A', '#EAEEF3'];
    const emojis = isDog ? ['🐕', '🐕', '🐕', '🐕', '🐕', '🐕'] : ['🐎', '🐎', '🐎', '🐎', '🐎', '🐎'];

    return Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      name: `${language === 'ru' ? 'Бегун' : 'Runner'} ${i + 1} (${names[i]})`,
      progress: 0,
      color: colors[i] ?? '#FF5656',
      emoji: emojis[i] ?? '🐎'
    }));
  });
  const [raceActive, setRaceActive] = useState<boolean>(() => {
    return sportType === 'horses' || sportType === 'greyhounds';
  });
  const [podium, setPodium] = useState<number[]>([]);

  // Tennis states
  const [tennisPoints1, setTennisPoints1] = useState<string>('0');
  const [tennisPoints2, setTennisPoints2] = useState<string>('0');
  const [isBallOnLeft, setIsBallOnLeft] = useState<boolean>(true);
  const [tennisBallY, setTennisBallY] = useState<number>(55);

  const commentaryEndRef = useRef<HTMLDivElement>(null);

  // Audio Context synth beep
  const playSoundEffect = (type: 'whistle' | 'bounce' | 'cheer' | 'gallop') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      if (type === 'whistle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1200, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'bounce') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'cheer') {
        // Simple white noise approximation for crowd cheer
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseNode.start(now);
      } else if (type === 'gallop') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // AudioContext blocked
    }
  };

  // Scroll commentary to bottom
  useEffect(() => {
    if (typeof commentaryEndRef.current?.scrollIntoView === 'function') {
      commentaryEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commentary]);

  // Initial Simulator Sound
  useEffect(() => {
    playSoundEffect('whistle');
  }, []);

  // 1. Football / Basketball Simulation Loop
  useEffect(() => {
    if (sportType !== 'football' && sportType !== 'basketball') return;

    let localScore1 = event.score1;
    let localScore2 = event.score2;

    const gameInterval = setInterval(() => {
      const isHomeAttack = Math.random() > 0.45;
      const targetPossession = isHomeAttack ? Math.floor(55 + Math.random() * 20) : Math.floor(25 + Math.random() * 20);
      setPossession(targetPossession);

      // Attack simulation
      const phrases = isHomeAttack ? [
        tLabel(`${event.team1} attacks down the left wing...`, `${event.team1} атакует по левому флангу...`),
        tLabel(`Possession controlled by ${event.team1}.`, `Владение мячом переходит к ${event.team1}.`),
        tLabel(`Dangerous cross into the box by ${event.team1}!`, `Опасный прострел в штрафную от ${event.team1}!`)
      ] : [
        tLabel(`${event.team2} intercepting and counter-attacking...`, `${event.team2} перехватывает мяч и бежит в контратаку...`),
        tLabel(`${event.team2} controlling the pace in midfield.`, `${event.team2} контролирует темп в полузащите.`),
        tLabel(`Shot on target from ${event.team2}!`, `Удар в створ ворот от ${event.team2}!`)
      ];

      const chosenPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      if (chosenPhrase) {
        setCommentary(prev => [...prev, chosenPhrase]);
      }

      // Chance of goal
      const goalProbability = sportType === 'football' ? 0.08 : 0.45; // much higher for basketball
      if (Math.random() < goalProbability) {
        playSoundEffect('cheer');
        if (isHomeAttack) {
          localScore1 += sportType === 'football' ? 1 : Math.random() > 0.7 ? 3 : 2;
          onScoreUpdate(event.id, localScore1, localScore2);
          const goalText = tLabel(`⚽ GOAL!!! ${event.team1} scores!`, `⚽ ГОЛ!!! ${event.team1} забивает гол!`);
          if (goalText) setCommentary(prev => [...prev, goalText]);
        } else {
          localScore2 += sportType === 'football' ? 1 : Math.random() > 0.7 ? 3 : 2;
          onScoreUpdate(event.id, localScore1, localScore2);
          const goalText = tLabel(`⚽ GOAL!!! ${event.team2} scores!`, `⚽ ГОЛ!!! ${event.team2} забивает гол!`);
          if (goalText) setCommentary(prev => [...prev, goalText]);
        }
      }
    }, 4500);

    return () => clearInterval(gameInterval);
  }, [event.id, sportType, event.score1, event.score2]);

  // 2. Racing Simulation (Horses / Dogs)
  const initializeRace = () => {
    const isDog = sportType === 'greyhounds';
    const names = isDog 
      ? ['Bolt', 'Slasher', 'Rex', 'Mercury', 'Comet', 'Vixen']
      : ['Desert Gold', 'Night Shadow', 'Stormbringer', 'Majesty', 'Gallop King', 'Wind Rider'];
    const colors = ['#FF5656', '#F4B740', '#34D399', '#7FA0FF', '#C2F95A', '#EAEEF3'];
    const emojis = isDog ? ['🐕', '🐕', '🐕', '🐕', '🐕', '🐕'] : ['🐎', '🐎', '🐎', '🐎', '🐎', '🐎'];

    const initialRunners: RunnerState[] = Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      name: `${tLabel('Runner', 'Бегун')} ${i + 1} (${names[i]})`,
      progress: 0,
      color: colors[i] ?? '#FF5656',
      emoji: emojis[i] ?? '🐎'
    }));

    setRunners(initialRunners);
    setPodium([]);
    setRaceActive(true);
    setCommentary([
      tLabel('🏁 Runners are lining up at the starting gate...', '🏁 Участники выстраиваются на старте...'),
      tLabel('⚡ And they are OFF!', '⚡ И они стартовали!')
    ]);
  };

  // Race starts automatically via default state values on keyed mount

  useEffect(() => {
    if (!raceActive) return;

    const finishedIds: number[] = [];
    const raceInterval = setInterval(() => {
      playSoundEffect('gallop');
      setRunners(prev => {
        const next = prev.map(r => {
          if (r.progress >= 100) return r;
          const jump = Math.random() * 8 + 2;
          const newProgress = Math.min(100, r.progress + jump);
          if (newProgress === 100 && !finishedIds.includes(r.id)) {
            finishedIds.push(r.id);
          }
          return { ...r, progress: newProgress };
        });

        // Check if all finished
        const finishedAll = next.every(r => r.progress >= 100);
        if (finishedAll) {
          setRaceActive(false);
          clearInterval(raceInterval);
          setPodium(finishedIds.slice(0, 3));
          playSoundEffect('whistle');
          
          const winnerRunner = next.find(r => r.id === finishedIds[0]);
          setCommentary(prev => [
            ...prev,
            tLabel(`🏆 Race completed! Winner: Runner ${winnerRunner?.id}`, `🏆 Гонка завершена! Победитель: Участник ${winnerRunner?.id}`)
          ]);
        }

        return next;
      });
    }, 400);

    return () => clearInterval(raceInterval);
  }, [raceActive, sportType]);

  // 3. Tennis Simulation
  useEffect(() => {
    if (sportType !== 'tennis') return;

    const pointsArr = ['0', '15', '30', '40', 'AD'];
    const tennisInterval = setInterval(() => {
      playSoundEffect('bounce');
      // Alternate ball side
      setIsBallOnLeft(prev => !prev);
      setTennisBallY(45 + Math.random() * 20);

      if (Math.random() < 0.25) {
        // Point scored!
        const pointHome = Math.random() > 0.48;
        if (pointHome) {
          setTennisPoints1(prev => {
            const idx = pointsArr.indexOf(prev);
            if (prev === '40' && tennisPoints2 === 'AD') {
              setTennisPoints2('40'); // Deuce back
              return '40';
            }
            if (prev === '40' && tennisPoints2 !== '40') {
              // Game won!
              onScoreUpdate(event.id, event.score1 + 1, event.score2);
              setTennisPoints2('0');
              setCommentary(prevComm => [...prevComm, tLabel(`🎾 Game won by ${event.team1}!`, `🎾 Гейм выигран игроком ${event.team1}!`)]);
              return '0';
            }
            if (prev === 'AD') {
              onScoreUpdate(event.id, event.score1 + 1, event.score2);
              setTennisPoints2('0');
              setCommentary(prevComm => [...prevComm, tLabel(`🎾 Game won by ${event.team1}!`, `🎾 Гейм выигран игроком ${event.team1}!`)]);
              return '0';
            }
            return pointsArr[idx + 1] || '0';
          });
        } else {
          setTennisPoints2(prev => {
            const idx = pointsArr.indexOf(prev);
            if (prev === '40' && tennisPoints1 === 'AD') {
              setTennisPoints1('40'); // Deuce back
              return '40';
            }
            if (prev === '40' && tennisPoints1 !== '40') {
              onScoreUpdate(event.id, event.score1, event.score2 + 1);
              setTennisPoints1('0');
              setCommentary(prevComm => [...prevComm, tLabel(`🎾 Game won by ${event.team2}!`, `🎾 Гейм выигран игроком ${event.team2}!`)]);
              return '0';
            }
            if (prev === 'AD') {
              onScoreUpdate(event.id, event.score1, event.score2 + 1);
              setTennisPoints1('0');
              setCommentary(prevComm => [...prevComm, tLabel(`🎾 Game won by ${event.team2}!`, `🎾 Гейм выигран игроком ${event.team2}!`)]);
              return '0';
            }
            return pointsArr[idx + 1] || '0';
          });
        }
      }
    }, 2800);

    return () => clearInterval(tennisInterval);
  }, [event.id, sportType, event.score1, event.score2, tennisPoints1, tennisPoints2]);

  return (
    <div className="v-sim-container animation-slide-down">
      {/* Title block */}
      <div className="v-sim-header">
        <div className="v-sim-title">
          <span className="v-sim-live-indicator">
            <span className="live-dot-mini animate"></span>
            LIVE
          </span>
          <h4>{event.sport}</h4>
        </div>
        <div className="v-sim-controls">
          <button onClick={() => setSoundEnabled(!soundEnabled)} title="Toggle sound">
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button className="v-sim-close" onClick={onClose}>×</button>
        </div>
      </div>

      <div className="v-sim-content-layout">
        {/* Visual Game Screen */}
        <div className="v-sim-screen">
          
          {/* Football Attacking Field */}
          {(sportType === 'football' || sportType === 'basketball') && (
            <div className={`v-field ${sportType}`}>
              <div className="v-field-pitch">
                <div className="center-circle"></div>
                <div className="penalty-area left"></div>
                <div className="penalty-area right"></div>
                
                {/* Moving ball */}
                <div 
                  className="v-field-ball"
                  style={{
                    left: `${possession}%`,
                    top: `${40 + Math.sin(possession / 10) * 20}%`
                  }}
                >
                  ⚽
                </div>
              </div>
              <div className="possession-bar-wrapper">
                <div className="possession-labels">
                  <span>{event.team1}</span>
                  <span>{possession}% - {100 - possession}%</span>
                  <span>{event.team2}</span>
                </div>
                <div className="possession-bar">
                  <div className="possession-fill" style={{ width: `${possession}%` }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Tennis Court */}
          {sportType === 'tennis' && (
            <div className="v-court">
              <div className="v-court-pitch">
                <div className="net-line"></div>
                <div className="service-boxes"></div>
                
                {/* Bouncing ball */}
                <div 
                  className={`v-court-ball ${isBallOnLeft ? 'left' : 'right'}`}
                  style={{
                    top: `${tennisBallY}%`
                  }}
                >
                  🎾
                </div>
              </div>
              <div className="tennis-points-widget">
                <div className="point-row">
                  <span>{event.team1}</span>
                  <span className="pts">{tennisPoints1}</span>
                </div>
                <div className="point-row">
                  <span>{event.team2}</span>
                  <span className="pts">{tennisPoints2}</span>
                </div>
              </div>
            </div>
          )}

          {/* Racing track (Horses/Dogs) */}
          {(sportType === 'horses' || sportType === 'greyhounds') && (
            <div className="v-race-track">
              {runners.map(runner => (
                <div key={runner.id} className="race-lane">
                  <span className="lane-number">{runner.id}</span>
                  <div className="lane-rail">
                    <div 
                      className="runner-avatar" 
                      style={{ 
                        left: `calc(${runner.progress}% - 20px)`,
                        backgroundColor: runner.color 
                      }}
                    >
                      {runner.emoji}
                    </div>
                  </div>
                </div>
              ))}
              {!raceActive && podium.length > 0 && (
                <div className="podium-overlay">
                  <h5>🏁 RACE RESULTS</h5>
                  <div className="podium-positions">
                    <div className="podium-spot second">
                      <span className="spot-num">2nd</span>
                      <span className="runner-id" style={{ color: runners[(podium[1] ?? 1) - 1]?.color }}>#{podium[1] ?? '?'}</span>
                    </div>
                    <div className="podium-spot first">
                      <span className="spot-num">1st</span>
                      <span className="runner-id" style={{ color: runners[(podium[0] ?? 1) - 1]?.color }}>#{podium[0] ?? '?'}</span>
                    </div>
                    <div className="podium-spot third">
                      <span className="spot-num">3rd</span>
                      <span className="runner-id" style={{ color: runners[(podium[2] ?? 1) - 1]?.color }}>#{podium[2] ?? '?'}</span>
                    </div>
                  </div>
                  <button className="btn-restart-race" onClick={initializeRace}>
                    <RotateCcw size={13} /> Run Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scoreboard overlay */}
          <div className="v-sim-scoreboard">
            <span className="team-abbrev">{event.team1.substring(0, 3).toUpperCase()}</span>
            <span className="scores">{event.score1} – {event.score2}</span>
            <span className="team-abbrev">{event.team2.substring(0, 3).toUpperCase()}</span>
          </div>
        </div>

        {/* Live Commentary Feed */}
        <div className="v-sim-commentary">
          <div className="commentary-header">{tLabel('LIVE COMMENTARY', 'ХРОНИКА МАТЧА')}</div>
          <div className="commentary-list">
            {commentary.map((comm, index) => (
              <div key={index} className="commentary-item">
                <span className="time">{(index + 1) * 3}′</span>
                <p className="text">{comm}</p>
              </div>
            ))}
            <div ref={commentaryEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default VirtualsSimulator;
