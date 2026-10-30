# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ✅ 対応済

## 実装方針・確認事項

- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決に対応 (`src-tauri/src/commands/install/`).
