import {
  Box,
  Button,
  ButtonBase,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DragIndicatorRounded from '@mui/icons-material/DragIndicatorRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { BLEND_MODE_LABELS, type Layer } from '../../core/types';
import { getEffect } from '../../effects';
import { useEditor } from '../../store/editorStore';
import { useNav } from '../../store/navStore';
import { surface } from '../../theme';

function LayerRow({ layer, onOpen }: { layer: Layer; onOpen: () => void }) {
  const theme = useTheme();
  const def = getEffect(layer.effectId);
  const { toggleLayer, removeLayer } = useEditor.getState();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.uid,
  });
  if (!def) return null;

  const details = [
    layer.opacity < 1 && `強さ ${Math.round(layer.opacity * 100)}%`,
    layer.blendMode !== 'source-over' && BLEND_MODE_LABELS[layer.blendMode],
  ].filter(Boolean);

  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      sx={{
        alignItems: 'center',
        gap: 0.5,
        pr: 0.5,
        borderRadius: '16px',
        bgcolor: surface(theme.palette.mode, isDragging ? 3 : 2),
        boxShadow: isDragging ? 6 : 0,
        position: 'relative',
        zIndex: isDragging ? 1 : 0,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <IconButton
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="ドラッグして並べ替え"
        sx={{ cursor: 'grab', touchAction: 'none', color: 'text.secondary' }}
      >
        <DragIndicatorRounded />
      </IconButton>
      <ButtonBase
        onClick={onOpen}
        sx={{ flex: 1, minWidth: 0, justifyContent: 'flex-start', textAlign: 'left', py: 1.25, borderRadius: '12px' }}
      >
        <Box sx={{ minWidth: 0, flex: 1, opacity: layer.enabled ? 1 : 0.45 }}>
          <Typography sx={{ fontWeight: 700 }} noWrap>
            {def.name}
          </Typography>
          {details.length > 0 && (
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {details.join('・')}
            </Typography>
          )}
        </Box>
        <ChevronRightRounded sx={{ color: 'text.secondary' }} />
      </ButtonBase>
      <Tooltip title={layer.enabled ? '一時的に隠す' : '表示する'}>
        <IconButton onClick={() => toggleLayer(layer.uid)} aria-label="表示の切り替え">
          {layer.enabled ? <VisibilityRounded /> : <VisibilityOffRounded />}
        </IconButton>
      </Tooltip>
      <Tooltip title="外す">
        <IconButton onClick={() => removeLayer(layer.uid)} aria-label="削除">
          <DeleteOutlineRounded />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/**
 * 重ねたエフェクトの一覧。並べ替え・表示切替・削除ができ、
 * 項目をタップするとそのエフェクトの操作パネルに移動する。
 */
export default function LayerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const layers = useEditor((s) => s.layers);
  const { reorderLayers, clearLayers } = useEditor.getState();
  const editLayer = useNav((s) => s.editLayer);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // 表示は「上にあるほど後からかかる」順
  const displayed = [...layers].reverse();
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = displayed.map((l) => l.uid);
    const moved = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    reorderLayers(moved.reverse());
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            maxHeight: '75dvh',
            maxWidth: 640,
            mx: 'auto',
            pb: 'env(safe-area-inset-bottom)',
          },
        },
      }}
    >
      <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'action.disabled', mx: 'auto', mt: 1.5 }} />
      <Stack direction="row" sx={{ alignItems: 'center', px: 2.5, pt: 1.5, pb: 0.5 }}>
        <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
          重ねたエフェクト
          <Typography component="span" color="text.secondary" sx={{ ml: 1, fontWeight: 500 }}>
            {layers.length}
          </Typography>
        </Typography>
        {layers.length > 0 && (
          <Button size="small" color="inherit" onClick={clearLayers} sx={{ color: 'text.secondary' }}>
            すべて外す
          </Button>
        )}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ px: 2.5, pb: 1.5 }}>
        上にあるほど後からかかります。⠿ をドラッグして並べ替え、タップで調整できます。
      </Typography>
      <Box sx={{ overflowY: 'auto', px: 2, pb: 2 }}>
        {layers.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            まだエフェクトがかかっていません
          </Typography>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={displayed.map((l) => l.uid)} strategy={verticalListSortingStrategy}>
              <Stack sx={{ gap: 1 }}>
                {displayed.map((layer) => (
                  <LayerRow
                    key={layer.uid}
                    layer={layer}
                    onOpen={() => {
                      editLayer(layer.uid);
                      onClose();
                    }}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        )}
      </Box>
    </Drawer>
  );
}
