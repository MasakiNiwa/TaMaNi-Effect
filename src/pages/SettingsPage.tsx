import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import BrightnessAutoRounded from '@mui/icons-material/BrightnessAutoRounded';
import { useSettings, type ExportFormat, type ThemeMode } from '../store/settingsStore';
import { useEditor } from '../store/editorStore';
import Section from '../components/Section';
import { LabeledSlider } from '../components/ParamEditor';

function Row({
  label,
  hint,
  inline = false,
  children,
}: {
  label: string;
  hint?: string;
  /** スマホでも横並びにする（スイッチなど小さな操作部品向け） */
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction={inline ? 'row' : { xs: 'column', sm: 'row' }}
      spacing={1}
      sx={{ alignItems: inline ? 'center' : { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', py: 1 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontWeight: 500 }}>{label}</Typography>
        {hint && (
          <Typography variant="body2" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Box>
      <Box sx={{ flexShrink: 0 }}>{children}</Box>
    </Stack>
  );
}

export default function SettingsPage() {
  const s = useSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Section title="表示">
          <Row label="テーマ">
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={s.themeMode}
              onChange={(_, v: ThemeMode | null) => v && s.set('themeMode', v)}
            >
              <ToggleButton value="system" sx={{ gap: 0.5 }}>
                <BrightnessAutoRounded fontSize="small" />
                自動
              </ToggleButton>
              <ToggleButton value="light" sx={{ gap: 0.5 }}>
                <LightModeRounded fontSize="small" />
                ライト
              </ToggleButton>
              <ToggleButton value="dark" sx={{ gap: 0.5 }}>
                <DarkModeRounded fontSize="small" />
                ダーク
              </ToggleButton>
            </ToggleButtonGroup>
          </Row>
          <Divider />
          <Row label="プレビューの画質" hint="低くすると動作が軽くなります">
            <TextField
              select
              size="small"
              value={s.previewMaxSize}
              onChange={(e) => s.set('previewMaxSize', Number(e.target.value))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={800}>軽量（800px）</MenuItem>
              <MenuItem value={1200}>標準（1200px）</MenuItem>
              <MenuItem value={1800}>高画質（1800px）</MenuItem>
              <MenuItem value={2400}>最高（2400px）</MenuItem>
            </TextField>
          </Row>
        </Section>

        <Section title="保存">
          <Row label="ファイル形式">
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={s.exportFormat}
              onChange={(_, v: ExportFormat | null) => v && s.set('exportFormat', v)}
            >
              <ToggleButton value="png">PNG</ToggleButton>
              <ToggleButton value="jpeg">JPEG</ToggleButton>
              <ToggleButton value="webp">WebP</ToggleButton>
            </ToggleButtonGroup>
          </Row>
          {s.exportFormat !== 'png' && (
            <Box sx={{ py: 1 }}>
              <LabeledSlider
                label="画質"
                value={Math.round(s.exportQuality * 100)}
                min={50}
                max={100}
                unit="%"
                onChange={(v) => s.set('exportQuality', v / 100)}
              />
            </Box>
          )}
          <Divider />
          <Row label="書き出しの最大サイズ" hint="長辺のピクセル数。大きい画像で失敗するときは小さくしてください">
            <TextField
              select
              size="small"
              value={s.exportMaxSize}
              onChange={(e) => s.set('exportMaxSize', Number(e.target.value))}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value={0}>元のサイズ</MenuItem>
              <MenuItem value={4096}>4096px</MenuItem>
              <MenuItem value={2048}>2048px</MenuItem>
              <MenuItem value={1024}>1024px</MenuItem>
            </TextField>
          </Row>
        </Section>

        <Section title="データ">
          <Row inline label="エフェクトの構成を記憶する" hint="次に開いたときも同じエフェクトが並びます（画像は保存されません）">
            <Switch checked={s.rememberLayers} onChange={(e) => s.set('rememberLayers', e.target.checked)} />
          </Row>
          <Divider />
          <Row label="設定を初期状態に戻す" hint="設定と記憶したエフェクト構成をすべて消去します">
            <Button color="error" variant="outlined" onClick={() => setConfirmReset(true)}>
              リセット
            </Button>
          </Row>
        </Section>
      </Stack>

      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)}>
        <DialogTitle>すべてリセットしますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>設定と、記憶しているエフェクト構成を初期状態に戻します。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmReset(false)}>
            キャンセル
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              s.reset();
              useEditor.getState().clearLayers();
              setConfirmReset(false);
            }}
          >
            リセット
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
