import { useEffect, useState } from 'react';
import {
  Box,
  ButtonBase,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { CATEGORY_LABELS, type EffectCategory, type EffectDefinition } from '../core/types';
import { effects } from '../effects';
import { defaultParams } from '../core/params';
import { renderStack } from '../core/pipeline';
import { createSampleImage } from '../lib/sample';
import { surface } from '../theme';

/** サムネイルは一度作ったら使い回す */
let thumbnailCache: Record<string, string> | null = null;

function buildThumbnails(): Record<string, string> {
  if (thumbnailCache) return thumbnailCache;
  const sample = createSampleImage(240);
  thumbnailCache = Object.fromEntries(
    effects.map((def) => {
      const out = renderStack(sample, [
        { uid: 'thumb', effectId: def.id, params: defaultParams(def), enabled: true, opacity: 1, blendMode: 'source-over' },
      ]);
      return [def.id, out.toDataURL('image/png')];
    }),
  );
  return thumbnailCache;
}

function EffectTile({ def, thumb, onPick }: { def: EffectDefinition; thumb?: string; onPick: () => void }) {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onPick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        textAlign: 'left',
        borderRadius: '20px',
        overflow: 'hidden',
        bgcolor: surface(theme.palette.mode, 1),
        transition: 'background-color .15s, transform .15s',
        '&:hover': { bgcolor: surface(theme.palette.mode, 2) },
        '&:active': { transform: 'scale(.98)' },
      }}
    >
      {thumb ? (
        <Box component="img" src={thumb} alt="" sx={{ width: '100%', aspectRatio: '1', display: 'block' }} />
      ) : (
        <Skeleton variant="rectangular" sx={{ width: '100%', height: 'auto', aspectRatio: '1' }} />
      )}
      <Box sx={{ p: 1.5 }}>
        <Typography sx={{ fontWeight: 700 }}>{def.name}</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {def.description}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export default function AddEffectDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [thumbs, setThumbs] = useState<Record<string, string> | null>(thumbnailCache);

  useEffect(() => {
    if (!open || thumbs) return;
    // ダイアログの表示アニメーションを邪魔しないよう少し遅らせて生成する
    const id = window.setTimeout(() => setThumbs(buildThumbnails()), 50);
    return () => clearTimeout(id);
  }, [open, thumbs]);

  const categories = [...new Set(effects.map((e) => e.category))] as EffectCategory[];

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>エフェクトを追加</Box>
        <IconButton onClick={onClose} aria-label="閉じる">
          <CloseRounded />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {categories.map((cat) => (
            <Box key={cat}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {CATEGORY_LABELS[cat]}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 1.5,
                }}
              >
                {effects
                  .filter((e) => e.category === cat)
                  .map((def) => (
                    <EffectTile key={def.id} def={def} thumb={thumbs?.[def.id]} onPick={() => onPick(def.id)} />
                  ))}
              </Box>
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
