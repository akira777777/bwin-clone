import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { VirtualsSimulator } from './VirtualsSimulator';

// Mock Web Audio Context
const mockOscillator = {
  connect: vi.fn(),
  frequency: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  type: 'sine',
  start: vi.fn(),
  stop: vi.fn(),
};

const mockGain = {
  connect: vi.fn(),
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
};

const mockAudioContext = {
  createOscillator: vi.fn(() => mockOscillator),
  createGain: vi.fn(() => mockGain),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(100)),
  })),
  createBufferSource: vi.fn(() => ({
    connect: vi.fn(),
    start: vi.fn(),
  })),
  createBiquadFilter: vi.fn(() => ({
    type: 'bandpass',
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  })),
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

describe('VirtualsSimulator Component Tests', () => {
  const mockFootballEvent = {
    id: 'v1',
    sport: 'Virtual Football',
    team1: 'FC Alpha',
    team2: 'FC Beta',
    score1: 2,
    score2: 1,
    minute: 45,
    emoji: '⚽'
  };

  const mockTennisEvent = {
    id: 'v3',
    sport: 'Virtual Tennis',
    team1: 'Player A',
    team2: 'Player B',
    score1: 4,
    score2: 3,
    emoji: '🎾'
  };

  const mockRacingEvent = {
    id: 'v5',
    sport: 'Virtual Horse Racing',
    team1: 'Desert Storm',
    team2: 'Night Rider',
    score1: 0,
    score2: 0,
    emoji: '🐎'
  };

  const defaultProps = {
    onClose: vi.fn(),
    onScoreUpdate: vi.fn(),
    language: 'en'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with football details, scoreboard, and live indicators', () => {
    render(<VirtualsSimulator {...defaultProps} event={mockFootballEvent} />);
    
    expect(screen.getByText('Virtual Football')).toBeInTheDocument();
    expect(screen.getByText(/FC Alpha vs FC Beta/i).textContent).toContain('FC Alpha vs FC Beta');
    expect(screen.getByText('2 – 1')).toBeInTheDocument();
    expect(screen.getByText('LIVE COMMENTARY')).toBeInTheDocument();
  });

  it('translates details when language is Russian', () => {
    render(<VirtualsSimulator {...defaultProps} event={mockFootballEvent} language="ru" />);
    
    expect(screen.getByText('ХРОНИКА МАТЧА')).toBeInTheDocument();
  });

  it('renders visual football pitch with ball and possession details', () => {
    render(<VirtualsSimulator {...defaultProps} event={mockFootballEvent} />);
    
    expect(screen.getByText('FC Alpha')).toBeInTheDocument();
    expect(screen.getByText('FC Beta')).toBeInTheDocument();
    expect(document.querySelector('.v-field-ball')).toBeInTheDocument();
    expect(document.querySelector('.possession-fill')).toBeInTheDocument();
  });

  it('renders visual tennis court with scores and bouncing ball', () => {
    render(<VirtualsSimulator {...defaultProps} event={mockTennisEvent} />);
    
    expect(screen.getByText('Player A')).toBeInTheDocument();
    expect(screen.getByText('Player B')).toBeInTheDocument();
    expect(document.querySelector('.v-court-ball')).toBeInTheDocument();
    expect(document.querySelector('.tennis-points-widget')).toBeInTheDocument();
  });

  it('renders visual horse racing lanes with runners', () => {
    render(<VirtualsSimulator {...defaultProps} event={mockRacingEvent} />);
    
    expect(document.querySelector('.v-race-track')).toBeInTheDocument();
    const lanes = document.querySelectorAll('.race-lane');
    expect(lanes.length).toBe(6); // 6 lanes for 6 horses
  });

  it('toggles sound mode correctly on button click', async () => {
    const user = userEvent.setup();
    render(<VirtualsSimulator {...defaultProps} event={mockFootballEvent} />);
    
    const soundBtn = screen.getByTitle('Toggle sound');
    // Initially, it has Volume2 icon (since soundEnabled is true)
    expect(soundBtn.querySelector('svg')).toHaveClass('lucide-volume-2');
    
    // Toggle off
    await user.click(soundBtn);
    expect(soundBtn.querySelector('svg')).toHaveClass('lucide-volume-x');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onCloseMock = vi.fn();
    render(<VirtualsSimulator {...defaultProps} event={mockFootballEvent} onClose={onCloseMock} />);

    const closeBtn = screen.getByRole('button', { name: '×' });
    await user.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
