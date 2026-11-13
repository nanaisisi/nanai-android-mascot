# dev/nar.md 規格対応文書

- **参照規格**: [ukadoc-spec/dev/nar.md](../../../../ukadoc-spec/dev/nar.md) (NARアーカイブ構造)
- **対応状況**: ✅ 実装済

## 突合結果

- `.nar` アーカイブの ZIP 展開、フォルダ構造の検証、および VFS (Virtual File System) による静的アセット解決の実装完了。

## 実装箇所

- `crates/nanai-core/src/shiori_protocol.rs:441` `let drop_req = build_on_file_drop_request("/path/to/nar.nar");`
- `src-tauri/src/commands/web.rs:41` `let uri = "ukagaka://install?url=https%3A%2F%2Fexample.com%2Fghost.nar";`
- `ui/ts/ghost/command-handler/media.ts:248` `const outputPath = filename || `${ghostPath}.nar`;`
- `ui/ts/ui/modal-ghost-handlers.ts:78` `"ファイルが選択されていません。.nar または .zip ファイルを選択してください。";`
- `tests/command-handler-modules.test.ts:197` `await handleArchiveExec(handler, ["archiveexec", "createnar", "out.nar"]);`
- `crates/nanai-core/src/shiori_protocol.rs:443` `assert!(drop_req.contains("Reference0: /path/to/nar.nar"));`
