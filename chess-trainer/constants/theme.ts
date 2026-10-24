export const Colors = {
  // Brand
  primary: '#2a6040',       // forest green
  primaryDark: '#1e4a30',
  primaryLight: '#4a8060',
  secondary: '#8a4a20',     // warm amber-brown
  secondaryDark: '#6a3a10',
  accent: '#c04040',        // crimson
  gold: '#8a6020',          // antique gold
  purple: '#604080',        // muted plum

  // Backgrounds
  bg: '#f5f0e8',            // warm cream parchment
  bgCard: '#ede8de',        // slightly darker cream
  bgCardHover: '#e3ddd0',
  bgBorder: '#c8bfa8',      // warm tan border

  // Text
  textPrimary: '#1a1208',   // warm near-black
  textSecondary: '#3d3020', // dark warm brown
  textMuted: '#8a7a60',     // warm tan

  // Status
  success: '#2a6040',
  error: '#c04040',
  warning: '#8a6020',
  info: '#2a5060',

  // Chess board
  boardLight: '#F0D9B5',
  boardDark: '#B58863',
  boardHighlight: 'rgba(42, 96, 64, 0.4)',
  boardLastMove: 'rgba(192, 64, 64, 0.3)',
  boardSelected: 'rgba(42, 96, 64, 0.6)',
  boardDanger: 'rgba(192, 64, 64, 0.5)',
  boardHint: 'rgba(42, 80, 96, 0.5)',

  // XP/Progress
  xpFill: '#2a6040',
  xpBg: '#d4c9b0',
  streakFire: '#c04040',
  heartFill: '#c04040',
};

export const Typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
    '4xl': 48,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  card: {
    shadowColor: '#8a7a60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#2a6040',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
};
