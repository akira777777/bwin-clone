import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, ExternalLink } from 'lucide-react';
import './CryptoDeposit.css';

type CryptoId = 'BTC' | 'ETH' | 'USDT' | 'LTC';
type Stage = 'input' | 'sent' | 'checking' | 'confirmed';

interface TxStatus {
  found: boolean;
  confirmations: number;
  amount?: number;
  error?: string;
}

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
  requiredConfs: number;
  explorerUrl: string;
}

const CRYPTOS: CryptoConfig[] = [
  {
    id: 'BTC',
    name: 'Bitcoin',
    network: 'Bitcoin Network',
    icon: '₿',
    color: '#F7931A',
    address: '14XPtMB86X1Ke4kDq61w4EDiRF3ujfP9vi',
    baseRate: 62450,
    minDeposit: 0.0001,
    confirmations: '2 confirmations (~20 min)',
    requiredConfs: 2,
    explorerUrl: 'https://blockchair.com/bitcoin/transaction/',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    network: 'Ethereum (ERC-20)',
    icon: 'Ξ',
    color: '#627EEA',
    address: '0x70ddbf0bb18fe98f6208b6d79740b6c61eb7cd98',
    baseRate: 3215,
    minDeposit: 0.001,
    confirmations: '12 confirmations (~3 min)',
    requiredConfs: 12,
    explorerUrl: 'https://blockchair.com/ethereum/transaction/',
  },
  {
    id: 'USDT',
    name: 'Tether USD',
    network: 'TRON (TRC-20)',
    icon: '₮',
    color: '#26A17B',
    address: 'TM1bjfhPm1qGt5AJQfUkJb23wfdtSzpTsY',
    baseRate: 0.921,
    minDeposit: 10,
    confirmations: '20 confirmations (~1 min)',
    requiredConfs: 20,
    explorerUrl: 'https://tronscan.org/#/transaction/',
  },
  {
    id: 'LTC',
    name: 'Litecoin',
    network: 'Litecoin Network',
    icon: 'Ł',
    color: '#BFBBBB',
    address: 'LUahS3fQxofe8VnGjHKjUVyTJBVE9Q44ja',
    baseRate: 84.2,
    minDeposit: 0.01,
    confirmations: '6 confirmations (~15 min)',
    requiredConfs: 6,
    explorerUrl: 'https://blockchair.com/litecoin/transaction/',
  },
];

const DEFAULT_RATES: Record<CryptoId, number> = {
  BTC: 62450,
  ETH: 3215,
  USDT: 0.921,
  LTC: 84.2,
};

const GRID = 21;
const CELL = 8;
const PAD = 10;
const SVG_SIZE = GRID * CELL + PAD * 2;

async function fetchLiveRates(): Promise<Record<CryptoId, number>> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,litecoin&vs_currencies=eur'
  );
  if (!res.ok) throw new Error('Rate fetch failed');
  const data = (await res.json()) as {
    bitcoin?: { eur?: number };
    ethereum?: { eur?: number };
    tether?: { eur?: number };
    litecoin?: { eur?: number };
  };
  return {
    BTC: data.bitcoin?.eur ?? DEFAULT_RATES.BTC,
    ETH: data.ethereum?.eur ?? DEFAULT_RATES.ETH,
    USDT: data.tether?.eur ?? DEFAULT_RATES.USDT,
    LTC: data.litecoin?.eur ?? DEFAULT_RATES.LTC,
  };
}

async function verifyBlockCypher(
  coin: 'BTC' | 'LTC' | 'ETH',
  txHash: string,
  ourAddress: string
): Promise<TxStatus> {
  const coinPath = coin === 'BTC' ? 'btc/main' : coin === 'LTC' ? 'ltc/main' : 'eth/main';
  const url = 'https://api.blockcypher.com/v1/' + coinPath + '/txs/' + txHash;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return { found: false, confirmations: 0 };
    throw new Error('BlockCypher ' + res.status);
  }
  const tx = (await res.json()) as {
    confirmations?: number;
    outputs?: Array<{ addresses?: string[]; value?: number }>;
  };
  const confs = tx.confirmations ?? 0;
  const divisor = coin === 'ETH' ? 1e18 : 1e8;
  const output = tx.outputs?.find(o =>
    o.addresses?.some(a => a.toLowerCase() === ourAddress.toLowerCase())
  );
  const amount = output?.value != null ? output.value / divisor : undefined;
  return { found: true, confirmations: confs, amount };
}

async function verifyTron(txHash: string, ourAddress: string): Promise<TxStatus> {
  const url = 'https://apilist.tronscanapi.com/api/transaction-info?hash=' + txHash;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return { found: false, confirmations: 0 };
    throw new Error('Tronscan ' + res.status);
  }
  const tx = (await res.json()) as {
    confirmed?: boolean;
    confirmations?: number;
    tokenTransferInfo?: {
      to_address?: string;
      amount_str?: string;
      decimals?: number;
    };
  };
  if (!tx.confirmed && tx.confirmations === undefined) return { found: false, confirmations: 0 };
  const confs = tx.confirmations ?? (tx.confirmed ? 20 : 0);
  const info = tx.tokenTransferInfo;
  let amount: number | undefined;
  if (info?.to_address?.toLowerCase() === ourAddress.toLowerCase() && info.amount_str) {
    const decimals = info.decimals ?? 6;
    amount = parseInt(info.amount_str, 10) / Math.pow(10, decimals);
  }
  return { found: true, confirmations: confs, amount };
}

