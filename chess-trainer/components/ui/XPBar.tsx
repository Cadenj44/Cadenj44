import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import { XP_PER_LEVEL, getXPProgressInLevel } from '@/constants/curriculum';

interface XPBarProps {
  xp: number;
  showLabel?: boolean;
  compact?: boolean;
}

export default function XPBar({ xp, showLabel = true, compact = false }: XPBarProps) {
  const progress = getXPProgressInLevel(xp);
  const ratio = progress / XP_PER_LEVEL;
  const animRef = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animRef.current, {
      toValue: ratio,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const widthInterp = animRef.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    return (
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterp }]} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={styles.label}>
          {progress}<Text style={styles.labelMuted}> / {XP_PER_LEVEL} XP</Text>
        </Text>
      )}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterp }]}>
          <View style={styles.shine} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 4 },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  labelMuted: {
    color: Colors.textMuted,
    fontWeight: Typography.weights.normal,
  },
  track: {
    height: 14,
    backgroundColor: Colors.xpBg,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: Radius.full,
  },
});
