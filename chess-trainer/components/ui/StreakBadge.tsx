import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '@/constants/theme';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 22 : 17;
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 22;

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: iconSize }}>🔥</Text>
      <Text style={[styles.count, { fontSize }]}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,150,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,150,0,0.35)',
  },
  count: {
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
});
