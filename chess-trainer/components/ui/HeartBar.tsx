import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

interface HeartBarProps {
  hearts: number;
  maxHearts: number;
  size?: number;
}

export default function HeartBar({ hearts, maxHearts, size = 26 }: HeartBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxHearts }).map((_, i) => (
        <Text
          key={i}
          style={[
            styles.heart,
            { fontSize: size },
            i >= hearts && styles.empty,
          ]}
        >
          ❤️
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  heart: { lineHeight: 30 },
  empty: { opacity: 0.2 },
});
