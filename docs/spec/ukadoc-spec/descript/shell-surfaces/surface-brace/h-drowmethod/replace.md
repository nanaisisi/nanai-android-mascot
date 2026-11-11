# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace.md)
- **検索語**: replace
- **対応状況**: ⚠️ 一部対応


## 実装箇所

- `src-tauri/src/lib.rs:58` `.replace("error: e  as any", "error: e as E")`
- `src-tauri/src/lib.rs:59` `.replace("error: e as any", "error: e as E");`
- `src-tauri/src/commands/install/utils.rs:128` `.map_err(|e| format!("Failed to replace balloon entry: {e}"))?;`
- `src-tauri/src/commands/install/utils.rs:131` `.map_err(|e| format!("Failed to replace balloon entry: {e}"))?;`
- `src-tauri/src/commands/install/archive/extraction.rs:21` `let entry_name = decoded_name.replace('\\', "/");`
