import { describe, expect, it } from 'vitest';
import { createRng } from './rng';
import { defaultParams, sanitizeParams } from './params';
import { effects, getEffect } from '../effects';

describe('createRng', () => {
  it('同じシードなら同じ列を返す', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    expect(seqA.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('シードが違えば違う列になる', () => {
    expect(createRng(1)()).not.toBe(createRng(2)());
  });
});

describe('effect registry', () => {
  it('エフェクトが登録されている', () => {
    expect(effects.length).toBeGreaterThan(0);
    expect(getEffect('dots')?.name).toBe('水玉点描');
  });

  it('ID が重複していない', () => {
    const ids = effects.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(effects.map((e) => [e.id, e] as const))('%s: スキーマが妥当', (_, def) => {
    const keys = def.params.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const p of def.params) {
      if (p.type === 'range') {
        expect(p.min).toBeLessThan(p.max);
        expect(p.default).toBeGreaterThanOrEqual(p.min);
        expect(p.default).toBeLessThanOrEqual(p.max);
      }
      if (p.type === 'select') expect(p.options.some((o) => o.value === p.default)).toBe(true);
      if (p.type === 'color') expect(p.default).toMatch(/^#[0-9a-f]{6}$/i);
    }
    // 初期値はそのまま sanitize を通る
    expect(sanitizeParams(def, defaultParams(def))).toEqual(defaultParams(def));
  });
});

describe('sanitizeParams', () => {
  const def = getEffect('dots')!;

  it('範囲外の値を丸め、未知の値を初期値に戻す', () => {
    const out = sanitizeParams(def, { spacing: 99999, mode: 'unknown', ink: 'red', removed: 1 });
    expect(out.spacing).toBe(80);
    expect(out.mode).toBe('halftone');
    expect(out.ink).toBe('#222222');
    expect(out).not.toHaveProperty('removed');
  });

  it('欠けているパラメータを初期値で補う', () => {
    expect(sanitizeParams(def, {})).toEqual(defaultParams(def));
  });
});
