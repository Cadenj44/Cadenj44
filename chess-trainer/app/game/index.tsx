import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated,
  ScrollView, StatusBar, useWindowDimensions, Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Chess } from 'chess.js';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import ChessBoard from '@/components/chess/ChessBoard';
import PlayerBar from '@/components/chess/PlayerBar';
import MoveHistory from '@/components/chess/MoveHistory';
import { getBestMove, getCoachEval, Difficulty, CoachEval } from '@/lib/chess-ai';
import { getLegalMoves } from '@/lib/chess-utils';
import { playCorrect, playError, playTap, playUnlock } from '@/lib/sounds';

// ─── Coach badge config ───────────────────────────────────────────────────────

const COACH_CONFIG: Record<CoachEval['classification'], {
  label: string; symbol: string; color: string; bg: string;
}> = {
  best:       { label: 'Best move!',   symbol: '✦',   color: '#00e676', bg: '#00e67622' },
  excellent:  { label: 'Excellent!',   symbol: '✦',   color: '#69f0ae', bg: '#69f0ae22' },
  good:       { label: 'Good',         symbol: '▲',   color: '#b9f6ca', bg: '#b9f6ca22' },
  inaccuracy: { label: 'Inaccuracy',   symbol: '△',   color: '#FFD700', bg: '#FFD70022' },
  mistake:    { label: 'Mistake',      symbol: '✗',   color: '#FF9600', bg: '#FF960022' },
  blunder:    { label: 'Blunder!',     symbol: '✗✗',  color: '#FF4B4B', bg: '#FF4B4B22' },
};

const DIFFICULTY_LABELS: Record<string, { name: string; rating: string }> = {
  beginner: { name: 'Beginner Bot', rating: '~400'  },
  easy:     { name: 'Easy Bot',     rating: '~800'  },
  medium:   { name: 'Medium Bot',   rating: '~1200' },
  hard:     { name: 'Hard Bot',     rating: '~1800' },
  expert:   { name: 'Expert Bot',   rating: '~2400' },
};

// ─── Main game screen ─────────────────────────────────────────────────────────

