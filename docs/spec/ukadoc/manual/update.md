# ネットワーク更新 (manual/update.md)

- **規格**: [manual/update.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/update.md)
- **対応状況**: ✅ 実装済

## 突合結果

- `updates2.dau` を取得し、無ければ `updates.txt` を試行: `src-tauri/src/commands/update/network.rs:59-61`
- DAU パース: `src-tauri/src/commands/update/dau.rs:31`
- MD5 によるローカル差分判定とダウンロード後検証: `network.rs:97-99`, `network.rs:205-228`
