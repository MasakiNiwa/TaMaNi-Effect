import type { Layer } from '../core/types';
import { renderStack } from '../core/pipeline';
import { drawSourceFitted } from '../core/canvas';
import type { ExportFormat } from '../store/settingsStore';

const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
};

export interface ExportOptions {
  format: ExportFormat;
  quality: number;
  maxSize: number;
}

export async function renderForExport(source: HTMLCanvasElement, layers: Layer[], opts: ExportOptions): Promise<Blob> {
  const base =
    opts.maxSize > 0 ? drawSourceFitted(source, source.width, source.height, opts.maxSize) : source;
  let out = renderStack(base, layers);
  if (opts.format === 'jpeg') {
    // JPEG は透明を扱えないので白で下塗りする
    const flat = drawSourceFitted(out, out.width, out.height, Infinity);
    const ctx = flat.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, flat.width, flat.height);
    out = flat;
  }
  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('画像の書き出しに失敗しました'))),
      MIME[opts.format],
      opts.quality,
    );
  });
}

export function extensionOf(format: ExportFormat): string {
  return format === 'jpeg' ? 'jpg' : format;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Web Share API（主にスマホ）でファイルを共有できるか */
export function canShareFile(file: File): boolean {
  return typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });
}
