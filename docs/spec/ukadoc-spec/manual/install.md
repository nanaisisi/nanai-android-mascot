# インストール (manual/install.md)

- **規格**: [manual/install.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/install.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

- `install.txt` / `descript.txt` の検出とゴースト名・type の取得: `src-tauri/src/commands/install.rs:14-86`
- type の検証は実施するが、取り込み可能なのは Ghost と Balloon のみ (Shell / Plugin / Supplement は拒否): `install.rs:103-111`
- `accept` による対応ゴースト判定は検索で見つからず (未実装の可能性)
