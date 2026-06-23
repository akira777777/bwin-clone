# BETZ Sportsbook

A modern, full-featured sports betting and casino platform built with React, TypeScript, and Vite. Inspired by industry-leading betting platforms, BETZ provides a comprehensive sportsbook with live betting, virtual sports, casino games, and poker.

![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)
![React](https://img.shields.io/badge/React-19.2.6-blue)
![Vite](https://img.shields.io/badge/Vite-8.0.12-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

### Sportsbook
- **Live Betting** - Real-time odds updates with match simulation
- **Pre-Match Betting** - Comprehensive coverage across multiple sports
- **Multiple Bet Types** - Singles, Multiples (Accumulators), and System bets
- **Dynamic Odds** - Live odds fluctuations with accept/reject functionality
- **Bet Slip** - Unified bet management with quick stake selection
- **My Bets** - Track active, settled, and cashed-out bets

### Sports Coverage
- Football, Tennis, Basketball, Ice Hockey
- Boxing, Cricket, Darts, Formula 1, MMA
- Virtual Sports (Football, Greyhounds, Tennis, Basketball, Horse Racing, Cycling)

### Casino Games
- **Slots** - Daily Wheel with spin-to-win mechanics
- **Crash Game** - Popular crypto-style crash game with multiplier
- **Mines** - Strategic minefield game with gem collection
- **Live Casino** - Roulette, Blackjack, Baccarat, Game Shows
- **Poker** - Cash games and tournaments

### Platform Features
- **Multi-Language Support** - English, Russian, German, Spanish
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern purple gradient design
- **Real-time Updates** - Live match simulation and scoring
- **User Profiles** - Balance tracking and betting history
- **Live Chat** - AI-powered support assistant
- **Responsible Gaming** - Self-exclusion and deposit limits

## 🛠️ Tech Stack

### Frontend
- **React 19.2.6** - UI library with concurrent features
- **TypeScript 6.0.2** - Type-safe development with strict mode
- **Vite 8.0.12** - Lightning-fast build tool

### Key Libraries
- **Lucide React** - Modern icon library
- **Supabase** - Authentication and database (optional)
- **Vitest** - Fast unit testing framework
- **Testing Library** - Component testing utilities

### Code Quality
- **ESLint** - Linting with React and TypeScript rules
- **Prettier** - Code formatting with consistent style
- **TypeScript Strict Mode** - Maximum type safety

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Clone and Install

```bash
git clone https://github.com/yourusername/bwin-clone.git
cd bwin-clone
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase (optional - for authentication and persistent data)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Odds API (optional)
VITE_ODDS_API_KEY=your_odds_api_key
```

**Note**: The app works in simulation mode without Supabase. User data and bets are stored in localStorage.

## 🚀 Running the App

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output in `dist/` directory

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code with Prettier
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## 📁 Project Structure

```
bwin-clone/
├── src/
│   ├── components/          # React components
│   │   ├── AuthModal.tsx   # Login/Register modal
│   │   ├── CrashGame.tsx   # Crash casino game
│   │   ├── DailyWheelModal.tsx
│   │   ├── MinesGame.tsx   # Mines casino game
│   │   ├── Virtuals.tsx    # Virtual sports
│   │   ├── Casino/         # Casino games
│   │   ├── LiveCasino.tsx  # Live dealer games
│   │   └── Poker.tsx       # Poker room
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   ├── services/
│   │   └── api.ts          # External API calls
│   ├── utils/
│   │   ├── betting.ts      # Bet calculations
│   │   ├── i18n.ts         # Translations
│   │   └── logger.ts       # Centralized logging
│   ├── data/
│   │   ├── matches.ts      # Match data & simulation
│   │   └── leaguesData.ts  # League information
│   ├── App.tsx             # Main application
│   └── main.tsx            # Entry point
├── public/                 # Static assets
├── tests/                  # Test files
├── eslint.config.js
├── prettier.config.js
├── tsconfig.app.json
├── vite.config.ts
└── package.json
```

## 🎮 Key Components

### App.tsx
Main application container managing:
- Global state (bets, balance, user session)
- Match simulation and odds updates
- Bet settlement and cash-out logic
- Modal management and notifications

### Betting System
- **Multi-Bet Support** - Singles, Multiples, Systems (2/3, 2/4, etc.)
- **Cash Out** - Early settlement with calculated offers
- **Odds Formats** - Decimal, Fractional, American, Hong Kong, Indonesian, Malaysian
- **System Calculations** - `getCombinations()` for complex bet types

### Virtual Sports
- **Simulation Engine** - Realistic match progression with scoring
- **Commentary** - Play-by-play text updates
- **Audio Effects** - Sound effects for events
- **Countdown** - Next event timing

## 🌐 Internationalization

The app supports 4 languages:

```typescript
import { t } from './utils/i18n';

t('Bet Slip', 'ru') // Returns: 'Купон'
t('Bet Slip', 'de') // Returns: 'Wettschein'
t('Bet Slip', 'es') // Returns: 'Cupón'
```

To add a new language, update `src/utils/i18n.ts`.

## 🔐 Authentication

### Simulation Mode (Default)
- No backend required
- Users stored in localStorage
- Perfect for development and demo

### Supabase Mode
Set environment variables to enable:
- User authentication
- Persistent bet history
- Cloud database

```typescript
// Check if Supabase is configured
import { hasRealSupabaseConfig } from './lib/supabase';
```

## 🧪 Testing

### Test Coverage
- Component tests with React Testing Library
- Utility function tests
- API mocking with Vitest
- ~540 tests across 24 files

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 📊 State Management

The app uses React's built-in state management:
- `useState` for local component state
- `useContext` for global state (future enhancement)
- `useMemo` and `useCallback` for performance

## 🎨 Styling

- **CSS Modules** - Component-scoped styles
- **CSS Variables** - Theme customization
- **Responsive** - Mobile-first approach
- **Animations** - Smooth transitions and loading states

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- No implicit any
- Null checks enabled
- Unused locals/parameters checked

### ESLint
- React Hooks rules
- No console.log (use logger instead)
- Type-aware linting available

### Prettier
- Single quotes
- 2-space indentation
- 100 char line width
- Trailing commas in ES5

## 🚢 Deployment

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- Inspired by bwin, Bet365, and other leading betting platforms
- Icons by Lucide
- Built with React and Vite

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review the code comments

---

**Note**: This is a demonstration project. Always comply with local gambling regulations when building real betting platforms.
