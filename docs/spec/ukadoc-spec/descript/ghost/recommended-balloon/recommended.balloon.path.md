# recommended.balloon.path,パス

- **規格**: [recommended.balloon.path.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.path.md)
- **検索語**: recommended.balloon.path
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` 等においてゴーストの `descript.txt` 内の `recommended.balloon.path` キーをパースし、`GhostInfo.recommended_balloon_path` へ格納・利用する実装が完全に行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:133` `.and_then(|m| m.get("recommended.balloon.path").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:75` `.and_then(|m| m.get("recommended.balloon.path").cloned());`
- `src-tauri/src/shiori/property/evaluator/mod.rs:67` `"recommended.balloon.path" => {`
