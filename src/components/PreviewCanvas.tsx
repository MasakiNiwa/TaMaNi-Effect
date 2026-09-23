import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box } from '@mui/material';
import { createCachedRenderer } from '../core/pipeline';
import { drawSourceFitted, get2d } from '../core/canvas';
import { useEditor, type SourceImage } from '../store/editorStore';
import { useSettings } from '../store/settingsStore';

interface Props {
  image: SourceImage;
  showOriginal: boolean;
}

/** 透明部分がわかるように敷く市松模様 */
const checker = (a: string, b: string) => ({
  backgroundColor: a,
  backgroundImage: `linear-gradient(45deg, ${b} 25%, transparent 25%, transparent 75%, ${b} 75%), linear-gradient(45deg, ${b} 25%, transparent 25%, transparent 75%, ${b} 75%)`,
  backgroundSize: '16px 16px',
  backgroundPosition: '0 0, 8px 8px',
});

export default function PreviewCanvas({ image, showOriginal }: Props) {
  const layers = useEditor((s) => s.layers);
  const previewMaxSize = useSettings((s) => s.previewMaxSize);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const source = useMemo(
    () => drawSourceFitted(image.canvas, image.canvas.width, image.canvas.height, previewMaxSize),
    [image, previewMaxSize],
  );
  const render = useMemo(() => createCachedRenderer(), []);

  useEffect(() => {
    // 連続した変更（スライダー操作など）は 1 フレームにまとめて描画する
    const id = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      try {
        const out = showOriginal ? source : render(source, layers);
        canvas.width = out.width;
        canvas.height = out.height;
        get2d(canvas).drawImage(out, 0, 0);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('プレビューの描画中にエラーが発生しました');
      }
    });
    return () => cancelAnimationFrame(id);
  }, [source, layers, showOriginal, render]);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        aria-label="プレビュー"
        sx={(t) => ({
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          borderRadius: '8px',
          boxShadow: t.palette.mode === 'light' ? '0 2px 12px rgba(40,20,90,.12)' : '0 2px 12px rgba(0,0,0,.4)',
          ...(t.palette.mode === 'light' ? checker('#ffffff', '#ece8f4') : checker('#2a2832', '#34313d')),
        })}
      />
      {error && (
        <Alert severity="error" sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
