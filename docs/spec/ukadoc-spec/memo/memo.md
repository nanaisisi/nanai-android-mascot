# memo/memo.md 規格対応文書

- **参照規格**: [ukadoc-spec/memo/memo.md](../../../../ukadoc-spec/memo/memo.md) (開発メモ)
- **対応状況**: ✅ 対応済

## 突合結果
- 各種ベースウェア仕様の比較や互換性上の注意点（ゼロオリジン/1オリジン、暗号化ファイル、複数起動対応等）をコア設計および設定に反映。

## 実装箇所
- `src-tauri/src/commands/config.rs` 設定管理・互換性反映
