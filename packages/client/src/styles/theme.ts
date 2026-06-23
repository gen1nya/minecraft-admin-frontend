/**
 * Minecraft Admin Panel - Design System
 *
 * Палитра вдохновлена Minecraft UI с современным dark theme подходом.
 * Все цвета и размеры централизованы здесь для консистентности.
 */

export const colors = {
  // Основные цвета (Minecraft-inspired)
  primary: {
    main: '#65A33A',      // Minecraft grass green
    light: '#8BCF56',
    dark: '#446E28',
    contrast: '#FFFFFF',
  },

  secondary: {
    main: '#C28A2E',      // Gold/amber
    light: '#E0AD4D',
    dark: '#80581C',
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
    primary: '#0D1110',     // Основной фон
    secondary: '#151A18',   // Карточки, панели
    tertiary: '#1D2521',    // Hover states
    elevated: '#263029',    // Модалки, dropdown
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
    default: '#2B3530',
    light: '#3B4740',
    focus: '#65A33A',
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
  sm: '0 1px 2px rgba(0, 0, 0, 0.28)',
  md: '0 12px 28px rgba(0, 0, 0, 0.26)',
  lg: '0 18px 44px rgba(0, 0, 0, 0.32)',
  xl: '0 26px 70px rgba(0, 0, 0, 0.42)',
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
