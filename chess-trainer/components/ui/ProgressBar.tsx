import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Radius } from '@/constants/theme';

interface ProgressBarProps {
  current: number;
  total: number;
  color?: string;
  height?: number;
}

export default function ProgressBar({ current, total, color = Colors.primary, height = 12 }: ProgressBarProps) {
  const ratio = Math.min(current / total, 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: ratio,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const widthInterp = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View
        style={[styles.fill, { width: widthInterp, backgroundColor: color, borderRadius: height / 2 }]}
      >
        <View style={styles.shine} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.xpBg,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 2,
    left: 6,
    right: 6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: Radius.full,
  },
});
