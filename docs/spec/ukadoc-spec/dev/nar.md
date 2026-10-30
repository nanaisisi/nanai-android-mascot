# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ✅ 対応済

## 突合結果
- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決の実装完了。

## 実装箇所
- `src-tauri/src/commands/install/` NARインストール・展開処理
- `crates/ui/src/vfs/` 仮想ファイルシステム解決
