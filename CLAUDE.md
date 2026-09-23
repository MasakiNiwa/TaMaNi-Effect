# CLAUDE.md

仕様・設計は `docs/SPEC.md` を参照。

- UI 文言は日本語
- エフェクトは `src/effects/defs/*.ts` に 1 ファイルで追加する（UI は自動生成）。サイズ系は `env.unit`、乱数は `env.rng` を使う
- 変更後は `npm test` と `npm run build` を通す
- リリース時は `package.json` の version と `CHANGELOG.md` を更新する
- 作業が完了したら、作業ブランチから PR を作成し、CI が通ったら `main` へマージする（オーナーの了承済み）。`main` へのマージで GitHub Pages に自動公開される
