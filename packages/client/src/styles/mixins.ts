import { css } from 'styled-components';
import { theme } from './theme';

/**
 * Переиспользуемые CSS миксины для styled-components.
 * Используйте их через интерполяцию: ${mixins.card}
 */

// Flexbox layouts
export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexBetween = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

// Card/Panel styles
export const card = css`
  background: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.lg};
`;

export const cardHoverable = css`
  ${card}
  transition: all ${theme.transitions.normal};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.background.tertiary};
    border-color: ${theme.colors.border.light};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

// Button base styles
export const buttonBase = css`
  ${flexCenter}
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-weight: ${theme.typography.fontWeight.medium};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const buttonPrimary = css`
  ${buttonBase}
  background: ${theme.colors.primary.main};
  color: ${theme.colors.primary.contrast};

  &:hover:not(:disabled) {
    background: ${theme.colors.primary.light};
  }

  &:active:not(:disabled) {
    background: ${theme.colors.primary.dark};
  }
`;

export const buttonSecondary = css`
  ${buttonBase}
  background: ${theme.colors.background.tertiary};
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border.default};

  &:hover:not(:disabled) {
    background: ${theme.colors.background.elevated};
    border-color: ${theme.colors.border.light};
  }
`;

export const buttonGhost = css`
  ${buttonBase}
  background: transparent;
  color: ${theme.colors.text.secondary};

  &:hover:not(:disabled) {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
  }
`;

// Input styles
export const inputBase = css`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background.tertiary};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.fast};

  &::placeholder {
    color: ${theme.colors.text.disabled};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.border.focus};
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}33;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Status indicators
export const statusDot = css`
  width: 8px;
  height: 8px;
  border-radius: ${theme.borderRadius.round};
  flex-shrink: 0;
`;

export const statusOnline = css`
  ${statusDot}
  background: ${theme.colors.status.online};
  box-shadow: 0 0 8px ${theme.colors.status.online}80;
`;

export const statusOffline = css`
  ${statusDot}
  background: ${theme.colors.status.offline};
`;

// Truncate text
export const textTruncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const textClamp = (lines: number) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

// Responsive helpers
export const hideOnMobile = css`
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const showOnMobile = css`
  display: none;

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: block;
  }
`;

// Skeleton loading
export const skeleton = css`
  background: linear-gradient(
    90deg,
    ${theme.colors.background.tertiary} 25%,
    ${theme.colors.background.elevated} 50%,
    ${theme.colors.background.tertiary} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: ${theme.borderRadius.sm};

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

// Grouped export
export const mixins = {
  flexCenter,
  flexBetween,
  flexColumn,
  card,
  cardHoverable,
  buttonBase,
  buttonPrimary,
  buttonSecondary,
  buttonGhost,
  inputBase,
  statusDot,
  statusOnline,
  statusOffline,
  textTruncate,
  textClamp,
  hideOnMobile,
  showOnMobile,
  skeleton,
};
