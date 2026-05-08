import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '@/constants/theme';

interface MoveHistoryProps {
  moves: string[]; // SAN notation
  compact?: boolean;
}

export default function MoveHistory({ moves, compact = false }: MoveHistoryProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, [moves.length]);

  // Pair moves into [white, black?] rows
  const pairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({ num: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  if (moves.length === 0) {
    return (
      <View style={[styles.container, compact && styles.containerCompact]}>
        <Text style={styles.empty}>Game moves will appear here…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={[styles.container, compact && styles.containerCompact]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      horizontal={compact}
    >
      {compact ? (
        // Horizontal compact mode — show inline pairs
        <View style={styles.compactRow}>
          {pairs.map((p) => (
            <View key={p.num} style={styles.compactPair}>
              <Text style={styles.compactNum}>{p.num}.</Text>
              <Text style={[styles.compactMove, styles.whiteMoveText]}>{p.white}</Text>
              {p.black && <Text style={[styles.compactMove, styles.blackMoveText]}>{p.black}</Text>}
            </View>
          ))}
        </View>
      ) : (
        // Vertical full mode
        pairs.map((p) => {
          const isLast = p.num === pairs.length;
          return (
            <View key={p.num} style={[styles.row, isLast && styles.rowLast]}>
              <Text style={styles.moveNum}>{p.num}.</Text>
              <View style={[styles.moveCell, isLast && !p.black && styles.moveCellActive]}>
                <Text style={[styles.moveText, styles.whiteMoveText]}>{p.white}</Text>
              </View>
              <View style={[styles.moveCell, isLast && p.black && styles.moveCellActive]}>
                {p.black && <Text style={[styles.moveText, styles.blackMoveText]}>{p.black}</Text>}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d1120',
    borderTopWidth: 1,
    borderTopColor: '#1e2555',
    maxHeight: 130,
  },
  containerCompact: { maxHeight: 48 },
  content: { padding: 6 },
  empty: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    padding: 12,
  },
  // Full rows
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2040',
    gap: 4,
  },
  rowLast: { borderBottomWidth: 0 },
  moveNum: {
    width: 28,
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    textAlign: 'right',
    fontWeight: Typography.weights.semibold,
  },
  moveCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  moveCellActive: { backgroundColor: '#2a3a70' },
  moveText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  whiteMoveText: { color: '#f0f0f0' },
  blackMoveText: { color: '#b0b8d0' },
  // Compact
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 8 },
  compactPair: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  compactNum: { fontSize: Typography.sizes.xs, color: Colors.textMuted },
  compactMove: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
});
