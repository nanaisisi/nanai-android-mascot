# update-file : パスの扱い

- **規格**: [path-handling.md](https://ukatech.shillest.net/ukadoc-spec/spec/update-file/path-handling/) (ukadoc-spec/spec/update-file/path-handling.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

`dau.rs` にて Windows/UNIX パス区切り文字 (`\` → `/`) の正規化および相対パス抽出処理を実装。完全なセキュリティ検証や規格の全制約チェックは一部対応。
