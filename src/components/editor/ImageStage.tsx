import { useEffect, useRef, useState } from 'react';
import { Badge, Box, Chip, Fab, Fade, Tooltip } from '@mui/material';
import LayersRounded from '@mui/icons-material/LayersRounded';
import TouchAppRounded from '@mui/icons-material/TouchAppRounded';
import PreviewCanvas from '../PreviewCanvas';
import { useEditor, type SourceImage } from '../../store/editorStore';

const LONG_PRESS_MS = 220;
const HINT_KEY = 'tamani-effect:hint-longpress';

/**
 * 画像の表示エリア。長押ししている間は元の画像を表示する。
 * 右下に「重ねたエフェクト」一覧を開くボタンを置く。
 */
export default function ImageStage({ image, onOpenLayers }: { image: SourceImage; onOpenLayers: () => void }) {
  const layerCount = useEditor((s) => s.layers.length);
  const hasLayers = layerCount > 0;
  const [showOriginal, setShowOriginal] = useState(false);
  const [hint, setHint] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  // 初めてエフェクトをかけたときに、長押しで比較できることを一度だけ知らせる
  useEffect(() => {
    if (!hasLayers) return;
    let seen = false;
    try {
      seen = localStorage.getItem(HINT_KEY) === '1';
      localStorage.setItem(HINT_KEY, '1');
    } catch {
      // ストレージが使えない環境では毎回表示しない
      seen = true;
    }
    if (seen) return;
    setHint(true);
    const id = window.setTimeout(() => setHint(false), 4000);
    return () => clearTimeout(id);
  }, [hasLayers]);

  const release = () => {
    clearTimeout(timer.current);
    setShowOriginal(false);
  };

  return (
    <Box
      onPointerDown={(e) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('button')) return;
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          setShowOriginal(true);
          setHint(false);
        }, LONG_PRESS_MS);
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        touchAction: 'none',
      }}
    >
      <PreviewCanvas image={image} showOriginal={showOriginal} />

      <Fade in={showOriginal || hint}>
        <Chip
          icon={showOriginal ? undefined : <TouchAppRounded />}
          label={showOriginal ? '元の画像' : '画像を長押しすると元の画像を表示します'}
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(20,16,32,.72)',
            color: '#fff',
            backdropFilter: 'blur(6px)',
            pointerEvents: 'none',
            '& .MuiChip-icon': { color: '#fff' },
          }}
        />
      </Fade>

      <Tooltip title="重ねたエフェクト" placement="left">
        <Fab
          size="medium"
          onClick={onOpenLayers}
          aria-label="重ねたエフェクトの一覧"
          sx={{ position: 'absolute', right: 16, bottom: 12, bgcolor: 'background.paper', color: 'text.primary', boxShadow: 3 }}
        >
          <Badge badgeContent={layerCount} color="primary">
            <LayersRounded />
          </Badge>
        </Fab>
      </Tooltip>
    </Box>
  );
}
