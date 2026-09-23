import { createTheme, type PaletteMode } from '@mui/material/styles';

/**
 * Material Design 3 を意識したテーマ。
 * 角丸を大きめに、影を控えめにして、色の濃淡（トーン）で面を区別する。
 */
export function createAppTheme(mode: PaletteMode) {
  const light = mode === 'light';
  return createTheme({
    palette: {
      mode,
      primary: { main: light ? '#6d5bd0' : '#c8bfff', contrastText: light ? '#fff' : '#2a1c78' },
      secondary: { main: light ? '#d9487a' : '#ffb1c8' },
      background: {
        default: light ? '#fbf8ff' : '#131218',
        paper: light ? '#ffffff' : '#1c1b22',
      },
      divider: light ? 'rgba(40,30,80,0.12)' : 'rgba(230,225,255,0.12)',
      text: {
        primary: light ? '#1c1a24' : '#e7e1ee',
        secondary: light ? '#5d5a6b' : '#c9c4d4',
      },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Noto Sans JP", "Hiragino Sans", "Yu Gothic UI", system-ui, sans-serif',
      h1: { fontFamily: '"M PLUS Rounded 1c", "Noto Sans JP", sans-serif', fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { WebkitTapHighlightColor: 'transparent' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 999, paddingInline: 20 } },
      },
      MuiFab: { styleOverrides: { root: { borderRadius: 16, boxShadow: 'none' } } },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { borderRadius: 20 } },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 28 } } },
      MuiAppBar: { defaultProps: { elevation: 0, color: 'transparent' } },
      MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
      MuiToggleButtonGroup: { styleOverrides: { root: { borderRadius: 999 } } },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}

/** テーマに応じた「面」の色（M3 の surface container 相当） */
export const surface = (mode: PaletteMode, level: 1 | 2 | 3) =>
  mode === 'light'
    ? ['#f5f1fc', '#efeaf8', '#e8e2f3'][level - 1]
    : ['#211f28', '#2a2832', '#34313d'][level - 1];
