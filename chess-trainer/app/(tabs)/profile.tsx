import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import { useAuth } from '@/hooks/useAuth';
import { CURRICULUM, getLevelFromXP, getXPProgressInLevel, XP_PER_LEVEL } from '@/constants/curriculum';
import XPBar from '@/components/ui/XPBar';
import StreakBadge from '@/components/ui/StreakBadge';
import HeartBar from '@/components/ui/HeartBar';
import Button from '@/components/ui/Button';

export default function ProfileScreen() {
  const { progress } = useGameStore();
  const { user, signOut } = useAuth();

  const xp = progress?.xp ?? 0;
  const level = getLevelFromXP(xp);
  const streak = progress?.streak ?? 0;
  const hearts = progress?.hearts ?? 5;
  const completedLessons = progress?.completedLessons ?? [];
  const completedPuzzles = progress?.completedPuzzles ?? [];
  const gems = progress?.gems ?? 0;

  const totalLessons = CURRICULUM.reduce((acc, u) => acc + u.lessons.length, 0);
  const username = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'Player';

  const STATS = [
    { label: 'XP Earned', value: xp.toLocaleString(), icon: '⭐', color: Colors.gold },
    { label: 'Streak', value: `${streak} days`, icon: '🔥', color: Colors.accent },
    { label: 'Lessons', value: `${completedLessons.length}/${totalLessons}`, icon: '📚', color: Colors.secondary },
    { label: 'Puzzles', value: completedPuzzles.length.toString(), icon: '🎯', color: Colors.purple },
    { label: 'Gems', value: gems.toString(), icon: '💎', color: Colors.secondary },
    { label: 'Hearts', value: `${hearts}/5`, icon: '❤️', color: Colors.error },
  ];

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Avatar + Name */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>♟️</Text>
              <View style={[styles.levelDot, { backgroundColor: Colors.primary }]}>
                <Text style={styles.levelDotText}>{level}</Text>
              </View>
            </View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <StreakBadge streak={streak} size="md" />
          </View>

          {/* Level progress */}
          <View style={styles.levelCard}>
            <View style={styles.levelCardHeader}>
              <Text style={styles.levelCardTitle}>Level {level}</Text>
              <Text style={styles.levelCardSub}>{getXPProgressInLevel(xp)}/{XP_PER_LEVEL} XP to next level</Text>
            </View>
            <XPBar xp={xp} showLabel={false} />
          </View>

          {/* Stats grid */}
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.label} style={[styles.statCard, Shadow.card]}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Unit completion */}
          <Text style={styles.sectionTitle}>Skill Progress</Text>
          <View style={styles.unitList}>
            {CURRICULUM.map((unit) => {
              const done = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
              const pct = Math.round((done / unit.lessons.length) * 100);
              return (
                <View key={unit.id} style={styles.unitRow}>
                  <Text style={styles.unitIcon}>{unit.icon}</Text>
                  <View style={styles.unitInfo}>
                    <View style={styles.unitInfoTop}>
                      <Text style={styles.unitName}>{unit.title}</Text>
                      <Text style={[styles.unitPct, { color: unit.color }]}>{pct}%</Text>
                    </View>
                    <View style={styles.unitTrack}>
                      <View style={[styles.unitFill, { width: `${pct}%`, backgroundColor: unit.color }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Sign out */}
          <Button
            label="SIGN OUT"
            onPress={handleSignOut}
            variant="outline"
            size="md"
          />
          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing['2xl'], gap: Spacing.lg },
  profileHeader: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xl },
  avatarContainer: { position: 'relative', width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: {
    fontSize: 64,
    width: 90,
    height: 90,
    textAlign: 'center',
    lineHeight: 90,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 3,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  levelDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.bg,
  },
  levelDotText: { color: '#fff', fontWeight: Typography.weights.black, fontSize: 12 },
  username: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
  },
  email: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  levelCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: 8,
  },
  levelCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelCardTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  levelCardSub: { fontSize: Typography.sizes.sm, color: Colors.textMuted },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '30.5%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  statIcon: { fontSize: 22 },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.black,
  },
  statLabel: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
  unitList: { gap: 12 },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  unitIcon: { fontSize: 24, width: 36, textAlign: 'center' },
  unitInfo: { flex: 1, gap: 6 },
  unitInfoTop: { flexDirection: 'row', justifyContent: 'space-between' },
  unitName: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textPrimary },
  unitPct: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
  unitTrack: {
    height: 6,
    backgroundColor: Colors.bgBorder,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  unitFill: { height: '100%', borderRadius: Radius.full },
});