async function verifyTx(coin: CryptoId, txHash: string, address: string): Promise<TxStatus> {
  try {
    if (coin === 'USDT') return await verifyTron(txHash, address);
    return await verifyBlockCypher(coin as 'BTC' | 'LTC' | 'ETH', txHash, address);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { found: false, confirmations: 0, error: msg };
  }
}

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
      let dark: boolean;
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
  const [rates, setRates] = useState<Record<CryptoId, number>>(DEFAULT_RATES);
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState<Stage>('input');
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus | null>(null);
  const [confirmedEur, setConfirmedEur] = useState(0);

  const rateRef = useRef(rates);
  const onDepositRef = useRef(onDeposit);
  const confirmedEurRef = useRef(0);

  useEffect(() => { rateRef.current = rates; }, [rates]);
  useEffect(() => { onDepositRef.current = onDeposit; }, [onDeposit]);

  // Live rates from CoinGecko every 60s
  useEffect(() => {
    const load = () => fetchLiveRates().then(r => setRates(r)).catch(() => undefined);
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);



  // Blockchain verification polling
  useEffect(() => {
    if (stage !== 'checking' || !txHash) return;
    const cfg = CRYPTOS.find(c => c.id === activeCrypto)!;
    let alive = true;
    const poll = async () => {
      if (!alive) return;
      const result = await verifyTx(activeCrypto, txHash, cfg.address);
      if (!alive) return;
      setTxStatus(result);
      if (result.found && result.confirmations >= cfg.requiredConfs) {
        const eur =
          result.amount != null
            ? Math.round(result.amount * rateRef.current[activeCrypto] * 100) / 100
            : confirmedEurRef.current;
        onDepositRef.current(eur);
        setConfirmedEur(eur);
        setStage('confirmed');
      }
    };
    poll();
    const id = setInterval(poll, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [stage, txHash, activeCrypto]);

  const crypto = CRYPTOS.find(c => c.id === activeCrypto)!;
  const rate = rates[activeCrypto];
  const numAmount = parseFloat(amount) || 0;
  const eurAmount = Math.round(numAmount * rate * 100) / 100;
  const isMinMet = numAmount >= crypto.minDeposit;

  const handleSent = () => {
    if (!isMinMet || numAmount === 0) return;
    confirmedEurRef.current = eurAmount;
    setConfirmedEur(eurAmount);
    setStage('sent');
  };

  const handleTxSubmit = () => {
    const cleaned = txHash.trim();
    if (!cleaned) return;
    setTxHash(cleaned);
    setTxStatus(null);
    setStage('checking');
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

  const confPct =
    txStatus?.found && crypto.requiredConfs > 0
      ? Math.min(100, Math.round((txStatus.confirmations / crypto.requiredConfs) * 100))
      : 0;

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
              onClick={() => {
                setActiveCrypto(c.id);
                setAmount('');
                setStage('input');
                setTxHash('');
                setTxStatus(null);
              }}
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

        {stage === 'sent' && (
          <div className="crypto-sent-stage">
            <div className="crypto-sent-icon">
              <Check size={32} />
            </div>
            <div className="crypto-sent-title">Transaction Sent</div>
            <div className="crypto-sent-sub">
              {numAmount > 0 ? numAmount : confirmedEur / rate > 0 ? (confirmedEur / rate).toFixed(6) : ''} {crypto.id}{' '}
              → <strong>≈ €{confirmedEur.toFixed(2)}</strong>
            </div>
            <div className="crypto-sent-instruction">
              Paste your transaction hash below so we can verify it on-chain:
            </div>
            <div className="crypto-txhash-row">
              <input
                type="text"
                className="crypto-txhash-input"
                placeholder="Transaction hash (txid)"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                spellCheck={false}
              />
            </div>
            <button
              className="crypto-action-btn"
              onClick={handleTxSubmit}
              disabled={!txHash.trim()}
            >
              Verify Transaction
            </button>
            <button className="crypto-back-btn" onClick={() => setStage('input')}>
              ← Back
            </button>
          </div>
        )}

        {stage === 'checking' && (
          <div className="crypto-checking-stage">
            <Loader2 size={48} className="crypto-spin-icon" />
            <div className="crypto-checking-title">Verifying on Blockchain</div>

            {txStatus?.error && (
              <div className="crypto-check-error">
                {txStatus.error} — retrying in 20s…
              </div>
            )}

            {!txStatus?.error && !txStatus?.found && (
              <div className="crypto-check-pending">
                Waiting for transaction to appear in mempool…
              </div>
            )}

            {txStatus?.found && (
              <>
                <div className="crypto-check-sub">
                  {txStatus.confirmations} / {crypto.requiredConfs} confirmations
                </div>
                <div className="crypto-confs-section">
                  <div className="crypto-confs-bar-track">
                    <div
                      className="crypto-confs-bar-fill"
                      style={{ width: confPct + '%' }}
                    />
                  </div>
                  <div className="crypto-confs-text">{confPct}%</div>
                </div>
              </>
            )}

            <a
              className="crypto-explorer-link"
              href={crypto.explorerUrl + txHash}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on explorer <ExternalLink size={12} />
            </a>

            <button className="crypto-back-btn" onClick={() => setStage('sent')}>
              ← Change hash
            </button>
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
