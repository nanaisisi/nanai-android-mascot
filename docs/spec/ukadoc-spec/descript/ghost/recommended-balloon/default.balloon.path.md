# default.balloon.path,パス

- **規格**: [default.balloon.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/default.balloon.path.md)
- **検索語**: default.balloon.path
- **対応状況**: ✅ 対応済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `default.balloon.path` キーをパースし、`GhostInfo.default_balloon_path` へ格納・利用する実装が行われている。

## 実装箇所

- `src-tauri/src/ghost/scan/directory.rs` `// [default.balloon.path,パス]:`
- `ui/js/ghost/ghost.js` `// [balloon,バルーン名]... [default.balloon.path,パス]:`
