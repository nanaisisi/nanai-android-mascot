# descript.txt（Balloonの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済

## 突合結果

バルーンディレクトリ内の `descript.txt` 読み込みおよびキー・値のパース処理は、Rust バックエンド `src-tauri/src/commands/shell/balloon.rs` の `balloon_descript_map()` 関数および Tauri IPC コマンド `balloon_manifest()` において Shift_JIS/UTF-8 エンコーディングを自動判別してマップ構造化され、フロントエンド `ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` 経由で各スタイルへ適用される実装が確立されている。

## 実装箇所

- `src-tauri/src/commands/ext.rs:30` `// [descript.txt（Pluginの）]: プラグイン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:31` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/ext.rs:89` `// [descript.txt（Headlineの）]: ヘッドライン descript.txt 読込`
- `src-tauri/src/commands/ext.rs:90` `let desc_path = path.join("descript.txt");`
- `src-tauri/src/commands/install/archive.rs:23` `} else if lower == "descript.txt" || lower.ends_with("/descript.txt") {`
