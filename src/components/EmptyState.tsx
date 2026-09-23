import { Box, Button, Card, Stack, Typography } from '@mui/material';
import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import LockRounded from '@mui/icons-material/LockRounded';
import { useTheme } from '@mui/material/styles';
import { surface } from '../theme';
import Logo from './Logo';

interface Props {
  onOpen: () => void;
  onSample: () => void;
  dragging: boolean;
}

export default function EmptyState({ onOpen, onSample, dragging }: Props) {
  const theme = useTheme();
  return (
    <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', p: 2 }}>
      <Card
        sx={{
          width: '100%',
          maxWidth: 560,
          p: { xs: 3, sm: 5 },
          textAlign: 'center',
          bgcolor: surface(theme.palette.mode, 1),
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'transparent',
          transition: 'border-color .2s',
        }}
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Logo size={72} />
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: 24, sm: 28 }, mb: 1 }}>
              イラストにエフェクトを
            </Typography>
            <Typography color="text.secondary">
              水玉・縞模様・グリッチ・集中線など、
              <Box component="br" sx={{ display: { sm: 'none' } }} />
              いろいろなエフェクトを重ねて楽しめます。
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="contained" size="large" startIcon={<AddPhotoAlternateRounded />} onClick={onOpen}>
              画像を選ぶ
            </Button>
            <Button variant="outlined" size="large" startIcon={<AutoAwesomeRounded />} onClick={onSample}>
              サンプルで試す
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {dragging ? 'ここにドロップして読み込み' : 'ドラッグ＆ドロップや貼り付け（Ctrl+V）でも読み込めます'}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <LockRounded sx={{ fontSize: 16 }} />
            <Typography variant="caption">画像はブラウザの中だけで処理され、どこにも送信されません</Typography>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
