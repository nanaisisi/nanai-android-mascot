# 標準と推奨の使い分け

- **規格**: [caption_recommended.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/caption_recommended.md)
- **検索語**: 標準と推奨の使い分け
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` および `ui/js/ghost/ghost.js` において、`recommended.balloon`（推奨）と `balloon`（標準/旧互換）およびそれぞれのパス指定 (`recommended.balloon.path`, `default.balloon.path`) の優先度（推奨最優先、標準フォールバック）を考慮した判別・切り替えロジックが実装されている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [標準と推奨の使い分け], [recommended.balloon.path,パス]:`
- `ui/js/ghost/ghost.js` `// [balloon,バルーン名], [recommended.balloon,バルーン名], [標準と推奨の使い分け]...`
