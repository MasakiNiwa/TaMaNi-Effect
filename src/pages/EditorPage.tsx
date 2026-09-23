import { useEffect, useState } from 'react';
import { Alert, Box, Button, Divider, IconButton, Paper, Snackbar, Tooltip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import CompareRounded from '@mui/icons-material/CompareRounded';
import UndoRounded from '@mui/icons-material/UndoRounded';
import RedoRounded from '@mui/icons-material/RedoRounded';
import SaveAltRounded from '@mui/icons-material/SaveAltRounded';
import { useEditor } from '../store/editorStore';
import { surface } from '../theme';
import { useImagePicker } from '../components/useImagePicker';
import EmptyState from '../components/EmptyState';
import PreviewCanvas from '../components/PreviewCanvas';
import LayerPanel from '../components/LayerPanel';
import AddEffectDialog from '../components/AddEffectDialog';
import ExportDialog from '../components/ExportDialog';

const APP_BAR_HEIGHT = { xs: 56, sm: 64 };

export default function EditorPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const image = useEditor((s) => s.image);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const { undo, redo, addLayer } = useEditor.getState();
  const picker = useImagePicker();
  const [showOriginal, setShowOriginal] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // キーボードショートカット（元に戻す / やり直し）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable]')) return;
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z' && e.key.toLowerCase() !== 'y') return;
      e.preventDefault();
      if (e.key.toLowerCase() === 'y' || e.shiftKey) useEditor.getState().redo();
      else useEditor.getState().undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const errorSnackbar = (
    <Snackbar open={!!picker.error} autoHideDuration={5000} onClose={picker.clearError}>
      <Alert severity="error" onClose={picker.clearError} variant="filled">
        {picker.error}
      </Alert>
    </Snackbar>
  );

  if (!image) {
    return (
      <>
        {picker.input}
        <EmptyState onOpen={picker.open} onSample={picker.loadSample} dragging={picker.dragging} />
        {errorSnackbar}
      </>
    );
  }

  const compareHandlers = {
    onPointerDown: () => setShowOriginal(true),
    onPointerUp: () => setShowOriginal(false),
    onPointerLeave: () => setShowOriginal(false),
    onPointerCancel: () => setShowOriginal(false),
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 400px' },
        height: { md: `calc(100dvh - ${APP_BAR_HEIGHT.sm}px)` },
      }}
    >
      {picker.input}
      {/* プレビュー（スマホでは上部に固定） */}
      <Box
        sx={{
          position: { xs: 'sticky', md: 'relative' },
          top: { xs: APP_BAR_HEIGHT.xs, sm: APP_BAR_HEIGHT.sm, md: 'auto' },
          zIndex: 5,
          height: { xs: '48dvh', md: 'auto' },
          bgcolor: 'background.default',
          outline: picker.dragging ? `3px dashed ${theme.palette.primary.main}` : 'none',
          outlineOffset: -6,
          touchAction: 'pan-y',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bottom: 64 }}>
          <PreviewCanvas image={image} showOriginal={showOriginal} />
        </Box>
        <Paper
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 10,
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            p: 0.5,
            borderRadius: 999,
            bgcolor: surface(theme.palette.mode, 2),
            whiteSpace: 'nowrap',
          }}
        >
          <Tooltip title="画像を変更">
            <IconButton onClick={picker.open} aria-label="画像を変更">
              <AddPhotoAlternateRounded />
            </IconButton>
          </Tooltip>
          <Tooltip title="押している間、元の画像を表示">
            <IconButton
              {...compareHandlers}
              aria-label="元の画像と比較"
              color={showOriginal ? 'primary' : 'default'}
              sx={{ userSelect: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
            >
              <CompareRounded />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
          <Tooltip title="元に戻す">
            <span>
              <IconButton onClick={undo} disabled={!canUndo} aria-label="元に戻す">
                <UndoRounded />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="やり直し">
            <span>
              <IconButton onClick={redo} disabled={!canRedo} aria-label="やり直し">
                <RedoRounded />
              </IconButton>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<SaveAltRounded />}
            onClick={() => setExportOpen(true)}
            sx={{ ml: 0.5, px: { xs: 2, sm: 2.5 } }}
          >
            保存
          </Button>
        </Paper>
      </Box>

      {/* エフェクトのパネル */}
      <Box
        sx={{
          overflowY: { md: 'auto' },
          bgcolor: 'background.default',
          borderLeft: { md: `1px solid ${theme.palette.divider}` },
          pb: { xs: 'calc(24px + env(safe-area-inset-bottom))', md: 0 },
        }}
      >
        <LayerPanel onAdd={() => setAddOpen(true)} />
      </Box>

      <AddEffectDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onPick={(id) => {
          addLayer(id);
          setAddOpen(false);
          if (!isDesktop) window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      {errorSnackbar}
    </Box>
  );
}
