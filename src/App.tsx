import { useMemo } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import { createAppTheme } from './theme';
import { useSettings } from './store/settingsStore';
import AppShell from './components/AppShell';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

export default function App() {
  const themeMode = useSettings((s) => s.themeMode);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = themeMode === 'system' ? (prefersDark ? 'dark' : 'light') : themeMode;
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* GitHub Pages ではサーバー側のルーティングができないためハッシュルーティングを使う */}
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<EditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}
