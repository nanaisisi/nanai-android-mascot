# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/replace.md)
- **検索語**: replace
- **対応状況**: ✅ 実装済


## 実装箇所

- `src-tauri/src/lib.rs:55` `.replace("error: e  as any", "error: e as E")`
- `src-tauri/src/lib.rs:56` `.replace("error: e as any", "error: e as E");`
- `src-tauri/src/commands/window/loading_banner_window.rs:54` `let encoded_name = g_name.replace(' ', "%20").replace('&', "%26");`
- `src-tauri/src/commands/window/loading_banner_window.rs:55` `let encoded_ver = g_ver.replace(' ', "%20").replace('&', "%26");`
- `src-tauri/src/commands/update/generation.rs:25` `let file_pattern = trimmed[9..].trim().replace('\\', "/");`
