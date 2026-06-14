import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import './CryptoDeposit.css';

type CryptoId = 'BTC' | 'ETH' | 'USDT' | 'LTC';
type Stage = 'input' | 'processing' | 'confirmed';

interface CryptoConfig {
  id: CryptoId;
  name: string;
  network: string;
  icon: string;
  color: string;
  address: string;
  baseRate: number;
  minDeposit: number;
  confirmations: string;
}

const CRYPTOS: CryptoConfig[] = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Network',
    icon: '₿',
    color: '#F7931A',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    baseRate: 62450,
    minDeposit: 0.0001,
    confirmations: '2 confirmations (~20 min)',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    icon: 'Ξ',
    color: '#627EEA',
    address: '0x742d35Cc6634C0532925a3b8D4C9C0a62c6bBcd8',
    baseRate: 3215,
    minDeposit: 0.001,
    confirmations: '12 confirmations (~3 min)',
  },
  {
    id: 'USDT',
    name: 'Tether USD',
    network: 'TRON (TRC-20)',
    icon: '₮',
    color: '#26A17B',
    address: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
    baseRate: 0.921,
    minDeposit: 10,
    confirmations: '20 confirmations (~1 min)',
  },
  {
    id: 'LTC',
    name: 'Litecoin',
    network: 'Litecoin Network',
    icon: 'Ł',
    color: '#BFBBBB',
    address: 'ltc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6ed',
    baseRate: 84.2,
    minDeposit: 0.01,
    confirmations: '6 confirmations (~15 min)',
  },
];

const GRID = 21;
const CELL = 8;
const PAD = 10;
const SVG_SIZE = GRID * CELL + PAD * 2;

interface QRProps {
  address: string;
  icon: string;
  color: string;
}

function QRCodeSVG({ address, icon, color }: QRProps) {
  const cells: React.ReactNode[] = [];

  const isFinderPattern = (r: number, c: number) => {
    const inTL = r <= 6 && c <= 6;
    const inTR = r <= 6 && c >= 14;
    const inBL = r >= 14 && c <= 6;
    if (!inTL && !inTR && !inBL) return false;
    const localR = inTL ? r : inTR ? r : r - 14;
    const localC = inTL ? c : inTR ? c - 14 : c;
    const ring = Math.max(localR, localC, 6 - localR, 6 - localC);
    return ring === 6 || ring === 4 || ring <= 2;
  };

  const isTimingPattern = (r: number, c: number) =>
    (r === 6 && c >= 8 && c <= 12) || (c === 6 && r >= 8 && r <= 12);

  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      let dark = false;
      if (isFinderPattern(r, c)) {
        dark = true;
      } else if (isTimingPattern(r, c)) {
        dark = (r + c) % 2 === 0;
      } else {
        const idx = (r * GRID + c) % address.length;
        dark = (address.charCodeAt(idx) + r + c) % 3 !== 2;
      }
      if (dark) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={PAD + c * CELL}
            y={PAD + r * CELL}
            width={CELL}
            height={CELL}
            fill="#000"
          />
        );
      }
    }
  }

  return (
    <svg
      width={SVG_SIZE}
      height={SVG_SIZE}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      className="crypto-qr"
    >
      <rect width={SVG_SIZE} height={SVG_SIZE} fill="#fff" rx="4" />
      {cells}
      <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={14} fill={color} />
      <text
        x={SVG_SIZE / 2}
        y={SVG_SIZE / 2 + 5}
        textAnchor="middle"
        fontSize="14"
        fill="#fff"
        fontFamily="monospace"
      >
        {icon}
      </text>
    </svg>
  );
}

