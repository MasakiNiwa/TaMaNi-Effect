import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import { CATEGORY_LABELS, type EffectCategory } from '../../core/types';
import { effects } from '../../effects';
import { useEditor } from '../../store/editorStore';
import { useNav } from '../../store/navStore';
import { surface } from '../../theme';
import ScrollRow from './ScrollRow';
import NavTile from './NavTile';
import EffectControls from './EffectControls';
import { CATEGORY_ICONS } from './categoryMeta';
import { useEffectThumbnails } from './useEffectThumbnails';

const CATEGORIES = [...new Set(effects.map((e) => e.category))] as EffectCategory[];

/** 1 段目：機能のグループ */
function GroupLevel() {
  const layers = useEditor((s) => s.layers);
  const showEffects = useNav((s) => s.showEffects);
  return (
    <Stack sx={{ gap: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2.5, fontWeight: 700 }}>
        エフェクトを選ぶ
      </Typography>
      <ScrollRow gap={1} center ariaLabel="エフェクトのグループ">
        {CATEGORIES.map((cat) => (
          <NavTile
            key={cat}
            label={CATEGORY_LABELS[cat]}
            icon={CATEGORY_ICONS[cat]}
            badge={layers.filter((l) => effects.find((e) => e.id === l.effectId)?.category === cat).length}
            onClick={() => showEffects(cat)}
          />
        ))}
      </ScrollRow>
    </Stack>
  );
}

/** 2 段目：グループ内のエフェクト */
function EffectLevel({ category }: { category: EffectCategory }) {
  const image = useEditor((s) => s.image);
  const layers = useEditor((s) => s.layers);
  const { showGroups, pickEffect } = useNav.getState();
  const list = effects.filter((e) => e.category === category);
  const thumbs = useEffectThumbnails(image?.canvas ?? null, list.map((e) => e.id));

  return (
    <Stack sx={{ gap: 0.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 1, gap: 0.5 }}>
        <IconButton size="small" onClick={showGroups} aria-label="グループ一覧に戻る">
          <ArrowBackRounded fontSize="small" />
        </IconButton>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {CATEGORY_LABELS[category]}
        </Typography>
      </Stack>
      <ScrollRow gap={1} center ariaLabel={`${CATEGORY_LABELS[category]}のエフェクト`}>
        {list.map((def) => (
          <NavTile
            key={def.id}
            label={def.name}
            image={thumbs[def.id] ?? ''}
            badge={layers.filter((l) => l.effectId === def.id).length}
            onClick={() => pickEffect(def.id)}
          />
        ))}
      </ScrollRow>
    </Stack>
  );
}

/**
 * 画面下部のナビゲーション（3 段構え）。
 * グループ → エフェクト → 操作パネル の順に切り替わる。
 */
export default function BottomNav() {
  const theme = useTheme();
  const nav = useNav((s) => s.nav);
  const editingLayer = useEditor((s) => (nav.level === 'edit' ? s.layers.find((l) => l.uid === nav.uid) : undefined));

  let content;
  let key: string;
  if (nav.level === 'edit' && editingLayer) {
    content = <EffectControls layer={editingLayer} />;
    key = `edit:${nav.uid}`;
  } else if (nav.level === 'effects' || nav.level === 'edit') {
    // 編集中のレイヤーが元に戻す等で消えた場合はエフェクト一覧を表示する
    content = <EffectLevel category={nav.category} />;
    key = `effects:${nav.category}`;
  } else {
    content = <GroupLevel />;
    key = 'groups';
  }

  return (
    <Box
      component="nav"
      aria-label="エフェクトの操作"
      sx={{
        bgcolor: surface(theme.palette.mode, 1),
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        pt: 1.5,
        pb: 'calc(12px + env(safe-area-inset-bottom))',
        minHeight: 196,
      }}
    >
      <Box
        key={key}
        sx={{
          maxWidth: 760,
          mx: 'auto',
          animation: 'navIn .22s ease-out',
          '@keyframes navIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'none' },
          },
        }}
      >
        {content}
      </Box>
    </Box>
  );
}
