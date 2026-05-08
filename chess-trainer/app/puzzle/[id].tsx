import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  StatusBar, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { playCorrect, playError, playTap } from '@/lib/sounds';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import ChessBoard from '@/components/chess/ChessBoard';
import CelebrationOverlay from '@/components/ui/CelebrationOverlay';
import HeartBar from '@/components/ui/HeartBar';
import Button from '@/components/ui/Button';
import { fetchPuzzleById, fetchRandomPuzzle, OFFLINE_PUZZLES } from '@/lib/lichess';
import { usePuzzle } from '@/hooks/usePuzzle';
import { LichessPuzzle } from '@/types';
import { useGameStore } from '@/store/gameStore';

const XP_FOR_PUZZLE = 20;
const XP_HINT_PENALTY = 5;

export default function PuzzleScreen() {
  const { id } = useLocalSearchParams<{ id: string; theme?: string }>();
  const theme = useLocalSearchParams<{ theme?: string }>().theme;

  const [puzzle, setPuzzle] = useState<LichessPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongFlash, setWrongFlash] = useState(false);

  const { progress, completePuzzle, useHeart, incrementStreak } = useGameStore();

  const { fen, state, selectedSquare, legalSquares, lastMoveSquares, hintsUsed, movesUsed,
    init, selectSquare, getHint, elapsedSeconds } = usePuzzle(puzzle);

  useEffect(() => {
    loadPuzzle();
  }, [id]);

  useEffect(() => {
    if (puzzle) init();
  }, [puzzle]);

  useEffect(() => {
    if (state === 'complete') {
      handleComplete();
    } else if (state === 'wrong') {
      handleWrong();
    }
  }, [state]);

  async function loadPuzzle() {
    setLoading(true);
    let p: LichessPuzzle | null = null;

    if (id === 'random') {
      p = await fetchRandomPuzzle(theme ? [theme] : undefined);
    } else {
      // Check offline puzzles first
      p = OFFLINE_PUZZLES.find((op) => op.id === id) ?? null;
      if (!p) p = await fetchPuzzleById(id);
    }

    setPuzzle(p ?? OFFLINE_PUZZLES[Math.floor(Math.random() * OFFLINE_PUZZLES.length)]);
    setLoading(false);
  }

  async function handleComplete() {
    playCorrect();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const earned = Math.max(XP_FOR_PUZZLE - hintsUsed * XP_HINT_PENALTY, 5);
    setXpEarned(earned);
    if (puzzle) completePuzzle(puzzle.id, earned);
    incrementStreak();
    setShowCelebration(true);
  }

  async function handleWrong() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    playError();
    setWrongFlash(true);
    useHeart();
    setTimeout(() => setWrongFlash(false), 800);
  }

  function handleHint() {
    if ((progress?.hearts ?? 0) <= 0) {
      Alert.alert('No Hearts Left', 'Come back later or wait for hearts to regenerate.');
      return;
    }
    getHint();
    Haptics.selectionAsync();
  }

  function handleContinue() {
    setShowCelebration(false);
    router.back();
  }

  function handleSkip() {
    loadPuzzle();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading puzzle…</Text>
      </View>
    );
  }

  // Determine whose turn it is for the header
  const playerColor = puzzle && fen
    ? (fen.split(' ')[1] === 'w' ? 'White' : 'Black')
    : '';

  return (
    <View style={[styles.flex, wrongFlash && { backgroundColor: Colors.error + '15' }]}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Puzzle</Text>
            {puzzle && (
              <Text style={styles.headerSub}>⭐ {puzzle.rating}</Text>
            )}
          </View>
          <HeartBar hearts={progress?.hearts ?? 5} maxHearts={5} size={20} />
        </View>

        {/* Themes */}
        {puzzle?.themes && puzzle.themes.length > 0 && (
          <View style={styles.themesRow}>
            {puzzle.themes.slice(0, 3).map((t) => (
              <View key={t} style={styles.themeChip}>
                <Text style={styles.themeText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Instruction */}
        <View style={styles.instruction}>
          <Text style={styles.instructionText}>
            {state === 'playing'
              ? `Find the best move for ${playerColor}`
              : state === 'wrong'
                ? '❌ Not quite — try again!'
                : state === 'complete'
                  ? '🏆 Puzzle solved!'
                  : ''}
          </Text>
        </View>

        {/* Chess Board */}
        <View style={styles.boardContainer}>
          <ChessBoard
            fen={fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
            selectedSquare={selectedSquare}
            legalSquares={legalSquares}
            lastMoveSquares={lastMoveSquares}
            onSquarePress={selectSquare}
            interactive={state === 'playing'}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleHint}>
            <Text style={styles.actionIcon}>💡</Text>
            <Text style={styles.actionLabel}>Hint{hintsUsed > 0 ? ` (${hintsUsed})` : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleSkip}>
            <Text style={styles.actionIcon}>⏭️</Text>
            <Text style={styles.actionLabel}>Skip</Text>
          </TouchableOpacity>

          {puzzle?.gameUrl && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => Alert.alert('Game Analysis', `View on Lichess:\n${puzzle.gameUrl}`)}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionLabel}>Analysis</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Wrong move feedback bar */}
        {state === 'wrong' && (
          <View style={styles.wrongBar}>
            <Text style={styles.wrongText}>❌  That's not right. Try another move!</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Celebration */}
      <CelebrationOverlay
        visible={showCelebration}
        type="complete"
        xpEarned={xpEarned}
        message={`Solved in ${movesUsed} move${movesUsed !== 1 ? 's' : ''}${hintsUsed ? ` with ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}` : ''}!`}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: Colors.bg },
  loadingText: { color: Colors.textSecondary, fontSize: Typography.sizes.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: Colors.textSecondary, fontSize: 16, fontWeight: Typography.weights.bold },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  headerSub: { fontSize: Typography.sizes.sm, color: Colors.gold },
  themesRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.sm,
  },
  themeChip: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  themeText: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  instruction: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.sm,
    minHeight: 32,
  },
  instructionText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  boardContainer: { alignItems: 'center', paddingHorizontal: 8, paddingVertical: Spacing.md },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: Spacing.xl,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted, fontWeight: Typography.weights.semibold },
  wrongBar: {
    marginHorizontal: Spacing['2xl'],
    backgroundColor: Colors.error + '22',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error + '55',
    alignItems: 'center',
  },
  wrongText: { color: Colors.error, fontWeight: Typography.weights.semibold, fontSize: Typography.sizes.base },
});
