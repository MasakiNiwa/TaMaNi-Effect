import { useRef } from 'react';
import { useEditor } from '../../store/editorStore';

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
