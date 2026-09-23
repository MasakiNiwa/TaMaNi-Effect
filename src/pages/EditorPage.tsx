import { useEffect, useState } from 'react';
import { Alert, Box, Snackbar } from '@mui/material';
import { useEditor } from '../store/editorStore';
import { useImagePicker } from '../components/useImagePicker';
import EmptyState from '../components/EmptyState';
import ExportDialog from '../components/ExportDialog';
import EditorTopBar from '../components/editor/EditorTopBar';
import ImageStage from '../components/editor/ImageStage';
import BottomNav from '../components/editor/BottomNav';
import LayerSheet from '../components/editor/LayerSheet';

/**
 * エディタ画面。
 *   上部 : 画像のクリア / 元に戻す / やり直し / 保存
 *   中央 : 画像（長押しで元画像）＋ 重ねたエフェクト一覧ボタン
 *   下部 : 3 段構えのナビゲーション（グループ → エフェクト → 操作）
 */
export default function EditorPage() {
  const image = useEditor((s) => s.image);
  const picker = useImagePicker();
  const [exportOpen, setExportOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);

  // キーボードショートカット（元に戻す / やり直し）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable]')) return;
      const key = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey) || (key !== 'z' && key !== 'y')) return;
      e.preventDefault();
      if (key === 'y' || e.shiftKey) useEditor.getState().redo();
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

  return (
    <Box
      sx={(t) => ({
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        outline: picker.dragging ? `3px dashed ${t.palette.primary.main}` : 'none',
        outlineOffset: -6,
      })}
    >
      {picker.input}
      <EditorTopBar onChangeImage={picker.open} onSave={() => setExportOpen(true)} />
      <ImageStage image={image} onOpenLayers={() => setLayersOpen(true)} />
      <BottomNav />
      <LayerSheet open={layersOpen} onClose={() => setLayersOpen(false)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      {errorSnackbar}
    </Box>
  );
}
