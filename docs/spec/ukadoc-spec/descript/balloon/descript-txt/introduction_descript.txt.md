# descript.txt（Balloonの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

バルーンディレクトリ内の `descript.txt` 読み込みおよびキー・値のパース処理は、Rust バックエンド `src-tauri/src/commands/shell/balloon.rs` の `balloon_descript_map()` 関数および Tauri IPC コマンド `balloon_manifest()` において Shift_JIS/UTF-8 エンコーディングを自動判別してマップ構造化され、フロントエンド `ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` 経由で各スタイルへ適用される実装が確立されている。

## 実装箇所

- `crates/nanai-core/src/balloon_descript.rs:1` `//! バルーン descript.txt プロパティ検証 & 推薦ゴースト判定エンジン (UKADOC / SSP 準拠)`
- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `ui/ts/core/config.ts:22` `descriptTxt: "descript.txt",`
- `ui/ts/ui/submenu-theme.ts:3` `* @brief シェルの descript.txt 由来のカスタムメニュー配色・背景ビットマップテーマ適用および画像プリロードモジュール`
- `crates/nanai-core/src/descript_parser/mod.rs:1` `//! descript.txt (UKADOC / SSP 仕様準拠) 高速パーサー & プロパティ辞書エンジン`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
