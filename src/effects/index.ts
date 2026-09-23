import type { EffectCategory, EffectDefinition } from '../core/types';

/**
 * defs/ 以下のファイルを自動で読み込んでエフェクトとして登録する。
 * 新しいエフェクトを追加するときは defs/ に 1 ファイル追加するだけでよい。
 */
const modules = import.meta.glob<EffectDefinition>('./defs/*.ts', { eager: true, import: 'default' });

const CATEGORY_ORDER: EffectCategory[] = ['pattern', 'distort', 'overlay', 'color'];

export const effects: EffectDefinition[] = Object.values(modules).sort(
  (a, b) =>
    CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
    (a.order ?? 100) - (b.order ?? 100) ||
    a.id.localeCompare(b.id),
);

const byId = new Map(effects.map((e) => [e.id, e]));

export function getEffect(id: string): EffectDefinition | undefined {
  return byId.get(id);
}
