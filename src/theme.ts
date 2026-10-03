'use client';

import { createTheme } from '@mui/material/styles';

/** Palette: deep navy surfaces, warm orange + ice-blue accents. */
export const dmf = {
  bg: '#0a1628',
  bgDeep: '#060e1c',
  surface: '#0e2140',
  header: '#080b12',
  orange: '#ff8a3d',
  ice: '#38c8ff',
  text: '#e8eef7',
  textMuted: '#a7b8cf',
  ink: '#0a1628',
  gradient: 'linear-gradient(180deg, #ff8a3d 0%, #38c8ff 100%)',
};

export const fonts = {
  display: 'var(--font-display), "Arial Narrow", sans-serif',
  body: 'var(--font-body), "Segoe UI", Roboto, Arial, sans-serif',
  ui: 'var(--font-ui), "Segoe UI", Roboto, Arial, sans-serif',
};

const display = { fontFamily: fonts.display, fontWeight: 700, textTransform: 'uppercase' as const, lineHeight: 1 };

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'dark',
    primary: { main: dmf.orange, contrastText: dmf.ink },
    secondary: { main: dmf.ice, contrastText: dmf.ink },
    background: { default: dmf.bg, paper: dmf.surface },
    text: { primary: dmf.text, secondary: dmf.textMuted },
    divider: 'rgba(232, 238, 247, 0.12)',
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: fonts.body,
    h1: { ...display, fontSize: '4rem', letterSpacing: '0.025em' },
    h2: { ...display, fontSize: '3rem', letterSpacing: '0.025em' },
    h3: { ...display, fontSize: '1.75rem' },
    h4: { ...display, fontSize: '1.4rem' },
    h5: { ...display, fontSize: '1.2rem' },
    h6: { ...display, fontSize: '1rem' },
    body1: { fontSize: '1.125rem', lineHeight: 1.7 },
    overline: { fontFamily: fonts.ui, fontWeight: 700, letterSpacing: '0.2em' },
    button: { fontFamily: fonts.ui, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Phones (under 600px): every font size is 15% smaller. All sizes are in rem, so scaling the
        // root size scales them all; spacing is in px and stays the same.
        '@media (max-width: 599.95px)': {
          html: { fontSize: '85%' },
          // ...but text fields stay at least 16px, or iOS zooms in when you tap them
          'input, textarea': { fontSize: 'max(16px, 1em) !important' },
        },
        // No text selection anywhere on the site...
        body: { backgroundColor: dmf.bg, userSelect: 'none', WebkitUserSelect: 'none' },
        // ...except in text fields (e.g. deck search), so typing and editing still work.
        'input, textarea': { userSelect: 'text', WebkitUserSelect: 'text' },
        '::selection': { background: dmf.orange, color: dmf.ink },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});

export default theme;
