import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import { useEditor } from '../store/editorStore';
import { useSettings } from '../store/settingsStore';
import { baseName } from '../lib/image';
import { canShareFile, downloadBlob, extensionOf, renderForExport } from '../lib/export';

interface Result {
  file: File;
  url: string;
  width: number;
  height: number;
}

/**
 * 原寸で描画し直してから保存する。
 * スマホでは共有シート（写真アプリへの保存など）も使えるよう、描画完了後にボタンを押してもらう。
 */
export default function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const { image, layers } = useEditor.getState();
    const { exportFormat, exportQuality, exportMaxSize } = useSettings.getState();
    if (!image) return;
    let cancelled = false;
    let url = '';
    setResult(null);
    setError(null);
    // スピナーを先に表示させるため、次のタスクで重い処理を行う
    const id = window.setTimeout(async () => {
      try {
        const blob = await renderForExport(image.canvas, layers, {
          format: exportFormat,
          quality: exportQuality,
          maxSize: exportMaxSize,
        });
        if (cancelled) return;
        const name = `${baseName(image.name)}_tamani.${extensionOf(exportFormat)}`;
        const file = new File([blob], name, { type: blob.type });
        url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        await img.decode();
        if (!cancelled) setResult({ file, url, width: img.naturalWidth, height: img.naturalHeight });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('書き出しに失敗しました。設定で「書き出しの最大サイズ」を小さくするとうまくいくことがあります');
      }
    }, 30);
    return () => {
      cancelled = true;
      clearTimeout(id);
      if (url) URL.revokeObjectURL(url);
    };
  }, [open]);

  const share = async () => {
    if (!result) return;
    try {
      await navigator.share({ files: [result.file], title: 'たまにエフェクト' });
    } catch {
      // キャンセルされた場合など。何もしない
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>画像を保存</DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : !result ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 6, gap: 2 }}>
            <CircularProgress />
            <Typography color="text.secondary">原寸で仕上げています…</Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={result.url}
              alt="書き出し結果"
              sx={{ maxWidth: '100%', maxHeight: '45dvh', borderRadius: '8px', display: 'block', mx: 'auto' }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {result.file.name}
              <br />
              {result.width} × {result.height} px ・ {(result.file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} color="inherit">
          閉じる
        </Button>
        {result && canShareFile(result.file) && (
          <Button variant="outlined" startIcon={<ShareRounded />} onClick={share}>
            共有
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<DownloadRounded />}
          disabled={!result}
          onClick={() => result && downloadBlob(result.file, result.file.name)}
        >
          ダウンロード
        </Button>
      </DialogActions>
    </Dialog>
  );
}
