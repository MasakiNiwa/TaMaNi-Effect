import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface Settings {
  themeMode: ThemeMode;
  /** プレビューの長辺の最大ピクセル数 */
  previewMaxSize: number;
  exportFormat: ExportFormat;
  /** JPEG / WebP の品質（0.5〜1） */
  exportQuality: number;
  /** 書き出しの長辺の最大ピクセル数（0 = 元のサイズ） */
  exportMaxSize: number;
  /** エフェクトの構成を次回起動時まで記憶する */
  rememberLayers: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  previewMaxSize: 1200,
  exportFormat: 'png',
  exportQuality: 0.92,
  exportMaxSize: 0,
  rememberLayers: true,
};

interface SettingsState extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (key, value) => set({ [key]: value } as Partial<Settings>),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    { name: 'tamani-effect:settings', version: 1 },
  ),
);
