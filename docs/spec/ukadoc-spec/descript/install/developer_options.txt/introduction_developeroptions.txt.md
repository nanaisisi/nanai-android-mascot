# developer_options.txt

- **規格**: [introduction_developeroptions.txt.md](https://ukatech.shillest.net/ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt/) (ukadoc-spec/descript/install/developer_options.txt/introduction_developeroptions.txt.md)
- **検索語**: developer_options.txt
- **対応状況**: ⚠️ 一部対応

## 突合結果

`src-tauri/src/ghost/scan/directory.rs` において `developer_options.txt` を読み込み、開発者向け除外・制御フラグ行を抽出・適用する実装が行われている。

## 実装箇所

- `src-tauri/src/commands/update/generation.rs:18` `let dev_opt_path = dir.join("developer_options.txt");`
- `src-tauri/src/ghost/scan/directory/filter.rs:12` `/// Parse developer_options.txt if present`
- `src-tauri/src/ghost/scan/directory/filter.rs:14` `let dev_options_path = path.join("developer_options.txt");`
- `crates/nanai-core/src/update_protocol.rs:60` `/// developer_options.txt の noupdate ディレクティブ除外判定`
- `crates/ui/src/update/engine.rs:36` `/// developer_options.txt の内容をパースして noupdate ファイル一覧を取得`
