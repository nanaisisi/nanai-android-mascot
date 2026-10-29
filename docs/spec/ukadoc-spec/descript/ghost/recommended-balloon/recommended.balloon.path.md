# recommended.balloon.path,パス

- **規格**: [recommended.balloon.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.path.md)
- **検索語**: recommended.balloon.path
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `recommended.balloon.path` キーをパースし、`GhostInfo.recommended_balloon_path` へ格納・利用する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [標準と推奨の使い分け], [recommended.balloon.path,パス]:`
- `ui/js/ghost/ghost.js` `// [balloon,バルーン名]... [recommended.balloon.path,パス]:`
