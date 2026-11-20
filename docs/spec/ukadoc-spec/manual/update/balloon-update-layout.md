# バルーン・プラグイン・ヘッドラインのネットワーク更新ファイル配置

- **規格**: [update.md](../../../../ukadoc-spec/manual/update.md) ([公式版](https://ukatech.shillest.net/ukadoc-spec/manual/update/))
- **検索語**: update_balloon
- **対応状況**: ⚠️ 一部対応

## 突合結果

バルーン単位のネットワーク更新コマンド `update_balloon`、プラグイン単位の `update_plugin`、ヘッドライン単位の `update_headline`（いずれも `src-tauri/src/commands/update/network/commands/execute.rs`）を実装し、`src-tauri/src/invoke.rs` に登録している。各対象ディレクトリを解決し、`descript.txt` の `homeurl` から `check_dir_update` / `execute_dir_update` を通じて `updates2.dau` / `updates.txt` / `developer_options.txt`（`noupdate`）/ MD5 検証 / `delete.txt`・`delete1.txt` の更新パイプラインを実行する。

**実装状況**: ✅ 実装済

## 実装箇所

- `src-tauri/src/commands/update/network/commands/execute.rs:212` `pub async fn update_balloon(`
- `src-tauri/src/invoke.rs:92` `commands::update::network::commands::update_balloon,`
