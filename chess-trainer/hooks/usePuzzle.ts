import { useState, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { LichessPuzzle } from '@/types';
import { applyUCIMove, getLegalMoves, createGame } from '@/lib/chess-utils';

export type PuzzleState = 'idle' | 'playing' | 'correct' | 'wrong' | 'complete';

export function usePuzzle(puzzle: LichessPuzzle | null) {
  const gameRef = useRef<Chess | null>(null);
  const [fen, setFen] = useState<string>('');
  const [state, setState] = useState<PuzzleState>('idle');
  const [moveIndex, setMoveIndex] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalSquares, setLegalSquares] = useState<string[]>([]);
  const [lastMoveSquares, setLastMoveSquares] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [movesUsed, setMovesUsed] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  const init = useCallback(() => {
    if (!puzzle) return;
    const game = createGame(puzzle.fen);
    gameRef.current = game;
    setFen(game.fen());
    setState('playing');
    setMoveIndex(0);
    setSelectedSquare(null);
    setLegalSquares([]);
    setLastMoveSquares([]);
    setHintsUsed(0);
    setMovesUsed(0);
    startTimeRef.current = Date.now();

    // In Lichess puzzles, the first move of the solution is played automatically
    // to show the "opponent's" move that creates the puzzle position.
    // We apply it immediately after a short delay.
    if (puzzle.moves.length > 0) {
      setTimeout(() => {
        const result = applyUCIMove(game, puzzle.moves[0]);
        if (result.success) {
          const from = puzzle.moves[0].slice(0, 2);
          const to = puzzle.moves[0].slice(2, 4);
          setFen(game.fen());
          setLastMoveSquares([from, to]);
          setMoveIndex(1);
        }
      }, 600);
    }
  }, [puzzle]);

  const selectSquare = useCallback((square: string) => {
    if (!gameRef.current || state !== 'playing') return;
    const game = gameRef.current;

    if (selectedSquare) {
      // Attempt move
      const from = selectedSquare;
      const to = square;
      const expectedUCI = puzzle?.moves[moveIndex];

      if (!expectedUCI) return;

      const isCorrect =
        expectedUCI.startsWith(from + to) ||
        (expectedUCI.slice(0, 4) === from + to);

      if (!isCorrect) {
        setState('wrong');
        setSelectedSquare(null);
        setLegalSquares([]);
        setMovesUsed((n) => n + 1);
        setTimeout(() => setState('playing'), 900);
        return;
      }

      const result = applyUCIMove(game, expectedUCI);
      if (!result.success) return;

      setFen(game.fen());
      setLastMoveSquares([from, to]);
      setSelectedSquare(null);
      setLegalSquares([]);
      setMovesUsed((n) => n + 1);

      const nextIndex = moveIndex + 1;

      if (nextIndex >= (puzzle?.moves.length ?? 0)) {
        setState('complete');
        return;
      }

      // Apply opponent's next response
      const opponentMove = puzzle?.moves[nextIndex];
      if (opponentMove) {
        setTimeout(() => {
          const opResult = applyUCIMove(game, opponentMove);
          if (opResult.success) {
            setFen(game.fen());
            setLastMoveSquares([opponentMove.slice(0, 2), opponentMove.slice(2, 4)]);
            const nextUserMove = nextIndex + 1;
            setMoveIndex(nextUserMove);
            if (nextUserMove >= (puzzle?.moves.length ?? 0)) setState('complete');
          }
        }, 500);
      }
    } else {
      // Select piece
      const piece = game.get(square as any);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setLegalSquares(getLegalMoves(game, square));
      }
    }
  }, [selectedSquare, state, moveIndex, puzzle]);

  const getHint = useCallback(() => {
    if (!puzzle || moveIndex >= puzzle.moves.length) return null;
    setHintsUsed((n) => n + 1);
    const from = puzzle.moves[moveIndex].slice(0, 2);
    setSelectedSquare(from);
    setLegalSquares(getLegalMoves(gameRef.current!, from));
    return from;
  }, [puzzle, moveIndex]);

  const elapsedSeconds = useCallback(() =>
    Math.floor((Date.now() - startTimeRef.current) / 1000), []);

  return {
    fen,
    state,
    selectedSquare,
    legalSquares,
    lastMoveSquares,
    hintsUsed,
    movesUsed,
    init,
    selectSquare,
    getHint,
    elapsedSeconds,
  };
}
