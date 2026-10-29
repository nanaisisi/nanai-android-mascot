# replace

- **規格**: [replace.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-drowmethod/replace.md)
- **検索語**: replace
- **対応状況**: ⚠️ 一部対応

## 突合結果

surface-parser.js が解析 (パターン種別など) するが、描画への反映は個別未確認。

## 実装箇所

- `src-tauri/src/lib.rs:53` `.replace("error: e  as any", "error: e as E")`
- `src-tauri/src/lib.rs:54` `.replace("error: e as any", "error: e as E");`
- `src-tauri/src/commands/window/loading_banner_window.rs:54` `let encoded_name = g_name.replace(' ', "%20").replace('&', "%26");`
- `src-tauri/src/commands/window/loading_banner_window.rs:55` `let encoded_ver = g_ver.replace(' ', "%20").replace('&', "%26");`
- `src-tauri/src/commands/update/network.rs:35` `let normalized = path.replace('\\', "/");`
