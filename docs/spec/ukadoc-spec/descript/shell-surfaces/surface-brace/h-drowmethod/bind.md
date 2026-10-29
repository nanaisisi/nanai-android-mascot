# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/bind.md)
- **検索語**: bind
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/lib.rs:48` `"../ui/bindings.ts",`
- `src-tauri/src/lib.rs:50` `.expect("Failed to export TypeScript bindings");`
- `src-tauri/src/lib.rs:51` `if let Ok(content) = std::fs::read_to_string("../ui/bindings.ts") {`
- `src-tauri/src/lib.rs:55` `let _ = std::fs::write("../ui/bindings.ts", patched);`
- `src-tauri/src/commands/shell/manifest.rs:131` `binds: Option<Vec<u32>>,`
