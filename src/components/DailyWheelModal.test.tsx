import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { DailyWheelModal } from './DailyWheelModal';

describe('DailyWheelModal Component Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    balance: 100,
    updateBalance: vi.fn(),
    language: 'en',
    triggerToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (props = {}) => {
    return render(<DailyWheelModal {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders nothing when isOpen is false', () => {
      render(<DailyWheelModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText(/Daily Reward Wheel/i)).not.toBeInTheDocument();
    });

    it('renders correctly with default props', () => {
      renderComponent();
      expect(screen.getByText(/Daily Reward Wheel/i)).toBeInTheDocument();
      expect(screen.getByText(/Spin the wheel once every 24 hours/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Spin Now/i })).toBeInTheDocument();
    });

    it('renders in Russian language when language prop is "ru"', () => {
      renderComponent({ language: 'ru' });
      expect(screen.getByText(/Ежедневный Спин/i)).toBeInTheDocument();
      expect(screen.getByText(/Испытайте удачу раз в 24 часа/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Крутить!/i })).toBeInTheDocument();
    });

    it('renders the close button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    it('renders the wheel with SVG segments', () => {
      const { container } = renderComponent();
      const svg = container.querySelector('.wheel-svg');
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelectorAll('path')).toHaveLength(8);
    });

    it('renders the wheel pointer', () => {
      const { container } = renderComponent();
      const pointer = container.querySelector('.wheel-pointer');
      expect(pointer).toBeInTheDocument();
    });

    it('renders all wheel segments with correct labels', () => {
      renderComponent();
      expect(screen.getByText('€1.00')).toBeInTheDocument();
      expect(screen.getByText('€5.00')).toBeInTheDocument();
      expect(screen.getByText('€0.50')).toBeInTheDocument();
      expect(screen.getByText('€10.00')).toBeInTheDocument();
      expect(screen.getByText('€2.00')).toBeInTheDocument();
      expect(screen.getByText('€25.00')).toBeInTheDocument();
      expect(screen.getByText('€0.20')).toBeInTheDocument();
      expect(screen.getByText('€50.00')).toBeInTheDocument();
    });
  });

  describe('Initial Spin Availability', () => {
    it('shows spin button when no previous spin recorded', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: /Spin Now/i })).toBeInTheDocument();
      expect(screen.queryByTestId(/cooldown-indicator/i)).not.toBeInTheDocument();
    });

    it('shows cooldown when previous spin was less than 24 hours ago', () => {
      const recentSpin = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
      localStorage.setItem('betz_last_wheel_spin', recentSpin.toString());

      renderComponent();
      vi.runAllTimers();

      expect(screen.queryByRole('button', { name: /Spin Now/i })).not.toBeInTheDocument();
      expect(screen.getByText(/Next spin in:/i)).toBeInTheDocument();
    });

    it('calculates correct cooldown time remaining', () => {
      const recentSpin = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
      localStorage.setItem('betz_last_wheel_spin', recentSpin.toString());

      renderComponent();
      vi.runAllTimers();

      expect(screen.getByText(/12h \d+m/i)).toBeInTheDocument();
    });

    it('shows spin button when 24 hours have elapsed since last spin', () => {
      const oldSpin = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      localStorage.setItem('betz_last_wheel_spin', oldSpin.toString());

      renderComponent();
      vi.runAllTimers();

      expect(screen.getByRole('button', { name: /Spin Now/i })).toBeInTheDocument();
    });
  });

  describe('Spin Functionality', () => {
    it('enables spinning when canSpin is true', async () => {
      const user = userEvent.setup();
      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      expect(spinBtn).not.toBeDisabled();
    });

    it('disables spin button during spinning', async () => {
      const user = userEvent.setup();
      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      // Button should be disabled immediately after click
      expect(spinBtn).toBeDisabled();
      expect(spinBtn).toHaveTextContent(/Spinning\.\.\./i);
    });

    it('disables spin button when cooldown is active', () => {
      const recentSpin = Date.now() - 12 * 60 * 60 * 1000;
      localStorage.setItem('betz_last_wheel_spin', recentSpin.toString());

      renderComponent();

      const spinBtn = screen.queryByRole('button', { name: /Spin Now/i });
      expect(spinBtn).not.toBeInTheDocument();
    });

    it('disables close button during spinning', async () => {
      const user = userEvent.setup();
      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      const closeBtn = screen.getByRole('button', { name: '' });
      expect(closeBtn).toBeDisabled();
    });

    it('updates rotation state when spin starts', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      const wheel = container.querySelector('.wheel-outer');
      expect(wheel).not.toHaveStyle({ transform: expect.stringContaining('rotate') });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      // After clicking, wheel should have rotation applied
      await waitFor(() => {
        expect(wheel).toHaveStyle({ transform: expect.stringContaining('rotate') });
      });
    });

    it('applies correct transition style during spin', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      const wheel = container.querySelector('.wheel-outer');
      await waitFor(() => {
        expect(wheel).toHaveStyle({
          transition: 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1)'
        });
      });
    });
  });

  describe('Prize Calculation & Distribution', () => {
    it('selects a random segment and shows prize after spin completes', async () => {
      const user = userEvent.setup();
      const updateBalanceMock = vi.fn();
      const triggerToastMock = vi.fn();

      renderComponent({
        updateBalance: updateBalanceMock,
        triggerToast: triggerToastMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      // Fast-forward past the spin duration
      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(screen.getByText(/Prize:/i)).toBeInTheDocument();
      });
    });

    it('updates balance with prize amount after spin', async () => {
      const user = userEvent.setup();
      const updateBalanceMock = vi.fn();

      renderComponent({
        balance: 100,
        updateBalance: updateBalanceMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(updateBalanceMock).toHaveBeenCalled();
        const newBalance = updateBalanceMock.mock.calls[0][0];
        expect(newBalance).toBeGreaterThan(100);
        expect(newBalance).toBeLessThanOrEqual(150); // Max prize is 50
      });
    });

    it('stores spin timestamp in localStorage after spin', async () => {
      const user = userEvent.setup();

      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        const lastSpin = localStorage.getItem('betz_last_wheel_spin');
        expect(lastSpin).toBeTruthy();
        const spinTime = parseInt(lastSpin!);
        expect(spinTime).toBeCloseTo(Date.now(), -3); // Within seconds
      });
    });

    it('triggers toast notification with prize amount in English', async () => {
      const user = userEvent.setup();
      const triggerToastMock = vi.fn();

      renderComponent({
        language: 'en',
        triggerToast: triggerToastMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(triggerToastMock).toHaveBeenCalledWith(
          expect.stringMatching(/You won €\d+\.\d+ added to your balance!/),
          'deposit'
        );
      });
    });

    it('triggers toast notification with prize amount in Russian', async () => {
      const user = userEvent.setup();
      const triggerToastMock = vi.fn();

      renderComponent({
        language: 'ru',
        triggerToast: triggerToastMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Крутить!/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(triggerToastMock).toHaveBeenCalledWith(
          expect.stringMatching(/Вы выиграли €\d+\.\d+ на баланс!/),
          'deposit'
        );
      });
    });

    it('disables spin capability after successful spin', async () => {
      const user = userEvent.setup();

      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Spin Now/i })).not.toBeInTheDocument();
        expect(screen.getByText(/Next spin in:/i)).toBeInTheDocument();
      });
    });

    it('prevents multiple simultaneous spins', async () => {
      const user = userEvent.setup();
      const updateBalanceMock = vi.fn();

      renderComponent({
        updateBalance: updateBalanceMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });

      // Click multiple times rapidly
      await user.click(spinBtn);
      await user.click(spinBtn);
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      // Should only call updateBalance once
      await waitFor(() => {
        expect(updateBalanceMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Close Button Interaction', () => {
    it('calls onClose handler when close button is clicked', async () => {
      const user = userEvent.setup();
      const onCloseMock = vi.fn();

      renderComponent({
        onClose: onCloseMock,
      });

      const closeBtn = screen.getByRole('button', { name: '' });
      await user.click(closeBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when close button is disabled during spin', async () => {
      const user = userEvent.setup();
      const onCloseMock = vi.fn();

      renderComponent({
        onClose: onCloseMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      const closeBtn = screen.getByRole('button', { name: '' });
      await user.click(closeBtn);

      expect(closeBtn).toBeDisabled();
      expect(onCloseMock).not.toHaveBeenCalled();
    });
  });

  describe('Cooldown Timer Updates', () => {
    it('updates cooldown timer every minute when on cooldown', async () => {
      const recentSpin = Date.now() - 12 * 60 * 60 * 1000;
      localStorage.setItem('betz_last_wheel_spin', recentSpin.toString());

      renderComponent();
      vi.runAllTimers();

      const initialText = screen.getByText(/Next spin in:/i).textContent;

      // Advance time by 1 minute
      vi.advanceTimersByTime(60000);

      await waitFor(() => {
        const newText = screen.getByText(/Next spin in:/i).textContent;
        expect(newText).not.toBe(initialText);
      });
    });

    it('shows cooldown in Russian when language is ru', () => {
      const recentSpin = Date.now() - 12 * 60 * 60 * 1000;
      localStorage.setItem('betz_last_wheel_spin', recentSpin.toString());

      renderComponent({ language: 'ru' });
      vi.runAllTimers();

      expect(screen.getByText(/Следующий спин через:/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero balance correctly', async () => {
      const user = userEvent.setup();
      const updateBalanceMock = vi.fn();

      renderComponent({
        balance: 0,
        updateBalance: updateBalanceMock,
      });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(updateBalanceMock).toHaveBeenCalled();
        const newBalance = updateBalanceMock.mock.calls[0][0];
        expect(newBalance).toBeGreaterThan(0);
      });
    });

    it('handles very large balance correctly', () => {
      renderComponent({
        balance: 999999,
      });

      expect(screen.getByRole('button', { name: /Spin Now/i })).toBeInTheDocument();
    });

    it('handles malformed localStorage data gracefully', () => {
      localStorage.setItem('betz_last_wheel_spin', 'invalid');

      expect(() => renderComponent()).not.toThrow();
    });

    it('handles negative localStorage timestamp gracefully', () => {
      localStorage.setItem('betz_last_wheel_spin', '-123456789');

      expect(() => renderComponent()).not.toThrow();
    });

    it('renders correctly when triggered with missing optional props', () => {
      const minimalProps = {
        isOpen: true,
        onClose: vi.fn(),
        balance: 100,
        updateBalance: vi.fn(),
        triggerToast: vi.fn(),
      };

      expect(() => render(<DailyWheelModal {...minimalProps} />)).not.toThrow();
    });
  });

  describe('Wheel Visuals', () => {
    it('renders wheel with correct segment colors', () => {
      const { container } = renderComponent();
      const paths = container.querySelectorAll('.wheel-svg path');

      expect(paths).toHaveLength(8);
      // Check that segments have different colors
      const colors = Array.from(paths).map(p => p.getAttribute('fill'));
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });

    it('applies rotation transform to wheel during spin', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      const wheel = container.querySelector('.wheel-outer');
      expect(wheel).toHaveStyle({ transform: 'rotate(0deg)' });

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      await waitFor(() => {
        const style = wheel?.getAttribute('style');
        expect(style).toContain('rotate');
        expect(style).toContain('deg');
      });
    });

    it('removes transition when not spinning', () => {
      const { container } = renderComponent();
      const wheel = container.querySelector('.wheel-outer');

      expect(wheel).not.toHaveStyle({
        transition: expect.any(String)
      });
    });
  });

  describe('Prize Display', () => {
    it('displays trophy icon with prize announcement', async () => {
      const user = userEvent.setup();

      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        const prizeContainer = screen.getByText(/Prize:/i).closest('div');
        expect(prizeContainer).toHaveClass('wheel-prize-announcement');
      });
    });

    it('formats prize amounts to 2 decimal places', async () => {
      const user = userEvent.setup();

      renderComponent();

      const spinBtn = screen.getByRole('button', { name: /Spin Now/i });
      await user.click(spinBtn);

      vi.advanceTimersByTime(4000);

      await waitFor(() => {
        const prizeText = screen.getByText(/Prize:/i).textContent;
        expect(prizeText).toMatch(/€\d+\.\d{2}/);
      });
    });
  });
});
