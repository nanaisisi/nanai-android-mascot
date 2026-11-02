# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind.md)
- **検索語**: bind
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/src/lib.rs:50` `"../ui/bindings.ts",`
- `src-tauri/src/lib.rs:52` `.expect("Failed to export TypeScript bindings");`
- `src-tauri/src/lib.rs:53` `if let Ok(content) = std::fs::read_to_string("../ui/bindings.ts") {`
- `src-tauri/src/lib.rs:57` `let _ = std::fs::write("../ui/bindings.ts", patched);`
- `src-tauri/src/commands/shell/manifest.rs:135` `binds: Option<Vec<u32>>,`
