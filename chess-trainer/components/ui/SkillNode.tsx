import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Radius, Shadow } from '@/constants/theme';
import { Unit } from '@/types';

interface SkillNodeProps {
  unit: Unit;
  status: 'locked' | 'active' | 'complete' | 'mastered';
  onPress: () => void;
  lessonCount: number;
  completedCount: number;
}

export default function SkillNode({ unit, status, onPress, lessonCount, completedCount }: SkillNodeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [status]);

  useEffect(() => {
    Animated.spring(bounceAnim, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const isLocked = status === 'locked';
  const borderColor = isLocked ? Colors.bgBorder : unit.color;
  const bgColor = isLocked ? Colors.bgCard : unit.color + '22';

  return (
    <Animated.View style={{ transform: [{ scale: status === 'active' ? pulseAnim : bounceAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.8}
        style={[
          styles.container,
          {
            backgroundColor: bgColor,
            borderColor,
            opacity: isLocked ? 0.55 : 1,
          },
          status !== 'locked' && Shadow.card,
        ]}
      >
        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: isLocked ? Colors.bgBorder : unit.color + '33', borderColor }]}>
          <Text style={styles.icon}>{isLocked ? '🔒' : unit.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.title, isLocked && { color: Colors.textMuted }]}>
            {unit.title}
          </Text>
          <Text style={styles.desc} numberOfLines={1}>{unit.description}</Text>
          {!isLocked && (
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[
                  styles.progressFill,
                  { width: `${(completedCount / lessonCount) * 100}%`, backgroundColor: unit.color },
                ]} />
              </View>
              <Text style={[styles.progressText, { color: unit.color }]}>
                {completedCount}/{lessonCount}
              </Text>
            </View>
          )}
        </View>

        {/* Status badge */}
        {status === 'complete' && <Text style={styles.badge}>✓</Text>}
        {status === 'mastered' && <Text style={styles.badge}>⭐</Text>}
        {status === 'active' && (
          <View style={[styles.activeBadge, { backgroundColor: unit.color }]}>
            <Text style={styles.activeBadgeText}>GO</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Radius['2xl'],
    borderWidth: 2,
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  desc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.bgBorder,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: Radius.full },
  progressText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.bold },
  badge: { fontSize: 24, marginLeft: 4 },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    marginLeft: 4,
  },
  activeBadgeText: {
    color: '#fff',
    fontWeight: Typography.weights.black,
    fontSize: Typography.sizes.sm,
    letterSpacing: 1,
  },
});
