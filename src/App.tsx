import { Routes, Route } from 'react-router'
import { AppProvider } from './state/AppContext'
import Home from './pages/Home'

export interface Bet {
  id: string;
  match: string;
  selection: string;
  odds: number;
}

export interface PlacedBet {
  id: string;
  date: string;
  stake: number;
  potentialReturn: number;
  type: 'Single' | 'Multi' | 'System';
  status: 'Pending' | 'Won' | 'Lost';
  bets: Bet[];
  metadata?: any;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export type Category = 'Sports' | 'Live Betting' | 'Virtuals' | 'Casino' | 'Live Casino' | 'Poker';

export type Sport = 'Football' | 'Tennis' | 'Basketball' | 'Ice Hockey' | 'Boxing' | 'Cricket' | 'Darts' | 'Formula 1' | 'MMA';

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </AppProvider>
  )
}
