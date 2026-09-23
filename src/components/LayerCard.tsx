import { useState } from 'react';
import {
  Box,
  Card,
  Collapse,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import { BLEND_MODE_LABELS, type BlendMode, type Layer } from '../core/types';
import { getEffect } from '../effects';
import { useEditor } from '../store/editorStore';
import { surface } from '../theme';
import ParamEditor, { LabeledSlider, useHistoryGroup } from './ParamEditor';

interface Props {
  layer: Layer;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function LayerCard({ layer, canMoveUp, canMoveDown }: Props) {
  const theme = useTheme();
  const def = getEffect(layer.effectId);
  const selected = useEditor((s) => s.selectedUid === layer.uid);
  const { select, toggleLayer, moveLayer, duplicateLayer, removeLayer, resetParams, setOpacity, setBlendMode } =
    useEditor.getState();
  const group = useHistoryGroup();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  if (!def) return null;

  return (
    <Card
      sx={{
        bgcolor: surface(theme.palette.mode, selected ? 2 : 1),
        outline: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
        outlineOffset: -2,
        transition: 'background-color .2s',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', pl: 0.5, pr: 0.5, py: 0.5, gap: 0.25 }}>
        <Tooltip title={layer.enabled ? '非表示にする' : '表示する'}>
          <IconButton size="small" onClick={() => toggleLayer(layer.uid)} aria-label="表示の切り替え">
            {layer.enabled ? <VisibilityRounded fontSize="small" /> : <VisibilityOffRounded fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Box
          role="button"
          tabIndex={0}
          aria-expanded={selected}
          onClick={() => select(selected ? null : layer.uid)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              select(selected ? null : layer.uid);
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            py: 0.75,
            borderRadius: '8px',
            opacity: layer.enabled ? 1 : 0.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {def.name}
          </Typography>
          {layer.opacity < 1 && (
            <Typography variant="caption" color="text.secondary">
              {Math.round(layer.opacity * 100)}%
            </Typography>
          )}
          <ExpandMoreRounded
            fontSize="small"
            sx={{ color: 'text.secondary', transform: selected ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
          />
        </Box>
        <Tooltip title="上へ（後からかける）">
          <span>
            <IconButton size="small" disabled={!canMoveUp} onClick={() => moveLayer(layer.uid, 1)} aria-label="上へ">
              <KeyboardArrowUpRounded fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="下へ（先にかける）">
          <span>
            <IconButton size="small" disabled={!canMoveDown} onClick={() => moveLayer(layer.uid, -1)} aria-label="下へ">
              <KeyboardArrowDownRounded fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="その他の操作">
          <MoreVertRounded fontSize="small" />
        </IconButton>
        <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
          <MenuItem
            onClick={() => {
              duplicateLayer(layer.uid);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <ContentCopyRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>複製</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              resetParams(layer.uid);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <RestartAltRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>初期値に戻す</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              removeLayer(layer.uid);
              setMenuAnchor(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlineRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>削除</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      <Collapse in={selected} unmountOnExit>
        <Box sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Stack spacing={1.75}>
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
            <TextField
              select
              size="small"
              label="重ね方"
              value={layer.blendMode}
              onChange={(e) => {
                group(`${layer.uid}:blend`);
                setBlendMode(layer.uid, e.target.value as BlendMode);
              }}
            >
              {Object.entries(BLEND_MODE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <ParamEditor uid={layer.uid} schema={def.params} params={layer.params} />
        </Box>
      </Collapse>
    </Card>
  );
}
