import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Box, IconButton } from '@mui/material';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';

interface Props {
  children: ReactNode;
  /** 項目間の余白（theme.spacing 単位） */
  gap?: number;
  /** 左右の余白（theme.spacing 単位） */
  px?: number;
  /** スクロール位置インジケーターを表示する */
  indicator?: boolean;
  /** 中身が収まるときは中央寄せにする */
  center?: boolean;
  ariaLabel?: string;
}

const FADE = 36;

/**
 * 左右にスワイプして移動できる横並びの行。
 * 続きがある側の端をフェードさせ、下に位置インジケーター、マウス環境では矢印ボタンを表示して
 * 「横に動かせる」ことがわかるようにする。
 */
export default function ScrollRow({ children, gap = 1, px = 2, indicator = true, center = false, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState({ atStart: true, atEnd: true, ratio: 0, thumb: 1 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = {
      atStart: el.scrollLeft <= 2,
      atEnd: el.scrollLeft >= max - 2,
      ratio: max > 0 ? el.scrollLeft / max : 0,
      thumb: el.scrollWidth > 0 ? el.clientWidth / el.scrollWidth : 1,
    };
    // 値が変わらないときは再描画しない
    setS((prev) =>
      prev.atStart === next.atStart && prev.atEnd === next.atEnd && prev.ratio === next.ratio && prev.thumb === next.thumb
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    for (const child of el.children) ro.observe(child);
    return () => ro.disconnect();
  }, [update, children]);

  const scrollable = !(s.atStart && s.atEnd);
  const by = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.7, behavior: 'smooth' });
  const mask = `linear-gradient(to right, transparent 0, #000 ${s.atStart ? 0 : FADE}px, #000 calc(100% - ${s.atEnd ? 0 : FADE}px), transparent 100%)`;

  const arrow = (dir: -1 | 1) => (
    <IconButton
      size="small"
      aria-label={dir < 0 ? '左へ' : '右へ'}
      onClick={() => by(dir)}
      sx={{
        display: 'none',
        '@media (hover: hover) and (pointer: fine)': {
          display: (dir < 0 ? s.atStart : s.atEnd) ? 'none' : 'inline-flex',
        },
        position: 'absolute',
        top: '50%',
        [dir < 0 ? 'left' : 'right']: 2,
        transform: `translateY(-${indicator ? 'calc(50% + 5px)' : '50%'})`,
        zIndex: 1,
        bgcolor: 'background.paper',
        boxShadow: 2,
        '&:hover': { bgcolor: 'background.paper' },
      }}
    >
      {dir < 0 ? <ChevronLeftRounded /> : <ChevronRightRounded />}
    </IconButton>
  );

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      {arrow(-1)}
      <Box
        ref={ref}
        onScroll={update}
        role="list"
        aria-label={ariaLabel}
        sx={{
          display: 'flex',
          gap,
          px,
          overflowX: 'auto',
          overscrollBehaviorX: 'contain',
          scrollSnapType: 'x proximity',
          scrollPaddingInline: (t) => t.spacing(px),
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          WebkitMaskImage: mask,
          maskImage: mask,
          '& > *': { flexShrink: 0, scrollSnapAlign: 'start' },
          // 収まるときだけ中央寄せ（はみ出すときに先頭が隠れないよう margin auto を使う）
          ...(center && { '& > :first-of-type': { ml: 'auto' }, '& > :last-of-type': { mr: 'auto' } }),
        }}
      >
        {children}
      </Box>
      {arrow(1)}
      {indicator && (
        <Box
          aria-hidden
          sx={{
            mx: 'auto',
            mt: 0.75,
            width: 48,
            height: 4,
            borderRadius: 2,
            bgcolor: 'action.selected',
            overflow: 'hidden',
            visibility: scrollable ? 'visible' : 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${Math.max(0.2, s.thumb) * 100}%`,
              borderRadius: 2,
              bgcolor: 'primary.main',
              transform: `translateX(${s.ratio * (1 / Math.max(0.2, s.thumb) - 1) * 100}%)`,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
