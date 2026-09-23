import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddRounded from '@mui/icons-material/AddRounded';
import { useEditor } from '../store/editorStore';
import { getEffect } from '../effects';
import LayerCard from './LayerCard';

/** レイヤーが空のときに表示するおすすめ */
const QUICK_PICKS = ['dots', 'stripes', 'glitch', 'focusLines', 'sparkle'];

export default function LayerPanel({ onAdd }: { onAdd: () => void }) {
  const layers = useEditor((s) => s.layers);
  const addLayer = useEditor((s) => s.addLayer);
  const clearLayers = useEditor((s) => s.clearLayers);

  // 表示は「上にあるものほど後からかかる」（レイヤーの重なり順と同じ）
  const displayed = [...layers].reverse();

  return (
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
          エフェクト
          {layers.length > 0 && (
            <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
              {layers.length}
            </Typography>
          )}
        </Typography>
        <Button variant="contained" startIcon={<AddRounded />} onClick={onAdd}>
          追加
        </Button>
      </Stack>

      {layers.length === 0 ? (
        <Box sx={{ py: 2 }}>
          <Typography color="text.secondary" sx={{ mb: 1.5 }}>
            「追加」からエフェクトを選ぶか、こちらからどうぞ。
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {QUICK_PICKS.map((id) => {
              const def = getEffect(id);
              return def ? (
                <Chip key={id} label={def.name} icon={<AddRounded />} onClick={() => addLayer(id)} variant="outlined" />
              ) : null;
            })}
          </Stack>
        </Box>
      ) : (
        <>
          {displayed.map((layer, i) => (
            <LayerCard key={layer.uid} layer={layer} canMoveUp={i > 0} canMoveDown={i < displayed.length - 1} />
          ))}
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              上にあるエフェクトほど後からかかります
            </Typography>
            <Button size="small" color="inherit" onClick={clearLayers} sx={{ color: 'text.secondary' }}>
              すべて削除
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}
