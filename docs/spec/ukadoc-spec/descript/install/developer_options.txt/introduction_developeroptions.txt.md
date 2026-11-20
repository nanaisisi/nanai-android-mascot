# developer_options.txt

- **規格**: [introduction_developeroptions.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt/) (ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt.md)
- **検索語**: developer_options.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory/filter.rs`, `crates/nanai-core/src/update_protocol/helpers.rs` (`is_no_update_path`), および `src-tauri/src/commands/update/generation.rs` において `developer_options.txt` のパースおよび開発者向け除外・制御フラグの適用が完全実装済み。

## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs:26` `/// developer_options.txt の noupdate ディレクティブ除外判定`
- `src-tauri/src/commands/install/archive/packaging.rs:10` `// [自動的に除外される対象]: UKADOC / SSP developer_options.txt 仕様自動除外定義`
- `ui/ts/core/actions/update-protocol.ts:88` `* developer_options.txt の noupdate ディレクティブ除外判定 (純TSフォールバック)`
- `crates/nanai-core/src/update_protocol/helpers.rs:82` `/// developer_options.txt テキストをパース (UKADOC仕様)`
- `src-tauri/src/commands/install/archive/packaging.rs:45` `let dev_opts_path = source_dir.join("developer_options.txt");`
- `ui/ts/core/actions/update-protocol.ts:103` `* developer_options.txt の noupdate ディレクティブ除外判定`
