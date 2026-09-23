import { Box, Slider, Stack, Typography } from '@mui/material';

export default function LabeledSlider(props: {
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
