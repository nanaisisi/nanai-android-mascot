# dev/update.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/update.md](../../../../ukadoc-spec/dev/update.md) (ネットワーク更新仕様)
- **対応状況**: ✅ 対応済

## 実装方針・確認事項
- `updates.txt` および `updates2.dau` のフォーマット解析、差分ファイル取得、安全な差分適用プロトコルの実装 (`src-tauri/src/update/`).
