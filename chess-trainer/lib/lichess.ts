import { LichessPuzzle } from '@/types';

const BASE = 'https://lichess.org/api';

// Fetch a random puzzle, optionally filtered by theme and rating range
export async function fetchRandomPuzzle(
  themes?: string[],
  minRating = 800,
  maxRating = 2400,
): Promise<LichessPuzzle | null> {
  try {
    const url = `${BASE}/puzzle/next${themes?.length ? `?themes=${themes.join(',')}` : ''}`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Lichess ${res.status}`);
    const json = await res.json();
    return normalisePuzzle(json);
  } catch (err) {
    console.error('fetchRandomPuzzle:', err);
    return null;
  }
}

// Fetch a specific puzzle by ID
export async function fetchPuzzleById(id: string): Promise<LichessPuzzle | null> {
  try {
    const res = await fetch(`${BASE}/puzzle/${id}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Lichess ${res.status}`);
    const json = await res.json();
    return normalisePuzzle(json);
  } catch (err) {
    console.error('fetchPuzzleById:', err);
    return null;
  }
}

// Fetch the daily puzzle
export async function fetchDailyPuzzle(): Promise<LichessPuzzle | null> {
  try {
    const res = await fetch(`${BASE}/puzzle/daily`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Lichess ${res.status}`);
    const json = await res.json();
    return normalisePuzzle(json);
  } catch (err) {
    console.error('fetchDailyPuzzle:', err);
    return null;
  }
}

function normalisePuzzle(json: any): LichessPuzzle {
  const p = json.puzzle ?? json;
  return {
    id: p.id,
    fen: p.fen ?? json.game?.fen,
    moves: (p.solution ?? p.moves ?? '').split(' ').filter(Boolean),
    rating: p.rating ?? 1200,
    themes: p.themes ?? [],
    gameUrl: json.game?.id ? `https://lichess.org/${json.game.id}` : undefined,
  };
}

// ─── Fallback offline puzzles ─────────────────────────────────────────────

export const OFFLINE_PUZZLES: LichessPuzzle[] = [
  {
    id: 'offline-1',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    moves: ['f3g5', 'f6e4', 'g5f7'],
    rating: 1200,
    themes: ['fork', 'tactics'],
  },
  {
    id: 'offline-2',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    moves: ['e1e8'],
    rating: 900,
    themes: ['mateIn1', 'backRankMate'],
  },
  {
    id: 'offline-3',
    fen: '8/8/4k3/8/3KP3/8/8/8 w - - 0 1',
    moves: ['d4d5', 'e6d7', 'e4e5', 'd7e7', 'd5d6', 'e7d7', 'e5e6'],
    rating: 1400,
    themes: ['endgame', 'opposition', 'passedPawn'],
  },
  {
    id: 'offline-4',
    fen: 'r3k2r/ppp2ppp/2n5/4P3/2Bb4/8/PP3PPP/RN2K2R w KQkq - 0 1',
    moves: ['e5c6'],
    rating: 1100,
    themes: ['fork', 'pin'],
  },
  {
    id: 'offline-5',
    fen: '4r1k1/pp2bppp/2p5/8/3N4/2P5/PP3PPP/R5K1 w - - 0 1',
    moves: ['d4f5', 'e7c5', 'f5h6'],
    rating: 1500,
    themes: ['fork', 'sacrifice'],
  },
];
