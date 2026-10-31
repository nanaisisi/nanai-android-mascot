# update-file : パスの扱い

- **規格**: [path-handling.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/path-handling/) (ukadoc-spec/spec/update-file/path-handling.md)
- **対応状況**: ✅ 実装済

## 突合結果

`dau.rs` および `network.rs` にてパス区切り文字の正規化（`\` → `/`）と安全な相対パス解決処理を実装。
