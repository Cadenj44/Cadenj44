import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  ScrollView, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { PUZZLE_THEMES } from '@/constants/curriculum';
import { fetchRandomPuzzle, fetchDailyPuzzle, OFFLINE_PUZZLES } from '@/lib/lichess';
import { LichessPuzzle } from '@/types';
import Button from '@/components/ui/Button';

export default function PracticeScreen() {
  const [dailyPuzzle, setDailyPuzzle] = useState<LichessPuzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  async function loadDailyPuzzle() {
    setLoading(true);
    const p = await fetchDailyPuzzle();
    setDailyPuzzle(p ?? OFFLINE_PUZZLES[0]);
    setLoading(false);
  }

  function startPuzzle(puzzleId?: string, theme?: string) {
    if (puzzleId) {
      router.push(`/puzzle/${puzzleId}`);
    } else {
      router.push(`/puzzle/random${theme ? `?theme=${theme}` : ''}`);
    }
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={styles.screenTitle}>Practice</Text>

          {/* Daily Puzzle Card */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Daily Puzzle</Text>
          </View>
          <View style={styles.dailyCard}>
            {loading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : dailyPuzzle ? (
              <>
                <View style={styles.dailyInfo}>
                  <View>
                    <Text style={styles.dailyLabel}>Today's Challenge</Text>
                    <Text style={styles.dailyRating}>⭐ Rating: {dailyPuzzle.rating}</Text>
                  </View>
                  <View style={styles.themeChips}>
                    {dailyPuzzle.themes.slice(0, 2).map((t) => (
                      <View key={t} style={styles.themeChip}>
                        <Text style={styles.themeChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <Button
                  label="SOLVE DAILY PUZZLE"
                  onPress={() => startPuzzle(dailyPuzzle.id)}
                  icon="🎯"
                  size="md"
                />
              </>
            ) : (
              <Text style={styles.errorText}>Could not load daily puzzle</Text>
            )}
          </View>

          {/* Practice by Theme */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎭 Practice by Theme</Text>
            <Text style={styles.sectionSub}>Pick a tactical pattern to drill</Text>
          </View>
          <View style={styles.themeGrid}>
            {PUZZLE_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    {
                      borderColor: isSelected ? theme.color : Colors.bgBorder,
                      backgroundColor: isSelected ? theme.color + '22' : Colors.bgCard,
                    },
                  ]}
                  onPress={() => setSelectedTheme(isSelected ? null : theme.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                  <Text style={[styles.themeLabel, isSelected && { color: theme.color }]}>
                    {theme.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            label={selectedTheme ? `DRILL ${PUZZLE_THEMES.find((t) => t.id === selectedTheme)?.label.toUpperCase()}` : 'RANDOM PUZZLE'}
            onPress={() => startPuzzle(undefined, selectedTheme ?? undefined)}
            variant={selectedTheme ? 'primary' : 'outline'}
            icon="⚡"
            size="md"
          />

          {/* Offline Puzzles for when no internet */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Classic Puzzles</Text>
            <Text style={styles.sectionSub}>Handpicked training positions</Text>
          </View>
          {OFFLINE_PUZZLES.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={styles.puzzleRow}
              onPress={() => router.push(`/puzzle/${p.id}`)}
              activeOpacity={0.8}
            >
              <View style={styles.puzzleNum}>
                <Text style={styles.puzzleNumText}>{i + 1}</Text>
              </View>
              <View style={styles.puzzleInfo}>
                <Text style={styles.puzzleTitle}>Position #{i + 1}</Text>
                <View style={styles.puzzleChips}>
                  {p.themes.map((t) => (
                    <View key={t} style={[styles.themeChip, { backgroundColor: Colors.bgBorder }]}>
                      <Text style={styles.themeChipText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={styles.puzzleRating}>⭐{p.rating}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing['2xl'], gap: Spacing.base },
  screenTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  sectionHeader: { gap: 2, marginTop: Spacing.sm },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sectionSub: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  dailyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1.5,
    borderColor: Colors.gold + '55',
    gap: Spacing.md,
  },
  dailyInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dailyLabel: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  dailyRating: { fontSize: Typography.sizes.sm, color: Colors.gold, marginTop: 2 },
  themeChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  themeChip: {
    backgroundColor: Colors.bgBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  themeChipText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary },
  errorText: { color: Colors.error, textAlign: 'center', padding: 12 },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  themeCard: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  themeIcon: { fontSize: 22 },
  themeLabel: {
    fontSize: 9,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  puzzleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  puzzleNum: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '55',
  },
  puzzleNumText: { color: Colors.primary, fontWeight: Typography.weights.black, fontSize: Typography.sizes.sm },
  puzzleInfo: { flex: 1, gap: 4 },
  puzzleTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
  puzzleChips: { flexDirection: 'row', gap: 6 },
  puzzleRating: { fontSize: Typography.sizes.sm, color: Colors.gold },
  arrow: { fontSize: 22, color: Colors.textMuted },
});
