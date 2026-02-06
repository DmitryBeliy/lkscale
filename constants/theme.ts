// MaGGaz12 Enterprise Theme - Premium Business App Design
// Supports both Light and Dark modes

export type ThemeMode = 'light' | 'dark' | 'system';

// Light theme colors
export const lightColors = {
  // Primary
  primary: '#2c7be5',
  primaryDark: '#1a68d1',
  primaryLight: '#5a9bef',

  // Backgrounds
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  cardElevated: '#ffffff',

  // Text
  text: '#1e2a3b',
  textSecondary: '#6b7c93',
  textLight: '#9aa5b1',
  textInverse: '#ffffff',

  // Status colors
  success: '#00d97e',
  successLight: '#ccf7e5',
  successDark: '#00b368',
  warning: '#f6c343',
  warningLight: '#fef3cd',
  warningDark: '#d4a12a',
  error: '#e63757',
  errorLight: '#f8d7da',
  errorDark: '#c52a46',
  info: '#39afd1',
  infoLight: '#d4edfc',

  // Order status
  statusCompleted: '#00d97e',
  statusPending: '#f6c343',
  statusCancelled: '#e63757',
  statusProcessing: '#2c7be5',

  // Borders
  border: '#e3ebf6',
  borderLight: '#f0f4f8',
  borderDark: '#d2dce8',

  // Skeleton
  skeleton: '#e3ebf6',
  skeletonHighlight: '#f0f4f8',

  // Charts
  chart1: '#2c7be5',
  chart2: '#00d97e',
  chart3: '#f6c343',
  chart4: '#e63757',
  chart5: '#6f42c1',
  chart6: '#39afd1',
  chartGrid: '#e3ebf6',
  chartText: '#6b7c93',

  // Premium/Gold
  gold: '#ffd700',
  goldLight: '#fff4cc',
  goldDark: '#b8860b',
  platinum: '#e5e4e2',
  platinumDark: '#8d8d8d',

  // Gradient backgrounds
  gradientStart: '#2c7be5',
  gradientEnd: '#6f42c1',
  gradientSuccess: '#00d97e',
  gradientSuccessEnd: '#00b368',

  // Navigation
  tabBarBackground: '#ffffff',
  tabBarBorder: '#e3ebf6',
  tabBarActive: '#2c7be5',
  tabBarInactive: '#9aa5b1',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Input fields
  inputBackground: '#f8f9fa',
  inputBorder: '#e3ebf6',
  inputFocusBorder: '#2c7be5',
  inputPlaceholder: '#9aa5b1',
};

// Dark theme colors
export const darkColors = {
  // Primary
  primary: '#5a9bef',
  primaryDark: '#2c7be5',
  primaryLight: '#8ab8f5',

  // Backgrounds
  background: '#0d1117',
  surface: '#161b22',
  card: '#21262d',
  cardElevated: '#30363d',

  // Text
  text: '#f0f6fc',
  textSecondary: '#8b949e',
  textLight: '#6e7681',
  textInverse: '#0d1117',

  // Status colors
  success: '#3fb950',
  successLight: '#1f3328',
  successDark: '#2ea043',
  warning: '#d29922',
  warningLight: '#3d2f1e',
  warningDark: '#bb8009',
  error: '#f85149',
  errorLight: '#3d2627',
  errorDark: '#da3633',
  info: '#58a6ff',
  infoLight: '#1f3a5c',

  // Order status
  statusCompleted: '#3fb950',
  statusPending: '#d29922',
  statusCancelled: '#f85149',
  statusProcessing: '#58a6ff',

  // Borders
  border: '#30363d',
  borderLight: '#21262d',
  borderDark: '#484f58',

  // Skeleton
  skeleton: '#21262d',
  skeletonHighlight: '#30363d',

  // Charts
  chart1: '#58a6ff',
  chart2: '#3fb950',
  chart3: '#d29922',
  chart4: '#f85149',
  chart5: '#a371f7',
  chart6: '#79c0ff',
  chartGrid: '#30363d',
  chartText: '#8b949e',

  // Premium/Gold
  gold: '#ffd700',
  goldLight: '#3d3a1e',
  goldDark: '#e6c200',
  platinum: '#c0c0c0',
  platinumDark: '#a0a0a0',

  // Gradient backgrounds
  gradientStart: '#58a6ff',
  gradientEnd: '#a371f7',
  gradientSuccess: '#3fb950',
  gradientSuccessEnd: '#2ea043',

  // Navigation
  tabBarBackground: '#161b22',
  tabBarBorder: '#30363d',
  tabBarActive: '#58a6ff',
  tabBarInactive: '#6e7681',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Input fields
  inputBackground: '#0d1117',
  inputBorder: '#30363d',
  inputFocusBorder: '#58a6ff',
  inputPlaceholder: '#6e7681',
};

// Default colors (light mode for backwards compatibility)
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const darkShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 8,
  },
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Chart color palettes
export const chartPalette = {
  primary: ['#2c7be5', '#5a9bef', '#8ab8f5', '#b9d5fa', '#e8f1fd'],
  success: ['#00d97e', '#33e198', '#66e9b2', '#99f1cc', '#ccf8e5'],
  warning: ['#f6c343', '#f8cf69', '#fadb8f', '#fce7b5', '#fef3db'],
  error: ['#e63757', '#eb5f79', '#f0879b', '#f5afbd', '#fad7df'],
  mixed: ['#2c7be5', '#00d97e', '#f6c343', '#e63757', '#6f42c1', '#39afd1'],
  pastel: ['#5a9bef', '#33e198', '#f8cf69', '#eb5f79', '#a371f7', '#79c0ff'],
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Z-index levels
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