function formatRate(rate: number, id: CryptoId): string {
  if (id === 'USDT') {
    return rate.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
  if (id === 'LTC') {
    return rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return Math.round(rate).toLocaleString('en-US');
}

interface CryptoDepositProps {
  onDeposit: (eurAmount: number) => void;
  onClose: () => void;
  language: string;
}

export default function CryptoDeposit({ onDeposit, onClose }: CryptoDepositProps) {
  const [activeCrypto, setActiveCrypto] = useState<CryptoId>('BTC');
  const [rates, setRates] = useState<Record<CryptoId, number>>({
    BTC: 62450,
    ETH: 3215,
    USDT: 0.921,
    LTC: 84.2,
  });
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>('input');
  const [confirmedEur, setConfirmedEur] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRates(prev => ({
        BTC: prev.BTC * (1 + (Math.random() - 0.5) * 0.008),
        ETH: prev.ETH * (1 + (Math.random() - 0.5) * 0.008),
        USDT: 0.921 + (Math.random() - 0.5) * 0.003,
        LTC: prev.LTC * (1 + (Math.random() - 0.5) * 0.008),
      }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setAmount('');
    setStage('input');
  }, [activeCrypto]);

  const crypto = CRYPTOS.find(c => c.id === activeCrypto)!;
  const rate = rates[activeCrypto];
  const numAmount = parseFloat(amount) || 0;
  const eurAmount = Math.round(numAmount * rate * 100) / 100;
  const isMinMet = numAmount >= crypto.minDeposit;

  const handleSent = () => {
    if (!isMinMet || numAmount === 0) return;
    const eur = eurAmount;
    setConfirmedEur(eur);
    setStage('processing');
    setTimeout(() => {
      onDeposit(eur);
      setStage('confirmed');
    }, 3000);
  };

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(crypto.address).catch(() => undefined);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="crypto-overlay" onClick={handleOverlayClick}>
      <div className="crypto-modal">
        <div className="crypto-modal-header">
          <div className="crypto-modal-title">
            <span className="crypto-modal-title-icon">₿</span>
            Crypto Deposit
          </div>
          <button className="crypto-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="crypto-rate-ticker">
          <span className="crypto-live-dot" />
          <span className="crypto-live-label">LIVE</span>
          {CRYPTOS.map(c => (
            <span key={c.id} className="crypto-rate-item">
              <span style={{ color: c.color }}>{c.icon}</span>
              {c.id} = €{formatRate(rates[c.id], c.id)}
            </span>
          ))}
        </div>

        <div className="crypto-tabs">
          {CRYPTOS.map(c => (
            <button
              key={c.id}
              className={`crypto-tab${activeCrypto === c.id ? ' active' : ''}`}
              style={activeCrypto === c.id ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => setActiveCrypto(c.id)}
            >
              <span className="crypto-tab-icon">{c.icon}</span>
              {c.id}
            </button>
          ))}
        </div>

        <div className="crypto-network-badge">
          {crypto.network}
        </div>

        {stage === 'input' && (
          <div className="crypto-input-stage">
            <div className="crypto-wallet-section">
              <div className="crypto-qr-wrapper">
                <QRCodeSVG address={crypto.address} icon={crypto.icon} color={crypto.color} />
              </div>
              <div className="crypto-wallet-info">
                <div className="crypto-wallet-label">Deposit address</div>
                <div className="crypto-address-row">
                  <span className="crypto-address">{crypto.address}</span>
                  <button className="crypto-copy-btn" onClick={handleCopy} aria-label="Copy address">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                {copied && <div className="crypto-copied-msg">Address copied!</div>}
                <div className="crypto-meta">
                  <div className="crypto-meta-row">
                    <span className="crypto-meta-label">Min. deposit</span>
                    <span className="crypto-meta-value">
                      {crypto.minDeposit} {crypto.id}
                      <span className="crypto-meta-eur"> ≈ €{(crypto.minDeposit * rate).toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="crypto-meta-row">
                    <span className="crypto-meta-label">Confirmations</span>
                    <span className="crypto-meta-value">{crypto.confirmations}</span>
                  </div>
                  <div className="crypto-meta-row">
                    <span className="crypto-meta-label">Rate</span>
                    <span className="crypto-meta-value">
                      1 {crypto.id} = €{formatRate(rate, crypto.id)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="crypto-amount-section">
              <div className="crypto-amount-label">Amount you're sending</div>
              <div className="crypto-amount-input-row">
                <input
                  type="number"
                  className="crypto-amount-input"
                  placeholder={`0.00 ${crypto.id}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  min={0}
                  step="any"
                />
                <span className="crypto-amount-suffix">{crypto.id}</span>
              </div>
              {numAmount > 0 && (
                <div className="crypto-eur-preview">
                  ≈ <strong>€{eurAmount.toFixed(2)}</strong> EUR will be credited
                </div>
              )}
              {numAmount > 0 && !isMinMet && (
                <div className="crypto-min-warning">
                  Minimum is {crypto.minDeposit} {crypto.id}
                </div>
              )}
              <button
                className="crypto-action-btn"
                onClick={handleSent}
                disabled={!isMinMet || numAmount === 0}
              >
                I've sent {numAmount > 0 ? `${numAmount} ${crypto.id}` : crypto.id}
              </button>
              <div className="crypto-disclaimer">
                Funds are credited automatically after network confirmation. Balance is shown in EUR.
              </div>
            </div>
          </div>
        )}

        {stage === 'processing' && (
          <div className="crypto-processing-stage">
            <Loader2 size={48} className="crypto-spin-icon" />
            <div className="crypto-processing-title">Processing Transaction</div>
            <div className="crypto-processing-detail">
              Waiting for network confirmation...
            </div>
            <div className="crypto-processing-amount">
              {numAmount} {crypto.id} → <strong>€{confirmedEur.toFixed(2)}</strong>
            </div>
            <div className="crypto-processing-sub">{crypto.confirmations}</div>
          </div>
        )}

        {stage === 'confirmed' && (
          <div className="crypto-confirmed-stage">
            <div className="crypto-confirmed-check">
              <Check size={32} />
            </div>
            <div className="crypto-confirmed-title">Deposit Confirmed!</div>
            <div className="crypto-confirmed-amount">
              +€{confirmedEur.toFixed(2)} <span className="crypto-confirmed-eur">EUR</span>
            </div>
            <div className="crypto-confirmed-sub">
              Your balance has been updated successfully.
            </div>
            <button className="crypto-action-btn" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
