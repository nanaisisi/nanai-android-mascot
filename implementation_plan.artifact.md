# バルーン descript-txt 詳細プロパティ完全適合計画

本計画は、`docs/spec/ukadoc/descript/balloon/descript-txt/` 配下で定義されるすべてのバルーン descript プロパティ群（アンカー詳細、コミュニケートボックス詳細、カーソル、フォント詳細スタイル等）を、フロントエンドの CSS 変数および DOM レンダリングシステムに完全に統合・適合させるためのものである。

## User Review Required

- **完全網羅 (`descript-txt/`)**:
  - `anchor.*`（リンク色、スタイル、訪問済みリンク状態）
  - `communicatebox.*`（幅、高さ、座標、フォント、背景色、プレースホルダー色）
  - `cursor.*`（選択肢カーソルの詳細スタイル）
  - `font.*`（太字、斜体、アウトライン、取り消し線、下線、影スタイル）
- **動的CSS連携**: `applyBalloonDescript()` および `balloon-window.css` を拡充し、スキンごとに異なる細かなビジュアルプロパティを完全再現する。

## Open Questions

- 特になし。すでにバックエンド側では `balloon_manifest` を通じてすべての descript プロパティが抽出されているため、フロントエンド側のバインドと CSS スタイリングの拡充に集中する。

## Proposed Changes

### [MODIFY] [app-actions.js](file:///E:/project/rust/nanai-android-mascot/ui/js/core/app-actions.js)
- `applyBalloonDescript()` 内に、アンカー詳細スタイル（`anchor.font.color`, `anchor.style`, `anchor.visited.*` 等）、コミュニケートボックス詳細設定（`communicatebox.*`）、カーソル詳細設定の CSS 変数バインドを網羅的に拡充。

### [MODIFY] [balloon-window.css](file:///E:/project/rust/nanai-android-mascot/ui/css/balloon-window.css)
- `--balloon-anchor-color`, `--balloon-anchor-visited-color`, `--balloon-cb-bg`, `--balloon-cb-color` などの新しい CSS 変数を定義し、`.balloon-anchor`, `.communicate-box` 等のスタイルに反映。

## Verification Plan

### Automated Tests
- `cargo check` による Rust バックエンドのコンパイル確認。
- JS / CSS 構文チェック。

### Manual Verification
- バルーンテーマ切替および詳細な descript.txt プロパティを持つスキンでの描画確認。
