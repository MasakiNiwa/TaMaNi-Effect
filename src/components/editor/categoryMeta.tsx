import type { ReactNode } from 'react';
import BlurOnRounded from '@mui/icons-material/BlurOnRounded';
import ElectricBoltRounded from '@mui/icons-material/ElectricBoltRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import PaletteRounded from '@mui/icons-material/PaletteRounded';
import type { EffectCategory } from '../../core/types';

/** 下部ナビゲーションで使うグループのアイコン */
export const CATEGORY_ICONS: Record<EffectCategory, ReactNode> = {
  pattern: <BlurOnRounded />,
  distort: <ElectricBoltRounded />,
  overlay: <AutoAwesomeRounded />,
  color: <PaletteRounded />,
};
