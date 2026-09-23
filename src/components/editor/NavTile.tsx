import type { ReactNode } from 'react';
import { Badge, Box, ButtonBase, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { surface } from '../../theme';

interface Props {
  label: string;
  onClick: () => void;
  /** アイコン（丸い背景に表示） */
  icon?: ReactNode;
  /** サムネイル画像（角丸の四角で表示） */
  image?: string;
  /** かかっている数などのバッジ */
  badge?: number;
  active?: boolean;
}

/** 下部ナビゲーションの 1 項目 */
export default function NavTile({ label, onClick, icon, image, badge = 0, active = false }: Props) {
  const theme = useTheme();
  return (
    <ButtonBase
      role="listitem"
      onClick={onClick}
      sx={{
        width: 76,
        py: 0.5,
        borderRadius: '16px',
        flexDirection: 'column',
        gap: 0.75,
        '&:active .tile-visual': { transform: 'scale(.94)' },
      }}
    >
      <Badge badgeContent={badge} color="primary" overlap="circular" invisible={badge === 0}>
        <Box
          className="tile-visual"
          sx={{
            width: image !== undefined ? 60 : 52,
            height: image !== undefined ? 60 : 52,
            borderRadius: image !== undefined ? '18px' : '50%',
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            bgcolor: active ? 'primary.main' : surface(theme.palette.mode, 2),
            color: active ? 'primary.contrastText' : 'text.primary',
            outline: badge > 0 ? `2px solid ${theme.palette.primary.main}` : 'none',
            outlineOffset: 2,
            transition: 'transform .12s',
            '& svg': { fontSize: 26 },
          }}
        >
          {image !== undefined ? (
            image ? (
              <Box component="img" src={image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : null
          ) : (
            icon
          )}
        </Box>
      </Badge>
      <Typography
        variant="caption"
        sx={{ fontWeight: 500, lineHeight: 1.2, width: '100%', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
}