export default function GameScreen() {
  const { difficulty = 'medium', color = 'w', time = '600', increment = '0', coach = '1' }
    = useLocalSearchParams<{ difficulty?: string; color?: string; time?: string; increment?: string; coach?: string }>();

  const playerColor  = (color === 'b' ? 'b' : 'w') as 'w' | 'b';
  const aiColor      = playerColor === 'w' ? 'b' : 'w';
  const coachEnabled = coach !== '0';
  const timeInit     = parseInt(time) || 0;
  const inc          = parseInt(increment) || 0;

  const { width: screenW } = useWindowDimensions();
  const boardSize = Math.min(screenW, 520) - (Platform.OS === 'web' ? 0 : 0);

  // ── Chess state ──
  const gameRef  = useRef(new Chess());
  const [fen, setFen]       = useState(gameRef.current.fen());
  const [moves, setMoves]   = useState<string[]>([]);

  // ── Selection ──
  const [selected, setSelected]     = useState<string | null>(null);
  const [legalSqs, setLegalSqs]     = useState<string[]>([]);
  const [lastMove, setLastMove]     = useState<string[]>([]);
  const [hintSquares, setHintSqs]   = useState<string[]>([]);

  // ── AI ──
  const [aiThinking, setAiThinking] = useState(false);

  // ── Clocks ──
  const [wTime, setWTime] = useState(timeInit);
  const [bTime, setBTime] = useState(timeInit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Coach ──
  const [coachEval, setCoachEval]       = useState<CoachEval | null>(null);
  const coachAnim = useRef(new Animated.Value(0)).current;
  const prevFenRef = useRef(gameRef.current.fen());

  // ── Game over ──
  const [gameOver, setGameOver] = useState<{
    result: 'win' | 'lose' | 'draw'; reason: string;
  } | null>(null);

  // ── Captured pieces ──
  const [wCaptured, setWCaptured] = useState<string[]>([]); // pieces white captured
  const [bCaptured, setBCaptured] = useState<string[]>([]); // pieces black captured

  // ─── Timer ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!timeInit || gameOver) return;
    const turn = gameRef.current.turn();
    const isPlayerTurn = turn === playerColor;

    timerRef.current = setInterval(() => {
      if (isPlayerTurn) {
        setWTime((prev) => {
          if (playerColor === 'w' && prev <= 0) { endGame('lose', 'Time out'); return 0; }
          return playerColor === 'w' ? prev - 1 : prev;
        });
        setBTime((prev) => {
          if (playerColor === 'b' && prev <= 0) { endGame('lose', 'Time out'); return 0; }
          return playerColor === 'b' ? prev - 1 : prev;
        });
      } else {
        setWTime((prev) => playerColor === 'b' ? prev - 1 : prev);
        setBTime((prev) => playerColor === 'w' ? prev - 1 : prev);
      }
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fen, gameOver]);

  // ─── If player is Black, AI goes first ──────────────────────────────────────

  useEffect(() => {
    if (playerColor === 'b') {
      setTimeout(() => doAIMove(), 500);
    }
  }, []);

  // ─── Move logic ─────────────────────────────────────────────────────────────

  const tryMove = useCallback(async (from: string, to: string) => {
    const game = gameRef.current;
    if (game.turn() !== playerColor || aiThinking) return;

    const fenBefore = game.fen();
    const legalMoves = game.moves({ verbose: true });
    const matchingMoves = legalMoves.filter((m) => m.from === from && m.to === to);
    if (!matchingMoves.length) return;

    // Handle pawn promotion (auto-queen for simplicity)
    const mv = game.move({ from: from as any, to: to as any, promotion: 'q' });
    if (!mv) return;

    const playedUCI = from + to + (mv.promotion ?? '');
    playTap();
    setFen(game.fen());
    setMoves(game.history());
    setLastMove([from, to]);
    setSelected(null);
    setLegalSqs([]);
    setHintSqs([]);

    // Captured piece tracking
    if (mv.captured) {
      if (playerColor === 'w') setWCaptured((p) => [...p, mv.captured!]);
      else setBCaptured((p) => [...p, mv.captured!]);
    }

    // Add clock increment
    if (timeInit && inc) {
      if (playerColor === 'w') setWTime((t) => t + inc);
      else setBTime((t) => t + inc);
    }

    // Coach evaluation (async, non-blocking)
    if (coachEnabled) {
      const ev = getCoachEval(fenBefore, playedUCI, playerColor);
      setCoachEval(ev);
      setHintSqs(ev.bestMove
        ? [ev.bestMove.slice(0, 2), ev.bestMove.slice(2, 4)]
        : []);
      showCoachBadge();
      if (ev.classification === 'best' || ev.classification === 'excellent') playCorrect();
      else if (ev.classification === 'mistake' || ev.classification === 'blunder') playError();
    }

    // Check game over
    if (checkGameOver()) return;

    // AI responds
    await doAIMove();
  }, [playerColor, aiThinking, coachEnabled, timeInit, inc]);

  async function doAIMove() {
    const game = gameRef.current;
    if (game.isGameOver()) return;
    if (game.turn() !== aiColor) return;

    setAiThinking(true);
    const thinkTime = { beginner: 300, easy: 400, medium: 600, hard: 900, expert: 1200 }[difficulty as Difficulty] ?? 600;
    const [bestMove] = await Promise.all([
      getBestMove(game.fen(), difficulty as Difficulty),
      new Promise((r) => setTimeout(r, thinkTime)), // minimum "think" delay
    ]);

    if (!bestMove) { setAiThinking(false); return; }

    const mv = game.move({ from: bestMove.slice(0, 2) as any, to: bestMove.slice(2, 4) as any, promotion: 'q' });
    if (!mv) { setAiThinking(false); return; }

    if (mv.captured) {
      if (aiColor === 'w') setWCaptured((p) => [...p, mv.captured!]);
      else setBCaptured((p) => [...p, mv.captured!]);
    }
    if (timeInit && inc) {
      if (aiColor === 'w') setWTime((t) => t + inc);
      else setBTime((t) => t + inc);
    }

    setFen(game.fen());
    setMoves(game.history());
    setLastMove([bestMove.slice(0, 2), bestMove.slice(2, 4)]);
    setAiThinking(false);
    setHintSqs([]);
    checkGameOver();
  }

  function checkGameOver() {
    const game = gameRef.current;
    if (!game.isGameOver()) return false;
    if (timerRef.current) clearInterval(timerRef.current);

    if (game.isCheckmate()) {
      const winner = game.turn() === playerColor ? 'lose' : 'win';
      endGame(winner, 'Checkmate');
    } else if (game.isStalemate()) {
      endGame('draw', 'Stalemate');
    } else if (game.isThreefoldRepetition()) {
      endGame('draw', 'Threefold repetition');
    } else if (game.isInsufficientMaterial()) {
      endGame('draw', 'Insufficient material');
    } else {
      endGame('draw', 'Draw');
    }
    return true;
  }

  function endGame(result: 'win' | 'lose' | 'draw', reason: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    if (result === 'win') playUnlock();
    else if (result === 'lose') playError();
    setGameOver({ result, reason });
  }

  // ─── Square press ────────────────────────────────────────────────────────────

  const onSquarePress = useCallback((sq: string) => {
    if (gameOver || aiThinking) return;
    const game = gameRef.current;
    if (game.turn() !== playerColor) return;

    if (selected) {
      if (legalSqs.includes(sq)) {
        tryMove(selected, sq);
      } else {
        // Try selecting a new piece
        const piece = game.get(sq as any);
        if (piece && piece.color === playerColor) {
          setSelected(sq);
          setLegalSqs(getLegalMoves(game, sq));
        } else {
          setSelected(null);
          setLegalSqs([]);
        }
      }
    } else {
      const piece = game.get(sq as any);
      if (piece && piece.color === playerColor) {
        setSelected(sq);
        setLegalSqs(getLegalMoves(game, sq));
      }
    }
  }, [selected, legalSqs, gameOver, aiThinking, playerColor, tryMove]);

  // ─── Hint ────────────────────────────────────────────────────────────────────

  async function showHint() {
    playTap();
    const best = await getBestMove(gameRef.current.fen(), 'medium');
    if (best) setHintSqs([best.slice(0, 2), best.slice(2, 4)]);
  }

  // ─── Coach badge animation ────────────────────────────────────────────────────

  function showCoachBadge() {
    coachAnim.setValue(0);
    Animated.sequence([
      Animated.timing(coachAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2200),
      Animated.timing(coachAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setHintSqs([]));
  }

  // ─── Material advantage ────────────────────────────────────────────────────

  const VALS: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const wMat = wCaptured.reduce((s, p) => s + (VALS[p.toLowerCase()] ?? 0), 0);
  const bMat = bCaptured.reduce((s, p) => s + (VALS[p.toLowerCase()] ?? 0), 0);
  const wAdv = Math.max(0, wMat - bMat);
  const bAdv = Math.max(0, bMat - wMat);

  // ─── UI ──────────────────────────────────────────────────────────────────────

  const isPlayerTurn = gameRef.current.turn() === playerColor;
  const inCheck      = gameRef.current.inCheck();
  const botInfo      = DIFFICULTY_LABELS[difficulty] ?? { name: 'Bot', rating: '' };

  const opponentIsTop = playerColor === 'w'; // white player is at bottom
  const topColor      = opponentIsTop ? aiColor    : playerColor;
  const topName       = opponentIsTop ? botInfo.name : 'You';
  const topRating     = opponentIsTop ? botInfo.rating : undefined;
  const topIsAI       = opponentIsTop;
  const topTime       = topColor === 'w' ? wTime : bTime;
  const topCapt       = topColor === 'w' ? wCaptured : bCaptured;
  const topAdv        = topColor === 'w' ? wAdv : bAdv;
  const topActive     = !gameOver && gameRef.current.turn() === topColor;

  const botColor  = playerColor;
  const botTime   = botColor === 'w' ? wTime : bTime;
  const botCapt   = botColor === 'w' ? wCaptured : bCaptured;
  const botAdv    = botColor === 'w' ? wAdv : bAdv;
  const botActive = !gameOver && gameRef.current.turn() === botColor;

  const coachCfg = coachEval ? COACH_CONFIG[coachEval.classification] : null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => { playTap(); router.back(); }}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {aiThinking ? '🤔 Thinking…' : isPlayerTurn ? '🎯 Your turn' : '⏳ Waiting'}
          </Text>
          <TouchableOpacity style={styles.resignBtn} onPress={() => endGame('lose', 'Resigned')}>
            <Text style={styles.resignText}>Resign</Text>
          </TouchableOpacity>
        </View>

        {/* Opponent bar (top) */}
        <PlayerBar
          name={topName}
          rating={topRating}
          isAI={topIsAI}
          color={topColor}
          timeSeconds={topTime}
          isActive={topActive}
          capturedPieces={topCapt}
          materialAdvantage={topAdv}
        />

        {/* Board */}
        <View style={styles.boardWrapper}>
          <ChessBoard
            fen={fen}
            selectedSquare={selected}
            legalSquares={legalSqs}
            lastMoveSquares={lastMove}
            highlightSquares={hintSquares}
            onSquarePress={onSquarePress}
            orientation={playerColor}
            interactive={isPlayerTurn && !gameOver && !aiThinking}
            size={boardSize}
          />

          {/* Check indicator */}
          {inCheck && !gameOver && (
            <View style={styles.checkBanner}>
              <Text style={styles.checkBannerText}>⚠️ CHECK</Text>
            </View>
          )}

          {/* AI thinking overlay */}
          {aiThinking && (
            <View style={styles.thinkingOverlay}>
              <Text style={styles.thinkingText}>🤖 Calculating…</Text>
            </View>
          )}
        </View>

        {/* Coach badge */}
        {coachEnabled && coachCfg && (
          <Animated.View style={[styles.coachBar, { backgroundColor: coachCfg.bg, opacity: coachAnim }]}>
            <Text style={[styles.coachSymbol, { color: coachCfg.color }]}>{coachCfg.symbol}</Text>
            <View style={styles.coachTextCol}>
              <Text style={[styles.coachLabel, { color: coachCfg.color }]}>{coachCfg.label}</Text>
              {coachEval?.bestMoveSAN && (
                <Text style={styles.coachBest}>Better: <Text style={{ color: coachCfg.color, fontWeight: '700' }}>{coachEval.bestMoveSAN}</Text></Text>
              )}
            </View>
            {coachEnabled && !aiThinking && isPlayerTurn && (
              <TouchableOpacity style={styles.hintBtn} onPress={showHint}>
                <Text style={styles.hintText}>💡 Hint</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Hint button (when coach off) */}
        {(!coachEnabled || !coachCfg) && (
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.controlBtn} onPress={showHint}>
              <Text style={styles.controlIcon}>💡</Text>
              <Text style={styles.controlLabel}>Hint</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={() => endGame('lose', 'Resigned')}>
              <Text style={styles.controlIcon}>🏳️</Text>
              <Text style={styles.controlLabel}>Resign</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Player bar (bottom) */}
        <PlayerBar
          name="You"
          color={botColor}
          timeSeconds={botTime}
          isActive={botActive}
          capturedPieces={botCapt}
          materialAdvantage={botAdv}
        />

        {/* Move history */}
        <MoveHistory moves={moves} compact />

      </SafeAreaView>

      {/* Game-over modal */}
      <GameOverModal
        visible={!!gameOver}
        result={gameOver?.result ?? 'draw'}
        reason={gameOver?.reason ?? ''}
        moves={moves.length}
        onRematch={() => {
          setGameOver(null);
          gameRef.current = new Chess();
          setFen(gameRef.current.fen());
          setMoves([]);
          setSelected(null);
          setLegalSqs([]);
          setLastMove([]);
          setHintSqs([]);
          setCoachEval(null);
          setWCaptured([]);
          setBCaptured([]);
          setWTime(timeInit);
          setBTime(timeInit);
          setAiThinking(false);
          if (playerColor === 'b') setTimeout(() => doAIMove(), 500);
        }}
        onNewGame={() => router.back()}
      />
    </View>
  );
}

// ─── Game-over modal ──────────────────────────────────────────────────────────

function GameOverModal({
  visible, result, reason, moves, onRematch, onNewGame,
}: {
  visible: boolean; result: 'win' | 'lose' | 'draw'; reason: string;
  moves: number; onRematch: () => void; onNewGame: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 9, useNativeDriver: true }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  const cfg = {
    win:  { emoji: '🏆', title: 'You Won!',   color: Colors.gold,    bg: '#2a2000' },
    lose: { emoji: '💀', title: 'You Lost',   color: Colors.error,   bg: '#2a0000' },
    draw: { emoji: '🤝', title: 'Draw!',       color: Colors.textSecondary, bg: '#1a1a2a' },
  }[result];

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={modal.backdrop}>
        <Animated.View style={[modal.sheet, { backgroundColor: cfg.bg, transform: [{ translateY: slideAnim }] }]}>
          <Text style={modal.emoji}>{cfg.emoji}</Text>
          <Text style={[modal.title, { color: cfg.color }]}>{cfg.title}</Text>
          <Text style={modal.reason}>{reason}</Text>
          <Text style={modal.stats}>{Math.ceil(moves / 2)} moves played</Text>

          <View style={modal.buttons}>
            <TouchableOpacity style={modal.rematch} onPress={onRematch} activeOpacity={0.85}>
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={modal.btnGrad}>
                <Text style={modal.btnText}>🔄  REMATCH</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={modal.newGame} onPress={onNewGame} activeOpacity={0.85}>
              <Text style={modal.newGameText}>New Game</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080c18' },
  fill: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2555',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1e2555', alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: Colors.textSecondary, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  topBarTitle: { flex: 1, textAlign: 'center', color: Colors.textPrimary, fontWeight: Typography.weights.bold, fontSize: Typography.sizes.base },
  resignBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.md, backgroundColor: '#2a1010' },
  resignText: { color: Colors.error, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  boardWrapper: { alignItems: 'center', position: 'relative', backgroundColor: '#050810' },
  checkBanner: {
    position: 'absolute',
    top: 8, alignSelf: 'center',
    backgroundColor: Colors.error + 'EE',
    paddingHorizontal: 16, paddingVertical: 5,
    borderRadius: Radius.full, zIndex: 10,
  },
  checkBannerText: { color: '#fff', fontWeight: Typography.weights.black, fontSize: Typography.sizes.sm, letterSpacing: 1 },
  thinkingOverlay: {
    position: 'absolute',
    bottom: 8, alignSelf: 'center',
    backgroundColor: '#111828EE',
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: Radius.full, zIndex: 10,
    borderWidth: 1, borderColor: Colors.secondary + '44',
  },
  thinkingText: { color: Colors.secondary, fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.sm },

  coachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e2555',
    minHeight: 52,
  },
  coachSymbol: { fontSize: 20, fontWeight: '900', width: 28, textAlign: 'center' },
  coachTextCol: { flex: 1, gap: 2 },
  coachLabel: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
  coachBest: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  hintBtn: {
    backgroundColor: '#1e2555',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.md,
  },
  hintText: { color: Colors.secondary, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e2555',
  },
  controlBtn: { alignItems: 'center', gap: 3 },
  controlIcon: { fontSize: 22 },
  controlLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: Typography.weights.semibold },
});

const modal = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 36, paddingBottom: 52,
    alignItems: 'center', gap: 12,
    borderTopWidth: 1, borderColor: '#333',
  },
  emoji: { fontSize: 72, lineHeight: 80 },
  title: { fontSize: Typography.sizes['3xl'], fontWeight: Typography.weights.black },
  reason: { fontSize: Typography.sizes.base, color: Colors.textSecondary },
  stats: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  buttons: { width: '100%', gap: 12, marginTop: 8 },
  rematch: { borderRadius: Radius.full, overflow: 'hidden' },
  btnGrad: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: Typography.weights.black, fontSize: Typography.sizes.lg, letterSpacing: 1 },
  newGame: { alignItems: 'center', paddingVertical: 14 },
  newGameText: { color: Colors.textMuted, fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.base },
});
