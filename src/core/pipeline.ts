import type { Layer } from './types';
import { getEffect } from '../effects';
import { cloneCanvas, get2d } from './canvas';
import { createRng } from './rng';
import { sanitizeParams } from './params';

function applyLayer(current: HTMLCanvasElement, layer: Layer, index: number, unit: number): HTMLCanvasElement {
  const def = getEffect(layer.effectId);
  if (!def || !layer.enabled || layer.opacity <= 0) return current;
  const params = sanitizeParams(def, layer.params);
  const seed = typeof params.seed === 'number' ? params.seed : index + 1;
  const result = def.render(current, params, {
    width: current.width,
    height: current.height,
    unit,
    rng: createRng(seed),
  });

  if (layer.opacity >= 1 && layer.blendMode === 'source-over') return result;
  const merged = cloneCanvas(current);
  const ctx = get2d(merged);
  ctx.globalAlpha = layer.opacity;
  ctx.globalCompositeOperation = layer.blendMode;
  ctx.drawImage(result, 0, 0);
  return merged;
}

/**
 * レイヤー（エフェクト）を配列の先頭から順に適用する。
 * 各レイヤーは直前までの結果を入力として受け取り、結果を不透明度・合成モードで重ねる。
 */
export function renderStack(source: HTMLCanvasElement, layers: Layer[]): HTMLCanvasElement {
  const unit = Math.min(source.width, source.height) / 1000;
  return layers.reduce((cur, layer, i) => applyLayer(cur, layer, i, unit), source);
}

function layerKey(layer: Layer, index: number): string {
  return JSON.stringify([index, layer.effectId, layer.params, layer.enabled, layer.opacity, layer.blendMode]);
}

/**
 * プレビュー用のキャッシュ付きレンダラー。
 * 途中までのレイヤー構成が前回と同じなら、その時点の結果を再利用して変更のあった層以降だけを再計算する。
 */
export function createCachedRenderer() {
  let lastSource: HTMLCanvasElement | null = null;
  let cache: { key: string; result: HTMLCanvasElement }[] = [];

  return (source: HTMLCanvasElement, layers: Layer[]): HTMLCanvasElement => {
    if (source !== lastSource) {
      cache = [];
      lastSource = source;
    }
    const unit = Math.min(source.width, source.height) / 1000;
    let current = source;
    const next: typeof cache = [];
    let reuse = true;
    layers.forEach((layer, i) => {
      const key = layerKey(layer, i);
      if (reuse && cache[i]?.key === key) {
        current = cache[i].result;
      } else {
        reuse = false;
        current = applyLayer(current, layer, i, unit);
      }
      next.push({ key, result: current });
    });
    cache = next;
    return current;
  };
}
