import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ProfileModal } from './ProfileModal';

describe('ProfileModal Component Tests', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    language: 'en',
    balance: 1000,
    vipLevel: 'Bronze',
    vipProgress: 45,
    vipProgressSubtext: '55.00 to Silver VIP',
    totalWagered: 45,
    depositLimit: 5000,
    setDepositLimit: vi.fn(),
    selfExclusionEndTime: 0,
    setSelfExclusionEndTime: vi.fn(),
    userEmail: 'test@example.com',
    triggerToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with user email and default active Details tab', () => {
    render(<ProfileModal {...defaultProps} />);
    expect(screen.getByText('Player Dashboard')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Profile/i })).toBeInTheDocument();
  });

  it('allows user to change avatar and save profile details', async () => {
    const user = userEvent.setup();
    const triggerToastMock = vi.fn();
    render(<ProfileModal {...defaultProps} triggerToast={triggerToastMock} />);

    // Click on Tiger avatar button
    const tigerBtn = screen.getByRole('button', { name: '🐯' });
    await user.click(tigerBtn);

    // Save profile details
    const saveBtn = screen.getByRole('button', { name: /Save Profile/i });
    await user.click(saveBtn);

    expect(triggerToastMock).toHaveBeenCalledWith('✓ Profile updated successfully!');
    expect(localStorage.getItem('betz_user_avatar')).toBe('🐯');
  });

  it('switches between tabs (Details, Stats, VIP, Safer Play)', async () => {
    const user = userEvent.setup();
    render(<ProfileModal {...defaultProps} />);

    // Switch to Stats tab
    const statsTab = screen.getByRole('button', { name: /Stats/i });
    await user.click(statsTab);
    expect(screen.getByText('Placed Tickets')).toBeInTheDocument();

    // Switch to VIP tab
    const vipTab = screen.getByRole('button', { name: /VIP/i });
    await user.click(vipTab);
    expect(screen.getByText('Bronze VIP')).toBeInTheDocument();
    expect(screen.getByText('VIP Level Tiers')).toBeInTheDocument();

    // Switch to Safer Play tab
    const saferTab = screen.getByRole('button', { name: /Safer Play/i });
    await user.click(saferTab);
    expect(screen.getByText(/Daily Deposit Limit/i)).toBeInTheDocument();
  });

  it('allows setting daily deposit limit', async () => {
    const user = userEvent.setup();
    const setDepositLimitMock = vi.fn();
    const triggerToastMock = vi.fn();
    render(
      <ProfileModal 
        {...defaultProps} 
        setDepositLimit={setDepositLimitMock}
        triggerToast={triggerToastMock}
      />
    );

    // Switch to Safer Play tab
    await user.click(screen.getByRole('button', { name: /Safer Play/i }));

    const limitInput = screen.getByRole('spinbutton');
    await user.clear(limitInput);
    await user.type(limitInput, '100');

    const setLimitBtn = screen.getByRole('button', { name: /Set Limit/i });
    await user.click(setLimitBtn);

    expect(setDepositLimitMock).toHaveBeenCalledWith(100);
    expect(triggerToastMock).toHaveBeenCalledWith('✓ Deposit limit saved successfully!');
  });

  it('supports self-exclusion block setup', async () => {
    const user = userEvent.setup();
    const setExclusionMock = vi.fn();
    const triggerToastMock = vi.fn();
    render(
      <ProfileModal 
        {...defaultProps} 
        setSelfExclusionEndTime={setExclusionMock}
        triggerToast={triggerToastMock}
      />
    );

    await user.click(screen.getByRole('button', { name: /Safer Play/i }));

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '1'); // Select 1 Hour

    const blockBtn = screen.getByRole('button', { name: /Block Account/i });
    await user.click(blockBtn);

    expect(setExclusionMock).toHaveBeenCalled();
    expect(triggerToastMock).toHaveBeenCalled();
  });

  it('displays exclusion warning and allow lift override if self-exclusion is active', () => {
    const activeExclusionEndTime = Date.now() + 60 * 60 * 1000; // 1 hour active
    render(
      <ProfileModal 
        {...defaultProps} 
        selfExclusionEndTime={activeExclusionEndTime}
      />
    );

    // Click Safer Play
    fireEvent.click(screen.getByRole('button', { name: /Safer Play/i }));

    expect(screen.getByText(/SELF-EXCLUSION ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Emergency Lift \(Demo Override\)/i })).toBeInTheDocument();
  });
});
