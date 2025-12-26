import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.md};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Typography defaults */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    color: ${theme.colors.text.primary};
  }

  h1 { font-size: ${theme.typography.fontSize.xxl}; }
  h2 { font-size: ${theme.typography.fontSize.xl}; }
  h3 { font-size: ${theme.typography.fontSize.lg}; }
  h4 { font-size: ${theme.typography.fontSize.md}; }

  p {
    margin-bottom: ${theme.spacing.md};
  }

  a {
    color: ${theme.colors.primary.light};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primary.main};
    }
  }

  /* Code blocks */
  code, pre {
    font-family: ${theme.typography.fontFamily.mono};
    font-size: ${theme.typography.fontSize.sm};
  }

  code {
    background: ${theme.colors.background.tertiary};
    padding: 2px 6px;
    border-radius: ${theme.borderRadius.sm};
  }

  pre {
    background: ${theme.colors.background.secondary};
    padding: ${theme.spacing.md};
    border-radius: ${theme.borderRadius.md};
    overflow-x: auto;
  }

  /* Form elements reset */
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  /* Remove autofill styles */
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 30px ${theme.colors.background.secondary} inset;
    -webkit-text-fill-color: ${theme.colors.text.primary};
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background.primary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.border.light};
    border-radius: ${theme.borderRadius.sm};

    &:hover {
      background: ${theme.colors.text.disabled};
    }
  }

  /* Selection */
  ::selection {
    background: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
  }
`;
