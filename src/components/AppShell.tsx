import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Box, IconButton, Toolbar, Tooltip, Typography } from '@mui/material';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import Logo from './Logo';
import { useEditor } from '../store/editorStore';

const TITLES: Record<string, string> = {
  '/settings': '設定',
  '/help': 'ヘルプ',
};

export default function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const hasImage = useEditor((s) => !!s.image);

  // 編集中は画像を大きく見せるため、エディタが独自の上部バーを持つ
  if (isHome && hasImage) return <Outlet />;

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ bgcolor: 'background.default', color: 'text.primary', zIndex: 10 }}>
        <Toolbar sx={{ gap: 1 }}>
          {isHome ? (
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'inherit', textDecoration: 'none', minWidth: 0 }}
            >
              <Logo size={32} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h1"
                  sx={{ fontSize: { xs: 18, sm: 20 }, lineHeight: 1.2, whiteSpace: 'nowrap' }}
                >
                  たまにエフェクト
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}
                >
                  たまに使うエフェクトツール
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <IconButton edge="start" aria-label="戻る" onClick={() => navigate('/')}>
                <ArrowBackRounded />
              </IconButton>
              <Typography variant="h6" component="h1">
                {TITLES[pathname] ?? ''}
              </Typography>
            </>
          )}
          <Box sx={{ flex: 1 }} />
          <Tooltip title="ヘルプ">
            <IconButton component={RouterLink} to="/help" aria-label="ヘルプ" color={pathname === '/help' ? 'primary' : 'default'}>
              <HelpOutlineRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title="設定">
            <IconButton component={RouterLink} to="/settings" aria-label="設定" color={pathname === '/settings' ? 'primary' : 'default'}>
              <SettingsRounded />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
