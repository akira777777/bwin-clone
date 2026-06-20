import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { CrashGame } from './CrashGame';

// Mock Web Audio Context
const mockOscillator = {
  connect: vi.fn(),
  frequency: {
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
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
    type: 'lowpass',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
  })),
};

vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext));

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fillText: vi.fn(),
}));

describe('CrashGame Component Tests', () => {
  const defaultProps = {
    balance: 5000,
    updateBalance: vi.fn(),
    language: 'en',
    onBack: vi.fn(),
    onWager: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with title and main components', () => {
    render(<CrashGame {...defaultProps} />);
    expect(screen.getByText('BETZ Crash')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Lobby/i })).toBeInTheDocument();
    expect(screen.getByText(/Auto Cash Out/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bet & Start/i })).toBeInTheDocument();
  });

  it('translates elements when language is Russian', () => {
    render(<CrashGame {...defaultProps} language="ru" />);
    expect(screen.getByRole('button', { name: /В лобби/i })).toBeInTheDocument();
    expect(screen.getByText(/Размер ставки/i)).toBeInTheDocument();
    expect(screen.getByText(/Автовывод/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Сделать ставку/i })).toBeInTheDocument();
  });

  it('handles quick bet chip calculations correctly', async () => {
    const user = userEvent.setup();
    render(<CrashGame {...defaultProps} />);
    
    const input = screen.getAllByRole('spinbutton')[0] as HTMLInputElement;
    expect(input.value).toBe('10.00');

    const halfBtn = screen.getByRole('button', { name: '½' });
    await user.click(halfBtn);
    expect(input.value).toBe('5.00');

    const doubleBtn = screen.getByRole('button', { name: '2x' });
    await user.click(doubleBtn);
    expect(input.value).toBe('10.00');

    const minBtn = screen.getByRole('button', { name: 'Min' });
    await user.click(minBtn);
    expect(input.value).toBe('1.00');

    const maxBtn = screen.getByRole('button', { name: 'Max' });
    await user.click(maxBtn);
    expect(input.value).toBe('5000.00');
  });

  it('calls onBack handler when back button is clicked', async () => {
    const user = userEvent.setup();
    const onBackMock = vi.fn();
    render(<CrashGame {...defaultProps} onBack={onBackMock} />);

    await user.click(screen.getByRole('button', { name: /Back to Lobby/i }));
    expect(onBackMock).toHaveBeenCalledTimes(1);
  });

  it('allows user to place bet and updates balance', async () => {
    const user = userEvent.setup();
    const updateBalanceMock = vi.fn();
    const onWagerMock = vi.fn();
    render(
      <CrashGame 
        {...defaultProps} 
        balance={100}
        updateBalance={updateBalanceMock} 
        onWager={onWagerMock}
      />
    );

    const betBtn = screen.getByRole('button', { name: /Bet & Start/i });
    await user.click(betBtn);

    expect(updateBalanceMock).toHaveBeenCalledWith(90);
    expect(onWagerMock).toHaveBeenCalledWith(10);
  });

  it('shows error message if bet amount exceeds balance', async () => {
    const user = userEvent.setup();
    render(<CrashGame {...defaultProps} balance={5} />);

    const betBtn = screen.getByRole('button', { name: /Bet & Start/i });
    await user.click(betBtn);

    expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
  });
});
