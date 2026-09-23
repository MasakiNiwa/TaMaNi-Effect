import { useRef } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CasinoRounded from '@mui/icons-material/CasinoRounded';
import type { ParamSchema, ParamValue, ParamValues, SelectParam } from '../core/types';
import { randomSeed } from '../core/rng';
import { useEditor } from '../store/editorStore';

/**
 * 同じ操作が短時間に連続する場合（スライダーのドラッグ等）は、
 * 元に戻す履歴を 1 回分だけ積むためのフック。
 */
export function useHistoryGroup() {
  const checkpoint = useEditor((s) => s.checkpoint);
  const last = useRef({ key: '', time: 0 });
  return (key: string) => {
    const now = performance.now();
    if (last.current.key !== key || now - last.current.time > 700) checkpoint();
    last.current = { key, time: now };
  };
}

export function LabeledSlider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const { label, value, min, max, step = 1, unit = '', hint, onChange } = props;
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {value}
          {unit}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, v) => onChange(v as number)}
        aria-label={label}
        sx={{ mt: -0.25, mb: -0.5 }}
      />
      {hint && (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: -0.25 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
}

function SelectControl({ p, value, onChange }: { p: SelectParam; value: string; onChange: (v: string) => void }) {
  const short = p.options.length <= 3 && p.options.every((o) => o.label.length <= 6);
  if (short) {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
          {p.label}
        </Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          color="primary"
          value={value}
          onChange={(_, v) => v !== null && onChange(v)}
        >
          {p.options.map((o) => (
            <ToggleButton key={o.value} value={o.value} sx={{ py: 0.5 }}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    );
  }
  return (
    <TextField select size="small" fullWidth label={p.label} value={value} onChange={(e) => onChange(e.target.value)}>
      {p.options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function ParamControl({ p, value, onChange }: { p: ParamSchema; value: ParamValue; onChange: (v: ParamValue) => void }) {
  switch (p.type) {
    case 'range':
      return (
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
      );
    case 'select':
      return <SelectControl p={p} value={value as string} onChange={onChange} />;
    case 'boolean':
      return (
        <FormControlLabel
          sx={{ justifyContent: 'space-between', ml: 0 }}
          labelPlacement="start"
          label={<Typography variant="body2" sx={{ fontWeight: 500 }}>{p.label}</Typography>}
          control={<Switch checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />}
        />
      );
    case 'color':
      return (
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {p.label}
          </Typography>
          <Stack
            component="label"
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', cursor: 'pointer', px: 1, py: 0.5, borderRadius: 999, '&:hover': { bgcolor: 'action.hover' } }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {(value as string).toUpperCase()}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: value as string,
                border: '2px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box
                component="input"
                type="color"
                value={value as string}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                aria-label={p.label}
                sx={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </Box>
          </Stack>
        </Stack>
      );
    case 'seed':
      return (
        <Button
          variant="outlined"
          size="small"
          startIcon={<CasinoRounded />}
          onClick={() => onChange(randomSeed())}
          sx={{ alignSelf: 'flex-start' }}
        >
          ランダムを変える
        </Button>
      );
  }
}

export default function ParamEditor({ uid, schema, params }: { uid: string; schema: ParamSchema[]; params: ParamValues }) {
  const setParam = useEditor((s) => s.setParam);
  const group = useHistoryGroup();
  return (
    <Stack spacing={1.75}>
      {schema
        .filter((p) => !p.visibleWhen || p.visibleWhen(params))
        .map((p) => (
          <ParamControl
            key={p.key}
            p={p}
            value={params[p.key] ?? p.default}
            onChange={(v) => {
              group(`${uid}:${p.key}`);
              setParam(uid, p.key, v);
            }}
          />
        ))}
    </Stack>
  );
}
