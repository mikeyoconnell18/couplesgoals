export const colors = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  elevated: '#EEF3F4',
  ink: '#172126',
  textSecondary: '#68747D',
  border: '#E1E7EA',
  primary: '#0F766E',
  primaryPressed: '#0B5F59',
  primarySoft: '#DDF3EF',
  raspberry: '#D83B67',
  raspberryPressed: '#B92E55',
  raspberrySoft: '#FBE5EC',
  coral: '#F27662',
  warning: '#D97706',
  success: '#17836E',
  error: '#C63F45',
} as const;
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;
export const radius = { sm: 8, md: 12, lg: 16, round: 999 } as const;
export const type = {
  dashboard: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const },
  screen: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  section: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  card: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  support: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const },
} as const;
