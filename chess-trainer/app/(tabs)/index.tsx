import React, { useRef, useEffect, useMemo, memo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Animated, useWindowDimensions, StatusBar, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import {
  CURRICULUM, getLevelFromXP, getXPProgressInLevel, XP_PER_LEVEL,
} from '@/constants/curriculum';
import { useGameStore } from '@/store/gameStore';
import { playNodePress, playTap } from '@/lib/sounds';
import GameNode, { NodeStatus } from '@/components/ui/GameNode';

// ─── Map layout ──────────────────────────────────────────────────────────────

const NODE_SPACING  = 190;   // vertical gap between node centers
const TOP_PAD       = 100;   // space above first node center
const BOTTOM_PAD    = 130;   // space below last node center
const INNER_R       = 41;    // radius of the main circle (used for path endpoints)
const CONTAINER_W   = 120;   // GameNode container width
const CONTAINER_H   = 128;   // GameNode container height
const MAX_MAP_W     = 520;

type XPos = 'left' | 'center' | 'right';
const ZIGZAG: XPos[] = ['center', 'right', 'left', 'center', 'right', 'left'];

const BG_PIECES = ['♙', '♘', '♗', '♖', '♕', '♔', '♟', '♞', '♝', '♜', '♛', '♚'];

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function MapScreen() {
  const { width: screenW } = useWindowDimensions();
  const mapW    = Math.min(screenW, MAX_MAP_W);
  const scrollRef = useRef<ScrollView>(null);

  const { progress } = useGameStore();
  const xp              = progress?.xp              ?? 0;
  const level           = getLevelFromXP(xp);
  const xpInLevel       = getXPProgressInLevel(xp);
  const streak          = progress?.streak          ?? 0;
  const hearts          = progress?.hearts          ?? 5;
  const completedLessons= progress?.completedLessons ?? [];
  const unlockedUnits   = progress?.unlockedUnits   ?? ['basics'];

  // Node x centers
  const xForPos = useMemo<Record<XPos, number>>(() => ({
    left:   mapW * 0.19,
    center: mapW * 0.50,
    right:  mapW * 0.81,
  }), [mapW]);

  // Node circle centers in the SVG space
  const centers = useMemo(() =>
    CURRICULUM.map((_, i) => ({
      x: xForPos[ZIGZAG[i]],
      y: TOP_PAD + i * NODE_SPACING,
    })),
    [xForPos],
  );

  const mapH = TOP_PAD + (CURRICULUM.length - 1) * NODE_SPACING + BOTTOM_PAD;

  // Path segment SVG strings (cubic bezier S-curves)
  const segments = useMemo(() =>
    centers.slice(0, -1).map((from, i) => {
      const to  = centers[i + 1];
      const mid = (from.y + to.y) / 2;
      return `M ${from.x} ${from.y} C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${to.y}`;
    }),
    [centers],
  );

  function getStatus(unit: typeof CURRICULUM[0]): NodeStatus {
    if (!unlockedUnits.includes(unit.id)) return 'locked';
    const done = unit.lessons.filter((l) => completedLessons.includes(l.id)).length;
    if (done === unit.lessons.length) return 'mastered';
    return 'active';
  }

  const activeIdx = CURRICULUM.findIndex((u) => {
    const s = getStatus(u);
    return s === 'active';
  });

  // Auto-scroll to active node after entrance animations settle
  useEffect(() => {
    if (activeIdx > 0) {
      setTimeout(() => {
        const targetY = centers[activeIdx]?.y - 250;
        scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
      }, 900);
    }
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Center column on wide screens */}
      <View style={[styles.column, { maxWidth: MAX_MAP_W }]}>
        <SafeAreaView style={styles.fill} edges={['top']}>

          {/* ── HUD ── */}
          <MapHUD level={level} xp={xp} xpInLevel={xpInLevel} streak={streak} hearts={hearts} />

          {/* ── Scrollable world map ── */}
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ height: mapH, position: 'relative' }}
            style={styles.fill}
          >
            {/* Sky gradient background */}
            <LinearGradient
              colors={['#080c18', '#0c1230', '#111840', '#0d1535']}
              locations={[0, 0.3, 0.7, 1]}
              style={StyleSheet.absoluteFill}
            />

            {/* Starfield */}
            <StarField mapW={mapW} mapH={mapH} />

            {/* Floating chess pieces */}
            <FloatingPieces mapW={mapW} mapH={mapH} />

            {/* ── SVG path ── */}
            <Svg
              style={StyleSheet.absoluteFill}
              width={mapW}
              height={mapH}
            >
              <Defs>
                {CURRICULUM.slice(0, -1).map((unit, i) => (
                  <SvgGradient
                    key={`grad-${i}`}
                    id={`grad-${i}`}
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <Stop offset="0" stopColor={unit.color} stopOpacity="0.9" />
                    <Stop offset="1" stopColor={CURRICULUM[i + 1].color} stopOpacity="0.9" />
                  </SvgGradient>
                ))}
              </Defs>

              {/* Road (wide gray underlay) */}
              {segments.map((d, i) => (
                <Path
                  key={`road-${i}`}
                  d={d}
                  stroke="#1e2555"
                  strokeWidth={26}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}

              {/* Road edge highlight */}
              {segments.map((d, i) => (
                <Path
                  key={`edge-${i}`}
                  d={d}
                  stroke="#2a3270"
                  strokeWidth={20}
                  strokeLinecap="round"
                  fill="none"
                />
              ))}

              {/* Dashed center line (unlit segments) */}
              {segments.map((d, i) => {
                const st = getStatus(CURRICULUM[i]);
                const isLit = st === 'complete' || st === 'mastered';
                if (isLit) return null;
                return (
                  <Path
                    key={`dash-${i}`}
                    d={d}
                    stroke="#3d4880"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray="10 18"
                    fill="none"
                  />
                );
              })}

              {/* Lit segments (completed units) */}
              {segments.map((d, i) => {
                const st = getStatus(CURRICULUM[i]);
                const isLit = st === 'complete' || st === 'mastered';
                if (!isLit) return null;
                return (
                  <React.Fragment key={`lit-${i}`}>
                    {/* Outer glow */}
                    <Path
                      d={d}
                      stroke={`url(#grad-${i})`}
                      strokeWidth={22}
                      strokeLinecap="round"
                      fill="none"
                      opacity={0.3}
                    />
                    {/* Inner bright line */}
                    <Path
                      d={d}
                      stroke={`url(#grad-${i})`}
                      strokeWidth={10}
                      strokeLinecap="round"
                      fill="none"
                      opacity={0.95}
                    />
                  </React.Fragment>
                );
              })}
            </Svg>

            {/* ── Nodes ── */}
            {CURRICULUM.map((unit, i) => {
              const c      = centers[i];
              const status = getStatus(unit);
              return (
                <GameNode
                  key={unit.id}
                  unit={unit}
                  status={status}
                  index={i}
                  style={{
                    position: 'absolute',
                    left: c.x - CONTAINER_W / 2,
                    top:  c.y - INNER_R,
                  }}
                  onPress={() => {
                    if (status !== 'locked') {
                      playNodePress();
                      router.push(`/lesson/${unit.id}`);
                    }
                  }}
                />
              );
            })}

            {/* Unit labels beside nodes */}
            {CURRICULUM.map((unit, i) => {
              const c      = centers[i];
              const status = getStatus(unit);
              // 'right' nodes sit near the right edge — put label to their left
              const toLeft = ZIGZAG[i] === 'right';
              const LABEL_W = 88;
              const GAP = 10;
              const labelLeft = toLeft
                ? c.x - INNER_R - GAP - LABEL_W
                : c.x + INNER_R + GAP;

              return (
                <View
                  key={`label-${unit.id}`}
                  pointerEvents="none"
                  style={[
                    styles.unitLabel,
                    { left: labelLeft, top: c.y - 18, width: LABEL_W },
                  ]}
                >
                  <Text
                    style={[
                      styles.unitLabelText,
                      { color: status === 'locked' ? '#404870' : unit.color },
                    ]}
                    numberOfLines={2}
                  >
                    {unit.title}
                  </Text>
                  <Text style={styles.unitLevelText}>Level {unit.level}</Text>
                </View>
              );
            })}

          </ScrollView>

          {/* ── Quick Practice pill (fixed bottom) ── */}
          <TouchableOpacity
            style={styles.quickPill}
            activeOpacity={0.85}
            onPress={() => { playTap(); router.push('/(tabs)/practice'); }}
          >
            <LinearGradient
              colors={[Colors.secondary, '#0a7ab5']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.quickPillGradient}
            >
              <Text style={styles.quickPillIcon}>⚡</Text>
              <View>
                <Text style={styles.quickPillTitle}>Quick Puzzle</Text>
                <Text style={styles.quickPillSub}>Random tactic from Lichess</Text>
              </View>
              <Text style={styles.quickPillArrow}>›</Text>
            </LinearGradient>
          </TouchableOpacity>

        </SafeAreaView>
      </View>
    </View>
  );
}

// ─── HUD ─────────────────────────────────────────────────────────────────────

function MapHUD({
  level, xp, xpInLevel, streak, hearts,
}: {
  level: number; xp: number; xpInLevel: number; streak: number; hearts: number;
}) {
  const xpAnim = useRef(new Animated.Value(0)).current;
  const ratio  = xpInLevel / XP_PER_LEVEL;

  useEffect(() => {
    Animated.timing(xpAnim, { toValue: ratio, duration: 700, useNativeDriver: false }).start();
  }, [ratio]);

  const barWidth = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <LinearGradient
      colors={['#080c18dd', '#080c1800']}
      style={styles.hud}
    >
      <View style={styles.hudRow}>
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>♟️</Text>
          <View>
            <Text style={styles.brandName}>ChessMaster</Text>
            <View style={styles.xpRow}>
              <View style={styles.xpTrack}>
                <Animated.View style={[styles.xpFill, { width: barWidth }]}>
                  <View style={styles.xpShine} />
                </Animated.View>
              </View>
              <Text style={styles.xpLabel}>{xpInLevel}<Text style={styles.xpMax}>/{XP_PER_LEVEL}</Text></Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          {/* Level badge */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LVL</Text>
            <Text style={styles.levelNum}>{level}</Text>
          </View>

          {/* Streak */}
          <View style={styles.statPill}>
            <Text style={styles.statPillIcon}>🔥</Text>
            <Text style={styles.statPillText}>{streak}</Text>
          </View>

          {/* Hearts */}
          <View style={styles.statPill}>
            <Text style={styles.statPillIcon}>❤️</Text>
            <Text style={styles.statPillText}>{hearts}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// ─── Starfield ────────────────────────────────────────────────────────────────

const StarField = memo(function StarField({ mapW, mapH }: { mapW: number; mapH: number }) {
  const stars = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * mapW,
      y: Math.random() * mapH,
      size: 1 + Math.random() * 2.5,
      delay: Math.random() * 4000,
      duration: 2000 + Math.random() * 3000,
    })),
    [],
  );

  return (
    <>
      {stars.map((s) => <Star key={s.id} {...s} />)}
    </>
  );
});

