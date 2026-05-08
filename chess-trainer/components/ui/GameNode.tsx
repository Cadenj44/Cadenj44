import React, { useEffect, useRef, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Unit } from '@/types';
import { Typography } from '@/constants/theme';

// ─── Color helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function adjustHex(hex: string, delta: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  return `#${[r, g, b].map(c => clamp(c + delta).toString(16).padStart(2, '0')).join('')}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type NodeStatus = 'locked' | 'active' | 'complete' | 'mastered';

interface GameNodeProps {
  unit: Unit;
  status: NodeStatus;
  /** ordinal index for staggered entrance */
  index: number;
  style?: ViewStyle;
  onPress: () => void;
  label?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CIRCLE_SIZE = 82;
const CONTAINER_W = 120;
const CONTAINER_H = 128;

// ─── Component ───────────────────────────────────────────────────────────────

export default memo(function GameNode({
  unit, status, index, style, onPress, label,
}: GameNodeProps) {
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const isLocked   = status === 'locked';
  const isActive   = status === 'active';
  const isMastered = status === 'mastered';
  const isComplete = status === 'complete';

  const baseColor  = isLocked ? '#4a4e7a' : unit.color;
  const lightColor = isLocked ? '#6a6ea0' : adjustHex(unit.color, 55);
  const darkColor  = isLocked ? '#1e2050' : adjustHex(unit.color, -60);
  const shadowColor = isLocked ? '#0f1030' : adjustHex(unit.color, -90);

  const starCount = isMastered ? 3 : isComplete ? 2 : isActive ? 1 : 0;

  // ── Animations ──
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 75,
      friction: 6,
      delay: index * 90,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.00, duration: 750, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -6, duration: 600, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [isActive]);

  const icon = isLocked ? '🔒' : isMastered ? '👑' : unit.icon;

  return (
    <Animated.View
      style={[
        style,
        {
          width: CONTAINER_W,
          height: CONTAINER_H,
          alignItems: 'center',
          transform: [{ scale: scaleAnim }, { translateY: isActive ? bounceAnim : 0 }],
          overflow: 'visible',
        },
      ]}
    >
      {/* ── Outer glow ring (active only) ── */}
      {isActive && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              borderColor: unit.color,
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* ── Mastered sparkles ── */}
      {isMastered && (
        <>
          <Text style={[styles.sparkle, { top: 2, left: 14, fontSize: 14 }]}>✨</Text>
          <Text style={[styles.sparkle, { top: 2, right: 14, fontSize: 12 }]}>⭐</Text>
        </>
      )}

      {/* ── Shadow / depth layer ── */}
      <View
        style={[
          styles.shadowLayer,
          {
            backgroundColor: shadowColor,
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            borderRadius: CIRCLE_SIZE / 2,
            top: CIRCLE_SIZE * 0.08 + 6,
          },
        ]}
      />

      {/* ── Rim ── */}
      <View
        style={[
          styles.rim,
          {
            width: CIRCLE_SIZE + 6,
            height: CIRCLE_SIZE + 6,
            borderRadius: (CIRCLE_SIZE + 6) / 2,
            backgroundColor: darkColor,
            top: CIRCLE_SIZE * 0.08 - 3,
          },
        ]}
      />

      {/* ── Main circle ── */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={isLocked ? 1 : 0.82}
        style={[styles.circleTouch, { top: CIRCLE_SIZE * 0.08 }]}
      >
        <LinearGradient
          colors={[lightColor, baseColor, darkColor]}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.75, y: 1 }}
          style={[
            styles.circle,
            {
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              borderRadius: CIRCLE_SIZE / 2,
              opacity: isLocked ? 0.7 : 1,
            },
          ]}
        >
          {/* Inner bevel rim */}
          <View style={styles.innerRim} />

          {/* Shine highlight */}
          <View style={styles.shine} />

          {/* Icon */}
          <Text style={styles.icon}>{icon}</Text>

          {/* Complete checkmark */}
          {(isComplete || isMastered) && !isLocked && (
            <View style={[styles.checkBadge, { backgroundColor: '#fff' }]}>
              <Text style={[styles.checkText, { color: baseColor }]}>
                {isMastered ? '★' : '✓'}
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Active "PLAY" badge ── */}
      {isActive && (
        <View style={[styles.playBadge, { backgroundColor: unit.color }]}>
          <Text style={styles.playText}>▶  PLAY</Text>
        </View>
      )}

      {/* ── Stars ── */}
      <View style={styles.stars}>
        {[1, 2, 3].map((s) => (
          <Text
            key={s}
            style={[styles.star, { color: s <= starCount ? '#FFD700' : '#2a3060' }]}
          >
            ★
          </Text>
        ))}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    width: CIRCLE_SIZE + 28,
    height: CIRCLE_SIZE + 28,
    borderRadius: (CIRCLE_SIZE + 28) / 2,
    borderWidth: 3,
    top: CIRCLE_SIZE * 0.08 - 14 - 3,
    alignSelf: 'center',
  },
  sparkle: {
    position: 'absolute',
    zIndex: 10,
  },
  shadowLayer: {
    position: 'absolute',
    alignSelf: 'center',
  },
  rim: {
    position: 'absolute',
    alignSelf: 'center',
  },
  circleTouch: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerRim: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  shine: {
    position: 'absolute',
    top: 8,
    left: 12,
    width: CIRCLE_SIZE * 0.38,
    height: CIRCLE_SIZE * 0.22,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    transform: [{ rotate: '-20deg' }],
  },
  icon: {
    fontSize: 30,
    lineHeight: 36,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 11,
    fontWeight: '900',
  },
  playBadge: {
    position: 'absolute',
    bottom: 22,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    zIndex: 5,
  },
  playText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: Typography.weights.black,
    letterSpacing: 1,
  },
  stars: {
    position: 'absolute',
    bottom: 4,
    flexDirection: 'row',
    gap: 3,
    alignSelf: 'center',
  },
  star: {
    fontSize: 15,
    lineHeight: 18,
  },
});
