# メニュー画像対応および SSP オーナードローメニュー規格適合計画

本計画は、伺か（UKAGAKA）および SSP のシェル仕様（`menu.background.bitmap`, `menu.sidebar.bitmap`, `menu.foreground.bitmap` 等）に基づくカスタム背景画像・サイドバー画像のメニュー適用機能を強化し、SSPのビジュアル規格への完全適合を図るとともに、その仕様を公式文書として体系化するものである。

## User Review Required

- **ビジュアル互換性**: シェルごとに指定された背景ビットマップやサイドバービットマップを、独立 iframe メニュー（`menu-iframe.html` / `submenu.js`）の背景およびサイド領域にCSS背景画像（`url(...)`）として動的レンダリングする。
- **仕様の文書化**: SSP オーナードローメニューのビットマップ定義に関する仕様書を新規文書ファイル（`docs/spec/ukadoc-ssp/functions/menu-bitmap.md`）として正式に作成する。
- **フォールバック**: 画像が存在しない場合や未指定の場合は、従来のエレガントなCSSカスタムプロパティ（ダーク/アイボリー等のカラーテーマ）へ自動フォールバックする。

## Open Questions

- 特になし。既存の Rust `shell_manifest` 解析結果 (`menu_theme`) とフロントエンドの `applyShellMenuTheme` をフル活用して安全に実現する。

## Proposed Changes

### [NEW] メニュー画像仕様の文書化
#### [NEW] [menu-bitmap.md](file:///E:/project/rust/nanai-android-mascot/docs/spec/ukadoc-ssp/functions/menu-bitmap.md)
- シェルの `descript.txt` で定義される `menu.background.bitmap`、`menu.sidebar.bitmap`、`menu.foreground.bitmap` の仕様定義、およびオーナードローメニューへの適用規則を文書化。

### メニューレンダリング & スタイル拡張
#### [MODIFY] [menu.css](file:///E:/project/rust/nanai-android-mascot/ui/css/menu.css)
- シェル指定の背景ビットマップ (`--menu-bg-image`)、サイドバービットマップ (`--menu-sidebar-image`)、前景ビットマップ (`--menu-fg-image`) の背景プロパティを正式定義。
- サイドバー表示用クラス `.has-sidebar` のレイアウト調整。

#### [MODIFY] [submenu.js](file:///E:/project/rust/nanai-android-mascot/ui/js/ui/submenu.js) / [menu-submenu-renderer.js](file:///E:/project/rust/nanai-android-mascot/ui/js/ui/menu-submenu-renderer.js)
- シェルの絶対パスと相対ビットマップファイル名から `convertFileSrc` を用いた Tauri 安全URLへの変換処理の厳密化。

## Verification Plan

### Automated Tests
- `cargo check` による Rust バックエンドのコンパイル確認。
- CSS / JS 構文解析・インスペクションチェック。

### Manual Verification
- `VitreumRisum` や `とらふぃっく☆とれいん` などのメニュー背景ビットマップを持つシェルでメニューを開き、カスタム画像背景・サイドバーが正常に描画されることを目視確認。
