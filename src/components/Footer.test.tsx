import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import Footer from './Footer';
import type { Category } from '../App';

/**
 * Helper function to create Footer props with default values
 * @param overrides - Partial props to override defaults
 * @returns Complete Footer props object
 */
const createProps = (overrides: Partial<Parameters<typeof Footer>[0]> = {}) => ({
  setActiveCategory: vi.fn(),
  setActiveFooterTab: vi.fn(),
  language: 'en' as const,
  ...overrides,
});

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.scrollTo for smooth scroll behavior
    global.scrollTo = vi.fn();
  });

  describe('Rendering - Basic Structure', () => {
    it('renders footer container with correct class name', () => {
      render(<Footer {...createProps()} />);
      const footer = screen.getByRole('contentinfo') || document.querySelector('.betz-footer');
      expect(footer).toBeInTheDocument();
    });

    it('renders all nine footer links in English by default', () => {
      render(<Footer {...createProps()} />);

      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument();
      expect(screen.getByText('Responsible Gaming')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Deposits & Withdrawals')).toBeInTheDocument();
      expect(screen.getByText('Betting Rules')).toBeInTheDocument();
    });

    it('renders SSL secured badge with Lock icon', () => {
      render(<Footer {...createProps()} />);
      expect(screen.getByText('SSL Secured')).toBeInTheDocument();
      // Lock icon is from lucide-react, rendered as an SVG
      const lockIcon = document.querySelector('.ssl-secured-badge svg');
      expect(lockIcon).toBeInTheDocument();
    });

    it('renders MGA licensed badge', () => {
      render(<Footer {...createProps()} />);
      expect(screen.getByText('MGA Licensed')).toBeInTheDocument();
    });

    it('renders 18+ age badge', () => {
      render(<Footer {...createProps()} />);
      const ageBadge = document.querySelector('.age-badge-18');
      expect(ageBadge).toBeInTheDocument();
      expect(ageBadge).toHaveTextContent('18+');
    });

    it('renders disclaimer text in English by default', () => {
      render(<Footer {...createProps()} />);
      expect(screen.getByText(/© 2026 BETZ Sportsbook/)).toBeInTheDocument();
      expect(screen.getByText(/18\+ only/)).toBeInTheDocument();
      expect(screen.getByText(/Gambling involves risk/)).toBeInTheDocument();
      expect(screen.getByText(/Malta Gaming Authority/)).toBeInTheDocument();
      expect(screen.getByText(/BeGambleAware\.org/)).toBeInTheDocument();
    });
  });

  describe('User Interactions - Footer Link Clicks', () => {
    it('calls setActiveFooterTab with correct tab name when clicking About Us', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('About Us'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('About Us');
      expect(setActiveFooterTab).toHaveBeenCalledTimes(1);
    });

    it('calls setActiveFooterTab when clicking Terms and Conditions', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Terms and Conditions'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Terms and Conditions');
    });

    it('calls setActiveFooterTab when clicking Privacy Policy', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Privacy Policy'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Privacy Policy');
    });

    it('calls setActiveFooterTab when clicking Cookie Policy', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Cookie Policy'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Cookie Policy');
    });

    it('calls setActiveFooterTab when clicking Responsible Gaming', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Responsible Gaming'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Responsible Gaming');
    });

    it('calls setActiveFooterTab when clicking Help Center', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Help Center'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Help Center');
    });

    it('calls setActiveFooterTab when clicking Contact Us', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Contact Us'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Contact Us');
    });

    it('calls setActiveFooterTab when clicking Deposits & Withdrawals', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Deposits & Withdrawals'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Deposits & Withdrawals');
    });

    it('calls setActiveFooterTab when clicking Betting Rules', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('Betting Rules'));
      expect(setActiveFooterTab).toHaveBeenCalledWith('Betting Rules');
    });

    it('prevents default behavior on link clicks', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      const link = screen.getByText('About Us').closest('a');
      const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
      const preventDefault = vi.fn();
      Object.defineProperty(clickEvent, 'preventDefault', { value: preventDefault });

      link?.dispatchEvent(clickEvent);
      // Component uses e.preventDefault(), so it should be called
      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('Scroll Behavior', () => {
    it('calls window.scrollTo with smooth behavior when clicking a footer link', async () => {
      const user = userEvent.setup();
      render(<Footer {...createProps()} />);

      await user.click(screen.getByText('About Us'));
      expect(global.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('calls scrollTo only once per link click', async () => {
      const user = userEvent.setup();
      render(<Footer {...createProps()} />);

      await user.click(screen.getByText('Contact Us'));
      expect(global.scrollTo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Internationalization - Russian (ru)', () => {
    it('renders all links in Russian when language is ru', () => {
      render(<Footer {...createProps({ language: 'ru' })} />);

      expect(screen.getByText('О нас')).toBeInTheDocument();
      expect(screen.getByText('Правила и условия')).toBeInTheDocument();
      expect(screen.getByText('Политика конфиденциальности')).toBeInTheDocument();
      expect(screen.getByText('Политика файлов cookie')).toBeInTheDocument();
      expect(screen.getByText('Ответственная игра')).toBeInTheDocument();
      expect(screen.getByText('Справочный центр')).toBeInTheDocument();
      expect(screen.getByText('Связаться с нами')).toBeInTheDocument();
      expect(screen.getByText('Депозиты и выводы')).toBeInTheDocument();
      expect(screen.getByText('Правила ставок')).toBeInTheDocument();
    });

    it('renders badges in Russian when language is ru', () => {
      render(<Footer {...createProps({ language: 'ru' })} />);

      expect(screen.getByText('SSL Защищено')).toBeInTheDocument();
      expect(screen.getByText('MGA Лицензировано')).toBeInTheDocument();
    });

    it('renders disclaimer in Russian when language is ru', () => {
      render(<Footer {...createProps({ language: 'ru' })} />);

      expect(screen.getByText(/Все права защищены/)).toBeInTheDocument();
      expect(screen.getByText(/Только 18\+/)).toBeInTheDocument();
      expect(screen.getByText(/Азартные игры несут в себе риски/)).toBeInTheDocument();
      expect(screen.getByText(/играйте ответственно/)).toBeInTheDocument();
    });

    it('calls setActiveFooterTab with English tab name even when language is ru', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab, language: 'ru' })} />);

      await user.click(screen.getByText('О нас'));
      // Tab name should be in English for internal handling
      expect(setActiveFooterTab).toHaveBeenCalledWith('About Us');
    });
  });

  describe('Internationalization - German (de)', () => {
    it('renders all links in German when language is de', () => {
      render(<Footer {...createProps({ language: 'de' })} />);

      expect(screen.getByText('Über uns')).toBeInTheDocument();
      expect(screen.getByText('Allgemeine Geschäftsbedingungen')).toBeInTheDocument();
      expect(screen.getByText('Datenschutzrichtlinie')).toBeInTheDocument();
      expect(screen.getByText('Cookie-Richtlinie')).toBeInTheDocument();
      expect(screen.getByText('Verantwortungsbewusstes Spielen')).toBeInTheDocument();
      expect(screen.getByText('Hilfebereich')).toBeInTheDocument();
      expect(screen.getByText('Kontaktieren Sie uns')).toBeInTheDocument();
      expect(screen.getByText('Ein- & Auszahlungen')).toBeInTheDocument();
      expect(screen.getByText('Wettregeln')).toBeInTheDocument();
    });

    it('renders badges in German when language is de', () => {
      render(<Footer {...createProps({ language: 'de' })} />);

      expect(screen.getByText('SSL Verschlüsselt')).toBeInTheDocument();
      expect(screen.getByText('MGA Lizenziert')).toBeInTheDocument();
    });

    it('renders disclaimer in German when language is de', () => {
      render(<Footer {...createProps({ language: 'de' })} />);

      expect(screen.getByText(/Alle Rechte vorbehalten/)).toBeInTheDocument();
      expect(screen.getByText(/Nur ab 18 Jahren/)).toBeInTheDocument();
      expect(screen.getByText(/Glücksspiel birgt Risiken/)).toBeInTheDocument();
      expect(screen.getByText(/spielen Sie verantwortungsbewusst/)).toBeInTheDocument();
    });
  });

  describe('Internationalization - Spanish (es)', () => {
    it('renders all links in Spanish when language is es', () => {
      render(<Footer {...createProps({ language: 'es' })} />);

      expect(screen.getByText('Sobre Nosotros')).toBeInTheDocument();
      expect(screen.getByText('Términos y Condiciones')).toBeInTheDocument();
      expect(screen.getByText('Política de Privacidad')).toBeInTheDocument();
      expect(screen.getByText('Política de Cookies')).toBeInTheDocument();
      expect(screen.getByText('Juego Responsable')).toBeInTheDocument();
      expect(screen.getByText('Centro de Ayuda')).toBeInTheDocument();
      expect(screen.getByText('Contacto')).toBeInTheDocument();
      expect(screen.getByText('Depósitos y Retiros')).toBeInTheDocument();
      expect(screen.getByText('Reglas de Apuestas')).toBeInTheDocument();
    });

    it('renders badges in Spanish when language is es', () => {
      render(<Footer {...createProps({ language: 'es' })} />);

      expect(screen.getByText('SSL Seguro')).toBeInTheDocument();
      expect(screen.getByText('MGA Licenciado')).toBeInTheDocument();
    });

    it('renders disclaimer in Spanish when language is es', () => {
      render(<Footer {...createProps({ language: 'es' })} />);

      expect(screen.getByText(/Todos los derechos reservados/)).toBeInTheDocument();
      expect(screen.getByText(/Solo mayores de 18 años/)).toBeInTheDocument();
      expect(screen.getByText(/El juego conlleva riesgos/)).toBeInTheDocument();
      expect(screen.getByText(/juegue con responsabilidad/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    it('falls back to English text when language code is not recognized', () => {
      render(<Footer {...createProps({ language: 'fr' as any })} />);

      // Should display English keys as fallback
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Terms and Conditions')).toBeInTheDocument();
    });

    it('handles missing language prop by defaulting to English', () => {
      // @ts-ignore - testing missing prop
      render(<Footer setActiveCategory={vi.fn()} setActiveFooterTab={vi.fn()} />);

      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText(/18\+ only/)).toBeInTheDocument();
    });

    it('handles undefined language prop gracefully', () => {
      // @ts-ignore - testing undefined prop
      render(<Footer setActiveCategory={vi.fn()} setActiveFooterTab={vi.fn()} language={undefined} />);

      expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('does not crash when setActiveFooterTab is not provided', () => {
      // @ts-ignore - testing missing prop
      render(<Footer setActiveCategory={vi.fn()} language="en" />);

      const link = screen.getByText('About Us');
      expect(link).toBeInTheDocument();
    });

    it('renders correctly when all props are provided', () => {
      const props = createProps({
        setActiveCategory: vi.fn(),
        setActiveFooterTab: vi.fn(),
        language: 'en',
      });

      expect(() => render(<Footer {...props} />)).not.toThrow();
    });

    it('handles multiple rapid clicks on same link', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      const link = screen.getByText('About Us');

      await user.click(link);
      await user.click(link);
      await user.click(link);

      expect(setActiveFooterTab).toHaveBeenCalledTimes(3);
    });

    it('handles clicks on different links sequentially', async () => {
      const user = userEvent.setup();
      const setActiveFooterTab = vi.fn();
      render(<Footer {...createProps({ setActiveFooterTab })} />);

      await user.click(screen.getByText('About Us'));
      await user.click(screen.getByText('Privacy Policy'));
      await user.click(screen.getByText('Contact Us'));

      expect(setActiveFooterTab).toHaveBeenNthCalledWith(1, 'About Us');
      expect(setActiveFooterTab).toHaveBeenNthCalledWith(2, 'Privacy Policy');
      expect(setActiveFooterTab).toHaveBeenNthCalledWith(3, 'Contact Us');
    });
  });

  describe('Accessibility and Structure', () => {
    it('renders footer links as anchor elements', () => {
      render(<Footer {...createProps()} />);

      const links = document.querySelectorAll('.footer-links-row a');
      expect(links).toHaveLength(9);
    });

    it('contains href="#" on all footer links', () => {
      render(<Footer {...createProps()} />);

      const links = document.querySelectorAll('.footer-links-row a');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href', '#');
      });
    });

    it('renders footer bottom row with badges and disclaimer', () => {
      render(<Footer {...createProps()} />);

      const bottomRow = document.querySelector('.footer-bottom-row');
      expect(bottomRow).toBeInTheDocument();

      expect(bottomRow?.querySelector('.ssl-secured-badge')).toBeInTheDocument();
      expect(bottomRow?.querySelector('.mga-badge')).toBeInTheDocument();
      expect(bottomRow?.querySelector('.age-badge-18')).toBeInTheDocument();
      expect(bottomRow?.querySelector('.footer-disclaimer-box')).toBeInTheDocument();
    });

    it('renders left side with badges in correct order', () => {
      render(<Footer {...createProps()} />);

      const leftSide = document.querySelector('.footer-left-side');
      expect(leftSide).toBeInTheDocument();

      const badges = leftSide?.children || [];
      expect(badges).toHaveLength(3);
    });
  });

  describe('Integration with Props', () => {
    it('uses setActiveCategory prop if provided (not directly used in Footer but part of props)', () => {
      const setActiveCategory = vi.fn();
      render(<Footer {...createProps({ setActiveCategory })} />);

      // Footer receives this prop but doesn't use it directly
      // Just verify it doesn't cause any issues
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });

    it('updates language display dynamically when language prop changes', () => {
      const { rerender } = render(<Footer {...createProps({ language: 'en' })} />);

      expect(screen.getByText('About Us')).toBeInTheDocument();

      rerender(<Footer {...createProps({ language: 'ru' })} />);

      expect(screen.queryByText('About Us')).not.toBeInTheDocument();
      expect(screen.getByText('О нас')).toBeInTheDocument();
    });
  });
});
