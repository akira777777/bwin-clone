# AGENTS.md

## Cursor Cloud specific instructions

`bwin-clone` is a single-product **Vite + React 19 + TypeScript** sports-betting
frontend (no monorepo, no separate backend service to run). Package manager is
**npm** (`package-lock.json`). Node 22 is available and works with Vite 8 / React 19.

Dependencies are refreshed automatically on VM start by the update script
(`npm install`), so you usually do not need to install anything yourself.

### Run / build / test / lint (commands live in `package.json` scripts)
- Dev server: `npm run dev` → serves on `http://localhost:5173` (Vite default; there is no custom `server.port`).
- Build: `npm run build` (runs `tsc -b` then `vite build`).
- Lint: `npm run lint`.
- Tests: `npm test` (Vitest watch) or `npx vitest --run` (single run). Coverage: `npm run test:coverage`.
  - The test suite has 3 intentionally `it.skip`-ped App-level tests (full-App + fake-timer flakiness — see comments in `src/App.test.tsx`). A `--run` is expected to report `77 passed | 3 skipped`.

### Non-obvious behavior to know before testing
- **The app runs fully without any external service.** It has graceful fallbacks:
  - **The Odds API** (`api.the-odds-api.com`): a key is read from `VITE_ODDS_API_KEY` (`.env`) or the in-app "Connect Live Data" prompt. If the key is missing/invalid/rate-limited, the app logs an error and **falls back to mock match data** in `src/data/matches.ts`. "Invalid API Key" console errors during run/tests are expected and non-fatal.
  - **Supabase** (hosted project configured in `.env` via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`): used for real auth + bet persistence (`placed_bets` table). When unconfigured or when the user is not logged in, auth/betting fall back to in-component state + `localStorage`. **Placing a bet does NOT require login** — as a guest, the default balance is €1000 and bets are stored in React state.
- **Core "hello world" flow** (no login needed): click an odds button (`1`/`X`/`2`) on a match row → it appears in the right "Bet Slip" → enter a "Total Stake (€)" (default mode is Multi) → click green **Place Bet** → a "Bet Placed!" overlay shows, then the panel switches to the **My Bets** tab with the Pending ticket.
- `.env` is gitignored but is present in this repo with real (low-value/demo) keys, so the app boots with live integrations attempted. Do not commit secrets.

### Supabase CLI (optional, not needed to run the frontend)
A local Supabase stack is defined in `supabase/config.toml` (API 54321, DB 54322, Studio 54323, Inbucket 54324) with one migration. Running it requires the Supabase CLI + Docker and is **only** needed if you want a local DB instead of the hosted one in `.env`. See `SUPABASE_SETUP.md`.
