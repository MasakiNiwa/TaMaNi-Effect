import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import UndoRounded from '@mui/icons-material/UndoRounded';
import RedoRounded from '@mui/icons-material/RedoRounded';
import MoreVertRounded from '@mui/icons-material/MoreVertRounded';
import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import HelpOutlineRounded from '@mui/icons-material/HelpOutlineRounded';
import { useEditor } from '../../store/editorStore';
import { useNav } from '../../store/navStore';

interface Props {
  onChangeImage: () => void;
  onSave: () => void;
}

/** エディタ上部のバー：画像のクリア / 元に戻す / やり直し / 保存 */
export default function EditorTopBar({ onChangeImage, onSave }: Props) {
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const { undo, redo, setImage } = useEditor.getState();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Box
      component="header"
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        px: 1,
        pt: 'env(safe-area-inset-top)',
        minHeight: 56,
      }}
    >
      <Stack direction="row">
        <Tooltip title="画像をクリア">
          <IconButton onClick={() => setConfirmClear(true)} aria-label="画像をクリア">
            <CloseRounded />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" sx={{ gap: 0.5 }}>
        <Tooltip title="元に戻す">
          <span>
            <IconButton onClick={undo} disabled={!canUndo} aria-label="元に戻す">
              <UndoRounded />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="やり直し">
          <span>
            <IconButton onClick={redo} disabled={!canRedo} aria-label="やり直し">
              <RedoRounded />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
        <Button variant="contained" onClick={onSave} sx={{ px: 2.5 }}>
          保存
        </Button>
        <IconButton onClick={(e) => setMenu(e.currentTarget)} aria-label="メニュー">
          <MoreVertRounded />
        </IconButton>
        <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
          <MenuItem
            onClick={() => {
              setMenu(null);
              onChangeImage();
            }}
          >
            <ListItemIcon>
              <AddPhotoAlternateRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>画像を変更</ListItemText>
          </MenuItem>
          <MenuItem component={RouterLink} to="/settings">
            <ListItemIcon>
              <SettingsRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>設定</ListItemText>
          </MenuItem>
          <MenuItem component={RouterLink} to="/help">
            <ListItemIcon>
              <HelpOutlineRounded fontSize="small" />
            </ListItemIcon>
            <ListItemText>ヘルプ</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>画像をクリアしますか？</DialogTitle>
        <DialogContent>
          <DialogContentText>保存していない仕上がりは消えます。重ねたエフェクトの構成は残ります。</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setConfirmClear(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setConfirmClear(false);
              setImage(null);
              useNav.getState().showGroups();
            }}
          >
            クリア
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
