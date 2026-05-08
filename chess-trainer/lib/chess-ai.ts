import { Chess } from 'chess.js';

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface CoachEval {
  classification: 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  evalDelta: number;
  bestMove: string | null;   // UCI string e.g. "e2e4"
  bestMoveSAN: string | null;
}

// ─── Piece values ─────────────────────────────────────────────────────────────

const PIECE_VAL: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// ─── Piece-square tables (from white's perspective, rank 0 = rank 8) ─────────

const PST: Record<string, number[]> = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0,
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0,
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20,
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20,
  ],
};

function getPST(type: string, color: 'w' | 'b', rank: number, file: number): number {
  const table = PST[type] ?? PST.p;
  const idx = color === 'w' ? rank * 8 + file : (7 - rank) * 8 + file;
  return table[idx] ?? 0;
}

// ─── Position evaluation (positive = white winning) ───────────────────────────

function evaluate(game: Chess): number {
  if (game.isCheckmate()) return game.turn() === 'w' ? -30000 : 30000;
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) return 0;

  let score = 0;
  const board = game.board();
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const p = board[rank][file];
      if (!p) continue;
      const v = PIECE_VAL[p.type] + getPST(p.type, p.color, rank, file);
      score += p.color === 'w' ? v : -v;
    }
  }
  return score;
}

// ─── Move ordering (captures and checks first for better pruning) ─────────────

function orderMoves(game: Chess) {
  return game.moves({ verbose: true }).sort((a, b) => {
    const aScore = (a.captured ? PIECE_VAL[a.captured] ?? 0 : 0) + (a.san.includes('+') ? 50 : 0);
    const bScore = (b.captured ? PIECE_VAL[b.captured] ?? 0 : 0) + (b.san.includes('+') ? 50 : 0);
    return bScore - aScore;
  });
}

// ─── Minimax with alpha-beta ──────────────────────────────────────────────────

function minimax(game: Chess, depth: number, alpha: number, beta: number, maximising: boolean): number {
  if (depth === 0 || game.isGameOver()) return evaluate(game);

  const moves = orderMoves(game);
  if (moves.length === 0) return evaluate(game);

  if (maximising) {
    let best = -Infinity;
    for (const mv of moves) {
      game.move(mv);
      best = Math.max(best, minimax(game, depth - 1, alpha, beta, false));
      game.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const mv of moves) {
      game.move(mv);
      best = Math.min(best, minimax(game, depth - 1, alpha, beta, true));
      game.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function runMinimax(fen: string, depth: number): string | null {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;

  const moves    = orderMoves(game);
  if (!moves.length) return null;

  const maximising = game.turn() === 'w';
  let bestScore    = maximising ? -Infinity : Infinity;
  let bestMove     = moves[0].lan;

  for (const mv of moves) {
    game.move(mv);
    const score = minimax(game, depth - 1, -Infinity, Infinity, !maximising);
    game.undo();
    if (maximising ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove  = mv.lan;
    }
  }
  return bestMove;
}

// ─── Lichess cloud eval (Hard / Expert) ──────────────────────────────────────

async function getLichessMove(fen: string): Promise<string | null> {
  try {
    const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json();
    const moves: string = json?.pvs?.[0]?.moves ?? '';
    return moves.split(' ')[0] || null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getBestMove(fen: string, difficulty: Difficulty): Promise<string | null> {
  switch (difficulty) {
    case 'beginner': {
      const g = new Chess(fen);
      const moves = g.moves({ verbose: true });
      return moves.length ? moves[Math.floor(Math.random() * moves.length)].lan : null;
    }
    case 'easy':
      return runMinimax(fen, 1);
    case 'medium':
      return runMinimax(fen, 3);
    case 'hard': {
      const stockfish = await getLichessMove(fen);
      return stockfish ?? runMinimax(fen, 3);
    }
    case 'expert': {
      const stockfish = await getLichessMove(fen);
      return stockfish ?? runMinimax(fen, 4);
    }
  }
}

// ─── Coach evaluation ─────────────────────────────────────────────────────────

export function getCoachEval(
  fenBefore: string,
  playedUCI: string,
  playerColor: 'w' | 'b',
): CoachEval {
  const gameBefore = new Chess(fenBefore);
  const moves      = gameBefore.moves({ verbose: true });

  // Quick minimax at depth 2 to find best move
  let bestScore = playerColor === 'w' ? -Infinity : Infinity;
  let bestMove: { lan: string; san: string } | null = null;

  for (const mv of moves) {
    gameBefore.move(mv);
    const score = minimax(gameBefore, 1, -Infinity, Infinity, playerColor !== 'w');
    gameBefore.undo();
    const isBetter = playerColor === 'w' ? score > bestScore : score < bestScore;
    if (isBetter) {
      bestScore = score;
      bestMove  = { lan: mv.lan, san: mv.san };
    }
  }

  // Eval before
  const scoreBefore = evaluate(gameBefore);
  const playerBefore = playerColor === 'w' ? scoreBefore : -scoreBefore;

  // Apply played move and eval after
  const gameAfter = new Chess(fenBefore);
  gameAfter.move({ from: playedUCI.slice(0, 2) as any, to: playedUCI.slice(2, 4) as any, promotion: 'q' });
  const scoreAfter = evaluate(gameAfter);
  const playerAfter = playerColor === 'w' ? scoreAfter : -scoreAfter;

  const delta = playerAfter - playerBefore;

  let classification: CoachEval['classification'];
  if (bestMove && playedUCI.startsWith(bestMove.lan.slice(0, 4))) {
    classification = 'best';
  } else if (delta >= -20) {
    classification = 'excellent';
  } else if (delta >= -60) {
    classification = 'good';
  } else if (delta >= -150) {
    classification = 'inaccuracy';
  } else if (delta >= -300) {
    classification = 'mistake';
  } else {
    classification = 'blunder';
  }

  const isUserMove = bestMove && !playedUCI.startsWith(bestMove.lan.slice(0, 4));

  return {
    classification,
    evalDelta: delta,
    bestMove: isUserMove ? bestMove!.lan : null,
    bestMoveSAN: isUserMove ? bestMove!.san : null,
  };
}
