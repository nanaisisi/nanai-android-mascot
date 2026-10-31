# ゴースト仕様の項目別突合

- **規格**: [ukadoc-spec/manual/ghost.md](https://github.com/ukatech/ukadoc-spec/blob/main/manual/ghost.md)
- **判定基準**: このリポジトリで確認できるゴーストの構造、SHIORI 連携、除外設定、FMO 状態管理

| 項目                                                  | 対応状況 |
| ----------------------------------------------------- | -------- |
| [ゴースト構造 (`ghost/master/`)](ghost-structure.md)  | ✅ 実装済  |
| [SHIORI 連携 (`shiori.dll`)](shiori-loading.md)       | ✅ 実装済  |
| [除外ファイル・設定 (`.dev_ignore`)](ignore-rules.md) | ✅ 実装済  |
| [FMO 状態管理](fmo-status.md)                         | ✅ 実装済  |

## 対応範囲の共通事項

- ゴーストは `assets/ghost/<name>/` または `userData/ghost/<name>/` から検出・走査する。
- SHIORI 動的ローダーを介して対話処理を実行し、FMO（FMO/1.0）へ状態を通知。
