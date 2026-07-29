export const colors = {
  brandRed: '#E51E25',
  white: '#FFFFFF',
  background: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  inputBackground: '#FFFFFF',
  error: '#DC2626',
  waveLight: '#FDE8EA',
  waveMid: '#FAD4D7',
  waveDark: '#F5BFC4',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
  },
  link: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.brandRed,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
  },
};

export const radii = {
  input: 12,
  button: 12,
};
