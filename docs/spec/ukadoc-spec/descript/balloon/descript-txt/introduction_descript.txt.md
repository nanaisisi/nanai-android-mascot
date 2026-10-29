# descript.txt（Balloonの）

- **規格**: [introduction_descript.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/balloon/) (ukadoc-spec/descript/balloon/descript-txt/introduction_descript.txt.md)
- **検索語**: descript.txt
- **対応状況**: ✅ 対応済

## 突合結果

バルーンディレクトリ内の `descript.txt` 読み込みおよびキー・値のパース処理は、Rust バックエンド `src-tauri/src/commands/shell/balloon.rs` の `balloon_descript_map()` 関数および Tauri IPC コマンド `balloon_manifest()` において Shift_JIS/UTF-8 エンコーディングを自動判別してマップ構造化され、フロントエンド `ui/js/ghost/balloon-window.js` の `applyBalloonDescript()` 経由で各スタイルへ適用される実装が確立されている。

## 実装箇所

- `src-tauri/src/commands/shell/balloon.rs` `balloon_descript_map(dir)`
- `src-tauri/src/commands/shell/balloon.rs` `pub fn balloon_manifest(`
- `ui/js/ghost/balloon-window.js` `applyBalloonDescript(theme)`
- `ui/js/core/actions/balloon-descript/` (`font.js`, `layout.js`, `assets.js`)
