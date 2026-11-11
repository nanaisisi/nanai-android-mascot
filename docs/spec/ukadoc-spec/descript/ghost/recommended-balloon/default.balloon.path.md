# default.balloon.path,パス

- **規格**: [default.balloon.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/default.balloon.path.md)
- **検索語**: default.balloon.path
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` においてゴーストの `descript.txt` 内の `default.balloon.path` キーをパースし、`GhostInfo.default_balloon_path` へ格納・利用する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:119` `.and_then(|m| m.get("default.balloon.path").cloned());`
- `src-tauri/src/common/models.rs:50` `/// [default.balloon.path,パス]:`
- `src-tauri/src/ghost/scan/directory/manifest.rs:109` `.and_then(|m| m.get("default.balloon.path").cloned());`
