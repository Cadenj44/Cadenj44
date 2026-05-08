import { Chess, Move } from 'chess.js';

export type MoveResult = { success: boolean; isCheck: boolean; isCheckmate: boolean; move?: Move };

export function createGame(fen?: string): Chess {
  return fen ? new Chess(fen) : new Chess();
}

export function applyUCIMove(game: Chess, uci: string): MoveResult {
  const from = uci.slice(0, 2) as any;
  const to = uci.slice(2, 4) as any;
  const promotion = uci.length === 5 ? (uci[4] as any) : undefined;
  try {
    const move = game.move({ from, to, promotion: promotion ?? 'q' });
    if (!move) return { success: false, isCheck: false, isCheckmate: false };
    return {
      success: true,
      isCheck: game.inCheck(),
      isCheckmate: game.isCheckmate(),
      move,
    };
  } catch {
    return { success: false, isCheck: false, isCheckmate: false };
  }
}

export function getLegalMoves(game: Chess, square: string): string[] {
  return game.moves({ square: square as any, verbose: true }).map((m) => m.to);
}

export function boardToMatrix(game: Chess) {
  return game.board();
}

export function isPlayerTurn(game: Chess, color: 'w' | 'b'): boolean {
  return game.turn() === color;
}

export function parseFEN(fen: string): Chess | null {
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

// Map chess.js piece type to unicode symbol
export const PIECE_UNICODE: Record<string, Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

// Map piece type to emoji-style label for UI
export const PIECE_LABEL: Record<string, string> = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
};
