import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { CURRICULUM, getLevelFromXP, getXPProgressInLevel, XP_PER_LEVEL, DAILY_XP_GOAL } from '@/constants/curriculum';
import { useGameStore } from '@/store/gameStore';
import SkillNode from '@/components/ui/SkillNode';
import StreakBadge from '@/components/ui/StreakBadge';
import HeartBar from '@/components/ui/HeartBar';
import XPBar from '@/components/ui/XPBar';
import ProgressBar from '@/components/ui/ProgressBar';

export default function HomeScreen() {
  const { progress } = useGameStore();

  const xp = progress?.xp ?? 0;
  const level = getLevelFromXP(xp);
  const streak = progress?.streak ?? 0;
  const hearts = progress?.hearts ?? 5;
  const unlockedUnits = progress?.unlockedUnits ?? ['basics'];
  const completedLessons = progress?.completedLessons ?? [];

  // Daily XP goal progress (simplified: track XP earned today)
  const dailyXP = Math.min(xp % DAILY_XP_GOAL, DAILY_XP_GOAL);

  function getUnitStatus(unit: typeof CURRICULUM[0]): 'locked' | 'active' | 'complete' | 'mastered' {
    if (!unlockedUnits.includes(unit.id)) return 'locked';
    const unitLessons = unit.lessons.map((l) => l.id);
    const done = unitLessons.filter((id) => completedLessons.includes(id)).length;
    if (done === unitLessons.length) return 'mastered';
    if (done > 0) return 'active';
    return 'active';
  }

  function getCompletedCount(unit: typeof CURRICULUM[0]): number {
    return unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.appBrand}>
            <Text style={styles.brandIcon}>♟️</Text>
            <Text style={styles.brandName}>ChessMaster</Text>
          </View>
          <View style={styles.topStats}>
            <StreakBadge streak={streak} size="sm" />
            <HeartBar hearts={hearts} maxHearts={5} size={18} />
          </View>
        </View>

        {/* Level / XP bar */}
        <View style={styles.levelBar}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>Lvl</Text>
            <Text style={styles.levelNum}>{level}</Text>
          </View>
          <View style={styles.xpSection}>
            <XPBar xp={xp} showLabel compact />
          </View>
        </View>

        {/* Daily goal */}
        <View style={styles.dailyCard}>
          <View style={styles.dailyLeft}>
            <Text style={styles.dailyTitle}>Daily Goal</Text>
            <Text style={styles.dailySubtitle}>{dailyXP}/{DAILY_XP_GOAL} XP earned today</Text>
          </View>
          <View style={styles.dailyProgress}>
            <ProgressBar current={dailyXP} total={DAILY_XP_GOAL} color={Colors.primary} height={10} />
          </View>
        </View>

        {/* Quick Practice button */}
        <TouchableOpacity
          style={styles.practiceBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/practice')}
        >
          <Text style={styles.practiceBtnIcon}>⚡</Text>
          <View>
            <Text style={styles.practiceBtnTitle}>Quick Puzzle</Text>
            <Text style={styles.practiceBtnSub}>Random tactic from Lichess</Text>
          </View>
          <Text style={styles.practiceBtnArrow}>›</Text>
        </TouchableOpacity>

        {/* Skill tree */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Your Path</Text>

          {CURRICULUM.map((unit, i) => {
            const status = getUnitStatus(unit);
            const completed = getCompletedCount(unit);

            return (
              <View key={unit.id}>
                {/* Connector line between nodes */}
                {i > 0 && (
                  <View style={styles.connector}>
                    <View style={[styles.connectorLine, {
                      backgroundColor: getUnitStatus(CURRICULUM[i - 1]) !== 'locked'
                        ? Colors.bgBorder
                        : Colors.bgBorder + '44',
                    }]} />
                  </View>
                )}
                <SkillNode
                  unit={unit}
                  status={status}
                  lessonCount={unit.lessons.length}
                  completedCount={completed}
                  onPress={() => {
                    if (status !== 'locked') {
                      router.push(`/lesson/${unit.id}`);
                    }
                  }}
                />
              </View>
            );
          })}

          <View style={styles.bottomPad} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  appBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: { fontSize: 24 },
  brandName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
  },
  topStats: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  levelBadge: {
    backgroundColor: Colors.primary + '22',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '55',
  },
  levelLabel: { fontSize: 9, color: Colors.primary, fontWeight: Typography.weights.bold, letterSpacing: 1 },
  levelNum: { fontSize: Typography.sizes.lg, color: Colors.primary, fontWeight: Typography.weights.black },
  xpSection: { flex: 1 },
  dailyCard: {
    marginHorizontal: Spacing['2xl'],
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    marginBottom: Spacing.md,
    gap: 8,
  },
  dailyLeft: { gap: 2 },
  dailyTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  dailySubtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  dailyProgress: {},
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing.base,
    backgroundColor: Colors.secondary + '18',
    borderWidth: 1.5,
    borderColor: Colors.secondary + '55',
    borderRadius: Radius.xl,
    padding: Spacing.base,
  },
  practiceBtnIcon: { fontSize: 28 },
  practiceBtnTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  practiceBtnSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  practiceBtnArrow: { marginLeft: 'auto', fontSize: 24, color: Colors.secondary },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.base, gap: 0 },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  connector: { alignItems: 'center', paddingVertical: 8, marginHorizontal: 16 },
  connectorLine: { width: 3, height: 24, borderRadius: 2 },
  bottomPad: { height: 80 },
});
