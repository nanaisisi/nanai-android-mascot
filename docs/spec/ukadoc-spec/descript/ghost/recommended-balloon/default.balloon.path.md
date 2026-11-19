# default.balloon.path,パス

- **規格**: [default.balloon.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/default.balloon.path.md)
- **検索語**: default.balloon.path
- **対応状況**: ✅ 実装済

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` 等においてゴーストの `descript.txt` 内の `default.balloon.path` キーをパースし、`GhostInfo.default_balloon_path` へ格納・利用する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs` (`default.balloon.path`)
- `src-tauri/src/common/models.rs` (`default_balloon_path`)
- `src-tauri/src/ghost/scan/directory/manifest.rs` (`default.balloon.path`)
