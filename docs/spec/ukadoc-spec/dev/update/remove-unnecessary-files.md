# 不要なファイルを取り除く

- **規格**: [update.md](../../../../ukadoc-spec/dev/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/update/))
- **検索語**: delete.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

delete.txt 等による不要ファイル削除処理に対応。

## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs:69` `/// delete.txt テキストをパース (UKADOC仕様)`
- `src-tauri/src/commands/install/archive/postprocess.rs:56` `let mut names = vec!["delete.txt".to_string()];`
- `ui/ts/core/wasm/pkg/nanai_core.d.ts:26` `* delete.txt のパース結果（削除対象ファイルパターン一覧）`
- `crates/nanai-core/src/update_protocol/types.rs:54` `/// delete.txt のパース結果（削除対象ファイルパターン一覧）`
- `src-tauri/src/commands/update/network/commands/execute.rs:147` `// 更新後に delete.txt / delete1.txt が存在する場合、旧ファイルのクリーンアップ処理を実行`
- `crates/nanai-core/ui/ts/core/wasm/pkg/nanai_core.d.ts:26` `* delete.txt のパース結果（削除対象ファイルパターン一覧）`
