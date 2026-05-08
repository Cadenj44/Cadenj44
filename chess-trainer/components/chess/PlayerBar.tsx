import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Radius } from '@/constants/theme';

interface PlayerBarProps {
  name: string;
  rating?: string;
  isAI?: boolean;
  color: 'w' | 'b';
  timeSeconds: number;
  isActive: boolean;
  capturedPieces: string[];
  materialAdvantage: number;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return `${pad(m)}:${pad(s % 60)}`;
}

const PIECE_GLYPHS: Record<string, string> = {
  p: '♟', n: '♞', b: '♝', r: '♜', q: '♛',
  P: '♙', N: '♘', B: '♗', R: '♖', Q: '♕',
};

export default function PlayerBar({
  name, rating, isAI, color, timeSeconds, isActive, capturedPieces, materialAdvantage,
}: PlayerBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) { pulseAnim.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive]);

  const isLow = timeSeconds < 30 && timeSeconds > 0;

  return (
    <View style={[styles.container, isActive && styles.containerActive]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: color === 'w' ? '#e8d9c0' : '#3d3028' }]}>
        <Text style={styles.avatarText}>{isAI ? '🤖' : color === 'w' ? '♔' : '♚'}</Text>
      </View>

      {/* Name + captured */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{name}</Text>
          {rating && <Text style={styles.rating}>{rating}</Text>}
          {isAI && <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>}
        </View>
        <View style={styles.captured}>
          {capturedPieces.slice(0, 12).map((p, i) => (
            <Text key={i} style={styles.capturedPiece}>
              {PIECE_GLYPHS[p] ?? p}
            </Text>
          ))}
          {materialAdvantage > 0 && (
            <Text style={styles.matAdv}>+{materialAdvantage}</Text>
          )}
        </View>
      </View>

      {/* Clock */}
      <Animated.View
        style={[
          styles.clock,
          isActive && styles.clockActive,
          isLow && styles.clockLow,
          isActive && { opacity: isLow ? pulseAnim : 1 },
        ]}
      >
        <Text style={[
          styles.clockText,
          isActive && styles.clockTextActive,
          isLow && styles.clockTextLow,
        ]}>
          {formatTime(timeSeconds)}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
    backgroundColor: '#111828',
    borderWidth: 1,
    borderColor: '#1e2555',
  },
  containerActive: {
    backgroundColor: '#161f3a',
    borderColor: '#2a3a70',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2a3060',
  },
  avatarText: { fontSize: 20, lineHeight: 22 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  rating: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
  aiBadge: {
    backgroundColor: Colors.secondary + '33',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.secondary + '66',
  },
  aiBadgeText: { fontSize: 9, color: Colors.secondary, fontWeight: Typography.weights.bold },
  captured: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 1 },
  capturedPiece: { fontSize: 11, color: Colors.textMuted },
  matAdv: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginLeft: 2,
  },
  clock: {
    backgroundColor: '#1e2555',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    minWidth: 66,
    alignItems: 'center',
  },
  clockActive: { backgroundColor: '#f0f0f0' },
  clockLow: { backgroundColor: Colors.error },
  clockText: {
    fontSize: 17,
    fontWeight: Typography.weights.black,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  clockTextActive: { color: '#111' },
  clockTextLow: { color: '#fff' },
});
