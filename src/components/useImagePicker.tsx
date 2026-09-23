import { useCallback, useEffect, useRef, useState } from 'react';
import { ACCEPTED_TYPES, loadImageFile } from '../lib/image';
import { createSampleImage } from '../lib/sample';
import { useEditor } from '../store/editorStore';

/**
 * 画像の読み込み（ファイル選択・ドラッグ＆ドロップ・貼り付け・サンプル）をまとめたフック。
 */
export function useImagePicker() {
  const setImage = useEditor((s) => s.setImage);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const loadFile = useCallback(
    async (file: File | Blob, name = file instanceof File ? file.name : 'image.png') => {
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選んでください');
        return;
      }
      setLoading(true);
      try {
        const canvas = await loadImageFile(file);
        setImage({ name, canvas });
      } catch {
        setError('画像を読み込めませんでした。別の形式（PNG / JPEG など）でお試しください');
      } finally {
        setLoading(false);
      }
    },
    [setImage],
  );

  const loadSample = useCallback(() => setImage({ name: 'sample.png', canvas: createSampleImage(1200) }), [setImage]);

  const open = useCallback(() => inputRef.current?.click(), []);

  // 貼り付け（Ctrl+V / ⌘V）
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) {
        e.preventDefault();
        void loadFile(file, 'pasted.png');
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  // ページ全体へのドラッグ＆ドロップ
  useEffect(() => {
    let depth = 0;
    const hasFiles = (e: DragEvent) => [...(e.dataTransfer?.types ?? [])].includes('Files');
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth++;
      setDragging(true);
    };
    const onLeave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);
      const file = e.dataTransfer?.files[0];
      if (file) void loadFile(file);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [loadFile]);

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_TYPES}
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void loadFile(file);
        e.target.value = '';
      }}
    />
  );

  return { open, input, loadSample, error, clearError: () => setError(null), loading, dragging };
}
