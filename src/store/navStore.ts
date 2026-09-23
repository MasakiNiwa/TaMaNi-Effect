import { create } from 'zustand';
import type { EffectCategory } from '../core/types';
import { getEffect } from '../effects';
import { useEditor } from './editorStore';

/**
 * エディタ下部ナビゲーションの状態（3 段構え）。
 *   groups  : 機能のグループ一覧
 *   effects : グループ内のエフェクト一覧
 *   edit    : エフェクトの操作パネル
 */
export type NavLevel =
  | { level: 'groups' }
  | { level: 'effects'; category: EffectCategory }
  | {
      level: 'edit';
      uid: string;
      category: EffectCategory;
      /** 編集開始時点の履歴の長さ（キャンセル時にここまで戻す） */
      basePast: number;
    };

interface NavState {
  nav: NavLevel;
  showGroups: () => void;
  showEffects: (category: EffectCategory) => void;
  /** エフェクトを選ぶ。すでにかかっていればそのレイヤーを、なければ新しく追加して編集する */
  pickEffect: (effectId: string) => void;
  /** 既存のレイヤーを編集する */
  editLayer: (uid: string) => void;
  /** 編集を確定して一覧に戻る */
  done: () => void;
  /** 編集を取り消して一覧に戻る */
  cancel: () => void;
}

export const useNav = create<NavState>()((set, get) => ({
  nav: { level: 'groups' },
  showGroups: () => set({ nav: { level: 'groups' } }),
  showEffects: (category) => set({ nav: { level: 'effects', category } }),

  pickEffect: (effectId) => {
    const def = getEffect(effectId);
    if (!def) return;
    const editor = useEditor.getState();
    const existing = [...editor.layers].reverse().find((l) => l.effectId === effectId);
    if (existing) {
      get().editLayer(existing.uid);
      return;
    }
    const basePast = editor.past.length;
    editor.addLayer(effectId);
    const uid = useEditor.getState().selectedUid;
    if (uid) set({ nav: { level: 'edit', uid, category: def.category, basePast } });
  },

  editLayer: (uid) => {
    const editor = useEditor.getState();
    const layer = editor.layers.find((l) => l.uid === uid);
    const def = layer && getEffect(layer.effectId);
    if (!def) return;
    editor.select(uid);
    set({ nav: { level: 'edit', uid, category: def.category, basePast: editor.past.length } });
  },

  done: () => {
    const { nav } = get();
    if (nav.level === 'edit') set({ nav: { level: 'effects', category: nav.category } });
  },

  cancel: () => {
    const { nav } = get();
    if (nav.level !== 'edit') return;
    useEditor.getState().revertTo(nav.basePast);
    set({ nav: { level: 'effects', category: nav.category } });
  },
}));
