const Colors = {
  primary: '#8A19D6',
  primaryDark: '#7A12C4',
  primaryLight: '#A855F7',

  background: '#F8F9FF',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F3FB',

  text: '#03314B',
  textSecondary: '#4A6275',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  border: '#E3E8F4',
  borderLight: '#F1F3FB',

  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Accent palette (v2)
  violet: '#8A19D6',
  violetLight: '#F3E8FD',
  pink: '#CB0C9F',
  pinkLight: '#FBE4F5',
  amber: '#F59E0B',
  emerald: '#10B981',
  indigo: '#4F46E5',
  indigoLight: '#E0E7FF',
  magenta: '#CB0C9F',
  lime: '#82D616',
  navy: '#03314B',
  teal: '#0D9488',
  tealLight: '#CCFBF1',

  disabled: '#CBD5E1',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export default Colors;

// ── Shared design tokens (spacing / radius / shadow / typography) ─────────
// Used by components/ui/* so every screen shares one visual language instead
// of re-declaring paddings, radii and shadows inline.
// ── Gradients (v2): [start, end] pairs for expo-linear-gradient ──────────
export const Gradients = {
  hero: ['#7A12C4', '#8A19D6', '#B23FE0'],
  primary: ['#A04BE8', '#8A19D6'],
  success: ['#34D399', '#0D9488'],
  warning: ['#FBBF24', '#F97316'],
  danger: ['#F87171', '#DC2626'],
  info: ['#60A5FA', '#4F46E5'],
  violet: ['#B76AF0', '#8A19D6'],
  pink: ['#E552C4', '#CB0C9F'],
  slate: ['#94A3B8', '#475569'],
} as const;

export type GradientName = keyof typeof Gradients;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const FontSize = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 26,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};
