# ディレクトリ構成仕様の項目別突合

- **規格**: [ukadoc-spec/manual/directory.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/directory.md)
- **判定基準**: このリポジトリで確認できるゴースト・シェル・バルーン・インストーラのフォルダ階層ハンドリング

| 項目                                                    | 対応状況 |
| ------------------------------------------------------- | -------- |
| [ゴーストフォルダ (`ghost/`)](ghost-folder.md)          | ✅ 実装済  |
| [シェルフォルダ (`shell/`)](shell-folder.md)            | ✅ 実装済  |
| [バルーンフォルダ (`balloon/`)](balloon-folder.md)      | ✅ 実装済  |
| [インストールファイル (`install.txt`)](install-files.md) | ✅ 実装済  |
| [更新・管理ファイル (`updates2.plist`)](update-files.md)  | ✅ 実装済  |

## 対応範囲の共通事項

- 伺か標準仕様のディレクトリ構造に準拠し、`userData/ghost` と `local/ghost` の優先順位付きスキャン、大文字小文字を吸収する VFS 解決 (`resolve_vfs_path`) を実装。
