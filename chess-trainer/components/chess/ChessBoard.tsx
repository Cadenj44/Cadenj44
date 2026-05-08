import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Chess } from 'chess.js';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const BOARD_SIZE = Math.min(SCREEN_WIDTH - 16, 420);
export const SQUARE_SIZE = BOARD_SIZE / 8;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const PIECE_TEXT: Record<string, Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

interface ChessBoardProps {
  fen: string;
  selectedSquare?: string | null;
  legalSquares?: string[];
  lastMoveSquares?: string[];
  highlightSquares?: string[];
  arrows?: { from: string; to: string; color?: string }[];
  onSquarePress?: (square: string) => void;
  orientation?: 'white' | 'black';
  interactive?: boolean;
  size?: number;
}

export default function ChessBoard({
  fen,
  selectedSquare,
  legalSquares = [],
  lastMoveSquares = [],
  highlightSquares = [],
  onSquarePress,
  orientation = 'white',
  interactive = true,
  size,
}: ChessBoardProps) {
  const boardSize = size ?? BOARD_SIZE;
  const squareSize = boardSize / 8;

  const board = useMemo(() => {
    try {
      const game = new Chess(fen);
      return game.board();
    } catch {
      return new Chess().board();
    }
  }, [fen]);

  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  function squareName(file: string, rank: number): string {
    return `${file}${rank}`;
  }

  function getSquareColor(file: string, rank: number): string {
    const fileIdx = FILES.indexOf(file);
    const isLight = (fileIdx + rank) % 2 !== 0;
    return isLight ? Colors.boardLight : Colors.boardDark;
  }

  function getOverlayColor(sq: string): string | null {
    if (sq === selectedSquare) return Colors.boardSelected;
    if (lastMoveSquares.includes(sq)) return Colors.boardLastMove;
    if (highlightSquares.includes(sq)) return Colors.boardHighlight;
    return null;
  }

  function getPiece(file: string, rank: number) {
    const fileIdx = FILES.indexOf(file);
    const rankIdx = 8 - rank;
    const square = board[rankIdx]?.[fileIdx];
    return square ?? null;
  }

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {ranks.map((rank) =>
        files.map((file) => {
          const sq = squareName(file, rank);
          const piece = getPiece(file, rank);
          const bgColor = getSquareColor(file, rank);
          const overlay = getOverlayColor(sq);
          const isLegal = legalSquares.includes(sq);
          const hasPiece = !!piece;

          return (
            <TouchableOpacity
              key={sq}
              activeOpacity={interactive ? 0.85 : 1}
              onPress={interactive ? () => onSquarePress?.(sq) : undefined}
              style={[
                styles.square,
                {
                  width: squareSize,
                  height: squareSize,
                  backgroundColor: bgColor,
                },
              ]}
            >
              {overlay && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: overlay, borderRadius: 2 }]} />
              )}

              {/* Legal move indicator */}
              {isLegal && !hasPiece && (
                <View style={[styles.legalDot, { width: squareSize * 0.3, height: squareSize * 0.3 }]} />
              )}
              {isLegal && hasPiece && (
                <View style={[StyleSheet.absoluteFill, styles.legalCapture, { borderRadius: squareSize * 0.1, borderWidth: squareSize * 0.09 }]} />
              )}

              {/* Piece */}
              {piece && (
                <Text
                  style={[
                    styles.piece,
                    {
                      fontSize: squareSize * 0.75,
                      lineHeight: squareSize,
                      color: piece.color === 'w' ? '#FFFFFF' : '#1a1a1a',
                    },
                  ]}
                  allowFontScaling={false}
                >
                  {PIECE_TEXT[piece.color][piece.type]}
                </Text>
              )}

              {/* Coordinate labels */}
              {file === files[0] && (
                <Text style={[styles.coordRank, { fontSize: squareSize * 0.22, color: getSquareColor(file, rank) === Colors.boardLight ? Colors.boardDark : Colors.boardLight }]}>
                  {rank}
                </Text>
              )}
              {rank === ranks[ranks.length - 1] && (
                <Text style={[styles.coordFile, { fontSize: squareSize * 0.22, color: getSquareColor(file, rank) === Colors.boardLight ? Colors.boardDark : Colors.boardLight }]}>
                  {file}
                </Text>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  piece: {
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    zIndex: 2,
  },
  legalDot: {
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 3,
  },
  legalCapture: {
    ...StyleSheet.absoluteFillObject,
    borderColor: 'rgba(0,0,0,0.25)',
    zIndex: 3,
  },
  coordRank: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontWeight: '700',
    zIndex: 1,
  },
  coordFile: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontWeight: '700',
    zIndex: 1,
  },
});
