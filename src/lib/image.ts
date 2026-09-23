import { createCanvas, get2d } from '../core/canvas';

/** iOS Safari のキャンバス面積上限（約 16.7M ピクセル）に余裕を持たせた値 */
const MAX_PIXELS = 16_000_000;

export const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif';

export async function loadImageFile(file: Blob): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return imageToCanvas(img, img.naturalWidth, img.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function imageToCanvas(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)));
  const canvas = createCanvas(width * scale, height * scale);
  const ctx = get2d(canvas);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** ファイル名から拡張子を除いた部分 */
export function baseName(name: string): string {
  return name.replace(/\.[^.]+$/, '') || 'image';
}
