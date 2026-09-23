import { useEffect, useState } from 'react';
import { drawSourceFitted } from '../../core/canvas';
import { defaultParams } from '../../core/params';
import { renderStack } from '../../core/pipeline';
import { getEffect } from '../../effects';

const SIZE = 128;
/** 画像ごとのサムネイルキャッシュ（画像が変わると自動で破棄される） */
const cache = new WeakMap<HTMLCanvasElement, Map<string, string>>();

/**
 * 読み込んだ画像に各エフェクトを初期値でかけたサムネイルを作る。
 * 画面が固まらないよう 1 フレームに 1 つずつ生成する。
 */
export function useEffectThumbnails(image: HTMLCanvasElement | null, effectIds: string[]): Record<string, string> {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const key = effectIds.join(',');

  useEffect(() => {
    if (!image) return;
    let map = cache.get(image);
    if (!map) {
      map = new Map();
      cache.set(image, map);
    }
    const store = map;
    setThumbs(Object.fromEntries(effectIds.flatMap((id) => (store.has(id) ? [[id, store.get(id)!]] : []))));

    const pending = effectIds.filter((id) => !store.has(id));
    if (pending.length === 0) return;
    const small = drawSourceFitted(image, image.width, image.height, SIZE);
    let raf = 0;
    const step = () => {
      const id = pending.shift();
      const def = id ? getEffect(id) : undefined;
      if (!id || !def) return;
      try {
        const out = renderStack(small, [
          { uid: 'thumb', effectId: id, params: defaultParams(def), enabled: true, opacity: 1, blendMode: 'source-over' },
        ]);
        store.set(id, out.toDataURL());
        setThumbs((t) => ({ ...t, [id]: store.get(id)! }));
      } catch (e) {
        console.error(e);
      }
      if (pending.length) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [image, key]);

  return thumbs;
}
