import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';
import { Difficulty } from '@/lib/chess-ai';
import { playTap } from '@/lib/sounds';

// ─── Data ─────────────────────────────────────────────────────────────────────

const DIFFICULTIES: { id: Difficulty; label: string; emoji: string; desc: string; color: string }[] = [
  { id: 'beginner', label: 'Beginner',  emoji: '🐣', desc: 'Random moves — just learning', color: '#58CC02' },
  { id: 'easy',     label: 'Easy',      emoji: '🐥', desc: 'Simple tactics (Depth 1)',     color: '#1CB0F6' },
  { id: 'medium',   label: 'Medium',    emoji: '🦊', desc: 'Solid play (Depth 3)',          color: '#FF9600' },
  { id: 'hard',     label: 'Hard',      emoji: '🦁', desc: 'Stockfish (cloud)',             color: '#CE82FF' },
  { id: 'expert',   label: 'Expert',    emoji: '🤖', desc: 'Full Stockfish analysis',       color: '#FF4B4B' },
];

const TIME_CONTROLS: { label: string; sub: string; seconds: number; increment: number }[] = [
  { label: '1 min',   sub: 'Bullet',  seconds:  60,  increment: 0 },
  { label: '3 min',   sub: 'Bullet',  seconds: 180,  increment: 0 },
  { label: '5 min',   sub: 'Blitz',   seconds: 300,  increment: 0 },
  { label: '10 min',  sub: 'Rapid',   seconds: 600,  increment: 0 },
  { label: '15+10',   sub: 'Rapid',   seconds: 900,  increment: 10 },
  { label: 'No limit',sub: 'Casual',  seconds: 0,    increment: 0 },
];

const COLOR_OPTIONS = [
  { id: 'w', label: 'White', icon: '♔' },
  { id: 'random', label: 'Random', icon: '🎲' },
  { id: 'b', label: 'Black', icon: '♚' },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayScreen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [timeIdx, setTimeIdx]       = useState(3); // 10 min default
  const [color, setColor]           = useState<'w' | 'b' | 'random'>('w');
  const [coachOn, setCoachOn]       = useState(true);

  function startGame() {
    playTap();
    const tc = TIME_CONTROLS[timeIdx];
    const playerColor = color === 'random'
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : color;
    router.push(
      `/game?difficulty=${difficulty}&color=${playerColor}&time=${tc.seconds}&increment=${tc.increment}&coach=${coachOn ? '1' : '0'}`,
    );
  }

  const selectedDiff = DIFFICULTIES.find((d) => d.id === difficulty)!;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.fill} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>♟ Play Chess</Text>
            <Text style={styles.subtitle}>Challenge the AI and learn from every game</Text>
          </View>

          {/* Difficulty */}
          <Section title="Difficulty">
            <View style={styles.diffGrid}>
              {DIFFICULTIES.map((d) => {
                const active = difficulty === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.diffCard, active && { borderColor: d.color, backgroundColor: d.color + '18' }]}
                    onPress={() => { playTap(); setDifficulty(d.id); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.diffEmoji}>{d.emoji}</Text>
                    <Text style={[styles.diffLabel, active && { color: d.color }]}>{d.label}</Text>
                    <Text style={styles.diffDesc}>{d.desc}</Text>
                    {active && <View style={[styles.diffDot, { backgroundColor: d.color }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* Time control */}
          <Section title="Time Control">
            <View style={styles.timeGrid}>
              {TIME_CONTROLS.map((tc, i) => {
                const active = timeIdx === i;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.timeCard, active && styles.timeCardActive]}
                    onPress={() => { playTap(); setTimeIdx(i); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeLabel, active && styles.timeLabelActive]}>{tc.label}</Text>
                    <Text style={[styles.timeSub, active && styles.timeSubActive]}>{tc.sub}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* Color */}
          <Section title="Play as">
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => {
                const active = color === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.colorCard, active && styles.colorCardActive]}
                    onPress={() => { playTap(); setColor(c.id); }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.colorIcon}>{c.icon}</Text>
                    <Text style={[styles.colorLabel, active && styles.colorLabelActive]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* Coach mode */}
          <Section title="Coach Mode">
            <View style={styles.coachRow}>
              <View style={styles.coachInfo}>
                <Text style={styles.coachTitle}>Post-move advice</Text>
                <Text style={styles.coachSub}>
                  After each move: Best / Good / Inaccuracy / Mistake / Blunder
                </Text>
              </View>
              <Switch
                value={coachOn}
                onValueChange={setCoachOn}
                trackColor={{ false: '#2a3060', true: Colors.primary + '88' }}
                thumbColor={coachOn ? Colors.primary : '#555'}
              />
            </View>
            {coachOn && (
              <View style={styles.evalLegend}>
                {[
                  { label: 'Best',       color: '#00c853', symbol: '✦' },
                  { label: 'Excellent',  color: '#69f0ae', symbol: '✦' },
                  { label: 'Good',       color: '#b9f6ca', symbol: '▲' },
                  { label: 'Inaccuracy', color: '#FFD700', symbol: '△' },
                  { label: 'Mistake',    color: '#FF9600', symbol: '✗' },
                  { label: 'Blunder',    color: '#FF4B4B', symbol: '✗✗' },
                ].map((e) => (
                  <View key={e.label} style={styles.evalItem}>
                    <Text style={[styles.evalSymbol, { color: e.color }]}>{e.symbol}</Text>
                    <Text style={styles.evalLabel}>{e.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </Section>

          {/* Start button */}
          <TouchableOpacity onPress={startGame} activeOpacity={0.88} style={styles.startBtn}>
            <LinearGradient
              colors={[selectedDiff.color, selectedDiff.color + 'bb']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={styles.startIcon}>{selectedDiff.emoji}</Text>
              <Text style={styles.startText}>PLAY {selectedDiff.label.toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080c18' },
  fill: { flex: 1 },
  content: { padding: Spacing['2xl'], gap: Spacing.xl },

  header: { gap: 4, paddingBottom: 4 },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
  },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.textMuted },

  section: { gap: 10 },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Difficulty
  diffGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  diffCard: {
    width: '30%',
    padding: 10,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  diffEmoji: { fontSize: 22 },
  diffLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  diffDesc: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  diffDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Time control
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeCard: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    gap: 1,
  },
  timeCardActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.gold + '18',
  },
  timeLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  timeLabelActive: { color: Colors.gold },
  timeSub: { fontSize: 9, color: Colors.textMuted },
  timeSubActive: { color: Colors.gold + 'aa' },

  // Color picker
  colorRow: { flexDirection: 'row', gap: 12 },
  colorCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: Colors.bgBorder,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    gap: 4,
  },
  colorCardActive: { borderColor: Colors.secondary, backgroundColor: Colors.secondary + '18' },
  colorIcon: { fontSize: 26 },
  colorLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, color: Colors.textMuted },
  colorLabelActive: { color: Colors.secondary },

  // Coach
  coachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
    gap: 12,
  },
  coachInfo: { flex: 1, gap: 3 },
  coachTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.textPrimary },
  coachSub: { fontSize: Typography.sizes.xs, color: Colors.textMuted, lineHeight: 16 },
  evalLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.bgBorder,
  },
  evalItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  evalSymbol: { fontSize: 12, fontWeight: Typography.weights.black },
  evalLabel: { fontSize: 11, color: Colors.textMuted },

  // Start button
  startBtn: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Shadow.button,
    marginTop: 8,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  startIcon: { fontSize: 24 },
  startText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.black,
    color: '#fff',
    letterSpacing: 1.5,
  },
});
