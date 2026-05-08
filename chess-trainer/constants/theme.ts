export const Colors = {
  // Brand
  primary: '#58CC02',       // Duolingo green
  primaryDark: '#46A302',
  primaryLight: '#89E219',
  secondary: '#1CB0F6',     // bright blue
  secondaryDark: '#0E92C8',
  accent: '#FF9600',        // orange
  gold: '#FFD700',
  purple: '#CE82FF',

  // Backgrounds
  bg: '#131523',            // dark navy
  bgCard: '#1E2235',
  bgCardHover: '#252840',
  bgBorder: '#2D3356',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AFAFAF',
  textMuted: '#6B7280',

  // Status
  success: '#58CC02',
  error: '#FF4B4B',
  warning: '#FF9600',
  info: '#1CB0F6',

  // Chess board
  boardLight: '#F0D9B5',
  boardDark: '#B58863',
  boardHighlight: 'rgba(88, 204, 2, 0.5)',
  boardLastMove: 'rgba(255, 150, 0, 0.4)',
  boardSelected: 'rgba(88, 204, 2, 0.7)',
  boardDanger: 'rgba(255, 75, 75, 0.5)',
  boardHint: 'rgba(28, 176, 246, 0.5)',

  // XP/Progress
  xpFill: '#58CC02',
  xpBg: '#2D3356',
  streakFire: '#FF9600',
  heartFill: '#FF4B4B',
};

export const Typography = {
  // Font families (Expo uses system fonts or loaded fonts)
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: '#58CC02',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
};
