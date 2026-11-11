# sstp : Direct SSTP

- **規格**: [direct.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/direct/) (ukadoc-spec/spec/sstp/direct.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

SSTP 受信機能なし。

## 実装箇所

- `src-tauri/src/ghost/scan/shell/bitmap.rs:24` `let direct = base.join(&normalized);`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:25` `let resolved = if direct.is_file() {`
- `src-tauri/src/ghost/scan/shell/bitmap.rs:26` `Some(direct)`
- `crates/nanai-vfs/src/resolver/path_resolution.rs:23` `if let Some(direct) = self.resolve(relative_path)`
- `crates/nanai-vfs/src/resolver/path_resolution.rs:24` `&& direct.is_file()`
