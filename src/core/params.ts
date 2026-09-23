import type { EffectDefinition, ParamSchema, ParamValue, ParamValues } from './types';
import { clamp } from './canvas';

export function defaultParams(def: EffectDefinition): ParamValues {
  const out: ParamValues = {};
  for (const p of def.params) out[p.key] = p.default;
  return out;
}

function sanitizeValue(schema: ParamSchema, value: ParamValue | undefined): ParamValue {
  switch (schema.type) {
    case 'range': {
      const n = typeof value === 'number' && Number.isFinite(value) ? value : schema.default;
      return clamp(n, schema.min, schema.max);
    }
    case 'seed':
      return typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : schema.default;
    case 'select':
      return typeof value === 'string' && schema.options.some((o) => o.value === value)
        ? value
        : schema.default;
    case 'color':
      return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : schema.default;
    case 'boolean':
      return typeof value === 'boolean' ? value : schema.default;
  }
}

/**
 * 保存データ等から読み込んだパラメータをスキーマに合わせて補正する。
 * エフェクトにパラメータが追加・削除されても古い保存データを安全に読み込める。
 */
export function sanitizeParams(def: EffectDefinition, params: Partial<ParamValues> | undefined): ParamValues {
  const out: ParamValues = {};
  for (const p of def.params) out[p.key] = sanitizeValue(p, params?.[p.key]);
  return out;
}