const Star = memo(function Star({
  x, y, size, delay, duration,
}: {
  x: number; y: number; size: number; delay: number; duration: number;
}) {
  const anim = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.2, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        opacity: anim,
      }}
    />
  );
});

// ─── Floating chess pieces ────────────────────────────────────────────────────

const FloatingPieces = memo(function FloatingPieces({
  mapW, mapH,
}: { mapW: number; mapH: number }) {
  const pieces = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      symbol: BG_PIECES[i % BG_PIECES.length],
      x: 10 + Math.random() * (mapW - 50),
      y: Math.random() * mapH,
      size: 14 + Math.floor(Math.random() * 22),
      baseOpacity: 0.04 + Math.random() * 0.07,
      duration: 9000 + Math.random() * 14000,
      delay: Math.random() * 6000,
      drift: 20 + Math.random() * 20,
    })),
    [],
  );

  return (
    <>
      {pieces.map((p) => <FloatPiece key={p.id} {...p} />)}
    </>
  );
});

const FloatPiece = memo(function FloatPiece({
  symbol, x, y, size, baseOpacity, duration, delay, drift,
}: {
  symbol: string; x: number; y: number; size: number; baseOpacity: number;
  duration: number; delay: number; drift: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
        ]),
      ).start();
    }, delay);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -drift] });
  const opacity    = anim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [baseOpacity, baseOpacity * 2.2, baseOpacity * 2.2, baseOpacity],
  });

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: y,
        fontSize: size,
        color: '#ffffff',
        opacity,
        transform: [{ translateY }],
        pointerEvents: 'none',
      } as any}
    >
      {symbol}
    </Animated.Text>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080c18',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
  },
  fill: { flex: 1 },

  // HUD
  hud: {
    paddingBottom: 12,
    paddingHorizontal: Spacing['2xl'],
    zIndex: 10,
  },
  hudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandIcon: { fontSize: 26 },
  brandName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.black,
    color: '#fff',
    letterSpacing: 0.3,
  },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  xpTrack: {
    width: 90,
    height: 8,
    backgroundColor: '#1e2555',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpShine: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  xpMax: { color: Colors.textMuted, fontWeight: Typography.weights.normal },

  stats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelBadge: {
    backgroundColor: Colors.primary + '28',
    borderWidth: 1.5,
    borderColor: Colors.primary + '66',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
  },
  levelLabel: { fontSize: 8, color: Colors.primary, fontWeight: Typography.weights.bold, letterSpacing: 1 },
  levelNum: { fontSize: 16, color: Colors.primary, fontWeight: Typography.weights.black, lineHeight: 20 },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#1e2555',
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#2a3270',
  },
  statPillIcon: { fontSize: 14 },
  statPillText: { fontSize: 13, fontWeight: Typography.weights.bold, color: '#fff' },

  // Unit labels
  unitLabel: {
    position: 'absolute',
    pointerEvents: 'none',
  } as any,
  unitLabelText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    lineHeight: 14,
  },
  unitLevelText: {
    fontSize: 9,
    color: '#404870',
    fontWeight: Typography.weights.semibold,
    marginTop: 1,
  },

  // Quick Practice pill
  quickPill: {
    marginHorizontal: Spacing.xl,
    marginBottom: Platform.OS === 'web' ? 16 : 8,
    borderRadius: Radius.full,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  quickPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 12,
  },
  quickPillIcon: { fontSize: 22 },
  quickPillTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#fff',
  },
  quickPillSub: { fontSize: Typography.sizes.xs, color: 'rgba(255,255,255,0.7)' },
  quickPillArrow: { marginLeft: 'auto', fontSize: 26, color: '#fff', lineHeight: 28 },
});
