# ChessMaster — Setup Guide

## Prerequisites
- Node.js 18+
- Expo Go app on your phone (iOS or Android) or an emulator
- A free [Supabase](https://supabase.com) account

## 1. Install dependencies
```bash
npm install
```

## 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL editor, run the contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings → API**
4. Create a `.env.local` file:

```bash
cp .env.example .env.local
# Then fill in your values:
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Run the app
```bash
# Start the dev server
npm start

# Scan the QR code with Expo Go on your phone
# Or press 'a' for Android emulator, 'i' for iOS simulator
```

## Architecture Overview

```
chess-trainer/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login, signup
│   ├── (tabs)/            # Home, practice, profile tabs
│   ├── lesson/[id].tsx    # Lesson screen (unit ID)
│   └── puzzle/[id].tsx    # Puzzle screen (puzzle ID or 'random')
├── components/
│   ├── chess/ChessBoard   # Interactive chess board
│   └── ui/                # XPBar, HeartBar, StreakBadge, etc.
├── constants/
│   ├── curriculum.ts      # All lessons and units
│   └── theme.ts           # Design tokens
├── hooks/
│   ├── useAuth.ts         # Supabase auth + progress load
│   └── usePuzzle.ts       # Puzzle game logic
├── lib/
│   ├── supabase.ts        # Supabase client + helpers
│   └── lichess.ts         # Lichess API + offline fallbacks
└── store/gameStore.ts     # Zustand global state
```

## Features
- 6 skill units with 20+ lessons across all player levels
- Interactive chess board with legal move highlighting
- Live puzzles from Lichess API (3M+ puzzle database)
- Offline fallback puzzles for no-internet use
- XP system, level progression, streaks, hearts
- Duolingo-style skill tree with locked/active/complete nodes
- Celebration animations on lesson/puzzle completion
- Full auth flow (email/password via Supabase)
- User progress persisted to Supabase
- Puzzle themes: forks, pins, skewers, mate-in-N, and more

## Extending the App
- **Add lessons**: Edit `constants/curriculum.ts` and add steps to any unit
- **Add puzzle themes**: Add entries to `PUZZLE_THEMES` in `curriculum.ts`
- **Leaderboard**: Query the `leaderboard` view from Supabase
- **Push notifications**: Add `expo-notifications` for streak reminders
- **Stockfish analysis**: Integrate `stockfish.wasm` for move evaluation
