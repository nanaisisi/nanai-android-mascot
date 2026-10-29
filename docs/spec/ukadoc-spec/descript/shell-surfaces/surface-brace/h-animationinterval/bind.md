# bind

- **規格**: [bind.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/bind.md)
- **検索語**: bind
- **対応状況**: ✅ 実装済 (装着パーツの bind アニメーションを常時レイヤー合成)

## 突合結果

surface-parser.js / Rust マニフェストが解析し、dressupState（着せ替え状態）true の
bindgroup に対応する interval,bind アニメーションの pattern レイヤーを
element 合成後に常時合成する。OFF で解除。

## 実装箇所

- `src-tauri/src/lib.rs:48` `"../ui/bindings.ts",`
- `src-tauri/src/lib.rs:50` `.expect("Failed to export TypeScript bindings");`
- `src-tauri/src/lib.rs:51` `if let Ok(content) = std::fs::read_to_string("../ui/bindings.ts") {`
- `src-tauri/src/lib.rs:55` `let _ = std::fs::write("../ui/bindings.ts", patched);`
- `src-tauri/src/commands/shell/manifest.rs:131` `binds: Option<Vec<u32>>,`
