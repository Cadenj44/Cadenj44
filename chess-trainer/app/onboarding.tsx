import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';

const { width: W } = Dimensions.get('window');

const LEVELS = [
  {
    id: 'beginner',
    title: 'Just Starting',
    subtitle: "I know the basic rules but not much else",
    emoji: '🐣',
    color: Colors.primary,
    xpBonus: 0,
  },
  {
    id: 'casual',
    title: 'Casual Player',
    subtitle: 'I play occasionally and know some tactics',
    emoji: '🐦',
    color: Colors.secondary,
    xpBonus: 50,
  },
  {
    id: 'intermediate',
    title: 'Club Player',
    subtitle: 'I study openings and endgames regularly',
    emoji: '🦅',
    color: Colors.accent,
    xpBonus: 150,
  },
  {
    id: 'advanced',
    title: 'Tournament Player',
    subtitle: "I'm rated and looking to improve further",
    emoji: '🦁',
    color: Colors.purple,
    xpBonus: 300,
  },
];

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const { addXP, unlockUnit } = useGameStore();

  function handleStart() {
    if (!selected) return;
    const level = LEVELS.find((l) => l.id === selected);
    if (level?.xpBonus) addXP(level.xpBonus);
    // Unlock first unit by default
    unlockUnit('basics');
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[Colors.bg, '#0D1A38']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.emoji}>♟️</Text>
        <Text style={styles.title}>What's your chess level?</Text>
        <Text style={styles.subtitle}>
          We'll personalize your training path to match your experience.
        </Text>
      </View>

      <View style={styles.options}>
        {LEVELS.map((level) => {
          const isSelected = selected === level.id;
          return (
            <TouchableOpacity
              key={level.id}
              onPress={() => setSelected(level.id)}
              activeOpacity={0.8}
              style={[
                styles.option,
                {
                  borderColor: isSelected ? level.color : Colors.bgBorder,
                  backgroundColor: isSelected ? level.color + '18' : Colors.bgCard,
                },
              ]}
            >
              <Text style={styles.optionEmoji}>{level.emoji}</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, isSelected && { color: level.color }]}>
                  {level.title}
                </Text>
                <Text style={styles.optionSubtitle}>{level.subtitle}</Text>
              </View>
              {isSelected && (
                <View style={[styles.check, { backgroundColor: level.color }]}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Button
          label="START TRAINING"
          onPress={handleStart}
          disabled={!selected}
          size="lg"
          icon="🚀"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  emoji: { fontSize: 64, lineHeight: 72 },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.black,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  options: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.md,
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    gap: Spacing.base,
  },
  optionEmoji: { fontSize: 32, width: 44, textAlign: 'center' },
  optionText: { flex: 1, gap: 2 },
  optionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  optionSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  check: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontWeight: Typography.weights.black, fontSize: 14 },
  footer: {
    padding: Spacing['2xl'],
    paddingBottom: 48,
  },
});
