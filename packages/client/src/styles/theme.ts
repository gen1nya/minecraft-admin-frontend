/**
 * Minecraft Admin Panel - Design System
 *
 * Палитра вдохновлена Minecraft UI с современным dark theme подходом.
 * Все цвета и размеры централизованы здесь для консистентности.
 */

export const colors = {
  // Основные цвета (Minecraft-inspired)
  primary: {
    main: '#5B8731',      // Minecraft grass green
    light: '#7CB342',
    dark: '#3D5C1F',
    contrast: '#FFFFFF',
  },

  secondary: {
    main: '#8B6914',      // Gold/amber
    light: '#B8860B',
    dark: '#6B4F0A',
    contrast: '#FFFFFF',
  },

  // Статусные цвета
  status: {
    online: '#4CAF50',
    offline: '#757575',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Фон (dark theme)
  background: {
    primary: '#1A1A1A',     // Основной фон
    secondary: '#242424',   // Карточки, панели
    tertiary: '#2E2E2E',    // Hover states
    elevated: '#333333',    // Модалки, dropdown
  },

  // Текст
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    disabled: '#666666',
    inverse: '#1A1A1A',
  },

  // Границы
  border: {
    default: '#3A3A3A',
    light: '#4A4A4A',
    focus: '#5B8731',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  round: '50%',
} as const;

export const typography = {
  fontFamily: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
} as const;

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
} as const;

export const zIndex = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  tooltip: 400,
  toast: 500,
} as const;

// Полный объект темы
export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  breakpoints,
  transitions,
  zIndex,
} as const;

export type Theme = typeof theme;
