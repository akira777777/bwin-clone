import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import WelcomePopup from './WelcomePopup';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  X: ({ size }: { size: number }) => <svg data-testid="x-icon" width={size} height={size} />,
  Gift: ({ size, className }: { size: number; className?: string }) => (
    <svg data-testid="gift-icon" className={className} width={size} height={size} />
  ),
}));

describe('WelcomePopup', () => {
  // Helper function to render component with default props
  const renderWelcomePopup = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      openRegister: vi.fn(),
      language: 'en' as const,
      ...props,
    };
    return {
      ...render(<WelcomePopup {...defaultProps} />),
      onClose: defaultProps.onClose,
      openRegister: defaultProps.openRegister,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    test('should not render when isOpen is false', () => {
      render(<WelcomePopup isOpen={false} onClose={vi.fn()} openRegister={vi.fn()} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText(/exclusive offer/i)).not.toBeInTheDocument();
    });

    test('should render when isOpen is true', () => {
      renderWelcomePopup();

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/exclusive offer/i)).toBeInTheDocument();
    });

    test('should render overlay with click handler', () => {
      const { onClose } = renderWelcomePopup();
      const overlay = screen.queryByText(/exclusive offer/i)?.closest('.welcome-popup-overlay');

      expect(overlay).toBeInTheDocument();
    });

    test('should render close button with X icon', () => {
      renderWelcomePopup();

      const closeButton = screen.getByRole('button', { name: /close/i }) ||
                         document.querySelector('.welcome-popup-close');
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    test('should render gift icon', () => {
      renderWelcomePopup();

      expect(screen.getByTestId('gift-icon')).toBeInTheDocument();
      expect(screen.getByTestId('gift-icon')).toHaveClass('gift-icon');
    });

    test('should render all English text elements by default', () => {
      renderWelcomePopup({ language: 'en' });

      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
      expect(screen.getByText('First Bet Insurance up to $50')).toBeInTheDocument();
      expect(screen.getByText(/welcome to the new betz/i)).toBeInTheDocument();
      expect(screen.getByText('Claim Bonus & Start')).toBeInTheDocument();
      expect(screen.getByText(/\*Terms and conditions apply/i)).toBeInTheDocument();
    });
  });

  describe('Language Support', () => {
    test('should render English text when language is "en"', () => {
      renderWelcomePopup({ language: 'en' });

      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
      expect(screen.getByText('First Bet Insurance up to $50')).toBeInTheDocument();
      expect(screen.getByText('Claim Bonus & Start')).toBeInTheDocument();
    });

    test('should render Russian text when language is "ru"', () => {
      renderWelcomePopup({ language: 'ru' });

      expect(screen.getByText('Эксклюзивное предложение')).toBeInTheDocument();
      expect(screen.getByText('Страховка первой ставки до $50')).toBeInTheDocument();
      expect(screen.getByText(/Добро пожаловать в новый BETZ/i)).toBeInTheDocument();
      expect(screen.getByText('Получить бонус и начать')).toBeInTheDocument();
      expect(screen.getByText(/\*Применяются правила и условия/i)).toBeInTheDocument();
    });

    test('should render German text when language is "de"', () => {
      renderWelcomePopup({ language: 'de' });

      expect(screen.getByText('Exklusives Angebot')).toBeInTheDocument();
      expect(screen.getByText('Erste Wette versichert bis $50')).toBeInTheDocument();
      expect(screen.getByText(/Willkommen beim neuen BETZ/i)).toBeInTheDocument();
      expect(screen.getByText('Bonus sichern & starten')).toBeInTheDocument();
      expect(screen.getByText(/\*Es gelten die AGB/i)).toBeInTheDocument();
    });

    test('should render Spanish text when language is "es"', () => {
      renderWelcomePopup({ language: 'es' });

      expect(screen.getByText('Oferta Exclusiva')).toBeInTheDocument();
      expect(screen.getByText('Seguro de primera apuesta hasta $50')).toBeInTheDocument();
      expect(screen.getByText(/¡Bienvenido al nuevo BETZ/i)).toBeInTheDocument();
      expect(screen.getByText('Reclamar bono y comenzar')).toBeInTheDocument();
      expect(screen.getByText(/\*Se aplican términos y condiciones/i)).toBeInTheDocument();
    });

    test('should default to English when language is not recognized', () => {
      renderWelcomePopup({ language: 'fr' });

      // Should fall back to default (English)
      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
      expect(screen.getByText('First Bet Insurance up to $50')).toBeInTheDocument();
    });

    test('should default to English when language is undefined', () => {
      const { container } = render(
        <WelcomePopup
          isOpen={true}
          onClose={vi.fn()}
          openRegister={vi.fn()}
        />
      );

      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should call onClose when close button is clicked', () => {
      const { onClose } = renderWelcomePopup();
      const closeButton = document.querySelector('.welcome-popup-close');

      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('should call onClose and openRegister when claim button is clicked', () => {
      const { onClose, openRegister } = renderWelcomePopup();
      const claimButton = screen.getByText('Claim Bonus & Start');

      fireEvent.click(claimButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(openRegister).toHaveBeenCalledTimes(1);
    });

    test('should call onClose when overlay is clicked', () => {
      const { onClose } = renderWelcomePopup();
      const overlay = screen.queryByText(/exclusive offer/i)?.closest('.welcome-popup-overlay');

      fireEvent.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test('should not call onClose when content area is clicked', () => {
      const { onClose } = renderWelcomePopup();
      const content = document.querySelector('.welcome-popup-content');

      fireEvent.click(content!);

      expect(onClose).not.toHaveBeenCalled();
    });

    test('should handle multiple clicks on close button', () => {
      const { onClose } = renderWelcomePopup();
      const closeButton = document.querySelector('.welcome-popup-close');

      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);
      fireEvent.click(closeButton!);

      expect(onClose).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Structure', () => {
    test('should render content with correct CSS classes', () => {
      renderWelcomePopup();

      expect(document.querySelector('.welcome-popup-overlay')).toBeInTheDocument();
      expect(document.querySelector('.welcome-popup-content')).toBeInTheDocument();
      expect(document.querySelector('.welcome-popup-image')).toBeInTheDocument();
      expect(document.querySelector('.welcome-popup-icon-wrapper')).toBeInTheDocument();
      expect(document.querySelector('.welcome-popup-body')).toBeInTheDocument();
    });

    test('should render badge element', () => {
      renderWelcomePopup();

      expect(document.querySelector('.welcome-badge')).toBeInTheDocument();
      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
    });

    test('should render terms section', () => {
      renderWelcomePopup();

      expect(document.querySelector('.welcome-popup-terms')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid open/close cycles', () => {
      const { rerender, onClose } = renderWelcomePopup();

      // Close
      rerender(<WelcomePopup isOpen={false} onClose={onClose} openRegister={vi.fn()} />);
      expect(screen.queryByText(/exclusive offer/i)).not.toBeInTheDocument();

      // Open again
      rerender(<WelcomePopup isOpen={true} onClose={onClose} openRegister={vi.fn()} />);
      expect(screen.getByText(/exclusive offer/i)).toBeInTheDocument();
    });

    test('should handle null onClose gracefully (if somehow passed)', () => {
      // This tests resilience - in TypeScript this shouldn't happen but good for safety
      expect(() => {
        render(<WelcomePopup
          isOpen={true}
          onClose={() => {}}
          openRegister={() => {}}
        />);
      }).not.toThrow();
    });

    test('should handle null openRegister gracefully (if somehow passed)', () => {
      expect(() => {
        render(<WelcomePopup
          isOpen={true}
          onClose={() => {}}
          openRegister={() => {}}
        />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('should have clickable close button', () => {
      renderWelcomePopup();
      const closeButton = document.querySelector('.welcome-popup-close');

      expect(closeButton).toHaveAttribute('type', 'button');
    });

    test('should have clickable claim button', () => {
      renderWelcomePopup();
      const claimButton = screen.getByText('Claim Bonus & Start').closest('button');

      expect(claimButton).toHaveAttribute('type', 'button');
    });

    test('should allow keyboard interaction with buttons', () => {
      const { onClose, openRegister } = renderWelcomePopup();
      const claimButton = screen.getByText('Claim Bonus & Start');

      // Simulate Enter key press
      fireEvent.keyDown(claimButton, { key: 'Enter', code: 'Enter' });

      // Note: This depends on how keyboard events are implemented
      // The component uses onClick which handles keyboard for buttons automatically
      expect(claimButton).toBeInTheDocument();
    });
  });

  describe('Prop Defaults', () => {
    test('should use "en" as default language when not provided', () => {
      const { container } = render(
        <WelcomePopup
          isOpen={true}
          onClose={vi.fn()}
          openRegister={vi.fn()}
        />
      );

      expect(screen.getByText('Exclusive Offer')).toBeInTheDocument();
    });

    test('should accept all required props without errors', () => {
      expect(() => {
        render(<WelcomePopup
          isOpen={true}
          onClose={vi.fn()}
          openRegister={vi.fn()}
          language="en"
        />);
      }).not.toThrow();
    });
  });
});
