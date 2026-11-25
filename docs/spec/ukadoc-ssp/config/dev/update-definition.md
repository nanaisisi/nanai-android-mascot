# 更新定義ファイル

- **規格**: [dev.md](../../../../ukadoc-ssp/config/dev.md) ([公式版](https://ukatech.shillest.net/ukadoc-ssp/config/dev/))
- **検索語**: developer_options.txt, updates2.dau
- **対応状況**: ⚠️ 一部対応

## 突合結果

開発用オプション（`developer_options.txt`）および更新定義ファイル生成機能（`src-tauri/src/commands/update/generation.rs`）を実装済み。


## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs:26` `/// developer_options.txt の noupdate ディレクティブ除外判定`
- `src-tauri/src/commands/install/archive/packaging.rs:10` `// [自動的に除外される対象]: UKADOC / SSP developer_options.txt 仕様自動除外定義`
- `ui/ts/core/actions/update-protocol.ts:88` `* developer_options.txt の noupdate ディレクティブ除外判定 (純TSフォールバック)`
- `crates/nanai-core/src/update_protocol/helpers.rs:82` `/// developer_options.txt テキストをパース (UKADOC仕様)`
- `src-tauri/src/commands/install/archive/packaging.rs:45` `let dev_opts_path = source_dir.join("developer_options.txt");`
- `ui/ts/core/actions/update-protocol.ts:103` `* developer_options.txt の noupdate ディレクティブ除外判定`
