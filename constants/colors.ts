const Colors = {
  primary: '#0891B2',
  primaryDark: '#0E7490',
  primaryLight: '#06B6D4',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#475569',
  textLight: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

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

  disabled: '#CBD5E1',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export default Colors;

// ── Shared design tokens (spacing / radius / shadow / typography) ─────────
// Used by components/ui/* so every screen shares one visual language instead
// of re-declaring paddings, radii and shadows inline.
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
