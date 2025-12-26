import styled from 'styled-components';
import { theme } from './theme';
import { mixins } from './mixins';

/**
 * Базовые переиспользуемые styled-компоненты.
 * Импортируйте и используйте напрямую или расширяйте.
 */

// Layout
export const Container = styled.div`
  width: 100%;
  max-width: ${theme.breakpoints.wide};
  margin: 0 auto;
  padding: 0 ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: 0 ${theme.spacing.md};
  }
`;

export const PageWrapper = styled.main`
  flex: 1;
  padding: ${theme.spacing.xl} 0;
`;

export const Grid = styled.div<{ columns?: number; gap?: keyof typeof theme.spacing }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => theme.spacing[props.gap || 'md']};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: string;
  justify?: string;
  gap?: keyof typeof theme.spacing;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => theme.spacing[props.gap || 'md']};
  flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
`;

// Cards
export const Card = styled.div`
  ${mixins.card}
`;

export const CardHeader = styled.div`
  ${mixins.flexBetween}
  margin-bottom: ${theme.spacing.md};
`;

export const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

export const CardContent = styled.div`
  color: ${theme.colors.text.secondary};
`;

// Buttons
export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'ghost' }>`
  ${props => {
    switch (props.variant) {
      case 'secondary':
        return mixins.buttonSecondary;
      case 'ghost':
        return mixins.buttonGhost;
      default:
        return mixins.buttonPrimary;
    }
  }}
`;

export const IconButton = styled.button`
  ${mixins.flexCenter}
  width: 36px;
  height: 36px;
  border-radius: ${theme.borderRadius.md};
  background: transparent;
  color: ${theme.colors.text.secondary};
  transition: all ${theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${theme.colors.background.tertiary};
    color: ${theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Form elements
export const Input = styled.input`
  ${mixins.inputBase}
`;

export const Select = styled.select`
  ${mixins.inputBase}
  cursor: pointer;
`;

export const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

export const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

// Typography
export const Text = styled.p<{
  size?: keyof typeof theme.typography.fontSize;
  weight?: keyof typeof theme.typography.fontWeight;
  color?: string;
}>`
  font-size: ${props => theme.typography.fontSize[props.size || 'md']};
  font-weight: ${props => theme.typography.fontWeight[props.weight || 'regular']};
  color: ${props => props.color || theme.colors.text.primary};
  margin: 0;
`;

export const Heading = styled.h2<{ level?: 1 | 2 | 3 | 4 }>`
  font-size: ${props => {
    switch (props.level) {
      case 1: return theme.typography.fontSize.xxl;
      case 2: return theme.typography.fontSize.xl;
      case 3: return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.md;
    }
  }};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

// Status
export const StatusBadge = styled.span<{ status: 'online' | 'offline' | 'warning' | 'error' }>`
  ${mixins.flexCenter}
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};

  background: ${props => {
    const statusColors: Record<string, string> = {
      online: `${theme.colors.status.online}20`,
      offline: `${theme.colors.status.offline}20`,
      warning: `${theme.colors.status.warning}20`,
      error: `${theme.colors.status.error}20`,
    };
    return statusColors[props.status];
  }};

  color: ${props => {
    const statusColors: Record<string, string> = {
      online: theme.colors.status.online,
      offline: theme.colors.status.offline,
      warning: theme.colors.status.warning,
      error: theme.colors.status.error,
    };
    return statusColors[props.status];
  }};

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
`;

// Divider
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${theme.colors.border.default};
  margin: ${theme.spacing.md} 0;
`;

// Skeleton loading
export const Skeleton = styled.div<{ width?: string; height?: string }>`
  ${mixins.skeleton}
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
`;
