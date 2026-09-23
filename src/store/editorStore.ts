import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlendMode, Layer, ParamValue } from '../core/types';
import { getEffect } from '../effects';
import { defaultParams, sanitizeParams } from '../core/params';
import { useSettings } from './settingsStore';

export interface SourceImage {
  name: string;
  /** 原寸（ただしブラウザの上限に収まるよう縮小済み）の画像 */
  canvas: HTMLCanvasElement;
}

const HISTORY_LIMIT = 50;

interface EditorState {
  image: SourceImage | null;
  layers: Layer[];
  selectedUid: string | null;
  past: Layer[][];
  future: Layer[][];

  setImage: (image: SourceImage | null) => void;
  select: (uid: string | null) => void;
  /** 現在の状態を元に戻す履歴に積む（スライダー操作の開始時などに呼ぶ） */
  checkpoint: () => void;
  undo: () => void;
  redo: () => void;

  addLayer: (effectId: string) => void;
  removeLayer: (uid: string) => void;
  duplicateLayer: (uid: string) => void;
  /** 配列内で位置を移動する（+1 = 後から適用＝上へ） */
  moveLayer: (uid: string, delta: number) => void;
  toggleLayer: (uid: string) => void;
  clearLayers: () => void;

  /** 以下は履歴を積まない（呼び出し側で checkpoint する） */
  setParam: (uid: string, key: string, value: ParamValue) => void;
  setOpacity: (uid: string, opacity: number) => void;
  setBlendMode: (uid: string, mode: BlendMode) => void;
  resetParams: (uid: string) => void;
}

const newUid = () => Math.random().toString(36).slice(2, 10);

const mapLayer = (layers: Layer[], uid: string, fn: (l: Layer) => Layer) =>
  layers.map((l) => (l.uid === uid ? fn(l) : l));

export const useEditor = create<EditorState>()(
  persist(
    (set, get) => {
      /** 履歴付きでレイヤーを更新する */
      const commit = (layers: Layer[], extra: Partial<EditorState> = {}) =>
        set((s) => ({
          past: [...s.past, s.layers].slice(-HISTORY_LIMIT),
          future: [],
          layers,
          ...extra,
        }));

      return {
        image: null,
        layers: [],
        selectedUid: null,
        past: [],
        future: [],

        setImage: (image) => set({ image }),
        select: (uid) => set({ selectedUid: uid }),
        checkpoint: () => set((s) => ({ past: [...s.past, s.layers].slice(-HISTORY_LIMIT), future: [] })),
        undo: () =>
          set((s) => {
            const prev = s.past[s.past.length - 1];
            if (!prev) return s;
            return { layers: prev, past: s.past.slice(0, -1), future: [s.layers, ...s.future] };
          }),
        redo: () =>
          set((s) => {
            const next = s.future[0];
            if (!next) return s;
            return { layers: next, past: [...s.past, s.layers], future: s.future.slice(1) };
          }),

        addLayer: (effectId) => {
          const def = getEffect(effectId);
          if (!def) return;
          const layer: Layer = {
            uid: newUid(),
            effectId,
            params: defaultParams(def),
            enabled: true,
            opacity: 1,
            blendMode: 'source-over',
          };
          commit([...get().layers, layer], { selectedUid: layer.uid });
        },
        removeLayer: (uid) => {
          const { layers, selectedUid } = get();
          commit(
            layers.filter((l) => l.uid !== uid),
            { selectedUid: selectedUid === uid ? null : selectedUid },
          );
        },
        duplicateLayer: (uid) => {
          const layers = get().layers;
          const idx = layers.findIndex((l) => l.uid === uid);
          if (idx < 0) return;
          const copy = { ...layers[idx], uid: newUid(), params: { ...layers[idx].params } };
          commit([...layers.slice(0, idx + 1), copy, ...layers.slice(idx + 1)], { selectedUid: copy.uid });
        },
        moveLayer: (uid, delta) => {
          const layers = [...get().layers];
          const idx = layers.findIndex((l) => l.uid === uid);
          const to = idx + delta;
          if (idx < 0 || to < 0 || to >= layers.length) return;
          const [l] = layers.splice(idx, 1);
          layers.splice(to, 0, l);
          commit(layers);
        },
        toggleLayer: (uid) => commit(mapLayer(get().layers, uid, (l) => ({ ...l, enabled: !l.enabled }))),
        clearLayers: () => commit([], { selectedUid: null }),

        setParam: (uid, key, value) =>
          set((s) => ({ layers: mapLayer(s.layers, uid, (l) => ({ ...l, params: { ...l.params, [key]: value } })) })),
        setOpacity: (uid, opacity) => set((s) => ({ layers: mapLayer(s.layers, uid, (l) => ({ ...l, opacity })) })),
        setBlendMode: (uid, blendMode) =>
          set((s) => ({ layers: mapLayer(s.layers, uid, (l) => ({ ...l, blendMode })) })),
        resetParams: (uid) =>
          commit(
            mapLayer(get().layers, uid, (l) => {
              const def = getEffect(l.effectId);
              return def ? { ...l, params: defaultParams(def), opacity: 1, blendMode: 'source-over' } : l;
            }),
          ),
      };
    },
    {
      name: 'tamani-effect:editor',
      version: 1,
      // 画像そのものは保存しない（容量とプライバシーのため）。エフェクト構成だけを記憶する
      partialize: (s) => ({ layers: s.layers }),
      merge: (persisted, current) => {
        if (!useSettings.getState().rememberLayers) return current;
        const saved = (persisted as { layers?: Layer[] } | undefined)?.layers ?? [];
        const layers = saved.flatMap((l) => {
          const def = getEffect(l.effectId);
          if (!def) return [];
          return [
            {
              uid: typeof l.uid === 'string' ? l.uid : newUid(),
              effectId: l.effectId,
              params: sanitizeParams(def, l.params),
              enabled: l.enabled !== false,
              opacity: typeof l.opacity === 'number' ? Math.min(1, Math.max(0, l.opacity)) : 1,
              blendMode: l.blendMode ?? 'source-over',
            },
          ];
        });
        return { ...current, layers };
      },
    },
  ),
);
