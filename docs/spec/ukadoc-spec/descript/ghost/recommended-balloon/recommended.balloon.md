# recommended.balloon,バルーン名

- **規格**: [recommended.balloon.md](https://ukatech.shillest.net/ukadoc-spec/descript/ghost/recommended-balloon/) (ukadoc-spec/descript/ghost/recommended-balloon/recommended.balloon.md)
- **検索語**: recommended.balloon
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` 等においてゴーストの `descript.txt` 内の `recommended.balloon` キーをパースし、`GhostInfo.recommended_balloon` フィールドへ設定。フロントエンド連動切り替えを含む全処理が完全に行われている。

## 実装箇所

- `src-tauri/src/commands/install/archive/postprocess.rs:127` `m.get("recommended.balloon")`
- `src-tauri/src/commands/install/archive/postprocess.rs:133` `.and_then(|m| m.get("recommended.balloon.path").cloned());`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:68` `m.get("recommended.balloon")`
- `src-tauri/src/ghost/scan/directory/manifest/parser.rs:75` `.and_then(|m| m.get("recommended.balloon.path").cloned());`
- `src-tauri/src/shiori/property/evaluator/mod.rs:64` `"recommended.balloon" | "recommended_balloon" => {`
