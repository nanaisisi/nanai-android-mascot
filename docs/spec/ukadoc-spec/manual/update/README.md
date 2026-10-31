# ネットワーク更新仕様の項目別突合

- **規格**: [manual/update.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/update.md)
- **判定基準**: このリポジトリで確認できる updates2.dau / updates.txt 解析、ネットワーク更新実行処理

| 項目                                                        | 対応状況 |
| ----------------------------------------------------------- | -------- |
| [updates2.dau / updates.txt 解析](updates2-dau.md)          | ✅ 実装済  |
| [ネットワーク更新実行 (`check_ghost_update`)](network-update.md) | ✅ 実装済  |

## 対応範囲の共通事項

- ゴーストの `homeurl` 等から更新定義を取得・パースし、MD5 ハッシュ突合と差分ダウンロードによる安全なアップデートを実行。
