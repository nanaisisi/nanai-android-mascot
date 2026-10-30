# memo/memo.md 規格対応文書

- **参照規格**: [ukadoc-spec/memo/memo.md](../../../../ukadoc-spec/memo/memo.md) (開発メモ)
- **対応状況**: ✅ 対応済

## 突合結果
- 各種ベースウェア仕様の比較や互換性上の注意点（ゼロオリジン/1オリジン、暗号化ファイル、複数起動対応等）をコア設計および設定に反映。

## 実装箇所

- `src-tauri/src/commands/calendar.rs:15` `pub memo: String,`
- `src-tauri/src/commands/install/mod.rs:71` `"📦 Installing ghost archive from memory bytes: {} ({} bytes)",`
- `src-tauri/src/shiori/fmo.rs:26` `/// Generate FMO 64KB shared memory byte buffer conforming to UKADOC fmo spec`
- `crates/ui/src/script/command.rs:55` `memo: String,`
- `crates/ui/src/script/parser/brackets/handlers.rs:87` `let memo = parts.get(5).unwrap_or(&"").to_string();`
