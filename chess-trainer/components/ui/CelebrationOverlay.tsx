import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, Modal,
} from 'react-native';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';
import Button from './Button';

const { width: W, height: H } = Dimensions.get('window');

interface CelebrationOverlayProps {
  visible: boolean;
  type: 'correct' | 'complete' | 'levelUp' | 'streak';
  xpEarned?: number;
  message?: string;
  onContinue: () => void;
}

const CONFIGS = {
  correct:  { emoji: '✅', title: 'Correct!',      color: Colors.primary,   bg: '#0D2B00' },
  complete: { emoji: '🏆', title: 'Puzzle Solved!', color: Colors.gold,      bg: '#2B2200' },
  levelUp:  { emoji: '🚀', title: 'Level Up!',      color: Colors.secondary, bg: '#002040' },
  streak:   { emoji: '🔥', title: 'Streak!',        color: Colors.accent,    bg: '#2B1600' },
};

export default function CelebrationOverlay({
  visible,
  type,
  xpEarned,
  message,
  onContinue,
}: CelebrationOverlayProps) {
  const slideAnim = useRef(new Animated.Value(H)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true, delay: 150 }),
        Animated.spring(emojiAnim, { toValue: 1, tension: 100, friction: 6, useNativeDriver: true, delay: 250 }),
      ]).start();
    } else {
      slideAnim.setValue(H);
      scaleAnim.setValue(0);
      emojiAnim.setValue(0);
    }
  }, [visible]);

  const cfg = CONFIGS[type];

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.panel,
            { backgroundColor: cfg.bg, borderColor: cfg.color + '55', transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Emoji */}
          <Animated.Text
            style={[styles.emoji, { transform: [{ scale: emojiAnim }] }]}
          >
            {cfg.emoji}
          </Animated.Text>

          {/* Title */}
          <Animated.Text
            style={[styles.title, { color: cfg.color, transform: [{ scale: scaleAnim }] }]}
          >
            {cfg.title}
          </Animated.Text>

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* XP earned */}
          {xpEarned !== undefined && xpEarned > 0 && (
            <View style={[styles.xpBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
              <Text style={[styles.xpText, { color: cfg.color }]}>+{xpEarned} XP</Text>
            </View>
          )}

          {/* Confetti dots */}
          <View style={styles.confettiRow}>
            {['🟢','🔵','🟡','🟠','🔴','🟣'].map((dot, i) => (
              <Text key={i} style={styles.dot}>{dot}</Text>
            ))}
          </View>

          <Button label="CONTINUE" onPress={onContinue} size="lg" />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    borderWidth: 1.5,
    padding: Spacing['3xl'],
    paddingBottom: Spacing['5xl'],
    alignItems: 'center',
    gap: Spacing.lg,
  },
  emoji: { fontSize: 72, lineHeight: 80 },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  xpBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  xpText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
  },
  confettiRow: { flexDirection: 'row', gap: 8, marginVertical: 4 },
  dot: { fontSize: 18 },
});
