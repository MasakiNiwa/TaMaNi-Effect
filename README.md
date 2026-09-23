# たまにエフェクト

**たまに使うエフェクトツール**

イラストにエフェクトをかけるだけのブラウザツールです。
写真の画質を整える「レタッチ」ではなく、水玉・縞模様・グリッチ・集中線など、イラストをもっと楽しめるエフェクトに特化しています。

- スマホ・PC 両対応
- 複数のエフェクトを重ねがけ（順番・強さ・重ね方を調整可能）
- 画像はブラウザ内だけで処理（サーバーに送信しません）

👉 公開ページ: https://masakiniwa.github.io/TaMaNi-Effect/

## 収録エフェクト（v0.1.0）

| カテゴリ | エフェクト |
| --- | --- |
| パターン | 水玉点描 / 縦縞・横縞 |
| ゆがみ・ずれ | グリッチ / RGBずれ / ドット絵 |
| オーバーレイ | 集中線 / キラキラ / ノイズ / 周辺減光 |
| カラー | 2色カラー |

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm test           # テスト
npm run build      # 本番ビルド（dist/）
```

仕様・設計・今後の予定は [docs/SPEC.md](docs/SPEC.md) を参照してください。

## 公開（GitHub Pages）

`main` ブランチに push すると GitHub Actions がビルドして GitHub Pages に公開します。
初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## ライセンス

MIT
