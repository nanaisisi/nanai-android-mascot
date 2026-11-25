# developer_options.txtについて

- **規格**: [nar.md](../../../../ukadoc-spec/dev/nar.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/dev/nar/))
- **検索語**: developer_options.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

developer_options.txt による除外ファイル指定に対応。

## 実装箇所

- `crates/nanai-core/src/update_protocol/helpers.rs:26` `/// developer_options.txt の noupdate ディレクティブ除外判定`
- `src-tauri/src/commands/install/archive/packaging.rs:10` `// [自動的に除外される対象]: UKADOC / SSP developer_options.txt 仕様自動除外定義`
- `ui/ts/core/actions/update-protocol.ts:88` `* developer_options.txt の noupdate ディレクティブ除外判定 (純TSフォールバック)`
- `crates/nanai-core/src/update_protocol/helpers.rs:82` `/// developer_options.txt テキストをパース (UKADOC仕様)`
- `src-tauri/src/commands/install/archive/packaging.rs:45` `let dev_opts_path = source_dir.join("developer_options.txt");`
- `ui/ts/core/actions/update-protocol.ts:103` `* developer_options.txt の noupdate ディレクティブ除外判定`
