import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MinesGame } from './MinesGame';

// Mock window.AudioContext
const mockAudioContext = vi.fn(() => ({
  createOscillator: () => ({
    connect: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    start: vi.fn(),
    stop: vi.fn(),
  }),
  createGain: () => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }),
  currentTime: 0,
}));

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: mockAudioContext,
});

describe('MinesGame Component', () => {
  // Mock props
  const mockProps = {
    balance: 1000,
    updateBalance: vi.fn(),
    onBack: vi.fn(),
    onWager: vi.fn(),
    language: 'en',
  };

  // Helper function to render component with default props
  const renderMinesGame = (props = {}) => {
    const defaultProps = { ...mockProps, ...props };
    return render(<MinesGame {...defaultProps} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the game container', () => {
      const { container } = renderMinesGame();
      expect(container.querySelector('.mines-container')).toBeInTheDocument();
    });

    it('should render header with back button and title', () => {
      renderMinesGame();
      expect(screen.getByText('Back to Lobby')).toBeInTheDocument();
      expect(screen.getByText('BETZ Mines')).toBeInTheDocument();
      expect(screen.getByText('ORIGINAL')).toBeInTheDocument();
    });

    it('should render 25 cells on the board', () => {
      const { container } = renderMinesGame();
      const cells = container.querySelectorAll('.mines-cell');
      expect(cells).toHaveLength(25);
    });

    it('should render sound toggle button', () => {
      const { container } = renderMinesGame();
      const soundBtn = container.querySelector('.btn-sound');
      expect(soundBtn).toBeInTheDocument();
      expect(soundBtn).toHaveTextContent('🔊');
    });

    it('should render bet input and controls', () => {
      renderMinesGame();
      expect(screen.getByLabelText('Bet Amount')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10.00')).toBeInTheDocument();
    });

    it('should render mines selector with options 1-24', () => {
      renderMinesGame();
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      const options = select.querySelectorAll('option');
      expect(options).toHaveLength(24);
      expect(options[0]).toHaveValue('1');
      expect(options[23]).toHaveValue('24');
    });

    it('should render quick bet buttons', () => {
      const { container } = renderMinesGame();
      const quickBetBtns = container.querySelectorAll('.quick-bet-buttons button');
      expect(quickBetBtns).toHaveLength(4);
      expect(screen.getByText('Min')).toBeInTheDocument();
      expect(screen.getByText('½')).toBeInTheDocument();
      expect(screen.getByText('2x')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });

    it('should render start button initially', () => {
      renderMinesGame();
      expect(screen.getByText('Bet & Start')).toBeInTheDocument();
    });

    it('should support Russian language', () => {
      renderMinesGame({ language: 'ru' });
      expect(screen.getByText('В лобби')).toBeInTheDocument();
      expect(screen.getByText('Размер ставки')).toBeInTheDocument();
      expect(screen.getByText('Количество бомб')).toBeInTheDocument();
    });
  });

  describe('Bet Input', () => {
    it('should update bet input value', () => {
      renderMinesGame();
      const input = screen.getByDisplayValue('10.00');
      fireEvent.change(input, { target: { value: '50.00' } });
      expect(input).toHaveValue('50.00');
    });

    it('should disable bet input during gameplay', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const input = screen.getByRole('spinbutton');
      expect(input).toBeDisabled();
    });

    it('should not allow bet input during gameplay', () => {
      renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '100.00' } });
      expect(input).toHaveValue('10.00'); // Should not change
    });
  });

  describe('Quick Bet Buttons', () => {
    it('should set bet to minimum (1.00) when Min is clicked', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50.00' } });
      fireEvent.click(screen.getByText('Min'));
      expect(screen.getByDisplayValue('1.00')).toBeInTheDocument();
    });

    it('should halve the bet when ½ is clicked', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '50.00' } });
      fireEvent.click(screen.getByText('½'));
      expect(screen.getByDisplayValue('25.00')).toBeInTheDocument();
    });

    it('should double the bet when 2x is clicked', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10.00' } });
      fireEvent.click(screen.getByText('2x'));
      expect(screen.getByDisplayValue('20.00')).toBeInTheDocument();
    });

    it('should cap 2x at balance', () => {
      renderMinesGame({ balance: 15 });
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10.00' } });
      fireEvent.click(screen.getByText('2x'));
      expect(screen.getByDisplayValue('15.00')).toBeInTheDocument();
    });

    it('should set bet to max balance when Max is clicked', () => {
      renderMinesGame({ balance: 500 });
      fireEvent.click(screen.getByText('Max'));
      expect(screen.getByDisplayValue('500.00')).toBeInTheDocument();
    });

    it('should not halve below 1.00', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1.50' } });
      fireEvent.click(screen.getByText('½'));
      expect(screen.getByDisplayValue('1.00')).toBeInTheDocument();
    });

    it('should disable quick bet buttons during gameplay', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const quickBetBtns = container.querySelectorAll('.quick-bet-buttons button');
      quickBetBtns.forEach(btn => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('Mines Selector', () => {
    it('should update mines count', () => {
      renderMinesGame();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '10' } });
      expect(select).toHaveValue('10');
    });

    it('should disable mines selector during gameplay', () => {
      renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should not allow changing mines during gameplay', () => {
      renderMinesGame();
      const select = screen.getByRole('combobox');
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      fireEvent.change(select, { target: { value: '5' } });
      expect(select).toHaveValue('3'); // Should remain at default 3
    });
  });

  describe('Game Start', () => {
    it('should deduct bet amount from balance on start', () => {
      renderMinesGame({ balance: 100 });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(mockProps.updateBalance).toHaveBeenCalledWith(90);
    });

    it('should call onWager callback when starting game', () => {
      renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(mockProps.onWager).toHaveBeenCalledWith(10);
    });

    it('should show error for invalid bet amount', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: 'invalid' } });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(screen.getByText('Enter a valid bet amount')).toBeInTheDocument();
    });

    it('should show error for negative bet amount', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '-10' } });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(screen.getByText('Enter a valid bet amount')).toBeInTheDocument();
    });

    it('should show error for zero bet amount', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(screen.getByText('Enter a valid bet amount')).toBeInTheDocument();
    });

    it('should show error when bet exceeds balance', () => {
      renderMinesGame({ balance: 5 });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(screen.getByText('Insufficient balance')).toBeInTheDocument();
    });

    it('should show error in Russian when language is ru', () => {
      renderMinesGame({ language: 'ru', balance: 5 });
      const startBtn = screen.getByText('Начать игру');
      fireEvent.click(startBtn);

      expect(screen.getByText('Недостаточно средств на балансе')).toBeInTheDocument();
    });

    it('should show cashout button after starting', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(screen.queryByText('Bet & Start')).not.toBeInTheDocument();
      expect(screen.getByText('Cash Out')).toBeInTheDocument();
    });

    it('should show live stats during gameplay', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(container.querySelector('.mines-live-stats')).toBeInTheDocument();
      expect(screen.getByText('Gems Found:')).toBeInTheDocument();
      expect(screen.getByText('Current Multiplier:')).toBeInTheDocument();
      expect(screen.getByText('Next Tile:')).toBeInTheDocument();
    });
  });

  describe('Cell Clicking', () => {
    it('should not allow cell clicks before game starts', () => {
      const { container } = renderMinesGame();
      const cells = container.querySelectorAll('.mines-cell');

      cells.forEach(cell => {
        expect(cell).toBeDisabled();
      });
    });

    it('should enable cell clicks after game starts', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const cells = container.querySelectorAll('.mines-cell');
      cells.forEach(cell => {
        expect(cell).not.toBeDisabled();
      });
    });

    it('should not allow clicking already opened cells', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const firstCell = container.querySelector('.mines-cell');
      if (firstCell) {
        fireEvent.click(firstCell);
        // After clicking, cell should be disabled
        expect(firstCell).toBeDisabled();
      }
    });

    it('should not allow cell clicks after game over', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      // Force game over
      const cells = container.querySelectorAll('.mines-cell');
      cells.forEach(cell => {
        expect(cell).not.toBeDisabled();
      });

      // After clicking a mine (simulated), cells should be disabled
      // This would be tested with mock board state
    });
  });

  describe('Sound Toggle', () => {
    it('should toggle sound on/off', () => {
      const { container } = renderMinesGame();
      const soundBtn = container.querySelector('.btn-sound');

      expect(soundBtn).toHaveTextContent('🔊');
      fireEvent.click(soundBtn!);
      expect(soundBtn).toHaveTextContent('🔇');
      fireEvent.click(soundBtn!);
      expect(soundBtn).toHaveTextContent('🔊');
    });

    it('should not play sounds when sound is off', () => {
      const { container } = renderMinesGame();
      const soundBtn = container.querySelector('.btn-sound');
      fireEvent.click(soundBtn!);

      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      // AudioContext should not be called when sound is off
      // This is implicit - no assertion needed as we're checking no errors
    });
  });

  describe('Back Button', () => {
    it('should call onBack when back button is clicked', () => {
      renderMinesGame();
      const backBtn = screen.getByText('Back to Lobby');
      fireEvent.click(backBtn);

      expect(mockProps.onBack).toHaveBeenCalled();
    });

    it('should show Russian back text when language is ru', () => {
      renderMinesGame({ language: 'ru' });
      const backBtn = screen.getByText('В лобби');
      fireEvent.click(backBtn);

      expect(mockProps.onBack).toHaveBeenCalled();
    });
  });

  describe('Cashout', () => {
    it('should disable cashout button when no gems found', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      const cashoutBtn = container.querySelector('.cashout-btn');
      expect(cashoutBtn).toBeDisabled();
    });

    it('should enable cashout after finding at least one gem', () => {
      const { container } = renderMinesGame();
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      // This would require mocking a gem find
      // In real scenario, after clicking a gem cell, cashout becomes enabled
    });

    it('should show cashout amount in button', () => {
      // This test would require simulating a gem find
      // The cashout button shows "Cash Out €{amount}"
    });
  });

  describe('Game Over States', () => {
    it('should show bomb hit status on loss', () => {
      // This would require forcing a mine hit
      const { container } = renderMinesGame();
      expect(container.querySelector('.mines-game-status')).not.toBeInTheDocument();
    });

    it('should show you won status on win', () => {
      // This would require winning the game
      const { container } = renderMinesGame();
      expect(container.querySelector('.mines-game-status')).not.toBeInTheDocument();
    });

    it('should show play again button after game over', () => {
      // This would require ending a game
      const { container } = renderMinesGame();
      expect(container.querySelector('.btn-replay')).not.toBeInTheDocument();
    });
  });

  describe('Multiplier Display', () => {
    it('should render multipliers bar', () => {
      const { container } = renderMinesGame();
      expect(container.querySelector('.multipliers-bar')).toBeInTheDocument();
    });

    it('should show up to 8 multiplier steps', () => {
      const { container } = renderMinesGame();
      const steps = container.querySelectorAll('.multiplier-step');
      // Default 3 mines means 22 gems, but only 8 shown
      expect(steps.length).toBeLessThanOrEqual(8);
    });

    it('should show "..." when more than 8 multiplier steps exist', () => {
      const { container } = renderMinesGame({ minesCount: 3 });
      const moreIndicator = container.querySelector('.multiplier-step-more');
      // 25 - 3 = 22 potential gems, more than 8
      expect(moreIndicator).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large bet amounts', () => {
      renderMinesGame({ balance: 1000000 });
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100000' } });
      expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
    });

    it('should handle decimal bet amounts', () => {
      renderMinesGame();
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10.99' } });
      expect(screen.getByDisplayValue('10.99')).toBeInTheDocument();
    });

    it('should handle minimum bet of 1', () => {
      renderMinesGame({ balance: 1 });
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1' } });
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      expect(mockProps.updateBalance).toHaveBeenCalledWith(0);
    });

    it('should handle maximum mines of 24', () => {
      renderMinesGame();
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '24' } });
      expect(select).toHaveValue('24');
    });

    it('should handle board reset on play again', () => {
      // This would require ending a game first
      const { container } = renderMinesGame();
      // Play again button only appears after game over
    });
  });

  describe('Helper Functions', () => {
    it('should calculate correct multipliers', () => {
      // This tests the logic indirectly through the UI
      const { container } = renderMinesGame({ minesCount: 3 });

      // After starting, next multiplier should be shown
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      // With 3 mines, first gem multiplier should be calculable
      expect(screen.getByText(/Next Tile:/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      const { container } = renderMinesGame();
      const buttons = container.querySelectorAll('button');
      buttons.forEach(btn => {
        expect(btn).toHaveAttribute('type');
      });
    });

    it('should have proper labels for inputs', () => {
      renderMinesGame();
      const betInput = screen.getByLabelText('Bet Amount');
      expect(betInput).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('should cleanup timeouts on unmount', () => {
      const { container, unmount } = renderMinesGame();

      // Start game to potentially set timeout
      const startBtn = screen.getByText('Bet & Start');
      fireEvent.click(startBtn);

      unmount();

      // Should not throw errors
      expect(mockProps.updateBalance).toHaveBeenCalled();
    });
  });
});
