import { useState } from 'react';
import { Box, Button, Chip, Divider, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CasinoRounded from '@mui/icons-material/CasinoRounded';
import ColorizeRounded from '@mui/icons-material/ColorizeRounded';
import { BLEND_MODE_LABELS, type BlendMode, type Layer, type ParamSchema, type ParamValue } from '../../core/types';
import { getEffect } from '../../effects';
import { randomSeed } from '../../core/rng';
import { useEditor } from '../../store/editorStore';
import { useNav } from '../../store/navStore';
import LabeledSlider from '../LabeledSlider';
import ScrollRow from './ScrollRow';
import { useHistoryGroup } from './useHistoryGroup';

const COLOR_PRESETS = ['#000000', '#ffffff', '#222222', '#ff6fa5', '#ffd166', '#6d5bd0', '#4dabf7', '#51cf66', '#ff922b', '#e03131'];

/** エフェクト固有のパラメータに加えて、全エフェクト共通の「強さ」「重ね方」を操作できる */
const OPACITY_KEY = '__opacity';
const BLEND_KEY = '__blend';

function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollRow gap={1} indicator={false}>
      {options.map((o) => (
        <Chip
          key={o.value}
          label={o.label}
          color={o.value === value ? 'primary' : 'default'}
          variant={o.value === value ? 'filled' : 'outlined'}
          onClick={() => onChange(o.value)}
        />
      ))}
    </ScrollRow>
  );
}

function ColorControl({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const theme = useTheme();
  const swatch = (c: string, selected: boolean) => ({
    width: 36,
    height: 36,
    borderRadius: '50%',
    bgcolor: c,
    border: `1px solid ${theme.palette.divider}`,
    outline: selected ? `3px solid ${theme.palette.primary.main}` : 'none',
    outlineOffset: 2,
    cursor: 'pointer',
  });
  const custom = !COLOR_PRESETS.includes(value.toLowerCase());
  return (
    <ScrollRow gap={1.5} indicator={false}>
      <Box component="label" sx={{ ...swatch(custom ? value : 'transparent', custom), position: 'relative', display: 'grid', placeItems: 'center' }}>
        <ColorizeRounded fontSize="small" sx={{ color: custom ? theme.palette.getContrastText(value) : 'text.secondary' }} />
        <Box
          component="input"
          type="color"
          value={value}
          aria-label={`${label}（自由に選ぶ）`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          sx={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
        />
      </Box>
      {COLOR_PRESETS.map((c) => (
        <Box
          key={c}
          component="button"
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          sx={{ ...swatch(c, value.toLowerCase() === c), p: 0 }}
        />
      ))}
    </ScrollRow>
  );
}

function ParamControl({ p, value, onChange }: { p: ParamSchema; value: ParamValue; onChange: (v: ParamValue) => void }) {
  switch (p.type) {
    case 'range':
      return (
        <Box sx={{ px: 3 }}>
          <LabeledSlider
            label={p.label}
            value={value as number}
            min={p.min}
            max={p.max}
            step={p.step}
            unit={p.unit}
            hint={p.hint}
            onChange={onChange}
          />
        </Box>
      );
    case 'select':
      return <ChoiceChips options={p.options} value={value as string} onChange={onChange} />;
    case 'boolean':
      return (
        <ChoiceChips
          options={[
            { value: 'on', label: 'オン' },
            { value: 'off', label: 'オフ' },
          ]}
          value={value ? 'on' : 'off'}
          onChange={(v) => onChange(v === 'on')}
        />
      );
    case 'color':
      return <ColorControl value={value as string} label={p.label} onChange={onChange} />;
    case 'seed':
      return (
        <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
          <Button variant="outlined" startIcon={<CasinoRounded />} onClick={() => onChange(randomSeed())}>
            ランダムを変える
          </Button>
          <Typography variant="caption" color="text.secondary">
            不揃いな部分の出方が変わります
          </Typography>
        </Stack>
      );
  }
}

/** 3 段目：エフェクトの操作パネル */
export default function EffectControls({ layer }: { layer: Layer }) {
  const def = getEffect(layer.effectId)!;
  const { setParam, setOpacity, setBlendMode, removeLayer, duplicateLayer } = useEditor.getState();
  const { done, cancel, showEffects, editLayer } = useNav.getState();
  const group = useHistoryGroup();

  const visible = def.params.filter((p) => !p.visibleWhen || p.visibleWhen(layer.params));
  const firstKey = (visible.find((p) => p.type === 'range') ?? visible[0])?.key ?? OPACITY_KEY;
  const [selected, setSelected] = useState(firstKey);
  const active =
    selected === OPACITY_KEY || selected === BLEND_KEY || visible.some((p) => p.key === selected) ? selected : firstKey;

  const chips = [
    ...visible.map((p) => ({ key: p.key, label: p.label })),
    { key: OPACITY_KEY, label: '強さ' },
    { key: BLEND_KEY, label: '重ね方' },
  ];
  const activeParam = visible.find((p) => p.key === active);

  return (
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ alignItems: 'center', px: 1, gap: 0.5 }}>
        <Tooltip title="キャンセル">
          <IconButton onClick={cancel} aria-label="キャンセル">
            <CloseRounded />
          </IconButton>
        </Tooltip>
        <Typography sx={{ flex: 1, fontWeight: 700, textAlign: 'center' }} noWrap>
          {def.name}
        </Typography>
        <Tooltip title="もう 1 つ重ねる">
          <IconButton
            aria-label="複製"
            onClick={() => {
              duplicateLayer(layer.uid);
              const uid = useEditor.getState().selectedUid;
              if (uid) editLayer(uid);
            }}
          >
            <ContentCopyRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="このエフェクトを外す">
          <IconButton
            aria-label="削除"
            onClick={() => {
              removeLayer(layer.uid);
              showEffects(def.category);
            }}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="完了">
          <IconButton onClick={done} aria-label="完了" color="primary" sx={{ bgcolor: 'action.selected' }}>
            <CheckRounded />
          </IconButton>
        </Tooltip>
      </Stack>

      <ScrollRow gap={0.75} indicator={false} ariaLabel="設定項目">
        {chips.map((c, i) => [
          i === visible.length && <Divider key="div" orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.75 }} />,
          <Chip
            key={c.key}
            label={c.label}
            onClick={() => setSelected(c.key)}
            color={c.key === active ? 'primary' : 'default'}
            variant={c.key === active ? 'filled' : 'outlined'}
          />,
        ])}
      </ScrollRow>

      <Box sx={{ minHeight: 76, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {activeParam ? (
          <ParamControl
            key={activeParam.key}
            p={activeParam}
            value={layer.params[activeParam.key] ?? activeParam.default}
            onChange={(v) => {
              group(`${layer.uid}:${activeParam.key}`);
              setParam(layer.uid, activeParam.key, v);
            }}
          />
        ) : active === OPACITY_KEY ? (
          <Box sx={{ px: 3 }}>
            <LabeledSlider
              label="強さ（不透明度）"
              value={Math.round(layer.opacity * 100)}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => {
                group(`${layer.uid}:opacity`);
                setOpacity(layer.uid, v / 100);
              }}
            />
          </Box>
        ) : (
          <ChoiceChips
            options={Object.entries(BLEND_MODE_LABELS).map(([value, label]) => ({ value: value as BlendMode, label }))}
            value={layer.blendMode}
            onChange={(v) => {
              group(`${layer.uid}:blend`);
              setBlendMode(layer.uid, v);
            }}
          />
        )}
      </Box>
    </Stack>
  );
}
